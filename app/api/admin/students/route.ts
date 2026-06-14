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

export async function POST(request: Request) {
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return NextResponse.json(
      { error: 'Configure SUPABASE_SERVICE_ROLE_KEY no ambiente do servidor.' },
      { status: 500 },
    )
  }

  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) {
    return NextResponse.json({ error: 'Sessao do professor nao encontrada.' }, { status: 401 })
  }

  const authClient = createClient(supabaseUrl, anonKey)
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: authData, error: authError } = await authClient.auth.getUser(token)
  if (authError || !authData.user) {
    return NextResponse.json({ error: 'Login invalido ou expirado.' }, { status: 401 })
  }

  const { data: coach } = await admin
    .from('profiles')
    .select('id, role')
    .eq('id', authData.user.id)
    .single()

  if (coach?.role !== 'coach') {
    return NextResponse.json({ error: 'Apenas o professor pode cadastrar alunos.' }, { status: 403 })
  }

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
