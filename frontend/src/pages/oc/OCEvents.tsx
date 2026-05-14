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

// ── Shared container — same pattern used across all pages ──
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

export default function OCEvents() {
  const { profile } = useAuth()
  const queryClient = useQueryClient()

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<AppEvent>(EMPTY_EVENT)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('All Events')

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

  const STATUS_COLORS: Record<string, { bg: string, color: string, border: string, dot: string }> = {
    upcoming:  { bg: 'bg-[#10B981]/10', color: 'text-[#10B981]', border: 'border-[#10B981]/20', dot: 'bg-[#10B981]' },
    ongoing:   { bg: 'bg-[#F59E0B]/10', color: 'text-[#F59E0B]', border: 'border-[#F59E0B]/20', dot: 'bg-[#F59E0B]' },
    completed: { bg: 'bg-white/5',      color: 'text-gray-400',  border: 'border-white/10',      dot: 'bg-gray-400'  },
    cancelled: { bg: 'bg-[#EF4444]/10', color: 'text-[#EF4444]', border: 'border-[#EF4444]/20', dot: 'bg-[#EF4444]' },
  }

  const TYPE_COLORS: Record<string, string> = {
    hackathon: 'text-[#00D4FF] border-[#00D4FF]/30',
    workshop:  'text-[#FF2D9B] border-[#FF2D9B]/30',
    seminar:   'text-[#00D4FF] border-[#00D4FF]/30',
    bootcamp:  'text-[#A78BFA] border-[#A78BFA]/30',
    social:    'text-[#F59E0B] border-[#F59E0B]/30',
    fest:      'text-[#FF2D9B] border-[#FF2D9B]/30',
  }

  const filteredEvents = events.filter((event: AppEvent) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchTerm.toLowerCase())
    if (activeTab === 'All Events') return matchesSearch
    const now = new Date()
    const eventDate = new Date(event.event_date)
    if (activeTab === 'Upcoming')  return matchesSearch && eventDate > now && event.status !== 'completed'
    if (activeTab === 'Ongoing')   return matchesSearch && event.status === 'ongoing'
    if (activeTab === 'Past')      return matchesSearch && (eventDate < now || event.status === 'completed')
    return matchesSearch
  })

  return (
    <div className="animate-fade-in" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <Container>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <p className="text-[#00D4FF] text-[11px] font-extrabold uppercase tracking-[0.25em]">Content</p>
            <h1 className="text-white text-5xl font-black font-display uppercase tracking-tighter leading-none">Events</h1>
            <p className="text-slate-400 text-[13px] font-medium" style={{ paddingTop: 4 }}>
              Stay updated with our upcoming events and activities.
            </p>
          </div>

          <button
            onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_EVENT) }}
            className="flex items-center gap-2 bg-[#00D4FF] text-[#0A0E1A] text-[14px] font-black hover:bg-white transition-all duration-300 active:scale-95 group"
            style={{
              padding: '10px 24px',
              borderRadius: 999,
              whiteSpace: 'nowrap',
              flexShrink: 0,
              boxShadow: '0 0 20px rgba(0,212,255,0.35)',
            }}
          >
            <svg className="group-hover:rotate-90 transition-transform duration-300" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Event
          </button>
        </div>

        {/* ── Filter & Search Bar ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>

          {/* Tab pills */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 2,
            background: '#0D1829', padding: 4, borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0,
          }}>
            {['All Events', 'Upcoming', 'Ongoing', 'Past'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: activeTab === tab ? '#00D4FF' : 'transparent',
                  color: activeTab === tab ? '#0A0E1A' : '#94a3b8',
                  boxShadow: activeTab === tab ? '0 2px 10px rgba(0,212,255,0.3)' : 'none',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: 'relative', width: 256, flexShrink: 0 }}>
            <svg
              style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="text-white text-[13px] outline-none placeholder:text-slate-600"
              style={{
                width: '100%',
                background: '#0D1829',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 12,
                paddingLeft: 40,
                paddingRight: 16,
                paddingTop: 10,
                paddingBottom: 10,
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* ── Create / Edit Form Card ── */}
        {showForm && (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid rgba(0,212,255,0.2)',
            borderRadius: 14,
            padding: 24,
            marginBottom: 32,
            boxShadow: '0 10px 30px rgba(0,0,0,0.25)'
          }}>
            <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 700, marginBottom: 24, fontFamily: "'Inter', sans-serif" }}>
              {editId ? 'Edit Existing Event' : 'Open New Event Entry'}
            </h3>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 8, padding: '10px 14px', marginBottom: 20,
                color: '#EF4444', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <FormField label="Title" value={form.title} onChange={v => setForm(p => ({ ...p, title: v }))} placeholder="e.g. Annual Tech Summit 2026" />

              <div>
                <label style={LS}>Type</label>
                <select
                  value={form.type}
                  onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                  style={{ ...IS, cursor: 'pointer' }}
                >
                  {['hackathon', 'workshop', 'seminar', 'bootcamp', 'social', 'fest'].map(t => (
                    <option key={t} value={t} className="bg-[#0D1829]">{t.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <FormField label="Opens At" type="datetime-local" value={form.event_date} onChange={v => setForm(p => ({ ...p, event_date: v }))} />
              <FormField label="Registration Deadline" type="datetime-local" value={form.registration_deadline || ''} onChange={v => setForm(p => ({ ...p, registration_deadline: v }))} />
              <FormField label="Location" value={form.location || ''} onChange={v => setForm(p => ({ ...p, location: v }))} placeholder="e.g. Main Hall or Online" />
              <FormField label="Max Participants" type="number" value={form.max_participants?.toString() || ''} onChange={v => setForm(p => ({ ...p, max_participants: v }))} placeholder="Leave empty for unlimited" />
              <FormField label="External Link" value={form.external_link || ''} onChange={v => setForm(p => ({ ...p, external_link: v }))} placeholder="Registration URL (optional)" />

              <div>
                <label style={LS}>Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                  style={{ ...IS, cursor: 'pointer' }}
                >
                  {['upcoming', 'ongoing', 'completed', 'cancelled'].map(s => (
                    <option key={s} value={s} className="bg-[#0D1829]">{s.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <BannerUpload value={form.banner_url || ''} onChange={url => setForm(p => ({ ...p, banner_url: url }))} />
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border)' }}>
                <input
                  type="checkbox"
                  id="featured"
                  checked={form.is_featured}
                  onChange={e => setForm(p => ({ ...p, is_featured: e.target.checked }))}
                  style={{ width: 16, height: 16, cursor: 'pointer' }}
                />
                <label htmlFor="featured" style={{ color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
                  Feature this event on the homepage
                </label>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={LS}>Description (shown on Event page)</label>
                <textarea
                  value={form.description || ''}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  rows={4}
                  placeholder="Provide a compelling description for your event..."
                  style={{ ...IS, resize: 'vertical' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: '10px 24px', background: 'var(--cyan)', border: 'none',
                  borderRadius: 8, color: '#0A0E1A', fontSize: 13, fontWeight: 700,
                  cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
              >
                {saving ? 'Processing...' : editId ? 'Update Event' : 'Create Event'}
              </button>
              <button
                onClick={() => { setShowForm(false); setEditId(null); setError('') }}
                style={{
                  padding: '10px 20px', background: 'transparent',
                  border: '1px solid var(--border)', borderRadius: 8,
                  color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                Cancel
              </button>
            </div>
          </div>
        )}


        {/* ── Events Table ── */}
        <div style={{
          background: 'rgba(13,24,41,0.5)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        }}>
          {loading ? (
            <div style={{ padding: '96px 24px', textAlign: 'center' }}>
              <div className="inline-block w-10 h-10 border-4 border-[#00D4FF]/10 border-t-[#00D4FF] rounded-full animate-spin" style={{ marginBottom: 20 }} />
              <p className="text-slate-500 text-base font-semibold">Retrieving Events...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div style={{ padding: '96px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="w-16 h-16 bg-slate-900/80 rounded-2xl flex items-center justify-center text-slate-700 border border-white/10" style={{ marginBottom: 24 }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <h3 className="text-white text-xl font-black mb-2">NO EVENTS DISCOVERED</h3>
              <p className="text-slate-500 text-[14px] font-medium max-w-sm mx-auto leading-relaxed">
                {searchTerm
                  ? `No events matching "${searchTerm}". Try a different search term.`
                  : 'Keep up the momentum. More exciting events are coming your way soon!'}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    {['EVENT', 'TYPE', 'DATE & TIME', 'STATUS', 'FEATURED', 'ACTIONS'].map(h => (
                      <th key={h} style={{
                        padding: '16px 24px',
                        textAlign: 'left',
                        fontSize: 11,
                        fontWeight: 900,
                        color: '#64748b',
                        letterSpacing: '0.15em',
                        whiteSpace: 'nowrap',
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((event: AppEvent) => {
                    const statusStyle = STATUS_COLORS[event.status] || STATUS_COLORS.upcoming
                    const date = new Date(event.event_date)
                    return (
                      <tr
                        key={event.id}
                        className="group hover:bg-white/[0.03] transition-all duration-300"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      >

                        {/* Event */}
                        <td style={{ padding: '20px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div className="group-hover:border-[#00D4FF]/30 transition-all duration-300" style={{
                              position: 'relative', width: 56, height: 56, borderRadius: 16,
                              overflow: 'hidden', background: '#1e293b', flexShrink: 0,
                              border: '1px solid rgba(255,255,255,0.1)',
                            }}>
                              {event.banner_url ? (
                                <img src={event.banner_url} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #EF4444, #7F1D1D)' }}>
                                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" style={{ opacity: 0.8 }}>
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-white text-[15px] font-black group-hover:text-[#00D4FF] transition-colors" style={{ lineHeight: 1.3 }}>
                                {event.title}
                              </p>
                              {event.location && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 12, fontWeight: 500, marginTop: 3 }}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                                  </svg>
                                  {event.location}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Type */}
                        <td style={{ padding: '20px 24px' }}>
                          <span className={`inline-block px-3 py-1 rounded-lg border text-[11px] font-black uppercase tracking-widest ${TYPE_COLORS[event.type] || 'text-[#00D4FF] border-[#00D4FF]/20'}`}>
                            {event.type}
                          </span>
                        </td>

                        {/* Date & Time */}
                        <td style={{ padding: '20px 24px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="2.5">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                              </svg>
                              {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: '#64748b' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                              </svg>
                              {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td style={{ padding: '20px 24px' }}>
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${statusStyle.bg} ${statusStyle.color} ${statusStyle.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot} animate-pulse`}/>
                            <span className="text-[11px] font-black uppercase tracking-wider">{event.status}</span>
                          </div>
                        </td>

                        {/* Featured */}
                        <td style={{ padding: '20px 24px' }}>
                          {event.is_featured && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FF2D9B]/10 border border-[#FF2D9B]/30 text-[#FF2D9B]">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                              </svg>
                              <span className="text-[11px] font-black uppercase tracking-wider">Featured</span>
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '20px 24px' }}>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <button
                              onClick={() => startEdit(event)}
                              className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500 hover:text-white transition-all hover:-translate-y-0.5"
                              title="Edit Event"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                            <button
                              onClick={() => event.id && handleDelete(event.id)}
                              className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-all hover:-translate-y-0.5"
                              title="Delete Event"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                              </svg>
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

        {/* ── Summary Footer ── */}
        <div style={{
          marginTop: 40,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: '32px 0',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          color: '#64748b',
        }}>
          <div style={{
            width: 56, height: 56, background: '#0D1829', borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.05)', color: '#00D4FF',
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p className="text-white font-black text-xl uppercase tracking-tight">
              {filteredEvents.length} Event{filteredEvents.length !== 1 ? 's' : ''} Found
            </p>
            <p className="text-[13px] font-medium text-slate-500 italic" style={{ marginTop: 2 }}>
              Keep up the momentum. More events coming soon!
            </p>
          </div>
        </div>

      </Container>
    </div>
  )
}

/* ── Banner Upload ── */
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
        method: 'POST', headers: { 'Content-Type': 'application/json' },
      })
      if (!signRes.ok) throw new Error('Failed to get signature')
      const { signature, timestamp, api_key, cloud_name } = await signRes.json()
      const formData = new FormData()
      formData.append('file', file)
      formData.append('timestamp', timestamp)
      formData.append('signature', signature)
      formData.append('api_key', api_key)
      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, { method: 'POST', body: formData })
      const result = await uploadRes.json()
      if (result.secure_url) { onChange(result.secure_url) }
      else { setError(result.error?.message || 'Upload failed. Try again.') }
    } catch { setError('Upload failed. Try again.') }
    finally { setUploading(false) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <label style={LS}>Banner Image</label>
      
      <div 
        style={{
          position: 'relative',
          height: 140,
          borderRadius: 8,
          border: '1px dashed rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.02)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
          cursor: value ? 'default' : 'pointer',
        }}
      >
        {value ? (
          <>
            <img src={value} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <button 
                type="button" 
                onClick={() => fileRef.current?.click()}
                style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6, color: '#fff', fontSize: 11, cursor: 'pointer' }}
              >Change</button>
              <button 
                type="button" 
                onClick={() => onChange('')}
                style={{ padding: '6px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, color: '#EF4444', fontSize: 11, cursor: 'pointer' }}
              >Remove</button>
            </div>
          </>
        ) : (
          <div onClick={() => !uploading && fileRef.current?.click()} style={{ textAlign: 'center' }}>
            {uploading ? (
              <div style={{ width: 20, height: 20, border: '2px solid rgba(0,212,255,0.2)', borderTopColor: '#00D4FF', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }}/>
            ) : (
              <>
                <div style={{ fontSize: 20, color: '#4b5563', marginBottom: 4 }}>+</div>
                <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>Click to upload banner</p>
              </>
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Or paste image URL here..."
          style={{ ...IS, flex: 1, fontSize: 12 }}
        />
      </div>
      
      {error && <p style={{ color: '#EF4444', fontSize: 11, marginTop: 4 }}>{error}</p>}
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden"/>
    </div>
  )
}

/* ── Form Field ── */
function FormField({ label, value, onChange, type = 'text', placeholder = '' }: {
  label: string, value: string, onChange: (v: string) => void, type?: string, placeholder?: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <label style={LS}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={IS}
        onFocus={e => e.currentTarget.style.borderColor='rgba(0,212,255,0.4)'}
        onBlur={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'}
      />
    </div>
  )
}

const LS = { display: 'block', fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 } as React.CSSProperties
const IS = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' } as React.CSSProperties