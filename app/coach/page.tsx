'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient, type Profile } from '@/lib/supabase'
import { Home, Users, Dumbbell, CreditCard, User, AlertCircle, CheckCircle2, Clock } from 'lucide-react'

type StudentSummary = {
  id: string; name: string; avatar_url?: string
  week?: { label: string; done: number; skipped: number; pending: number; total: number; status: string }
  payment?: { status: string; month: string }
}

export default function CoachPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [students, setStudents] = useState<StudentSummary[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    setProfile(prof)

    const { data: studs } = await supabase.from('profiles').select('*').eq('role', 'student').order('name')
    if (!studs) { setLoading(false); return }

    const summaries: StudentSummary[] = await Promise.all(studs.map(async (s) => {
      const [{ data: weeks }, { data: payments }] = await Promise.all([
        supabase.from('weeks').select('*, workouts(status)').eq('student_id', s.id).eq('status', 'published').order('date_start', { ascending: false }).limit(1),
        supabase.from('payments').select('*').eq('student_id', s.id).order('created_at', { ascending: false }).limit(1),
      ])
      const w = weeks?.[0]
      const done = w?.workouts?.filter((wo: any) => wo.status === 'done').length || 0
      const skipped = w?.workouts?.filter((wo: any) => wo.status === 'skipped').length || 0
      const total = w?.workouts?.length || 0
      const pending = Math.max(total - done - skipped, 0)
      return {
        id: s.id, name: s.name, avatar_url: s.avatar_url,
        week: w ? { label: w.label, done, skipped, pending, total, status: w.status } : undefined,
        payment: payments?.[0] ? { status: payments[0].status, month: payments[0].month } : undefined,
      }
    }))
    setStudents(summaries)
    setLoading(false)
  }

  const noWeek = students.filter(s => !s.week).length
  const pendingPayments = students.filter(s => s.payment?.status !== 'paid').length

  if (loading) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100dvh' }}><div style={{ color:'var(--rs-neon)',fontSize:'14px' }}>Carregando...</div></div>

  return (
    <>
      <div className="topbar">
        <div style={{ display:'flex',alignItems:'center',gap:'8px' }}>
          <div style={{ background:'var(--rs-neon)',color:'#000',fontWeight:800,fontSize:'14px',padding:'4px 8px',borderRadius:'6px' }}>RS</div>
          <span style={{ fontSize:'14px',fontWeight:600,letterSpacing:'1px' }}>Coach</span>
        </div>
        <span style={{ fontSize:'12px',color:'var(--rs-muted)' }}>Olá, {profile?.name?.split(' ')[0]}</span>
      </div>

      <div className="page fade-up">
        <div className="card" style={{ marginBottom:'12px',background:'linear-gradient(135deg,#1a1a00,#141414)',borderColor:'#c8f00033' }}>
          <p className="label-neon" style={{ marginBottom:'4px' }}>Operação semanal</p>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginTop:'12px' }}>
            <div style={{ background:'var(--rs-card2)',borderRadius:'10px',padding:'10px 12px' }}>
              <div style={{ fontSize:'22px',fontWeight:800,color:'var(--rs-neon)' }}>{students.length}</div>
              <div style={{ fontSize:'11px',color:'var(--rs-muted)' }}>Alunos ativos</div>
            </div>
            <div style={{ background:'var(--rs-card2)',borderRadius:'10px',padding:'10px 12px' }}>
              <div style={{ fontSize:'22px',fontWeight:800,color: noWeek > 0 ? 'var(--rs-warning)' : 'var(--rs-neon)' }}>{noWeek}</div>
              <div style={{ fontSize:'11px',color:'var(--rs-muted)' }}>Sem semana</div>
            </div>
          </div>
        </div>

        {noWeek > 0 && (
          <div className="card" style={{ marginBottom:'12px',borderColor:'#ff980044',background:'#ff980008' }}>
            <div style={{ display:'flex',alignItems:'center',gap:'8px' }}>
              <AlertCircle size={18} color="var(--rs-warning)" />
              <p style={{ fontSize:'13px',fontWeight:600,color:'var(--rs-warning)' }}>{noWeek} aluno{noWeek > 1 ? 's' : ''} sem treinos publicados</p>
            </div>
            <Link href="/training" style={{ display:'block',marginTop:'10px' }}>
              <button className="btn-ghost" style={{ width:'100%' }}>Publicar treinos agora</button>
            </Link>
          </div>
        )}

        {pendingPayments > 0 && (
          <div className="card" style={{ marginBottom:'12px',borderColor:'#ff444444',background:'#ff444408' }}>
            <div style={{ display:'flex',alignItems:'center',gap:'8px' }}>
              <CreditCard size={18} color="var(--rs-danger)" />
              <p style={{ fontSize:'13px',fontWeight:600,color:'var(--rs-danger)' }}>{pendingPayments} pagamento{pendingPayments > 1 ? 's' : ''} pendente{pendingPayments > 1 ? 's' : ''}</p>
            </div>
            <Link href="/financial" style={{ display:'block',marginTop:'10px' }}>
              <button className="btn-ghost" style={{ width:'100%',borderColor:'var(--rs-danger)',color:'var(--rs-danger)' }}>Ver financeiro</button>
            </Link>
          </div>
        )}

        <p style={{ fontSize:'11px',color:'var(--rs-muted)',textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:'10px',marginTop:'4px' }}>Alunos</p>
        <div style={{ display:'flex',flexDirection:'column',gap:'8px' }}>
          {students.map(s => (
            <Link key={s.id} href={`/coach/${s.id}`} style={{ textDecoration:'none' }}>
              <div className="card" style={{ display:'flex',alignItems:'center',gap:'12px',cursor:'pointer' }}>
                <div className="avatar-initials" style={{ width:'40px',height:'40px' }}>
                  {s.avatar_url
                    ? <img src={s.avatar_url} alt={s.name} className="avatar" style={{ width:'40px',height:'40px' }} />
                    : s.name.split(' ').map(n=>n[0]).slice(0,2).join('')
                  }
                </div>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontWeight:700,fontSize:'14px',marginBottom:'2px' }}>{s.name}</div>
                  {s.week
                    ? <div style={{ fontSize:'12px',color:'var(--rs-muted)' }}>{s.week.done} concluidos · {s.week.skipped} nao realizados · {s.week.pending} pendentes</div>
                    : <div style={{ fontSize:'12px',color:'var(--rs-warning)' }}>Sem semana publicada</div>
                  }
                </div>
                <div style={{ display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'4px' }}>
                  {s.week
                    ? <span className="badge badge-neon">{Math.round((s.week.done/Math.max(s.week.total,1))*100)}%</span>
                    : <span className="badge badge-muted">—</span>
                  }
                  {s.payment && s.payment.status !== 'paid' && (
                    <span className="badge badge-danger" style={{ fontSize:'9px' }}>Pgto pendente</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <nav className="tabbar">
        {[
          { href:'/coach', icon:<Home size={22}/>, label:'Início', active:true },
          { href:'/coach/alunos', icon:<Users size={22}/>, label:'Alunos' },
          { href:'/training', icon:<Dumbbell size={22}/>, label:'Treinos' },
          { href:'/financial', icon:<CreditCard size={22}/>, label:'Financeiro' },
          { href:'/profile-coach', icon:<User size={22}/>, label:'Perfil' },
        ].map(tab => (
          <Link key={tab.href} href={tab.href} className={`tab-item${tab.active?' active':''}`}>{tab.icon}<span>{tab.label}</span></Link>
        ))}
      </nav>
    </>
  )
}
