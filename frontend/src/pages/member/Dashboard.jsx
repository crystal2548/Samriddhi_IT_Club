import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../utils/supabase'
import { useAuth } from '../../context/AuthContext'
import { formatDateShort, formatDateTime } from '../../utils/formatDate'

export default function Dashboard() {
  const { user, profile } = useAuth()
  const [registrations, setRegistrations] = useState([])
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) fetchAll()
  }, [user])

  async function fetchAll() {
    const [regsRes, noticesRes] = await Promise.all([
      supabase
        .from('event_registrations')
        .select('*, events(id, title, type, event_date, location, status, banner_url)')
        .eq('member_id', user.id)
        .order('registered_at', { ascending: false }),
      supabase
        .from('announcements')
        .select('*')
        .in('audience', ['all', profile?.role === 'executive' ? 'executive' : 'general'])
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(5),
    ])
    setRegistrations(regsRes.data || [])
    setNotices(noticesRes.data || [])
    setLoading(false)
  }

  async function handleUnregister(registrationId) {
    await supabase.from('event_registrations').delete().eq('id', registrationId)
    setRegistrations(prev => prev.filter(r => r.id !== registrationId))
  }

  const upcoming = registrations.filter(r => ['upcoming', 'ongoing'].includes(r.events?.status))
  const past = registrations.filter(r => r.events?.status === 'completed')

  const TYPE_COLOR = {
    hackathon: 'var(--cyan)', workshop: 'var(--pink)',
    seminar: '#00BFA5', bootcamp: '#A78BFA', social: '#F59E0B',
  }

  const getInitials = (name) => {
    if (!name) return 'M'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div style={{ maxWidth: 960 }}>

      {/* ── Welcome header ───────────────────────────── */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ color: 'var(--cyan)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
          Member Portal
        </p>
        <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 32, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.01em' }}>
          Welcome back, {profile?.full_name?.split(' ')[0] || 'Member'} 👋
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
          Here's what's happening at Samriddhi IT Club.
        </p>
      </div>

      {/* ── Stat cards ───────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        <StatCard
          label="Events joined"
          value={loading ? '—' : registrations.length}
          color="var(--cyan)"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
        />
        <StatCard
          label="Upcoming"
          value={loading ? '—' : upcoming.length}
          color="var(--pink)"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
        />
        <StatCard
          label="Member ID"
          value={profile?.member_id || '—'}
          color="#A78BFA"
          mono
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* ── Upcoming Events ──────────────────────── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ color: '#fff', fontSize: 15, fontWeight: 600 }}>Upcoming Events</h2>
            <Link to="/dashboard/my-events" style={{ color: 'var(--cyan)', fontSize: 12, textDecoration: 'none' }}>View all →</Link>
          </div>

          {loading ? (
            <Skeleton />
          ) : upcoming.length === 0 ? (
            <EmptyCard
              message="No upcoming events"
              sub="Browse events and register to see them here."
              linkTo="/events"
              linkLabel="Browse events"
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {upcoming.slice(0, 4).map(reg => (
                <div key={reg.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  {/* Type dot */}
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: TYPE_COLOR[reg.events?.type] || 'var(--cyan)', marginTop: 4, flexShrink: 0 }}/>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <p style={{ color: '#fff', fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>
                      {reg.events?.title}
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                      {formatDateShort(reg.events?.event_date)}
                      {reg.events?.location ? ` · ${reg.events.location}` : ''}
                    </p>
                  </div>
                  {reg.events?.status === 'upcoming' && (
                    <button
                      onClick={() => handleUnregister(reg.id)}
                      style={{ fontSize: 10, padding: '3px 8px', borderRadius: 5, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', cursor: 'pointer', flexShrink: 0 }}
                    >
                      Unregister
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Notices ──────────────────────────────── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ color: '#fff', fontSize: 15, fontWeight: 600 }}>Recent Notices</h2>
            <Link to="/dashboard/notices" style={{ color: 'var(--cyan)', fontSize: 12, textDecoration: 'none' }}>View all →</Link>
          </div>

          {loading ? (
            <Skeleton />
          ) : notices.length === 0 ? (
            <EmptyCard message="No notices yet" sub="Announcements from the OC will appear here." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {notices.map(notice => (
                <div key={notice.id} style={{ background: 'var(--bg-card)', border: `1px solid ${notice.is_pinned ? 'rgba(0,212,255,0.2)' : 'var(--border)'}`, borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    {notice.is_pinned && (
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: 'rgba(0,212,255,0.1)', color: 'var(--cyan)', border: '1px solid rgba(0,212,255,0.2)' }}>PINNED</span>
                    )}
                    <p style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{notice.title}</p>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: 12, lineHeight: 1.5, marginBottom: 6 }}>
                    {notice.body?.slice(0, 80)}{notice.body?.length > 80 ? '...' : ''}
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}>
                    {formatDateShort(notice.created_at)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ── Profile completion prompt ─────────────── */}
      {profile && (!profile.bio || !profile.photo_url || !profile.skills?.length) && (
        <div style={{ marginTop: 24, background: 'linear-gradient(135deg, rgba(0,212,255,0.04), rgba(255,45,155,0.04))', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <p style={{ color: '#fff', fontSize: 14, fontWeight: 600, marginBottom: 3 }}>Complete your profile</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
              Add a photo, bio, and skills so other members can find you.
            </p>
          </div>
          <Link to="/dashboard/profile" style={{ padding: '8px 18px', background: 'var(--cyan)', border: 'none', borderRadius: 7, color: '#0A0E1A', fontSize: 12, fontWeight: 700, textDecoration: 'none', flexShrink: 0 }}>
            Update profile →
          </Link>
        </div>
      )}

    </div>
  )
}

/* ── Stat Card ───────────────────────────────────────────────── */
function StatCard({ label, value, color, icon, mono = false }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
        <span style={{ color, opacity: 0.6 }}>{icon}</span>
      </div>
      <p style={{ fontFamily: mono ? 'JetBrains Mono, monospace' : 'Barlow Condensed, sans-serif', fontSize: mono ? 16 : 36, fontWeight: 800, color, lineHeight: 1, letterSpacing: mono ? '0.02em' : '-0.02em' }}>
        {value}
      </p>
    </div>
  )
}

/* ── Empty Card ──────────────────────────────────────────────── */
function EmptyCard({ message, sub, linkTo, linkLabel }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px dashed var(--border)', borderRadius: 10, padding: '28px 20px', textAlign: 'center' }}>
      <p style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{message}</p>
      <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: linkTo ? 12 : 0 }}>{sub}</p>
      {linkTo && (
        <Link to={linkTo} style={{ color: 'var(--cyan)', fontSize: 12, textDecoration: 'none', fontWeight: 500 }}>{linkLabel} →</Link>
      )}
    </div>
  )
}

/* ── Skeleton ────────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ height: 12, borderRadius: 4, background: 'rgba(255,255,255,0.05)', width: '70%' }}/>
          <div style={{ height: 10, borderRadius: 4, background: 'rgba(255,255,255,0.03)', width: '45%' }}/>
        </div>
      ))}
    </div>
  )
}