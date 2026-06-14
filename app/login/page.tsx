'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('E-mail ou senha inválidos.'); setLoading(false); return }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
    const role = profile?.role || data.user.user_metadata?.role
    router.push(role === 'coach' ? '/coach' : '/student')
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '360px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ background: 'var(--rs-neon)', color: '#000', fontWeight: 800, fontSize: '20px', padding: '6px 12px', borderRadius: '8px', letterSpacing: '0.5px' }}>RS</div>
            <span style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>Running</span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--rs-muted)', marginTop: '4px' }}>Assessoria premium de corrida</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--rs-muted)', marginBottom: '6px', display: 'block' }}>E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required autoComplete="email" />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--rs-muted)', marginBottom: '6px', display: 'block' }}>Senha</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" />
          </div>
          {error && <p style={{ fontSize: '13px', color: 'var(--rs-danger)', textAlign: 'center' }}>{error}</p>}
          <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: '8px' }}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--rs-muted)', marginTop: '24px' }}>
          Acesso exclusivo para alunos convidados.<br />Entre em contato com o professor Rui.
        </p>
      </div>
    </div>
  )
}
