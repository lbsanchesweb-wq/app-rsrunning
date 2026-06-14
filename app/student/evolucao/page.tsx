'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient, type Workout, BADGE_META, type BadgeKey } from '@/lib/supabase'
import { Home, Calendar, BarChart2, CreditCard, User, Share2 } from 'lucide-react'

type WeekData = { label: string; km: number; done: number; total: number }

export default function EvolucaoPage() {
  const [weekData, setWeekData] = useState<WeekData[]>([])
  const [badges, setBadges] = useState<BadgeKey[]>([])
  const [totalKm, setTotalKm] = useState(0)
  const [totalWorkouts, setTotalWorkouts] = useState(0)
  const [conclusionPct, setConclusionPct] = useState(0)
  const [loading, setLoading] = useState(true)
  const [shareMsg, setShareMsg] = useState('')
  const supabase = createClient()

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [{ data: stud }, { data: earnedBadges }, { data: weeks }] = await Promise.all([
      supabase.from('students').select('total_km,total_workouts,xp').eq('id', user.id).single(),
      supabase.from('badges').select('badge_key').eq('student_id', user.id),
      supabase.from('weeks').select('label,workouts(status,actual_km,planned_km)').eq('student_id', user.id).eq('status','published').order('date_start', { ascending: false }).limit(8),
    ])

    setTotalKm(stud?.total_km || 0)
    setTotalWorkouts(stud?.total_workouts || 0)
    setBadges((earnedBadges || []).map((b: any) => b.badge_key as BadgeKey))

    if (weeks) {
      const wd: WeekData[] = weeks.reverse().map((w: any) => {
        const wos = w.workouts || []
        const done = wos.filter((x: any) => x.status === 'done').length
        const total = wos.length
        const km = wos.reduce((s: number, x: any) => s + (x.actual_km || x.planned_km || 0), 0)
        return { label: w.label, km: Math.round(km * 10) / 10, done, total }
      })
      setWeekData(wd)
      const allDone = wd.reduce((s, w) => s + w.done, 0)
      const allTotal = wd.reduce((s, w) => s + w.total, 0)
      setConclusionPct(allTotal > 0 ? Math.round((allDone / allTotal) * 100) : 0)
    }
    setLoading(false)
  }

  const maxKm = Math.max(...weekData.map(w => w.km), 1)

  async function shareBadge(key: BadgeKey) {
    const meta = BADGE_META[key]
    const text = `Conquistei "${meta.name}" no RS Running!\n${meta.desc}\n\n#RSRunning #Corrida`
    if (navigator.share) {
      await navigator.share({ title: 'RS Running', text })
    } else {
      await navigator.clipboard.writeText(text)
      setShareMsg('Copiado! Cole no WhatsApp ou Instagram.')
      setTimeout(() => setShareMsg(''), 3000)
    }
  }

  const badgeColors: Record<string, string> = {
    first_workout: '#c8f000', perfect_week: '#4db8ff', on_fire_7d: '#ff6b00',
    no_rain_stops_me: '#a855f7', machine_10weeks: '#00d4d4', legend_1year: '#ffd700',
    three_digits_100km: '#4db8ff', half_marathon_everyday: '#00e86e',
    laser_beam: '#ff3333', iron_legs: '#00ff88', chaos_rhythm: '#8888ff', climb_climb: '#ff8c00',
  }

  if (loading) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100dvh' }}><div style={{ color:'var(--rs-neon)' }}>Carregando...</div></div>

  return (
    <>
      <div className="topbar">
        <div style={{ display:'flex',alignItems:'center',gap:'8px' }}>
          <div style={{ background:'var(--rs-neon)',color:'#000',fontWeight:800,fontSize:'14px',padding:'4px 8px',borderRadius:'6px' }}>RS</div>
          <span style={{ fontSize:'14px',fontWeight:600,letterSpacing:'1px' }}>Evolução</span>
        </div>
        <span style={{ fontSize:'12px',color:'var(--rs-muted)' }}>{totalKm.toFixed(1)} km totais</span>
      </div>

      <div className="page fade-up">
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'8px',marginBottom:'12px' }}>
          {[
            { val: `${totalKm.toFixed(0)} km`, label: 'Acumulado' },
            { val: String(totalWorkouts), label: 'Treinos feitos' },
            { val: `${conclusionPct}%`, label: 'Conclusão' },
          ].map(s => (
            <div key={s.label} style={{ background:'var(--rs-card)',border:'0.5px solid var(--rs-border)',borderRadius:'12px',padding:'10px 8px',textAlign:'center' }}>
              <div style={{ fontSize:'18px',fontWeight:800,color:'var(--rs-neon)' }}>{s.val}</div>
              <div style={{ fontSize:'10px',color:'var(--rs-muted)',marginTop:'2px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {weekData.length > 0 && (
          <div className="card" style={{ marginBottom:'12px' }}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px' }}>
              <p style={{ fontSize:'13px',fontWeight:700 }}>Volume semanal (km)</p>
              <span style={{ fontSize:'11px',color:'var(--rs-neon)',fontWeight:600 }}>últimas {weekData.length} semanas</span>
            </div>
            <div style={{ display:'flex',gap:'5px',alignItems:'flex-end',height:'80px',marginBottom:'6px' }}>
              {weekData.map((w, i) => (
                <div key={i} style={{ flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'2px',height:'100%',justifyContent:'flex-end' }}>
                  <span style={{ fontSize:'8px',color:'var(--rs-muted)' }}>{w.km}</span>
                  <div style={{ width:'100%',background: w.km > 0 ? 'var(--rs-neon)' : 'var(--rs-card2)',borderRadius:'3px 3px 0 0',height:`${Math.max((w.km/maxKm)*100,4)}%`,border: w.km === 0 ? '0.5px solid var(--rs-border)' : 'none' }} />
                </div>
              ))}
            </div>
            <div style={{ display:'flex',gap:'5px' }}>
              {weekData.map((w,i) => (
                <div key={i} style={{ flex:1,textAlign:'center',fontSize:'8px',color:'var(--rs-muted)' }}>
                  {w.label.split(' ')[0]}
                </div>
              ))}
            </div>
          </div>
        )}

        {shareMsg && (
          <div className="card" style={{ marginBottom:'12px',background:'#c8f00010',borderColor:'#c8f00044',textAlign:'center' }}>
            <p style={{ fontSize:'13px',color:'var(--rs-neon)',fontWeight:600 }}>{shareMsg}</p>
          </div>
        )}

        <p style={{ fontSize:'11px',color:'var(--rs-muted)',textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:'10px' }}>
          Insígnias conquistadas ({badges.length})
        </p>

        {badges.length === 0 ? (
          <div className="card" style={{ textAlign:'center',padding:'24px',marginBottom:'12px' }}>
            <p style={{ fontSize:'13px',color:'var(--rs-muted)' }}>Complete treinos para conquistar suas primeiras insígnias!</p>
          </div>
        ) : (
          <div style={{ display:'flex',flexDirection:'column',gap:'8px',marginBottom:'12px' }}>
            {badges.map(key => {
              const meta = BADGE_META[key]
              const color = badgeColors[key] || 'var(--rs-neon)'
              return (
                <div key={key} className="card" style={{ display:'flex',alignItems:'center',gap:'12px' }}>
                  <div style={{ width:'44px',height:'44px',borderRadius:'50%',background:`${color}15`,border:`1.5px solid ${color}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                    <span style={{ fontSize:'20px' }}>⭐</span>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700,fontSize:'14px',marginBottom:'2px' }}>{meta.name}</div>
                    <div style={{ fontSize:'12px',color:'var(--rs-muted)' }}>{meta.desc}</div>
                    <div style={{ fontSize:'11px',color:'var(--rs-neon)',marginTop:'2px' }}>+{meta.xp} XP</div>
                  </div>
                  <button onClick={() => shareBadge(key)} style={{ background:'none',border:'0.5px solid var(--rs-border)',borderRadius:'8px',padding:'6px 8px',color:'var(--rs-muted)',cursor:'pointer' }}>
                    <Share2 size={14} />
                  </button>
                </div>
              )
            })}
          </div>
        )}

        <p style={{ fontSize:'11px',color:'var(--rs-muted)',textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:'10px' }}>
          Bloqueadas ({Object.keys(BADGE_META).length - badges.length})
        </p>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px' }}>
          {(Object.keys(BADGE_META) as BadgeKey[]).filter(k => !badges.includes(k)).slice(0,4).map(key => {
            const meta = BADGE_META[key]
            return (
              <div key={key} className="card" style={{ opacity:0.4,textAlign:'center',padding:'12px 8px' }}>
                <div style={{ fontSize:'22px',marginBottom:'4px' }}>🔒</div>
                <div style={{ fontSize:'11px',fontWeight:600 }}>{meta.name}</div>
                <div style={{ fontSize:'10px',color:'var(--rs-muted)',marginTop:'2px' }}>{meta.desc}</div>
              </div>
            )
          })}
        </div>
      </div>

      <nav className="tabbar">
        {[
          { href:'/student', icon:<Home size={22}/>, label:'Início' },
          { href:'/student/semana', icon:<Calendar size={22}/>, label:'Semana' },
          { href:'/student/evolucao', icon:<BarChart2 size={22}/>, label:'Evolução', active:true },
          { href:'/student/mensalidade', icon:<CreditCard size={22}/>, label:'Mensalidade' },
          { href:'/student/profile', icon:<User size={22}/>, label:'Perfil' },
        ].map(tab => (
          <Link key={tab.href} href={tab.href} className={`tab-item${tab.active?' active':''}`}>{tab.icon}<span>{tab.label}</span></Link>
        ))}
      </nav>
    </>
  )
}
