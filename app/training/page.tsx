'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient, type WorkoutTemplate, type WorkoutType } from '@/lib/supabase'
import { Home, Users, Dumbbell, CreditCard, User, Plus, X, Send, CalendarDays, Save, Pencil, Trash2 } from 'lucide-react'

type StudentProfile = { id: string; name: string }
type WorkoutItem = {
  template_id?: string
  type: WorkoutType
  title: string
  description: string
  planned_km: string
  planned_pace: string
  suggested_day: string
}

const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
const TYPE_LABELS: Record<WorkoutType, string> = {
  rodagem_leve: 'Rodagem leve',
  rodagem_moderada: 'Rodagem moderada',
  fartlek: 'Fartlek',
  tiros: 'Tiros',
  longao: 'Longão',
  rampa: 'Rampa',
  regenerativo: 'Regenerativo',
  prova: 'Prova',
  ritmado: 'Ritmado',
  desafio: 'Desafio',
}

function getCurrentWeekLabel() {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const mon = new Date(now.setDate(diff))
  const sun = new Date(mon)
  sun.setDate(mon.getDate() + 6)
  const fmt = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
  return `${fmt(mon)} a ${fmt(sun)}`
}

export default function TrainingPage() {
  const [students, setStudents] = useState<StudentProfile[]>([])
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([])
  const [selectedStudent, setSelectedStudent] = useState('')
  const [workouts, setWorkouts] = useState<WorkoutItem[]>([])
  const [showLibrary, setShowLibrary] = useState(false)
  const [showNewWorkout, setShowNewWorkout] = useState(false)
  const [showNewTemplate, setShowNewTemplate] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(false)
  const [templateSaved, setTemplateSaved] = useState(false)
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null)
  const [libraryMessage, setLibraryMessage] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState<WorkoutType>('rodagem_leve')
  const [newKm, setNewKm] = useState('')
  const [newPace, setNewPace] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const supabase = createClient()

  useEffect(() => { loadData() }, [])

  useEffect(() => {
    const studentId = new URLSearchParams(window.location.search).get('student')
    if (studentId) setSelectedStudent(studentId)
  }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: { session } } = await supabase.auth.getSession()
    if (!user || !session) return

    const [studentsResponse, { data: tmpl }] = await Promise.all([
      fetch('/api/admin/students', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      }),
      supabase.from('workout_templates').select('*').eq('coach_id', user.id).order('type'),
    ])
    const studentsResult = await studentsResponse.json()

    setStudents(studentsResponse.ok ? studentsResult.students || [] : [])
    setTemplates(tmpl || [])
  }

  function addFromLibrary(t: WorkoutTemplate) {
    setWorkouts(prev => [...prev, {
      template_id: t.id,
      type: t.type,
      title: t.title,
      description: t.description || '',
      planned_km: String(t.default_km || ''),
      planned_pace: t.default_pace || '',
      suggested_day: '',
    }])
    setShowLibrary(false)
  }

  function updateWorkout(index: number, patch: Partial<WorkoutItem>) {
    setWorkouts(prev => prev.map((workout, idx) => idx === index ? { ...workout, ...patch } : workout))
  }

  function resetTemplateForm() {
    setEditingTemplateId(null)
    setNewTitle('')
    setNewType('rodagem_leve')
    setNewKm('')
    setNewPace('')
    setNewDesc('')
  }

  function editTemplate(t: WorkoutTemplate) {
    setEditingTemplateId(t.id)
    setNewType(t.type)
    setNewTitle(t.title)
    setNewKm(t.default_km ? String(t.default_km) : '')
    setNewPace(t.default_pace || '')
    setNewDesc(t.description || '')
    setShowNewTemplate(true)
    setShowLibrary(false)
  }

  function addCustom() {
    if (!newTitle) return
    setWorkouts(prev => [...prev, {
      type: newType,
      title: newTitle,
      description: newDesc,
      planned_km: newKm,
      planned_pace: newPace,
      suggested_day: '',
    }])
    setNewTitle('')
    setNewKm('')
    setNewPace('')
    setNewDesc('')
    setShowNewWorkout(false)
  }

  async function saveTemplate() {
    if (!newTitle) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      coach_id: user.id,
      type: newType,
      title: newTitle,
      description: newDesc || null,
      default_km: newKm ? parseFloat(newKm) : null,
      default_pace: newPace || null,
    }

    const query = editingTemplateId
      ? supabase.from('workout_templates').update(payload).eq('id', editingTemplateId).eq('coach_id', user.id)
      : supabase.from('workout_templates').insert(payload)

    const { data, error } = await query.select().single()

    if (!error && data) {
      setTemplates(prev => editingTemplateId ? prev.map(t => t.id === data.id ? data : t) : [...prev, data])
      setTemplateSaved(true)
      resetTemplateForm()
      setShowNewTemplate(false)
      setTimeout(() => setTemplateSaved(false), 3000)
    }
  }

  async function deleteTemplate(t: WorkoutTemplate) {
    const confirmed = window.confirm(`Excluir o modelo "${t.title}" da biblioteca? Semanas ja publicadas nao serao alteradas.`)
    if (!confirmed) return

    const { error } = await supabase.from('workout_templates').delete().eq('id', t.id)
    if (!error) {
      setTemplates(prev => prev.filter(template => template.id !== t.id))
      setLibraryMessage('Modelo excluido da biblioteca.')
      setTimeout(() => setLibraryMessage(''), 3000)
    }
  }

  function removeWorkout(i: number) {
    setWorkouts(prev => prev.filter((_, idx) => idx !== i))
  }

  async function publish() {
    if (!selectedStudent || workouts.length === 0) return
    setPublishing(true)
    const { data: { user } } = await supabase.auth.getUser()
    const now = new Date()
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1)
    const mon = new Date(new Date().setDate(diff))
    const sun = new Date(mon)
    sun.setDate(mon.getDate() + 6)
    const fmt = (d: Date) => d.toISOString().split('T')[0]

    const { data: week } = await supabase.from('weeks').insert({
      student_id: selectedStudent,
      coach_id: user?.id,
      label: getCurrentWeekLabel(),
      date_start: fmt(mon),
      date_end: fmt(sun),
      status: 'published',
    }).select().single()

    if (week) {
      await supabase.from('workouts').insert(
        workouts.map((w, i) => ({
          week_id: week.id,
          student_id: selectedStudent,
          template_id: w.template_id || null,
          type: w.type,
          title: w.title,
          description: w.description || null,
          planned_km: w.planned_km ? parseFloat(w.planned_km) : null,
          planned_pace: w.planned_pace || null,
          suggested_day: w.suggested_day || null,
          order_num: i + 1,
          status: 'pending',
        })),
      )
    }

    setPublishing(false)
    setPublished(true)
    setWorkouts([])
    setTimeout(() => setPublished(false), 3000)
  }

  const selectedName = students.find(s => s.id === selectedStudent)?.name
  const weekLabel = getCurrentWeekLabel()

  return (
    <>
      <div className="topbar rs-topbar">
        <div className="rs-brand">
          <div className="rs-brand-mark">RS</div>
          <div>
            <p className="rs-brand-title">Running</p>
            <p className="rs-brand-subtitle">Montar treinos</p>
          </div>
        </div>
      </div>

      <main className="page training-page fade-up">
        <section className="training-hero">
          <div>
            <p className="label-neon">Operação semanal</p>
            <h1>Treinos</h1>
            <p>Monte a semana personalizada e publique diretamente para o aluno.</p>
          </div>
          <div className="week-pill">
            <CalendarDays size={16} />
            {weekLabel}
          </div>
        </section>

        {published && (
          <div className="success-panel">
            <strong>Treinos publicados com sucesso!</strong>
            <span>O aluno já pode ver no app.</span>
          </div>
        )}

        {templateSaved && (
          <div className="success-panel">
            <strong>Modelo salvo na biblioteca!</strong>
            <span>Agora ele pode ser reutilizado em novas semanas.</span>
          </div>
        )}

        <section className="premium-card planner-card">
          <div className="section-heading">
            <div>
              <p className="label-neon">Aluno</p>
              <h2>Publicar cronograma</h2>
            </div>
            <span className="count-badge">{workouts.length} treinos</span>
          </div>
          <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}>
            <option value="">Selecionar aluno...</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </section>

        <section className="toolbar-card">
          <div>
            <p className="label-neon">Semana</p>
            <strong>{selectedName ? `Plano de ${selectedName}` : 'Selecione um aluno'}</strong>
          </div>
          <div className="toolbar-actions">
            <button onClick={() => setShowLibrary(!showLibrary)} className="btn-ghost compact-btn">
              <Dumbbell size={15} /> Biblioteca
            </button>
            <button onClick={() => setShowNewWorkout(!showNewWorkout)} className="btn-ghost compact-btn">
              <Plus size={15} /> Novo
            </button>
            <button onClick={() => setShowNewTemplate(!showNewTemplate)} className="btn-ghost compact-btn">
              <Save size={15} /> Modelo
            </button>
          </div>
        </section>

        {showLibrary && (
          <section className="premium-card">
            <div className="section-heading">
              <div>
                <p className="label-neon">Biblioteca</p>
                <h2>Modelos do professor</h2>
              </div>
            </div>
            {templates.length === 0 ? (
              <p className="empty-copy">Nenhum modelo cadastrado ainda.</p>
            ) : (
              <div className="library-list">
                {templates.map(t => (
                  <article key={t.id} className="library-item">
                    <span>
                      <strong>{t.title}</strong>
                      <small>{TYPE_LABELS[t.type]}{t.default_km ? ` • ${t.default_km} km` : ''}</small>
                    </span>
                    <div className="library-actions">
                      <button type="button" onClick={() => addFromLibrary(t)} aria-label="Usar modelo">
                        <Plus size={15} />
                      </button>
                      <button type="button" onClick={() => editTemplate(t)} aria-label="Editar modelo">
                        <Pencil size={15} />
                      </button>
                      <button type="button" onClick={() => deleteTemplate(t)} aria-label="Excluir modelo">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
            {libraryMessage ? <p className="empty-copy">{libraryMessage}</p> : null}
          </section>
        )}

        {showNewWorkout && (
          <section className="premium-card neon-card">
            <div className="section-heading">
              <div>
                <p className="label-neon">Novo treino</p>
                <h2>Adicionar à semana</h2>
              </div>
            </div>
            <div className="form-stack">
              <select value={newType} onChange={e => setNewType(e.target.value as WorkoutType)}>
                {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Título (ex: 14 x 200m pausa 45s)" />
              <input value={newKm} onChange={e => setNewKm(e.target.value)} type="number" step="0.5" placeholder="Distância (km)" />
              <input value={newPace} onChange={e => setNewPace(e.target.value)} placeholder="Pace alvo (opcional)" />
              <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Descrição adicional (opcional)" />
              <div className="split-actions">
                <button className="btn-ghost" onClick={() => setShowNewWorkout(false)}>Cancelar</button>
                <button className="btn-primary" onClick={addCustom}>Adicionar</button>
              </div>
            </div>
          </section>
        )}

        {showNewTemplate && (
          <section className="premium-card neon-card">
            <div className="section-heading">
              <div>
                <p className="label-neon">Biblioteca</p>
                <h2>{editingTemplateId ? 'Editar modelo de treino' : 'Novo modelo de treino'}</h2>
              </div>
            </div>
            <div className="form-stack">
              <select value={newType} onChange={e => setNewType(e.target.value as WorkoutType)}>
                {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Nome do modelo" />
              <input value={newKm} onChange={e => setNewKm(e.target.value)} type="number" step="0.5" placeholder="Distância padrão (km)" />
              <input value={newPace} onChange={e => setNewPace(e.target.value)} placeholder="Pace padrão (opcional)" />
              <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Orientação do treino" />
              <div className="split-actions">
                <button className="btn-ghost" onClick={() => { resetTemplateForm(); setShowNewTemplate(false) }}>Cancelar</button>
                <button className="btn-primary" onClick={saveTemplate}>{editingTemplateId ? 'Atualizar modelo' : 'Salvar modelo'}</button>
              </div>
            </div>
          </section>
        )}

        <section className="workout-list">
          {workouts.length === 0 ? (
            <div className="empty-state-card">
              <Dumbbell size={34} />
              <strong>Nenhum treino na semana</strong>
              <p>Use a biblioteca ou crie um treino novo para montar o cronograma.</p>
            </div>
          ) : (
            workouts.map((w, i) => (
              <article key={`${w.title}-${i}`} className="workout-card">
                <div className="workout-header">
                  <span>Treino {i + 1}</span>
                  <button onClick={() => removeWorkout(i)} aria-label="Remover treino">
                    <X size={16} />
                  </button>
                </div>
                <div className="workout-edit-grid">
                  <select value={w.type} onChange={e => updateWorkout(i, { type: e.target.value as WorkoutType })}>
                    {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                  <input value={w.title} onChange={e => updateWorkout(i, { title: e.target.value })} placeholder="Titulo do treino" />
                  <input value={w.planned_km} onChange={e => updateWorkout(i, { planned_km: e.target.value })} type="number" step="0.5" placeholder="Km" />
                  <input value={w.planned_pace} onChange={e => updateWorkout(i, { planned_pace: e.target.value })} placeholder="Pace" />
                  <input value={w.description} onChange={e => updateWorkout(i, { description: e.target.value })} placeholder="Observacao para o aluno" />
                </div>
                <h3>{w.title}</h3>
                <p>{TYPE_LABELS[w.type]}{w.planned_km ? ` • ${w.planned_km} km` : ''}</p>
                {w.description ? <small>{w.description}</small> : null}
                <select value={w.suggested_day} onChange={e => setWorkouts(prev => prev.map((x, idx) => idx === i ? { ...x, suggested_day: e.target.value } : x))}>
                  <option value="">Dia sugerido (opcional)</option>
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </article>
            ))
          )}
        </section>

        <button className="btn-primary publish-button" onClick={publish} disabled={!selectedStudent || workouts.length === 0 || publishing}>
          <Send size={16} />
          {publishing ? 'Publicando...' : `Publicar para ${selectedName || 'aluno'}`}
        </button>
      </main>

      <nav className="tabbar">
        {[
          { href: '/coach', icon: <Home size={22} />, label: 'Início' },
          { href: '/coach/alunos', icon: <Users size={22} />, label: 'Alunos' },
          { href: '/training', icon: <Dumbbell size={22} />, label: 'Treinos', active: true },
          { href: '/financial', icon: <CreditCard size={22} />, label: 'Financeiro' },
          { href: '/profile-coach', icon: <User size={22} />, label: 'Perfil' },
        ].map(tab => (
          <Link key={tab.href} href={tab.href} className={`tab-item${tab.active ? ' active' : ''}`}>{tab.icon}<span>{tab.label}</span></Link>
        ))}
      </nav>
    </>
  )
}
