'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient, type Week, type Workout } from '@/lib/supabase'
import { Home, Calendar, BarChart2, CreditCard, User, CheckCircle2, Circle, Clock, Footprints, XCircle, Image as ImageIcon } from 'lucide-react'

export default function SemanaPage() {
  const [week, setWeek] = useState<Week | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('weeks').select('*, workouts(*)')
        .eq('student_id', user.id).eq('status', 'published')
        .order('date_start', { ascending: false }).limit(1)
      if (data?.[0]) setWeek(data[0])
      setLoading(false)
    }
    load()
  }, [])

  const typeLabel: Record<string, string> = {
    rodagem_leve: 'Base', rodagem_moderada: 'Base',
    fartlek: 'Fartlek', tiros: 'Intervalado', longao: 'Longo',
    rampa: 'Rampa', regenerativo: 'Regenerativo', prova: 'Prova',
    ritmado: 'Ritmado', desafio: 'Desafio',
  }

  const typeColor: Record<string, string> = {
    tiros: '#ff3333', longao: '#00ff88', fartlek: '#8888ff',
    rampa: '#ff8c00', rodagem_leve: '#c8f000', rodagem_moderada: '#4db8ff',
    regenerativo: '#aaaaaa', prova: '#ffd700', ritmado: '#00d4ff', desafio: '#ffd700',
  }

  const sorted = week?.workouts ? [...(week.workouts as Workout[])].sort((a,b) => a.order_num - b.order_num) : []
  const done = sorted.filter(w => w.status === 'done').length
  const skipped = sorted.filter(w => w.status === 'skipped').length

  if (loading) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100dvh' }}><div style={{ color:'var(--rs-neon)',fontSize:'14px' }}>Carregando...</div></div>

  return (
    <>
      <div className="topbar">
        <div style={{ display:'flex',alignItems:'center',gap:'8px' }}>
          <div style={{ background:'var(--rs-neon)',color:'#000',fontWeight:800,fontSize:'14px',padding:'4px 8px',borderRadius:'6px' }}>RS</div>
          <span style={{ fontSize:'14px',fontWeight:600,letterSpacing:'1px' }}>Minha semana</span>
        </div>
        {week && <span className="badge badge-neon">{done}/{sorted.length}</span>}
      </div>

      <div className="page fade-up">
        {!week ? (
          <div className="card" style={{ textAlign:'center',padding:'32px' }}>
            <Calendar size={36} color="var(--rs-muted)" style={{ marginBottom:'10px' }} />
            <p style={{ fontWeight:700,marginBottom:'6px' }}>Sem semana publicada</p>
            <p style={{ fontSize:'13px',color:'var(--rs-muted)' }}>O professor Rui vai publicar seus treinos em breve.</p>
          </div>
        ) : (
          <>
            <div className="card" style={{ marginBottom:'14px',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
              <div>
                <p className="label-neon">{week.label}</p>
                <p style={{ fontSize:'13px',color:'var(--rs-muted)',marginTop:'2px' }}>{sorted.length} treinos em ordem sugerida</p>
                {skipped > 0 && <p style={{ fontSize:'11px',color:'var(--rs-warning)',marginTop:'3px' }}>{skipped} não realizado{skipped > 1 ? 's' : ''}</p>}
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:'24px',fontWeight:800,color:'var(--rs-neon)' }}>{Math.round((done/sorted.length)*100)}%</div>
                <div style={{ fontSize:'11px',color:'var(--rs-muted)' }}>concluído</div>
              </div>
            </div>

            <div style={{ display:'flex',flexDirection:'column',gap:'10px' }}>
              {sorted.map((workout, i) => (
                <div key={workout.id} className="card" style={{ borderLeft: `3px solid ${typeColor[workout.type] || 'var(--rs-neon)'}`, borderRadius:'16px', opacity: workout.status === 'skipped' ? 0.5 : 1 }}>
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'6px' }}>
                    <div style={{ display:'flex',alignItems:'center',gap:'8px' }}>
                      {workout.status === 'done' ? <CheckCircle2 size={20} color="var(--rs-neon)" />
                        : workout.status === 'skipped' ? <XCircle size={20} color="var(--rs-warning)" />
                        : <Circle size={20} color="var(--rs-muted)" />}
                      <div>
                        <p style={{ fontSize:'10px',color:'var(--rs-muted)',letterSpacing:'0.6px' }}>Treino {i+1}{workout.suggested_day ? ` · ${workout.suggested_day}` : ''}</p>
                        <h3 style={{ fontSize:'16px',fontWeight:700 }}>{workout.title}</h3>
                      </div>
                    </div>
                    <span className="badge badge-muted" style={{ fontSize:'10px',background:`${typeColor[workout.type]}20`,color:typeColor[workout.type],border:`0.5px solid ${typeColor[workout.type]}44` }}>
                      {typeLabel[workout.type]}
                    </span>
                  </div>

                  {workout.description && <p style={{ fontSize:'13px',color:'var(--rs-muted)',marginBottom:'10px',marginLeft:'28px' }}>{workout.description}</p>}

                  <div style={{ display:'flex',gap:'8px',marginLeft:'28px',flexWrap:'wrap' }}>
                    {workout.planned_km && (
                      <div style={{ display:'flex',alignItems:'center',gap:'4px',fontSize:'12px',color:'#ccc' }}>
                        <Footprints size={12} color="var(--rs-neon)" />{workout.planned_km} km
                      </div>
                    )}
                    {workout.planned_pace && (
                      <div style={{ display:'flex',alignItems:'center',gap:'4px',fontSize:'12px',color:'#ccc' }}>
                        <Clock size={12} color="var(--rs-neon)" />{workout.planned_pace}
                      </div>
                    )}
                  </div>

                  {workout.status === 'done' && (
                    <div style={{ marginTop:'10px',marginLeft:'28px',background:'var(--rs-card2)',borderRadius:'8px',padding:'8px 10px' }}>
                      <p style={{ fontSize:'11px',color:'var(--rs-neon)',marginBottom:'2px' }}>Concluído</p>
                      <div style={{ fontSize:'12px',color:'#ccc',display:'flex',gap:'12px' }}>
                        {workout.actual_km && <span>{workout.actual_km} km realizados</span>}
                        {workout.feeling && <span>Sensação: {workout.feeling.replace('_',' ')}</span>}
                      </div>
                      {workout.notes && <p style={{ fontSize:'12px',color:'var(--rs-muted)',marginTop:'4px' }}>{workout.notes}</p>}
                      {!!workout.result_images?.length && <p style={{ fontSize:'12px',color:'var(--rs-muted)',marginTop:'5px',display:'flex',alignItems:'center',gap:'5px' }}><ImageIcon size={12} /> {workout.result_images.length} comprovante{workout.result_images.length > 1 ? 's' : ''}</p>}
                    </div>
                  )}

                  {workout.status === 'skipped' && (
                    <div style={{ marginTop:'10px',marginLeft:'28px',background:'var(--rs-card2)',borderRadius:'8px',padding:'8px 10px' }}>
                      <p style={{ fontSize:'11px',color:'var(--rs-warning)',marginBottom:'2px' }}>Não realizado</p>
                      {workout.skip_reason && <p style={{ fontSize:'12px',color:'var(--rs-muted)' }}>{workout.skip_reason}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <nav className="tabbar">
        {[
          { href:'/student', icon:<Home size={22}/>, label:'Início' },
          { href:'/student/semana', icon:<Calendar size={22}/>, label:'Semana', active:true },
          { href:'/student/evolucao', icon:<BarChart2 size={22}/>, label:'Evolução' },
          { href:'/student/mensalidade', icon:<CreditCard size={22}/>, label:'Mensalidade' },
          { href:'/student/profile', icon:<User size={22}/>, label:'Perfil' },
        ].map(tab => (
          <Link key={tab.href} href={tab.href} className={`tab-item${tab.active?' active':''}`}>{tab.icon}<span>{tab.label}</span></Link>
        ))}
      </nav>
    </>
  )
}
