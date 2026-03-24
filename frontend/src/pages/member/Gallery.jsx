import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../utils/supabase'
import { useAuth } from '../../context/AuthContext'
import { formatDateTime } from '../../utils/formatDate'

export default function Gallery() {
  const { profile, isExecutive, loading: authLoading } = useAuth()
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef(null)

  useEffect(() => {
    fetchGallery()
  }, [])

  async function fetchGallery() {
    setLoading(true)
    const { data, error } = await supabase
      .from('event_gallery')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching gallery:', error)
      // If table doesn't exist, show a helpful message
      if (error.code === '42P01') {
        setError("The 'event_gallery' table does not exist in Supabase yet. Please create it to use this feature.")
      }
    } else {
      setImages(data || [])
    }
    setLoading(false)
  }

  async function handleUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) return alert('Image must be under 10MB')

    setUploading(true)
    setError('')
    try {
      // Logic for signed upload to Cloudinary via backend
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

      if (result.secure_url) {
        const { error: dbErr } = await supabase.from('event_gallery').insert({
          image_url: result.secure_url,
          uploaded_by: profile.id,
          caption: file.name.split('.')[0]
        })
        if (dbErr) throw dbErr
        fetchGallery()
      }
    } catch (err) {
      console.error('Upload failed:', err)
      setError('Upload failed. Check if event_gallery table exists.')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Remove this image from gallery?')) return
    const { error } = await supabase.from('event_gallery').delete().eq('id', id)
    if (!error) fetchGallery()
  }

  if (authLoading) return <p style={{ color: 'var(--text-muted)' }}>Loading...</p>

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <p style={{ color: 'var(--cyan)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
            Member Portal
          </p>
          <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 32, fontWeight: 800, color: '#fff', textTransform: 'uppercase' }}>
            Club Gallery
          </h1>
        </div>
        {isExecutive && (
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            style={{ padding: '10px 20px', background: 'var(--cyan)', border: 'none', borderRadius: 8, color: '#0A0E1A', fontSize: 13, fontWeight: 700, cursor: uploading ? 'wait' : 'pointer' }}
          >
            {uploading ? 'Uploading...' : '+ Upload Photo'}
          </button>
        )}
        <input ref={fileRef} type="file" hidden accept="image/*" onChange={handleUpload} />
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '16px', marginBottom: 24, color: '#EF4444', fontSize: 14 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{ aspectRatio: '1/1', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid var(--border)' }} />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div style={{ padding: 80, textAlign: 'center', background: 'var(--bg-card)', borderRadius: 16, border: '1px dashed var(--border)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>No photos in the gallery yet.</p>
          {isExecutive && <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 8 }}>Help us build our history by uploading event photos.</p>}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
          {images.map(img => (
            <div key={img.id} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', background: 'var(--bg-card)', border: '1px solid var(--border)', transition: 'transform 0.2s', cursor: 'zoom-in' }}
                 onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                 onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              <img src={img.image_url} alt={img.caption} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', color: '#fff', fontSize: 11 }}>
                <p style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{img.caption}</p>
                <p style={{ opacity: 0.7 }}>By {img.profiles?.full_name || 'Member'}</p>
              </div>
              {(isExecutive || img.uploaded_by === profile.id) && (
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(img.id) }}
                  style={{ position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: '50%', background: 'rgba(239,68,68,0.8)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}