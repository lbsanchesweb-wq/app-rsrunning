-- RS Running - correcao de RLS recursiva em profiles.
-- Rodar no Supabase SQL Editor caso apareca:
-- "infinite recursion detected in policy for relation profiles"

drop policy if exists "Coach ve todos os perfis" on public.profiles;
drop policy if exists "Coach vê todos os perfis" on public.profiles;
drop policy if exists "Coach ve todos alunos" on public.students;
drop policy if exists "Coach vê todos alunos" on public.students;
drop policy if exists "Coach atualiza dados de alunos" on public.students;
drop policy if exists "Coach insere dados de alunos" on public.students;
drop policy if exists "Coach ve insignias dos alunos" on public.badges;
drop policy if exists "Coach vê insígnias dos alunos" on public.badges;

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

create policy "Coach ve insignias dos alunos"
on public.badges
for select
using (public.is_coach(auth.uid()));
