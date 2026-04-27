import React, { useState, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../utils/supabase'
import { useAuth } from '../../context/AuthContext'
import { formatDateTime } from '../../utils/formatters'

export interface AppEvent {
  id?: string;
  title: string;
  type: string;
  description?: string;
  banner_url?: string;
  event_date: string;
  location?: string;
  registration_deadline?: string;
  max_participants?: string | number | null;
  status: string;
  is_featured: boolean;
  external_link?: string;
  created_by?: string;
}

const EMPTY_EVENT: AppEvent = {
  title: '', type: 'workshop', description: '', banner_url: '',
  event_date: '', location: '', registration_deadline: '',
  max_participants: '', status: 'upcoming', is_featured: false, external_link: ''
}

export default function OCEvents() {
  const { profile } = useAuth()
  const queryClient = useQueryClient()
  
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<AppEvent>(EMPTY_EVENT)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const { data: events = [], isLoading: loading } = useQuery({
    queryKey: ['oc_events'],
    queryFn: async () => {
      const { data } = await supabase.from('events').select('*').order('event_date', { ascending: false })
      return data || []
    }
  })

  async function handleSave() {
    if (!form.title || !form.event_date) { setError('Title and date are required.'); return }
    setSaving(true); setError('')
    
    const payload = {
      ...form,
      max_participants: form.max_participants ? parseInt(form.max_participants as string) : null,
      created_by: profile?.id,
    }
    
    if (editId) {
      await supabase.from('events').update(payload).eq('id', editId)
      queryClient.setQueryData(['oc_events'], (prev: AppEvent[] | undefined) => 
        prev ? prev.map(e => e.id === editId ? { ...e, ...payload } : e) : []
      )
    } else {
      const { data } = await supabase.from('events').insert(payload).select().single()
      if (data) {
        queryClient.setQueryData(['oc_events'], (prev: AppEvent[] | undefined) => prev ? [data, ...prev] : [data])
      }
    }
    setSaving(false); setShowForm(false); setEditId(null); setForm(EMPTY_EVENT)
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this event?')) return
    await supabase.from('events').delete().eq('id', id)
    queryClient.setQueryData(['oc_events'], (prev: AppEvent[] | undefined) => 
      prev ? prev.filter(e => e.id !== id) : []
    )
  }

  function startEdit(event: AppEvent) {
    setForm({
      ...EMPTY_EVENT, 
      ...event,
      max_participants: event.max_participants || '',
      event_date: event.event_date?.slice(0, 16) || '',
      registration_deadline: event.registration_deadline?.slice(0, 16) || '',
    })
    setEditId(event.id || null); setShowForm(true)
  }

  const STATUS_COLORS: Record<string, { bg: string, color: string, border: string }> = {
    upcoming: { bg: 'bg-[#10B981]/15', color: 'text-[#10B981]', border: 'border-[#10B981]/40' },
    ongoing: { bg: 'bg-[#F59E0B]/15', color: 'text-[#F59E0B]', border: 'border-[#F59E0B]/40' },
    completed: { bg: 'bg-[#6B7280]/15', color: 'text-[#6B7280]', border: 'border-[#6B7280]/40' },
    cancelled: { bg: 'bg-[#EF4444]/15', color: 'text-[#EF4444]', border: 'border-[#EF4444]/40' },
  }

  const TYPE_COLORS: Record<string, string> = {
    hackathon: 'text-[#00D4FF]', workshop: 'text-[#FF2D9B]',
    seminar: 'text-[#00BFA5]', bootcamp: 'text-[#A78BFA]',
    social: 'text-[#F59E0B]', fest: 'text-[#FF2D9B]',
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between mb-7">
        <div>
          <p className="text-[#00D4FF] text-[11px] font-bold uppercase tracking-[0.1em] mb-1.5">Content</p>
          <h1 className="font-['Barlow_Condensed',sans-serif] text-[32px] font-extrabold text-white uppercase">Events</h1>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_EVENT) }}
          className="px-5 py-2.5 bg-[#00D4FF] rounded-lg text-[#0A0E1A] text-[13px] font-bold cursor-pointer hover:bg-[#00D4FF]/90 transition-colors"
        >
          + New Event
        </button>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <div className="bg-[#0D1829] border border-[#00D4FF]/20 rounded-xl p-6 mb-6">
          <h3 className="text-white text-[15px] font-semibold mb-5">
            {editId ? 'Edit Event' : 'Create New Event'}
          </h3>

          {error && (
            <div className="bg-[#EF4444]/10 border border-[#EF4444]/25 rounded-lg px-3.5 py-2.5 mb-4 text-[#EF4444] text-[13px]">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Title *" value={form.title} onChange={v => setForm(p => ({ ...p, title: v }))} />

            <div>
              <label className="block text-gray-400 text-[11px] font-semibold uppercase tracking-[0.06em] mb-1.5">Type</label>
              <select 
                value={form.type} 
                onChange={e => setForm(p => ({ ...p, type: e.target.value }))} 
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-[13px] outline-none cursor-pointer focus:border-[#00D4FF]/40"
              >
                {['hackathon', 'workshop', 'seminar', 'bootcamp', 'social', 'fest'].map(t => (
                  <option key={t} value={t} className="bg-[#0D1829]">{t}</option>
                ))}
              </select>
            </div>

            <FormField label="Event Date *" type="datetime-local" value={form.event_date} onChange={v => setForm(p => ({ ...p, event_date: v }))} />
            <FormField label="Registration Deadline" type="datetime-local" value={form.registration_deadline || ''} onChange={v => setForm(p => ({ ...p, registration_deadline: v }))} />
            <FormField label="Location" value={form.location || ''} onChange={v => setForm(p => ({ ...p, location: v }))} placeholder="e.g. Main Hall or Online" />
            <FormField label="Max Participants" type="number" value={form.max_participants?.toString() || ''} onChange={v => setForm(p => ({ ...p, max_participants: v }))} placeholder="Leave empty for unlimited" />
            <FormField label="External Link" value={form.external_link || ''} onChange={v => setForm(p => ({ ...p, external_link: v }))} placeholder="External registration URL (optional)" />

            <div>
              <label className="block text-gray-400 text-[11px] font-semibold uppercase tracking-[0.06em] mb-1.5">Status</label>
              <select 
                value={form.status} 
                onChange={e => setForm(p => ({ ...p, status: e.target.value }))} 
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-[13px] outline-none cursor-pointer focus:border-[#00D4FF]/40"
              >
                {['upcoming', 'ongoing', 'completed', 'cancelled'].map(s => (
                  <option key={s} value={s} className="bg-[#0D1829]">{s}</option>
                ))}
              </select>
            </div>

            {/* Banner upload — full width */}
            <div className="col-span-2">
              <BannerUpload
                value={form.banner_url || ''}
                onChange={url => setForm(p => ({ ...p, banner_url: url }))}
              />
            </div>

            {/* Featured toggle */}
            <div className="flex items-center gap-2.5 col-span-2">
              <input
                type="checkbox"
                id="featured"
                checked={form.is_featured}
                onChange={e => setForm(p => ({ ...p, is_featured: e.target.checked }))}
                className="cursor-pointer"
              />
              <label htmlFor="featured" className="text-gray-400 text-[13px] cursor-pointer">
                Featured on homepage
              </label>
            </div>

            {/* Description — full width */}
            <div className="col-span-2">
              <label className="block text-gray-400 text-[11px] font-semibold uppercase tracking-[0.06em] mb-1.5">Description</label>
              <textarea
                value={form.description || ''}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                rows={4}
                placeholder="Full event description..."
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white text-[13px] resize-y outline-none font-sans focus:border-[#00D4FF]/40"
              />
            </div>
          </div>

          <div className="flex gap-2.5 mt-5">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-[#00D4FF] rounded-lg text-[#0A0E1A] text-[13px] font-bold cursor-pointer hover:bg-[#00D4FF]/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : editId ? 'Update Event' : 'Create Event'}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditId(null); setError('') }}
              className="px-5 py-2.5 bg-transparent border border-white/10 rounded-lg text-gray-400 text-[13px] cursor-pointer hover:bg-white/5"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Events Table */}
      <div className="bg-[#0D1829] border border-white/10 rounded-xl overflow-hidden self-start">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-[13px]">
            No events yet. Create your first event above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  {['Event', 'Type', 'Date', 'Status', 'Featured', 'Actions'].map(h => (
                    <th key={h} className="p-3 px-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em] whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {events.map((event: AppEvent) => {
                  const statusStyle = STATUS_COLORS[event.status] || STATUS_COLORS.upcoming;
                  return (
                    <tr key={event.id} className="border-b border-white/10 hover:bg-white/5 transition-colors duration-150">
                      <td className="p-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {event.banner_url ? (
                            <img src={event.banner_url} alt={event.title} className="w-10 h-8 rounded-md object-cover shrink-0"/>
                          ) : (
                            <div className="w-10 h-8 rounded-md bg-[#00D4FF]/5 border border-[#00D4FF]/10 shrink-0"/>
                          )}
                          <div>
                            <p className="text-white text-[13px] font-medium">{event.title}</p>
                            {event.location && <p className="text-gray-400 text-[11px] mt-0.5">{event.location}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 px-4">
                        <span className={`text-[10px] font-bold uppercase tracking-[0.06em] ${TYPE_COLORS[event.type] || 'text-[#00D4FF]'}`}>
                          {event.type}
                        </span>
                      </td>
                      <td className="p-3 px-4 text-gray-400 text-[12px] whitespace-nowrap">
                        {formatDateTime(event.event_date)}
                      </td>
                      <td className="p-3 px-4">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${statusStyle.bg} ${statusStyle.color} ${statusStyle.border}`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="p-3 px-4">
                        {event.is_featured && (
                          <span className="text-[10px] text-[#FF2D9B] bg-[#FF2D9B]/10 px-2 py-0.5 rounded-full border border-[#FF2D9B]/20">
                            Featured
                          </span>
                        )}
                      </td>
                      <td className="p-3 px-4">
                        <div className="flex gap-1.5 flex-nowrap">
                          <button
                            onClick={() => startEdit(event)}
                            className="px-2.5 py-1 rounded-md bg-[#00D4FF]/10 border border-[#00D4FF]/20 text-[#00D4FF] text-[11px] cursor-pointer hover:bg-[#00D4FF]/20"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => event.id && handleDelete(event.id)}
                            className="px-2.5 py-1 rounded-md bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-[11px] cursor-pointer hover:bg-[#EF4444]/20"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

/* Banner Upload Component */
function BannerUpload({ value, onChange }: { value: string, onChange: (val: string) => void }) {
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!signRes.ok) throw new Error('Failed to get signature')
      const { signature, timestamp, api_key, cloud_name } = await signRes.json()

      const formData = new FormData()
      formData.append('file', file)
      formData.append('timestamp', timestamp)
      formData.append('signature', signature)
      formData.append('api_key', api_key)

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
        { method: 'POST', body: formData }
      )
      const result = await uploadRes.json()

      if (result.secure_url) {
        onChange(result.secure_url)
      } else {
        setError(result.error?.message || 'Upload failed. Try again.')
      }
    } catch (err) {
      setError('Upload failed. Try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <label className="block text-gray-400 text-[11px] font-semibold uppercase tracking-[0.06em] mb-1.5">Banner Image</label>

      {value && (
        <div className="mb-2.5 rounded-lg overflow-hidden h-[140px] bg-[#0D1829]">
          <img src={value} alt="Banner preview" className="w-full h-full object-cover"/>
        </div>
      )}

      <div className="flex gap-2 items-center flex-wrap">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 bg-[#00D4FF]/10 border border-[#00D4FF]/20 rounded-md text-[#00D4FF] text-[12px] font-medium cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#00D4FF]/20"
        >
          {uploading ? (
            <>
              <div className="w-3 h-3 rounded-full border-2 border-[#00D4FF]/30 border-t-[#00D4FF] animate-spin"/>
              Uploading...
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
              {value ? 'Change image' : 'Upload image'}
            </>
          )}
        </button>

        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="px-3.5 py-2 bg-transparent border border-white/10 rounded-md text-gray-400 text-[12px] cursor-pointer hover:bg-white/5"
          >
            Remove
          </button>
        )}

        <span className="text-gray-400 text-[11px]">or paste URL</span>

        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="https://res.cloudinary.com/..."
          className="flex-1 min-w-[180px] bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-[12px] outline-none font-sans focus:border-[#00D4FF]/40"
        />
      </div>

      {error && <p className="text-[#EF4444] text-[11px] mt-1.5">{error}</p>}
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden"/>
    </div>
  )
}

function FormField({ label, value, onChange, type = 'text', placeholder = '' }: { label: string, value: string, onChange: (v: string) => void, type?: string, placeholder?: string }) {
  return (
    <div>
      <label className="block text-gray-400 text-[11px] font-semibold uppercase tracking-[0.06em] mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-[13px] outline-none focus:border-[#00D4FF]/40"
      />
    </div>
  )
}
