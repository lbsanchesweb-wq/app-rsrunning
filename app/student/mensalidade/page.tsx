'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient, type Payment } from '@/lib/supabase'
import { Home, Calendar, BarChart2, CreditCard, User, Copy, CheckCircle2 } from 'lucide-react'

export default function MensalidadePage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('payments').select('*').eq('student_id', user.id).order('created_at', { ascending: false })
      setPayments(data || [])
      setLoading(false)
    }
    load()
  }, [])

  async function copyPix(key: string) {
    await navigator.clipboard.writeText(key)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const pending = payments.find(p => p.status !== 'paid')
  const history = payments.filter(p => p.status === 'paid')

  const statusLabel: Record<string, string> = { pending: 'Pendente', paid: 'Pago', overdue: 'Atrasado' }
  const statusClass: Record<string, string> = { pending: 'badge-warning', paid: 'badge-success', overdue: 'badge-danger' }

  if (loading) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100dvh' }}><div style={{ color:'var(--rs-neon)' }}>Carregando...</div></div>

  return (
    <>
      <div className="topbar">
        <div style={{ display:'flex',alignItems:'center',gap:'8px' }}>
          <div style={{ background:'var(--rs-neon)',color:'#000',fontWeight:800,fontSize:'14px',padding:'4px 8px',borderRadius:'6px' }}>RS</div>
          <span style={{ fontSize:'14px',fontWeight:600,letterSpacing:'1px' }}>Mensalidade</span>
        </div>
      </div>

      <div className="page fade-up">
        {pending ? (
          <div className="card" style={{ marginBottom:'12px',borderColor: pending.status === 'overdue' ? '#ff444444' : '#ff980044',background: pending.status === 'overdue' ? '#ff444408' : '#ff980008' }}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'8px' }}>
              <div>
                <p style={{ fontSize:'11px',color:'var(--rs-muted)',marginBottom:'2px' }}>{pending.month}</p>
                <p style={{ fontSize:'24px',fontWeight:800 }}>R$ {pending.amount.toFixed(2).replace('.',',')}</p>
              </div>
              <span className={`badge ${statusClass[pending.status]}`}>{statusLabel[pending.status]}</span>
            </div>
            {pending.due_date && (
              <p style={{ fontSize:'12px',color:'var(--rs-muted)',marginBottom:'12px' }}>
                Vencimento: {new Date(pending.due_date).toLocaleDateString('pt-BR')}
              </p>
            )}
            {pending.pix_key && (
              <>
                <p style={{ fontSize:'11px',color:'var(--rs-muted)',marginBottom:'6px' }}>Chave Pix</p>
                <div style={{ display:'flex',alignItems:'center',gap:'8px',background:'var(--rs-card2)',borderRadius:'10px',padding:'10px 12px' }}>
                  <code style={{ flex:1,fontSize:'13px',color:'var(--rs-text)',fontFamily:'monospace',wordBreak:'break-all' }}>{pending.pix_key}</code>
                  <button onClick={() => copyPix(pending.pix_key!)} style={{ background:'none',border:'none',color: copied ? 'var(--rs-neon)' : 'var(--rs-muted)',cursor:'pointer',flexShrink:0 }}>
                    {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                  </button>
                </div>
                {copied && <p style={{ fontSize:'11px',color:'var(--rs-neon)',marginTop:'6px',textAlign:'center' }}>Chave copiada!</p>}
                <p style={{ fontSize:'11px',color:'var(--rs-muted)',marginTop:'10px',textAlign:'center' }}>
                  Após o pagamento, aguarde a confirmação do professor Rui.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="card" style={{ marginBottom:'12px',textAlign:'center',padding:'24px',background:'#00e67608',borderColor:'#00e67633' }}>
            <CheckCircle2 size={32} color="var(--rs-success)" style={{ marginBottom:'8px' }} />
            <p style={{ fontWeight:700,marginBottom:'4px' }}>Mensalidade em dia!</p>
            <p style={{ fontSize:'13px',color:'var(--rs-muted)' }}>Nenhum pagamento pendente.</p>
          </div>
        )}

        {history.length > 0 && (
          <>
            <p style={{ fontSize:'11px',color:'var(--rs-muted)',textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:'10px' }}>Histórico</p>
            <div className="card">
              {history.map((p, i) => (
                <div key={p.id} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom: i < history.length-1 ? '0.5px solid var(--rs-border)' : 'none' }}>
                  <div>
                    <p style={{ fontWeight:600,fontSize:'14px' }}>{p.month}</p>
                    {p.paid_at && <p style={{ fontSize:'11px',color:'var(--rs-muted)' }}>Pago em {new Date(p.paid_at).toLocaleDateString('pt-BR')}</p>}
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <p style={{ fontWeight:700,fontSize:'14px' }}>R$ {p.amount.toFixed(2).replace('.',',')}</p>
                    <span className="badge badge-success" style={{ fontSize:'10px' }}>Pago</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <nav className="tabbar">
        {[
          { href:'/student', icon:<Home size={22}/>, label:'Início' },
          { href:'/student/semana', icon:<Calendar size={22}/>, label:'Semana' },
          { href:'/student/evolucao', icon:<BarChart2 size={22}/>, label:'Evolução' },
          { href:'/student/mensalidade', icon:<CreditCard size={22}/>, label:'Mensalidade', active:true },
          { href:'/student/profile', icon:<User size={22}/>, label:'Perfil' },
        ].map(tab => (
          <Link key={tab.href} href={tab.href} className={`tab-item${tab.active?' active':''}`}>{tab.icon}<span>{tab.label}</span></Link>
        ))}
      </nav>
    </>
  )
}
