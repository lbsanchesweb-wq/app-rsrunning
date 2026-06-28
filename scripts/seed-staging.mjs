import { createClient } from '@supabase/supabase-js';
import { assertNotProductionUrl, assertStaging, loadEnvFile, parseArgs, requireEnv } from './safe-env.mjs';

const args = parseArgs();
loadEnvFile(args.values.get('env-file') || '.env.staging.local');
assertStaging();
assertNotProductionUrl();
const env = requireEnv(['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'RS_RUNNING_COACH_PASSWORD', 'RS_RUNNING_STUDENT_PASSWORD']);
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

const coach = { email: 'coach.preview@rsrunning.test', name: 'Coach Preview' };
const students = [
  { email: 'aluno1.preview@rsrunning.test', name: 'Aluno Preview 1' },
  { email: 'aluno2.preview@rsrunning.test', name: 'Aluno Preview 2' },
  { email: 'aluno3.preview@rsrunning.test', name: 'Aluno Preview 3' },
];
const WEEK = { label: 'Homologacao 22/06 a 28/06', date_start: '2026-06-22', date_end: '2026-06-28' };
const sampleWorkouts = [
  { type: 'regenerativo', title: 'Regenerativo', planned_km: 3, order_num: 1 },
  { type: 'tiros', title: 'Tiros: 6 x 200 m', description: 'Recuperacao leve entre repeticoes.', order_num: 2 },
  { type: 'rodagem_leve', title: 'Rodagem leve', planned_km: 8, order_num: 3 },
];

async function upsertUser({ email, name, role, password }) {
  const { data: list, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) throw listError;
  const existing = list.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
  const user = existing || (await supabase.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { name, role } })).data.user;
  if (!user) throw new Error('Nao foi possivel criar usuario ' + email);
  const { error: profileError } = await supabase.from('profiles').upsert({ id: user.id, email, name, role }, { onConflict: 'id' });
  if (profileError) throw profileError;
  if (role === 'student') {
    const { error: studentError } = await supabase.from('students').upsert({ id: user.id, total_km: 0, total_workouts: 0, streak_days: 0, xp: 0, monthly_fee: 0 }, { onConflict: 'id' });
    if (studentError) throw studentError;
  }
  return user;
}

async function seedWeek(coachUser, studentUser) {
  const { data: existing, error: existingError } = await supabase.from('weeks').select('id').eq('student_id', studentUser.id).eq('date_start', WEEK.date_start).eq('date_end', WEEK.date_end);
  if (existingError) throw existingError;
  if (existing.length) {
    console.log('Semana ja existe para', studentUser.email, '- mantendo dados atuais.');
    return;
  }
  const { data: week, error: weekError } = await supabase.from('weeks').insert({ ...WEEK, student_id: studentUser.id, coach_id: coachUser.id, status: 'published' }).select('id').single();
  if (weekError) throw weekError;
  const rows = sampleWorkouts.map((workout) => ({ ...workout, week_id: week.id, student_id: studentUser.id, status: 'pending', suggested_day: null, scheduled_date: null, scheduled_order: workout.order_num }));
  const { error: workoutError } = await supabase.from('workouts').insert(rows);
  if (workoutError) throw workoutError;
  console.log('Semana staging criada para', studentUser.email);
}

const coachUser = await upsertUser({ ...coach, role: 'coach', password: env.RS_RUNNING_COACH_PASSWORD });
for (const student of students) {
  const studentUser = await upsertUser({ ...student, role: 'student', password: env.RS_RUNNING_STUDENT_PASSWORD });
  await seedWeek(coachUser, studentUser);
}
console.log('\nSeed staging concluido.');
console.log('Treinador:', coach.email);
console.log('Alunos:', students.map((student) => student.email).join(', '));
