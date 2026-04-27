import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase'
import { formatDateTime } from '../../utils/formatters'

export default function Gallery() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)
  const [error, setError] = useState('')

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
      if (error.code === '42P01') {
        setError("Gallery data is currently unavailable.")
      }
    } else {
      setImages(data || [])
    }
    setLoading(false)
  }

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: 80, paddingBottom: 100 }}>
      <div className="container mx-auto px-6">
        
        {/* ── Header ────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
           <div style={{ display: 'inline-block', padding: '4px 12px', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 20, marginBottom: 16 }}>
             <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Visual History</span>
           </div>
           <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 'clamp(40px, 8vw, 72px)', fontWeight: 900, color: '#fff', textTransform: 'uppercase', lineHeight: 0.9, marginBottom: 24 }}>
             CLUB <br/>
             <span style={{ color: 'var(--cyan)' }}>GALLERY</span>
           </h1>
           <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 650, margin: '0 auto', lineHeight: 1.6 }}>
             Capturing the moments that define our community. From late-night hackathons to inspiring workshops and social gatherings.
           </p>
        </div>

        {/* ── Error State ───────────────────────────────────── */}
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12, padding: '24px', textAlign: 'center', marginBottom: 40 }}>
            <p style={{ color: '#EF4444', fontSize: 14 }}>{error}</p>
          </div>
        )}

        {/* ── Gallery Masonry Grid ──────────────────────────── */}
        {loading ? (
          <div style={{ columns: '3 250px', gap: 20 }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ breakInside: 'avoid', marginBottom: 20, aspectRatio: i % 2 === 0 ? '4/5' : '1/1', background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid var(--border)' }} />
            ))}
          </div>
        ) : images.length === 0 ? (
          <div style={{ padding: 80, textAlign: 'center', background: 'var(--bg-card)', borderRadius: 24, border: '1px dashed var(--border)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" style={{ margin: '0 auto 24px', display: 'block' }}>
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
            </svg>
            <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>No memories captured yet. Check back soon!</p>
          </div>
        ) : (
          <div style={{ columns: '3 280px', gap: 24 }}>
            {images.map(img => (
              <div 
                key={img.id} 
                className="group"
                style={{ breakInside: 'avoid', marginBottom: 24, position: 'relative', borderRadius: 16, overflow: 'hidden', background: 'var(--bg-card)', border: '1px solid var(--border)', transition: 'transform 0.3s ease', cursor: 'pointer' }}
                onClick={() => setSelectedImage(img)}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(0,212,255,0.3)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border)' }}
              >
                <img 
                  src={img.image_url} 
                  alt={img.caption} 
                  style={{ width: '100%', height: 'auto', display: 'block', transition: 'filter 0.3s ease' }} 
                  onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                  onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                />
                
                {/* Overlay on hover */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 20px', background: 'linear-gradient(transparent, rgba(10,14,26,0.95))', opacity: 0, transition: 'opacity 0.3s' }}
                     className="group-hover:opacity-100">
                  <p style={{ color: '#fff', fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{img.caption}</p>
                  <p style={{ color: 'var(--cyan)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Uploaded by {img.profiles?.full_name?.split(' ')[0] || 'Member'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Lightbox Modal ────────────────────────────────── */}
        {selectedImage && (
          <div 
            style={{ position: 'fixed', inset: 0, background: 'rgba(10,14,26,0.98)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
            onClick={() => setSelectedImage(null)}
          >
            <button 
              onClick={() => setSelectedImage(null)}
              style={{ position: 'absolute', top: 32, right: 32, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: '#fff', padding: '10px 20px', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}
            >Close</button>

            <div style={{ maxWidth: '100%', maxHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}
                 onClick={e => e.stopPropagation()}>
              <img 
                src={selectedImage.image_url} 
                alt={selectedImage.caption} 
                style={{ maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain', borderRadius: 12, boxShadow: '0 20px 40px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }} 
              />
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ color: '#fff', fontSize: 24, fontWeight: 800, marginBottom: 8, textTransform: 'uppercase' }}>{selectedImage.caption}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                  Shared by <span style={{ color: 'var(--cyan)' }}>{selectedImage.profiles?.full_name || 'Member'}</span> · {formatDateTime(selectedImage.created_at)}
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
      
      <style>{`
        .group:hover div { opacity: 1 !important; }
      `}</style>
    </div>
  )
}
