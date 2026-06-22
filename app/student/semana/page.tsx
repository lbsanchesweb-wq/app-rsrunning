'use client'

import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import Link from 'next/link'
import { createClient, type AthleteActivity, type AthleteActivityType, type Week, type WeekDayPlan, type Workout } from '@/lib/supabase'
import { weekDates } from '@/lib/week-schedule'
import { Home, Calendar, BarChart2, CreditCard, User, CheckCircle2, Circle, Clock, Footprints, XCircle, Plus, Bed, Move, ChevronUp, ChevronDown, Pencil, Trash2, X } from 'lucide-react'

type DayEntry =
  | { kind: 'workout'; id: string; order: number; workout: Workout }
  | { kind: 'activity'; id: string; order: number; activity: AthleteActivity }

type MoveTarget = { kind: DayEntry['kind']; id: string; title: string; currentDate?: string }

const ACTIVITY_LABELS: Record<AthleteActivityType, string> = {
  corrida: 'Corrida', caminhada: 'Caminhada', bicicleta: 'Bicicleta', musculacao: 'Musculação',
  natacao: 'Natação', mobilidade: 'Mobilidade', outro: 'Outra atividade',
}

const WORKOUT_LABELS: Record<string, string> = {
  rodagem_leve: 'Base', rodagem_moderada: 'Base', fartlek: 'Fartlek', tiros: 'Intervalado',
  longao: 'Longo', rampa: 'Rampa', regenerativo: 'Regenerativo', prova: 'Prova', ritmado: 'Ritmado', desafio: 'Desafio',
}

export default function SemanaPage() {
  const [week, setWeek] = useState<Week | null>(null)
  const [plans, setPlans] = useState<WeekDayPlan[]>([])
  const [activities, setActivities] = useState<AthleteActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')
  const [moveTarget, setMoveTarget] = useState<MoveTarget | null>(null)
  const [moveDate, setMoveDate] = useState('')
  const [movePosition, setMovePosition] = useState('1')
  const [activityOpen, setActivityOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<AthleteActivity | null>(null)
  const [activityDate, setActivityDate] = useState('')
  const [activityType, setActivityType] = useState<AthleteActivityType>('corrida')
  const [activityTitle, setActivityTitle] = useState('')
  const [activityDuration, setActivityDuration] = useState('')
  const [activityDistance, setActivityDistance] = useState('')
  const [activityEffort, setActivityEffort] = useState('moderado')
  const [activityNotes, setActivityNotes] = useState('')
  const [activityFiles, setActivityFiles] = useState<File[]>([])
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: weeks } = await supabase.from('weeks').select('*, workouts(*)').eq('student_id', user.id).eq('status', 'published').order('date_start', { ascending: false }).limit(1)
    const currentWeek = weeks?.[0] || null
    setWeek(currentWeek)
    if (currentWeek) {
      const [{ data: dayPlans }, { data: extraActivities }] = await Promise.all([
        supabase.from('week_day_plans').select('*').eq('week_id', currentWeek.id),
        supabase.from('athlete_activities').select('*').eq('week_id', currentWeek.id).order('display_order'),
      ])
      setPlans(dayPlans || [])
      setActivities(extraActivities || [])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const days = useMemo(() => week ? weekDates(week.date_start) : [], [week])
  const workouts = useMemo(() => (week?.workouts as Workout[] | undefined) || [], [week])
  const unscheduled = workouts.filter(workout => !workout.scheduled_date).sort((a, b) => a.order_num - b.order_num)
  const done = workouts.filter(workout => workout.status === 'done').length
  const completion = workouts.length ? Math.round((done / workouts.length) * 100) : 0

  function entriesForDate(date: string): DayEntry[] {
    return [
      ...workouts.filter(workout => workout.scheduled_date === date).map(workout => ({ kind: 'workout' as const, id: workout.id, order: workout.scheduled_order || workout.order_num, workout })),
      ...activities.filter(activity => activity.activity_date === date).map(activity => ({ kind: 'activity' as const, id: activity.id, order: activity.display_order || 1, activity })),
    ].sort((a, b) => a.order - b.order)
  }

  function showNotice(message: string) {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 3500)
  }

  function openMove(entry: DayEntry) {
    const currentDate = entry.kind === 'workout' ? entry.workout.scheduled_date : entry.activity.activity_date
    setMoveTarget({ kind: entry.kind, id: entry.id, title: entry.kind === 'workout' ? entry.workout.title : entry.activity.title, currentDate })
    setMoveDate(currentDate || days[0]?.date || '')
    setMovePosition(String(Math.max(1, entriesForDate(currentDate || days[0]?.date || '').findIndex(item => item.id === entry.id) + 1)))
  }

  async function updateEntry(entry: DayEntry, date: string, order: number) {
    if (entry.kind === 'workout') {
      return supabase.from('workouts').update({ scheduled_date: date, scheduled_order: order, schedule_updated_at: new Date().toISOString() }).eq('id', entry.id)
    }
    return supabase.from('athlete_activities').update({ activity_date: date, display_order: order }).eq('id', entry.id)
  }

  async function applyOrder(date: string, entries: DayEntry[]) {
    await Promise.all(entries.map((entry, index) => updateEntry(entry, date, index + 1)))
  }

  async function saveMove() {
    if (!moveTarget || !moveDate) return
    setSaving(true)
    const sourceEntries = moveTarget.currentDate ? entriesForDate(moveTarget.currentDate).filter(entry => !(entry.kind === moveTarget.kind && entry.id === moveTarget.id)) : []
    const targetEntries = entriesForDate(moveDate).filter(entry => !(entry.kind === moveTarget.kind && entry.id === moveTarget.id))
    const movingEntry: DayEntry | undefined = moveTarget.kind === 'workout'
      ? workouts.find(workout => workout.id === moveTarget.id) && { kind:'workout', id:moveTarget.id, order:1, workout:workouts.find(workout => workout.id === moveTarget.id)! }
      : activities.find(activity => activity.id === moveTarget.id) && { kind:'activity', id:moveTarget.id, order:1, activity:activities.find(activity => activity.id === moveTarget.id)! }
    if (!movingEntry) { setSaving(false); return }

    const position = Math.min(Math.max(Number(movePosition) || 1, 1), targetEntries.length + 1)
    targetEntries.splice(position - 1, 0, movingEntry)
    const { error } = await updateEntry(movingEntry, moveDate, position)
    if (!error) {
      await Promise.all([
        applyOrder(moveDate, targetEntries),
        moveTarget.currentDate && moveTarget.currentDate !== moveDate ? applyOrder(moveTarget.currentDate, sourceEntries) : Promise.resolve(),
        supabase.from('week_day_plans').delete().eq('week_id', week!.id).eq('plan_date', moveDate),
      ])
      setMoveTarget(null)
      await load()
      showNotice('Agenda atualizada.')
    } else showNotice(error.message)
    setSaving(false)
  }

  async function shiftEntry(date: string, entry: DayEntry, direction: -1 | 1) {
    const entries = entriesForDate(date)
    const current = entries.findIndex(item => item.kind === entry.kind && item.id === entry.id)
    const target = current + direction
    if (current < 0 || target < 0 || target >= entries.length) return
    ;[entries[current], entries[target]] = [entries[target], entries[current]]
    await applyOrder(date, entries)
    await load()
  }

  async function toggleRest(date: string) {
    if (!week) return
    const plan = plans.find(item => item.plan_date === date)
    if (!plan?.is_rest && entriesForDate(date).length) {
      showNotice('Mova ou remova as atividades antes de definir descanso.')
      return
    }
    if (plan?.is_rest) await supabase.from('week_day_plans').delete().eq('id', plan.id)
    else await supabase.from('week_day_plans').upsert({ week_id: week.id, student_id: week.student_id, plan_date: date, is_rest: true }, { onConflict: 'week_id,plan_date' })
    await load()
  }

  function resetActivityForm(date = '') {
    setEditingActivity(null)
    setActivityDate(date)
    setActivityType('corrida')
    setActivityTitle('')
    setActivityDuration('')
    setActivityDistance('')
    setActivityEffort('moderado')
    setActivityNotes('')
    setActivityFiles([])
  }

  function openNewActivity(date: string) {
    resetActivityForm(date)
    setActivityOpen(true)
  }

  function openEditActivity(activity: AthleteActivity) {
    setEditingActivity(activity)
    setActivityDate(activity.activity_date)
    setActivityType(activity.activity_type)
    setActivityTitle(activity.title)
    setActivityDuration(activity.duration_minutes ? String(activity.duration_minutes) : '')
    setActivityDistance(activity.distance_km ? String(activity.distance_km) : '')
    setActivityEffort(activity.effort || 'moderado')
    setActivityNotes(activity.notes || '')
    setActivityFiles([])
    setActivityOpen(true)
  }

  async function saveActivity() {
    if (!week || !activityTitle.trim() || !activityDate) return
    setSaving(true)
    const payload = {
      week_id: week.id, student_id: week.student_id, activity_date: activityDate, activity_type: activityType,
      title: activityTitle.trim(), duration_minutes: activityDuration ? Number(activityDuration) : null,
      distance_km: activityDistance ? Number(activityDistance) : null, effort: activityEffort,
      notes: activityNotes || null, display_order: editingActivity?.display_order || entriesForDate(activityDate).length + 1,
    }
    const query = editingActivity
      ? supabase.from('athlete_activities').update(payload).eq('id', editingActivity.id)
      : supabase.from('athlete_activities').insert(payload)
    const { data, error } = await query.select().single()
    if (error || !data) { showNotice(error?.message || 'Não foi possível salvar.'); setSaving(false); return }

    const imagePaths = [...(editingActivity?.result_images || [])]
    for (const [index, file] of activityFiles.entries()) {
      const safeName = file.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9._-]/g, '-')
      const path = `${week.student_id}/${data.id}/${Date.now()}-${index}-${safeName}`
      const { error: uploadError } = await supabase.storage.from('activity-results').upload(path, file)
      if (!uploadError) imagePaths.push(path)
    }
    if (imagePaths.length) await supabase.from('athlete_activities').update({ result_images: imagePaths }).eq('id', data.id)
    await supabase.from('week_day_plans').delete().eq('week_id', week.id).eq('plan_date', activityDate)
    setActivityOpen(false)
    resetActivityForm()
    await load()
    showNotice(editingActivity ? 'Atividade atualizada.' : 'Atividade registrada.')
    setSaving(false)
  }

  async function deleteActivity(activity: AthleteActivity) {
    if (!window.confirm(`Excluir "${activity.title}"?`)) return
    if (activity.result_images?.length) await supabase.storage.from('activity-results').remove(activity.result_images)
    await supabase.from('athlete_activities').delete().eq('id', activity.id)
    await load()
  }

  if (loading) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100dvh',color:'var(--rs-neon)' }}>Carregando...</div>

  return (
    <>
      <div className="topbar">
        <div style={{ display:'flex',alignItems:'center',gap:'8px' }}><div className="rs-brand-mark">RS</div><strong>Minha semana</strong></div>
        {week && <span className="badge badge-neon">{completion}%</span>}
      </div>
      <main className="page fade-up" style={{ paddingBottom:'96px' }}>
        {notice && <div className="card" style={{ marginBottom:'10px',borderColor:'var(--rs-neon)',color:'var(--rs-neon)',fontSize:'13px' }}>{notice}</div>}
        {!week ? <div className="card" style={{ textAlign:'center',padding:'32px' }}><Calendar size={36} color="var(--rs-muted)" /><h2 style={{ marginTop:'10px' }}>Sem semana publicada</h2></div> : (
          <>
            <section className="card" style={{ marginBottom:'12px',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
              <div><p className="label-neon">{week.label}</p><p style={{ fontSize:'12px',color:'var(--rs-muted)',marginTop:'3px' }}>{done}/{workouts.length} prescritos concluídos</p></div>
              <div style={{ fontSize:'22px',fontWeight:800,color:'var(--rs-neon)' }}>{completion}%</div>
            </section>

            {unscheduled.length > 0 && <section className="card" style={{ marginBottom:'12px',borderColor:'var(--rs-warning)' }}>
              <p style={{ fontSize:'12px',fontWeight:700,color:'var(--rs-warning)',marginBottom:'8px' }}>A organizar</p>
              {unscheduled.map(workout => <div key={workout.id} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 0',borderTop:'1px solid var(--rs-border)' }}><span style={{ fontSize:'13px' }}>{workout.title}</span><button className="btn-ghost" onClick={() => openMove({ kind:'workout',id:workout.id,order:workout.order_num,workout })}><Move size={14} /> Mover</button></div>)}
            </section>}

            <div style={{ display:'grid',gap:'10px' }}>
              {days.map(day => {
                const entries = entriesForDate(day.date)
                const isRest = plans.some(plan => plan.plan_date === day.date && plan.is_rest)
                return <section key={day.date} className="card" style={{ padding:'0',overflow:'hidden',borderColor:isRest ? '#4db8ff66' : 'var(--rs-border)' }}>
                  <header style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 14px',background:'var(--rs-card2)' }}>
                    <div style={{ display:'flex',alignItems:'baseline',gap:'7px' }}><strong>{day.label}</strong><span style={{ fontSize:'12px',color:'var(--rs-muted)' }}>{String(day.day).padStart(2,'0')}/{String(day.month).padStart(2,'0')}</span></div>
                    <div style={{ display:'flex',gap:'6px' }}>
                      <button className="btn-ghost" onClick={() => openNewActivity(day.date)} title="Adicionar atividade" style={{ padding:'6px 8px' }}><Plus size={15} /></button>
                      <button className="btn-ghost" onClick={() => toggleRest(day.date)} title={isRest ? 'Desfazer descanso' : 'Definir descanso'} style={{ padding:'6px 8px',color:isRest?'#4db8ff':undefined }}><Bed size={15} /></button>
                    </div>
                  </header>
                  <div style={{ padding:'10px 14px' }}>
                    {isRest ? <div style={{ color:'#4db8ff',fontSize:'13px',display:'flex',alignItems:'center',gap:'7px',padding:'8px 0' }}><Bed size={17} /> Descanso planejado</div>
                      : entries.length === 0 ? <p style={{ color:'var(--rs-muted)',fontSize:'13px',padding:'8px 0' }}>Dia livre</p>
                      : entries.map((entry, index) => <DayEntryCard key={`${entry.kind}-${entry.id}`} entry={entry} index={index} total={entries.length} onMove={() => openMove(entry)} onUp={() => shiftEntry(day.date, entry, -1)} onDown={() => shiftEntry(day.date, entry, 1)} onEdit={entry.kind === 'activity' ? () => openEditActivity(entry.activity) : undefined} onDelete={entry.kind === 'activity' ? () => deleteActivity(entry.activity) : undefined} />)}
                  </div>
                </section>
              })}
            </div>
          </>
        )}
      </main>

      {moveTarget && <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="premium-modal" style={{ maxWidth:'420px' }}>
        <button onClick={() => setMoveTarget(null)} aria-label="Fechar" style={{ float:'right',background:'none',border:0,color:'white' }}><X /></button>
        <h2 style={{ fontSize:'18px',marginBottom:'4px' }}>Mover na agenda</h2><p style={{ color:'var(--rs-muted)',fontSize:'13px',marginBottom:'14px' }}>{moveTarget.title}</p>
        <label style={{ fontSize:'12px',color:'var(--rs-muted)' }}>Dia</label><select value={moveDate} onChange={event => { setMoveDate(event.target.value); setMovePosition('1') }} style={{ margin:'6px 0 12px' }}>{days.map(day => <option key={day.date} value={day.date}>{day.label} - {day.day}/{day.month}</option>)}</select>
        <label style={{ fontSize:'12px',color:'var(--rs-muted)' }}>Posição no dia</label><select value={movePosition} onChange={event => setMovePosition(event.target.value)} style={{ margin:'6px 0 14px' }}>{Array.from({ length: entriesForDate(moveDate).filter(entry => !(entry.kind === moveTarget.kind && entry.id === moveTarget.id)).length + 1 }, (_, index) => <option key={index+1} value={index+1}>{index+1}ª posição</option>)}</select>
        <button className="btn-primary" onClick={saveMove} disabled={saving}>{saving ? 'Salvando...' : 'Confirmar mudança'}</button>
      </div></div>}

      {activityOpen && <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="premium-modal" style={{ maxWidth:'440px',maxHeight:'88dvh',overflowY:'auto' }}>
        <button onClick={() => setActivityOpen(false)} aria-label="Fechar" style={{ float:'right',background:'none',border:0,color:'white' }}><X /></button>
        <h2 style={{ fontSize:'18px',marginBottom:'14px' }}>{editingActivity ? 'Editar atividade' : 'Atividade no dia livre'}</h2>
        <div style={{ display:'grid',gap:'10px' }}>
          <select value={activityDate} onChange={event => setActivityDate(event.target.value)}>{days.map(day => <option key={day.date} value={day.date}>{day.label} - {day.day}/{day.month}</option>)}</select>
          <select value={activityType} onChange={event => setActivityType(event.target.value as AthleteActivityType)}>{Object.entries(ACTIVITY_LABELS).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select>
          <input value={activityTitle} onChange={event => setActivityTitle(event.target.value)} placeholder="Nome da atividade" />
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px' }}><input type="number" min="0" value={activityDuration} onChange={event => setActivityDuration(event.target.value)} placeholder="Minutos" /><input type="number" min="0" step="0.1" value={activityDistance} onChange={event => setActivityDistance(event.target.value)} placeholder="Distância (km)" /></div>
          <select value={activityEffort} onChange={event => setActivityEffort(event.target.value)}><option value="leve">Esforço leve</option><option value="moderado">Esforço moderado</option><option value="forte">Esforço forte</option><option value="maximo">Esforço máximo</option></select>
          <textarea value={activityNotes} onChange={event => setActivityNotes(event.target.value)} placeholder="Observação (opcional)" rows={3} />
          <input type="file" accept="image/*" multiple onChange={(event:ChangeEvent<HTMLInputElement>) => setActivityFiles(Array.from(event.target.files || []).slice(0,4))} />
          <button className="btn-primary" onClick={saveActivity} disabled={saving || !activityTitle.trim()}>{saving ? 'Salvando...' : 'Salvar atividade'}</button>
        </div>
      </div></div>}

      <nav className="tabbar">{[
        { href:'/student',icon:<Home size={22}/>,label:'Início' }, { href:'/student/semana',icon:<Calendar size={22}/>,label:'Semana',active:true },
        { href:'/student/evolucao',icon:<BarChart2 size={22}/>,label:'Evolução' }, { href:'/student/mensalidade',icon:<CreditCard size={22}/>,label:'Mensalidade' }, { href:'/student/profile',icon:<User size={22}/>,label:'Perfil' },
      ].map(tab => <Link key={tab.href} href={tab.href} className={`tab-item${tab.active?' active':''}`}>{tab.icon}<span>{tab.label}</span></Link>)}</nav>
    </>
  )
}

function DayEntryCard({ entry, index, total, onMove, onUp, onDown, onEdit, onDelete }: { entry:DayEntry; index:number; total:number; onMove:()=>void; onUp:()=>void; onDown:()=>void; onEdit?:()=>void; onDelete?:()=>void }) {
  const workout = entry.kind === 'workout' ? entry.workout : null
  const activity = entry.kind === 'activity' ? entry.activity : null
  return <article style={{ padding:'11px 0',borderBottom:index < total-1?'1px solid var(--rs-border)':'none' }}>
    <div style={{ display:'flex',alignItems:'flex-start',gap:'9px' }}>
      {workout ? workout.status === 'done' ? <CheckCircle2 size={18} color="var(--rs-neon)" /> : workout.status === 'skipped' ? <XCircle size={18} color="var(--rs-warning)" /> : <Circle size={18} color="var(--rs-muted)" /> : <Footprints size={18} color="#4db8ff" />}
      <div style={{ flex:1,minWidth:0 }}>
        <div style={{ display:'flex',gap:'6px',alignItems:'center',flexWrap:'wrap' }}><strong style={{ fontSize:'14px' }}>{workout?.title || activity?.title}</strong><span className="badge badge-muted" style={{ fontSize:'9px' }}>{workout ? WORKOUT_LABELS[workout.type] || workout.type : ACTIVITY_LABELS[activity!.activity_type]}</span></div>
        {workout?.suggested_day && <p style={{ fontSize:'10px',color:'var(--rs-muted)',marginTop:'3px' }}>Sugerido pelo treinador: {workout.suggested_day}</p>}
        <p style={{ fontSize:'11px',color:'var(--rs-muted)',marginTop:'3px' }}>{workout ? [workout.planned_km && `${workout.planned_km} km`,workout.planned_pace].filter(Boolean).join(' · ') : [activity?.duration_minutes && `${activity.duration_minutes} min`,activity?.distance_km && `${activity.distance_km} km`,activity?.effort,activity?.result_images?.length && `${activity.result_images.length} foto(s)`].filter(Boolean).join(' · ')}</p>
      </div>
    </div>
    <div style={{ display:'flex',gap:'5px',marginTop:'8px',marginLeft:'27px',flexWrap:'wrap' }}>
      <button className="btn-ghost" onClick={onMove} style={{ padding:'5px 8px',fontSize:'11px' }}><Move size={12} /> Mover</button>
      <button className="btn-ghost" onClick={onUp} disabled={index===0} style={{ padding:'5px 7px' }} title="Subir"><ChevronUp size={13} /></button>
      <button className="btn-ghost" onClick={onDown} disabled={index===total-1} style={{ padding:'5px 7px' }} title="Descer"><ChevronDown size={13} /></button>
      {onEdit && <button className="btn-ghost" onClick={onEdit} style={{ padding:'5px 7px' }} title="Editar"><Pencil size={13} /></button>}
      {onDelete && <button className="btn-ghost" onClick={onDelete} style={{ padding:'5px 7px',color:'var(--rs-danger)' }} title="Excluir"><Trash2 size={13} /></button>}
    </div>
  </article>
}
