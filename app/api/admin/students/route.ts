import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

type CreateStudentBody = {
  name?: string
  email?: string
  phone?: string
  goal?: string
  weeklyVolume?: string
  targetRace?: string
  monthlyFee?: string
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function getClients() {
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return null
  }

  return {
    authClient: createClient(supabaseUrl, anonKey),
    admin: createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    }),
  }
}

async function getCoach(request: Request) {
  const clients = getClients()
  if (!clients) {
    return {
      response: NextResponse.json(
        { error: 'Configure SUPABASE_SERVICE_ROLE_KEY no ambiente do servidor.' },
        { status: 500 },
      ),
    }
  }

  const { authClient, admin } = clients
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) {
    return { response: NextResponse.json({ error: 'Sessao do professor nao encontrada.' }, { status: 401 }) }
  }

  const { data: authData, error: authError } = await authClient.auth.getUser(token)
  if (authError || !authData.user) {
    return { response: NextResponse.json({ error: 'Login invalido ou expirado.' }, { status: 401 }) }
  }

  const { data: coach } = await admin
    .from('profiles')
    .select('id, role')
    .eq('id', authData.user.id)
    .single()

  const role = coach?.role || authData.user.user_metadata?.role
  if (role !== 'coach') {
    return { response: NextResponse.json({ error: 'Apenas o professor pode acessar alunos.' }, { status: 403 }) }
  }

  return { admin, coach, user: authData.user }
}

export async function GET(request: Request) {
  const auth = await getCoach(request)
  if ('response' in auth) return auth.response

  const { admin } = auth
  const { data: profiles, error } = await admin
    .from('profiles')
    .select('id,name,email,avatar_url')
    .eq('role', 'student')
    .order('name')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const students = await Promise.all((profiles || []).map(async (profile) => {
    const [{ data: student }, { data: weeks }, { data: payments }] = await Promise.all([
      admin.from('students').select('goal,total_km,total_workouts').eq('id', profile.id).single(),
      admin.from('weeks').select('label,workouts(status)').eq('student_id', profile.id).eq('status', 'published').order('date_start', { ascending: false }).limit(1),
      admin.from('payments').select('status,month').eq('student_id', profile.id).order('created_at', { ascending: false }).limit(1),
    ])

    const week = weeks?.[0]
    const done = week?.workouts?.filter((workout: { status: string }) => workout.status === 'done').length || 0
    const skipped = week?.workouts?.filter((workout: { status: string }) => workout.status === 'skipped').length || 0
    const total = week?.workouts?.length || 0
    const pending = Math.max(total - done - skipped, 0)

    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      avatar_url: profile.avatar_url,
      goal: student?.goal,
      total_km: student?.total_km,
      total_workouts: student?.total_workouts,
      week: week ? { label: week.label, done, skipped, pending, total } : undefined,
      payment: payments?.[0],
    }
  }))

  return NextResponse.json({ students })
}

export async function POST(request: Request) {
  const auth = await getCoach(request)
  if ('response' in auth) return auth.response

  const { admin } = auth
  const body = (await request.json()) as CreateStudentBody
  const name = body.name?.trim()
  const email = body.email?.trim().toLowerCase()

  if (!name || !email) {
    return NextResponse.json({ error: 'Informe nome e email do aluno.' }, { status: 400 })
  }

  const password = 'Corrida2026!'
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name,
      must_change_password: true,
    },
  })

  if (createError || !created.user) {
    return NextResponse.json(
      { error: createError?.message || 'Nao foi possivel criar o usuario.' },
      { status: 400 },
    )
  }

  const monthlyFee = body.monthlyFee ? Number(body.monthlyFee) : 0
  const goalParts = [body.goal, body.weeklyVolume ? `Volume semanal: ${body.weeklyVolume}` : null]
    .filter(Boolean)
    .join(' | ')

  const { error: profileError } = await admin.from('profiles').upsert({
    id: created.user.id,
    role: 'student',
    name,
    email,
    whatsapp: body.phone?.trim() || null,
  })

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 })
  }

  const { error: studentError } = await admin.from('students').upsert({
    id: created.user.id,
    goal: goalParts || null,
    next_race: body.targetRace?.trim() || null,
    monthly_fee: Number.isFinite(monthlyFee) ? monthlyFee : 0,
  })

  if (studentError) {
    return NextResponse.json({ error: studentError.message }, { status: 400 })
  }

  return NextResponse.json({
    student: {
      id: created.user.id,
      name,
      email,
      initialPassword: password,
    },
  })
}
