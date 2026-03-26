import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase'
import { useAuth } from '../../context/AuthContext'
import { formatDateTime } from '../../utils/formatDate'

const EMPTY = { type: 'general', title: '', description: '', status: 'open', opens_at: '', closes_at: '' }

export default function OCRecruitment() {
  const { profile } = useAuth()
  const [cycles, setCycles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('recruitment_cycles').select('*').order('created_at', { ascending: false }).then(({ data }) => { setCycles(data || []); setLoading(false) })
  }, [])

  async function handleSave() {
    if (!form.title) {
      alert('Please enter a title for the recruitment cycle.')
      return
    }
    setSaving(true)
    console.log('Saving recruitment cycle:', form)

    // Sanitize dates: empty strings should be null
    const payload = {
      ...form,
      opens_at: form.opens_at || null,
      closes_at: form.closes_at || null,
      created_by: profile?.id
    }

    const { data, error } = await supabase
      .from('recruitment_cycles')
      .insert(payload)
      .select()
      .single()

    if (error) {
      console.error('Error creating recruitment cycle:', error)
      alert(`Failed to create cycle: ${error.message}`)
      setSaving(false)
      return
    }

    if (data) {
      setCycles(prev => [data, ...prev])
      setShowForm(false)
      setForm(EMPTY)
    }
    setSaving(false)
  }

  async function updateStatus(id, status) {
    await supabase.from('recruitment_cycles').update({ status }).eq('id', id)
    setCycles(prev => prev.map(c => c.id === id ? { ...c, status } : c))
  }

  const STATUS = { closed: { bg: 'rgba(107,114,128,0.1)', color: '#6B7280', border: 'rgba(107,114,128,0.25)' }, open: { bg: 'rgba(16,185,129,0.1)', color: '#10B981', border: 'rgba(16,185,129,0.25)' }, reviewing: { bg: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: 'rgba(245,158,11,0.25)' }, done: { bg: 'rgba(0,212,255,0.1)', color: 'var(--cyan)', border: 'rgba(0,212,255,0.25)' } }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <p style={{ color: 'var(--cyan)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Members</p>
          <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 32, fontWeight: 800, color: '#fff', textTransform: 'uppercase' }}>Recruitment</h1>
        </div>
        <button onClick={() => setShowForm(true)} style={{ padding: '10px 20px', background: 'var(--cyan)', border: 'none', borderRadius: 8, color: '#0A0E1A', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>+ New Cycle</button>
      </div>

      {showForm && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 14, padding: 24, marginBottom: 24 }}>
          <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Open New Recruitment Cycle</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={LS}>Title</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. General Member Drive 2025" style={IS} onFocus={e => e.target.style.borderColor='rgba(0,212,255,0.4)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
            </div>
            <div>
              <label style={LS}>Type</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} style={{ ...IS, cursor: 'pointer' }}>
                <option value="general">General Member</option>
                <option value="executive">Executive Member</option>
                <option value="oc">OC Member</option>
              </select>
            </div>
            <div>
              <label style={LS}>Opens At</label>
              <input type="datetime-local" value={form.opens_at} onChange={e => setForm(p => ({ ...p, opens_at: e.target.value }))} style={IS} onFocus={e => e.target.style.borderColor='rgba(0,212,255,0.4)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
            </div>
            <div>
              <label style={LS}>Closes At</label>
              <input type="datetime-local" value={form.closes_at} onChange={e => setForm(p => ({ ...p, closes_at: e.target.value }))} style={IS} onFocus={e => e.target.style.borderColor='rgba(0,212,255,0.4)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={LS}>Description (shown on Join page)</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} style={{ ...IS, resize: 'vertical' }} onFocus={e => e.target.style.borderColor='rgba(0,212,255,0.4)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button onClick={handleSave} disabled={saving} style={{ padding: '10px 24px', background: 'var(--cyan)', border: 'none', borderRadius: 8, color: '#0A0E1A', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>{saving ? 'Creating...' : 'Create Cycle'}</button>
            <button onClick={() => setShowForm(false)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading ? <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>Loading...</div>
          : cycles.length === 0 ? <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 48, fontSize: 13 }}>No recruitment cycles yet.</div>
          : cycles.map(c => {
            const st = STATUS[c.status] || STATUS.closed
            return (
              <div key={c.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{c.title}</h3>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: st.bg, color: st.color, border: `1px solid ${st.border}`, textTransform: 'capitalize' }}>{c.status}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)', padding: '2px 8px', borderRadius: 10, textTransform: 'capitalize' }}>{c.type}</span>
                  </div>
                  {c.closes_at && <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Closes: {formatDateTime(c.closes_at)}</p>}
                  {c.description && <p style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 4 }}>{c.description}</p>}
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  {c.status !== 'open' && <button onClick={() => updateStatus(c.id, 'open')} style={{ padding: '5px 12px', borderRadius: 6, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#10B981', fontSize: 11, cursor: 'pointer' }}>Open</button>}
                  {c.status === 'open' && <button onClick={() => updateStatus(c.id, 'reviewing')} style={{ padding: '5px 12px', borderRadius: 6, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#F59E0B', fontSize: 11, cursor: 'pointer' }}>Close & Review</button>}
                  {c.status === 'reviewing' && <button onClick={() => updateStatus(c.id, 'done')} style={{ padding: '5px 12px', borderRadius: 6, background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)', color: 'var(--cyan)', fontSize: 11, cursor: 'pointer' }}>Mark Done</button>}
                  {c.status !== 'closed' && <button onClick={() => updateStatus(c.id, 'closed')} style={{ padding: '5px 12px', borderRadius: 6, background: 'rgba(107,114,128,0.1)', border: '1px solid rgba(107,114,128,0.25)', color: '#6B7280', fontSize: 11, cursor: 'pointer' }}>Close</button>}
                </div>
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