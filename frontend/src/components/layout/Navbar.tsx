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

  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

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
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        scrolled
          ? 'bg-[#0A0E1A]/95 border-[#00D4FF]/10 backdrop-blur-xl'
          : 'bg-[#0A0E1A]/85 border-transparent backdrop-blur-none'
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ─────────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg border-[1.5px] border-[#00D4FF] bg-[#00D4FF]/10">
              {settings.logo_url ? (
                <img src={settings.logo_url} alt="Logo" className="w-full h-full object-contain rounded-md" />
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="6" y="6" width="4" height="4" rx="1" stroke="#00D4FF" strokeWidth="1.5"/>
                  <line x1="8" y1="1" x2="8" y2="6" stroke="#00D4FF" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="8" y1="10" x2="8" y2="15" stroke="#00D4FF" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="1" y1="8" x2="6" y2="8" stroke="#00D4FF" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="10" y1="8" x2="15" y2="8" stroke="#00D4FF" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="8" cy="1" r="1" fill="#00D4FF"/>
                  <circle cx="8" cy="15" r="1" fill="#00D4FF"/>
                  <circle cx="1" cy="8" r="1" fill="#FF2D9B"/>
                  <circle cx="15" cy="8" r="1" fill="#FF2D9B"/>
                </svg>
              )}
            </div>
            <span className="text-sm font-bold tracking-wide text-white">
              {settings.club_name.toUpperCase()}
            </span>
          </Link>

          {/* ── Desktop Nav Links ────────────────────────── */}
          <div className="hidden lg:flex items-center gap-6">
            {NAV_LINKS.map((link: { path: string, label: string }) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* ── Desktop Right Side ───────────────────────── */}
          <div className="hidden lg:flex items-center gap-3">

            {/* Search */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-white/5 border border-white/10 text-gray-400 min-w-[160px] cursor-pointer hover:bg-white/10 transition-colors">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <span className="text-[12px]">Search...</span>
            </div>

            {user ? (
              /* ── Logged in — avatar dropdown ─────────── */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`flex items-center gap-2 rounded-lg px-2 py-1.5 transition-all outline-none ${dropdownOpen ? 'bg-white/5' : 'bg-transparent hover:bg-white/5'}`}
                >
                  {/* Avatar */}
                  {profile?.photo_url ? (
                    <img
                      src={profile.photo_url}
                      alt={profile.full_name}
                      className="w-7 h-7 rounded-full object-cover border-[1.5px] border-[#00D4FF]/30"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br from-[#00D4FF] to-[#0066FF]">
                      {getInitials(profile?.full_name)}
                    </div>
                  )}
                  <span className="text-sm font-medium text-white max-w-[100px] overflow-hidden truncate">
                    {profile?.full_name?.split(' ')[0] || 'Member'}
                  </span>
                  {/* Chevron */}
                  <svg
                    width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2"
                    className={`text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : 'rotate-0'}`}
                  >
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </button>

                {/* Dropdown menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-xl overflow-hidden z-50 bg-[#0D1829] border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-sm font-semibold text-white">
                        {profile?.full_name || 'Member'}
                      </p>
                      <p className="text-xs mt-0.5 text-gray-400">
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
                    <div className="py-1 border-t border-white/10">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150 text-left text-[#EF4444] hover:bg-[#EF4444]/10 bg-transparent"
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
                to="/apply"
                className="text-sm font-bold px-4 py-2 rounded-lg transition-all duration-200 text-[#0A0E1A] bg-[#00D4FF] tracking-[0.04em] hover:bg-[#00bde6]"
              >
                JOIN US
              </Link>
            )}
          </div>

          {/* ── Mobile Hamburger ─────────────────────────── */}
          <button
            className="lg:hidden flex flex-col gap-1.5 p-2 rounded-lg text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-0.5 bg-white transition-all duration-300 origin-center ${mobileOpen ? 'translate-y-[6px] rotate-45' : ''}`} />
            <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${mobileOpen ? 'opacity-0' : 'opacity-100'}`} />
            <span className={`block w-5 h-0.5 bg-white transition-all duration-300 origin-center ${mobileOpen ? '-translate-y-[6px] -rotate-45' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ──────────────────────────────────── */}
      <div className={`lg:hidden overflow-hidden transition-all duration-300 bg-[#0A0E1A]/95 ${mobileOpen ? 'max-h-[500px] border-t border-white/10' : 'max-h-0 border-transparent'}`}>
        <div className="container mx-auto px-6 py-4 flex flex-col gap-1">
          {NAV_LINKS.map((link: { path: string, label: string }) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => `py-3 text-sm font-medium transition-colors duration-200 border-b border-white/10 ${isActive ? 'text-[#00D4FF]' : 'text-gray-400'}`}
            >
              {link.label}
            </NavLink>
          ))}

          <div className="pt-3 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  to={isOC ? '/oc/dashboard' : '/dashboard'}
                  className="px-4 py-2 rounded-[8px] border border-[#00D4FF]/30 text-[#00D4FF] text-[13px] font-bold tracking-[0.05em] uppercase transition-all duration-200 bg-[#00D4FF]/[0.02] text-center hover:bg-[#00D4FF]/[0.08]"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full py-2.5 text-sm font-medium rounded-lg text-[#EF4444] border border-[#EF4444]/30 bg-[#EF4444]/10"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link to="/apply" className="px-[20px] py-[10px] rounded-[8px] bg-[#00D4FF] text-[#0D1829] text-[13px] font-bold tracking-[0.05em] transition-all duration-200 shadow-[0_0_15px_rgba(0,212,255,0.15)] flex text-center justify-center hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]">
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
function DropdownLink({ to, icon, label, onClick }: { to: string, icon: React.ReactNode, label: string, onClick?: () => void }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150 text-gray-400 bg-transparent hover:bg-white/5 hover:text-white"
    >
      <span className="text-[#00D4FF]">{icon}</span>
      {label}
    </Link>
  )
}
