import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase'
import { useAuth } from '../../context/AuthContext'
import { formatDateShort } from '../../utils/formatDate'

const EMPTY_RESOURCE = {
  title: '', url: '', type: 'Article', track: 'General', description: ''
}

export default function OCResources() {
  const { profile } = useAuth()
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_RESOURCE)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { fetchResources() }, [])

  async function fetchResources() {
    setLoading(true)
    const { data } = await supabase.from('resources').select('*').order('created_at', { ascending: false })
    setResources(data || [])
    setLoading(false)
  }

  async function handleSave() {
    if (!form.title || !form.url) { setError('Title and URL are required.'); return }
    setSaving(true); setError('')

    const payload = { ...form, added_by: profile?.id }

    try {
      if (editId) {
        const { error: err } = await supabase.from('resources').update(payload).eq('id', editId)
        if (err) throw err
        setResources(prev => prev.map(r => r.id === editId ? { ...r, ...payload } : r))
      } else {
        const { data, error: err } = await supabase.from('resources').insert(payload).select().single()
        if (err) throw err
        if (data) setResources(prev => [data, ...prev])
      }
      setShowForm(false); setEditId(null); setForm(EMPTY_RESOURCE)
    } catch (err) {
      console.error('Error saving resource:', err)
      setError(`Failed to save: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this resource?')) return
    const { error: err } = await supabase.from('resources').delete().eq('id', id)
    if (!err) setResources(prev => prev.filter(r => r.id !== id))
    else alert('Delete failed: ' + err.message)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <p style={{ color: 'var(--cyan)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Content</p>
          <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 32, fontWeight: 800, color: '#fff', textTransform: 'uppercase' }}>Resources</h1>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_RESOURCE); setError('') }}
          style={{ padding: '10px 20px', background: 'var(--cyan)', border: 'none', borderRadius: 8, color: '#0A0E1A', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
        >
          + Add Resource
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 14, padding: 24, marginBottom: 24 }}>
          <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 600, marginBottom: 20 }}>{editId ? 'Edit Resource' : 'Add New Resource'}</h3>
          {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#EF4444', fontSize: 13 }}>{error}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <FormField label="Title *" value={form.title} onChange={v => setForm(p => ({ ...p, title: v }))} />
            <FormField label="URL *" value={form.url} onChange={v => setForm(p => ({ ...p, url: v }))} />
            <FormField label="Type" value={form.type} onChange={v => setForm(p => ({ ...p, type: v }))} placeholder="Article, Video, Course, GitHub..." />
            <FormField label="Track" value={form.track} onChange={v => setForm(p => ({ ...p, track: v }))} placeholder="Frontend, Backend, AI/ML..." />
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={LS}>Description</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} style={TS} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <button onClick={handleSave} disabled={saving} style={BS_PRI}>{saving ? 'Saving...' : 'Save Resource'}</button>
            <button onClick={() => setShowForm(false)} style={BS_SEC}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>Loading resources...</div>
        ) : resources.length === 0 ? (
          <div style={{ padding: 64, textAlign: 'center', color: 'var(--text-muted)' }}>No resources found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Title', 'Type', 'Track', 'Added', 'Actions'].map(h => (
                  <th key={h} style={TH}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {resources.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={TD}><a href={r.url} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none', fontWeight: 500 }}>{r.title}</a></td>
                  <td style={TD}><span style={TAG}>{r.type}</span></td>
                  <td style={TD}><span style={{ ...TAG, color: 'var(--pink)', borderColor: 'rgba(255,45,155,0.1)' }}>{r.track}</span></td>
                  <td style={TD}>{formatDateShort(r.created_at)}</td>
                  <td style={TD}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => { startEdit(r) }} style={BS_ACT}>Edit</button>
                      <button onClick={() => handleDelete(r.id)} style={{ ...BS_ACT, color: '#EF4444' }}>Delete</button>
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

  function startEdit(res) {
    setForm({ ...EMPTY_RESOURCE, ...res })
    setEditId(res.id); setShowForm(true)
  }
}

function FormField({ label, value, onChange, placeholder = '' }) {
  return (
    <div>
      <label style={LS}>{label}</label>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={IS} />
    </div>
  )
}

const LS = { display: 'block', color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }
const IS = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: 13, outline: 'none' }
const TS = { ...IS, resize: 'vertical', fontFamily: 'Inter, sans-serif' }
const TH = { padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }
const TD = { padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }
const TAG = { fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--cyan)' }
const BS_PRI = { padding: '10px 24px', background: 'var(--cyan)', border: 'none', borderRadius: 8, color: '#0A0E1A', fontSize: 13, fontWeight: 700, cursor: 'pointer' }
const BS_SEC = { padding: '10px 20px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }
const BS_ACT = { padding: '4px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer' }