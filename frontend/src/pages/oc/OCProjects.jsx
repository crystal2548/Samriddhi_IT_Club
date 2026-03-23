import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../utils/supabase'
import { useAuth } from '../../context/AuthContext'
import { formatDateShort } from '../../utils/formatDate'

const EMPTY_PROJECT = {
  title: '', description: '', banner_url: '',
  tech_stack: '', github_url: '', demo_url: '',
  is_featured: false, category: 'Web Development'
}

export default function OCProjects() {
  const { profile } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_PROJECT)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { fetchProjects() }, [])

  async function fetchProjects() {
    setLoading(true)
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
    setProjects(data || [])
    setLoading(false)
  }

  async function handleSave() {
    if (!form.title) { setError('Title is required.'); return }
    setSaving(true); setError('')

    // Process tech stack from string to array
    const techArray = typeof form.tech_stack === 'string' 
      ? form.tech_stack.split(',').map(t => t.trim()).filter(t => t)
      : form.tech_stack

    // Remove category if it might not exist in DB, and any other fields that could cause error
    const { category, ...formData } = form

    const payload = {
      ...formData,
      tech_stack: techArray,
      added_by: profile?.id,
    }

    try {
      if (editId) {
        const { error: err } = await supabase.from('projects').update(payload).eq('id', editId)
        if (err) throw err
        setProjects(prev => prev.map(p => p.id === editId ? { ...p, ...payload } : p))
      } else {
        const { data, error: err } = await supabase.from('projects').insert(payload).select().single()
        if (err) {
          console.error('Supabase Error:', err)
          throw err
        }
        if (data) setProjects(prev => [data, ...prev])
      }
      setShowForm(false); setEditId(null); setForm(EMPTY_PROJECT)
    } catch (err) {
      console.error('Error saving project:', err)
      setError(`Failed to save: ${err.message || 'Unknown error'}. Check if 'projects' table exists in Supabase.`)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this project?')) return
    const { error: err } = await supabase.from('projects').delete().eq('id', id)
    if (err) {
      console.error('Delete error:', err)
      alert('Delete failed: ' + err.message)
    } else {
      setProjects(prev => prev.filter(p => p.id !== id))
    }
  }

  function startEdit(project) {
    setForm({
      ...EMPTY_PROJECT, ...project,
      tech_stack: project.tech_stack?.join(', ') || ''
    })
    setEditId(project.id); setShowForm(true)
  }

  return (
    <div>
      {/* ── Header ─────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <p style={{ color: 'var(--cyan)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Content</p>
          <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 32, fontWeight: 800, color: '#fff', textTransform: 'uppercase' }}>Projects</h1>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_PROJECT); setError('') }}
          style={{ padding: '10px 20px', background: 'var(--cyan)', border: 'none', borderRadius: 8, color: '#0A0E1A', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
        >
          + New Project
        </button>
      </div>

      {/* ── Create / Edit Form ───────────────────────── */}
      {showForm && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 14, padding: 24, marginBottom: 24 }}>
          <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 600, marginBottom: 20 }}>
            {editId ? 'Edit Project' : 'Add New Project'}
          </h3>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#EF4444', fontSize: 13 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <FormField label="Title *" value={form.title} onChange={v => setForm(p => ({ ...p, title: v }))} />
            <FormField label="Tech Stack (comma separated)" value={form.tech_stack} onChange={v => setForm(p => ({ ...p, tech_stack: v }))} placeholder="React, Supabase, Tailwind..." />
            
            <FormField label="GitHub URL" value={form.github_url} onChange={v => setForm(p => ({ ...p, github_url: v }))} />
            <FormField label="Live Demo URL" value={form.demo_url} onChange={v => setForm(p => ({ ...p, demo_url: v }))} />

            <div style={{ gridColumn: '1 / -1' }}>
              <BannerUpload 
                value={form.banner_url}
                onChange={url => setForm(p => ({ ...p, banner_url: url }))}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={LS}>Description</label>
              <textarea 
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                rows={4}
                style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 13, resize: 'vertical', outline: 'none', fontFamily: 'Inter, sans-serif' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input 
                type="checkbox" 
                id="is_featured"
                checked={form.is_featured}
                onChange={e => setForm(p => ({ ...p, is_featured: e.target.checked }))}
              />
              <label htmlFor="is_featured" style={{ color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer' }}>Featured Project</label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ padding: '10px 24px', background: 'var(--cyan)', border: 'none', borderRadius: 8, color: '#0A0E1A', fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'Saving...' : editId ? 'Update Project' : 'Create Project'}
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


      {/* ── Table ────────────────────────────────────── */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>Loading projects...</div>
        ) : projects.length === 0 ? (
          <div style={{ padding: 64, textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>No projects found yet.</p>
            {!showForm && (
              <button 
                onClick={() => setShowForm(true)}
                style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', padding: '8px 20px', borderRadius: 8, color: 'var(--cyan)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >Add your first project</button>
            )}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Project', 'Tech Stack', 'Featured', 'Created', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {p.banner_url ? (
                        <img src={p.banner_url} alt="" style={{ width: 40, height: 32, borderRadius: 6, objectFit: 'cover' }}/>
                      ) : (
                        <div style={{ width: 40, height: 32, borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}/>
                      )}
                      <span style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>{p.title}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {p.tech_stack?.slice(0, 2).map(t => (
                        <span key={t} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(0,212,255,0.06)', color: 'var(--cyan)', border: '1px solid rgba(0,212,255,0.1)' }}>{t}</span>
                      ))}
                      {p.tech_stack?.length > 2 && <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>+{p.tech_stack.length - 2}</span>}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {p.is_featured && <span style={{ color: 'var(--pink)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>Yes</span>}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 12 }}>
                    {formatDateShort(p.created_at)}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => startEdit(p)} style={BS}>Edit</button>
                      <button onClick={() => handleDelete(p.id)} style={{ ...BS, color: '#EF4444', borderColor: 'rgba(239,68,68,0.2)' }}>Delete</button>
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

/* ── Components ─────────────────────────────────────────────── */

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
      console.log('Fetching signature from:', `${import.meta.env.VITE_API_URL}/api/upload/sign`)
      const signRes = await fetch(`${import.meta.env.VITE_API_URL}/api/upload/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!signRes.ok) throw new Error(`Sign request failed with status: ${signRes.status}`)
      
      const { signature, timestamp, api_key, cloud_name } = await signRes.json()
      console.log('Received signature details. Cloud name:', cloud_name)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('timestamp', timestamp)
      formData.append('signature', signature)
      formData.append('api_key', api_key)

      console.log('Uploading to Cloudinary...')
      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
        { method: 'POST', body: formData }
      )
      
      if (!uploadRes.ok) {
        const errData = await uploadRes.json()
        throw new Error(errData.error?.message || 'Cloudinary upload failed')
      }

      const result = await uploadRes.json()
      if (result.secure_url) {
        console.log('Upload successful:', result.secure_url)
        onChange(result.secure_url)
      } else {
        throw new Error('No secure_url returned from Cloudinary')
      }
    } catch (err) {
      console.error('Upload flow error:', err)
      setError(`Upload failed: ${err.message}. Check browser console for details.`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <label style={LS}>Project Banner</label>
      <div style={{ border: '1px dashed var(--border)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
        {value ? (
          <div style={{ position: 'relative', width: 'fit-content', margin: '0 auto' }}>
            <img src={value} alt="" style={{ height: 120, borderRadius: 8 }}/>
            <button onClick={() => onChange('')} style={{ position: 'absolute', top: -10, right: -10, width: 24, height: 24, borderRadius: '50%', background: '#EF4444', border: 'none', color: '#fff', cursor: 'pointer' }}>×</button>
          </div>
        ) : (
          <div onClick={() => !uploading && fileRef.current?.click()} style={{ cursor: uploading ? 'wait' : 'pointer' }}>
            <div style={{ fontSize: 24, color: 'var(--text-muted)', marginBottom: 8 }}>{uploading ? '...' : '+'}</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{uploading ? 'Uploading...' : 'Click to upload banner'}</p>
          </div>
        )}
        <input ref={fileRef} type="file" hidden onChange={handleFile} accept="image/*" />
      </div>
      {error && <p style={{ color: '#EF4444', fontSize: 11, marginTop: 4 }}>{error}</p>}
    </div>
  )
}

function FormField({ label, value, onChange, placeholder = '' }) {
  return (
    <div>
      <label style={LS}>{label}</label>
      <input 
        type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: 13, outline: 'none' }}
      />
    </div>
  )
}

const LS = { display: 'block', color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }
const BS = { padding: '4px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer' }