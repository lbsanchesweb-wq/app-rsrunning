-- Impede duas semanas ativas para o mesmo aluno e intervalo.
-- Em producao, aplique somente depois de limpar duplicatas existentes.

do $$
begin
  if exists (
    select 1
    from public.weeks
    where status in ('draft', 'published')
    group by student_id, date_start, date_end
    having count(*) > 1
  ) then
    raise exception 'Existem semanas duplicadas. Rode a auditoria e limpe as duplicatas antes desta migration.';
  end if;
end;
$$;

create unique index if not exists weeks_unique_student_date_active
on public.weeks (student_id, date_start, date_end)
where status in ('draft', 'published');
