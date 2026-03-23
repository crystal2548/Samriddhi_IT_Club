import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../utils/supabase'
import { useAuth } from '../../context/AuthContext'
import { formatDateTime, formatDateShort } from '../../utils/formatDate'

export default function MyEvents() {
  const { user } = useAuth()
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [unregistering, setUnregistering] = useState(null)

  useEffect(() => {
    if (user) fetchRegistrations()
  }, [user])

  async function fetchRegistrations() {
    setLoading(true)
    const { data } = await supabase
      .from('event_registrations')
      .select('*, events(id, title, type, description, event_date, location, status, banner_url, max_participants)')
      .eq('member_id', user.id)
      .order('registered_at', { ascending: false })
    setRegistrations(data || [])
    setLoading(false)
  }

  async function handleUnregister(regId, eventTitle) {
    if (!confirm(`Unregister from "${eventTitle}"?`)) return
    setUnregistering(regId)
    await supabase.from('event_registrations').delete().eq('id', regId)
    setRegistrations(prev => prev.filter(r => r.id !== regId))
    setUnregistering(null)
  }

  const filtered = registrations.filter(r => {
    if (filter === 'all') return true
    if (filter === 'upcoming') return ['upcoming', 'ongoing'].includes(r.events?.status)
    if (filter === 'past') return r.events?.status === 'completed'
    return true
  })

  const TYPE_COLOR = {
    hackathon: 'var(--cyan)',
    workshop:  'var(--pink)',
    seminar:   '#00BFA5',
    bootcamp:  '#A78BFA',
    social:    '#F59E0B',
    fest:      'var(--pink)',
  }

  const STATUS_CONFIG = {
    upcoming:  { label: 'Upcoming',  bg: 'rgba(16,185,129,0.1)',  color: '#10B981', border: 'rgba(16,185,129,0.25)' },
    ongoing:   { label: 'Ongoing',   bg: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: 'rgba(245,158,11,0.25)' },
    completed: { label: 'Completed', bg: 'rgba(107,114,128,0.15)', color: '#9CA3AF', border: 'rgba(107,114,128,0.25)' },
    cancelled: { label: 'Cancelled', bg: 'rgba(239,68,68,0.1)',  color: '#EF4444', border: 'rgba(239,68,68,0.25)' },
  }

  const upcomingCount = registrations.filter(r => ['upcoming','ongoing'].includes(r.events?.status)).length
  const pastCount = registrations.filter(r => r.events?.status === 'completed').length

  return (
    <div style={{ maxWidth: 860 }}>

      {/* ── Page header ──────────────────────────────── */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ color: 'var(--cyan)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
          Member Portal
        </p>
        <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 32, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.01em' }}>
          My Events
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
          All events you have registered for.
        </p>
      </div>

      {/* ── Stats row ────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Total registered', value: registrations.length, color: 'var(--cyan)' },
          { label: 'Upcoming',         value: upcomingCount,         color: 'var(--pink)' },
          { label: 'Attended',         value: pastCount,             color: '#A78BFA' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 18px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{s.label}</p>
            <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 32, fontWeight: 800, color: s.color, lineHeight: 1 }}>
              {loading ? '—' : s.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Filter tabs ──────────────────────────────── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { value: 'all',      label: `All (${registrations.length})` },
          { value: 'upcoming', label: `Upcoming (${upcomingCount})` },
          { value: 'past',     label: `Past (${pastCount})` },
        ].map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            style={{ padding: '7px 16px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s', background: filter === f.value ? 'rgba(0,212,255,0.1)' : 'transparent', color: filter === f.value ? 'var(--cyan)' : 'var(--text-muted)', border: `1px solid ${filter === f.value ? 'rgba(0,212,255,0.3)' : 'var(--border)'}` }}>
            {f.label}
          </button>
        ))}

        {/* Browse events link */}
        <Link to="/events" style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 16px', borderRadius: 20, fontSize: 12, fontWeight: 500, color: 'var(--cyan)', border: '1px solid rgba(0,212,255,0.2)', background: 'rgba(0,212,255,0.06)', textDecoration: 'none' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          Browse events
        </Link>
      </div>

      {/* ── Events list ──────────────────────────────── */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, height: 100 }}/>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', border: '1px dashed var(--border)', borderRadius: 14, padding: '60px 24px', textAlign: 'center' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" style={{ margin: '0 auto 14px', display: 'block' }}>
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500, marginBottom: 6 }}>
            {filter === 'upcoming' ? 'No upcoming events' : filter === 'past' ? 'No past events' : 'No registered events yet'}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 16 }}>
            Browse upcoming events and register to see them here.
          </p>
          <Link to="/events" style={{ display: 'inline-block', padding: '8px 20px', background: 'var(--cyan)', borderRadius: 7, color: '#0A0E1A', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
            Browse Events
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(reg => {
            const event = reg.events
            if (!event) return null
            const st = STATUS_CONFIG[event.status] || STATUS_CONFIG.upcoming
            const canUnregister = event.status === 'upcoming'

            return (
              <div key={reg.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', display: 'flex', transition: 'border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                {/* Banner strip */}
                <div style={{ width: 6, flexShrink: 0, background: TYPE_COLOR[event.type] || 'var(--cyan)' }}/>

                {/* Event banner thumbnail */}
                <div style={{ width: 100, flexShrink: 0, background: 'linear-gradient(135deg, #0D1829, #142040)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {event.banner_url ? (
                    <img src={event.banner_url} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                  ) : (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(0,212,255,0.15)" strokeWidth="1">
                      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: TYPE_COLOR[event.type] || 'var(--cyan)' }}>
                        {event.type}
                      </span>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 8px', borderRadius: 20, background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                        {st.label}
                      </span>
                    </div>
                    <Link to={`/events/${event.id}`} style={{ textDecoration: 'none' }}>
                      <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600, marginBottom: 5, transition: 'color 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--cyan)'}
                        onMouseLeave={e => e.currentTarget.style.color = '#fff'}
                      >
                        {event.title}
                      </h3>
                    </Link>
                    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                      {event.event_date && (
                        <span style={{ color: 'var(--text-muted)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                          {formatDateTime(event.event_date)}
                        </span>
                      )}
                      {event.location && (
                        <span style={{ color: 'var(--text-muted)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          {event.location}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <Link to={`/events/${event.id}`}
                      style={{ padding: '7px 14px', borderRadius: 7, background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: 'var(--cyan)', fontSize: 11, fontWeight: 500, textDecoration: 'none' }}>
                      View details
                    </Link>
                    {canUnregister && (
                      <button
                        onClick={() => handleUnregister(reg.id, event.title)}
                        disabled={unregistering === reg.id}
                        style={{ padding: '7px 14px', borderRadius: 7, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', fontSize: 11, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s' }}
                      >
                        {unregistering === reg.id ? 'Removing...' : 'Unregister'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}