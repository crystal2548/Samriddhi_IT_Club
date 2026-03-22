import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase'
import { useAuth } from '../../context/AuthContext'
import { formatDateTime } from '../../utils/formatDate'

const EMPTY_EVENT = { title: '', type: 'workshop', description: '', banner_url: '', event_date: '', location: '', registration_deadline: '', max_participants: '', status: 'upcoming', is_featured: false, external_link: '' }

export default function OCEvents() {
  const { profile } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_EVENT)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { fetchEvents() }, [])

  async function fetchEvents() {
    setLoading(true)
    const { data } = await supabase.from('events').select('*').order('event_date', { ascending: false })
    setEvents(data || [])
    setLoading(false)
  }

  async function handleSave() {
    if (!form.title || !form.event_date) { setError('Title and date are required.'); return }
    setSaving(true); setError('')
    const payload = { ...form, max_participants: form.max_participants ? parseInt(form.max_participants) : null, created_by: profile?.id }

    if (editId) {
      await supabase.from('events').update(payload).eq('id', editId)
      setEvents(prev => prev.map(e => e.id === editId ? { ...e, ...payload } : e))
    } else {
      const { data } = await supabase.from('events').insert(payload).select().single()
      if (data) setEvents(prev => [data, ...prev])
    }
    setSaving(false); setShowForm(false); setEditId(null); setForm(EMPTY_EVENT)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this event?')) return
    await supabase.from('events').delete().eq('id', id)
    setEvents(prev => prev.filter(e => e.id !== id))
  }

  function startEdit(event) {
    setForm({ ...EMPTY_EVENT, ...event, max_participants: event.max_participants || '', event_date: event.event_date?.slice(0,16) || '', registration_deadline: event.registration_deadline?.slice(0,16) || '' })
    setEditId(event.id); setShowForm(true)
  }

  const STATUS_COLORS = { upcoming: '#10B981', ongoing: '#F59E0B', completed: '#6B7280', cancelled: '#EF4444' }
  const TYPE_COLORS = { hackathon: 'var(--cyan)', workshop: 'var(--pink)', seminar: '#00BFA5', bootcamp: '#A78BFA', social: '#F59E0B', fest: 'var(--pink)' }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <p style={{ color: 'var(--cyan)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Content</p>
          <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 32, fontWeight: 800, color: '#fff', textTransform: 'uppercase' }}>Events</h1>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_EVENT) }}
          style={{ padding: '10px 20px', background: 'var(--cyan)', border: 'none', borderRadius: 8, color: '#0A0E1A', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          + New Event
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 14, padding: 24, marginBottom: 24 }}>
          <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 600, marginBottom: 20 }}>{editId ? 'Edit Event' : 'Create New Event'}</h3>
          {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#EF4444', fontSize: 13 }}>{error}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <FormField label="Title *" value={form.title} onChange={v => setForm(p => ({ ...p, title: v }))} />
            <div>
              <label style={labelStyle}>Type</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} style={selectStyle}>
                {['hackathon','workshop','seminar','bootcamp','social','fest'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <FormField label="Event Date *" type="datetime-local" value={form.event_date} onChange={v => setForm(p => ({ ...p, event_date: v }))} />
            <FormField label="Registration Deadline" type="datetime-local" value={form.registration_deadline} onChange={v => setForm(p => ({ ...p, registration_deadline: v }))} />
            <FormField label="Location" value={form.location} onChange={v => setForm(p => ({ ...p, location: v }))} placeholder="e.g. Main Hall or Online" />
            <FormField label="Max Participants" type="number" value={form.max_participants} onChange={v => setForm(p => ({ ...p, max_participants: v }))} placeholder="Leave empty for unlimited" />
            <FormField label="Banner Image URL" value={form.banner_url} onChange={v => setForm(p => ({ ...p, banner_url: v }))} placeholder="Cloudinary URL" />
            <FormField label="External Link" value={form.external_link} onChange={v => setForm(p => ({ ...p, external_link: v }))} placeholder="External registration URL (optional)" />
            <div>
              <label style={labelStyle}>Status</label>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} style={selectStyle}>
                {['upcoming','ongoing','completed','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 24 }}>
              <input type="checkbox" id="featured" checked={form.is_featured} onChange={e => setForm(p => ({ ...p, is_featured: e.target.checked }))} />
              <label htmlFor="featured" style={{ color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer' }}>Featured on homepage</label>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Description</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={4} placeholder="Full event description..."
                style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 13, resize: 'vertical', outline: 'none', fontFamily: 'Inter, sans-serif' }}
                onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.4)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button onClick={handleSave} disabled={saving} style={{ padding: '10px 24px', background: 'var(--cyan)', border: 'none', borderRadius: 8, color: '#0A0E1A', fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Saving...' : editId ? 'Update Event' : 'Create Event'}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null); setError('') }} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Events list */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
        ) : events.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No events yet. Create your first event above.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Event','Type','Date','Status','Featured','Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.map(event => (
                <tr key={event.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <p style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{event.title}</p>
                    {event.location && <p style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 2 }}>{event.location}</p>}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: TYPE_COLORS[event.type] || 'var(--cyan)' }}>{event.type}</span>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 12, whiteSpace: 'nowrap' }}>{formatDateTime(event.event_date)}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: `${STATUS_COLORS[event.status]}18`, color: STATUS_COLORS[event.status], border: `1px solid ${STATUS_COLORS[event.status]}40`, textTransform: 'capitalize' }}>{event.status}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {event.is_featured && <span style={{ fontSize: 10, color: 'var(--pink)', background: 'rgba(255,45,155,0.1)', padding: '2px 8px', borderRadius: 10, border: '1px solid rgba(255,45,155,0.2)' }}>Featured</span>}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => startEdit(event)} style={{ padding: '4px 10px', borderRadius: 6, background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: 'var(--cyan)', fontSize: 11, cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => handleDelete(event.id)} style={{ padding: '4px 10px', borderRadius: 6, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', fontSize: 11, cursor: 'pointer' }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

const labelStyle = { display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }
const inputStyle = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif' }
const selectStyle = { ...inputStyle, cursor: 'pointer' }

function FormField({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={inputStyle}
        onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.4)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
      />
    </div>
  )
}