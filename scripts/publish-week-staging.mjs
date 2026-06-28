import { createClient } from '@supabase/supabase-js';
import { assertConfirmation, assertNotProductionUrl, assertStaging, loadEnvFile, parseArgs, requireEnv } from './safe-env.mjs';

const CONFIRMATION = 'PUBLICAR-STAGING-22-28-06-2026';
const WEEK = { label: 'Staging 22/06 a 28/06', date_start: '2026-06-22', date_end: '2026-06-28' };
const args = parseArgs();
loadEnvFile(args.values.get('env-file') || '.env.staging.local');
assertStaging();
assertNotProductionUrl();
const shouldPublish = assertConfirmation(args, CONFIRMATION);
const env = requireEnv(['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

const workouts = [
  { type: 'regenerativo', title: 'Regenerativo', planned_km: 4 },
  { type: 'ritmado', title: 'Rodagem com split negativo', planned_km: 6, description: 'Segunda metade mais rapida que a primeira.' },
  { type: 'rodagem_leve', title: 'Rodagem leve', planned_km: 10 },
];

const { data: coach, error: coachError } = await supabase.from('profiles').select('id,email,name').eq('role', 'coach').eq('email', 'coach.preview@rsrunning.test').maybeSingle();
if (coachError || !coach) throw new Error('Coach staging nao encontrado. Rode npm run seed:staging primeiro.');
const { data: students, error: studentsError } = await supabase.from('profiles').select('id,email,name').eq('role', 'student').like('email', 'aluno%.preview@rsrunning.test').order('email');
if (studentsError) throw studentsError;
if (!students.length) throw new Error('Alunos staging nao encontrados. Rode npm run seed:staging primeiro.');

const { data: existing, error: existingError } = await supabase.from('weeks').select('id,student_id,label,status').in('student_id', students.map((student) => student.id)).eq('date_start', WEEK.date_start).eq('date_end', WEEK.date_end).in('status', ['draft', 'published']);
if (existingError) throw existingError;
if (existing.length) {
  console.log('\nPublicacao bloqueada: ja existe semana neste intervalo para:');
  for (const week of existing) {
    const student = students.find((item) => item.id === week.student_id);
    console.log('-', student?.email || week.student_id, week.label, week.status);
  }
  process.exit(1);
}

console.log('\nDRY-RUN staging:', WEEK.label);
for (const student of students) console.log('-', student.email, workouts.length, 'treinos');
console.log('Total:', students.length * workouts.length, 'treinos.');
if (!shouldPublish) {
  console.log('\nNenhum dado alterado. Para publicar: npm run publish:week:staging -- --publish --confirm=' + CONFIRMATION);
  process.exit(0);
}

const created = [];
try {
  for (const student of students) {
    const { data: week, error: weekError } = await supabase.from('weeks').insert({ ...WEEK, student_id: student.id, coach_id: coach.id, status: 'published' }).select('id').single();
    if (weekError) throw weekError;
    created.push(week.id);
    const rows = workouts.map((workout, index) => ({ ...workout, week_id: week.id, student_id: student.id, order_num: index + 1, scheduled_date: null, suggested_day: null, status: 'pending' }));
    const { error: workoutError } = await supabase.from('workouts').insert(rows);
    if (workoutError) throw workoutError;
  }
} catch (error) {
  if (created.length) await supabase.from('weeks').delete().in('id', created);
  throw error;
}
console.log('\nPublicacao staging concluida:', created.length, 'semanas.');
