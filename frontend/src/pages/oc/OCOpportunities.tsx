import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase'
import { useAuth } from '../../context/AuthContext'
import { formatDateShort } from '../../utils/formatters'

const EMPTY_OPPORTUNITY = {
  title: '', type: 'Internship', description: '', link: '', deadline: '', is_active: true
}

export default function OCOpportunities() {
  const { profile } = useAuth()
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_OPPORTUNITY)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { fetchOpportunities() }, [])

  async function fetchOpportunities() {
    setLoading(true)
    const { data } = await supabase.from('opportunities').select('*').order('created_at', { ascending: false })
    setOpportunities(data || [])
    setLoading(false)
  }

  async function handleSave() {
    if (!form.title || !form.link) { setError('Title and Link are required.'); return }
    setSaving(true); setError('')

    const payload = { ...form, posted_by: profile?.id }

    try {
      if (editId) {
        const { error: err } = await supabase.from('opportunities').update(payload).eq('id', editId)
        if (err) throw err
        setOpportunities(prev => prev.map(o => o.id === editId ? { ...o, ...payload } : o))
      } else {
        const { data, error: err } = await supabase.from('opportunities').insert(payload).select().single()
        if (err) throw err
        if (data) setOpportunities(prev => [data, ...prev])
      }
      setShowForm(false); setEditId(null); setForm(EMPTY_OPPORTUNITY)
    } catch (err) {
      console.error('Error saving opportunity:', err)
      setError(`Failed to save: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this opportunity?')) return
    const { error: err } = await supabase.from('opportunities').delete().eq('id', id)
    if (!err) setOpportunities(prev => prev.filter(o => o.id !== id))
    else alert('Delete failed: ' + err.message)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <p style={{ color: 'var(--cyan)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Content</p>
          <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 32, fontWeight: 800, color: '#fff', textTransform: 'uppercase' }}>Opportunities</h1>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_OPPORTUNITY); setError('') }}
          style={{ padding: '10px 20px', background: 'var(--cyan)', border: 'none', borderRadius: 8, color: '#0A0E1A', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
        >
          + Add Opportunity
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 14, padding: 24, marginBottom: 24 }}>
          <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 600, marginBottom: 20 }}>{editId ? 'Edit Opportunity' : 'Add New Opportunity'}</h3>
          {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#EF4444', fontSize: 13 }}>{error}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <FormField label="Title *" value={form.title} onChange={v => setForm(p => ({ ...p, title: v }))} />
            <FormField label="Link *" value={form.link} onChange={v => setForm(p => ({ ...p, link: v }))} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={LS}>Type</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} style={SS}>
                {['Hiring', 'Internship', 'Hackathon', 'Fellowship', 'Scholarship', 'Event'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={LS}>Deadline</label>
              <input type="date" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} style={IS} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={LS}>Description</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} style={TS} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="checkbox" id="is_active" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} />
              <label htmlFor="is_active" style={{ color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer' }}>Active (Visible on public pages)</label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <button onClick={handleSave} disabled={saving} style={BS_PRI}>{saving ? 'Saving...' : 'Save Opportunity'}</button>
            <button onClick={() => setShowForm(false)} style={BS_SEC}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>Loading opportunities...</div>
        ) : opportunities.length === 0 ? (
          <div style={{ padding: 64, textAlign: 'center', color: 'var(--text-muted)' }}>No opportunities found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Title', 'Type', 'Deadline', 'Status', 'Actions'].map(h => (
                  <th key={h} style={TH}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {opportunities.map(o => (
                <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={TD}><a href={o.link} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none', fontWeight: 500 }}>{o.title}</a></td>
                  <td style={TD}><span style={TAG}>{o.type}</span></td>
                  <td style={TD}>{o.deadline ? formatDateShort(o.deadline) : 'N/A'}</td>
                  <td style={TD}>
                    {o.is_active ? <span style={{ color: 'var(--cyan)', fontSize: 11, fontWeight: 700 }}>ACTIVE</span> : <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>INACTIVE</span>}
                  </td>
                  <td style={TD}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => { startEdit(o) }} style={BS_ACT}>Edit</button>
                      <button onClick={() => handleDelete(o.id)} style={{ ...BS_ACT, color: '#EF4444' }}>Delete</button>
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

  function startEdit(opp) {
    setForm({ ...EMPTY_OPPORTUNITY, ...opp })
    setEditId(opp.id); setShowForm(true)
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
const SS = { ...IS, appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }
const TS = { ...IS, resize: 'vertical', fontFamily: 'Inter, sans-serif' }
const TH = { padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }
const TD = { padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }
const TAG = { fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--pink)' }
const BS_PRI = { padding: '10px 24px', background: 'var(--cyan)', border: 'none', borderRadius: 8, color: '#0A0E1A', fontSize: 13, fontWeight: 700, cursor: 'pointer' }
const BS_SEC = { padding: '10px 20px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }
const BS_ACT = { padding: '4px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer' }
