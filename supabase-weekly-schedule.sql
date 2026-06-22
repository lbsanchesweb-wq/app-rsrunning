-- RS Running - agenda semanal flexivel do atleta
-- Aplicar primeiro em homologacao.

alter table public.workouts add column if not exists scheduled_date date;
alter table public.workouts add column if not exists scheduled_order integer default 1;
alter table public.workouts add column if not exists schedule_updated_at timestamptz;

create table if not exists public.week_day_plans (
  id uuid default uuid_generate_v4() primary key,
  week_id uuid references public.weeks(id) on delete cascade,
  student_id uuid references public.profiles(id) on delete cascade,
  plan_date date not null,
  is_rest boolean default false,
  notes text,
  unique(week_id, plan_date)
);

create table if not exists public.athlete_activities (
  id uuid default uuid_generate_v4() primary key,
  week_id uuid references public.weeks(id) on delete cascade,
  student_id uuid references public.profiles(id) on delete cascade,
  activity_date date not null,
  activity_type text not null check (activity_type in ('corrida','caminhada','bicicleta','musculacao','natacao','mobilidade','outro')),
  title text not null,
  duration_minutes integer,
  distance_km numeric,
  effort text check (effort in ('leve','moderado','forte','maximo')),
  notes text,
  result_images text[] default '{}',
  display_order integer default 1,
  created_at timestamptz default now()
);

create or replace function public.sync_athlete_activity_volume()
returns trigger language plpgsql security definer set search_path = public as $$
declare delta numeric;
begin
  if tg_op = 'INSERT' then delta := coalesce(new.distance_km, 0);
  elsif tg_op = 'DELETE' then delta := -coalesce(old.distance_km, 0);
  else delta := coalesce(new.distance_km, 0) - coalesce(old.distance_km, 0);
  end if;
  update public.students set total_km = greatest(0, coalesce(total_km, 0) + delta)
  where id = coalesce(new.student_id, old.student_id);
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;
drop trigger if exists sync_athlete_activity_volume_trigger on public.athlete_activities;
create trigger sync_athlete_activity_volume_trigger
after insert or update of distance_km or delete on public.athlete_activities
for each row execute function public.sync_athlete_activity_volume();

create or replace function public.protect_workout_prescription()
returns trigger language plpgsql set search_path = public as $$
declare selected_week public.weeks;
begin
  if auth.uid() = old.student_id then
    if new.week_id is distinct from old.week_id or new.student_id is distinct from old.student_id
      or new.template_id is distinct from old.template_id or new.type is distinct from old.type
      or new.title is distinct from old.title or new.description is distinct from old.description
      or new.planned_km is distinct from old.planned_km or new.planned_duration is distinct from old.planned_duration
      or new.planned_pace is distinct from old.planned_pace or new.suggested_day is distinct from old.suggested_day
      or new.order_num is distinct from old.order_num then
      raise exception 'A prescricao original so pode ser alterada pelo treinador.';
    end if;
    select * into selected_week from public.weeks where id = old.week_id;
    if new.scheduled_date is not null and (new.scheduled_date < selected_week.date_start or new.scheduled_date > selected_week.date_end) then
      raise exception 'A data escolhida precisa pertencer a semana do treino.';
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists protect_workout_prescription_trigger on public.workouts;
create trigger protect_workout_prescription_trigger before update on public.workouts
for each row execute function public.protect_workout_prescription();

create or replace function public.move_schedule_entry(
  p_entry_kind text,
  p_entry_id uuid,
  p_target_date date,
  p_target_position integer default 1
)
returns table(entry_kind text, entry_id uuid, scheduled_date date, scheduled_order integer)
language plpgsql security definer set search_path = public as $$
declare
  selected_student uuid;
  selected_week uuid;
  source_date date;
  source_order integer;
  week_start date;
  week_end date;
  target_count integer;
  target_position integer;
begin
  if auth.uid() is null then raise exception 'Sessao expirada.'; end if;

  if p_entry_kind = 'workout' then
    select student_id, week_id, workouts.scheduled_date, coalesce(workouts.scheduled_order, workouts.order_num)
    into selected_student, selected_week, source_date, source_order
    from public.workouts where id = p_entry_id;
  elsif p_entry_kind = 'activity' then
    select student_id, week_id, activity_date, display_order
    into selected_student, selected_week, source_date, source_order
    from public.athlete_activities where id = p_entry_id;
  else
    raise exception 'Tipo de item invalido.';
  end if;

  if selected_student is null or selected_student <> auth.uid() then
    raise exception 'Item nao encontrado ou sem permissao.';
  end if;

  select date_start, date_end into week_start, week_end
  from public.weeks where id = selected_week and student_id = auth.uid() and status = 'published';
  if week_start is null or p_target_date < week_start or p_target_date > week_end then
    raise exception 'O dia escolhido nao pertence a semana publicada.';
  end if;

  if source_date is not null then
    update public.workouts set scheduled_order = greatest(1, coalesce(scheduled_order, order_num) - 1)
    where week_id = selected_week and scheduled_date = source_date and id <> p_entry_id
      and coalesce(scheduled_order, order_num) > coalesce(source_order, 0);
    update public.athlete_activities set display_order = greatest(1, display_order - 1)
    where week_id = selected_week and activity_date = source_date and id <> p_entry_id
      and display_order > coalesce(source_order, 0);
  end if;

  select count(*) into target_count from (
    select id from public.workouts where week_id = selected_week and scheduled_date = p_target_date and not (p_entry_kind = 'workout' and id = p_entry_id)
    union all
    select id from public.athlete_activities where week_id = selected_week and activity_date = p_target_date and not (p_entry_kind = 'activity' and id = p_entry_id)
  ) entries;
  target_position := greatest(1, least(coalesce(p_target_position, 1), target_count + 1));

  update public.workouts set scheduled_order = coalesce(scheduled_order, order_num) + 1
  where week_id = selected_week and scheduled_date = p_target_date and id <> p_entry_id
    and coalesce(scheduled_order, order_num) >= target_position;
  update public.athlete_activities set display_order = display_order + 1
  where week_id = selected_week and activity_date = p_target_date and id <> p_entry_id
    and display_order >= target_position;

  if p_entry_kind = 'workout' then
    update public.workouts set scheduled_date = p_target_date, scheduled_order = target_position, schedule_updated_at = now()
    where id = p_entry_id;
  else
    update public.athlete_activities set activity_date = p_target_date, display_order = target_position
    where id = p_entry_id;
  end if;

  delete from public.week_day_plans where week_id = selected_week and plan_date = p_target_date;
  return query select p_entry_kind, p_entry_id, p_target_date, target_position;
end;
$$;
revoke all on function public.move_schedule_entry(text, uuid, date, integer) from public;
grant execute on function public.move_schedule_entry(text, uuid, date, integer) to authenticated;
alter table public.week_day_plans enable row level security;
alter table public.athlete_activities enable row level security;

drop policy if exists "Aluno organiza próprios dias" on public.week_day_plans;
drop policy if exists "Coach vê organização dos alunos" on public.week_day_plans;
drop policy if exists "Aluno gerencia atividades próprias" on public.athlete_activities;
drop policy if exists "Coach vê atividades dos alunos" on public.athlete_activities;

create policy "Aluno organiza próprios dias" on public.week_day_plans for all to authenticated
using (student_id = auth.uid()) with check (
  student_id = auth.uid() and exists (select 1 from public.weeks w where w.id = week_id and w.student_id = auth.uid() and plan_date between w.date_start and w.date_end)
);
create policy "Coach vê organização dos alunos" on public.week_day_plans for select to authenticated using (
  exists (select 1 from public.weeks w where w.id = week_id and w.coach_id = auth.uid())
);
create policy "Aluno gerencia atividades próprias" on public.athlete_activities for all to authenticated
using (student_id = auth.uid()) with check (
  student_id = auth.uid() and exists (select 1 from public.weeks w where w.id = week_id and w.student_id = auth.uid() and activity_date between w.date_start and w.date_end)
);
create policy "Coach vê atividades dos alunos" on public.athlete_activities for select to authenticated using (
  exists (select 1 from public.weeks w where w.id = week_id and w.coach_id = auth.uid())
);

insert into storage.buckets (id, name, public)
values ('activity-results', 'activity-results', false)
on conflict (id) do update set public = false;

drop policy if exists "Aluno le imagens de atividades" on storage.objects;
drop policy if exists "Aluno envia imagens de atividades" on storage.objects;
drop policy if exists "Aluno atualiza imagens de atividades" on storage.objects;
drop policy if exists "Aluno remove imagens de atividades" on storage.objects;
drop policy if exists "Coach le imagens de atividades" on storage.objects;

create policy "Aluno le imagens de atividades" on storage.objects for select to authenticated using (
  bucket_id = 'activity-results' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "Aluno envia imagens de atividades" on storage.objects for insert to authenticated with check (
  bucket_id = 'activity-results' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "Aluno atualiza imagens de atividades" on storage.objects for update to authenticated using (
  bucket_id = 'activity-results' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "Aluno remove imagens de atividades" on storage.objects for delete to authenticated using (
  bucket_id = 'activity-results' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "Coach le imagens de atividades" on storage.objects for select to authenticated using (
  bucket_id = 'activity-results' and exists (
    select 1 from public.athlete_activities activity
    join public.weeks week on week.id = activity.week_id
    where activity.id::text = (storage.foldername(name))[2] and week.coach_id = auth.uid()
  )
);

-- Mapeia dias sugeridos existentes para datas reais da semana.
update public.workouts workout
set scheduled_date = week.date_start + case
  when lower(coalesce(workout.suggested_day, '')) like 'seg%' then 0
  when lower(coalesce(workout.suggested_day, '')) like 'ter%' then 1
  when lower(coalesce(workout.suggested_day, '')) like 'qua%' then 2
  when lower(coalesce(workout.suggested_day, '')) like 'qui%' then 3
  when lower(coalesce(workout.suggested_day, '')) like 'sex%' then 4
  when lower(coalesce(workout.suggested_day, '')) like 'sáb%' or lower(coalesce(workout.suggested_day, '')) like 'sab%' then 5
  when lower(coalesce(workout.suggested_day, '')) like 'dom%' then 6
  else null end,
  scheduled_order = workout.order_num
from public.weeks week
where week.id = workout.week_id and workout.scheduled_date is null and workout.suggested_day is not null;
