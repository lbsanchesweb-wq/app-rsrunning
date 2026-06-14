'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { createClient, type Profile } from '@/lib/supabase'
import { Home, Users, Dumbbell, CreditCard, User, Camera, LogOut, Save } from 'lucide-react'

export default function CoachProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [name, setName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [bio, setBio] = useState('')
  const [pixKey, setPixKey] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    setProfile(prof)
    setName(prof?.name || '')
    setWhatsapp(prof?.whatsapp || '')
    setBio(prof?.bio || '')
  }

  async function uploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${profile.id}/avatar.${ext}`
    await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id)
    setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null)
    setUploading(false)
  }

  async function save() {
    if (!profile) return
    setSaving(true)
    await supabase.from('profiles').update({ name, whatsapp, bio }).eq('id', profile.id)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function logout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const initials = profile?.name.split(' ').map(n => n[0]).slice(0,2).join('') || 'RS'

  return (
    <>
      <div className="topbar">
        <div style={{ display:'flex',alignItems:'center',gap:'8px' }}>
          <div style={{ background:'var(--rs-neon)',color:'#000',fontWeight:800,fontSize:'14px',padding:'4px 8px',borderRadius:'6px' }}>RS</div>
          <span style={{ fontSize:'14px',fontWeight:600,letterSpacing:'1px' }}>Perfil</span>
        </div>
        <button onClick={logout} style={{ background:'none',border:'none',color:'var(--rs-muted)',cursor:'pointer',fontSize:'12px',display:'flex',alignItems:'center',gap:'4px' }}>
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
          <div style={{ fontWeight:800,fontSize:'20px' }}>{profile?.name}</div>
          <div style={{ fontSize:'13px',color:'var(--rs-muted)' }}>Professor RS Running</div>
        </div>

        <div className="card" style={{ marginBottom:'12px' }}>
          <p style={{ fontSize:'11px',color:'var(--rs-muted)',textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:'12px' }}>Dados do perfil</p>
          <div style={{ display:'flex',flexDirection:'column',gap:'10px' }}>
            <div>
              <label style={{ fontSize:'12px',color:'var(--rs-muted)',marginBottom:'5px',display:'block' }}>Nome público</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Rui Sanches" />
            </div>
            <div>
              <label style={{ fontSize:'12px',color:'var(--rs-muted)',marginBottom:'5px',display:'block' }}>WhatsApp (com DDD)</label>
              <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="5519999999999" type="tel" />
            </div>
            <div>
              <label style={{ fontSize:'12px',color:'var(--rs-muted)',marginBottom:'5px',display:'block' }}>Mini bio</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Assessoria de corrida com foco em consistência..." rows={3} style={{ resize:'none' }} />
            </div>
            {saved && <p style={{ fontSize:'12px',color:'var(--rs-neon)',textAlign:'center' }}>Salvo!</p>}
            <button className="btn-primary" onClick={save} disabled={saving}>
              <Save size={14} style={{ display:'inline',marginRight:'6px',verticalAlign:'middle' }} />
              {saving ? 'Salvando...' : 'Salvar perfil'}
            </button>
          </div>
        </div>

        <div className="card">
          <p style={{ fontSize:'11px',color:'var(--rs-muted)',textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:'12px' }}>Chave Pix</p>
          <p style={{ fontSize:'12px',color:'var(--rs-muted)',marginBottom:'8px' }}>Exibida para alunos com mensalidade pendente.</p>
          <input value={pixKey} onChange={e => setPixKey(e.target.value)} placeholder="Chave Pix (telefone, CPF ou e-mail)" />
          <p style={{ fontSize:'11px',color:'var(--rs-muted)',marginTop:'8px' }}>Configure a chave Pix de cada mensalidade na página Financeiro.</p>
        </div>
      </div>

      <nav className="tabbar">
        {[
          { href:'/coach', icon:<Home size={22}/>, label:'Início' },
          { href:'/coach/alunos', icon:<Users size={22}/>, label:'Alunos' },
          { href:'/training', icon:<Dumbbell size={22}/>, label:'Treinos' },
          { href:'/financial', icon:<CreditCard size={22}/>, label:'Financeiro' },
          { href:'/profile-coach', icon:<User size={22}/>, label:'Perfil', active:true },
        ].map(tab => (
          <Link key={tab.href} href={tab.href} className={`tab-item${tab.active?' active':''}`}>{tab.icon}<span>{tab.label}</span></Link>
        ))}
      </nav>
    </>
  )
}
