import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../utils/supabase'
import { useAuth } from '../../context/AuthContext'
import { toSlug, formatDateTime } from '../../utils/formatDate'

const CATEGORY_OPTIONS = [
  { label: 'Development', value: 'development' },
  { label: 'AI/ML', value: 'ai/ml' },
  { label: 'Career', value: 'career' },
  { label: 'Club News', value: 'club-news' },
  { label: 'Design', value: 'design' },
  { label: 'Other', value: 'other' },
]

const EMPTY_POST = {
  title: '',
  slug: '',
  content: '',
  cover_image_url: '',
  category: 'development',
  tagsText: '',
  status: 'draft',
  is_featured: false,
  published_at: null,
}

export default function WriteBlog() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile, isExecutive, loading: authLoading } = useAuth()
  
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [coverUploading, setCoverUploading] = useState(false)
  const [error, setError] = useState('')
  const [editId, setEditId] = useState(null)
  const [slugTouched, setSlugTouched] = useState(false)
  const [form, setForm] = useState(EMPTY_POST)

  useEffect(() => {
    if (!authLoading && profile) {
      if (id) {
        fetchPostForEdit(id)
      } else {
        fetchMyPosts()
      }
    }
  }, [profile, authLoading, id])

  async function fetchMyPosts() {
    setLoading(true)
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('author_id', profile.id)
      .order('created_at', { ascending: false })
    setPosts(data || [])
    setLoading(false)
    setShowForm(false)
  }

  async function fetchPostForEdit(postId) {
    setLoading(true)
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', postId)
      .single()
    
    if (error || !data) {
      setError('Post not found.')
      setLoading(false)
      return
    }

    if (data.author_id !== profile.id && profile.role !== 'oc') {
      setError('You do not have permission to edit this post.')
      setLoading(false)
      return
    }

    setEditId(data.id)
    setForm({
      title: data.title || '',
      slug: data.slug || '',
      content: data.content || '',
      cover_image_url: data.cover_image_url || '',
      category: data.category || 'development',
      tagsText: Array.isArray(data.tags) ? data.tags.join(', ') : '',
      status: data.status || 'draft',
      is_featured: !!data.is_featured,
      published_at: data.published_at || null,
    })
    setSlugTouched(true)
    setShowForm(true)
    setLoading(false)
  }

  function computeReadMins(content) {
    const text = (content || '').trim()
    if (!text) return 1
    const words = text.split(/\s+/).filter(Boolean).length
    const wpm = 200
    return Math.max(1, Math.ceil(words / wpm))
  }

  const handleSave = async () => {
    setError('')
    const title = form.title.trim()
    const slug = form.slug.trim()
    const content = form.content

    if (!title) return setError('Title is required.')
    if (!slug) return setError('Slug is required.')
    if (!content || content.trim().length < 10) return setError('Content must be at least 10 characters.')

    setSaving(true)
    try {
      const tagsArr = form.tagsText.split(',').map(t => t.trim()).filter(Boolean)
      const read_time_mins = computeReadMins(content)

      const payload = {
        title,
        slug,
        content,
        cover_image_url: form.cover_image_url?.trim() || null,
        category: form.category,
        tags: tagsArr,
        read_time_mins,
        status: form.status,
        is_featured: form.is_featured,
        author_id: profile.id,
        published_at: form.status === 'published' 
          ? (form.published_at || new Date().toISOString()) 
          : null,
      }

      if (editId) {
        const { error: err } = await supabase
          .from('blog_posts')
          .update(payload)
          .eq('id', editId)
        if (err) throw err
      } else {
        const { error: err } = await supabase
          .from('blog_posts')
          .insert(payload)
        if (err) throw err
      }

      if (id) {
        navigate('/dashboard/blog/write') // Go back to list
      } else {
        fetchMyPosts()
      }
    } catch (err) {
      setError(err?.message || 'Failed to save post.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(postId) {
    if (!confirm('Delete this blog post?')) return
    const { error } = await supabase.from('blog_posts').delete().eq('id', postId)
    if (!error) fetchMyPosts()
  }

  useEffect(() => {
    if (editId || slugTouched || !form.title) return
    setForm(p => ({ ...p, slug: toSlug(form.title) }))
  }, [form.title, slugTouched, editId])

  if (authLoading) return <p style={{ color: 'var(--text-muted)' }}>Checking authorization...</p>
  if (!isExecutive) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h2 style={{ color: '#fff', fontSize: 24, marginBottom: 16 }}>Executive Access Required</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto' }}>
          Only club executives and OC members can write and publish blogs.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <p style={{ color: 'var(--cyan)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
            Member Portal
          </p>
          <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 32, fontWeight: 800, color: '#fff', textTransform: 'uppercase' }}>
            {showForm ? (editId ? 'Edit Blog Post' : 'Write New Post') : 'My Blog Posts'}
          </h1>
        </div>
        {!showForm && (
          <button
            onClick={() => { setEditId(null); setForm(EMPTY_POST); setShowForm(true); setSlugTouched(false) }}
            style={{ padding: '10px 20px', background: 'var(--cyan)', border: 'none', borderRadius: 8, color: '#0A0E1A', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
          >
            + Create New Post
          </button>
        )}
      </div>

      {showForm ? (
        <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 14, padding: 24, marginBottom: 24 }}>
          {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#EF4444', fontSize: 13 }}>{error}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <FormField label="Title *" value={form.title} onChange={v => setForm(p => ({ ...p, title: v }))} />
            <FormField label="Slug *" value={form.slug} onChange={v => { setSlugTouched(true); setForm(p => ({ ...p, slug: v })) }} placeholder="my-blog-post" />
            
            <div>
              <label style={LS}>Category</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={SS}>
                {CATEGORY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>

            <div>
              <label style={LS}>Status</label>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} style={SS}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={LS}>Tags (comma separated)</label>
              <input value={form.tagsText} onChange={e => setForm(p => ({ ...p, tagsText: e.target.value }))} placeholder="react, career, tech" style={IS} />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <BannerUpload 
                value={form.cover_image_url} 
                onChange={url => setForm(p => ({ ...p, cover_image_url: url }))} 
                onUploadingChange={setCoverUploading}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={LS}>Content *</label>
              <textarea
                value={form.content}
                onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                rows={12}
                placeholder="Write your blog post..."
                style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px', color: '#fff', fontSize: 14, resize: 'vertical', outline: 'none', lineHeight: 1.6 }}
              />
              <p style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 8 }}>Estimated read time: {computeReadMins(form.content)} min</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <button
              onClick={handleSave}
              disabled={saving || coverUploading}
              style={{ padding: '10px 24px', background: 'var(--cyan)', border: 'none', borderRadius: 8, color: '#0A0E1A', fontSize: 13, fontWeight: 700, cursor: (saving || coverUploading) ? 'not-allowed' : 'pointer', opacity: (saving || coverUploading) ? 0.7 : 1 }}
            >
              {saving ? 'Saving...' : (editId ? 'Update Post' : 'Publish Post')}
            </button>
            <button
              onClick={() => { if (id) navigate('/dashboard/blog/write'); else setShowForm(false); setError('') }}
              style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>Loading your posts...</div>
          ) : posts.length === 0 ? (
            <div style={{ padding: 64, textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>You haven't written any blog posts yet.</p>
              <button onClick={() => setShowForm(true)} style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', padding: '8px 20px', borderRadius: 8, color: 'var(--cyan)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Start Writing</button>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Title', 'Category', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {posts.map(post => (
                  <tr key={post.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <p style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>{post.title}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'monospace' }}>/{post.slug}</p>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{post.category}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: post.status === 'published' ? 'var(--cyan)' : 'var(--text-muted)' }}>{post.status.toUpperCase()}</span>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: 12 }}>
                      {formatDateTime(post.created_at)}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => { setEditId(post.id); startEdit(post) }} style={BS}>Edit</button>
                        <button onClick={() => handleDelete(post.id)} style={{ ...BS, color: '#EF4444' }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )

  function startEdit(post) {
    setForm({
      title: post.title,
      slug: post.slug,
      content: post.content,
      cover_image_url: post.cover_image_url || '',
      category: post.category,
      tagsText: post.tags?.join(', ') || '',
      status: post.status,
      is_featured: post.is_featured,
      published_at: post.published_at,
    })
    setSlugTouched(true)
    setShowForm(true)
  }
}

/* ── Sub-components & Styles ─────────────────────────────────── */

function FormField({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <div>
      <label style={LS}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={IS} />
    </div>
  )
}

function BannerUpload({ value, onChange, onUploadingChange }) {
  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true); onUploadingChange(true)
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
      setUploading(false); onUploadingChange(false)
    }
  }

  return (
    <div>
      <label style={LS}>Cover Image</label>
      <div style={{ border: '1px dashed var(--border)', borderRadius: 12, padding: 20, textAlign: 'center', cursor: 'pointer' }} onClick={() => fileRef.current.click()}>
        {value ? (
          <img src={value} style={{ height: 120, borderRadius: 8, marginBottom: 10 }} alt="Preview" />
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{uploading ? 'Uploading...' : '+ Upload Cover'}</p>
        )}
        <input ref={fileRef} type="file" hidden onChange={handleFile} accept="image/*" />
      </div>
      {error && <p style={{ color: '#EF4444', fontSize: 11 }}>{error}</p>}
    </div>
  )
}

const LS = { display: 'block', color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }
const IS = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 13, outline: 'none' }
const SS = { ...IS, cursor: 'pointer' }
const BS = { padding: '4px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer' }