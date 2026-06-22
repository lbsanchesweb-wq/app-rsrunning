'use client'
import { useEffect, useState, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient, type Profile, type Student, type Week, type Workout } from '@/lib/supabase'
import { Home, Calendar, BarChart2, CreditCard, User, MessageCircle, CheckCircle2, Clock, Footprints, XCircle, Image as ImageIcon } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type ActionMode = 'complete' | 'skip' | null

export default function StudentPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [student, setStudent] = useState<Student | null>(null)
  const [week, setWeek] = useState<Week | null>(null)
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)
  const [actionMode, setActionMode] = useState<ActionMode>(null)
  const [resultFiles, setResultFiles] = useState<File[]>([])
  const [signedImages, setSignedImages] = useState<Record<string, string[]>>({})
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feeling, setFeeling] = useState('')
  const [actualKm, setActualKm] = useState('')
  const [notes, setNotes] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const [{ data: prof }, { data: stud }, { data: msgs }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('students').select('*').eq('id', user.id).single(),
      supabase.from('messages').select('id').eq('to_id', user.id).eq('read', false),
    ])

    setProfile(prof)
    setStudent(stud)
    setUnread(msgs?.length || 0)

    const { data: weeks } = await supabase
      .from('weeks')
      .select('*, workouts(*)')
      .eq('student_id', user.id)
      .eq('status', 'published')
      .order('date_start', { ascending: false })
      .limit(1)

    if (weeks?.[0]) {
      setWeek(weeks[0])
      await loadSignedImages(weeks[0].workouts || [])
    }
    setLoading(false)
  }

  async function loadSignedImages(workouts: Workout[]) {
    const entries = await Promise.all(workouts.map(async (workout) => {
      const paths = workout.result_images || []
      if (!paths.length) return [workout.id, []] as const
      const urls = await Promise.all(paths.map(async (path) => {
        const { data } = await supabase.storage.from('workout-results').createSignedUrl(path, 60 * 60)
        return data?.signedUrl || ''
      }))
      return [workout.id, urls.filter(Boolean)] as const
    }))
    setSignedImages(Object.fromEntries(entries))
  }

  function openAction(workout: Workout, mode: ActionMode) {
    setSelectedWorkout(workout)
    setActionMode(mode)
    setFeeling('')
    setActualKm('')
    setNotes('')
    setResultFiles([])
  }

  function closeAction() {
    setSelectedWorkout(null)
    setActionMode(null)
    setResultFiles([])
    setNotes('')
  }

  function onFilesChange(event: ChangeEvent<HTMLInputElement>) {
    setResultFiles(Array.from(event.target.files || []).slice(0, 4))
  }

  async function uploadResultImages(workout: Workout) {
    if (!profile || resultFiles.length === 0) return []

    const uploadedPaths: string[] = []
    for (const [index, file] of resultFiles.entries()) {
      const safeName = file.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9._-]/g, '-')
      const path = `${profile.id}/${workout.id}/${Date.now()}-${index}-${safeName}`
      const { error } = await supabase.storage.from('workout-results').upload(path, file, { upsert: true })
      if (error) throw error
      uploadedPaths.push(path)
    }
    return uploadedPaths
  }

  async function markDone() {
    if (!selectedWorkout || !profile) return
    setSaving(true)
    try {
      const uploadedPaths = await uploadResultImages(selectedWorkout)
      const actualKmNumber = actualKm ? parseFloat(actualKm) : null
      await supabase.from('workouts').update({
        status: 'done',
        done_at: new Date().toISOString(),
        feeling: feeling || null,
        actual_km: actualKmNumber,
        notes: notes || null,
        skip_reason: null,
        result_images: [...(selectedWorkout.result_images || []), ...uploadedPaths],
      }).eq('id', selectedWorkout.id)

      if (selectedWorkout.status !== 'done') {
        await supabase.from('students').update({
          total_workouts: (student?.total_workouts || 0) + 1,
          total_km: (student?.total_km || 0) + (actualKmNumber || selectedWorkout.planned_km || 0),
        }).eq('id', profile.id)
      }

      closeAction()
      await loadData()
    } finally {
      setSaving(false)
    }
  }

  async function markSkipped() {
    if (!selectedWorkout) return
    setSaving(true)
    try {
      await supabase.from('workouts').update({
        status: 'skipped',
        skip_reason: notes || null,
        notes: notes || null,
      }).eq('id', selectedWorkout.id)
      closeAction()
      await loadData()
    } finally {
      setSaving(false)
    }
  }

  const workouts = week?.workouts ? [...(week.workouts as Workout[])].sort((a, b) => a.order_num - b.order_num) : []
  const pendingWorkouts = workouts.filter((workout) => workout.status !== 'done' && workout.status !== 'skipped')
  const skippedWorkouts = workouts.filter((workout) => workout.status === 'skipped')
  const weekDone = workouts.filter((w) => w.status === 'done').length
  const weekTotal = workouts.length
  const pct = weekTotal > 0 ? Math.round((weekDone / weekTotal) * 100) : 0
  const today = format(new Date(), 'EEEE', { locale: ptBR }).toLowerCase()
  const suggestedWorkout = pendingWorkouts.find((workout) =>
    workout.suggested_day?.toLowerCase().includes(today.slice(0, 3))
  ) || pendingWorkouts[0] || null

  const typeLabel: Record<string, string> = {
    rodagem_leve: 'Base',
    rodagem_moderada: 'Base',
    fartlek: 'Fartlek',
    tiros: 'Intervalado',
    longao: 'Longo',
    rampa: 'Rampa',
    regenerativo: 'Regenerativo',
    prova: 'Prova',
    ritmado: 'Ritmado',
    desafio: 'Desafio',
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh' }}>
      <div style={{ color: 'var(--rs-neon)', fontSize: '14px' }}>Carregando...</div>
    </div>
  )

  return (
    <>
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ background: 'var(--rs-neon)', color: '#000', fontWeight: 800, fontSize: '14px', padding: '4px 8px', borderRadius: '6px' }}>RS</div>
          <span style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '1px' }}>Running</span>
        </div>
        <Link href="/student/mensagens" style={{ position: 'relative', color: 'var(--rs-muted)' }}>
          <MessageCircle size={22} />
          {unread > 0 && <span style={{ position: 'absolute', top: -4, right: -4, background: 'var(--rs-neon)', color: '#000', fontSize: '9px', fontWeight: 800, borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unread}</span>}
        </Link>
      </div>

      <div className="page fade-up">
        <div className="card" style={{ marginBottom: '12px', background: 'linear-gradient(135deg, #1a1a00 0%, #141414 100%)', borderColor: '#c8f00033' }}>
          <p className="label-neon" style={{ marginBottom: '4px' }}>Bom treino, {profile?.name?.split(' ')[0]}</p>
          <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '4px' }}>Meu painel</h1>
          <p style={{ fontSize: '13px', color: 'var(--rs-muted)', marginBottom: '16px' }}>
            {week ? `Semana ${week.label}` : 'Aguardando treinos do professor'}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '14px' }}>
            <div style={{ background: 'var(--rs-card2)', borderRadius: '10px', padding: '10px 12px' }}>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--rs-neon)' }}>{weekDone}/{weekTotal}</div>
              <div style={{ fontSize: '11px', color: 'var(--rs-muted)' }}>Concluidos</div>
            </div>
            <div style={{ background: 'var(--rs-card2)', borderRadius: '10px', padding: '10px 12px' }}>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--rs-warning)' }}>{skippedWorkouts.length}</div>
              <div style={{ fontSize: '11px', color: 'var(--rs-muted)' }}>Nao realizados</div>
            </div>
            <div style={{ background: 'var(--rs-card2)', borderRadius: '10px', padding: '10px 12px' }}>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--rs-neon)' }}>{student?.streak_days || 0}d</div>
              <div style={{ fontSize: '11px', color: 'var(--rs-muted)' }}>Sequencia</div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--rs-muted)' }}>Progresso semanal</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--rs-neon)' }}>{pct}%</span>
          </div>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
        </div>

        {suggestedWorkout && !actionMode && (
          <WorkoutCard
            workout={suggestedWorkout}
            index={workouts.findIndex((workout) => workout.id === suggestedWorkout.id)}
            label="Proximo sugerido"
            typeLabel={typeLabel}
            signedImages={signedImages[suggestedWorkout.id] || []}
            onComplete={() => openAction(suggestedWorkout, 'complete')}
            onSkip={() => openAction(suggestedWorkout, 'skip')}
          />
        )}

        {actionMode && selectedWorkout && (
          <div className="card" style={{ marginBottom: '12px', borderColor: actionMode === 'complete' ? 'var(--rs-neon)44' : 'var(--rs-warning)' }}>
            <p className="label-neon" style={{ marginBottom: '12px' }}>{actionMode === 'complete' ? 'Registrar treino' : 'Marcar como nao realizado'}</p>
            <p style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px' }}>{selectedWorkout.title}</p>

            {actionMode === 'complete' && (
              <>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--rs-muted)', marginBottom: '6px', display: 'block' }}>Distancia realizada (km)</label>
                  <input type="number" step="0.1" value={actualKm} onChange={e => setActualKm(e.target.value)} placeholder={`Planejado: ${selectedWorkout.planned_km || '-'} km`} />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--rs-muted)', marginBottom: '8px', display: 'block' }}>Como foi?</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[['facil','Facil'],['ok','Ok'],['dificil','Dificil'],['muito_dificil','Pesado']].map(([key, label]) => (
                      <button key={key} className={`feeling-btn${feeling === key ? ' selected' : ''}`} onClick={() => setFeeling(key)}>{label}</button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--rs-muted)', marginBottom: '6px', display: 'block' }}>Imagens do resultado (opcional)</label>
                  <input type="file" accept="image/*" multiple onChange={onFilesChange} />
                  {resultFiles.length > 0 && <p style={{ fontSize: '12px', color: 'var(--rs-muted)', marginTop: '6px' }}>{resultFiles.length} imagem(ns) selecionada(s)</p>}
                </div>
              </>
            )}

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12px', color: 'var(--rs-muted)', marginBottom: '6px', display: 'block' }}>{actionMode === 'skip' ? 'Motivo (opcional)' : 'Observacao (opcional)'}</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder={actionMode === 'skip' ? 'Ex: dor, viagem, chuva forte, falta de tempo...' : 'Como foi o treino? Algo diferente?'} rows={2} style={{ resize: 'none' }} />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn-ghost" onClick={closeAction} style={{ flex: 1 }}>Cancelar</button>
              <button className="btn-primary" onClick={actionMode === 'complete' ? markDone : markSkipped} disabled={saving} style={{ flex: 2 }}>
                {saving ? 'Salvando...' : actionMode === 'complete' ? 'Confirmar treino' : 'Confirmar nao realizado'}
              </button>
            </div>
          </div>
        )}

        {week && workouts.length > 0 && (
          <div style={{ display: 'grid', gap: '10px' }}>
            <p style={{ fontSize: '11px', color: 'var(--rs-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Treinos da semana - ordem sugerida, execucao livre</p>
            {workouts.map((workout, index) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                index={index}
                label={workout.id === suggestedWorkout?.id ? 'Sugerido agora' : undefined}
                typeLabel={typeLabel}
                signedImages={signedImages[workout.id] || []}
                onComplete={() => openAction(workout, 'complete')}
                onSkip={() => openAction(workout, 'skip')}
              />
            ))}
          </div>
        )}

        {!week && (
          <div className="card" style={{ marginBottom: '12px', textAlign: 'center', padding: '24px' }}>
            <Calendar size={32} color="var(--rs-muted)" style={{ marginBottom: '8px' }} />
            <p style={{ fontWeight: 700, marginBottom: '4px' }}>Sem treinos ainda</p>
            <p style={{ fontSize: '13px', color: 'var(--rs-muted)' }}>O professor Rui vai publicar sua semana em breve.</p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {[
            { href: '/student/semana', label: 'Ver semana', sub: 'Cronograma completo', icon: <Calendar size={20} color="var(--rs-neon)" /> },
            { href: '/student/evolucao', label: 'Evolucao', sub: 'Graficos e historico', icon: <BarChart2 size={20} color="var(--rs-neon)" /> },
          ].map(item => (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '6px', cursor: 'pointer' }}>
                {item.icon}
                <div style={{ fontWeight: 700, fontSize: '14px' }}>{item.label}</div>
                <div style={{ fontSize: '12px', color: 'var(--rs-muted)' }}>{item.sub}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <nav className="tabbar">
        {[
          { href: '/student', icon: <Home size={22} />, label: 'Inicio', active: true },
          { href: '/student/semana', icon: <Calendar size={22} />, label: 'Semana' },
          { href: '/student/evolucao', icon: <BarChart2 size={22} />, label: 'Evolucao' },
          { href: '/student/mensalidade', icon: <CreditCard size={22} />, label: 'Mensalidade' },
          { href: '/student/profile', icon: <User size={22} />, label: 'Perfil' },
        ].map(tab => (
          <Link key={tab.href} href={tab.href} className={`tab-item${tab.active ? ' active' : ''}`}>{tab.icon}<span>{tab.label}</span></Link>
        ))}
      </nav>
    </>
  )
}

function WorkoutCard({
  workout,
  index,
  label,
  typeLabel,
  signedImages,
  onComplete,
  onSkip,
}: {
  workout: Workout
  index: number
  label?: string
  typeLabel: Record<string, string>
  signedImages: string[]
  onComplete: () => void
  onSkip: () => void
}) {
  const isDone = workout.status === 'done'
  const isSkipped = workout.status === 'skipped'
  const statusLabel = isDone ? 'Concluido' : isSkipped ? 'Nao realizado' : 'Pendente'

  return (
    <div className="card" style={{ marginBottom: '12px', opacity: isSkipped ? 0.72 : 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '10px' }}>
        <div>
          <p style={{ fontSize: '11px', color: 'var(--rs-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>
            {label || `Treino ${index + 1}`} {workout.suggested_day ? `- ${workout.suggested_day}` : ''}
          </p>
          <h2 style={{ fontSize: '18px', fontWeight: 800 }}>{workout.title}</h2>
        </div>
        <span className="badge badge-muted">{typeLabel[workout.type] || workout.type}</span>
      </div>
      {workout.description && <p style={{ fontSize: '13px', color: 'var(--rs-muted)', marginBottom: '12px' }}>{workout.description}</p>}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
        {workout.planned_km && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'var(--rs-card2)', borderRadius: '20px', padding: '5px 10px', fontSize: '12px' }}>
            <Footprints size={13} color="var(--rs-neon)" />{workout.planned_km} km
          </div>
        )}
        {workout.planned_pace && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'var(--rs-card2)', borderRadius: '20px', padding: '5px 10px', fontSize: '12px' }}>
            <Clock size={13} color="var(--rs-neon)" />{workout.planned_pace}
          </div>
        )}
        <span className={`badge ${isDone ? 'badge-success' : isSkipped ? 'badge-warning' : 'badge-muted'}`}>{statusLabel}</span>
      </div>

      {isDone && (
        <div style={{ marginBottom: '12px', background: 'var(--rs-card2)', borderRadius: '14px', padding: '10px' }}>
          <p style={{ fontSize: '12px', color: 'var(--rs-neon)', marginBottom: '4px' }}>Resultado registrado</p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', fontSize: '12px', color: '#ccc' }}>
            {workout.actual_km && <span>{workout.actual_km} km</span>}
            {workout.feeling && <span>Sensacao: {workout.feeling.replace('_', ' ')}</span>}
          </div>
          {workout.notes && <p style={{ fontSize: '12px', color: 'var(--rs-muted)', marginTop: '6px' }}>{workout.notes}</p>}
          {signedImages.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', overflowX: 'auto' }}>
              {signedImages.map((src) => <img key={src} src={src} alt="Comprovante do treino" style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '12px', border: '1px solid var(--rs-border)' }} />)}
            </div>
          )}
        </div>
      )}

      {isSkipped && (
        <div style={{ marginBottom: '12px', background: 'var(--rs-card2)', borderRadius: '14px', padding: '10px' }}>
          <p style={{ fontSize: '12px', color: 'var(--rs-warning)', marginBottom: '4px' }}>Treino nao realizado</p>
          {workout.skip_reason || workout.notes ? <p style={{ fontSize: '12px', color: 'var(--rs-muted)' }}>{workout.skip_reason || workout.notes}</p> : null}
        </div>
      )}

      {!isDone && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button className="btn-primary" onClick={onComplete}>
            <CheckCircle2 size={15} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
            Registrar
          </button>
          <button className="btn-ghost" onClick={onSkip}>
            <XCircle size={15} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
            Nao realizado
          </button>
        </div>
      )}
      {!isDone && workout.result_images?.length ? (
        <p style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--rs-muted)' }}>
          <ImageIcon size={14} /> {workout.result_images.length} imagem(ns) ja anexada(s)
        </p>
      ) : null}
    </div>
  )
}
