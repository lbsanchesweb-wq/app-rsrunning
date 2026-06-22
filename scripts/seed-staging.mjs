import { createClient } from '@supabase/supabase-js'
import { existsSync, readFileSync } from 'node:fs'

if (existsSync('.env.local')) {
  for (const line of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match && process.env[match[1].trim()] === undefined) process.env[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '')
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const coachPassword = process.env.RS_RUNNING_STAGING_COACH_PASSWORD
const studentPassword = process.env.RS_RUNNING_STAGING_STUDENT_PASSWORD
if (!url || !serviceKey || !coachPassword || !studentPassword) {
  throw new Error('Defina URL, service role e as duas senhas de homologacao antes de executar.')
}

const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })

async function ensureUser(email, password, name, role) {
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  if (listError) throw listError
  let user = usersData.users.find(item => item.email?.toLowerCase() === email.toLowerCase())
  if (user) {
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, { password, email_confirm: true, user_metadata: { name, role } })
    if (error) throw error
    user = data.user
  } else {
    const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { name, role } })
    if (error) throw error
    user = data.user
  }
  const { error: profileError } = await supabase.from('profiles').upsert({ id: user.id, email, name, role })
  if (profileError) throw profileError
  return user.id
}

function iso(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const coachId = await ensureUser('coach.preview@rsrunning.test', coachPassword, 'Treinador Preview', 'coach')
const studentId = await ensureUser('aluno.preview@rsrunning.test', studentPassword, 'Atleta Preview', 'student')
const { error: studentError } = await supabase.from('students').upsert({ id: studentId, goal: 'Validar agenda semanal', monthly_fee: 0 })
if (studentError) throw studentError

const now = new Date()
const monday = new Date(now)
const weekday = now.getDay()
monday.setDate(now.getDate() - (weekday === 0 ? 6 : weekday - 1))
const sunday = new Date(monday)
sunday.setDate(monday.getDate() + 6)
const dateStart = iso(monday)
const dateEnd = iso(sunday)

const { data: oldWeeks } = await supabase.from('weeks').select('id').eq('student_id', studentId)
if (oldWeeks?.length) await supabase.from('weeks').delete().in('id', oldWeeks.map(week => week.id))
const { data: week, error: weekError } = await supabase.from('weeks').insert({ student_id: studentId, coach_id: coachId, label: 'Semana de homologacao', date_start: dateStart, date_end: dateEnd, status: 'published' }).select().single()
if (weekError) throw weekError

const workouts = [
  { type:'rodagem_leve',title:'Corrida base',planned_km:6,suggested_day:'Segunda',offset:0 },
  { type:'tiros',title:'Intervalado curto',planned_km:5,suggested_day:'Quarta',offset:2 },
  { type:'longao',title:'Longo progressivo',planned_km:12,suggested_day:'Domingo',offset:6 },
]
const { error: workoutsError } = await supabase.from('workouts').insert(workouts.map((workout, index) => {
  const scheduled = new Date(monday)
  scheduled.setDate(monday.getDate() + workout.offset)
  return { week_id:week.id,student_id:studentId,type:workout.type,title:workout.title,planned_km:workout.planned_km,suggested_day:workout.suggested_day,order_num:index+1,scheduled_date:iso(scheduled),scheduled_order:index+1,status:'pending' }
}))
if (workoutsError) throw workoutsError

console.log('Homologacao pronta.')
console.log('Treinador: coach.preview@rsrunning.test')
console.log('Aluno: aluno.preview@rsrunning.test')
