import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useSiteSettings } from '../../context/SiteContext'

const NAV = [
  {
    section: 'Overview',
    items: [
      { label: 'Dashboard',     path: '/oc/dashboard',     icon: 'grid' },
      { label: 'Analytics',     path: '/oc/analytics',     icon: 'bar-chart' },
      { label: 'Messages',      path: '/oc/messages',      icon: 'mail', badge: 'messages' },
    ]
  },
  {
    section: 'Members',
    items: [
      { label: 'All Members',   path: '/oc/members',       icon: 'users' },
      { label: 'Applications',  path: '/oc/applications',  icon: 'file-text', badge: 'applications' },
      { label: 'Recruitment',   path: '/oc/recruitment',   icon: 'user-plus' },
    ]
  },
  {
    section: 'Content',
    items: [
      { label: 'Events',        path: '/oc/events',        icon: 'calendar' },
      { label: 'Blog Posts',    path: '/oc/blog',          icon: 'book-open' },
      { label: 'Projects',      path: '/oc/projects',      icon: 'code' },
      { label: 'Opportunities', path: '/oc/opportunities', icon: 'briefcase' },
      { label: 'Resources',     path: '/oc/resources',     icon: 'folder' },
    ]
  },
  {
    section: 'System',
    items: [
      { label: 'Announcements', path: '/oc/announcements', icon: 'bell' },
      { label: 'Sponsors',      path: '/oc/sponsors',      icon: 'star' },
      { label: 'Permissions',   path: '/oc/permissions',   icon: 'shield', badge: 'permissions' },
      { label: 'Site Settings', path: '/oc/settings',      icon: 'settings' },
    ]
  },
]

const ICONS = {
  grid: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  'bar-chart': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  mail: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  users: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  'file-text': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  'user-plus': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>,
  calendar: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  'book-open': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  code: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  briefcase: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  folder: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  bell: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  star: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  shield: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  settings: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
}

export default function OCSidebar({ badges = {} }) {
  const { profile } = useAuth()
  const { settings } = useSiteSettings()
  const location = useLocation()

  return (
    <aside style={{
      width: 240, minHeight: '100vh', flexShrink: 0,
      background: '#07090F',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      position: 'sticky', top: 0, height: '100vh',
      overflowY: 'auto',
    }}>

      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border)' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
            {settings?.logo_url ? (
              <img src={settings.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <rect x="6" y="6" width="4" height="4" rx="1" stroke="var(--cyan)" strokeWidth="1.5"/>
                <line x1="8" y1="1" x2="8" y2="6" stroke="var(--cyan)" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="8" y1="10" x2="8" y2="15" stroke="var(--cyan)" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="1" y1="8" x2="6" y2="8" stroke="var(--cyan)" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="10" y1="8" x2="15" y2="8" stroke="var(--cyan)" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="8" cy="1" r="1" fill="var(--cyan)"/>
                <circle cx="8" cy="15" r="1" fill="var(--cyan)"/>
                <circle cx="1" cy="8" r="1" fill="var(--pink)"/>
                <circle cx="15" cy="8" r="1" fill="var(--pink)"/>
              </svg>
            )}
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#fff', letterSpacing: '0.04em', lineHeight: 1.2 }}>
              {settings?.club_name?.toUpperCase() || 'SAMRIDDHI'}
            </div>
            <div style={{ fontSize: 9, color: 'var(--cyan)', fontWeight: 700, letterSpacing: '0.06em' }}>
              OC DASHBOARD
            </div>
          </div>
        </Link>

        {/* OC member info */}
        {profile && (
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--cyan), #0066FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {profile.full_name?.[0] || 'O'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile.full_name}
              </div>
              <div style={{ fontSize: 10, color: 'var(--cyan)', textTransform: 'capitalize' }}>
                {profile.oc_position?.replace(/_/g, ' ') || 'OC Member'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {NAV.map((group) => (
          <div key={group.section} style={{ marginBottom: 4 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '8px 8px 4px' }}>
              {group.section}
            </div>
            {group.items.map((item) => {
              const isActive = location.pathname === item.path
              const badgeCount = badges[item.badge] || 0
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
                  <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, flex: 1 }}>{item.label}</span>
                  {badgeCount > 0 && (
                    <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 10, background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.25)' }}>
                      {badgeCount}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Back to site */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, textDecoration: 'none', color: 'var(--text-muted)', fontSize: 12 }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to website
        </Link>
      </div>
    </aside>
  )
}