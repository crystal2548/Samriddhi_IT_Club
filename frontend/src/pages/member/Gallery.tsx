import { useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '../../utils/supabase'
import { useAuth } from '../../context/AuthContext'

export default function Gallery() {
  const { profile, isExecutive, loading: authLoading } = useAuth()
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef(null)

  const fetchGallery = useCallback(async () => {
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
  }, []) // Empty dependency array as it relies on stable setters

  useEffect(() => {
    fetchGallery()
  }, [fetchGallery])

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

  if (authLoading) return <p className="text-gray-400">Loading...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div>
          <p className="text-[#00D4FF] text-[11px] font-bold uppercase tracking-[0.1em] mb-1.5">
            Member Portal
          </p>
          <h1 className="font-['Barlow_Condensed',sans-serif] text-[32px] font-extrabold text-white uppercase">
            Club Gallery
          </h1>
        </div>
        {isExecutive && (
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="px-5 py-2.5 bg-[#00D4FF] border-none rounded-lg text-[#0A0E1A] text-[13px] font-bold cursor-pointer disabled:cursor-wait"
          >
            {uploading ? 'Uploading...' : '+ Upload Photo'}
          </button>
        )}
        <input ref={fileRef} type="file" hidden accept="image/*" onChange={handleUpload} />
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-4 mb-6 text-red-500 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="aspect-square bg-white/5 rounded-xl border border-white/10" />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="p-20 text-center bg-[#0D1829] rounded-2xl border border-dashed border-white/10">
          <p className="text-gray-400 text-[15px]">No photos in the gallery yet.</p>
          {isExecutive && <p className="text-gray-400 text-[13px] mt-2">Help us build our history by uploading event photos.</p>}
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
          {images.map(img => (
            <div key={img.id} className="relative rounded-xl overflow-hidden bg-[#0D1829] border border-white/10 transition-transform duration-200 cursor-zoom-in hover:scale-[1.02] group">
              <img src={img.image_url} alt={img.caption} className="w-full aspect-square object-cover" />
              <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/80 to-transparent text-white text-[11px]">
                <p className="font-semibold overflow-hidden text-ellipsis whitespace-nowrap">{img.caption}</p>
                <p className="opacity-70">By {img.profiles?.full_name || 'Member'}</p>
              </div>
              {(isExecutive || img.uploaded_by === profile.id) && (
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(img.id) }}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500/80 border-none text-white cursor-pointer flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity">
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
