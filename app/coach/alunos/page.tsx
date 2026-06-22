'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Home, Users, Dumbbell, CreditCard, User, AlertCircle, CalendarDays, CheckCircle2, Plus, X } from 'lucide-react'

type StudentRow = {
  id: string
  name: string
  email: string
  avatar_url?: string
  goal?: string
  total_km?: number
  total_workouts?: number
  week?: { label: string; done: number; skipped?: number; pending?: number; total: number }
  payment?: { status: string; month: string }
}

export default function CoachStudentsPage() {
  const [students, setStudents] = useState<StudentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewStudent, setShowNewStudent] = useState(false)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    goal: '',
    weeklyVolume: '',
    targetRace: '',
    monthlyFee: '',
  })
  const supabase = createClient()

  useEffect(() => { loadStudents() }, [])

  async function loadStudents() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setLoading(false)
      return
    }

    const response = await fetch('/api/admin/students', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
    const result = await response.json()

    if (!response.ok || !result.students?.length) {
      setStudents([])
      setLoading(false)
      return
    }

    setStudents(result.students)
    setLoading(false)
  }

  function updateForm(field: keyof typeof form, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function createStudent() {
    if (!form.name || !form.email) return
    setSaving(true)
    setNotice('')

    const { data: { session } } = await supabase.auth.getSession()
    const response = await fetch('/api/admin/students', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token || ''}`,
      },
      body: JSON.stringify(form),
    })

    const result = await response.json()
    setSaving(false)

    if (!response.ok) {
      setNotice(result.error || 'Nao foi possivel cadastrar o aluno.')
      return
    }

    setNotice(`Aluno cadastrado. Senha inicial: ${result.student.initialPassword}`)
    setShowNewStudent(false)
    setForm({ name: '', email: '', phone: '', goal: '', weeklyVolume: '', targetRace: '', monthlyFee: '' })
    loadStudents()
  }

  const withoutWeek = students.filter(student => !student.week).length

  if (loading) {
    return (
      <div className="loading-screen">
        <div>Carregando alunos...</div>
      </div>
    )
  }

  return (
    <>
      <div className="topbar rs-topbar">
        <div className="rs-brand">
          <div className="rs-brand-mark">RS</div>
          <div>
            <p className="rs-brand-title">Running</p>
            <p className="rs-brand-subtitle">Alunos ativos</p>
          </div>
        </div>
      </div>

      <main className="page training-page fade-up">
        <section className="training-hero">
          <div>
            <p className="label-neon">Gestão do professor</p>
            <h1>Alunos</h1>
            <p>Acompanhe quem já recebeu a semana, conclusão dos treinos e pendências de operação.</p>
          </div>
          <div className="hero-actions">
            <div className="week-pill">
              <Users size={16} />
              {students.length} ativos
            </div>
            <button className="btn-primary hero-action-button" onClick={() => setShowNewStudent(true)}>
              <Plus size={16} />
              Novo aluno
            </button>
          </div>
        </section>

        {notice && (
          <div className="success-panel">
            <strong>{notice}</strong>
          </div>
        )}

        <section className="student-metrics-grid">
          <Metric label="Alunos cadastrados" value={String(students.length)} />
          <Metric label="Sem semana" value={String(withoutWeek)} tone={withoutWeek > 0 ? 'warning' : 'ok'} />
        </section>

        {students.length === 0 ? (
          <section className="empty-state-card">
            <AlertCircle size={34} />
            <strong>Nenhum aluno cadastrado</strong>
            <p>
              A carga inicial ainda não foi executada. Rode o script de importação para criar os alunos ativos,
              usuários de acesso e treinos da semana.
            </p>
            <button className="empty-action" onClick={() => setShowNewStudent(true)}>Cadastrar aluno</button>
          </section>
        ) : (
          <section className="students-list">
            {students.map(student => {
              const completion = student.week?.total ? Math.round((student.week.done / student.week.total) * 100) : 0

              return (
                <article key={student.id} className="student-card-premium">
                  <div className="avatar-initials student-avatar">
                    {student.avatar_url
                      ? <img src={student.avatar_url} alt={student.name} className="avatar" />
                      : student.name.split(' ').map(part => part[0]).slice(0, 2).join('')
                    }
                  </div>
                  <div className="student-card-body">
                    <div className="student-card-header">
                      <div>
                        <h2>{student.name}</h2>
                        <p>{student.email}</p>
                      </div>
                      <span className={student.week ? 'badge badge-neon' : 'badge badge-warning'}>
                        {student.week ? `${completion}%` : 'Sem semana'}
                      </span>
                    </div>
                    <div className="student-card-grid">
                      <Info icon={<CalendarDays size={14} />} label="Semana" value={student.week?.label || 'Não publicada'} />
                      <Info icon={<CheckCircle2 size={14} />} label="Concluidos" value={student.week ? `${student.week.done}/${student.week.total}` : '0/0'} />
                      <Info icon={<X size={14} />} label="Nao realizados" value={`${student.week?.skipped || 0}`} />
                      <Info label="Km acumulados" value={`${student.total_km || 0} km`} />
                      <Info label="Pagamentos" value={student.payment?.status || 'sem registro'} />
                    </div>
                    <div className="student-actions">
                      <Link href={`/training?student=${student.id}`} className="btn-ghost student-link">Montar semana</Link>
                      <Link href={`/financial`} className="btn-ghost student-link">Financeiro</Link>
                    </div>
                  </div>
                </article>
              )
            })}
          </section>
        )}
      </main>

      {showNewStudent && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <section className="premium-modal">
            <div className="modal-header">
              <div>
                <p className="label-neon">Cadastro</p>
                <h2>Novo aluno</h2>
              </div>
              <button onClick={() => setShowNewStudent(false)} aria-label="Fechar">
                <X size={18} />
              </button>
            </div>
            <div className="form-stack">
              <input value={form.name} onChange={e => updateForm('name', e.target.value)} placeholder="Nome completo" />
              <input value={form.email} onChange={e => updateForm('email', e.target.value)} type="email" placeholder="Email de acesso" />
              <input value={form.phone} onChange={e => updateForm('phone', e.target.value)} placeholder="Telefone / WhatsApp" />
              <input value={form.goal} onChange={e => updateForm('goal', e.target.value)} placeholder="Objetivo principal" />
              <input value={form.weeklyVolume} onChange={e => updateForm('weeklyVolume', e.target.value)} placeholder="Volume semanal" />
              <input value={form.targetRace} onChange={e => updateForm('targetRace', e.target.value)} placeholder="Prova alvo" />
              <input value={form.monthlyFee} onChange={e => updateForm('monthlyFee', e.target.value)} type="number" step="1" placeholder="Valor da mensalidade" />
              <div className="split-actions">
                <button className="btn-ghost" onClick={() => setShowNewStudent(false)}>Cancelar</button>
                <button className="btn-primary" onClick={createStudent} disabled={saving || !form.name || !form.email}>
                  {saving ? 'Cadastrando...' : 'Cadastrar aluno'}
                </button>
              </div>
              <p className="modal-hint">Senha inicial do aluno: Corrida2026!</p>
            </div>
          </section>
        </div>
      )}

      <nav className="tabbar">
        {[
          { href: '/coach', icon: <Home size={22} />, label: 'Início' },
          { href: '/coach/alunos', icon: <Users size={22} />, label: 'Alunos', active: true },
          { href: '/training', icon: <Dumbbell size={22} />, label: 'Treinos' },
          { href: '/financial', icon: <CreditCard size={22} />, label: 'Financeiro' },
          { href: '/profile-coach', icon: <User size={22} />, label: 'Perfil' },
        ].map(tab => (
          <Link key={tab.href} href={tab.href} className={`tab-item${tab.active ? ' active' : ''}`}>{tab.icon}<span>{tab.label}</span></Link>
        ))}
      </nav>
    </>
  )
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: 'ok' | 'warning' }) {
  return (
    <div className="metric-card-premium">
      <strong className={tone === 'warning' ? 'metric-warning' : ''}>{value}</strong>
      <span>{label}</span>
    </div>
  )
}

function Info({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="student-info-tile">
      <span>{icon}{label}</span>
      <strong>{value}</strong>
    </div>
  )
}
