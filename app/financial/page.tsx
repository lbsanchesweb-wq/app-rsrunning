'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient, type Payment, type Profile } from '@/lib/supabase'
import { Home, Users, Dumbbell, CreditCard, User, CheckCircle2, Clock, AlertCircle } from 'lucide-react'

type PaymentWithStudent = Payment & { student_name: string }

export default function FinancialPage() {
  const [payments, setPayments] = useState<PaymentWithStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: studs } = await supabase.from('profiles').select('id,name').eq('role','student')
    const { data: pays } = await supabase.from('payments').select('*').eq('coach_id', user.id).order('created_at', { ascending: false })

    const merged: PaymentWithStudent[] = (pays || []).map((p: Payment) => ({
      ...p,
      student_name: studs?.find((s: any) => s.id === p.student_id)?.name || '—',
    }))
    setPayments(merged)
    setLoading(false)
  }

  async function markPaid(id: string) {
    setUpdating(id)
    await supabase.from('payments').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', id)
    setUpdating(null)
    loadData()
  }

  const received = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0)
  const pending = payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0)
  const overdue = payments.filter(p => p.status === 'overdue').reduce((s, p) => s + p.amount, 0)

  const fmt = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`

  if (loading) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100dvh' }}><div style={{ color:'var(--rs-neon)' }}>Carregando...</div></div>

  return (
    <>
      <div className="topbar">
        <div style={{ display:'flex',alignItems:'center',gap:'8px' }}>
          <div style={{ background:'var(--rs-neon)',color:'#000',fontWeight:800,fontSize:'14px',padding:'4px 8px',borderRadius:'6px' }}>RS</div>
          <span style={{ fontSize:'14px',fontWeight:600,letterSpacing:'1px' }}>Financeiro</span>
        </div>
      </div>

      <div className="page fade-up">
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'12px' }}>
          <div style={{ background:'var(--rs-card)',border:'0.5px solid #00e67633',borderRadius:'14px',padding:'12px' }}>
            <div style={{ fontSize:'11px',color:'var(--rs-muted)',marginBottom:'4px' }}>Recebido</div>
            <div style={{ fontSize:'18px',fontWeight:800,color:'var(--rs-ok)' }}>{fmt(received)}</div>
          </div>
          <div style={{ background:'var(--rs-card)',border:'0.5px solid #ff980033',borderRadius:'14px',padding:'12px' }}>
            <div style={{ fontSize:'11px',color:'var(--rs-muted)',marginBottom:'4px' }}>Pendente</div>
            <div style={{ fontSize:'18px',fontWeight:800,color:'var(--rs-warning)' }}>{fmt(pending + overdue)}</div>
          </div>
        </div>

        <p style={{ fontSize:'11px',color:'var(--rs-muted)',textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:'10px' }}>Mensalidades</p>

        {payments.length === 0 ? (
          <div className="card" style={{ textAlign:'center',padding:'28px' }}>
            <p style={{ fontSize:'13px',color:'var(--rs-muted)' }}>Nenhuma mensalidade cadastrada ainda.</p>
          </div>
        ) : (
          <div style={{ display:'flex',flexDirection:'column',gap:'8px' }}>
            {payments.map(p => (
              <div key={p.id} className="card">
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'6px' }}>
                  <div>
                    <div style={{ fontWeight:700,fontSize:'14px' }}>{p.student_name}</div>
                    <div style={{ fontSize:'12px',color:'var(--rs-muted)' }}>{p.month}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontWeight:800,fontSize:'16px' }}>{fmt(p.amount)}</div>
                    {p.due_date && <div style={{ fontSize:'11px',color:'var(--rs-muted)' }}>venc. {new Date(p.due_date).toLocaleDateString('pt-BR')}</div>}
                  </div>
                </div>

                {p.status === 'paid' ? (
                  <div style={{ display:'flex',alignItems:'center',gap:'6px',color:'var(--rs-ok)',fontSize:'12px' }}>
                    <CheckCircle2 size={14} />
                    <span>Pago em {p.paid_at ? new Date(p.paid_at).toLocaleDateString('pt-BR') : '—'}</span>
                  </div>
                ) : (
                  <button className="btn-primary" onClick={() => markPaid(p.id)} disabled={updating === p.id} style={{ marginTop:'4px' }}>
                    {updating === p.id ? 'Confirmando...' : 'Confirmar pagamento'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <nav className="tabbar">
        {[
          { href:'/coach', icon:<Home size={22}/>, label:'Início' },
          { href:'/coach/alunos', icon:<Users size={22}/>, label:'Alunos' },
          { href:'/training', icon:<Dumbbell size={22}/>, label:'Treinos' },
          { href:'/financial', icon:<CreditCard size={22}/>, label:'Financeiro', active:true },
          { href:'/profile-coach', icon:<User size={22}/>, label:'Perfil' },
        ].map(tab => (
          <Link key={tab.href} href={tab.href} className={`tab-item${tab.active?' active':''}`}>{tab.icon}<span>{tab.label}</span></Link>
        ))}
      </nav>
    </>
  )
}
