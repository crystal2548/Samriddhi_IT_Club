import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ChangeEvent } from 'react'
import { supabase } from '../../utils/supabase'
import { useAuth } from '../../context/AuthContext'
import { toSlug, formatDateTime } from '../../utils/formatters'
import type { BlogPost } from '../../types/index'

const CATEGORY_OPTIONS = [
  { label: 'Development', value: 'development' },
  { label: 'AI/ML', value: 'ai/ml' },
  { label: 'Career', value: 'career' },
  { label: 'Club News', value: 'club-news' },
  { label: 'Design', value: 'design' },
  { label: 'Other', value: 'other' },
]

interface PostForm {
  title: string
  slug: string
  content: string
  cover_image_url: string
  category: string
  tagsText: string
  status: string
  is_featured: boolean
  published_at: string | null
}

const EMPTY_POST: PostForm = {
  title: '',
  slug: '',
  content: '',
  cover_image_url: '',
  category: 'development',
  tagsText: '',
  status: 'published',
  is_featured: false,
  published_at: null,
}

export function OCBlogPosts() {
  const { profile } = useAuth()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [coverUploading, setCoverUploading] = useState(false)
  const [coverUploadAttempted, setCoverUploadAttempted] = useState(false)
  const [error, setError] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [slugTouched, setSlugTouched] = useState(false)
  const [form, setForm] = useState<PostForm>(EMPTY_POST)

  useEffect(() => { fetchPosts() }, [])

  const categoryStyle = useMemo<Record<string, string>>(() => ({
    development: 'rgba(0,212,255,0.1)',
    'ai/ml': 'rgba(255,45,155,0.1)',
    career: 'rgba(167,139,250,0.1)',
    'club-news': 'rgba(245,158,11,0.1)',
    design: 'rgba(16,185,129,0.1)',
    other: 'rgba(255,255,255,0.06)',
  }), [])

  async function fetchPosts() {
    setLoading(true)
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })
    setPosts((data ?? []) as BlogPost[])
    setLoading(false)
  }

  function computeReadMins(content: string): number {
    const text = (content || '').trim()
    if (!text) return 1
    const words = text.split(/\s+/).filter(Boolean).length
    return Math.max(1, Math.ceil(words / 200))
  }

  const handleOpenCreate = () => {
    setEditId(null)
    setSlugTouched(false)
    setForm(EMPTY_POST)
    setError('')
    setShowForm(true)
  }

  const handleSave = async () => {
    setError('')
    const title = form.title.trim()
    const slug = form.slug.trim()
    const content = form.content

    if (!title) return setError('Title is required.')
    if (!slug) return setError('Slug is required.')
    if (!content || content.trim().length < 10) return setError('Content must be at least 10 characters.')
    if (!profile?.id) return setError('Profile not found. Please login again.')
    if (coverUploadAttempted && !form.cover_image_url) {
      return setError('Cover image upload did not complete. Please upload again (or paste the URL).')
    }

    setSaving(true)
    try {
      const tagsArr = form.tagsText.split(',').map((t: string) => t.trim()).filter(Boolean)
      const payload = {
        title, slug, content,
        cover_image_url: form.cover_image_url?.trim() || null,
        category: form.category,
        tags: tagsArr,
        read_time_mins: computeReadMins(content),
        status: form.status,
        is_featured: form.is_featured,
        author_id: profile.id,
        published_at: form.status === 'published'
          ? (form.published_at || new Date().toISOString())
          : null,
      }

      if (editId) {
        const { data } = await supabase
          .from('blog_posts').update(payload).eq('id', editId).select().single()
        if (data) {
          setPosts(prev => prev.map(p => (p.id === editId ? data as BlogPost : p)))
        } else {
          setPosts(prev => prev.map(p => (p.id === editId ? { ...p, ...payload } as BlogPost : p)))
        }
      } else {
        const { data } = await supabase
          .from('blog_posts').insert(payload).select().single()
        if (data) setPosts(prev => [data as BlogPost, ...prev])
      }

      setShowForm(false); setEditId(null); setSlugTouched(false)
      setForm(EMPTY_POST); setCoverUploadAttempted(false)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save post.'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this blog post?')) return
    setError('')
    await supabase.from('blog_posts').delete().eq('id', id)
    setPosts(prev => prev.filter(p => p.id !== id))
  }

  function startEdit(post: BlogPost) {
    setEditId(post.id ?? null)
    setSlugTouched(true)
    setError('')
    setForm({
      title: post.title || '',
      slug: post.slug || '',
      content: post.content || '',
      cover_image_url: post.cover_image_url || '',
      category: post.category || 'development',
      tagsText: Array.isArray(post.tags) ? post.tags.join(', ') : '',
      status: post.status || 'draft',
      is_featured: !!post.is_featured,
      published_at: post.published_at || null,
    })
    setShowForm(true)
  }

  useEffect(() => {
    if (editId || slugTouched || !form.title) return
    setForm(p => ({ ...p, slug: toSlug(form.title) }))
  }, [form.title, slugTouched, editId])

  return (
    <div>
      {/* ── Header ─────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <p style={{ color: 'var(--cyan)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
            Content
          </p>
          <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 32, fontWeight: 800, color: '#fff', textTransform: 'uppercase' }}>
            Blog Posts
          </h1>
        </div>
        <button onClick={handleOpenCreate} style={{ padding: '10px 20px', background: 'var(--cyan)', border: 'none', borderRadius: 8, color: '#0A0E1A', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          + New Post
        </button>
      </div>

      {/* ── Create / Edit Form ─────────────────────── */}
      {showForm && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 14, padding: 24, marginBottom: 24 }}>
          <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 600, marginBottom: 20 }}>
            {editId ? 'Edit Post' : 'Create New Post'}
          </h3>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#EF4444', fontSize: 13 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <FormField label="Title *" value={form.title} onChange={(v: string) => setForm(p => ({ ...p, title: v }))} />
            <FormField label="Slug *" value={form.slug} onChange={(v: string) => { setSlugTouched(true); setForm(p => ({ ...p, slug: v })) }} placeholder="my-post-slug" />

            <div>
              <label style={LS}>Category</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={SS}>
                {CATEGORY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={LS}>Status</label>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} style={SS}>
                <option value="draft">draft</option>
                <option value="published">published</option>
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={LS}>Tags (comma separated)</label>
              <input value={form.tagsText} onChange={e => setForm(p => ({ ...p, tagsText: e.target.value }))} placeholder="e.g. react, supabase, career" style={IS} onFocus={e => { e.target.style.borderColor = 'rgba(0,212,255,0.4)' }} onBlur={e => { e.target.style.borderColor = 'var(--border)' }} />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <BannerUpload
                value={form.cover_image_url}
                onChange={(url: string) => { setForm(p => ({ ...p, cover_image_url: url })); if (url) setCoverUploadAttempted(false) }}
                onUploadingChange={(isUploading: boolean) => { setCoverUploading(isUploading); if (isUploading) setCoverUploadAttempted(true) }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="checkbox" id="featured" checked={form.is_featured} onChange={e => setForm(p => ({ ...p, is_featured: e.target.checked }))} />
              <label htmlFor="featured" style={{ color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer' }}>Featured on homepage</label>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={LS}>Content *</label>
              <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} rows={10} placeholder="Write your blog content..." style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 13, resize: 'vertical', outline: 'none', fontFamily: 'Inter, sans-serif' } as CSSProperties} onFocus={e => { e.target.style.borderColor = 'rgba(0,212,255,0.4)' }} onBlur={e => { e.target.style.borderColor = 'var(--border)' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 8 }}>Estimated read time: {computeReadMins(form.content)} min</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button onClick={handleSave} disabled={saving || coverUploading} style={{ padding: '10px 24px', background: 'var(--cyan)', border: 'none', borderRadius: 8, color: '#0A0E1A', fontSize: 13, fontWeight: 700, cursor: saving || coverUploading ? 'not-allowed' : 'pointer', opacity: saving || coverUploading ? 0.7 : 1 }}>
              {saving ? 'Saving...' : coverUploading ? 'Uploading...' : editId ? 'Update Post' : 'Create Post'}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null); setError(''); setSlugTouched(false); setForm(EMPTY_POST) }} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Posts Table ───────────────────────────── */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
        ) : posts.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No blog posts yet. Create your first post above.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Post', 'Category', 'Status', 'Published', 'Featured', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
                <tr key={post.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {post.cover_image_url
                        ? <img src={post.cover_image_url} alt={post.title} style={{ width: 40, height: 32, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                        : <div style={{ width: 40, height: 32, borderRadius: 6, background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.1)', flexShrink: 0 }} />
                      }
                      <div style={{ minWidth: 220 }}>
                        <p style={{ color: '#fff', fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.title}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>/blog/{post.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: categoryStyle[post.category ?? ''] || 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', border: '1px solid var(--border)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {post.category?.replace('-', ' /') || '—'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, color: post.status === 'published' ? 'var(--cyan)' : 'var(--text-muted)', background: post.status === 'published' ? 'rgba(0,212,255,0.08)' : 'rgba(255,255,255,0.04)', border: `1px solid ${post.status === 'published' ? 'rgba(0,212,255,0.25)' : 'var(--border)'}`, textTransform: 'capitalize' }}>
                      {post.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 12, whiteSpace: 'nowrap' }}>
                    {post.published_at ? formatDateTime(post.published_at) : '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {post.is_featured
                      ? <span style={{ fontSize: 10, color: 'var(--pink)', background: 'rgba(255,45,155,0.1)', padding: '2px 8px', borderRadius: 10, border: '1px solid rgba(255,45,155,0.2)' }}>Featured</span>
                      : <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>No</span>
                    }
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => startEdit(post)} style={{ padding: '4px 10px', borderRadius: 6, background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: 'var(--cyan)', fontSize: 11, cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => handleDelete(post.id!)} style={{ padding: '4px 10px', borderRadius: 6, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', fontSize: 11, cursor: 'pointer' }}>Delete</button>
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

export default OCBlogPosts

/* ── Banner Upload Component ─────────────────────────────────── */
interface BannerUploadProps {
  value: string
  onChange: (url: string) => void
  onUploadingChange: (isUploading: boolean) => void
}

function BannerUpload({ value, onChange, onUploadingChange }: BannerUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { setError('Image must be under 10MB.'); return }

    setUploading(true); onUploadingChange(true); setError('')
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const signRes = await fetch(`${apiBase}/api/upload/sign`, { method: 'POST', headers: { 'Content-Type': 'application/json' } })
      if (!signRes.ok) throw new Error('Failed to get Cloudinary signature.')
      const { signature, timestamp, api_key, cloud_name } = await signRes.json() as { signature: string; timestamp: string; api_key: string; cloud_name: string }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('timestamp', timestamp)
      formData.append('signature', signature)
      formData.append('api_key', api_key)

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, { method: 'POST', body: formData })
      const result = await uploadRes.json() as { secure_url?: string; error?: { message?: string } }
      if (result.secure_url) {
        onChange(result.secure_url)
      } else {
        setError(result?.error?.message || 'Upload failed. Try again.')
      }
    } catch {
      setError('Upload failed. Try again.')
    } finally {
      setUploading(false); onUploadingChange(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div>
      <label style={LS}>Cover Image</label>
      {value && (
        <div style={{ marginBottom: 10, borderRadius: 8, overflow: 'hidden', height: 140, background: '#0D1829' }}>
          <img src={value} alt="Cover preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} style={{ padding: '8px 16px', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 7, color: 'var(--cyan)', fontSize: 12, fontWeight: 500, cursor: uploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          {uploading ? (
            <><div style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid rgba(0,212,255,0.3)', borderTopColor: 'var(--cyan)', animation: 'spin 0.7s linear infinite' }} />Uploading...</>
          ) : (
            <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>{value ? 'Change image' : 'Upload image'}</>
          )}
        </button>
        {value && (
          <button type="button" onClick={() => onChange('')} style={{ padding: '8px 14px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer' }}>Remove</button>
        )}
        <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>or paste URL</span>
        <input value={value} onChange={e => onChange(e.target.value)} placeholder="https://res.cloudinary.com/..." style={{ flex: 1, minWidth: 180, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 12, outline: 'none', fontFamily: 'Inter, sans-serif' }} onFocus={e => { e.target.style.borderColor = 'rgba(0,212,255,0.4)' }} onBlur={e => { e.target.style.borderColor = 'var(--border)' }} />
      </div>
      {error && <p style={{ color: '#EF4444', fontSize: 11, marginTop: 6 }}>{error}</p>}
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

/* ── Shared styles ───────────────────────────────────────────── */
const LS: CSSProperties = { display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }
const IS: CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif' }
const SS: CSSProperties = { ...IS, cursor: 'pointer' }

interface FormFieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
}

function FormField({ label, value, onChange, type = 'text', placeholder = '' }: FormFieldProps) {
  return (
    <div>
      <label style={LS}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={IS} onFocus={e => { e.target.style.borderColor = 'rgba(0,212,255,0.4)' }} onBlur={e => { e.target.style.borderColor = 'var(--border)' }} />
    </div>
  )
}
