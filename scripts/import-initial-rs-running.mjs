import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";

function loadLocalEnv() {
  if (!existsSync(".env.local")) return;

  const lines = readFileSync(".env.local", "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, "");

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadLocalEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY antes de rodar.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const coach = {
  name: "Rui Sanches",
  email: "sanchesrui64@gmail.com",
  password: process.env.RS_RUNNING_COACH_PASSWORD || "22595084",
  bio: "Professor responsável pela assessoria RS Running.",
};

const studentInitialPassword = "Corrida2026!";
const week = {
  label: "15/06 a 21/06",
  date_start: "2026-06-15",
  date_end: "2026-06-21",
};

const students = [
  {
    name: "Ana Júlia",
    email: "ana.julia.pereira2507@gmail.com",
    workouts: [
      { type: "tiros", title: "Tiros: 8 x 1 minuto" },
      { type: "rodagem_leve", title: "Rodagem leve", planned_km: 6 },
      { type: "rodagem_leve", title: "Rodagem leve", planned_km: 4 },
      { type: "desafio", title: "Desafio PG", description: "10 km + 21 km", planned_km: 31 },
    ],
  },
  {
    name: "Carlos Franciscatto",
    email: "cfranciscatto@gmail.com",
    workouts: [
      { type: "rodagem_leve", title: "Rodagem leve", planned_km: 8 },
      { type: "tiros", title: "Tiros: 12 x 1,5 minuto" },
      { type: "rodagem_leve", title: "Rodagem leve", planned_km: 6 },
      { type: "fartlek", title: "Fartlek", description: "2 min forte / 1 min fraco", planned_km: 6 },
      { type: "longao", title: "Longão", planned_km: 30 },
    ],
  },
  {
    name: "Rafael Senciatti",
    email: "senciattirafael@gmail.com",
    workouts: [
      { type: "regenerativo", title: "Regenerativo", planned_km: 3 },
      { type: "tiros", title: "Tiros: 12 x 1 minuto" },
      { type: "rodagem_leve", title: "Rodagem leve", planned_km: 10 },
      { type: "fartlek", title: "Fartlek", description: "2 min forte / 1 min fraco", planned_km: 6 },
      { type: "longao", title: "Longão", planned_km: 30 },
    ],
  },
  {
    name: "Daniela",
    email: "danielaled@bol.com.br",
    workouts: [
      { type: "rodagem_leve", title: "Rodagem leve", planned_km: 6 },
      { type: "tiros", title: "Tiros: 12 x 1,5 minuto" },
      { type: "fartlek", title: "Fartlek", description: "2 min forte / 1 min fraco", planned_km: 6 },
      { type: "rodagem_leve", title: "Rodagem leve", planned_km: 12 },
    ],
  },
  {
    name: "Maria Laura",
    email: "betmarialaura@gmail.com",
    workouts: [
      { type: "tiros", title: "Tiros: 12 x 1 minuto", description: "Pausa: 40 segundos" },
      { type: "rampa", title: "Rampa", description: "40 minutos", planned_duration: 40 },
      { type: "rodagem_leve", title: "Rodagem leve", planned_km: 8 },
      { type: "rodagem_leve", title: "Rodagem leve", planned_km: 10 },
    ],
  },
  {
    name: "Léo",
    email: "leopb20@hotmail.com",
    workouts: [
      { type: "regenerativo", title: "Regenerativo", planned_km: 4 },
      { type: "tiros", title: "Tiros: 12 x 2 minutos" },
      { type: "fartlek", title: "Fartlek", description: "2 min forte / 1 min fraco", planned_km: 6 },
      { type: "rodagem_leve", title: "Rodagem leve", planned_km: 14 },
    ],
  },
  {
    name: "Célia Nascimento",
    email: "celia_mnascimento@hotmail.com",
    workouts: [
      { type: "rodagem_leve", title: "Rodagem leve", planned_km: 5 },
      { type: "tiros", title: "Tiros: 10 x 1 minuto" },
      { type: "rampa", title: "Rampa", description: "30 minutos", planned_duration: 30 },
      { type: "rodagem_leve", title: "Rodagem leve", planned_km: 12 },
    ],
  },
  {
    name: "Cláudia",
    email: "clau_martu2009@hotmail.com",
    workouts: [
      { type: "tiros", title: "Tiros: 14 x 1 minuto" },
      { type: "rampa", title: "Rampa", description: "35 minutos", planned_duration: 35 },
      { type: "rodagem_leve", title: "Rodagem leve", planned_km: 8 },
      { type: "rodagem_leve", title: "Rodagem leve", planned_km: 12 },
    ],
  },
  {
    name: "Débora Marchesini",
    email: "deboramarchesini.dm@gmail.com",
    workouts: [
      { type: "regenerativo", title: "Regenerativo", planned_km: 3 },
      { type: "tiros", title: "Tiros: 12 x 1 minuto" },
      { type: "fartlek", title: "Fartlek", description: "2 min forte / 1 min fraco", planned_km: 6 },
      { type: "ritmado", title: "Ritmado", description: "Ritmo de prova", planned_km: 10 },
    ],
  },
  {
    name: "Eliane Gonçalves Bicudo",
    email: "elianegoncalvesbicudo@gmail.com",
    workouts: [
      { type: "regenerativo", title: "Regenerativo", planned_km: 4 },
      { type: "tiros", title: "Tiros: 6 x 1,5 minuto" },
      { type: "rampa", title: "Rampa", description: "40 minutos", planned_duration: 40 },
      { type: "rodagem_leve", title: "Rodagem leve", planned_km: 14 },
    ],
  },
  {
    name: "Gláucia",
    email: "glau.rt@hotmail.com",
    workouts: [
      { type: "rodagem_leve", title: "Rodagem leve", planned_km: 6 },
      { type: "tiros", title: "Tiros: 12 x 1 minuto" },
      { type: "rampa", title: "Rampa", description: "35 minutos", planned_duration: 35 },
      { type: "rodagem_leve", title: "Rodagem leve", planned_km: 8 },
    ],
  },
  {
    name: "Érika Franciscatto",
    email: "ecfranciscatto@gmail.com",
    workouts: [
      { type: "rodagem_leve", title: "Rodagem leve", planned_km: 4 },
      { type: "tiros", title: "Tiros: 10 x 1 minuto", description: "Pausa: 45 segundos" },
      { type: "ritmado", title: "Ritmado", planned_km: 8 },
    ],
  },
  {
    name: "Ayane",
    email: "ayanne_lisiane@hotmail.com",
    workouts: [
      { type: "rodagem_leve", title: "Rodagem leve", planned_km: 4 },
      { type: "tiros", title: "Tiros: 12 x 1 minuto" },
      { type: "rampa", title: "Rampa", description: "35 minutos", planned_duration: 35 },
      { type: "rodagem_leve", title: "Rodagem leve", planned_km: 12 },
    ],
  },
  {
    name: "Tatiane Brug",
    email: "tatibrug@gmail.com",
    workouts: [
      { type: "rodagem_leve", title: "Rodagem leve", planned_km: 4 },
      { type: "tiros", title: "Tiros: 12 x 1 minuto" },
      { type: "rampa", title: "Rampa", description: "35 minutos", planned_duration: 35 },
      { type: "rodagem_leve", title: "Rodagem leve", planned_km: 12 },
    ],
  },
];

async function findAuthUserByEmail(email) {
  const normalized = email.toLowerCase();
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(`Erro listando usuarios: ${error.message}`);

    const found = data.users.find((user) => user.email?.toLowerCase() === normalized);
    if (found) return found;
    if (data.users.length < 1000) return null;
    page += 1;
  }
}

async function upsertAuthUser({ email, password, name, role, mustChangePassword }) {
  const existing = await findAuthUserByEmail(email);
  const userData = {
    email,
    email_confirm: true,
    user_metadata: { name, role, must_change_password: mustChangePassword },
  };

  if (existing) {
    const { data, error } = await supabase.auth.admin.updateUserById(existing.id, {
      ...userData,
      password,
    });
    if (error || !data.user) throw new Error(`Erro atualizando usuario ${email}: ${error?.message}`);
    return data.user.id;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    ...userData,
    password,
  });

  if (error || !data.user) throw new Error(`Erro criando usuario ${email}: ${error?.message}`);
  return data.user.id;
}

async function ensureCoach() {
  const id = await upsertAuthUser({
    email: coach.email,
    password: coach.password,
    name: coach.name,
    role: "coach",
    mustChangePassword: false,
  });

  const { error } = await supabase.from("profiles").upsert({
    id,
    role: "coach",
    name: coach.name,
    email: coach.email,
    bio: coach.bio,
  });

  if (error) throw new Error(`Erro garantindo perfil do professor: ${error.message}`);
  return id;
}

async function upsertStudent(student) {
  const id = await upsertAuthUser({
    email: student.email,
    password: studentInitialPassword,
    name: student.name,
    role: "student",
    mustChangePassword: true,
  });

  const { error: profileError } = await supabase.from("profiles").upsert({
    id,
    role: "student",
    name: student.name,
    email: student.email,
  });
  if (profileError) throw new Error(`Erro em profiles (${student.email}): ${profileError.message}`);

  const { error: studentError } = await supabase.from("students").upsert({
    id,
    monthly_fee: 249,
  });
  if (studentError) throw new Error(`Erro em students (${student.email}): ${studentError.message}`);

  return id;
}

async function recreatePublishedWeek(student, studentId, coachId) {
  const { data: existingWeeks, error: listError } = await supabase
    .from("weeks")
    .select("id")
    .eq("student_id", studentId)
    .eq("date_start", week.date_start)
    .eq("date_end", week.date_end);

  if (listError) throw new Error(`Erro buscando semanas (${student.email}): ${listError.message}`);

  for (const existingWeek of existingWeeks ?? []) {
    const { error } = await supabase.from("weeks").delete().eq("id", existingWeek.id);
    if (error) throw new Error(`Erro removendo semana anterior (${student.email}): ${error.message}`);
  }

  const { data: createdWeek, error: weekError } = await supabase
    .from("weeks")
    .insert({
      student_id: studentId,
      coach_id: coachId,
      label: week.label,
      date_start: week.date_start,
      date_end: week.date_end,
      status: "published",
    })
    .select("id")
    .single();

  if (weekError || !createdWeek) throw new Error(`Erro criando semana (${student.email}): ${weekError?.message}`);

  const { error: workoutsError } = await supabase.from("workouts").insert(
    student.workouts.map((workout, index) => ({
      week_id: createdWeek.id,
      student_id: studentId,
      type: workout.type,
      title: workout.title,
      description: workout.description ?? null,
      planned_km: workout.planned_km ?? null,
      planned_pace: workout.planned_pace ?? null,
      suggested_day: workout.suggested_day ?? null,
      order_num: index + 1,
      status: "pending",
    })),
  );

  if (workoutsError) throw new Error(`Erro criando treinos (${student.email}): ${workoutsError.message}`);
}

async function validateImport(coachId) {
  const { data: coachProfile, error: coachError } = await supabase
    .from("profiles")
    .select("id, role, email")
    .eq("id", coachId)
    .single();
  if (coachError || coachProfile?.role !== "coach") {
    throw new Error("Validacao falhou: professor nao ficou com role coach.");
  }

  for (const student of students) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("email", student.email)
      .single();
    if (profileError || profile?.role !== "student") {
      throw new Error(`Validacao falhou: ${student.email} nao ficou como student.`);
    }

    const { data: weeks, error: weekError } = await supabase
      .from("weeks")
      .select("id, workouts(id)")
      .eq("student_id", profile.id)
      .eq("date_start", week.date_start)
      .eq("date_end", week.date_end)
      .eq("status", "published");
    if (weekError || !weeks?.[0] || weeks[0].workouts.length !== student.workouts.length) {
      throw new Error(`Validacao falhou: semana/treinos incorretos para ${student.email}.`);
    }
  }
}

async function main() {
  const coachId = await ensureCoach();
  console.log(`Professor administrador: ${coach.email} (${coachId})`);

  for (const student of students) {
    const studentId = await upsertStudent(student);
    await recreatePublishedWeek(student, studentId, coachId);
    console.log(`OK ${student.name} <${student.email}> - ${student.workouts.length} treinos`);
  }

  await validateImport(coachId);
  console.log(`Carga inicial concluida. Senha inicial dos alunos: ${studentInitialPassword}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
