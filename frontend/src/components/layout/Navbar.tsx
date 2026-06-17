import React, { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useSiteSettings } from '../../context/SiteContext'
import { supabase } from '../../utils/supabase'
import { NAV_LINKS } from '../../utils/constants'

export default function Navbar() {
  const { user, profile, isOC } = useAuth()
  const { settings } = useSiteSettings()
  const navigate = useNavigate()
  const location = useLocation()

  const [scrolled, setScrolled]       = useState(false)
  const [mobileOpen, setMobileOpen]   = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const handleSignOut = async () => {
    setDropdownOpen(false)
    await supabase.auth.signOut()
    navigate('/')
  }

  const getInitials = (name?: string) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <>
      {/* ── Scoped styles ─────────────────────────────────────────── */}
      <style>{`
        .nav-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 32px;
          box-sizing: border-box;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 64px;
          gap: 24px;
        }
        .nav-link-item {
          position: relative;
          font-size: 13px;
          font-weight: 500;
          color: rgba(156,163,175,1);
          text-decoration: none;
          transition: color 0.2s;
          padding-bottom: 2px;
          white-space: nowrap;
        }
        .nav-link-item::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 1.5px;
          background: #00D4FF;
          border-radius: 2px;
          transform: scaleX(0);
          transition: transform 0.2s ease;
        }
        .nav-link-item:hover { color: #fff; }
        .nav-link-item:hover::after { transform: scaleX(1); }
        .nav-link-active {
          color: #fff !important;
        }
        .nav-link-active::after {
          transform: scaleX(1) !important;
        }
        .dropdown-enter {
          animation: dropIn 0.15s ease forwards;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mobile-nav-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 0;
          font-size: 14px;
          font-weight: 500;
          color: rgba(156,163,175,1);
          text-decoration: none;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          transition: color 0.2s;
        }
        .mobile-nav-link:last-of-type { border-bottom: none; }
        .mobile-nav-link:hover,
        .mobile-nav-link-active { color: #fff !important; }
        .mobile-nav-link-active-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #00D4FF;
          flex-shrink: 0;
        }
        .mobile-nav-link-dot-hidden {
          width: 5px;
          height: 5px;
          flex-shrink: 0;
        }
        .avatar-btn:hover { background: rgba(255,255,255,0.06) !important; }
        .nav-desktop-links {
          display: flex;
          align-items: center;
          gap: 28px;
          flex: 1;
          justify-content: center;
        }
        .nav-desktop-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }
        .nav-mobile-toggle {
          display: none;
          flex-direction: column;
          gap: 5px;
          padding: 8px;
          border-radius: 8px;
          background: transparent;
          border: none;
          cursor: pointer;
        }

        @media (max-width: 1024px) {
          .nav-desktop-links, .nav-desktop-right { display: none; }
          .nav-mobile-toggle { display: flex; }
        }
        @media (max-width: 480px) {
          .nav-inner { padding: 0 20px; }
        }
      `}</style>

      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transition: 'background 0.3s, border-color 0.3s, backdrop-filter 0.3s',
        background: scrolled ? 'rgba(10,14,26,0.97)' : 'rgba(10,14,26,0.88)',
        borderBottom: `1px solid ${scrolled ? 'rgba(0,212,255,0.1)' : 'transparent'}`,
        backdropFilter: scrolled ? 'blur(20px)' : 'blur(8px)',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'blur(8px)',
      }}>

        {/* ── Desktop bar ───────────────────────────────────────── */}
        <div className="nav-inner">

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 9,
              border: '1.5px solid rgba(0,212,255,0.5)',
              background: 'rgba(0,212,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
            }}>
              <img src={settings.logo_url || 'https://res.cloudinary.com/dkjxvacsm/image/upload/v1774494475/cuas20xiq6lkpb2eukvx.jpg'} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }}/>
            </div>
            <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.05em', color: '#fff' }}>
              {settings.club_name.toUpperCase()}
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="nav-desktop-links">
            {NAV_LINKS.map((link: { path: string; label: string }) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `nav-link-item${isActive ? ' nav-link-active' : ''}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Desktop right side */}
          <div className="nav-desktop-right">
            {user ? (
              /* Avatar dropdown */
              <div style={{ position: 'relative' }} ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="avatar-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    borderRadius: 10,
                    padding: '5px 10px 5px 5px',
                    background: dropdownOpen ? 'rgba(255,255,255,0.06)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    outline: 'none',
                  }}
                >
                  {profile?.photo_url ? (
                    <img
                      src={profile.photo_url}
                      alt={profile.full_name}
                      style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid rgba(0,212,255,0.35)', flexShrink: 0 }}
                    />
                  ) : (
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #00D4FF, #0066FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {getInitials(profile?.full_name)}
                    </div>
                  )}
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {profile?.full_name?.split(' ')[0] || 'Member'}
                  </span>
                  <svg
                    width="11" height="11" viewBox="0 0 24 24" fill="none"
                    stroke="rgba(156,163,175,1)" strokeWidth="2.5"
                    style={{ transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}
                  >
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </button>

                {/* Dropdown */}
                {dropdownOpen && (
                  <div
                    className="dropdown-enter"
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 10px)',
                      width: 220,
                      borderRadius: 14,
                      overflow: 'hidden',
                      zIndex: 50,
                      background: '#0D1829',
                      border: '1px solid rgba(255,255,255,0.09)',
                      boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,212,255,0.05)',
                    }}
                  >
                    {/* User info */}
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <p style={{ color: '#fff', fontSize: 13, fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
                        {profile?.full_name || 'Member'}
                      </p>
                      <p style={{ color: 'rgba(156,163,175,1)', fontSize: 11, marginTop: 3, marginBottom: 0, textTransform: 'capitalize' }}>
                        {profile?.role === 'oc'
                          ? `OC · ${profile?.oc_position?.replace('_', ' ')}`
                          : profile?.role === 'executive'
                            ? 'Executive Member'
                            : 'General Member'}
                      </p>
                    </div>

                    {/* Menu items */}
                    <div style={{ padding: '6px 0' }}>
                      <DropdownLink
                        to={isOC ? '/oc/dashboard' : '/dashboard'}
                        icon={
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                          </svg>
                        }
                        label="Dashboard"
                        onClick={() => setDropdownOpen(false)}
                      />
                      <DropdownLink
                        to="/dashboard/profile"
                        icon={
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                          </svg>
                        }
                        label="My Profile"
                        onClick={() => setDropdownOpen(false)}
                      />
                      <DropdownLink
                        to="/dashboard/my-events"
                        icon={
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                          </svg>
                        }
                        label="My Events"
                        onClick={() => setDropdownOpen(false)}
                      />
                    </div>

                    {/* Sign out */}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '6px 0' }}>
                      <button
                        onClick={handleSignOut}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '9px 16px',
                          fontSize: 13,
                          color: '#EF4444',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background 0.15s',
                          borderRadius: 0,
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                          <polyline points="16 17 21 12 16 7"/>
                          <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Join Us */
              <Link
                to="/apply"
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  padding: '8px 18px',
                  borderRadius: 9,
                  background: '#00D4FF',
                  color: '#0A0E1A',
                  textDecoration: 'none',
                  transition: 'background 0.2s, box-shadow 0.2s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = '0 0 20px rgba(0,212,255,0.3)' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#00D4FF'; e.currentTarget.style.boxShadow = 'none' }}
              >
                JOIN US
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="nav-mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <span style={{
              display: 'block', width: 20, height: 2, background: '#fff', borderRadius: 2,
              transition: 'transform 0.3s, opacity 0.3s',
              transform: mobileOpen ? 'translateY(7px) rotate(45deg)' : 'none',
            }}/>
            <span style={{
              display: 'block', width: 20, height: 2, background: '#fff', borderRadius: 2,
              transition: 'opacity 0.3s',
              opacity: mobileOpen ? 0 : 1,
            }}/>
            <span style={{
              display: 'block', width: 20, height: 2, background: '#fff', borderRadius: 2,
              transition: 'transform 0.3s, opacity 0.3s',
              transform: mobileOpen ? 'translateY(-7px) rotate(-45deg)' : 'none',
            }}/>
          </button>

        </div>

        {/* ── Mobile slide-down menu ─────────────────────────────── */}
        <div
          className="lg:hidden"
          style={{
            overflow: 'hidden',
            maxHeight: mobileOpen ? 500 : 0,
            transition: 'max-height 0.3s ease',
            borderTop: mobileOpen ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
            background: 'rgba(10,14,26,0.98)',
          }}
        >
          <div style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '12px 32px 20px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Nav links */}
            {NAV_LINKS.map((link: { path: string; label: string }) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => `mobile-nav-link${isActive ? ' mobile-nav-link-active' : ''}`}
              >
                {({ isActive }) => (
                  <>
                    <span className={isActive ? 'mobile-nav-link-active-dot' : 'mobile-nav-link-dot-hidden'}/>
                    {link.label}
                  </>
                )}
              </NavLink>
            ))}

            {/* CTA row */}
            <div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {user ? (
                <>
                  <Link
                    to={isOC ? '/oc/dashboard' : '/dashboard'}
                    style={{
                      padding: '10px 16px',
                      borderRadius: 9,
                      border: '1px solid rgba(0,212,255,0.3)',
                      color: '#00D4FF',
                      fontSize: 13,
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      textDecoration: 'none',
                      textAlign: 'center',
                      background: 'rgba(0,212,255,0.04)',
                      transition: 'background 0.2s',
                    }}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      borderRadius: 9,
                      border: '1px solid rgba(239,68,68,0.3)',
                      color: '#EF4444',
                      fontSize: 13,
                      fontWeight: 600,
                      background: 'rgba(239,68,68,0.06)',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <Link
                  to="/apply"
                  style={{
                    padding: '11px 20px',
                    borderRadius: 9,
                    background: '#00D4FF',
                    color: '#0D1829',
                    fontSize: 13,
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                    textDecoration: 'none',
                    textAlign: 'center',
                    transition: 'background 0.2s',
                  }}
                >
                  JOIN US
                </Link>
              )}
            </div>
          </div>
        </div>

      </nav>
    </>
  )
}

/* ── Dropdown link helper ─────────────────────────────────────────── */
function DropdownLink({
  to, icon, label, onClick,
}: {
  to: string
  icon: React.ReactNode
  label: string
  onClick?: () => void
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '9px 16px',
        fontSize: 13,
        color: 'rgba(156,163,175,1)',
        textDecoration: 'none',
        transition: 'background 0.15s, color 0.15s',
        background: 'transparent',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(156,163,175,1)' }}
    >
      <span style={{ color: '#00D4FF', display: 'flex', flexShrink: 0 }}>{icon}</span>
      {label}
    </Link>
  )
}