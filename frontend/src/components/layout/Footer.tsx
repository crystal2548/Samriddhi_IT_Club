import { Link } from 'react-router-dom'
import { useSiteSettings } from '../../context/SiteContext'

export default function Footer() {
  const year = new Date().getFullYear()
  const { settings } = useSiteSettings()

  return (
    <footer style={{
      background: '#02050D',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      fontFamily: "'Inter', -apple-system, sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');

        @keyframes footerGlow {
          0%,100% { opacity: 0.4; }
          50%      { opacity: 0.7; }
        }

        .footer-link {
          color: rgba(255,255,255,0.38);
          text-decoration: none;
          font-size: 13px;
          font-weight: 400;
          line-height: 1;
          transition: color 0.2s ease;
          display: inline-block;
        }
        .footer-link:hover { color: #00D4FF; }

        .social-icon {
          width: 36px; height: 36px;
          border-radius: 10px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.38);
          text-decoration: none;
          transition: all 0.22s ease;
          flex-shrink: 0;
        }
        .social-icon:hover {
          background: rgba(0,212,255,0.08);
          border-color: rgba(0,212,255,0.3);
          color: #00D4FF;
          transform: translateY(-2px);
        }

        .footer-col-title {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.55);
          margin: 0 0 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .footer-col-title::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.06);
        }

        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
          .footer-brand { grid-column: 1 / -1 !important; }
        }
        @media (max-width: 540px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Top accent line — gradient from cyan to pink */}
      <div style={{
        height: 1,
        background: 'linear-gradient(90deg, transparent 0%, #00D4FF 30%, #7B5CFF 60%, #FF2D9B 80%, transparent 100%)',
        opacity: 0.6,
      }} />

      {/* Subtle bg glow blobs */}
      <div style={{ position: 'absolute', bottom: -60, left: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(0,212,255,0.04)', filter: 'blur(80px)', pointerEvents: 'none', animation: 'footerGlow 5s ease infinite' }} />
      <div style={{ position: 'absolute', bottom: -60, right: '25%', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,45,155,0.03)', filter: 'blur(80px)', pointerEvents: 'none', animation: 'footerGlow 7s ease infinite 1s' }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '52px 32px 0', position: 'relative', zIndex: 1 }}>

        {/* ── Main grid ──────────────────────────────────── */}
        <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1fr', gap: '48px 32px', marginBottom: 48 }}>

          {/* Brand column */}
          <div className="footer-brand" style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Logo + name */}
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, textDecoration: 'none' }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12,
                background: 'rgba(0,212,255,0.07)',
                border: '1px solid rgba(0,212,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, overflow: 'hidden',
                transition: 'all 0.25s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.45)'; e.currentTarget.style.background = 'rgba(0,212,255,0.12)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.2)'; e.currentTarget.style.background = 'rgba(0,212,255,0.07)' }}
              >
                {settings.logo_url ? (
                  <img src={settings.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 6 }} />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
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
              <div>
                <div style={{ color: 'white', fontSize: 14, fontWeight: 800, letterSpacing: '0.06em', lineHeight: 1, textTransform: 'uppercase' }}>
                  {settings.club_name || 'Samriddhi IT Club'}
                </div>
                <div style={{ color: '#00D4FF', fontSize: 9, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 4, opacity: 0.65 }}>
                  Samriddhi College
                </div>
              </div>
            </Link>

            {/* Tagline */}
            <p style={{ color: 'rgba(255,255,255,0.32)', fontSize: 13, lineHeight: 1.7, maxWidth: 260, margin: '0 0 24px', fontWeight: 400 }}>
              {settings.tagline || 'Empowering the next generation of tech innovators through collaboration and code.'}
            </p>

            {/* Socials */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Instagram">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                </svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="LinkedIn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                  <rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
                </svg>
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="GitHub">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                </svg>
              </a>
            </div>

            {/* Mini CTA */}
            <Link to="/apply" style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '9px 18px', borderRadius: 100,
              background: 'rgba(0,212,255,0.07)', border: '1px solid rgba(0,212,255,0.2)',
              color: '#00D4FF', fontSize: 12, fontWeight: 600, textDecoration: 'none',
              letterSpacing: '0.04em', alignSelf: 'flex-start',
              transition: 'all 0.22s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,212,255,0.14)'; e.currentTarget.style.borderColor = 'rgba(0,212,255,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,212,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(0,212,255,0.2)'; e.currentTarget.style.transform = 'none' }}
            >
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#00D4FF', display: 'inline-block', flexShrink: 0 }} />
              Join the Club
            </Link>
          </div>

          {/* Nav columns */}
          <FooterCol title="Explore" links={[
            { label: 'Events',    to: '/events' },
            { label: 'Projects',  to: '/projects' },
            { label: 'Blog',      to: '/blog' },
            { label: 'Resources', to: '/resources' },
          ]} />

          <FooterCol title="Club" links={[
            { label: 'About Us',      to: '/about' },
            { label: 'Our Team',      to: '/team' },
            { label: 'Achievements',  to: '/about#achievements' },
            { label: 'Opportunities', to: '/opportunities' },
          ]} />

          <FooterCol title="Join" links={[
            { label: 'Apply Now',    to: '/apply' },
            { label: 'Member Login', to: '/login' },
            { label: 'Contact Us',   to: '/contact' },
          ]} />
        </div>

        {/* ── Bottom bar ─────────────────────────────────── */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.05)',
          padding: '18px 0 22px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12,
        }}>
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, fontFamily: "'Space Mono', monospace", margin: 0 }}>
            © {year} {settings.club_name || 'Samriddhi IT Club'}. All rights reserved.
          </p>

          {/* Center: nav pills */}
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
            {['Privacy', 'Terms', 'Contact'].map(l => (
              <Link key={l} to={`/${l.toLowerCase()}`} className="footer-link" style={{ fontSize: 11 }}>{l}</Link>
            ))}
          </div>

          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, fontFamily: "'Space Mono', monospace", margin: 0 }}>
            Built with <span style={{ color: '#FF2D9B' }}>♥</span> by {(settings.club_name || 'Samriddhi').split(' ')[0]}
          </p>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: { label: string; to: string }[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <h4 className="footer-col-title">{title}</h4>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {links.map(link => (
          <li key={link.to}>
            <Link to={link.to} className="footer-link">{link.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}