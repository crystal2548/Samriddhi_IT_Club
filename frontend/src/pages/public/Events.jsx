import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../utils/supabase'
import { formatDateTime, formatDateShort } from '../../utils/formatDate'

const TYPE_FILTERS = ['All', 'Hackathon', 'Workshop', 'Seminar', 'Bootcamp', 'Social', 'Fest']

const TYPE_COLOR = {
  hackathon: 'var(--cyan)',
  workshop:  'var(--pink)',
  seminar:   '#00BFA5',
  bootcamp:  '#A78BFA',
  social:    '#F59E0B',
  fest:      'var(--pink)',
}

const STATUS_CONFIG = {
  upcoming:  { label: 'Upcoming',  bg: 'rgba(16,185,129,0.1)',   color: '#10B981', border: 'rgba(16,185,129,0.25)' },
  ongoing:   { label: 'Ongoing',   bg: 'rgba(245,158,11,0.1)',  color: '#F59E0B', border: 'rgba(245,158,11,0.25)' },
  completed: { label: 'Completed', bg: 'rgba(107,114,128,0.15)', color: '#9CA3AF', border: 'rgba(107,114,128,0.25)' },
  cancelled: { label: 'Cancelled', bg: 'rgba(239,68,68,0.1)',   color: '#EF4444', border: 'rgba(239,68,68,0.25)' },
}

export default function Events() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('All')
  const [timeFilter, setTimeFilter] = useState('upcoming')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [registeredIds, setRegisteredIds] = useState([])
  const [registering, setRegistering] = useState(false)
  const [regSuccess, setRegSuccess] = useState(false)

  useEffect(() => { fetchEvents() }, [])

  useEffect(() => {
    if (user) fetchMyRegistrations()
  }, [user])

  async function fetchEvents() {
    setLoading(true)
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true })
    setEvents(data || [])
    setLoading(false)
  }

  async function fetchMyRegistrations() {
    const { data } = await supabase
      .from('event_registrations')
      .select('event_id')
      .eq('member_id', user.id)
    setRegisteredIds(data?.map(r => r.event_id) || [])
  }

  async function handleRegister(eventId) {
    if (!user) { window.location.href = '/login'; return }
    setRegistering(true)
    const { error } = await supabase
      .from('event_registrations')
      .insert({ event_id: eventId, member_id: user.id, status: 'registered' })
    if (!error) {
      setRegisteredIds(prev => [...prev, eventId])
      setRegSuccess(true)
      setTimeout(() => setRegSuccess(false), 3000)
    }
    setRegistering(false)
  }

  async function handleUnregister(eventId) {
    setRegistering(true)
    await supabase
      .from('event_registrations')
      .delete()
      .eq('event_id', eventId)
      .eq('member_id', user.id)
    setRegisteredIds(prev => prev.filter(id => id !== eventId))
    setRegistering(false)
  }

  const filtered = events.filter(e => {
    const matchType = typeFilter === 'All' || e.type === typeFilter.toLowerCase()
    const matchTime = timeFilter === 'upcoming'
      ? ['upcoming', 'ongoing'].includes(e.status)
      : e.status === 'completed'
    const matchSearch = e.title?.toLowerCase().includes(search.toLowerCase())
    return matchType && matchTime && matchSearch
  })

  return (
    <div style={{ background: 'var(--bg-primary)', paddingTop: 64, minHeight: '100vh' }}>

      {/* ── Page Hero ───────────────────────────────── */}
      <div style={{ padding: '48px 0 36px', borderBottom: '1px solid var(--border)', background: 'linear-gradient(135deg, #0A0E1A, #0D1829)' }}>
        <div className="container mx-auto px-6">
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, fontSize: 11, color: 'var(--text-muted)' }}>
            <span>Home</span>
            <span>›</span>
            <span style={{ color: 'var(--cyan)' }}>Events Hub</span>
          </div>
          <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 'clamp(40px,6vw,64px)', fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.02em', marginBottom: 8 }}>
            Events
          </h1>
          {/* Accent underline */}
          <div style={{ width: 60, height: 3, background: 'linear-gradient(90deg, var(--cyan), var(--pink))', borderRadius: 2, marginBottom: 16 }}/>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 520, lineHeight: 1.7 }}>
            Join our curated sessions designed to bridge the gap between academic theory and industry reality. From high-stakes hackathons to focused workshops.
          </p>
        </div>
      </div>

      {/* ── Filters ─────────────────────────────────── */}
      <div style={{ padding: '20px 0', borderBottom: '1px solid var(--border)', background: 'var(--bg-primary)', position: 'sticky', top: 64, zIndex: 30, backdropFilter: 'blur(10px)' }}>
        <div className="container mx-auto px-6">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {/* Type filters */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
              {TYPE_FILTERS.map(t => (
                <button key={t} onClick={() => setTypeFilter(t)}
                  style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s', background: typeFilter === t ? 'rgba(0,212,255,0.1)' : 'transparent', color: typeFilter === t ? 'var(--cyan)' : 'var(--text-muted)', border: `1px solid ${typeFilter === t ? 'rgba(0,212,255,0.3)' : 'var(--border)'}` }}>
                  {t}
                </button>
              ))}
            </div>

            {/* Time toggle */}
            <div style={{ display: 'flex', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: 3, gap: 2, flexShrink: 0 }}>
              {['upcoming', 'past'].map(t => (
                <button key={t} onClick={() => setTimeFilter(t)}
                  style={{ padding: '5px 14px', borderRadius: 17, fontSize: 11, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.15s', background: timeFilter === t ? 'rgba(0,212,255,0.15)' : 'transparent', color: timeFilter === t ? 'var(--cyan)' : 'var(--text-muted)', border: 'none' }}>
                  {t}
                </button>
              ))}
            </div>

            {/* Search */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Find an event..."
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '7px 14px 7px 30px', color: '#fff', fontSize: 12, outline: 'none', width: 160, fontFamily: 'Inter, sans-serif' }}
                onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.4)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Events Grid ─────────────────────────────── */}
      <div style={{ padding: '40px 0 80px' }}>
        <div className="container mx-auto px-6">
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
              {[1,2,3,4,5,6].map(i => (
                <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
                  <div style={{ height: 180, background: 'rgba(255,255,255,0.03)' }}/>
                  <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ height: 10, borderRadius: 4, background: 'rgba(255,255,255,0.05)', width: '40%' }}/>
                    <div style={{ height: 14, borderRadius: 4, background: 'rgba(255,255,255,0.05)', width: '80%' }}/>
                    <div style={{ height: 10, borderRadius: 4, background: 'rgba(255,255,255,0.03)', width: '60%' }}/>
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 24px' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" style={{ margin: '0 auto 16px', display: 'block' }}>
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <p style={{ color: 'var(--text-secondary)', fontSize: 15, fontWeight: 500, marginBottom: 6 }}>No events found</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Try changing the filters or check back soon.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
              {filtered.map(event => {
                const st = STATUS_CONFIG[event.status] || STATUS_CONFIG.upcoming
                const isRegistered = registeredIds.includes(event.id)
                const canRegister = ['upcoming', 'ongoing'].includes(event.status)

                return (
                  <div key={event.id}
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'border-color 0.2s, transform 0.2s', cursor: 'pointer' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.25)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
                    onClick={() => navigate(`/events/${event.id}`)}
                  >
                    {/* Banner */}
                    <div style={{ height: 180, background: 'linear-gradient(135deg,#0D1829,#142040)', position: 'relative', overflow: 'hidden' }}>
                      {event.banner_url
                        ? <img src={event.banner_url} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(0,212,255,0.1)" strokeWidth="1"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                          </div>
                      }
                      {/* Status badge */}
                      <div style={{ position: 'absolute', top: 12, right: 12 }}>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>{st.label}</span>
                      </div>
                      {/* Bottom line */}
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(0,212,255,0.4),transparent)' }}/>
                    </div>

                    {/* Body */}
                    <div style={{ padding: '18px 18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: TYPE_COLOR[event.type] || 'var(--cyan)', marginBottom: 8, display: 'block' }}>{event.type}</span>
                      <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 700, lineHeight: 1.3, marginBottom: 8 }}>{event.title}</h3>
                      {event.description && (
                        <p style={{ color: 'var(--text-muted)', fontSize: 12, lineHeight: 1.6, marginBottom: 12, flex: 1 }}>
                          {event.description.slice(0, 80)}...
                        </p>
                      )}

                      {/* Meta */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
                        {event.event_date && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 12 }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                            {formatDateTime(event.event_date)}
                          </div>
                        )}
                        {event.location && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 12 }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            {event.location}
                          </div>
                        )}
                        {event.max_participants && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 12 }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                            {event.max_participants} seats
                          </div>
                        )}
                      </div>

                      {/* Register button */}
                      <button
                        onClick={e => { e.stopPropagation(); canRegister && (isRegistered ? handleUnregister(event.id) : handleRegister(event.id)) }}
                        disabled={registering || !canRegister}
                        style={{ width: '100%', padding: '9px', borderRadius: 8, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', cursor: canRegister ? 'pointer' : 'default', transition: 'all 0.2s', background: isRegistered ? 'rgba(239,68,68,0.08)' : canRegister ? 'rgba(0,212,255,0.08)' : 'rgba(107,114,128,0.08)', border: `1px solid ${isRegistered ? 'rgba(239,68,68,0.2)' : canRegister ? 'rgba(0,212,255,0.2)' : 'rgba(107,114,128,0.2)'}`, color: isRegistered ? '#EF4444' : canRegister ? 'var(--cyan)' : '#6B7280' }}
                        onMouseEnter={e => { if (canRegister) e.currentTarget.style.background = isRegistered ? 'rgba(239,68,68,0.15)' : 'rgba(0,212,255,0.15)' }}
                        onMouseLeave={e => { if (canRegister) e.currentTarget.style.background = isRegistered ? 'rgba(239,68,68,0.08)' : 'rgba(0,212,255,0.08)' }}
                      >
                        {registering ? '...' : isRegistered ? 'Unregister' : canRegister ? 'Register Now' : 'Event Ended'}
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
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={() => setSelected(null)}
        >
          <div
            style={{ background: '#0F1527', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 16, width: '100%', maxWidth: 680, maxHeight: '90vh', overflow: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Banner */}
            <div style={{ height: 200, background: 'linear-gradient(135deg,#0D1829,#142040)', position: 'relative', overflow: 'hidden', borderRadius: '16px 16px 0 0' }}>
              {selected.banner_url
                ? <img src={selected.banner_url} alt={selected.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="rgba(0,212,255,0.1)" strokeWidth="1"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </div>
              }
              {/* Type badge */}
              <div style={{ position: 'absolute', top: 16, left: 16 }}>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: 'rgba(255,45,155,0.8)', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {selected.type} · {new Date(selected.event_date).getFullYear()}
                </span>
              </div>
              {/* Close */}
              <button onClick={() => setSelected(null)}
                style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, lineHeight: 1 }}>
                ×
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: '1fr 260px', gap: 28 }}>
              <div>
                <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 28, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.01em', marginBottom: 16 }}>
                  {selected.title}
                </h2>
                {selected.description && (
                  <>
                    <h4 style={{ color: 'var(--cyan)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Event Overview</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.75 }}>{selected.description}</p>
                  </>
                )}
              </div>

              {/* Sidebar */}
              <div>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {selected.registration_deadline && (
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--cyan)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                        Open until {formatDateShort(selected.registration_deadline)}
                      </div>
                    </div>
                  )}

                  <div>
                    <p style={{ color: '#fff', fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Join the Session</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 12, lineHeight: 1.5, marginBottom: 12 }}>
                      {selected.max_participants ? `Limited seats available.` : 'Open to all members.'} Secure your spot now.
                    </p>

                    {regSuccess && (
                      <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 8, padding: '8px 12px', marginBottom: 10, color: '#10B981', fontSize: 12 }}>
                        ✓ Successfully registered!
                      </div>
                    )}

                    {selected.external_link ? (
                      <a href={selected.external_link} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'block', width: '100%', padding: '11px', borderRadius: 8, background: 'var(--cyan)', color: '#0A0E1A', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center', textDecoration: 'none' }}>
                        Register Now →
                      </a>
                    ) : (
                      <button
                        onClick={() => registeredIds.includes(selected.id) ? handleUnregister(selected.id) : handleRegister(selected.id)}
                        disabled={registering || !['upcoming','ongoing'].includes(selected.status)}
                        style={{ width: '100%', padding: '11px', borderRadius: 8, background: registeredIds.includes(selected.id) ? 'rgba(239,68,68,0.1)' : 'var(--cyan)', border: registeredIds.includes(selected.id) ? '1px solid rgba(239,68,68,0.3)' : 'none', color: registeredIds.includes(selected.id) ? '#EF4444' : '#0A0E1A', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer' }}>
                        {registering ? '...' : registeredIds.includes(selected.id) ? 'Unregister' : 'Register Now'}
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-muted)' }}>
                    <span>Price: <span style={{ color: '#fff' }}>Free</span></span>
                    {selected.max_participants && <span>{selected.max_participants} seats</span>}
                  </div>
                </div>

                {/* Event details */}
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selected.event_date && (
                    <div style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      {formatDateTime(selected.event_date)}
                    </div>
                  )}
                  {selected.location && (
                    <div style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
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