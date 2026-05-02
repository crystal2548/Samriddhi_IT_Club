import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../utils/supabase'
import { formatDateTime, formatDateShort } from '../../utils/formatters'

const TYPE_FILTERS = ['All', 'Hackathon', 'Workshop', 'Seminar', 'Bootcamp', 'Social', 'Fest']

const TYPE_COLOR: Record<string, string> = {
  hackathon: '#00D4FF',
  workshop:  '#FF2D9B',
  seminar:   '#00BFA5',
  bootcamp:  '#A78BFA',
  social:    '#F59E0B',
  fest:      '#FF2D9B',
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; border: string }> = {
  upcoming:  { label: 'Upcoming',  bg: 'rgba(16,185,129,0.1)',  color: '#10B981', border: 'rgba(16,185,129,0.25)'  },
  ongoing:   { label: 'Ongoing',   bg: 'rgba(245,158,11,0.1)',  color: '#F59E0B', border: 'rgba(245,158,11,0.25)'  },
  completed: { label: 'Completed', bg: 'rgba(107,114,128,0.15)',color: '#9CA3AF', border: 'rgba(107,114,128,0.25)' },
  cancelled: { label: 'Cancelled', bg: 'rgba(239,68,68,0.1)',   color: '#EF4444', border: 'rgba(239,68,68,0.25)'   },
}

// ── Shared container ──────────────────────────────────────────────────────
function Container({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', boxSizing: 'border-box', width: '100%', ...style }}>
      {children}
    </div>
  )
}

export default function Events() {
  const navigate     = useNavigate()
  const { user }     = useAuth()
  const queryClient  = useQueryClient()

  const [typeFilter, setTypeFilter] = useState('All')
  const [timeFilter, setTimeFilter] = useState('upcoming')
  const [search,     setSearch]     = useState('')
  const [selected,   setSelected]   = useState<any>(null)
  const [regSuccess, setRegSuccess] = useState(false)

  const { data: events = [], isLoading: loading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase.from('events').select('*').order('event_date', { ascending: true })
      if (error) throw error
      return data || []
    },
  })

  const { data: registeredIds = [] } = useQuery({
    queryKey: ['event_registrations', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase.from('event_registrations').select('event_id').eq('member_id', user.id)
      if (error) throw error
      return data?.map(r => r.event_id) || []
    },
    enabled: !!user,
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
    },
  })

  const unregisterMutation = useMutation({
    mutationFn: async (eventId: string) => {
      if (!user) throw new Error('Not logged in')
      const { error } = await supabase.from('event_registrations').delete().eq('event_id', eventId).eq('member_id', user.id)
      if (error) throw error
      return eventId
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['event_registrations', user?.id] }),
  })

  const filtered = events.filter((e: any) => {
    const matchType   = typeFilter === 'All' || e.type === typeFilter.toLowerCase()
    const matchTime   = timeFilter === 'upcoming' ? ['upcoming', 'ongoing'].includes(e.status) : e.status === 'completed'
    const matchSearch = e.title?.toLowerCase().includes(search.toLowerCase())
    return matchType && matchTime && matchSearch
  })

  return (
    <>
      <style>{`
        .events-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        @media (max-width: 1024px) { .events-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px)  { .events-grid { grid-template-columns: 1fr; } }

        .event-card {
          transition: transform 0.28s ease, border-color 0.28s ease, box-shadow 0.28s ease;
        }
        .event-card:hover {
          transform: translateY(-6px);
          border-color: rgba(0,212,255,0.3) !important;
          box-shadow: 0 20px 40px -12px rgba(0,212,255,0.15);
        }
        .event-card:hover .event-card-title { color: #00D4FF; }
        .event-card:hover .event-banner-blur { transform: scale(1.5); opacity: 0.6 !important; }
        .event-card:hover .event-banner-img  { transform: scale(1.06); }

        .event-banner-blur { transition: transform 0.5s ease, opacity 0.5s ease; }
        .event-banner-img  { transition: transform 0.5s ease; }

        .type-pill-inactive:hover { border-color: rgba(255,255,255,0.22) !important; color: rgba(255,255,255,0.65) !important; }
        .search-input:focus  { border-color: rgba(0,212,255,0.4) !important; outline: none; }
        .search-input::placeholder { color: rgba(255,255,255,0.2); }

        .reg-btn-register:hover  { background: #00D4FF !important; color: #0A0E1A !important; box-shadow: 0 0 20px rgba(0,212,255,0.4); }
        .reg-btn-unregister:hover { background: #EF4444 !important; color: #fff !important; }
      `}</style>

      <div style={{ background: '#0A0E1A', minHeight: '100vh', fontFamily: "'Inter', -apple-system, sans-serif" }}>

        {/* ── Hero ──────────────────────────────────────────────────── */}
        <div style={{ paddingTop: 96, paddingBottom: 56, borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'linear-gradient(135deg, #0A0E1A 0%, #0D1829 100%)' }}>
          <Container>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 28, fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
              <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
              <span>›</span>
              <span style={{ color: '#00D4FF' }}>Events Hub</span>
            </div>

            <h1 style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 'clamp(48px, 7vw, 72px)',
              fontWeight: 900, color: '#fff',
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              lineHeight: 1, margin: '0 0 16px',
            }}>
              Events
            </h1>

            <div style={{ width: 60, height: 3, background: 'linear-gradient(90deg, #00D4FF, #FF2D9B)', borderRadius: 2, marginBottom: 20 }} />

            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15, lineHeight: 1.7, maxWidth: 520, margin: 0 }}>
              Join our curated sessions designed to bridge the gap between academic theory and industry reality. From high-stakes hackathons to focused workshops.
            </p>
          </Container>
        </div>

        {/* ── Filters ───────────────────────────────────────────────── */}
        <div style={{
          position: 'sticky', top: 64, zIndex: 30,
          background: 'rgba(10,14,26,0.96)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          padding: '14px 0',
        }}>
          <Container>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>

              {/* Type pills */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
                {TYPE_FILTERS.map(t => (
                  <button
                    key={t}
                    className={typeFilter !== t ? 'type-pill-inactive' : ''}
                    onClick={() => setTypeFilter(t)}
                    style={{
                      padding: '7px 16px', borderRadius: 100, fontSize: 12, fontWeight: 600,
                      cursor: 'pointer', border: '1px solid', transition: 'all 0.15s',
                      background:  typeFilter === t ? 'rgba(0,212,255,0.1)'       : 'transparent',
                      color:       typeFilter === t ? '#00D4FF'                   : 'rgba(255,255,255,0.4)',
                      borderColor: typeFilter === t ? 'rgba(0,212,255,0.35)'      : 'rgba(255,255,255,0.1)',
                      boxShadow:   typeFilter === t ? '0 0 12px rgba(0,212,255,0.12)' : 'none',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, flexWrap: 'wrap' }}>
                {/* Upcoming / Past toggle */}
                <div style={{ display: 'flex', background: '#0D1829', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 100, padding: 3, gap: 2 }}>
                  {['upcoming', 'past'].map(t => (
                    <button
                      key={t}
                      onClick={() => setTimeFilter(t)}
                      style={{
                        padding: '6px 16px', borderRadius: 100, fontSize: 11, fontWeight: 600,
                        cursor: 'pointer', border: 'none', textTransform: 'capitalize', transition: 'all 0.15s',
                        background: timeFilter === t ? 'rgba(0,212,255,0.15)' : 'transparent',
                        color:      timeFilter === t ? '#00D4FF'              : 'rgba(255,255,255,0.4)',
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div style={{ position: 'relative' }}>
                  <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }}
                    width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  <input
                    className="search-input"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Find an event…"
                    style={{
                      background: '#0D1829', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 100, padding: '8px 16px 8px 34px',
                      color: '#fff', fontSize: 12, width: 170, boxSizing: 'border-box',
                      fontFamily: "'Inter', sans-serif", transition: 'border-color 0.2s',
                    }}
                  />
                </div>
              </div>
            </div>
          </Container>
        </div>

        {/* ── Event Grid ────────────────────────────────────────────── */}
        <div style={{ padding: '48px 0 80px' }}>
          <Container>
            {loading ? (
              <div className="events-grid">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} style={{ background: '#0D1829', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
                    <div style={{ height: 240, background: 'rgba(255,255,255,0.04)' }} />
                    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ height: 10, borderRadius: 4, background: 'rgba(255,255,255,0.05)', width: '40%' }} />
                      <div style={{ height: 14, borderRadius: 4, background: 'rgba(255,255,255,0.05)', width: '80%' }} />
                      <div style={{ height: 10, borderRadius: 4, background: 'rgba(255,255,255,0.03)', width: '60%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 24px', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 20 }}>
                <svg style={{ margin: '0 auto 16px', display: 'block', color: 'rgba(255,255,255,0.1)' }}
                  width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8"  y1="2" x2="8"  y2="6"/>
                  <line x1="3"  y1="10" x2="21" y2="10"/>
                </svg>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No events found</p>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Try changing the filters or check back soon.</p>
              </div>
            ) : (
              <div className="events-grid">
                {filtered.map((event: any) => {
                  const st           = STATUS_CONFIG[event.status] || STATUS_CONFIG.upcoming
                  const isRegistered = registeredIds.includes(event.id)
                  const canRegister  = ['upcoming', 'ongoing'].includes(event.status)
                  const pending      = registerMutation.isPending || unregisterMutation.isPending
                  const typeColor    = TYPE_COLOR[event.type] || '#00D4FF'

                  return (
                    <div
                      key={event.id}
                      className="event-card"
                      onClick={() => navigate(`/events/${event.id}`)}
                      style={{
                        background: '#0D1829',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 20,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                      }}
                    >
                      {/* Banner */}
                      <div style={{ height: 240, background: '#050812', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {event.banner_url && (
                          <div
                            className="event-banner-blur"
                            style={{
                              position: 'absolute', inset: 0,
                              backgroundImage: `url(${event.banner_url})`,
                              backgroundSize: 'cover', backgroundPosition: 'center',
                              filter: 'blur(20px)', opacity: 0.4, transform: 'scale(1.25)',
                            }}
                          />
                        )}
                        {event.banner_url ? (
                          <img
                            className="event-banner-img"
                            src={event.banner_url} alt={event.title}
                            style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', objectFit: 'contain', padding: 8 }}
                          />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0D1829, #142040)', position: 'relative', zIndex: 1 }}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(0,212,255,0.15)" strokeWidth="1">
                              <rect x="3" y="4" width="18" height="18" rx="2"/>
                              <line x1="16" y1="2" x2="16" y2="6"/>
                              <line x1="8"  y1="2" x2="8"  y2="6"/>
                              <line x1="3"  y1="10" x2="21" y2="10"/>
                            </svg>
                          </div>
                        )}

                        {/* Status badge */}
                        <div style={{ position: 'absolute', top: 14, right: 14, zIndex: 20 }}>
                          <span style={{
                            fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
                            padding: '5px 12px', borderRadius: 100,
                            background: st.bg, color: st.color, border: `1px solid ${st.border}`,
                            backdropFilter: 'blur(8px)',
                          }}>
                            {st.label}
                          </span>
                        </div>

                        {/* Bottom shimmer */}
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.4), transparent)', zIndex: 20 }} />
                      </div>

                      {/* Body */}
                      <div style={{ padding: '24px 24px 26px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: typeColor, marginBottom: 10, display: 'block' }}>
                          {event.type}
                        </span>

                        <h3 className="event-card-title" style={{ color: '#fff', fontSize: 18, fontWeight: 700, lineHeight: 1.35, margin: '0 0 10px', transition: 'color 0.25s' }}>
                          {event.title}
                        </h3>

                        {event.description && (
                          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.65, marginBottom: 20, flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {event.description}
                          </p>
                        )}

                        {/* Meta */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
                          {event.event_date && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 500 }}>
                              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="2.5">
                                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                                  <line x1="16" y1="2" x2="16" y2="6"/>
                                  <line x1="8"  y1="2" x2="8"  y2="6"/>
                                  <line x1="3"  y1="10" x2="21" y2="10"/>
                                </svg>
                              </div>
                              {formatDateTime(event.event_date)}
                            </div>
                          )}
                          {event.location && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 500 }}>
                              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FF2D9B" strokeWidth="2.5">
                                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                  <circle cx="12" cy="10" r="3"/>
                                </svg>
                              </div>
                              {event.location}
                            </div>
                          )}
                        </div>

                        {/* Register button */}
                        <button
                          className={isRegistered ? 'reg-btn-unregister' : canRegister ? 'reg-btn-register' : ''}
                          onClick={e => {
                            e.stopPropagation()
                            if (!canRegister) return
                            isRegistered ? unregisterMutation.mutate(event.id) : registerMutation.mutate(event.id)
                          }}
                          disabled={pending || !canRegister}
                          style={{
                            width: '100%', padding: '13px', borderRadius: 12,
                            fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                            transition: 'all 0.2s', border: '1px solid', cursor: canRegister ? 'pointer' : 'not-allowed',
                            fontFamily: "'Inter', sans-serif",
                            ...(isRegistered ? {
                              background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)', color: '#EF4444',
                            } : canRegister ? {
                              background: 'rgba(0,212,255,0.08)', borderColor: 'rgba(0,212,255,0.2)', color: '#00D4FF',
                            } : {
                              background: 'rgba(107,114,128,0.08)', borderColor: 'rgba(107,114,128,0.15)', color: 'rgba(255,255,255,0.25)',
                            }),
                          }}
                        >
                          {pending ? '…' : isRegistered ? 'Unregister' : canRegister ? 'Register Now →' : 'Event Ended'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Container>
        </div>

        {/* ── Detail Modal ──────────────────────────────────────────── */}
        {selected && (
          <div
            onClick={() => setSelected(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backdropFilter: 'blur(4px)' }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{ background: '#0F1527', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 20, width: '100%', maxWidth: 680, maxHeight: '90vh', overflow: 'auto' }}
            >
              {/* Banner */}
              <div style={{ height: 200, background: 'linear-gradient(135deg, #0D1829, #142040)', position: 'relative', overflow: 'hidden', borderRadius: '20px 20px 0 0' }}>
                {selected.banner_url
                  ? <img src={selected.banner_url} alt={selected.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="rgba(0,212,255,0.1)" strokeWidth="1">
                        <rect x="3" y="4" width="18" height="18" rx="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8"  y1="2" x2="8"  y2="6"/>
                        <line x1="3"  y1="10" x2="21" y2="10"/>
                      </svg>
                    </div>
                }
                <div style={{ position: 'absolute', top: 14, left: 14 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '4px 12px', borderRadius: 100, background: 'rgba(255,45,155,0.8)', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {selected.type} · {new Date(selected.event_date).getFullYear()}
                  </span>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  style={{ position: 'absolute', top: 14, right: 14, width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 20, lineHeight: '30px', textAlign: 'center', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  ×
                </button>
              </div>

              {/* Content */}
              <div style={{ padding: '28px 28px 32px', display: 'grid', gridTemplateColumns: '1fr 260px', gap: 28 }}>
                <div>
                  <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.01em', margin: '0 0 16px' }}>
                    {selected.title}
                  </h2>
                  {selected.description && (
                    <>
                      <p style={{ color: '#00D4FF', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Event Overview</p>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.75, margin: 0 }}>{selected.description}</p>
                    </>
                  )}
                </div>

                {/* Sidebar */}
                <div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {selected.registration_deadline && (
                      <p style={{ color: '#00D4FF', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                        Open until {formatDateShort(selected.registration_deadline)}
                      </p>
                    )}

                    <div>
                      <p style={{ color: '#fff', fontSize: 15, fontWeight: 700, margin: '0 0 4px' }}>Join the Session</p>
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, lineHeight: 1.5, margin: '0 0 14px' }}>
                        {selected.max_participants ? 'Limited seats available.' : 'Open to all members.'} Secure your spot now.
                      </p>

                      {regSuccess && (
                        <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 8, padding: '8px 12px', marginBottom: 10, color: '#10B981', fontSize: 12 }}>
                          ✓ Successfully registered!
                        </div>
                      )}

                      {selected.external_link ? (
                        <a
                          href={selected.external_link} target="_blank" rel="noopener noreferrer"
                          style={{ display: 'block', width: '100%', padding: '10px', borderRadius: 10, background: '#00D4FF', color: '#0A0E1A', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box', transition: 'background 0.2s' }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#fff')}
                          onMouseLeave={e => (e.currentTarget.style.background = '#00D4FF')}
                        >
                          Register Now →
                        </a>
                      ) : (
                        <button
                          onClick={() => registeredIds.includes(selected.id) ? unregisterMutation.mutate(selected.id) : registerMutation.mutate(selected.id)}
                          disabled={registerMutation.isPending || unregisterMutation.isPending || !['upcoming', 'ongoing'].includes(selected.status)}
                          style={{
                            width: '100%', padding: '10px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                            textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer',
                            transition: 'all 0.2s', boxSizing: 'border-box',
                            ...(registeredIds.includes(selected.id) ? {
                              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444',
                            } : {
                              background: '#00D4FF', border: '1px solid transparent', color: '#0A0E1A',
                            }),
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fff' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = registeredIds.includes(selected.id) ? 'rgba(239,68,68,0.1)' : '#00D4FF' }}
                        >
                          {(registerMutation.isPending || unregisterMutation.isPending) ? '…' : registeredIds.includes(selected.id) ? 'Unregister' : 'Register Now'}
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                      <span>Price: <span style={{ color: '#fff' }}>Free</span></span>
                      {selected.max_participants && <span>{selected.max_participants} seats</span>}
                    </div>
                  </div>

                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selected.event_date && (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                          <rect x="3" y="4" width="18" height="18" rx="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8"  y1="2" x2="8"  y2="6"/>
                          <line x1="3"  y1="10" x2="21" y2="10"/>
                        </svg>
                        {formatDateTime(selected.event_date)}
                      </div>
                    )}
                    {selected.location && (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
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
    </>
  )
}