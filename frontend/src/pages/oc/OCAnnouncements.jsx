// ─────────────────────────────────────────────────────────────
// OCAnnouncements.jsx
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../utils/formatDate'

export default function OCAnnouncements() {
  const { profile } = useAuth()
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', body: '', audience: 'all', is_pinned: false, send_email: false })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('announcements').select('*').order('created_at', { ascending: false }).then(({ data }) => { setAnnouncements(data || []); setLoading(false) })
  }, [])

  async function handleSave() {
    if (!form.title || !form.body) return
    setSaving(true)
    const { data } = await supabase.from('announcements').insert({ ...form, created_by: profile?.id }).select().single()
    if (data) setAnnouncements(prev => [data, ...prev])
    setShowForm(false); setForm({ title: '', body: '', audience: 'all', is_pinned: false, send_email: false }); setSaving(false)
  }

  async function handleDelete(id) {
    await supabase.from('announcements').delete().eq('id', id)
    setAnnouncements(prev => prev.filter(a => a.id !== id))
  }

  const AUDIENCE_COLORS = { all: { bg: 'rgba(0,212,255,0.1)', color: 'var(--cyan)', border: 'rgba(0,212,255,0.25)' }, general: { bg: 'rgba(16,185,129,0.1)', color: '#10B981', border: 'rgba(16,185,129,0.25)' }, executive: { bg: 'rgba(167,139,250,0.1)', color: '#A78BFA', border: 'rgba(167,139,250,0.25)' }, oc: { bg: 'rgba(255,45,155,0.1)', color: 'var(--pink)', border: 'rgba(255,45,155,0.25)' } }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <p style={{ color: 'var(--cyan)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>System</p>
          <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 32, fontWeight: 800, color: '#fff', textTransform: 'uppercase' }}>Announcements</h1>
        </div>
        <button onClick={() => setShowForm(true)} style={{ padding: '10px 20px', background: 'var(--cyan)', border: 'none', borderRadius: 8, color: '#0A0E1A', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>+ Post Announcement</button>
      </div>

      {showForm && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 14, padding: 24, marginBottom: 24 }}>
          <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 600, marginBottom: 20 }}>New Announcement</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={LS}>Title</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Announcement title" style={IS} onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.4)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
            <div>
              <label style={LS}>Message</label>
              <textarea value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} rows={4} placeholder="Announcement body..." style={{ ...IS, resize: 'vertical' }} onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.4)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={LS}>Audience</label>
                <select value={form.audience} onChange={e => setForm(p => ({ ...p, audience: e.target.value }))} style={{ ...IS, cursor: 'pointer' }}>
                  <option value="all">All members</option>
                  <option value="general">General members only</option>
                  <option value="executive">Executive members only</option>
                  <option value="oc">OC only</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 24 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13 }}>
                  <input type="checkbox" checked={form.is_pinned} onChange={e => setForm(p => ({ ...p, is_pinned: e.target.checked }))} />
                  Pin to top of notice board
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13 }}>
                  <input type="checkbox" checked={form.send_email} onChange={e => setForm(p => ({ ...p, send_email: e.target.checked }))} />
                  Send email to audience
                </label>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button onClick={handleSave} disabled={saving} style={{ padding: '10px 24px', background: 'var(--cyan)', border: 'none', borderRadius: 8, color: '#0A0E1A', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>{saving ? 'Posting...' : 'Post Announcement'}</button>
            <button onClick={() => setShowForm(false)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading ? <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>Loading...</div>
          : announcements.length === 0 ? <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 48, fontSize: 13 }}>No announcements yet.</div>
          : announcements.map(a => {
            const ac = AUDIENCE_COLORS[a.audience] || AUDIENCE_COLORS.all
            return (
              <div key={a.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {a.is_pinned && <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.25)' }}>PINNED</span>}
                    <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{a.title}</h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: ac.bg, color: ac.color, border: `1px solid ${ac.border}`, textTransform: 'capitalize' }}>{a.audience}</span>
                    <button onClick={() => handleDelete(a.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>×</button>
                  </div>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6, marginBottom: 8 }}>{a.body}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>{formatDate(a.created_at)}</p>
              </div>
            )
          })
        }
      </div>
    </div>
  )
}

const LS = { display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }
const IS = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif' }