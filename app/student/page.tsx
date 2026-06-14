'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient, type Profile, type Student, type Week, type Workout } from '@/lib/supabase'
import { Home, Calendar, BarChart2, CreditCard, User, MessageCircle, CheckCircle2, Clock, Footprints } from 'lucide-react'
import { format, isToday, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function StudentPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [student, setStudent] = useState<Student | null>(null)
  const [week, setWeek] = useState<Week | null>(null)
  const [todayWorkout, setTodayWorkout] = useState<Workout | null>(null)
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [showComplete, setShowComplete] = useState(false)
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
      const w = weeks[0]
      setWeek(w)
      const today = format(new Date(), 'EEEE', { locale: ptBR }).toLowerCase()
      const pending = w.workouts?.filter((wo: Workout) => wo.status === 'pending')
      const todayMatch = pending?.find((wo: Workout) =>
        wo.suggested_day?.toLowerCase().includes(today.slice(0, 3))
      )
      setTodayWorkout(todayMatch || pending?.[0] || null)
    }
    setLoading(false)
  }

  async function markDone() {
    if (!todayWorkout) return
    setCompleting(true)
    await supabase.from('workouts').update({
      status: 'done',
      done_at: new Date().toISOString(),
      feeling: feeling || null,
      actual_km: actualKm ? parseFloat(actualKm) : null,
      notes: notes || null,
    }).eq('id', todayWorkout.id)

    await supabase.from('students').update({
      total_workouts: (student?.total_workouts || 0) + 1,
      total_km: (student?.total_km || 0) + (actualKm ? parseFloat(actualKm) : (todayWorkout.planned_km || 0)),
    }).eq('id', profile?.id)

    setCompleting(false)
    setShowComplete(false)
    loadData()
  }

  const weekDone = week?.workouts?.filter((w: Workout) => w.status === 'done').length || 0
  const weekTotal = week?.workouts?.length || 0
  const pct = weekTotal > 0 ? Math.round((weekDone / weekTotal) * 100) : 0

  const typeLabel: Record<string, string> = {
    rodagem_leve: 'Rodagem leve', rodagem_moderada: 'Rodagem moderada',
    fartlek: 'Fartlek', tiros: 'Tiros', longao: 'Longão',
    rampa: 'Rampa', regenerativo: 'Regenerativo', prova: 'Prova',
    ritmado: 'Ritmado', desafio: 'Desafio',
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
            <div style={{ background: 'var(--rs-card2)', borderRadius: '10px', padding: '10px 12px' }}>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--rs-neon)' }}>{weekDone}/{weekTotal}</div>
              <div style={{ fontSize: '11px', color: 'var(--rs-muted)' }}>Treinos da semana</div>
            </div>
            <div style={{ background: 'var(--rs-card2)', borderRadius: '10px', padding: '10px 12px' }}>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--rs-neon)' }}>{student?.streak_days || 0}d</div>
              <div style={{ fontSize: '11px', color: 'var(--rs-muted)' }}>Sequência ativa</div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--rs-muted)' }}>Progresso semanal</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--rs-neon)' }}>{pct}%</span>
          </div>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
        </div>

        {todayWorkout && !showComplete && (
          <div className="card" style={{ marginBottom: '12px' }}>
            <p style={{ fontSize: '11px', color: 'var(--rs-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '10px' }}>Treino de hoje</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800 }}>{todayWorkout.title}</h2>
              <span className="badge badge-muted">{typeLabel[todayWorkout.type] || todayWorkout.type}</span>
            </div>
            {todayWorkout.description && <p style={{ fontSize: '13px', color: 'var(--rs-muted)', marginBottom: '12px' }}>{todayWorkout.description}</p>}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              {todayWorkout.planned_km && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'var(--rs-card2)', borderRadius: '20px', padding: '5px 10px', fontSize: '12px' }}>
                  <Footprints size={13} color="var(--rs-neon)" />{todayWorkout.planned_km} km
                </div>
              )}
              {todayWorkout.planned_pace && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'var(--rs-card2)', borderRadius: '20px', padding: '5px 10px', fontSize: '12px' }}>
                  <Clock size={13} color="var(--rs-neon)" />{todayWorkout.planned_pace}
                </div>
              )}
            </div>
            <button className="btn-primary" onClick={() => setShowComplete(true)}>
              <CheckCircle2 size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
              Marcar como concluído
            </button>
          </div>
        )}

        {showComplete && todayWorkout && (
          <div className="card" style={{ marginBottom: '12px', borderColor: 'var(--rs-neon)44' }}>
            <p className="label-neon" style={{ marginBottom: '12px' }}>Registrar treino</p>
            <p style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px' }}>{todayWorkout.title}</p>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', color: 'var(--rs-muted)', marginBottom: '6px', display: 'block' }}>Distância realizada (km)</label>
              <input type="number" step="0.1" value={actualKm} onChange={e => setActualKm(e.target.value)} placeholder={`Planejado: ${todayWorkout.planned_km || '—'} km`} />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', color: 'var(--rs-muted)', marginBottom: '8px', display: 'block' }}>Como foi?</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[['facil','😎 Fácil'],['ok','👍 Ok'],['dificil','😤 Difícil'],['muito_dificil','💀 Pesado']].map(([key, label]) => (
                  <button key={key} className={`feeling-btn${feeling === key ? ' selected' : ''}`} onClick={() => setFeeling(key)}>{label}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12px', color: 'var(--rs-muted)', marginBottom: '6px', display: 'block' }}>Observação (opcional)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Como foi o treino? Algo diferente?" rows={2} style={{ resize: 'none' }} />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn-ghost" onClick={() => setShowComplete(false)} style={{ flex: 1 }}>Cancelar</button>
              <button className="btn-primary" onClick={markDone} disabled={completing} style={{ flex: 2 }}>
                {completing ? 'Salvando...' : 'Confirmar treino'}
              </button>
            </div>
          </div>
        )}

        {!todayWorkout && week && (
          <div className="card" style={{ marginBottom: '12px', textAlign: 'center', padding: '24px' }}>
            <CheckCircle2 size={32} color="var(--rs-neon)" style={{ marginBottom: '8px' }} />
            <p style={{ fontWeight: 700, marginBottom: '4px' }}>Semana concluída!</p>
            <p style={{ fontSize: '13px', color: 'var(--rs-muted)' }}>Aguarde os próximos treinos do professor.</p>
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
            { href: '/student/evolucao', label: 'Evolução', sub: 'Gráficos e histórico', icon: <BarChart2 size={20} color="var(--rs-neon)" /> },
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
          { href: '/student', icon: <Home size={22} />, label: 'Início', active: true },
          { href: '/student/semana', icon: <Calendar size={22} />, label: 'Semana' },
          { href: '/student/evolucao', icon: <BarChart2 size={22} />, label: 'Evolução' },
          { href: '/student/mensalidade', icon: <CreditCard size={22} />, label: 'Mensalidade' },
          { href: '/student/profile', icon: <User size={22} />, label: 'Perfil' },
        ].map(tab => (
          <Link key={tab.href} href={tab.href} className={`tab-item${tab.active ? ' active' : ''}`}>{tab.icon}<span>{tab.label}</span></Link>
        ))}
      </nav>
    </>
  )
}
