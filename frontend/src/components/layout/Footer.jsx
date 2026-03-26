import { Link } from 'react-router-dom'
import { useSiteSettings } from '../../context/SiteContext'

export default function Footer() {
  const year = new Date().getFullYear()
  const { settings } = useSiteSettings()

  return (
    <footer style={{ background: '#07090F', borderTop: '1px solid var(--border)' }}>

      {/* Accent gradient line */}
      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, var(--cyan), var(--pink), transparent)' }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 24px 0' }}>

        {/* ── Main grid ────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>

          {/* Brand */}
          <div>
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(0,212,255,0.08)', border: '1.5px solid rgba(0,212,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {settings.logo_url ? (
                  <img src={settings.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 8 }} />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
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
                <span style={{ fontSize: 14, fontWeight: 800, color: '#fff', letterSpacing: '0.04em', display: 'block', lineHeight: 1 }}>
                  {settings.club_name.toUpperCase()}
                </span>
              </div>
            </Link>

            <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.7, marginBottom: 24, maxWidth: 260 }}>
              {settings.tagline || 'Empowering the next generation of tech innovators through collaboration and code.'}
            </p>

            {/* Social icons */}
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                {
                  href: 'https://instagram.com',
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                      <circle cx="12" cy="12" r="4"/>
                      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                    </svg>
                  )
                },
                {
                  href: 'https://linkedin.com',
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                      <rect x="2" y="9" width="4" height="12"/>
                      <circle cx="4" cy="4" r="2"/>
                    </svg>
                  )
                },
                {
                  href: 'https://github.com',
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                    </svg>
                  )
                },
              ].map(({ href, icon }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-muted)',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(0,212,255,0.3)'
                    e.currentTarget.style.color = 'var(--cyan)'
                    e.currentTarget.style.background = 'rgba(0,212,255,0.06)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                    e.currentTarget.style.color = 'var(--text-muted)'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  }}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <FooterCol title="Explore" links={[
            { label: 'Events',        to: '/events' },
            { label: 'Projects',      to: '/projects' },
            { label: 'Blog',          to: '/blog' },
            { label: 'Resources',     to: '/resources' },
          ]} />

          {/* Club */}
          <FooterCol title="Club" links={[
            { label: 'About Us',      to: '/about' },
            { label: 'Our Team',      to: '/team' },
            { label: 'Achievements',  to: '/about#achievements' },
            { label: 'Opportunities', to: '/opportunities' },
          ]} />

          {/* Join */}
          <FooterCol title="Join" links={[
            { label: 'Apply Now',     to: '/apply' },
            { label: 'Member Login',  to: '/login' },
            { label: 'Contact Us',    to: '/contact' },
          ]} />

        </div>

        {/* ── Divider ──────────────────────────────────── */}
        <div style={{ height: 1, background: 'var(--border)', marginBottom: 24 }} />

        {/* ── Bottom bar ───────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <p style={{ color: '#1E3A4A', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>
            © {year} {settings.club_name}. All rights reserved.
          </p>
          <p style={{ color: '#1E3A4A', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>
            Built with ♥ by {settings.club_name.split(' ')[0]}
          </p>
        </div>

      </div>
    </footer>
  )
}

/* ── Footer Column ─────────────────────────────────────────── */
function FooterCol({ title, links }) {
  return (
    <div>
      <h4 style={{
        fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.1em', color: '#fff',
        marginBottom: 20,
      }}>
        {title}
      </h4>
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {links.map(link => (
          <li key={link.to}>
            <Link
              to={link.to}
              style={{ color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--cyan)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}