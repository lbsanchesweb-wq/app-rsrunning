import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export type Profile = {
  id: string
  role: 'coach' | 'student'
  name: string
  email: string
  avatar_url?: string
  whatsapp?: string
  bio?: string
  birth_date?: string
  created_at: string
}

export type Student = {
  id: string
  goal?: string
  next_race?: string
  total_km: number
  total_workouts: number
  streak_days: number
  xp: number
  monthly_fee: number
  pix_key?: string
}

export type WorkoutTemplate = {
  id: string
  coach_id: string
  type: WorkoutType
  title: string
  description?: string
  default_km?: number
  default_duration?: number
  default_pace?: string
  notes?: string
}

export type WorkoutType = 'rodagem_leve' | 'rodagem_moderada' | 'fartlek' | 'tiros' | 'longao' | 'rampa' | 'regenerativo' | 'prova' | 'ritmado' | 'desafio'

export type Week = {
  id: string
  student_id: string
  coach_id: string
  label: string
  date_start: string
  date_end: string
  status: 'draft' | 'published'
  notes?: string
  workouts?: Workout[]
}

export type Workout = {
  id: string
  week_id: string
  student_id: string
  type: WorkoutType
  title: string
  description?: string
  planned_km?: number
  planned_duration?: number
  planned_pace?: string
  suggested_day?: string
  order_num: number
  scheduled_date?: string
  scheduled_order: number
  schedule_updated_at?: string
  status: 'pending' | 'done' | 'skipped'
  done_at?: string
  actual_km?: number
  actual_duration?: number
  actual_pace?: string
  feeling?: 'facil' | 'ok' | 'dificil' | 'muito_dificil'
  notes?: string
  skip_reason?: string
  result_images?: string[]
}

export type WeekDayPlan = {
  id: string
  week_id: string
  student_id: string
  plan_date: string
  is_rest: boolean
  notes?: string
}

export type AthleteActivityType = 'corrida' | 'caminhada' | 'bicicleta' | 'musculacao' | 'natacao' | 'mobilidade' | 'outro'

export type AthleteActivity = {
  id: string
  week_id: string
  student_id: string
  activity_date: string
  activity_type: AthleteActivityType
  title: string
  duration_minutes?: number
  distance_km?: number
  effort?: 'leve' | 'moderado' | 'forte' | 'maximo'
  notes?: string
  result_images?: string[]
  display_order: number
  created_at: string
}

export type Payment = {
  id: string
  student_id: string
  month: string
  amount: number
  due_date?: string
  status: 'pending' | 'paid' | 'overdue'
  paid_at?: string
  pix_key?: string
  notes?: string
}

export type Message = {
  id: string
  from_id: string
  to_id: string
  content: string
  read: boolean
  created_at: string
}

export type BadgeKey =
  | 'first_workout'
  | 'perfect_week'
  | 'on_fire_7d'
  | 'no_rain_stops_me'
  | 'machine_10weeks'
  | 'legend_1year'
  | 'three_digits_100km'
  | 'half_marathon_everyday'
  | 'laser_beam'
  | 'iron_legs'
  | 'chaos_rhythm'
  | 'climb_climb'

export const BADGE_META: Record<BadgeKey, { name: string; desc: string; xp: number; color: string }> = {
  first_workout:         { name: 'Saiu da poltrona',       desc: 'Primeiro treino registrado',          xp: 50,   color: '#c8f000' },
  perfect_week:          { name: 'Semana impecável',        desc: '100% dos treinos da semana',          xp: 80,   color: '#4db8ff' },
  on_fire_7d:            { name: 'Tá pegando fogo!',        desc: '7 dias seguidos treinando',           xp: 120,  color: '#ff6b00' },
  no_rain_stops_me:      { name: 'Nem a chuva me para',     desc: '30 dias sem faltar um treino',        xp: 300,  color: '#a855f7' },
  machine_10weeks:       { name: 'Máquina humana',          desc: '10 semanas 100% concluídas',          xp: 500,  color: '#00d4d4' },
  legend_1year:          { name: 'Lenda viva',              desc: '1 ano ativo no RS Running',           xp: 1000, color: '#ffd700' },
  three_digits_100km:    { name: 'Três dígitos',            desc: '100 km acumulados',                   xp: 200,  color: '#4db8ff' },
  half_marathon_everyday:{ name: 'Meia maratona todo dia',  desc: '500 km no total',                     xp: 800,  color: '#00e86e' },
  laser_beam:            { name: 'Raio laser',              desc: '10 treinos de tiros concluídos',      xp: 150,  color: '#ff3333' },
  iron_legs:             { name: 'Pernas de aço',           desc: '5 longões concluídos',                xp: 200,  color: '#00ff88' },
  chaos_rhythm:          { name: 'Ritmo do caos',           desc: '5 fartleks na conta',                 xp: 150,  color: '#8888ff' },
  climb_climb:           { name: 'Sobe que sobe',           desc: '5 treinos de rampa',                  xp: 150,  color: '#ff8c00' },
}
