import React, { useState, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../utils/supabase'
import { useAuth } from '../../context/AuthContext'
import { formatDateShort } from '../../utils/formatters'

export interface AppProject {
  id?: string;
  title: string;
  description?: string;
  banner_url?: string;
  tech_stack: string | string[];
  github_url?: string;
  demo_url?: string;
  is_featured: boolean;
  category?: string;
  added_by?: string;
  created_at?: string;
}

const EMPTY_PROJECT: AppProject = {
  title: '', description: '', banner_url: '',
  tech_stack: '', github_url: '', demo_url: '',
  is_featured: false, category: 'Web Development'
}

// ── Shared container ──
function Container({ children, style = {} }: { children: React.ReactNode, style?: React.CSSProperties }) {
  return (
    <div style={{
      width: '100%',
      maxWidth: 1200,
      margin: '0 auto',
      padding: '0 32px',
      boxSizing: 'border-box',
      ...style
    }}>
      {children}
    </div>
  )
}

export default function OCProjects() {
  const { profile } = useAuth()
  const queryClient = useQueryClient()

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<AppProject>(EMPTY_PROJECT)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const { data: projects = [], isLoading: loading } = useQuery({
    queryKey: ['oc_projects'],
    queryFn: async () => {
      const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
      return data || []
    }
  })

  async function handleSave() {
    if (!form.title) { setError('Title is required.'); return }
    setSaving(true); setError('')

    const techArray = typeof form.tech_stack === 'string'
      ? form.tech_stack.split(',').map(t => t.trim()).filter(t => t)
      : form.tech_stack

    const { category, ...formData } = form
    const payload = { ...formData, tech_stack: techArray, added_by: profile?.id }

    try {
      if (editId) {
        const { error: err } = await supabase.from('projects').update(payload).eq('id', editId)
        if (err) throw err
        queryClient.setQueryData(['oc_projects'], (prev: AppProject[] | undefined) =>
          prev ? prev.map(p => p.id === editId ? { ...p, ...payload } : p) : []
        )
      } else {
        const { data, error: err } = await supabase.from('projects').insert(payload).select().single()
        if (err) throw err
        if (data) {
          queryClient.setQueryData(['oc_projects'], (prev: AppProject[] | undefined) => prev ? [data, ...prev] : [data])
        }
      }
      setShowForm(false); setEditId(null); setForm(EMPTY_PROJECT)
    } catch (err: any) {
      setError(`Failed to save: ${err.message || 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this project?')) return
    const { error: err } = await supabase.from('projects').delete().eq('id', id)
    if (err) {
      alert('Delete failed: ' + err.message)
    } else {
      queryClient.setQueryData(['oc_projects'], (prev: AppProject[] | undefined) =>
        prev ? prev.filter(p => p.id !== id) : []
      )
    }
  }

  function startEdit(project: AppProject) {
    setForm({
      ...EMPTY_PROJECT, ...project,
      tech_stack: Array.isArray(project.tech_stack) ? project.tech_stack.join(', ') : (project.tech_stack || '')
    })
    setEditId(project.id || null); setShowForm(true)
  }

  return (
    <div style={{ paddingTop: 40, paddingBottom: 60 }}>
      <Container>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <p style={{ color: '#00D4FF', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
              Content
            </p>
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, fontWeight: 800, color: 'white', textTransform: 'uppercase', margin: 0, lineHeight: 1.1 }}>
              Projects
            </h1>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_PROJECT); setError('') }}
            style={{
              padding: '10px 20px',
              background: '#00D4FF',
              border: 'none',
              borderRadius: 8,
              color: '#0A0E1A',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}
          >
            + New Project
          </button>
        </div>

        {/* ── Create / Edit Form ── */}
        {showForm && (
          <div style={{
            background: '#0D1829',
            border: '1px solid rgba(0,212,255,0.2)',
            borderRadius: 12,
            padding: 24,
            marginBottom: 24,
          }}>
            <h3 style={{ color: 'white', fontSize: 15, fontWeight: 600, marginBottom: 20, margin: '0 0 20px' }}>
              {editId ? 'Edit Project' : 'Add New Project'}
            </h3>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 8, padding: '10px 14px', marginBottom: 16,
                color: '#EF4444', fontSize: 13,
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <FormField label="Title *" value={form.title} onChange={v => setForm(p => ({ ...p, title: v }))} />
              <FormField
                label="Tech Stack (comma separated)"
                value={form.tech_stack as string}
                onChange={v => setForm(p => ({ ...p, tech_stack: v }))}
                placeholder="React, Supabase, Tailwind..."
              />
              <FormField label="GitHub URL" value={form.github_url || ''} onChange={v => setForm(p => ({ ...p, github_url: v }))} />
              <FormField label="Live Demo URL" value={form.demo_url || ''} onChange={v => setForm(p => ({ ...p, demo_url: v }))} />

              <div style={{ gridColumn: '1 / -1' }}>
                <BannerUpload value={form.banner_url || ''} onChange={url => setForm(p => ({ ...p, banner_url: url }))} />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                  Description
                </label>
                <textarea
                  value={form.description || ''}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  rows={4}
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                    padding: '10px 12px', color: 'white', fontSize: 13,
                    resize: 'vertical', outline: 'none', fontFamily: 'sans-serif',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 10 }}>
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={form.is_featured}
                  onChange={e => setForm(p => ({ ...p, is_featured: e.target.checked }))}
                  style={{ cursor: 'pointer', width: 16, height: 16 }}
                />
                <label htmlFor="is_featured" style={{ color: '#9ca3af', fontSize: 13, cursor: 'pointer' }}>
                  Featured Project
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: '10px 24px', background: '#00D4FF', border: 'none',
                  borderRadius: 8, color: '#0A0E1A', fontSize: 13, fontWeight: 700,
                  cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? 'Saving...' : editId ? 'Update Project' : 'Create Project'}
              </button>
              <button
                onClick={() => { setShowForm(false); setEditId(null); setError('') }}
                style={{
                  padding: '10px 20px', background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                  color: '#9ca3af', fontSize: 13, cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── Table ── */}
        <div style={{
          background: '#0D1829',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12,
          overflow: 'hidden',
        }}>
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#9ca3af' }}>Loading projects...</div>
          ) : projects.length === 0 ? (
            <div style={{ padding: 64, textAlign: 'center' }}>
              <p style={{ color: '#9ca3af', fontSize: 13, marginBottom: 20 }}>No projects found yet.</p>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  style={{
                    background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)',
                    padding: '8px 20px', borderRadius: 8, color: '#00D4FF',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Add your first project
                </button>
              )}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    {['Project', 'Tech Stack', 'Featured', 'Created', 'Actions'].map(h => (
                      <th key={h} style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#9ca3af',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        whiteSpace: 'nowrap',
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p: AppProject) => (
                    <tr
                      key={p.id}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', transition: 'background 0.15s' }}
                      className="hover:bg-white/5"
                    >
                      {/* Project */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {p.banner_url ? (
                            <img src={p.banner_url} alt="" style={{ width: 40, height: 32, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                          ) : (
                            <div style={{ width: 40, height: 32, borderRadius: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }} />
                          )}
                          <span style={{ color: 'white', fontSize: 14, fontWeight: 500 }}>{p.title}</span>
                        </div>
                      </td>

                      {/* Tech Stack */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {Array.isArray(p.tech_stack) && p.tech_stack.slice(0, 2).map((t: string) => (
                            <span key={t} style={{
                              fontSize: 10, padding: '2px 6px', borderRadius: 4,
                              background: 'rgba(0,212,255,0.1)', color: '#00D4FF',
                              border: '1px solid rgba(0,212,255,0.15)',
                            }}>
                              {t}
                            </span>
                          ))}
                          {Array.isArray(p.tech_stack) && p.tech_stack.length > 2 && (
                            <span style={{ fontSize: 10, color: '#9ca3af' }}>+{p.tech_stack.length - 2}</span>
                          )}
                        </div>
                      </td>

                      {/* Featured */}
                      <td style={{ padding: '12px 16px' }}>
                        {p.is_featured && (
                          <span style={{
                            fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                            letterSpacing: '0.05em', padding: '2px 8px', borderRadius: 999,
                            background: 'rgba(255,45,155,0.1)', color: '#FF2D9B',
                            border: '1px solid rgba(255,45,155,0.2)',
                          }}>
                            Yes
                          </span>
                        )}
                      </td>

                      {/* Created */}
                      <td style={{ padding: '12px 16px', color: '#9ca3af', fontSize: 12, whiteSpace: 'nowrap' }}>
                        {formatDateShort(p.created_at || new Date().toISOString())}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => startEdit(p)}
                            style={{
                              padding: '4px 10px', borderRadius: 6,
                              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                              color: '#9ca3af', fontSize: 11, cursor: 'pointer',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#9ca3af' }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => p.id && handleDelete(p.id)}
                            style={{
                              padding: '4px 10px', borderRadius: 6,
                              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                              color: '#EF4444', fontSize: 11, cursor: 'pointer',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.2)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </Container>
    </div>
  )
}

/* ── Banner Upload ── */
function BannerUpload({ value, onChange }: { value: string, onChange: (v: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { setError('Image must be under 10MB.'); return }
    setUploading(true); setError('')

    try {
      const signRes = await fetch(`${import.meta.env.VITE_API_URL}/api/upload/sign`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
      })
      if (!signRes.ok) throw new Error(`Sign request failed with status: ${signRes.status}`)
      const { signature, timestamp, api_key, cloud_name } = await signRes.json()

      const formData = new FormData()
      formData.append('file', file)
      formData.append('timestamp', timestamp)
      formData.append('signature', signature)
      formData.append('api_key', api_key)

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, { method: 'POST', body: formData })
      if (!uploadRes.ok) throw new Error('Cloudinary upload failed')
      const result = await uploadRes.json()
      if (result.secure_url) { onChange(result.secure_url) }
      else throw new Error('No secure_url returned from Cloudinary')
    } catch (err: any) {
      setError(`Upload failed: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <label style={{ display: 'block', color: '#9ca3af', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
        Project Banner
      </label>
      <div
        style={{
          border: '1px dashed rgba(255,255,255,0.2)', borderRadius: 12,
          padding: 20, textAlign: 'center', transition: 'border-color 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(0,212,255,0.4)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)')}
      >
        {value ? (
          <div style={{ position: 'relative', width: 'fit-content', margin: '0 auto' }}>
            <img src={value} alt="" style={{ height: 120, borderRadius: 8, objectFit: 'cover' }} />
            <button
              onClick={() => onChange('')}
              style={{
                position: 'absolute', top: -10, right: -10,
                width: 24, height: 24, borderRadius: '50%',
                background: '#EF4444', border: 'none', color: 'white',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, lineHeight: 1,
              }}
            >×</button>
          </div>
        ) : (
          <div
            onClick={() => !uploading && fileRef.current?.click()}
            style={{ cursor: uploading ? 'wait' : 'pointer', opacity: uploading ? 0.7 : 1 }}
          >
            <div style={{ fontSize: 24, color: '#9ca3af', marginBottom: 8 }}>
              {uploading
                ? <div style={{ width: 20, height: 20, margin: '0 auto', borderRadius: '50%', border: '2px solid rgba(156,163,175,0.3)', borderTopColor: '#9ca3af', animation: 'spin 0.8s linear infinite' }} />
                : '+'}
            </div>
            <p style={{ color: '#9ca3af', fontSize: 13, margin: 0 }}>{uploading ? 'Uploading...' : 'Click to upload banner'}</p>
          </div>
        )}
        <input ref={fileRef} type="file" hidden onChange={handleFile} accept="image/*" />
      </div>
      {error && <p style={{ color: '#EF4444', fontSize: 11, marginTop: 4 }}>{error}</p>}
    </div>
  )
}

/* ── Form Field ── */
function FormField({ label, value, onChange, placeholder = '' }: {
  label: string, value: string, onChange: (v: string) => void, placeholder?: string
}) {
  return (
    <div>
      <label style={{ display: 'block', color: '#9ca3af', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
          padding: '8px 12px', color: 'white', fontSize: 13,
          outline: 'none', boxSizing: 'border-box',
        }}
      />
    </div>
  )
}