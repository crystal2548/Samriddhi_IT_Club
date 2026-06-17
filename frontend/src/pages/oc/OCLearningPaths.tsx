import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase'
import { useAuth } from '../../context/AuthContext'

interface LearningPath {
  id?: string
  title: string
  description: string
  color: string
  steps: string[]
  is_active: boolean
  sort_order: number
  created_at?: string
  created_by?: string
}

const EMPTY_PATH: LearningPath = {
  title: '',
  description: '',
  color: 'var(--cyan)',
  steps: [''],
  is_active: true,
  sort_order: 0,
}

const COLOR_OPTIONS = [
  { label: 'Cyan', value: 'var(--cyan)' },
  { label: 'Pink', value: 'var(--pink)' },
  { label: 'Purple', value: '#A78BFA' },
  { label: 'Amber', value: '#F59E0B' },
  { label: 'Emerald', value: '#10B981' },
  { label: 'Red', value: '#EF4444' },
]

export default function OCLearningPaths() {
  const { profile } = useAuth()
  const [paths, setPaths] = useState<LearningPath[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<LearningPath>(EMPTY_PATH)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { fetchPaths() }, [])

  async function fetchPaths() {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('learning_paths')
      .select('*')
      .order('sort_order', { ascending: true })

    if (err) {
      console.error('Error fetching learning paths:', err)
      // If the table doesn't exist yet, show empty
      setPaths([])
    } else {
      // Parse steps from JSON string if stored as string
      const parsed = (data || []).map((p: any) => ({
        ...p,
        steps: typeof p.steps === 'string' ? JSON.parse(p.steps) : (p.steps || []),
      }))
      setPaths(parsed)
    }
    setLoading(false)
  }

  async function handleSave() {
    if (!form.title.trim()) { setError('Title is required.'); return }
    if (form.steps.filter(s => s.trim()).length === 0) { setError('At least one step is required.'); return }
    setSaving(true); setError('')

    const cleanSteps = form.steps.filter(s => s.trim())
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      color: form.color,
      steps: cleanSteps,
      is_active: form.is_active,
      sort_order: form.sort_order,
      created_by: profile?.id,
    }

    try {
      if (editId) {
        const { error: err } = await supabase.from('learning_paths').update(payload).eq('id', editId)
        if (err) throw err
        setPaths(prev => prev.map(p => p.id === editId ? { ...p, ...payload } : p))
      } else {
        const { data, error: err } = await supabase.from('learning_paths').insert(payload).select().single()
        if (err) throw err
        if (data) {
          const parsed = { ...data, steps: typeof data.steps === 'string' ? JSON.parse(data.steps) : (data.steps || []) }
          setPaths(prev => [...prev, parsed])
        }
      }
      setShowForm(false); setEditId(null); setForm(EMPTY_PATH)
    } catch (err: any) {
      console.error('Error saving learning path:', err)
      setError(`Failed to save: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this learning path?')) return
    const { error: err } = await supabase.from('learning_paths').delete().eq('id', id)
    if (!err) setPaths(prev => prev.filter(p => p.id !== id))
    else alert('Delete failed: ' + err.message)
  }

  async function toggleActive(id: string, current: boolean) {
    const { error: err } = await supabase.from('learning_paths').update({ is_active: !current }).eq('id', id)
    if (!err) setPaths(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p))
  }

  function startEdit(path: LearningPath) {
    setForm({ ...EMPTY_PATH, ...path })
    setEditId(path.id || null)
    setShowForm(true)
    setError('')
  }

  function addStep() {
    setForm(p => ({ ...p, steps: [...p.steps, ''] }))
  }

  function removeStep(index: number) {
    setForm(p => ({ ...p, steps: p.steps.filter((_, i) => i !== index) }))
  }

  function updateStep(index: number, value: string) {
    setForm(p => ({
      ...p,
      steps: p.steps.map((s, i) => i === index ? value : s)
    }))
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <p style={{ color: 'var(--cyan)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Content</p>
          <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 32, fontWeight: 800, color: '#fff', textTransform: 'uppercase' }}>Learning Paths</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 6 }}>Manage guided learning paths displayed on the Resources page.</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_PATH); setError('') }}
          style={{ padding: '10px 20px', background: 'var(--cyan)', border: 'none', borderRadius: 8, color: '#0A0E1A', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
        >
          + Add Learning Path
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 14, padding: 28, marginBottom: 24 }}>
          <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 600, marginBottom: 24 }}>
            {editId ? 'Edit Learning Path' : 'Add New Learning Path'}
          </h3>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#EF4444', fontSize: 13 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Title */}
            <div>
              <label style={LS}>Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Frontend Engineering"
                style={IS}
              />
            </div>

            {/* Color */}
            <div>
              <label style={LS}>Accent Color</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {COLOR_OPTIONS.map(c => (
                  <button
                    key={c.value}
                    onClick={() => setForm(p => ({ ...p, color: c.value }))}
                    title={c.label}
                    style={{
                      width: 32, height: 32, borderRadius: 8, border: form.color === c.value ? '2px solid #fff' : '1px solid var(--border)',
                      background: c.value, cursor: 'pointer', transition: 'all 0.2s',
                      transform: form.color === c.value ? 'scale(1.1)' : 'scale(1)',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Sort Order */}
            <div>
              <label style={LS}>Sort Order</label>
              <input
                type="number"
                value={form.sort_order}
                onChange={e => setForm(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))}
                style={IS}
              />
            </div>

            {/* Active */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 24 }}>
              <input
                type="checkbox"
                id="path_active"
                checked={form.is_active}
                onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
              />
              <label htmlFor="path_active" style={{ color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer' }}>
                Active (Visible on Resources page)
              </label>
            </div>

            {/* Description */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={LS}>Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                rows={2}
                placeholder="Brief description of this learning path..."
                style={TS}
              />
            </div>

            {/* Steps */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={LS}>Steps / Milestones</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {form.steps.map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                      border: `2px solid ${form.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, color: form.color, fontWeight: 800,
                    }}>
                      {i + 1}
                    </div>
                    <input
                      type="text"
                      value={step}
                      onChange={e => updateStep(i, e.target.value)}
                      placeholder={`Step ${i + 1}...`}
                      style={{ ...IS, flex: 1 }}
                    />
                    {form.steps.length > 1 && (
                      <button
                        onClick={() => removeStep(i)}
                        style={{
                          width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)',
                          background: 'transparent', color: '#EF4444', fontSize: 16,
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addStep}
                  style={{
                    padding: '8px 16px', borderRadius: 8, border: '1px dashed var(--border)',
                    background: 'transparent', color: 'var(--cyan)', fontSize: 12,
                    fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                    alignSelf: 'flex-start',
                  }}
                >
                  + Add Step
                </button>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div style={{ marginTop: 24, padding: 20, borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Preview</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ width: 4, height: 24, borderRadius: 2, background: form.color }} />
              <h4 style={{ color: '#fff', fontSize: 15, fontWeight: 700 }}>{form.title || 'Untitled Path'}</h4>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 12, paddingLeft: 16 }}>{form.description || 'No description'}</p>
            <div style={{ display: 'flex', gap: 8, paddingLeft: 16, flexWrap: 'wrap' }}>
              {form.steps.filter(s => s.trim()).map((s, i) => (
                <span key={i} style={{
                  fontSize: 10, padding: '3px 8px', borderRadius: 4,
                  background: `${form.color}15`, border: `1px solid ${form.color}30`,
                  color: form.color,
                }}>
                  {i + 1}. {s}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <button onClick={handleSave} disabled={saving} style={BS_PRI}>
              {saving ? 'Saving...' : editId ? 'Update Path' : 'Create Path'}
            </button>
            <button onClick={() => { setShowForm(false); setError('') }} style={BS_SEC}>Cancel</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>Loading learning paths...</div>
        ) : paths.length === 0 ? (
          <div style={{ padding: 64, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📚</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 8 }}>No learning paths found.</p>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>Create your first learning path to get started.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Color', 'Title', 'Steps', 'Order', 'Status', 'Actions'].map(h => (
                  <th key={h} style={TH}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paths.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                  <td style={TD}>
                    <div style={{ width: 16, height: 16, borderRadius: 4, background: p.color }} />
                  </td>
                  <td style={TD}>
                    <div>
                      <span style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>{p.title}</span>
                      {p.description && (
                        <p style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 4, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td style={TD}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {(p.steps || []).map((s: string, i: number) => (
                        <span key={i} style={{
                          fontSize: 9, padding: '2px 6px', borderRadius: 3,
                          background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                          color: 'var(--text-secondary)',
                        }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={TD}>
                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{p.sort_order}</span>
                  </td>
                  <td style={TD}>
                    <button
                      onClick={() => toggleActive(p.id!, p.is_active)}
                      style={{
                        padding: '3px 10px', borderRadius: 4, border: 'none',
                        background: p.is_active ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.04)',
                        color: p.is_active ? 'var(--cyan)' : 'var(--text-muted)',
                        fontSize: 10, fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase',
                      }}
                    >
                      {p.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td style={TD}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => startEdit(p)} style={BS_ACT}>Edit</button>
                      <button onClick={() => handleDelete(p.id!)} style={{ ...BS_ACT, color: '#EF4444' }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Info Card */}
      <div style={{
        marginTop: 24, padding: 20, borderRadius: 12,
        background: 'rgba(0,212,255,0.03)', border: '1px solid rgba(0,212,255,0.1)',
        display: 'flex', gap: 12, alignItems: 'flex-start',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}>
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 12, lineHeight: 1.6 }}>
            Learning paths appear in the <strong style={{ color: '#fff' }}>Guided Learning Paths</strong> section on the public Resources page.
            The "Start Path" button currently shows a <strong style={{ color: '#fff' }}>Coming Soon</strong> page.
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Shared styles ──
const LS: React.CSSProperties = { display: 'block', color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }
const IS: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }
const TS: React.CSSProperties = { ...IS, resize: 'vertical', fontFamily: 'Inter, sans-serif' }
const TH: React.CSSProperties = { padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }
const TD: React.CSSProperties = { padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }
const BS_PRI: React.CSSProperties = { padding: '10px 24px', background: 'var(--cyan)', border: 'none', borderRadius: 8, color: '#0A0E1A', fontSize: 13, fontWeight: 700, cursor: 'pointer' }
const BS_SEC: React.CSSProperties = { padding: '10px 20px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }
const BS_ACT: React.CSSProperties = { padding: '4px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer' }
