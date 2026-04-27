import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase'
import { formatDate } from '../../utils/formatters'

export default function OCMessages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchMessages()
  }, [])

  async function fetchMessages() {
    setLoading(true)
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching messages:', error)
    } else {
      setMessages(data || [])
    }
    setLoading(false)
  }

  const filtered = messages.filter(m => 
    m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase()) ||
    m.subject?.toLowerCase().includes(search.toLowerCase()) ||
    m.message?.toLowerCase().includes(search.toLowerCase())
  )

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this message?')) return

    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting message:', error)
      alert('Failed to delete message: ' + error.message)
    } else {
      setMessages(messages.filter(m => m.id !== id))
      setSelected(null)
    }
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <p style={{ color: 'var(--cyan)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Communication</p>
          <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 32, fontWeight: 800, color: '#fff', textTransform: 'uppercase' }}>Contact Messages</h1>
        </div>
        <div style={{ position: 'relative' }}>
          <input 
            type="text" 
            placeholder="Search messages..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ 
              background: 'rgba(255,255,255,0.03)', 
              border: '1px solid var(--border)', 
              borderRadius: 8, 
              padding: '8px 16px 8px 36px', 
              color: '#fff', 
              fontSize: 13, 
              outline: 'none',
              width: 240
            }}
          />
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>🔍</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 450px' : '1fr', gap: 24, alignItems: 'start' }}>
        
        {/* Messages List */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>Loading messages...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 64, textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>📩</div>
              <p>No messages found.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
                  {['Sender', 'Subject', 'Date', 'Status'].map(h => (
                    <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(msg => (
                  <tr 
                    key={msg.id} 
                    onClick={() => setSelected(msg)}
                    style={{ 
                      borderBottom: '1px solid var(--border)', 
                      cursor: 'pointer', 
                      background: selected?.id === msg.id ? 'rgba(0,212,255,0.04)' : 'transparent',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => { if (selected?.id !== msg.id) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                    onMouseLeave={e => { if (selected?.id !== msg.id) e.currentTarget.style.background = 'transparent' }}
                  >
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, var(--cyan), #0066FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700 }}>
                          {msg.full_name?.[0]}
                        </div>
                        <div>
                          <p style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{msg.full_name}</p>
                          <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>{msg.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <p style={{ color: '#fff', fontSize: 13, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.subject}</p>
                    </td>
                    <td style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>
                      {formatDate(msg.created_at)}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)', textTransform: 'uppercase' }}>Received</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Selected Message Detail */}
        {selected && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 32, position: 'sticky', top: 20, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{selected.subject}</h2>
                <p style={{ color: 'var(--cyan)', fontSize: 12, fontWeight: 500 }}>From: {selected.full_name} ({selected.email})</p>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 24, lineHeight: 1 }}>×</button>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 24, minHeight: 120 }}>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {selected.message}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <a 
                href={`mailto:${selected.email}?subject=Re: ${selected.subject}`} 
                style={{ 
                  flex: 1, 
                  textAlign: 'center',
                  padding: '12px', 
                  background: 'var(--cyan)', 
                  border: 'none', 
                  borderRadius: 10, 
                  color: '#0A0E1A', 
                  fontSize: 13, 
                  fontWeight: 700, 
                  textDecoration: 'none',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Reply via Email
              </a>
              <button 
                onClick={() => handleDelete(selected.id)}
                style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, color: '#EF4444', cursor: 'pointer' }}
              >
                🗑️
              </button>
            </div>
            
            <p style={{ color: 'var(--text-muted)', fontSize: 11, textAlign: 'center', marginTop: 20 }}>
              Received on {new Date(selected.created_at).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
