import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";

const WEEK = { label: "22/06 a 28/06", dateStart: "2026-06-22", dateEnd: "2026-06-28" };
const CONFIRMATION = "PUBLICAR-22-28-06-2026";

function loadLocalEnv() {
  if (!existsSync(".env.local")) return;
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

const workout = (type, title, options = {}) => ({ type, title, ...options });
const lightRun = (km) => workout("rodagem_leve", "Rodagem leve", { planned_km: km });
const recovery = (km, description) => workout("regenerativo", "Regenerativo", { planned_km: km, description });
const intervals = (title) => workout("tiros", title);
const negativeSplit = (km) => workout("ritmado", "Rodagem com split negativo", {
  planned_km: km,
  description: "Concluir a segunda metade mais rápida que a primeira.",
});

const students = [
  { name: "Ana Júlia", email: "ana.julia.pereira2507@gmail.com", workouts: [recovery(3), lightRun(8), lightRun(10)] },
  { name: "Carlos Franciscatto", email: "cfranciscatto@gmail.com", workouts: [
    recovery(5, "Bem leve."), intervals("Tiros: 10 x 200 m"), lightRun(12), workout("longao", "Longo", { planned_km: 28 }),
  ] },
  { name: "Rafael Senciatti", email: "senciattirafael@gmail.com", workouts: [
    recovery(5, "Bem leve."), intervals("Tiros: 12 x 300 m"), lightRun(14), workout("longao", "Longo", { planned_km: 28 }),
  ] },
  { name: "Daniela", email: "danielaled@bol.com.br", workouts: [
    lightRun(6), workout("rampa", "Rampa", { planned_duration: 40 }), intervals("Tiros: 10 x 400 m"),
    workout("ritmado", "Treino VC", { planned_km: 13 }),
  ] },
  { name: "Maria Laura", email: "betmarialaura@gmail.com", workouts: [
    lightRun(8), intervals("Tiros: 4 x 200 m + 4 x 300 m"),
    workout("fartlek", "Fartlek", { planned_km: 5, description: "2 min forte / 1 min fraco." }), lightRun(10),
  ] },
  { name: "Léo", email: "leopb20@hotmail.com", workouts: [
    recovery(4), intervals("Tiros: 4 x 200 m + 4 x 400 m + 4 x 200 m"), negativeSplit(10), lightRun(16),
  ] },
  { name: "Célia Nascimento", email: "celia_mnascimento@hotmail.com", workouts: [
    negativeSplit(6), intervals("Tiros: 12 x 200 m"), lightRun(6), lightRun(8),
  ] },
  { name: "Cláudia", email: "clau_martu2009@hotmail.com", workouts: [
    negativeSplit(6), intervals("Tiros: 4 x 200 m + 4 x 300 m + 4 x 200 m"), lightRun(8),
    workout("ritmado", "Treino VC", { planned_km: 13 }),
  ] },
  { name: "Débora Marchesini", email: "deboramarchesini.dm@gmail.com", workouts: [
    negativeSplit(6), intervals("Tiros: 4 x 200 m + 4 x 300 m + 4 x 200 m"),
    workout("rampa", "Rampa", { planned_duration: 35 }), lightRun(14),
  ] },
  { name: "Keliane", lookupByName: true, workouts: [
    recovery(3), intervals("Tiros: 14 x 200 m"), negativeSplit(6), lightRun(10),
  ] },
  { name: "Gláucia", email: "glau.rt@hotmail.com", workouts: [
    intervals("Tiros: 3 x 200 m + 3 x 300 m + 3 x 200 m"), negativeSplit(6), lightRun(8),
    workout("ritmado", "Treino VC", { planned_km: 13 }),
  ] },
  { name: "Érika Franciscatto", email: "ecfranciscatto@gmail.com", workouts: [
    negativeSplit(6), workout("rampa", "Rampa", { planned_duration: 35 }), workout("ritmado", "Ritmado", { planned_km: 10 }),
  ] },
  { name: "Tatiane Brug", email: "tatibrug@gmail.com", workouts: [
    negativeSplit(6), intervals("Tiros: 10 x 200 m"), lightRun(4), workout("rodagem_leve", "Rodagem turística", { planned_km: 5 }),
  ] },
  { name: "Ayane", email: "ayanne_lisiane@hotmail.com", workouts: [
    negativeSplit(6), intervals("Tiros: 10 x 200 m"), lightRun(4), workout("rodagem_leve", "Rodagem turística", { planned_km: 5 }),
  ] },
];

function normalize(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function printWorkout(item, index) {
  const details = [
    item.planned_km ? `${item.planned_km} km` : null,
    item.planned_duration ? `${item.planned_duration} min` : null,
    item.description ?? null,
  ].filter(Boolean);
  console.log(`   ${index + 1}. ${item.title}${details.length ? ` — ${details.join(" | ")}` : ""}`);
}

async function resolveStudents(supabase, suppliedProfiles) {
  let profiles = suppliedProfiles;
  if (!profiles) {
    const { data, error } = await supabase.from("profiles").select("id, name, email, role").eq("role", "student");
    if (error) throw new Error(`Não foi possível listar alunos: ${error.message}`);
    profiles = data;
  }
  const resolved = [];
  const missing = [];

  for (const student of students) {
    let matches;
    if (student.lookupByName) {
      const expected = normalize(student.name);
      matches = profiles.filter((profile) => normalize(profile.name ?? "").includes(expected));
      if (matches.length > 1) throw new Error(`Mais de um cadastro corresponde a ${student.name}; revise manualmente.`);
    } else {
      matches = profiles.filter((profile) => profile.email?.toLowerCase() === student.email.toLowerCase());
    }
    if (matches.length !== 1) missing.push(student);
    else resolved.push({ ...student, profile: matches[0] });
  }

  const requiredMissing = missing.filter((student) => !student.lookupByName);
  if (requiredMissing.length) {
    throw new Error(`Alunos obrigatórios não localizados: ${requiredMissing.map((item) => item.name).join(", ")}`);
  }
  return { resolved, optionalMissing: missing.filter((student) => student.lookupByName) };
}

async function ensureNoExistingWeeks(supabase, resolved) {
  const ids = resolved.map((student) => student.profile.id);
  const { data, error } = await supabase.from("weeks").select("id, student_id, label, status")
    .in("student_id", ids).eq("date_start", WEEK.dateStart).eq("date_end", WEEK.dateEnd);
  if (error) throw new Error(`Não foi possível auditar semanas existentes: ${error.message}`);
  if (!data.length) return;
  const names = data.map((week) => {
    const student = resolved.find((item) => item.profile.id === week.student_id);
    return `${student?.profile.name ?? week.student_id} (${week.status})`;
  });
  throw new Error(`Já existe semana publicada ou em rascunho para: ${names.join(", ")}`);
}

async function findCoach(supabase) {
  const { data, error } = await supabase.from("profiles").select("id, name, email")
    .eq("role", "coach").eq("email", "sanchesrui64@gmail.com").maybeSingle();
  if (error || !data) throw new Error(`Treinador responsável não localizado: ${error?.message ?? "sem resultado"}`);
  return data;
}

async function publish(supabase, coach, resolved) {
  const createdWeekIds = [];
  try {
    for (const student of resolved) {
      const { data: week, error: weekError } = await supabase.from("weeks").insert({
        student_id: student.profile.id, coach_id: coach.id, label: WEEK.label,
        date_start: WEEK.dateStart, date_end: WEEK.dateEnd, status: "published",
      }).select("id").single();
      if (weekError || !week) throw new Error(`Erro criando semana de ${student.name}: ${weekError?.message}`);
      createdWeekIds.push(week.id);

      const rows = student.workouts.map((item, index) => ({
        week_id: week.id, student_id: student.profile.id, type: item.type, title: item.title,
        description: item.description ?? null, planned_km: item.planned_km ?? null,
        planned_duration: item.planned_duration ?? null, planned_pace: null, suggested_day: null,
        order_num: index + 1, status: "pending",
      }));
      const { error: workoutError } = await supabase.from("workouts").insert(rows);
      if (workoutError) throw new Error(`Erro criando treinos de ${student.name}: ${workoutError.message}`);
    }
  } catch (error) {
    if (createdWeekIds.length) {
      const { error: rollbackError } = await supabase.from("weeks").delete().in("id", createdWeekIds);
      if (rollbackError) throw new Error(`${error.message}. O rollback também falhou: ${rollbackError.message}`);
    }
    throw error;
  }
}

async function validate(supabase, resolved) {
  const ids = resolved.map((student) => student.profile.id);
  const { data, error } = await supabase.from("weeks").select("student_id, status, workouts(id, order_num)")
    .in("student_id", ids).eq("date_start", WEEK.dateStart).eq("date_end", WEEK.dateEnd).eq("status", "published");
  if (error) throw new Error(`Falha validando publicação: ${error.message}`);
  for (const student of resolved) {
    const week = data.find((item) => item.student_id === student.profile.id);
    if (!week || week.workouts.length !== student.workouts.length) throw new Error(`Validação incorreta para ${student.name}.`);
  }
  return data.reduce((total, week) => total + week.workouts.length, 0);
}

async function main() {
  loadLocalEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const coachPassword = process.env.RS_RUNNING_COACH_PASSWORD;
  const adminApiUrl = process.env.RS_RUNNING_ADMIN_API_URL;
  if (!url || (!serviceRole && (!anonKey || !coachPassword))) {
    throw new Error(
      "Defina a URL e uma credencial segura: service role ou anon key com RS_RUNNING_COACH_PASSWORD.",
    );
  }

  const args = new Set(process.argv.slice(2));
  const shouldPublish = args.has("--publish");
  if (shouldPublish && !args.has(`--confirm=${CONFIRMATION}`)) {
    throw new Error(`Publicação bloqueada. Use --publish --confirm=${CONFIRMATION} após validar o relatório.`);
  }

  const supabase = createClient(url, serviceRole || anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  let coach;
  let suppliedProfiles;
  if (!serviceRole) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: "sanchesrui64@gmail.com",
      password: coachPassword,
    });
    if (error) throw new Error(`Não foi possível autenticar o treinador: ${error.message}`);
    coach = {
      id: data.user.id,
      name: data.user.user_metadata?.name ?? "Rui Sanches",
      email: data.user.email,
    };
    if (!adminApiUrl) {
      throw new Error("Defina RS_RUNNING_ADMIN_API_URL para consultar os alunos sem service role local.");
    }
    const response = await fetch(`${adminApiUrl.replace(/\/$/, "")}/api/admin/students`, {
      headers: { Authorization: `Bearer ${data.session.access_token}` },
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(`API administrativa recusou a consulta: ${payload.error ?? response.status}`);
    suppliedProfiles = payload.students;
  } else {
    coach = await findCoach(supabase);
  }
  const { resolved, optionalMissing } = await resolveStudents(supabase, suppliedProfiles);
  await ensureNoExistingWeeks(supabase, resolved);

  console.log(`\nAUDITORIA — ${WEEK.label}`);
  console.log(`Treinador: ${coach.name} <${coach.email}>`);
  for (const student of resolved) {
    console.log(`\n${student.profile.name} <${student.profile.email}> — ${student.workouts.length} treinos`);
    student.workouts.forEach(printWorkout);
  }
  for (const student of optionalMissing) console.log(`\nIGNORADA: ${student.name} não foi localizada com correspondência única.`);
  const expectedTotal = resolved.reduce((total, student) => total + student.workouts.length, 0);
  console.log(`\nTotal previsto: ${expectedTotal} treinos para ${resolved.length} alunos.`);

  if (!shouldPublish) {
    console.log("DRY-RUN concluído. Nenhum dado foi alterado.");
    console.log(`Para publicar: npm run publish:week:2026-06-22 -- --publish --confirm=${CONFIRMATION}`);
    return;
  }
  await publish(supabase, coach, resolved);
  const publishedTotal = await validate(supabase, resolved);
  console.log(`\nPUBLICAÇÃO CONCLUÍDA: ${publishedTotal} treinos para ${resolved.length} alunos.`);
}

main().catch((error) => {
  console.error(`\nERRO: ${error.message}`);
  process.exit(1);
});
