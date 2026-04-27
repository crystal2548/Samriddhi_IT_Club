import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../utils/supabase'

const NAV = [
  {
    section: 'Main',
    items: [
      { label: 'Dashboard',   path: '/dashboard',            icon: 'grid' },
      { label: 'My Profile',  path: '/dashboard/profile',    icon: 'user' },
      { label: 'My Events',   path: '/dashboard/my-events',  icon: 'calendar' },
    ]
  },
  {
    section: 'Club',
    items: [
      { label: 'Notices',     path: '/dashboard/notices',    icon: 'bell' },
      { label: 'Members',     path: '/dashboard/members',    icon: 'users' },
    ]
  },
  {
    section: 'Executive',
    executiveOnly: true,
    items: [
      { label: 'Write Blog',    path: '/dashboard/blog/write',    icon: 'edit' },
      { label: 'Opportunities', path: '/dashboard/opportunities', icon: 'briefcase' },
      { label: 'Projects',      path: '/dashboard/projects',      icon: 'code' },
      { label: 'Gallery',       path: '/dashboard/gallery',       icon: 'image' },
    ]
  },
]

const ICONS = {
  grid:      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  user:      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  calendar:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  bell:      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  users:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  edit:      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  briefcase: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  code:      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  image:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
}

function getRoleLabel(profile) {
  if (profile?.role === 'oc') {
    const pos = profile?.oc_position?.replace(/_/g, ' ') || 'OC Member'
    return `OC · ${pos}`
  }
  if (profile?.role === 'executive') return 'Executive Member'
  return 'General Member'
}

function getRoleColor(profile) {
  if (profile?.role === 'oc') return 'var(--pink)'
  if (profile?.role === 'executive') return 'var(--cyan)'
  return 'var(--text-muted)'
}

function getInitials(name) {
  if (!name) return 'M'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function MemberSidebar() {
  const { profile, isExecutive } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <aside style={{
      width: 220,
      flexShrink: 0,
      background: '#07090F',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: 64,
      height: 'calc(100vh - 64px)',
      overflowY: 'auto',
    }}>

      {/* ── User info ──────────────────────────────── */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {profile?.photo_url ? (
            <img
              src={profile.photo_url}
              alt={profile.full_name}
              style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--cyan-border)', flexShrink: 0 }}
            />
          ) : (
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--cyan), #0066FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {getInitials(profile?.full_name)}
            </div>
          )}
          <div style={{ overflow: 'hidden' }}>
            <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile?.full_name || 'Member'}
            </p>
            <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'capitalize', color: getRoleColor(profile) }}>
              {getRoleLabel(profile)}
            </p>
          </div>
        </div>

        {profile?.member_id && (
          <div style={{ marginTop: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 8px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 1 }}>Member ID</p>
            <p style={{ color: 'var(--cyan)', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', fontWeight: 500 }}>{profile.member_id}</p>
          </div>
        )}
      </div>

      {/* ── Navigation ─────────────────────────────── */}
      <nav style={{ flex: 1, padding: '12px 8px' }}>
        {NAV.map((group) => {
          // Executive-only section — show locked items for non-executives
          if (group.executiveOnly && !isExecutive) {
            return (
              <div key={group.section} style={{ marginBottom: 4 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.15)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '8px 8px 4px' }}>
                  {group.section}
                </div>
                {group.items.map(item => (
                  <div key={item.path} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, marginBottom: 2, color: 'rgba(255,255,255,0.15)', borderLeft: '2px solid transparent', cursor: 'not-allowed' }}>
                    <span style={{ flexShrink: 0 }}>{ICONS[item.icon]}</span>
                    <span style={{ fontSize: 13 }}>{item.label}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 9, color: 'rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.04)', padding: '1px 5px', borderRadius: 4 }}>Exec</span>
                  </div>
                ))}
              </div>
            )
          }

          return (
            <div key={group.section} style={{ marginBottom: 4 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '8px 8px 4px' }}>
                {group.section}
              </div>
              {group.items.map(item => {
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 10px', borderRadius: 8, marginBottom: 2,
                      textDecoration: 'none',
                      background: isActive ? 'rgba(0,212,255,0.08)' : 'transparent',
                      color: isActive ? 'var(--cyan)' : 'var(--text-muted)',
                      borderLeft: isActive ? '2px solid var(--cyan)' : '2px solid transparent',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text-secondary)' }}}
                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}}
                  >
                    <span style={{ flexShrink: 0 }}>{ICONS[item.icon]}</span>
                    <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          )
        })}
      </nav>

      {/* ── Bottom actions ─────────────────────────── */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Link
          to="/"
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, textDecoration: 'none', color: 'var(--text-muted)', fontSize: 12 }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to website
        </Link>
        <button
          onClick={handleSignOut}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', width: '100%', textAlign: 'left' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#EF4444' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Sign out
        </button>
      </div>
    </aside>
  )
}
