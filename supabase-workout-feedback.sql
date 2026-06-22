-- RS Running - ajuste de execucao real dos treinos
-- Execute no Supabase SQL Editor antes de testar anexos em producao/preview.

alter table public.profiles
add column if not exists birth_date date;

alter table public.workouts
add column if not exists skip_reason text;

alter table public.workouts
add column if not exists result_images text[] default '{}';

insert into storage.buckets (id, name, public)
values ('workout-results', 'workout-results', false)
on conflict (id) do update set public = false;

drop policy if exists "Aluno le seus comprovantes" on storage.objects;
drop policy if exists "Aluno envia comprovante" on storage.objects;
drop policy if exists "Aluno atualiza comprovante" on storage.objects;
drop policy if exists "Coach le comprovantes dos alunos" on storage.objects;

create policy "Aluno le seus comprovantes"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'workout-results'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Aluno envia comprovante"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'workout-results'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Coach le comprovantes dos alunos"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'workout-results'
  and exists (
    select 1
    from public.workouts workout
    join public.weeks week on week.id = workout.week_id
    where workout.id::text = (storage.foldername(name))[2]
      and week.coach_id = auth.uid()
  )
);

create policy "Aluno atualiza comprovante"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'workout-results'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'workout-results'
  and auth.uid()::text = (storage.foldername(name))[1]
);
