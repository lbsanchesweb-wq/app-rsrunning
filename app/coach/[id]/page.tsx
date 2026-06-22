'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Bed, CheckCircle2, Circle, Footprints, Image as ImageIcon, XCircle } from 'lucide-react'
import { createClient, type AthleteActivity, type Profile, type Week, type WeekDayPlan, type Workout } from '@/lib/supabase'
import { dateForSuggestedDay, weekDates } from '@/lib/week-schedule'

const ACTIVITY_LABELS: Record<string,string> = { corrida:'Corrida',caminhada:'Caminhada',bicicleta:'Bicicleta',musculacao:'Musculação',natacao:'Natação',mobilidade:'Mobilidade',outro:'Outra atividade' }

export default function CoachStudentPage() {
  const params = useParams<{ id: string }>()
  const [student, setStudent] = useState<Profile | null>(null)
  const [week, setWeek] = useState<Week | null>(null)
  const [plans, setPlans] = useState<WeekDayPlan[]>([])
  const [activities, setActivities] = useState<AthleteActivity[]>([])
  const [workoutImages, setWorkoutImages] = useState<Record<string,string[]>>({})
  const [activityImages, setActivityImages] = useState<Record<string,string[]>>({})
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const [{ data: profile }, { data: weeks }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', params.id).single(),
        supabase.from('weeks').select('*, workouts(*)').eq('student_id', params.id).eq('status','published').order('date_start',{ ascending:false }).limit(1),
      ])
      setStudent(profile)
      const currentWeek = weeks?.[0] || null
      setWeek(currentWeek)
      if (!currentWeek) { setLoading(false); return }
      const [{ data: dayPlans }, { data: extras }] = await Promise.all([
        supabase.from('week_day_plans').select('*').eq('week_id', currentWeek.id),
        supabase.from('athlete_activities').select('*').eq('week_id', currentWeek.id).order('display_order'),
      ])
      setPlans(dayPlans || [])
      setActivities(extras || [])

      const workoutEntries = await Promise.all(((currentWeek.workouts || []) as Workout[]).map(async workout => [workout.id, await signedUrls('workout-results', workout.result_images || [])] as const))
      const activityEntries = await Promise.all(((extras || []) as AthleteActivity[]).map(async activity => [activity.id, await signedUrls('activity-results', activity.result_images || [])] as const))
      setWorkoutImages(Object.fromEntries(workoutEntries))
      setActivityImages(Object.fromEntries(activityEntries))
      setLoading(false)
    }

    async function signedUrls(bucket: string, paths: string[]) {
      const values = await Promise.all(paths.map(async path => (await supabase.storage.from(bucket).createSignedUrl(path,3600)).data?.signedUrl || ''))
      return values.filter(Boolean)
    }
    load()
  }, [params.id])

  const days = useMemo(() => week ? weekDates(week.date_start) : [], [week])
  const workouts = (week?.workouts as Workout[] | undefined) || []
  const unscheduled = workouts.filter(workout => !workout.scheduled_date)

  if (loading) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100dvh',color:'var(--rs-neon)' }}>Carregando...</div>

  return <>
    <div className="topbar"><Link href="/coach" aria-label="Voltar"><ArrowLeft size={22} /></Link><strong>{student?.name || 'Aluno'}</strong><span className="badge badge-muted">Agenda</span></div>
    <main className="page fade-up" style={{ paddingBottom:'36px' }}>
      {!week ? <div className="card">Nenhuma semana publicada.</div> : <>
        <section className="card" style={{ marginBottom:'12px' }}><p className="label-neon">{week.label}</p><p style={{ fontSize:'13px',color:'var(--rs-muted)',marginTop:'4px' }}>Agenda organizada pelo atleta</p></section>
        {unscheduled.length > 0 && <section className="card" style={{ marginBottom:'10px',borderColor:'var(--rs-warning)' }}><p style={{ color:'var(--rs-warning)',fontSize:'12px',fontWeight:700 }}>A organizar</p>{unscheduled.map(workout => <p key={workout.id} style={{ marginTop:'8px',fontSize:'13px' }}>{workout.title}</p>)}</section>}
        <div style={{ display:'grid',gap:'10px' }}>{days.map(day => {
          const dayWorkouts = workouts.filter(workout => workout.scheduled_date === day.date).map(workout => ({ kind:'workout' as const,order:workout.scheduled_order || workout.order_num,workout }))
          const dayActivities = activities.filter(activity => activity.activity_date === day.date).map(activity => ({ kind:'activity' as const,order:activity.display_order,activity }))
          const entries = [...dayWorkouts,...dayActivities].sort((a,b) => a.order-b.order)
          const isRest = plans.some(plan => plan.plan_date === day.date && plan.is_rest)
          return <section className="card" key={day.date} style={{ padding:0,overflow:'hidden',borderColor:isRest?'#4db8ff66':'var(--rs-border)' }}>
            <header style={{ padding:'11px 14px',background:'var(--rs-card2)',display:'flex',justifyContent:'space-between' }}><strong>{day.label}</strong><span style={{ color:'var(--rs-muted)',fontSize:'12px' }}>{day.day}/{day.month}</span></header>
            <div style={{ padding:'10px 14px' }}>{isRest ? <p style={{ color:'#4db8ff',display:'flex',gap:'7px',alignItems:'center',fontSize:'13px' }}><Bed size={16} /> Descanso planejado</p> : entries.length === 0 ? <p style={{ color:'var(--rs-muted)',fontSize:'13px' }}>Dia livre</p> : entries.map((entry,index) => entry.kind === 'workout'
              ? <CoachWorkout key={entry.workout.id} workout={entry.workout} week={week} images={workoutImages[entry.workout.id] || []} divider={index < entries.length-1} />
              : <CoachActivity key={entry.activity.id} activity={entry.activity} images={activityImages[entry.activity.id] || []} divider={index < entries.length-1} />)}</div>
          </section>
        })}</div>
      </>}
    </main>
  </>
}

function CoachWorkout({ workout, week, images, divider }: { workout:Workout; week:Week; images:string[]; divider:boolean }) {
  const done = workout.status === 'done'
  const skipped = workout.status === 'skipped'
  const suggestedDate = dateForSuggestedDay(week.date_start, workout.suggested_day)
  const reorganized = Boolean(suggestedDate && workout.scheduled_date && suggestedDate !== workout.scheduled_date)
  return <article style={{ padding:'10px 0',borderBottom:divider?'1px solid var(--rs-border)':'none' }}>
    <div style={{ display:'flex',gap:'8px' }}>{done?<CheckCircle2 size={18} color="var(--rs-neon)"/>:skipped?<XCircle size={18} color="var(--rs-warning)"/>:<Circle size={18} color="var(--rs-muted)"/>}<div style={{ flex:1 }}><strong style={{ fontSize:'14px' }}>{workout.title}</strong><p style={{ fontSize:'10px',color:reorganized?'var(--rs-warning)':'var(--rs-muted)',marginTop:'3px' }}>Sugerido: {workout.suggested_day || 'sem dia'}{reorganized?' · reorganizado pela atleta':''}</p></div><span className={`badge ${done?'badge-success':skipped?'badge-warning':'badge-muted'}`}>{done?'Concluído':skipped?'Não realizado':'Pendente'}</span></div>
    {workout.notes && <p style={{ margin:'7px 0 0 26px',fontSize:'12px',color:'var(--rs-muted)' }}>{workout.notes}</p>}
    {skipped && <p style={{ margin:'5px 0 0 26px',fontSize:'12px',color:'var(--rs-warning)' }}>{workout.skip_reason || 'Sem motivo informado'}</p>}
    <ImageStrip images={images} />
  </article>
}

function CoachActivity({ activity, images, divider }: { activity:AthleteActivity; images:string[]; divider:boolean }) {
  return <article style={{ padding:'10px 0',borderBottom:divider?'1px solid var(--rs-border)':'none' }}><div style={{ display:'flex',gap:'8px' }}><Footprints size={18} color="#4db8ff"/><div><strong style={{ fontSize:'14px' }}>{activity.title}</strong><p style={{ fontSize:'10px',color:'#4db8ff',marginTop:'3px' }}>Atividade livre · {ACTIVITY_LABELS[activity.activity_type]}</p><p style={{ fontSize:'11px',color:'var(--rs-muted)',marginTop:'4px' }}>{[activity.duration_minutes&&`${activity.duration_minutes} min`,activity.distance_km&&`${activity.distance_km} km`,activity.effort].filter(Boolean).join(' · ')}</p>{activity.notes&&<p style={{ fontSize:'12px',color:'var(--rs-muted)',marginTop:'5px' }}>{activity.notes}</p>}</div></div><ImageStrip images={images}/></article>
}

function ImageStrip({ images }: { images:string[] }) {
  if (!images.length) return null
  return <div style={{ display:'flex',gap:'7px',overflowX:'auto',margin:'8px 0 0 26px' }}>{images.map(src => <a href={src} target="_blank" rel="noreferrer" key={src}><img src={src} alt="Comprovante" style={{ width:'78px',height:'78px',objectFit:'cover',borderRadius:'8px' }}/></a>)}<span title="Imagens privadas"><ImageIcon size={13} color="var(--rs-muted)"/></span></div>
}
