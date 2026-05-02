import React, { useEffect, useState, useRef } from 'react'
import { supabase } from '../../utils/supabase'
import { useAuth } from '../../context/AuthContext'
import { formatDateShort } from '../../utils/formatters'

interface Project {
  id?: string
  title: string
  description: string
  banner_url: string
  tech_stack: string | string[]
  github_url: string
  demo_url: string
  is_featured: boolean
  category: string
  added_by?: string
  created_at?: string
}

const EMPTY_PROJECT: Project = {
  title: '', description: '', banner_url: '',
  tech_stack: '', github_url: '', demo_url: '',
  is_featured: false, category: 'Web Development'
}

export default function ManageProjects() {
  const { profile, isExecutive, loading: authLoading } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Project>(EMPTY_PROJECT)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && profile) {
      fetchMyProjects()
    }
  }, [profile, authLoading])

  async function fetchMyProjects() {
    if (!profile) return
    setLoading(true)
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('added_by', profile.id)
      .order('created_at', { ascending: false })
    setProjects((data as unknown as Project[]) || [])
    setLoading(false)
  }

  async function handleSave() {
    if (!form.title) { setError('Title is required.'); return }
    setSaving(true); setError('')

    const techArray = typeof form.tech_stack === 'string' 
      ? form.tech_stack.split(',').map(t => t.trim()).filter(t => t)
      : form.tech_stack

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
        if (err) throw err
        if (data) setProjects(prev => [data as unknown as Project, ...prev])
      }
      setShowForm(false); setEditId(null); setForm(EMPTY_PROJECT)
    } catch (err: any) {
      setError(`Failed to save: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this project?')) return
    const { error: err } = await supabase.from('projects').delete().eq('id', id)
    if (!err) setProjects(prev => prev.filter(p => p.id !== id))
    else alert('Delete failed: ' + err.message)
  }

  if (authLoading) return <p style={{ color: 'var(--text-muted)' }}>Checking authorization...</p>
  if (!isExecutive) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h2 style={{ color: '#fff', fontSize: 24, marginBottom: 16 }}>Executive Access Required</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto' }}>
          Only club executives and OC members can manage showcased projects.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <p style={{ color: 'var(--cyan)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
            Member Portal
          </p>
          <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 32, fontWeight: 800, color: '#fff', textTransform: 'uppercase' }}>
            My Projects
          </h1>
        </div>
        {!showForm && (
          <button
            onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_PROJECT); setError('') }}
            style={{ padding: '10px 20px', background: 'var(--cyan)', border: 'none', borderRadius: 8, color: '#0A0E1A', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
          >
            + Add New Project
          </button>
        )}
      </div>

      {showForm && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 14, padding: 24, marginBottom: 24 }}>
          <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 600, marginBottom: 20 }}>
            {editId ? 'Edit Project' : 'Showcase New Project'}
          </h3>
          {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#EF4444', fontSize: 13 }}>{error}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <FormField label="Title *" value={form.title} onChange={v => setForm(p => ({ ...p, title: v }))} />
            <FormField label="Tech Stack (comma separated)" value={form.tech_stack as string} onChange={v => setForm(p => ({ ...p, tech_stack: v }))} placeholder="React, Supabase, Tailwind..." />
            
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
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <button onClick={handleSave} disabled={saving} style={BS_PRI}>
              {saving ? 'Saving...' : (editId ? 'Update Project' : 'Create Project')}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null); setError('') }} style={BS_SEC}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>Loading projects...</div>
        ) : projects.length === 0 ? (
          <div style={{ padding: 64, textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>You haven't showcased any projects yet.</p>
            <button onClick={() => setShowForm(true)} style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', padding: '8px 20px', borderRadius: 8, color: 'var(--cyan)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Add First Project</button>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {(['Project', 'Tech Stack', 'Created', 'Actions'] as const).map(h => <th key={h} style={TH}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={TD}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {p.banner_url ? (
                        <img src={p.banner_url} alt="" style={{ width: 40, height: 32, borderRadius: 6, objectFit: 'cover' }}/>
                      ) : (
                        <div style={{ width: 40, height: 32, borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}/>
                      )}
                      <span style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>{p.title}</span>
                    </div>
                  </td>
                  <td style={TD}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {(p.tech_stack as string[])?.slice(0, 3).map((t: string) => (
                        <span key={t} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(0,212,255,0.06)', color: 'var(--cyan)', border: '1px solid rgba(0,212,255,0.1)' }}>{t}</span>
                      ))}
                    </div>
                  </td>
                  <td style={TD}>{p.created_at ? formatDateShort(p.created_at) : 'N/A'}</td>
                  <td style={TD}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => { setForm({ ...p, tech_stack: (p.tech_stack as string[])?.join(', ') || '' }); setEditId(p.id || null); setShowForm(true) }} style={BS_ACT}>Edit</button>
                      <button onClick={() => p.id && handleDelete(p.id)} style={{ ...BS_ACT, color: '#EF4444' }}>Delete</button>
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

interface BannerUploadProps {
  value: string
  onChange: (url: string) => void
}

function BannerUpload({ value, onChange }: BannerUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true); setError('')
    try {
      const apiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'
      const signRes = await fetch(`${apiBase}/api/upload/sign`, { method: 'POST' })
      const { signature, timestamp, api_key, cloud_name } = await signRes.json()
      const formData = new FormData()
      formData.append('file', file)
      formData.append('timestamp', timestamp)
      formData.append('signature', signature)
      formData.append('api_key', api_key)
      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, { method: 'POST', body: formData })
      const result = await uploadRes.json()
      if (result.secure_url) onChange(result.secure_url)
    } catch {
      setError('Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <label style={LS}>Project Banner</label>
      <div style={{ border: '1px dashed var(--border)', borderRadius: 12, padding: 20, textAlign: 'center', cursor: 'pointer' }} onClick={() => fileRef.current?.click()}>
        {value ? <img src={value} style={{ height: 100, borderRadius: 8 }} alt="" /> : <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{uploading ? 'Uploading...' : '+ Upload Project Banner'}</p>}
        <input ref={fileRef} type="file" hidden onChange={handleFile} accept="image/*" />
      </div>
      {error && <p style={{ color: '#EF4444', fontSize: 11 }}>{error}</p>}
    </div>
  )
}

interface FormFieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

function FormField({ label, value, onChange, placeholder = '' }: FormFieldProps) {
  return (
    <div>
      <label style={LS}>{label}</label>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={IS} />
    </div>
  )
}

const LS: React.CSSProperties = { display: 'block', color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }
const IS: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: 13, outline: 'none' }
const TH: React.CSSProperties = { padding: '12px 16px', textAlign: 'left' as const, fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }
const TD: React.CSSProperties = { padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }
const BS_PRI: React.CSSProperties = { padding: '10px 24px', background: 'var(--cyan)', border: 'none', borderRadius: 8, color: '#0A0E1A', fontSize: 13, fontWeight: 700, cursor: 'pointer' }
const BS_SEC: React.CSSProperties = { padding: '10px 20px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }
const BS_ACT: React.CSSProperties = { padding: '4px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer' }
