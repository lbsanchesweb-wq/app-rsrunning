'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { createClient, type Profile, type Student, BADGE_META, type BadgeKey } from '@/lib/supabase'
import { Home, Calendar, BarChart2, CreditCard, User, Camera, LogOut } from 'lucide-react'

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [student, setStudent] = useState<Student | null>(null)
  const [badges, setBadges] = useState<BadgeKey[]>([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [goal, setGoal] = useState('')
  const [nextRace, setNextRace] = useState('')
  const [saved, setSaved] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const [{ data: prof }, { data: stud }, { data: b }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('students').select('*').eq('id', user.id).single(),
      supabase.from('badges').select('badge_key').eq('student_id', user.id),
    ])
    setProfile(prof); setStudent(stud)
    setName(prof?.name || ''); setBirthDate(prof?.birth_date || ''); setGoal(stud?.goal || ''); setNextRace(stud?.next_race || '')
    setBadges((b || []).map((x: any) => x.badge_key as BadgeKey))
  }

  async function uploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${profile.id}/avatar.${ext}`
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id)
      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null)
    }
    setUploading(false)
  }

  async function saveProfile() {
    if (!profile) return
    setSaving(true)
    await Promise.all([
      supabase.from('profiles').update({ name, birth_date: birthDate || null }).eq('id', profile.id),
      supabase.from('students').update({ goal, next_race: nextRace }).eq('id', profile.id),
    ])
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function logout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const initials = profile?.name.split(' ').map(n => n[0]).slice(0,2).join('') || '?'

  return (
    <>
      <div className="topbar">
        <div style={{ display:'flex',alignItems:'center',gap:'8px' }}>
          <div style={{ background:'var(--rs-neon)',color:'#000',fontWeight:800,fontSize:'14px',padding:'4px 8px',borderRadius:'6px' }}>RS</div>
          <span style={{ fontSize:'14px',fontWeight:600,letterSpacing:'1px' }}>Perfil</span>
        </div>
        <button onClick={logout} style={{ background:'none',border:'none',color:'var(--rs-muted)',cursor:'pointer',display:'flex',alignItems:'center',gap:'4px',fontSize:'12px' }}>
          <LogOut size={16} /> Sair
        </button>
      </div>

      <div className="page fade-up">
        <div className="card" style={{ textAlign:'center',padding:'24px 16px',marginBottom:'12px' }}>
          <div style={{ position:'relative',display:'inline-block',marginBottom:'12px' }}>
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt="Avatar" style={{ width:'80px',height:'80px',borderRadius:'50%',objectFit:'cover',border:'2px solid var(--rs-neon)' }} />
              : <div style={{ width:'80px',height:'80px',borderRadius:'50%',background:'var(--rs-card2)',border:'2px solid var(--rs-neon)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'28px',fontWeight:800,color:'var(--rs-neon)',margin:'0 auto' }}>{initials}</div>
            }
            <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ position:'absolute',bottom:0,right:0,background:'var(--rs-neon)',border:'none',borderRadius:'50%',width:'26px',height:'26px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer' }}>
              <Camera size={13} color="#000" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={uploadAvatar} style={{ display:'none' }} />
          </div>
          {uploading && <p style={{ fontSize:'11px',color:'var(--rs-neon)',marginBottom:'4px' }}>Salvando foto...</p>}
          <div style={{ fontWeight:800,fontSize:'20px',marginBottom:'2px' }}>{profile?.name}</div>
          <div style={{ fontSize:'13px',color:'var(--rs-muted)' }}>Aluno RS Running</div>

          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'8px',marginTop:'16px' }}>
            {[
              { val: `${(student?.total_km || 0).toFixed(0)} km`, label: 'Acumulado' },
              { val: String(student?.total_workouts || 0), label: 'Treinos' },
              { val: `${student?.xp || 0} XP`, label: 'Pontos' },
            ].map(s => (
              <div key={s.label} style={{ background:'var(--rs-card2)',borderRadius:'10px',padding:'8px' }}>
                <div style={{ fontSize:'16px',fontWeight:800,color:'var(--rs-neon)' }}>{s.val}</div>
                <div style={{ fontSize:'10px',color:'var(--rs-muted)',marginTop:'2px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ marginBottom:'12px' }}>
          <p style={{ fontSize:'11px',color:'var(--rs-muted)',textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:'12px' }}>Editar perfil</p>
          <div style={{ display:'flex',flexDirection:'column',gap:'10px' }}>
            <div>
              <label style={{ fontSize:'12px',color:'var(--rs-muted)',marginBottom:'5px',display:'block' }}>Nome</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome" />
            </div>
            <div>
              <label style={{ fontSize:'12px',color:'var(--rs-muted)',marginBottom:'5px',display:'block' }}>Data de nascimento</label>
              <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize:'12px',color:'var(--rs-muted)',marginBottom:'5px',display:'block' }}>Objetivo</label>
              <input value={goal} onChange={e => setGoal(e.target.value)} placeholder="Ex: Meia maratona sub 2h" />
            </div>
            <div>
              <label style={{ fontSize:'12px',color:'var(--rs-muted)',marginBottom:'5px',display:'block' }}>Próxima prova</label>
              <input value={nextRace} onChange={e => setNextRace(e.target.value)} placeholder="Ex: SP City 21K" />
            </div>
            {saved && <p style={{ fontSize:'12px',color:'var(--rs-neon)',textAlign:'center' }}>Perfil salvo!</p>}
            <button className="btn-primary" onClick={saveProfile} disabled={saving}>{saving ? 'Salvando...' : 'Salvar alterações'}</button>
          </div>
        </div>

        {badges.length > 0 && (
          <>
            <p style={{ fontSize:'11px',color:'var(--rs-muted)',textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:'10px' }}>Insígnias ({badges.length})</p>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px' }}>
              {badges.map(key => {
                const meta = BADGE_META[key]
                return (
                  <div key={key} className="card" style={{ textAlign:'center',padding:'10px 6px' }}>
                    <div style={{ fontSize:'22px',marginBottom:'4px' }}>⭐</div>
                    <div style={{ fontSize:'10px',fontWeight:600,lineHeight:'1.3' }}>{meta.name}</div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      <nav className="tabbar">
        {[
          { href:'/student', icon:<Home size={22}/>, label:'Início' },
          { href:'/student/semana', icon:<Calendar size={22}/>, label:'Semana' },
          { href:'/student/evolucao', icon:<BarChart2 size={22}/>, label:'Evolução' },
          { href:'/student/mensalidade', icon:<CreditCard size={22}/>, label:'Mensalidade' },
          { href:'/student/profile', icon:<User size={22}/>, label:'Perfil', active:true },
        ].map(tab => (
          <Link key={tab.href} href={tab.href} className={`tab-item${tab.active?' active':''}`}>{tab.icon}<span>{tab.label}</span></Link>
        ))}
      </nav>
    </>
  )
}
