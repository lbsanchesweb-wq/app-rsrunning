-- RS Running - preparacao de producao antes da carga inicial.
-- Rodar no Supabase SQL Editor.

drop policy if exists "Coach ve todos os perfis" on public.profiles;
drop policy if exists "Coach vê todos os perfis" on public.profiles;
drop policy if exists "Coach ve todos alunos" on public.students;
drop policy if exists "Coach vê todos alunos" on public.students;
drop policy if exists "Coach atualiza dados de alunos" on public.students;
drop policy if exists "Coach insere dados de alunos" on public.students;
drop policy if exists "Coach gerencia templates" on public.workout_templates;
drop policy if exists "Aluno ve templates" on public.workout_templates;
drop policy if exists "Aluno vê templates" on public.workout_templates;
drop policy if exists "Coach ve insignias dos alunos" on public.badges;
drop policy if exists "Coach vê insígnias dos alunos" on public.badges;
drop policy if exists "Coach gerencia semanas" on public.weeks;
drop policy if exists "Coach gerencia treinos" on public.workouts;
drop policy if exists "Aluno ve e atualiza proprios treinos" on public.workouts;
drop policy if exists "Aluno vê e atualiza próprios treinos" on public.workouts;
drop policy if exists "Aluno marca treino concluido" on public.workouts;
drop policy if exists "Aluno marca treino concluído" on public.workouts;

create or replace function public.is_coach(user_id uuid)
returns boolean
language sql
security definer
set search_path = auth, public
as $$
  select exists (
    select 1
    from auth.users
    where id = user_id
    and raw_user_meta_data->>'role' = 'coach'
  );
$$;

create policy "Coach ve todos os perfis"
on public.profiles
for select
using (auth.uid() = id or public.is_coach(auth.uid()));

create policy "Coach ve todos alunos"
on public.students
for select
using (auth.uid() = id or public.is_coach(auth.uid()));

create policy "Coach insere dados de alunos"
on public.students
for insert
with check (public.is_coach(auth.uid()) or auth.uid() = id);

create policy "Coach atualiza dados de alunos"
on public.students
for update
using (public.is_coach(auth.uid()) or auth.uid() = id)
with check (public.is_coach(auth.uid()) or auth.uid() = id);

create policy "Coach gerencia templates"
on public.workout_templates
for all
using (coach_id = auth.uid())
with check (coach_id = auth.uid());

create policy "Aluno ve templates"
on public.workout_templates
for select
using (auth.uid() is not null);

create policy "Coach gerencia semanas"
on public.weeks
for all
using (coach_id = auth.uid())
with check (coach_id = auth.uid());

create policy "Coach gerencia treinos"
on public.workouts
for all
using (
  exists (
    select 1
    from public.weeks w
    where w.id = week_id
    and w.coach_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.weeks w
    where w.id = week_id
    and w.coach_id = auth.uid()
  )
);

create policy "Aluno ve e atualiza proprios treinos"
on public.workouts
for select
using (student_id = auth.uid());

create policy "Aluno marca treino concluido"
on public.workouts
for update
using (student_id = auth.uid())
with check (student_id = auth.uid());

create policy "Coach ve insignias dos alunos"
on public.badges
for select
using (public.is_coach(auth.uid()));

alter table public.workout_templates
drop constraint if exists workout_templates_type_check;

alter table public.workout_templates
add constraint workout_templates_type_check
check (type in (
  'rodagem_leve',
  'rodagem_moderada',
  'fartlek',
  'tiros',
  'longao',
  'rampa',
  'regenerativo',
  'prova',
  'ritmado',
  'desafio'
));
