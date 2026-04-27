import { Link } from 'react-router-dom'
import { useSiteSettings } from '../../context/SiteContext'

export default function Footer() {
  const year = new Date().getFullYear()
  const { settings } = useSiteSettings()

  return (
    <footer className="bg-[#07090F] border-t border-white/10">

      {/* Accent gradient line */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-[#00D4FF] to-[#FF2D9B]" />

      <div className="max-w-[1200px] mx-auto pt-14 px-6">

        {/* ── Main grid ────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-12 mb-12">

          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-4 no-underline">
              <div className="w-9 h-9 rounded-xl bg-[#00D4FF]/10 border-[1.5px] border-[#00D4FF]/30 flex items-center justify-center shrink-0">
                {settings.logo_url ? (
                  <img src={settings.logo_url} alt="Logo" className="w-full h-full object-contain rounded-lg" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
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
                <span className="text-[14px] font-extrabold text-white tracking-[0.04em] block leading-none">
                  {settings.club_name.toUpperCase()}
                </span>
              </div>
            </Link>

            <p className="text-gray-400 text-[13px] leading-relaxed mb-6 max-w-[260px]">
              {settings.tagline || 'Empowering the next generation of tech innovators through collaboration and code.'}
            </p>

            {/* Social icons */}
            <div className="flex gap-2.5">
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
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 no-underline transition-all duration-200 hover:border-[#00D4FF]/30 hover:text-[#00D4FF] hover:bg-[#00D4FF]/10"
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
        <div className="h-[1px] bg-white/10 mb-6" />

        {/* ── Bottom bar ───────────────────────────────── */}
        <div className="flex items-center justify-between pb-6 flex-wrap gap-3">
          <p className="text-[#1E3A4A] text-[12px] font-['JetBrains_Mono',monospace]">
            © {year} {settings.club_name}. All rights reserved.
          </p>
          <p className="text-[#1E3A4A] text-[12px] font-['JetBrains_Mono',monospace]">
            Built with ♥ by {settings.club_name.split(' ')[0]}
          </p>
        </div>

      </div>
    </footer>
  )
}

/* ── Footer Column ─────────────────────────────────────────── */
function FooterCol({ title, links }: { title: string, links: { label: string, to: string }[] }) {
  return (
    <div>
      <h4 className="text-[11px] font-bold uppercase tracking-[0.1em] text-white mb-5">
        {title}
      </h4>
      <ul className="list-none flex flex-col gap-3">
        {links.map(link => (
          <li key={link.to}>
            <Link
              to={link.to}
              className="text-gray-400 text-[13px] no-underline transition-colors duration-150 hover:text-[#00D4FF]"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
