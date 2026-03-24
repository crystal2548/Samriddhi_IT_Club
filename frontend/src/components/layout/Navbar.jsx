import { useState, useEffect, useRef } from 'react'
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

  const [scrolled, setScrolled]         = useState(false)
  const [mobileOpen, setMobileOpen]     = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // ── Scroll effect ────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ── Close dropdown on outside click ─────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── Close mobile menu on route change ───────────────────
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  // ── Sign out ─────────────────────────────────────────────
  const handleSignOut = async () => {
    setDropdownOpen(false)
    await supabase.auth.signOut()
    navigate('/')
  }

  // ── Avatar initials ──────────────────────────────────────
  const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? 'rgba(10, 14, 26, 0.95)'
          : 'rgba(10, 14, 26, 0.85)',
        borderBottom: scrolled
          ? '1px solid rgba(0, 212, 255, 0.12)'
          : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
      }}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ─────────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-lg"
              style={{ border: '1.5px solid var(--cyan)', background: 'rgba(0,212,255,0.08)' }}
            >
              {settings.logo_url ? (
                <img src={settings.logo_url} alt="Logo" className="w-full h-full object-contain rounded-md" />
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
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
            <span className="text-sm font-bold tracking-wide" style={{ color: '#fff' }}>
              {settings.club_name.toUpperCase()}
            </span>
          </Link>

          {/* ── Desktop Nav Links ────────────────────────── */}
          <div className="hidden lg:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'text-white'
                      : 'hover:text-white'
                  }`
                }
                style={({ isActive }) => ({
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                })}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* ── Desktop Right Side ───────────────────────── */}
          <div className="hidden lg:flex items-center gap-3">

            {/* Search */}
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
                minWidth: '160px',
                cursor: 'pointer',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <span style={{ fontSize: '12px' }}>Search...</span>
            </div>

            {user ? (
              /* ── Logged in — avatar dropdown ─────────── */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-all"
                  style={{
                    background: dropdownOpen ? 'rgba(255,255,255,0.06)' : 'transparent',
                    border: '1px solid transparent',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                  onMouseLeave={e => {
                    if (!dropdownOpen) e.currentTarget.style.background = 'transparent'
                  }}
                >
                  {/* Avatar */}
                  {profile?.photo_url ? (
                    <img
                      src={profile.photo_url}
                      alt={profile.full_name}
                      className="w-7 h-7 rounded-full object-cover"
                      style={{ border: '1.5px solid var(--cyan-border)' }}
                    />
                  ) : (
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        background: 'linear-gradient(135deg, var(--cyan), #0066FF)',
                        color: '#fff',
                      }}
                    >
                      {getInitials(profile?.full_name)}
                    </div>
                  )}
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {profile?.full_name?.split(' ')[0] || 'Member'}
                  </span>
                  {/* Chevron */}
                  <svg
                    width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="var(--text-muted)" strokeWidth="2"
                    className="transition-transform duration-200"
                    style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </button>

                {/* Dropdown menu */}
                {dropdownOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-52 rounded-xl overflow-hidden z-50"
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-hover)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                    }}
                  >
                    {/* User info header */}
                    <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {profile?.full_name || 'Member'}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {profile?.role === 'oc'
                          ? `OC · ${profile?.oc_position?.replace('_', ' ')}`
                          : profile?.role === 'executive'
                          ? 'Executive Member'
                          : 'General Member'}
                      </p>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
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
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
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
                    <div className="py-1" style={{ borderTop: '1px solid var(--border)' }}>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150 text-left"
                        style={{ color: '#EF4444' }}
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
              /* ── Logged out — Join Us button ─────────── */
              <Link
                to="/join"
                className="text-sm font-bold px-4 py-2 rounded-lg transition-all duration-200"
                style={{
                  color: 'var(--bg-primary)',
                  background: 'var(--cyan)',
                  letterSpacing: '0.04em',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#00bde6'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--cyan)'}
              >
                JOIN US
              </Link>
            )}
          </div>

          {/* ── Mobile Hamburger ─────────────────────────── */}
          <button
            className="lg:hidden flex flex-col gap-1.5 p-2 rounded-lg"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ color: 'var(--text-primary)' }}
            aria-label="Toggle menu"
          >
            <span
              className="block w-5 h-0.5 transition-all duration-300 origin-center"
              style={{
                background: 'var(--text-primary)',
                transform: mobileOpen ? 'translateY(6px) rotate(45deg)' : 'none',
              }}
            />
            <span
              className="block w-5 h-0.5 transition-all duration-300"
              style={{
                background: 'var(--text-primary)',
                opacity: mobileOpen ? 0 : 1,
              }}
            />
            <span
              className="block w-5 h-0.5 transition-all duration-300 origin-center"
              style={{
                background: 'var(--text-primary)',
                transform: mobileOpen ? 'translateY(-6px) rotate(-45deg)' : 'none',
              }}
            />
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ──────────────────────────────────── */}
      <div
        className="lg:hidden overflow-hidden transition-all duration-300"
        style={{
          maxHeight: mobileOpen ? '500px' : '0',
          borderTop: mobileOpen ? '1px solid var(--border)' : 'none',
          background: 'rgba(10,14,26,0.98)',
        }}
      >
        <div className="container mx-auto px-6 py-4 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className="py-3 text-sm font-medium transition-colors duration-200"
              style={({ isActive }) => ({
                color: isActive ? 'var(--cyan)' : 'var(--text-secondary)',
                borderBottom: '1px solid var(--border)',
              })}
            >
              {link.label}
            </NavLink>
          ))}

          <div className="pt-3 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  to={isOC ? '/oc/dashboard' : '/dashboard'}
                  className="btn-cyan-outline text-center"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full py-2.5 text-sm font-medium rounded-lg"
                  style={{
                    color: '#EF4444',
                    border: '1px solid rgba(239,68,68,0.3)',
                    background: 'rgba(239,68,68,0.08)',
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link to="/join" className="btn-primary text-center justify-center">
                JOIN US
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

/* ── Dropdown Link Helper ──────────────────────────────────── */
function DropdownLink({ to, icon, label, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150"
      style={{ color: 'var(--text-secondary)' }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
        e.currentTarget.style.color = 'var(--text-primary)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.color = 'var(--text-secondary)'
      }}
    >
      <span style={{ color: 'var(--cyan)' }}>{icon}</span>
      {label}
    </Link>
  )
}