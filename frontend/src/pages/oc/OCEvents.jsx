import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../utils/supabase'
import { useAuth } from '../../context/AuthContext'
import { formatDateTime } from '../../utils/formatDate'

const EMPTY_EVENT = {
  title: '', type: 'workshop', description: '', banner_url: '',
  event_date: '', location: '', registration_deadline: '',
  max_participants: '', status: 'upcoming', is_featured: false, external_link: ''
}

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
    const payload = {
      ...form,
      max_participants: form.max_participants ? parseInt(form.max_participants) : null,
      created_by: profile?.id,
    }
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
    setForm({
      ...EMPTY_EVENT, ...event,
      max_participants: event.max_participants || '',
      event_date: event.event_date?.slice(0, 16) || '',
      registration_deadline: event.registration_deadline?.slice(0, 16) || '',
    })
    setEditId(event.id); setShowForm(true)
  }

  const STATUS_COLORS = {
    upcoming: '#10B981', ongoing: '#F59E0B',
    completed: '#6B7280', cancelled: '#EF4444',
  }
  const TYPE_COLORS = {
    hackathon: 'var(--cyan)', workshop: 'var(--pink)',
    seminar: '#00BFA5', bootcamp: '#A78BFA',
    social: '#F59E0B', fest: 'var(--pink)',
  }

  return (
    <div>
      {/* ── Header ──────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <p style={{ color: 'var(--cyan)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Content</p>
          <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 32, fontWeight: 800, color: '#fff', textTransform: 'uppercase' }}>Events</h1>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_EVENT) }}
          style={{ padding: '10px 20px', background: 'var(--cyan)', border: 'none', borderRadius: 8, color: '#0A0E1A', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
        >
          + New Event
        </button>
      </div>

      {/* ── Create / Edit Form ───────────────────────── */}
      {showForm && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 14, padding: 24, marginBottom: 24 }}>
          <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 600, marginBottom: 20 }}>
            {editId ? 'Edit Event' : 'Create New Event'}
          </h3>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#EF4444', fontSize: 13 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <FormField label="Title *" value={form.title} onChange={v => setForm(p => ({ ...p, title: v }))} />

            <div>
              <label style={LS}>Type</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} style={SS}>
                {['hackathon', 'workshop', 'seminar', 'bootcamp', 'social', 'fest'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <FormField label="Event Date *" type="datetime-local" value={form.event_date} onChange={v => setForm(p => ({ ...p, event_date: v }))} />
            <FormField label="Registration Deadline" type="datetime-local" value={form.registration_deadline} onChange={v => setForm(p => ({ ...p, registration_deadline: v }))} />
            <FormField label="Location" value={form.location} onChange={v => setForm(p => ({ ...p, location: v }))} placeholder="e.g. Main Hall or Online" />
            <FormField label="Max Participants" type="number" value={form.max_participants} onChange={v => setForm(p => ({ ...p, max_participants: v }))} placeholder="Leave empty for unlimited" />
            <FormField label="External Link" value={form.external_link} onChange={v => setForm(p => ({ ...p, external_link: v }))} placeholder="External registration URL (optional)" />

            <div>
              <label style={LS}>Status</label>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} style={SS}>
                {['upcoming', 'ongoing', 'completed', 'cancelled'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Banner upload — full width */}
            <div style={{ gridColumn: '1 / -1' }}>
              <BannerUpload
                value={form.banner_url}
                onChange={url => setForm(p => ({ ...p, banner_url: url }))}
              />
            </div>

            {/* Featured toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="checkbox"
                id="featured"
                checked={form.is_featured}
                onChange={e => setForm(p => ({ ...p, is_featured: e.target.checked }))}
              />
              <label htmlFor="featured" style={{ color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer' }}>
                Featured on homepage
              </label>
            </div>

            {/* Description — full width */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={LS}>Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                rows={4}
                placeholder="Full event description..."
                style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 13, resize: 'vertical', outline: 'none', fontFamily: 'Inter, sans-serif' }}
                onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.4)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ padding: '10px 24px', background: 'var(--cyan)', border: 'none', borderRadius: 8, color: '#0A0E1A', fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'Saving...' : editId ? 'Update Event' : 'Create Event'}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditId(null); setError('') }}
              style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Events Table ─────────────────────────────── */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
        ) : events.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            No events yet. Create your first event above.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Event', 'Type', 'Date', 'Status', 'Featured', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.map(event => (
                <tr key={event.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {event.banner_url ? (
                        <img src={event.banner_url} alt={event.title} style={{ width: 40, height: 32, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}/>
                      ) : (
                        <div style={{ width: 40, height: 32, borderRadius: 6, background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.1)', flexShrink: 0 }}/>
                      )}
                      <div>
                        <p style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{event.title}</p>
                        {event.location && <p style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 1 }}>{event.location}</p>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: TYPE_COLORS[event.type] || 'var(--cyan)' }}>
                      {event.type}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 12, whiteSpace: 'nowrap' }}>
                    {formatDateTime(event.event_date)}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: `${STATUS_COLORS[event.status]}18`, color: STATUS_COLORS[event.status], border: `1px solid ${STATUS_COLORS[event.status]}40`, textTransform: 'capitalize' }}>
                      {event.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {event.is_featured && (
                      <span style={{ fontSize: 10, color: 'var(--pink)', background: 'rgba(255,45,155,0.1)', padding: '2px 8px', borderRadius: 10, border: '1px solid rgba(255,45,155,0.2)' }}>
                        Featured
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => startEdit(event)}
                        style={{ padding: '4px 10px', borderRadius: 6, background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: 'var(--cyan)', fontSize: 11, cursor: 'pointer' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        style={{ padding: '4px 10px', borderRadius: 6, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', fontSize: 11, cursor: 'pointer' }}
                      >
                        Delete
                      </button>
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

/* ── Banner Upload Component ─────────────────────────────────── */
function BannerUpload({ value, onChange }) {
  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { setError('Image must be under 10MB.'); return }
    setUploading(true); setError('')

    try {
      // Step 1: Get signature from backend
      const signRes = await fetch(`${import.meta.env.VITE_API_URL}/api/upload/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!signRes.ok) throw new Error('Failed to get signature')
      const { signature, timestamp, api_key, cloud_name } = await signRes.json()

      // Step 2: Upload to Cloudinary — no upload_preset for signed uploads
      const formData = new FormData()
      formData.append('file', file)
      formData.append('timestamp', timestamp)
      formData.append('signature', signature)
      formData.append('api_key', api_key)

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
        { method: 'POST', body: formData }
      )
      const result = await uploadRes.json()

      if (result.secure_url) {
        onChange(result.secure_url)
      } else {
        console.error('Cloudinary error:', result)
        setError(result.error?.message || 'Upload failed. Try again.')
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError('Upload failed. Try again.')
    }

    setUploading(false)
  }

  return (
    <div>
      <label style={LS}>Banner Image</label>

      {value && (
        <div style={{ marginBottom: 10, borderRadius: 8, overflow: 'hidden', height: 140, background: '#0D1829' }}>
          <img src={value} alt="Banner preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          style={{ padding: '8px 16px', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 7, color: 'var(--cyan)', fontSize: 12, fontWeight: 500, cursor: uploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          {uploading ? (
            <>
              <div style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid rgba(0,212,255,0.3)', borderTopColor: 'var(--cyan)', animation: 'spin 0.7s linear infinite' }}/>
              Uploading...
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
              {value ? 'Change image' : 'Upload image'}
            </>
          )}
        </button>

        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            style={{ padding: '8px 14px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer' }}
          >
            Remove
          </button>
        )}

        <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>or paste URL</span>

        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="https://res.cloudinary.com/..."
          style={{ flex: 1, minWidth: 180, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 12, outline: 'none', fontFamily: 'Inter, sans-serif' }}
          onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.4)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
      </div>

      {error && <p style={{ color: '#EF4444', fontSize: 11, marginTop: 6 }}>{error}</p>}
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }}/>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

/* ── Shared styles ───────────────────────────────────────────── */
const LS = {
  display: 'block', fontSize: 11, fontWeight: 600,
  color: 'var(--text-muted)', textTransform: 'uppercase',
  letterSpacing: '0.06em', marginBottom: 6,
}
const IS = {
  width: '100%', background: 'rgba(255,255,255,0.04)',
  border: '1px solid var(--border)', borderRadius: 8,
  padding: '9px 12px', color: '#fff', fontSize: 13,
  outline: 'none', fontFamily: 'Inter, sans-serif',
}
const SS = { ...IS, cursor: 'pointer' }

function FormField({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <div>
      <label style={LS}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={IS}
        onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.4)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
      />
    </div>
  )
}