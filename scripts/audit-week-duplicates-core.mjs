import { createClient } from '@supabase/supabase-js';
import { loadEnvFile, parseArgs, requireEnv } from './safe-env.mjs';

export const TARGET_WEEK = { date_start: '2026-06-22', date_end: '2026-06-28', label: '22/06 a 28/06' };

export function initClient(defaultEnv = '.env.local') {
  const args = parseArgs();
  loadEnvFile(args.values.get('env-file') || defaultEnv);
  const env = requireEnv(['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);
  return { args, supabase: createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } }) };
}

export function scoreWeek(week) {
  const workouts = week.workouts || [];
  const activities = week.athlete_activities || [];
  const plans = week.week_day_plans || [];
  const done = workouts.filter((workout) => workout.status === 'done').length;
  const skipped = workouts.filter((workout) => workout.status === 'skipped').length;
  const scheduled = workouts.filter((workout) => workout.scheduled_date).length;
  const images = workouts.reduce((total, workout) => total + (workout.result_images?.length || 0), 0);
  const realActivityScore = done * 100 + skipped * 50 + activities.length * 100 + plans.length * 5 + scheduled * 10 + images * 25;
  return { done, skipped, scheduled, images, activities: activities.length, plans: plans.length, workouts: workouts.length, realActivityScore };
}

export async function loadDuplicateReport(supabase) {
  const { data, error } = await supabase
    .from('weeks')
    .select('id,student_id,coach_id,label,status,date_start,date_end,created_at,profiles:student_id(name,email),workouts(id,status,scheduled_date,result_images),athlete_activities(id),week_day_plans(id,is_rest)')
    .eq('date_start', TARGET_WEEK.date_start)
    .eq('date_end', TARGET_WEEK.date_end)
    .order('student_id')
    .order('created_at');
  if (error) throw error;
  const groups = new Map();
  for (const week of data || []) {
    const key = week.student_id;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({ ...week, score: scoreWeek(week) });
  }
  return [...groups.entries()].map(([studentId, weeks]) => ({ studentId, weeks, duplicate: weeks.length > 1 }));
}

export function chooseKeepWeek(group) {
  const activeWeeks = [...group.weeks];
  const withRealActivity = activeWeeks.filter((week) => week.score.realActivityScore > 0);
  if (withRealActivity.length > 1) {
    return { abort: true, reason: 'Mais de uma semana tem progresso real; revisar manualmente.' };
  }
  const keep = withRealActivity[0] || activeWeeks.sort((a, b) => {
    if (b.score.workouts !== a.score.workouts) return b.score.workouts - a.score.workouts;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  })[0];
  return { keep, remove: activeWeeks.filter((week) => week.id !== keep.id) };
}

export function printReport(groups) {
  console.log('\nAUDITORIA DE DUPLICATAS - ' + TARGET_WEEK.label);
  let duplicates = 0;
  let removable = 0;
  for (const group of groups) {
    const student = group.weeks[0]?.profiles;
    const name = student?.name || group.studentId;
    const email = student?.email || 'sem email';
    if (!group.duplicate) continue;
    duplicates += 1;
    const decision = chooseKeepWeek(group);
    console.log('\n' + name + ' <' + email + '> - ' + group.weeks.length + ' semanas');
    for (const week of group.weeks) {
      const mark = decision.keep?.id === week.id ? 'MANTER' : 'avaliar/remover';
      console.log('  [' + mark + '] ' + week.id + ' criada em ' + week.created_at + ' | treinos=' + week.score.workouts + ' concluidos=' + week.score.done + ' nao_realizados=' + week.score.skipped + ' agendados=' + week.score.scheduled + ' atividades=' + week.score.activities + ' score=' + week.score.realActivityScore);
    }
    if (decision.abort) console.log('  ABORTAR: ' + decision.reason);
    else removable += decision.remove.length;
  }
  console.log('\nResumo:');
  console.log('- alunos com duplicidade:', duplicates);
  console.log('- semanas removiveis automaticamente:', removable);
  if (!duplicates) console.log('- nenhuma duplicidade encontrada para o intervalo.');
}
