import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../utils/supabase'
import { formatDateTime, formatDateShort } from '../../utils/formatters'

const TYPE_FILTERS = ['All', 'Hackathon', 'Workshop', 'Seminar', 'Bootcamp', 'Social', 'Fest']

const TYPE_COLOR: Record<string, string> = {
  hackathon: 'text-[#00D4FF]',
  workshop:  'text-[#FF2D9B]',
  seminar:   'text-[#00BFA5]',
  bootcamp:  'text-[#A78BFA]',
  social:    'text-[#F59E0B]',
  fest:      'text-[#FF2D9B]',
}

const STATUS_CONFIG: Record<string, { label: string, classes: string }> = {
  upcoming:  { label: 'Upcoming',  classes: 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/25' },
  ongoing:   { label: 'Ongoing',   classes: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/25' },
  completed: { label: 'Completed', classes: 'bg-gray-500/15 text-gray-400 border-gray-500/25' },
  cancelled: { label: 'Cancelled', classes: 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/25' },
}

export default function Events() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  
  const [typeFilter, setTypeFilter] = useState('All')
  const [timeFilter, setTimeFilter] = useState('upcoming')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<any>(null)
  const [regSuccess, setRegSuccess] = useState(false)

  const { data: events = [], isLoading: loading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase.from('events').select('*').order('event_date', { ascending: true })
      if (error) throw error
      return data || []
    }
  })

  const { data: registeredIds = [] } = useQuery({
    queryKey: ['event_registrations', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase.from('event_registrations').select('event_id').eq('member_id', user.id)
      if (error) throw error
      return data?.map(r => r.event_id) || []
    },
    enabled: !!user
  })

  const registerMutation = useMutation({
    mutationFn: async (eventId: string) => {
      if (!user) { window.location.href = '/login'; throw new Error('Not logged in') }
      const { error } = await supabase.from('event_registrations').insert({ event_id: eventId, member_id: user.id, status: 'registered' })
      if (error) throw error
      return eventId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event_registrations', user?.id] })
      setRegSuccess(true)
      setTimeout(() => setRegSuccess(false), 3000)
    }
  })

  const unregisterMutation = useMutation({
    mutationFn: async (eventId: string) => {
      if (!user) throw new Error('Not logged in')
      const { error } = await supabase.from('event_registrations').delete().eq('event_id', eventId).eq('member_id', user.id)
      if (error) throw error
      return eventId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event_registrations', user?.id] })
    }
  })

  const filtered = events.filter((e: any) => {
    const matchType = typeFilter === 'All' || e.type === typeFilter.toLowerCase()
    const matchTime = timeFilter === 'upcoming'
      ? ['upcoming', 'ongoing'].includes(e.status)
      : e.status === 'completed'
    const matchSearch = e.title?.toLowerCase().includes(search.toLowerCase())
    return matchType && matchTime && matchSearch
  })

  return (
    <div className="bg-[#0A0E1A] pt-[64px] min-h-screen">

      {/* ── Page Hero ───────────────────────────────── */}
      <div className="py-12 border-b border-white/10 bg-gradient-to-br from-[#0A0E1A] to-[#0D1829]">
        <div className="container mx-auto px-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 mb-4 text-[11px] text-gray-500">
            <span>Home</span>
            <span>›</span>
            <span className="text-[#00D4FF]">Events Hub</span>
          </div>
          <h1 className="font-['Barlow_Condensed',sans-serif] text-[clamp(40px,6vw,64px)] font-black text-white uppercase tracking-[-0.02em] mb-2">
            Events
          </h1>
          {/* Accent underline */}
          <div className="w-[60px] h-[3px] bg-gradient-to-r from-[#00D4FF] to-[#FF2D9B] rounded-sm mb-4"/>
          <p className="text-gray-400 text-[14px] max-w-[520px] leading-[1.7]">
            Join our curated sessions designed to bridge the gap between academic theory and industry reality. From high-stakes hackathons to focused workshops.
          </p>
        </div>
      </div>

      {/* ── Filters ─────────────────────────────────── */}
      <div className="py-5 border-b border-white/10 bg-[#0A0E1A]/80 sticky top-[64px] z-30 backdrop-blur-md">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-2 flex-wrap justify-between">
            {/* Type filters */}
            <div className="flex gap-1.5 flex-wrap flex-1">
              {TYPE_FILTERS.map(t => (
                <button key={t} onClick={() => setTypeFilter(t)}
                  className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium cursor-pointer transition-all ${
                    typeFilter === t 
                    ? 'bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/30' 
                    : 'bg-transparent text-gray-500 border border-white/10 hover:border-white/20'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              {/* Time toggle */}
              <div className="flex bg-[#0D1829] border border-white/10 rounded-full p-[3px] gap-[2px]">
                {['upcoming', 'past'].map(t => (
                  <button key={t} onClick={() => setTimeFilter(t)}
                    className={`px-3.5 py-[5px] rounded-[17px] text-[11px] font-semibold cursor-pointer capitalize transition-all border-none ${
                      timeFilter === t ? 'bg-[#00D4FF]/15 text-[#00D4FF]' : 'bg-transparent text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Find an event..."
                  className="bg-[#0D1829] border border-white/10 rounded-full py-1.5 pr-3.5 pl-8 text-white text-[12px] outline-none w-[160px] font-['Inter',sans-serif] focus:border-[#00D4FF]/40 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Events Grid ─────────────────────────────── */}
      <div className="py-10 pb-20">
        <div className="container mx-auto px-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-[#0D1829] border border-white/10 rounded-xl overflow-hidden animate-pulse">
                  <div className="h-[180px] bg-white/5"/>
                  <div className="p-5 flex flex-col gap-2.5">
                    <div className="h-2.5 rounded bg-white/5 w-[40%]"/>
                    <div className="h-3.5 rounded bg-white/5 w-[80%]"/>
                    <div className="h-2.5 rounded bg-white/[0.03] w-[60%]"/>
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 px-6 border border-dashed border-white/10 rounded-2xl">
              <svg className="mx-auto mb-4 text-white/10" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <p className="text-gray-300 text-[15px] font-medium mb-1.5">No events found</p>
              <p className="text-gray-500 text-[13px]">Try changing the filters or check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filtered.map((event: any) => {
                const st = STATUS_CONFIG[event.status] || STATUS_CONFIG.upcoming
                const isRegistered = registeredIds.includes(event.id)
                const canRegister = ['upcoming', 'ongoing'].includes(event.status)
                const pending = registerMutation.isPending || unregisterMutation.isPending

                return (
                  <div key={event.id}
                    className="bg-[#0D1829] border border-white/10 rounded-xl overflow-hidden flex flex-col cursor-pointer transition-all duration-200 hover:border-[#00D4FF]/25 hover:-translate-y-1"
                    onClick={() => navigate(`/events/${event.id}`)}
                  >
                    {/* Banner */}
                    <div className="h-[180px] bg-gradient-to-br from-[#0D1829] to-[#142040] relative overflow-hidden">
                      {event.banner_url
                        ? <img src={event.banner_url} alt={event.title} className="w-full h-full object-cover"/>
                        : <div className="w-full h-full flex items-center justify-center">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(0,212,255,0.1)" strokeWidth="1"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                          </div>
                      }
                      {/* Status badge */}
                      <div className="absolute top-3 right-3">
                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${st.classes}`}>{st.label}</span>
                      </div>
                      {/* Bottom line */}
                      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00D4FF]/40 to-transparent"/>
                    </div>

                    {/* Body */}
                    <div className="p-4.5 pb-5 flex-1 flex flex-col">
                      <span className={`text-[10px] font-bold uppercase tracking-[0.08em] mb-2 block ${TYPE_COLOR[event.type] || 'text-[#00D4FF]'}`}>{event.type}</span>
                      <h3 className="text-white text-[14px] font-bold leading-[1.3] mb-2">{event.title}</h3>
                      {event.description && (
                        <p className="text-gray-400 text-[12px] leading-[1.6] mb-3 flex-1">
                          {event.description.slice(0, 80)}...
                        </p>
                      )}

                      {/* Meta */}
                      <div className="flex flex-col gap-1.5 mb-3.5">
                        {event.event_date && (
                          <div className="flex items-center gap-1.5 text-gray-400 text-[12px]">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                            {formatDateTime(event.event_date)}
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center gap-1.5 text-gray-400 text-[12px]">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            {event.location}
                          </div>
                        )}
                        {event.max_participants && (
                          <div className="flex items-center gap-1.5 text-gray-400 text-[12px]">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                            {event.max_participants} seats
                          </div>
                        )}
                      </div>

                      {/* Register button */}
                      <button
                        onClick={e => { e.stopPropagation(); canRegister && (isRegistered ? unregisterMutation.mutate(event.id) : registerMutation.mutate(event.id)) }}
                        disabled={pending || !canRegister}
                        className={`w-full p-2.5 rounded-lg text-[11px] font-bold uppercase tracking-[0.06em] transition-all border ${
                          isRegistered
                          ? 'bg-[#EF4444]/10 border-[#EF4444]/20 text-[#EF4444] hover:bg-[#EF4444]/15'
                          : canRegister
                          ? 'bg-[#00D4FF]/10 border-[#00D4FF]/20 text-[#00D4FF] hover:bg-[#00D4FF]/15 cursor-pointer'
                          : 'bg-gray-500/10 border-gray-500/20 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {pending ? '...' : isRegistered ? 'Unregister' : canRegister ? 'Register Now' : 'Event Ended'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Event Detail Modal ──────────────────────── */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-6"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-[#0F1527] border border-[#00D4FF]/15 rounded-2xl w-full max-w-[680px] max-h-[90vh] overflow-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Banner */}
            <div className="h-[200px] bg-gradient-to-br from-[#0D1829] to-[#142040] relative overflow-hidden rounded-t-2xl">
              {selected.banner_url
                ? <img src={selected.banner_url} alt={selected.title} className="w-full h-full object-cover"/>
                : <div className="w-full h-full flex items-center justify-center">
                    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="rgba(0,212,255,0.1)" strokeWidth="1"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </div>
              }
              {/* Type badge */}
              <div className="absolute top-4 left-4">
                <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#FF2D9B]/80 text-white uppercase tracking-[0.06em]">
                  {selected.type} · {new Date(selected.event_date).getFullYear()}
                </span>
              </div>
              {/* Close */}
              <button 
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 border border-white/10 text-white flex items-center justify-center text-[18px] leading-none cursor-pointer hover:bg-black/70"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="p-6 md:p-7 grid grid-cols-1 md:grid-cols-[1fr_260px] gap-7">
              <div>
                <h2 className="font-['Barlow_Condensed',sans-serif] text-[28px] font-extrabold text-white uppercase tracking-[-0.01em] mb-4">
                  {selected.title}
                </h2>
                {selected.description && (
                  <>
                    <h4 className="text-[#00D4FF] text-[11px] font-bold uppercase tracking-[0.1em] mb-2">Event Overview</h4>
                    <p className="text-gray-400 text-[13px] leading-[1.75]">{selected.description}</p>
                  </>
                )}
              </div>

              {/* Sidebar */}
              <div>
                <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4.5 flex flex-col gap-3.5">
                  {selected.registration_deadline && (
                    <div>
                      <div className="text-[10px] text-[#00D4FF] font-bold uppercase tracking-[0.06em] mb-1">
                        Open until {formatDateShort(selected.registration_deadline)}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-white text-[15px] font-bold mb-1">Join the Session</p>
                    <p className="text-gray-400 text-[12px] leading-snug mb-3">
                      {selected.max_participants ? `Limited seats available.` : 'Open to all members.'} Secure your spot now.
                    </p>

                    {regSuccess && (
                      <div className="bg-[#10B981]/10 border border-[#10B981]/25 rounded-lg px-3 py-2 mb-2.5 text-[#10B981] text-[12px]">
                        ✓ Successfully registered!
                      </div>
                    )}

                    {selected.external_link ? (
                      <a href={selected.external_link} target="_blank" rel="noopener noreferrer"
                        className="block w-full p-2.5 rounded-lg bg-[#00D4FF] text-[#0A0E1A] text-[12px] font-bold uppercase tracking-[0.06em] text-center no-underline hover:bg-white transition-colors">
                        Register Now →
                      </a>
                    ) : (
                      <button
                        onClick={() => registeredIds.includes(selected.id) ? unregisterMutation.mutate(selected.id) : registerMutation.mutate(selected.id)}
                        disabled={registerMutation.isPending || unregisterMutation.isPending || !['upcoming','ongoing'].includes(selected.status)}
                        className={`w-full p-2.5 rounded-lg text-[12px] font-bold uppercase tracking-[0.06em] transition-all cursor-pointer ${
                          registeredIds.includes(selected.id)
                          ? 'bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] hover:bg-[#EF4444]/20'
                          : 'bg-[#00D4FF] border border-transparent text-[#0A0E1A] hover:bg-white'
                        }`}
                      >
                        {(registerMutation.isPending || unregisterMutation.isPending) ? '...' : registeredIds.includes(selected.id) ? 'Unregister' : 'Register Now'}
                      </button>
                    )}
                  </div>

                  <div className="flex justify-between pt-3 border-t border-white/10 text-[11px] text-gray-500">
                    <span>Price: <span className="text-white">Free</span></span>
                    {selected.max_participants && <span>{selected.max_participants} seats</span>}
                  </div>
                </div>

                {/* Event details */}
                <div className="mt-3 flex flex-col gap-2">
                  {selected.event_date && (
                    <div className="flex gap-2 text-[12px] text-gray-400">
                      <svg className="shrink-0 mt-[1px]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      {formatDateTime(selected.event_date)}
                    </div>
                  )}
                  {selected.location && (
                    <div className="flex gap-2 text-[12px] text-gray-400">
                      <svg className="shrink-0 mt-[1px]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {selected.location}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
