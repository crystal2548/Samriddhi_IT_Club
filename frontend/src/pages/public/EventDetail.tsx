import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../utils/supabase'
import { useAuth } from '../../context/AuthContext'
import { formatDateTime } from '../../utils/formatters'

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

// ─── Reusable container — same pattern used across all fixed pages ───
function Container({ children, style = {} }: { children: React.ReactNode, style?: React.CSSProperties }) {
  return (
    <div style={{
      maxWidth: 1200,
      margin: '0 auto',
      padding: '0 32px',
      boxSizing: 'border-box',
      width: '100%',
      ...style
    }}>
      {children}
    </div>
  )
}

export default function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isRegistered, setIsRegistered] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [regSuccess, setRegSuccess] = useState(false)

  useEffect(() => {
    fetchEvent()
    if (user) checkRegistration()
  }, [id, user])

  async function fetchEvent() {
    setLoading(true)
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching event:', error)
      navigate('/events')
    } else {
      setEvent(data)
    }
    setLoading(false)
  }

  async function checkRegistration() {
    const { data } = await supabase
      .from('event_registrations')
      .select('id')
      .eq('event_id', id)
      .eq('member_id', user?.id)
      .single()
    setIsRegistered(!!data)
  }

  async function handleRegister() {
    if (!user) { navigate('/login'); return }
    setRegistering(true)
    const { error } = await supabase
      .from('event_registrations')
      .insert({ event_id: id, member_id: user.id, status: 'registered' })
    if (!error) {
      setIsRegistered(true)
      setRegSuccess(true)
      setTimeout(() => setRegSuccess(false), 3000)
    }
    setRegistering(false)
  }

  async function handleUnregister() {
    setRegistering(true)
    await supabase
      .from('event_registrations')
      .delete()
      .eq('event_id', id)
      .eq('member_id', user?.id)
    setIsRegistered(false)
    setRegistering(false)
  }

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(0,212,255,0.1)', borderTopColor: 'var(--cyan)', animation: 'spin 1s linear infinite' }}/>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  if (!event) return null

  const st = STATUS_CONFIG[event.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.upcoming
  const canRegister = ['upcoming', 'ongoing'].includes(event.status)

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: 80, paddingBottom: 100 }}>

      {/* ─── Scoped responsive styles ─────────────────────────────── */}
      <style>{`
        .event-detail-grid {
          display: grid;
          grid-template-columns: 7fr 4fr;
          gap: 48px;
          align-items: start;
        }
        .register-btn:hover:not(:disabled) {
          opacity: 0.88;
          transform: translateY(-1px);
        }
        .register-btn:disabled {
          cursor: not-allowed;
        }
        .cancel-btn:hover:not(:disabled) {
          background: rgba(239,68,68,0.08) !important;
        }
        .back-link:hover {
          color: var(--cyan) !important;
        }
        @media (max-width: 900px) {
          .event-detail-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          /* On mobile, unstick the sidebar so it flows naturally */
          .event-sidebar {
            position: static !important;
          }
        }
        @media (max-width: 480px) {
          .event-detail-grid {
            gap: 24px;
          }
        }
      `}</style>

      <Container>

        {/* ─── Breadcrumb ───────────────────────────────────────────── */}
        <Link
          to="/events"
          className="back-link"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--text-muted)',
            fontSize: 13,
            textDecoration: 'none',
            marginBottom: 36,
            transition: 'color 0.2s',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Events Hub
        </Link>

        {/* ─── Main two-column grid ─────────────────────────────────── */}
        <div className="event-detail-grid">

          {/* ── Left: Content ──────────────────────────────────────── */}
          <div>

            {/* Banner */}
            <div style={{
              marginBottom: 36,
              display: 'flex',
              justifyContent: 'flex-start', // Align to left, looks better with left-aligned text
            }}>
              {event.banner_url ? (
                <img
                  src={event.banner_url}
                  alt={event.title}
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '500px',
                    width: 'auto',
                    height: 'auto',
                    display: 'block',
                    borderRadius: 20,
                    border: '1px solid var(--border)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                    objectFit: 'contain'
                  }}
                />
              ) : (
                <div style={{ 
                  borderRadius: 20,
                  background: 'linear-gradient(135deg, #0D1829, #142040)',
                  border: '1px solid var(--border)',
                  width: '100%', 
                  aspectRatio: '16/7', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="rgba(0,212,255,0.15)" strokeWidth="1">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
              )}
            </div>

            {/* Type + Status badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: TYPE_COLOR[event.type as keyof typeof TYPE_COLOR] || 'var(--cyan)',
              }}>
                {event.type}
              </span>
              <span style={{
                fontSize: 11,
                fontWeight: 600,
                padding: '3px 12px',
                borderRadius: 20,
                background: st.bg,
                color: st.color,
                border: `1px solid ${st.border}`,
              }}>
                {st.label}
              </span>
            </div>

            {/* Title */}
            <h1 style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: 'clamp(28px, 5vw, 48px)',
              fontWeight: 800,
              color: '#fff',
              textTransform: 'uppercase',
              letterSpacing: '0.01em',
              marginBottom: 32,
              marginTop: 0,
              lineHeight: 1.1,
            }}>
              {event.title}
            </h1>

            {/* About section */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: '28px 32px',
            }}>
              <h4 style={{
                color: 'var(--cyan)',
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginTop: 0,
                marginBottom: 16,
              }}>
                About this Event
              </h4>
              <div style={{
                whiteSpace: 'pre-wrap',
                color: 'var(--text-secondary)',
                fontSize: 15,
                lineHeight: 1.85,
                margin: 0,
              }}>
                {event.description || 'No description provided for this event.'}
              </div>
            </div>

          </div>

          {/* ── Right: Sticky Sidebar ───────────────────────────────── */}
          <div className="event-sidebar" style={{ position: 'sticky', top: 100 }}>
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: '28px',
              boxSizing: 'border-box',
            }}>

              {/* Event Details List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 28 }}>
                <DetailItem
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  }
                  label="Date & Time"
                  value={formatDateTime(event.event_date)}
                />
                <DetailItem
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  }
                  label="Location"
                  value={event.location || 'To be announced'}
                />
                {event.max_participants && (
                  <DetailItem
                    icon={
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                    }
                    label="Capacity"
                    value={`${event.max_participants} Participants`}
                  />
                )}
                {event.registration_deadline && (
                  <DetailItem
                    icon={
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                    }
                    label="Deadline"
                    value={formatDateTime(event.registration_deadline)}
                    isUrgent={new Date(event.registration_deadline) < new Date(Date.now() + 86400000)}
                  />
                )}
              </div>

              {/* Divider */}
              <div style={{ borderTop: '1px solid var(--border)', marginBottom: 24 }}/>

              {/* Success banner */}
              {regSuccess && (
                <div style={{
                  background: 'rgba(16,185,129,0.1)',
                  border: '1px solid rgba(16,185,129,0.25)',
                  borderRadius: 10,
                  padding: '12px',
                  marginBottom: 14,
                  color: '#10B981',
                  fontSize: 13,
                  textAlign: 'center',
                  fontWeight: 600,
                }}>
                  ✓ You're registered!
                </div>
              )}

              {/* CTA Button */}
              {event.external_link ? (
                <a
                  href={event.external_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary register-btn"
                  style={{
                    width: '100%',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    textDecoration: 'none',
                    padding: '14px',
                    borderRadius: 10,
                    boxSizing: 'border-box',
                    transition: 'all 0.2s',
                  }}
                >
                  Register on External Site
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                </a>
              ) : (
                <button
                  onClick={isRegistered ? handleUnregister : handleRegister}
                  disabled={registering || !canRegister}
                  className={isRegistered ? 'cancel-btn' : 'register-btn'}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    cursor: canRegister && !registering ? 'pointer' : 'not-allowed',
                    background: isRegistered
                      ? 'transparent'
                      : canRegister
                        ? 'var(--cyan)'
                        : 'rgba(255,255,255,0.05)',
                    border: isRegistered ? '1px solid #EF4444' : '1px solid transparent',
                    color: isRegistered
                      ? '#EF4444'
                      : canRegister
                        ? '#0A0E1A'
                        : 'var(--text-muted)',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box',
                  }}
                >
                  {registering
                    ? 'Processing...'
                    : isRegistered
                      ? 'Cancel Registration'
                      : canRegister
                        ? 'Register for Event'
                        : 'Registration Closed'}
                </button>
              )}

              <p style={{
                color: 'var(--text-muted)',
                fontSize: 11,
                textAlign: 'center',
                marginTop: 14,
                marginBottom: 0,
                lineHeight: 1.6,
              }}>
                {isRegistered
                  ? 'You can cancel your spot anytime before the deadline.'
                  : 'Secure your spot. Limited seats available for this session.'}
              </p>

            </div>
          </div>

        </div>
      </Container>
    </div>
  )
}

function DetailItem({ icon, label, value, isUrgent }: { icon: any, label: string, value: any, isUrgent?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <div style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        background: isUrgent ? 'rgba(244,63,94,0.08)' : 'rgba(0,212,255,0.05)',
        border: `1px solid ${isUrgent ? 'rgba(244,63,94,0.2)' : 'var(--border)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: isUrgent ? 'var(--pink)' : 'var(--cyan)',
        flexShrink: 0,
        transition: 'background 0.2s',
      }}>
        {icon}
      </div>
      <div style={{ paddingTop: 2 }}>
        <p style={{
          color: 'var(--text-muted)',
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 4,
          marginTop: 0,
          fontWeight: 600,
        }}>
          {label}
        </p>
        <p style={{
          color: isUrgent ? 'var(--pink)' : '#fff',
          fontSize: 14,
          fontWeight: 500,
          margin: 0,
          lineHeight: 1.4,
        }}>
          {value}
        </p>
      </div>
    </div>
  )
}