import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../utils/supabase'
import { useAuth } from '../../context/AuthContext'
import { formatDateTime, formatDateShort } from '../../utils/formatDate'

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

export default function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [event, setEvent] = useState(null)
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
      .eq('member_id', user.id)
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
      .eq('member_id', user.id)
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

  const st = STATUS_CONFIG[event.status] || STATUS_CONFIG.upcoming
  const canRegister = ['upcoming', 'ongoing'].includes(event.status)

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: 80, paddingBottom: 100 }}>
      <div className="container mx-auto px-6">
        
        {/* Breadcrumb */}
        <Link to="/events" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none', marginBottom: 32, transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--cyan)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to Events Hub
        </Link>

        {/* Main Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '7fr 4fr', gap: 48, alignItems: 'start' }}>
          
          {/* Left: Content */}
          <div>
            <div style={{ borderRadius: 20, overflow: 'hidden', background: 'linear-gradient(135deg, #0D1829, #142040)', border: '1px solid var(--border)', marginBottom: 40, aspectRatio: '16/7' }}>
              {event.banner_url ? (
                <img src={event.banner_url} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="rgba(0,212,255,0.15)" strokeWidth="1"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
              )}
            </div>

            <div style={{ marginBottom: 48 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: TYPE_COLOR[event.type] || 'var(--cyan)' }}>{event.type}</span>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 12px', borderRadius: 20, background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>{st.label}</span>
              </div>
              <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.01em', marginBottom: 24 }}>{event.title}</h1>
              
              <div style={{ position: 'relative' }}>
                <h4 style={{ color: 'var(--cyan)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>About this Event</h4>
                <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.8 }}>
                  {event.description || "No description provided for this event."}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Sidebar */}
          <div style={{ position: 'sticky', top: 100 }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '32px' }}>
              
              {/* Event Details List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 32 }}>
                <DetailItem 
                  icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>} 
                  label="Date & Time" 
                  value={formatDateTime(event.event_date)} 
                />
                <DetailItem 
                  icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>} 
                  label="Location" 
                  value={event.location || "To be announced"} 
                />
                {event.max_participants && (
                  <DetailItem 
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>} 
                    label="Capacity" 
                    value={`${event.max_participants} Participants`} 
                  />
                )}
                {event.registration_deadline && (
                  <DetailItem 
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>} 
                    label="Deadline" 
                    value={formatDateTime(event.registration_deadline)} 
                    isUrgent={new Date(event.registration_deadline) < new Date(Date.now() + 86400000)}
                  />
                )}
              </div>

              {/* Registration Action */}
              <div style={{ paddingTop: 24, borderTop: '1px solid var(--border)' }}>
                {regSuccess && (
                  <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 10, padding: '12px', marginBottom: 16, color: '#10B981', fontSize: 13, textAlign: 'center' }}>
                    ✓ You are registered!
                  </div>
                )}

                {event.external_link ? (
                  <a href={event.external_link} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ width: '100%', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, textDecoration: 'none', padding: '14px' }}>
                    Register on External Site
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  </a>
                ) : (
                  <button 
                    onClick={isRegistered ? handleUnregister : handleRegister}
                    disabled={registering || !canRegister}
                    style={{ 
                      width: '100%', 
                      padding: '14px', 
                      borderRadius: 10, 
                      fontSize: 13, 
                      fontWeight: 700, 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.06em', 
                      cursor: canRegister ? 'pointer' : 'not-allowed',
                      background: isRegistered ? 'transparent' : (canRegister ? 'var(--cyan)' : 'rgba(255,255,255,0.05)'),
                      border: isRegistered ? '1px solid #EF4444' : 'none',
                      color: isRegistered ? '#EF4444' : (canRegister ? '#0A0E1A' : 'var(--text-muted)'),
                      transition: 'all 0.2s'
                    }}
                  >
                    {registering ? 'Processing...' : (isRegistered ? 'Cancel Registration' : (canRegister ? 'Register for Event' : 'Registration Closed'))}
                  </button>
                )}
                
                <p style={{ color: 'var(--text-muted)', fontSize: 11, textAlign: 'center', marginTop: 16 }}>
                  {isRegistered ? "You can cancel your spot anytime before the deadline." : "Secure your spot. Limited seats available for this session."}
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  )
}

function DetailItem({ icon, label, value, isUrgent }) {
  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isUrgent ? 'var(--pink)' : 'var(--cyan)', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <p style={{ color: 'var(--text-muted)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{label}</p>
        <p style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{value}</p>
      </div>
    </div>
  )
}