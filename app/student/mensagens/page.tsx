'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { createClient, type Message, type Profile } from '@/lib/supabase'
import { Home, Calendar, BarChart2, CreditCard, User, Send, ArrowLeft } from 'lucide-react'

export default function MensagensPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [coach, setCoach] = useState<Profile | null>(null)
  const [me, setMe] = useState<Profile | null>(null)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => { loadData() }, [])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: myProf } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    setMe(myProf)
    const { data: coaches } = await supabase.from('profiles').select('*').eq('role', 'coach').limit(1)
    const c = coaches?.[0]
    setCoach(c || null)
    if (c) {
      await supabase.from('messages').update({ read: true }).eq('to_id', user.id).eq('from_id', c.id)
      const { data: msgs } = await supabase.from('messages').select('*')
        .or(`and(from_id.eq.${user.id},to_id.eq.${c.id}),and(from_id.eq.${c.id},to_id.eq.${user.id})`)
        .order('created_at')
      setMessages(msgs || [])
    }
  }

  async function sendMsg() {
    if (!text.trim() || !coach || !me) return
    setSending(true)
    const msg = { from_id: me.id, to_id: coach.id, content: text.trim(), read: false }
    const { data } = await supabase.from('messages').insert(msg).select().single()
    if (data) setMessages(prev => [...prev, data])
    setText('')
    setSending(false)
  }

  const fmt = (d: string) => new Date(d).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  return (
    <>
      <div className="topbar">
        <Link href="/student" style={{ color:'var(--rs-muted)' }}><ArrowLeft size={22} /></Link>
        <div style={{ display:'flex',alignItems:'center',gap:'8px' }}>
          <div style={{ width:'32px',height:'32px',borderRadius:'50%',background:'var(--rs-card2)',border:'1.5px solid var(--rs-neon)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:700,color:'var(--rs-neon)' }}>
            {coach?.avatar_url ? <img src={coach.avatar_url} style={{ width:'32px',height:'32px',borderRadius:'50%',objectFit:'cover' }} /> : 'RS'}
          </div>
          <div>
            <div style={{ fontSize:'13px',fontWeight:700 }}>{coach?.name || 'Professor Rui'}</div>
            <div style={{ fontSize:'10px',color:'var(--rs-neon)' }}>Online</div>
          </div>
        </div>
        <div style={{ width:'22px' }} />
      </div>

      <div style={{ padding:'12px 14px 80px',minHeight:'100dvh',display:'flex',flexDirection:'column',gap:'8px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign:'center',padding:'40px 20px',color:'var(--rs-muted)',fontSize:'13px' }}>
            Nenhuma mensagem ainda.<br />Fale com seu professor!
          </div>
        )}
        {messages.map(msg => {
          const isMe = msg.from_id === me?.id
          return (
            <div key={msg.id} style={{ display:'flex',justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth:'75%',background: isMe ? 'var(--rs-neon)' : 'var(--rs-card)',borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',padding:'10px 12px',border: isMe ? 'none' : '0.5px solid var(--rs-border)' }}>
                <p style={{ fontSize:'13px',color: isMe ? '#000' : 'var(--rs-text)',lineHeight:'1.5' }}>{msg.content}</p>
                <p style={{ fontSize:'10px',color: isMe ? '#00000066' : 'var(--rs-muted)',marginTop:'4px',textAlign:'right' }}>{fmt(msg.created_at)}</p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div style={{ position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:'480px',background:'#000',borderTop:'0.5px solid var(--rs-border)',padding:'10px 14px calc(10px + env(safe-area-inset-bottom))',display:'flex',gap:'8px' }}>
        <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMsg()} placeholder="Mensagem..." style={{ flex:1,padding:'10px 12px',borderRadius:'20px' }} />
        <button onClick={sendMsg} disabled={!text.trim() || sending} style={{ background:'var(--rs-neon)',border:'none',borderRadius:'50%',width:'40px',height:'40px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0 }}>
          <Send size={16} color="#000" />
        </button>
      </div>
    </>
  )
}
