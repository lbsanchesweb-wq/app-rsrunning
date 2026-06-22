'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, CheckCircle2, Circle, Image as ImageIcon, XCircle } from 'lucide-react'
import { createClient, type Profile, type Week, type Workout } from '@/lib/supabase'

export default function CoachStudentPage() {
  const params = useParams<{ id: string }>()
  const [student, setStudent] = useState<Profile | null>(null)
  const [week, setWeek] = useState<Week | null>(null)
  const [images, setImages] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const [{ data: profile }, { data: weeks }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', params.id).single(),
        supabase.from('weeks').select('*, workouts(*)').eq('student_id', params.id).eq('status', 'published').order('date_start', { ascending: false }).limit(1),
      ])
      setStudent(profile)
      const currentWeek = weeks?.[0] || null
      setWeek(currentWeek)

      if (currentWeek?.workouts) {
        const entries = await Promise.all((currentWeek.workouts as Workout[]).map(async (workout) => {
          const urls = await Promise.all((workout.result_images || []).map(async (path) => {
            const { data } = await supabase.storage.from('workout-results').createSignedUrl(path, 60 * 60)
            return data?.signedUrl || ''
          }))
          return [workout.id, urls.filter(Boolean)] as const
        }))
        setImages(Object.fromEntries(entries))
      }
      setLoading(false)
    }
    load()
  }, [params.id])

  const workouts = week?.workouts ? [...(week.workouts as Workout[])].sort((a, b) => a.order_num - b.order_num) : []

  if (loading) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100dvh',color:'var(--rs-neon)' }}>Carregando...</div>

  return (
    <>
      <div className="topbar">
        <Link href="/coach" aria-label="Voltar"><ArrowLeft size={22} /></Link>
        <strong>{student?.name || 'Aluno'}</strong>
        <span className="badge badge-muted">{workouts.length} treinos</span>
      </div>
      <main className="page fade-up">
        {!week ? <div className="card">Nenhuma semana publicada.</div> : (
          <>
            <div className="card" style={{ marginBottom:'12px' }}>
              <p className="label-neon">{week.label}</p>
              <p style={{ fontSize:'13px',color:'var(--rs-muted)',marginTop:'4px' }}>Acompanhamento da execucao do atleta</p>
            </div>
            <div style={{ display:'grid',gap:'10px' }}>
              {workouts.map((workout, index) => {
                const done = workout.status === 'done'
                const skipped = workout.status === 'skipped'
                return (
                  <article key={workout.id} className="card">
                    <div style={{ display:'flex',gap:'9px',alignItems:'flex-start' }}>
                      {done ? <CheckCircle2 size={20} color="var(--rs-neon)" /> : skipped ? <XCircle size={20} color="var(--rs-warning)" /> : <Circle size={20} color="var(--rs-muted)" />}
                      <div style={{ flex:1,minWidth:0 }}>
                        <p style={{ fontSize:'10px',color:'var(--rs-muted)' }}>Treino {index + 1} {workout.suggested_day ? `- ${workout.suggested_day}` : ''}</p>
                        <h2 style={{ fontSize:'16px',marginTop:'2px' }}>{workout.title}</h2>
                      </div>
                      <span className={`badge ${done ? 'badge-success' : skipped ? 'badge-warning' : 'badge-muted'}`}>{done ? 'Concluido' : skipped ? 'Nao realizado' : 'Pendente'}</span>
                    </div>
                    {workout.description && <p style={{ fontSize:'13px',color:'var(--rs-muted)',marginTop:'9px' }}>{workout.description}</p>}
                    {done && <div style={{ marginTop:'10px',background:'var(--rs-card2)',padding:'10px',borderRadius:'10px',fontSize:'12px',color:'#ccc' }}>
                      {workout.actual_km && <span>{workout.actual_km} km realizados</span>}
                      {workout.feeling && <span style={{ marginLeft:'12px' }}>Sensacao: {workout.feeling.replace('_', ' ')}</span>}
                      {workout.notes && <p style={{ color:'var(--rs-muted)',marginTop:'5px' }}>{workout.notes}</p>}
                      {!!images[workout.id]?.length && <div style={{ display:'flex',gap:'8px',overflowX:'auto',marginTop:'9px' }}>{images[workout.id].map(src => <a href={src} target="_blank" rel="noreferrer" key={src}><img src={src} alt="Comprovante do treino" style={{ width:'92px',height:'92px',objectFit:'cover',borderRadius:'8px' }} /></a>)}</div>}
                      {!!workout.result_images?.length && !images[workout.id]?.length && <p style={{ display:'flex',gap:'5px',alignItems:'center',color:'var(--rs-muted)',marginTop:'7px' }}><ImageIcon size={13} /> Comprovante indisponivel</p>}
                    </div>}
                    {skipped && <div style={{ marginTop:'10px',background:'var(--rs-card2)',padding:'10px',borderRadius:'10px' }}><p style={{ fontSize:'11px',color:'var(--rs-warning)' }}>Motivo informado</p><p style={{ fontSize:'12px',color:'var(--rs-muted)',marginTop:'3px' }}>{workout.skip_reason || workout.notes || 'Sem motivo informado'}</p></div>}
                  </article>
                )
              })}
            </div>
          </>
        )}
      </main>
    </>
  )
}
