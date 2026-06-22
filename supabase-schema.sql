-- RS Running — Schema completo
-- Cole este SQL no Supabase > SQL Editor > New Query

-- Extensões
create extension if not exists "uuid-ossp";

-- Profiles (professor e alunos)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  role text not null check (role in ('coach', 'student')),
  name text not null,
  email text not null,
  avatar_url text,
  whatsapp text,
  bio text,
  birth_date date,
  created_at timestamptz default now()
);

-- Alunos (dados extras)
create table public.students (
  id uuid references public.profiles(id) on delete cascade primary key,
  goal text,
  next_race text,
  total_km numeric default 0,
  total_workouts integer default 0,
  streak_days integer default 0,
  xp integer default 0,
  monthly_fee numeric default 0,
  pix_key text,
  created_at timestamptz default now()
);

-- Biblioteca de treinos do professor
create table public.workout_templates (
  id uuid default uuid_generate_v4() primary key,
  coach_id uuid references public.profiles(id) on delete cascade,
  type text not null check (type in ('rodagem_leve','rodagem_moderada','fartlek','tiros','longao','rampa','regenerativo','prova','ritmado','desafio')),
  title text not null,
  description text,
  default_km numeric,
  default_duration integer,
  default_pace text,
  notes text,
  created_at timestamptz default now()
);

-- Semanas de treino
create table public.weeks (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.profiles(id) on delete cascade,
  coach_id uuid references public.profiles(id),
  label text not null,
  date_start date not null,
  date_end date not null,
  status text default 'draft' check (status in ('draft','published')),
  notes text,
  created_at timestamptz default now()
);

-- Treinos individuais da semana
create table public.workouts (
  id uuid default uuid_generate_v4() primary key,
  week_id uuid references public.weeks(id) on delete cascade,
  student_id uuid references public.profiles(id) on delete cascade,
  template_id uuid references public.workout_templates(id),
  type text not null,
  title text not null,
  description text,
  planned_km numeric,
  planned_duration integer,
  planned_pace text,
  suggested_day text,
  order_num integer default 1,
  scheduled_date date,
  scheduled_order integer default 1,
  schedule_updated_at timestamptz,
  status text default 'pending' check (status in ('pending','done','skipped')),
  done_at timestamptz,
  actual_km numeric,
  actual_duration integer,
  actual_pace text,
  feeling text check (feeling in ('facil','ok','dificil','muito_dificil')),
  notes text,
  skip_reason text,
  result_images text[] default '{}',
  created_at timestamptz default now()
);

create table public.week_day_plans (
  id uuid default uuid_generate_v4() primary key,
  week_id uuid references public.weeks(id) on delete cascade,
  student_id uuid references public.profiles(id) on delete cascade,
  plan_date date not null,
  is_rest boolean default false,
  notes text,
  unique(week_id, plan_date)
);

create table public.athlete_activities (
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
-- Mensalidades
create table public.payments (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.profiles(id) on delete cascade,
  coach_id uuid references public.profiles(id),
  month text not null,
  amount numeric not null,
  due_date date,
  status text default 'pending' check (status in ('pending','paid','overdue')),
  paid_at timestamptz,
  pix_key text,
  notes text,
  created_at timestamptz default now()
);

-- Mensagens
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  from_id uuid references public.profiles(id) on delete cascade,
  to_id uuid references public.profiles(id) on delete cascade,
  content text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- Insígnias conquistadas
create table public.badges (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.profiles(id) on delete cascade,
  badge_key text not null,
  earned_at timestamptz default now(),
  unique(student_id, badge_key)
);

-- RLS (Row Level Security)
alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.workout_templates enable row level security;
alter table public.weeks enable row level security;
alter table public.workouts enable row level security;
alter table public.payments enable row level security;
alter table public.messages enable row level security;
alter table public.badges enable row level security;
alter table public.week_day_plans enable row level security;
alter table public.athlete_activities enable row level security;

-- Policies: profiles
create policy "Usuário vê próprio perfil" on public.profiles for select using (auth.uid() = id);
create policy "Coach vê todos os perfis" on public.profiles for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'coach')
);
create policy "Usuário atualiza próprio perfil" on public.profiles for update using (auth.uid() = id);
create policy "Insert próprio perfil" on public.profiles for insert with check (auth.uid() = id);

-- Policies: students
create policy "Aluno vê próprios dados" on public.students for select using (auth.uid() = id);
create policy "Coach vê todos alunos" on public.students for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'coach')
);
create policy "Aluno atualiza próprios dados" on public.students for update using (auth.uid() = id);
create policy "Coach atualiza dados de alunos" on public.students for update using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'coach')
);
create policy "Insert student" on public.students for insert with check (auth.uid() = id);

-- Policies: workout_templates
create policy "Coach gerencia templates" on public.workout_templates for all using (coach_id = auth.uid());
create policy "Aluno vê templates" on public.workout_templates for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'student')
);

-- Policies: weeks
create policy "Coach gerencia semanas" on public.weeks for all using (coach_id = auth.uid());
create policy "Aluno vê próprias semanas" on public.weeks for select using (student_id = auth.uid());

-- Policies: workouts
create policy "Coach gerencia treinos" on public.workouts for all using (
  exists (select 1 from public.weeks w where w.id = week_id and w.coach_id = auth.uid())
);
create policy "Aluno vê e atualiza próprios treinos" on public.workouts for select using (student_id = auth.uid());
create policy "Aluno marca treino concluído" on public.workouts for update using (student_id = auth.uid());
create policy "Aluno organiza próprios dias" on public.week_day_plans for all using (student_id = auth.uid()) with check (
  student_id = auth.uid() and exists (select 1 from public.weeks w where w.id = week_id and w.student_id = auth.uid() and plan_date between w.date_start and w.date_end)
);
create policy "Coach vê organização dos alunos" on public.week_day_plans for select using (
  exists (select 1 from public.weeks w where w.id = week_id and w.coach_id = auth.uid())
);
create policy "Aluno gerencia atividades próprias" on public.athlete_activities for all using (student_id = auth.uid()) with check (
  student_id = auth.uid() and exists (select 1 from public.weeks w where w.id = week_id and w.student_id = auth.uid() and activity_date between w.date_start and w.date_end)
);
create policy "Coach vê atividades dos alunos" on public.athlete_activities for select using (
  exists (select 1 from public.weeks w where w.id = week_id and w.coach_id = auth.uid())
);

-- Policies: payments
create policy "Coach gerencia pagamentos" on public.payments for all using (coach_id = auth.uid());
create policy "Aluno vê próprios pagamentos" on public.payments for select using (student_id = auth.uid());

-- Policies: messages
create policy "Ver mensagens próprias" on public.messages for select using (
  from_id = auth.uid() or to_id = auth.uid()
);
create policy "Enviar mensagem" on public.messages for insert with check (from_id = auth.uid());
create policy "Marcar como lida" on public.messages for update using (to_id = auth.uid());

-- Policies: badges
create policy "Aluno vê próprias insígnias" on public.badges for select using (student_id = auth.uid());
create policy "Coach vê insígnias dos alunos" on public.badges for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'coach')
);
create policy "Sistema insere insígnias" on public.badges for insert with check (student_id = auth.uid());

-- Storage bucket para avatares
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
create policy "Avatar público" on storage.objects for select using (bucket_id = 'avatars');
create policy "Upload próprio avatar" on storage.objects for insert with check (
  bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "Atualizar próprio avatar" on storage.objects for update using (
  bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
);

-- Comprovantes de treino privados. O primeiro diretorio sempre e o UUID do aluno.
insert into storage.buckets (id, name, public)
values ('workout-results', 'workout-results', false)
on conflict (id) do update set public = false;
create policy "Aluno le seus comprovantes" on storage.objects for select to authenticated using (
  bucket_id = 'workout-results' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "Aluno envia comprovante" on storage.objects for insert to authenticated with check (
  bucket_id = 'workout-results' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "Aluno atualiza comprovante" on storage.objects for update to authenticated using (
  bucket_id = 'workout-results' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "Coach le comprovantes dos alunos" on storage.objects for select to authenticated using (
  bucket_id = 'workout-results' and exists (
    select 1 from public.workouts workout
    join public.weeks week on week.id = workout.week_id
    where workout.id::text = (storage.foldername(name))[2] and week.coach_id = auth.uid()
  )
);

insert into storage.buckets (id, name, public)
values ('activity-results', 'activity-results', false)
on conflict (id) do update set public = false;
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

-- Dados iniciais: biblioteca de treinos do Rui
-- (rodar após criar o usuário coach com o email sanchesrui64@gmail.com)
-- insert into public.workout_templates (coach_id, type, title, description, default_km) values
-- ('<COACH_UUID>', 'rodagem_leve', 'Rodagem leve', 'Ritmo confortável, conversa fácil', 6),
-- ('<COACH_UUID>', 'rodagem_moderada', 'Rodagem moderada', 'Ritmo controlado, respiração firme', 10),
-- ('<COACH_UUID>', 'fartlek', 'Fartlek', '2 min forte / 1 min fraco', 6),
-- ('<COACH_UUID>', 'tiros', 'Tiros 200m', 'Pausa 45 seg entre tiros', 5),
-- ('<COACH_UUID>', 'tiros', 'Tiros 300m', 'Pausa 40-50 seg entre tiros', 5),
-- ('<COACH_UUID>', 'longao', 'Longão progressivo', 'Ritmo aumenta a cada km', 20),
-- ('<COACH_UUID>', 'rampa', 'Rampa 30 min', 'Subida contínua em ritmo controlado', null),
-- ('<COACH_UUID>', 'regenerativo', 'Regenerativo', 'Bem leve, recuperação ativa', 5);
