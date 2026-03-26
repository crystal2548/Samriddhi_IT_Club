import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../utils/supabase'
import { useSiteSettings } from '../../context/SiteContext'

function getInitials(name) {
  if (!name) return 'A'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const VALUES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="1.5">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
    ),
    color: 'var(--cyan)',
    bg: 'rgba(0,212,255,0.08)',
    border: 'rgba(0,212,255,0.2)',
    title: 'Learn Continuously',
    desc: 'We foster a culture of curiosity and growth. Every workshop, hackathon, and project is an opportunity to level up your skills and push beyond boundaries.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--pink)" strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    color: 'var(--pink)',
    bg: 'rgba(255,45,155,0.08)',
    border: 'rgba(255,45,155,0.2)',
    title: 'Build Together',
    desc: 'An inclusive community where developers, designers, and entrepreneurs collaborate. We believe extraordinary things happen when diverse minds unite around a shared vision.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="1.5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
    color: '#A78BFA',
    bg: 'rgba(167,139,250,0.08)',
    border: 'rgba(167,139,250,0.2)',
    title: 'Create Impact',
    desc: 'Integrity, collaboration, and excellence are our cornerstones. We build real projects that solve real problems, creating a positive impact.',
  },
]

const TIMELINE = [
  { year: '2018', title: 'Club Founded', desc: 'Samriddhi IT Club was established with a small group of passionate developers at Samriddhi College.' },
  { year: '2019', title: 'First Hackathon', desc: 'Hosted our debut 24-hour hackathon with 80+ participants, setting the tone for innovation.' },
  { year: '2021', title: 'Going Digital', desc: 'Expanded online presence and launched virtual workshops during the pandemic, reaching 200+ students.' },
  { year: '2023', title: 'Industry Partnerships', desc: 'Partnered with 12+ tech companies, opening internship and mentorship pipelines for our members.' },
  { year: '2024', title: '500+ Alumni', desc: 'Our network crossed 500 alumni, now placed across Nepal and internationally in top tech roles.' },
]

export default function About() {
  const [team, setTeam] = useState([])
  const [loading, setLoading] = useState(true)
  const { settings } = useSiteSettings()

  useEffect(() => {
    async function fetchTeam() {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, photo_url, oc_position, bio, github_url, linkedin_url')
        .eq('role', 'oc')
        .order('created_at', { ascending: true })
      setTeam(data || [])
      setLoading(false)
    }
    fetchTeam()
  }, [])

  return (
    <div style={{ background: 'var(--bg-primary)', paddingTop: 64 }}>

      {/* ── HERO ────────────────────────────────────────── */}
      <section style={{
        minHeight: '60vh',
        background: 'linear-gradient(135deg, #0A0E1A 0%, #0D1829 50%, #0A0E1A 100%)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', position: 'relative', overflow: 'hidden', padding: '80px 24px',
      }}>
        {/* Background glow */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 65%)', pointerEvents: 'none' }}/>
        {[700, 540, 380].map((size, i) => (
          <div key={i} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: size, height: size, borderRadius: '50%', border: `1px solid rgba(0,212,255,${0.03 + i * 0.02})`, pointerEvents: 'none' }}/>
        ))}

        <div style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24, background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 20, padding: '5px 14px' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--cyan)' }}/>
            <span style={{ color: 'var(--cyan)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>About Us</span>
          </div>

          <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 'clamp(52px,10vw,96px)', fontWeight: 900, lineHeight: 0.92, letterSpacing: '-0.02em', textTransform: 'uppercase', marginBottom: 28 }}>
            <span style={{ color: '#fff' }}>WE ARE THE</span><br/>
            <span style={{ color: 'var(--cyan)' }}>FUTURE </span>
            <span style={{ color: 'var(--pink)' }}>ARCHITECTS</span>
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.8, maxWidth: 560, margin: '0 auto 36px', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500 }}>
            {settings.about_description || `${settings.club_name} is a premier community of developers, designers, and tech entrepreneurs dedicated to shaping Nepal's digital future through collaboration, innovation, and excellence.`}
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/apply" className="btn-primary" style={{ fontSize: 13, padding: '12px 28px' }}>{settings.hero_cta_text || 'Join the Club'}</Link>
            <Link to="/team" className="btn-outline" style={{ fontSize: 13, padding: '12px 28px' }}>Meet the Team</Link>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ───────────────────────────────────── */}
      <section style={{ background: '#07090F', borderBottom: '1px solid var(--border)' }}>
        <div className="container mx-auto px-6">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {[
              { n: settings.stat_members || '120+', l: 'Active Members' },
              { n: settings.stat_events  || '30+',  l: 'Annual Events' },
              { n: settings.stat_alumni  || '500+', l: 'Alumni Network' },
              { n: settings.stat_partners|| '12+',  l: 'Industry Partners' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '36px 24px', textAlign: 'center', borderRight: i < 3 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 44, fontWeight: 800, color: 'var(--cyan)', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 8 }}>{s.n}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OUR PURPOSE ─────────────────────────────────── */}
      <section style={{ padding: '80px 0', background: 'var(--bg-primary)' }}>
        <div className="container mx-auto px-6">
          <div style={{ marginBottom: 48 }}>
            <p style={{ color: 'var(--cyan)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Our Values</p>
            <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 'clamp(28px,4vw,36px)', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.02em' }}>OUR PURPOSE</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            {VALUES.map((v, i) => (
              <div key={i} style={{ background: 'var(--bg-card)', border: `1px solid var(--border)`, borderRadius: 14, padding: '28px 24px', transition: 'border-color 0.2s, transform 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = v.border; e.currentTarget.style.transform = 'translateY(-4px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <div style={{ width: 52, height: 52, borderRadius: 14, background: v.bg, border: `1px solid ${v.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  {v.icon}
                </div>
                <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 700, marginBottom: 12 }}>{v.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.7 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OUR STORY + TIMELINE ────────────────────────── */}
      <section style={{ padding: '80px 0', background: '#07090F', borderTop: '1px solid var(--border)' }}>
        <div className="container mx-auto px-6">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'flex-start' }}>

            {/* Left: story text */}
            <div>
              <p style={{ color: 'var(--cyan)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Our Journey</p>
              <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 'clamp(28px,4vw,36px)', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: 24 }}>OUR STORY</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.85, marginBottom: 32 }}>
                {settings.about_story || `Born from a shared passion for technology, ${settings.club_name} began as a small group of students who believed that the best way to learn was to build together. Today, we are a thriving community of active members who collectively drive innovation through real-world projects, industry-level hackathons, curated workshops, and meaningful networking events.`}
              </p>
              <Link to="/apply" className="btn-primary" style={{ fontSize: 13, padding: '12px 28px' }}>Be Part of the Story →</Link>
            </div>

            {/* Right: timeline */}
            <div style={{ position: 'relative' }}>
              {/* Vertical line */}
              <div style={{ position: 'absolute', left: 19, top: 8, bottom: 8, width: 1, background: 'linear-gradient(to bottom, var(--cyan), var(--pink), transparent)' }}/>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                {TIMELINE.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 20, position: 'relative' }}>
                    {/* Dot */}
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: i % 2 === 0 ? 'rgba(0,212,255,0.1)' : 'rgba(255,45,155,0.1)', border: `1.5px solid ${i % 2 === 0 ? 'rgba(0,212,255,0.4)' : 'rgba(255,45,155,0.4)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: i % 2 === 0 ? 'var(--cyan)' : 'var(--pink)', fontFamily: 'JetBrains Mono, monospace' }}>{item.year.slice(2)}</span>
                    </div>
                    <div style={{ paddingTop: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: i % 2 === 0 ? 'var(--cyan)' : 'var(--pink)', fontWeight: 600 }}>{item.year}</span>
                        <h4 style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>{item.title}</h4>
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6 }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── LEADERSHIP TEAM ─────────────────────────────── */}
      <section id="team" style={{ padding: '80px 0', background: 'var(--bg-primary)', borderTop: '1px solid var(--border)' }}>
        <div className="container mx-auto px-6">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40 }}>
            <div>
              <p style={{ color: 'var(--cyan)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Executive Committee</p>
              <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 'clamp(28px,4vw,36px)', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.02em' }}>LEADERSHIP TEAM</h2>
            </div>
            <Link to="/team" style={{ color: 'var(--cyan)', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
              Full Team
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
                  <div style={{ height: 160, background: 'rgba(255,255,255,0.03)' }}/>
                  <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ height: 12, borderRadius: 4, background: 'rgba(255,255,255,0.05)', width: '60%' }}/>
                    <div style={{ height: 10, borderRadius: 4, background: 'rgba(255,255,255,0.03)', width: '80%' }}/>
                  </div>
                </div>
              ))}
            </div>
          ) : team.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px', border: '1px dashed var(--border)', borderRadius: 14 }}>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Leadership team details coming soon.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
              {team.map(member => (
                <div key={member.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', transition: 'border-color 0.2s, transform 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.25)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  {/* Avatar */}
                  <div style={{ height: 160, background: 'linear-gradient(135deg, #0D1829, #142040)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                    {member.photo_url
                      ? <img src={member.photo_url} alt={member.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                      : <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, var(--cyan), #0066FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#fff' }}>
                          {getInitials(member.full_name)}
                        </div>
                    }
                    {/* Bottom gradient */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, background: 'linear-gradient(to top, rgba(10,14,26,0.7), transparent)' }}/>
                  </div>

                  {/* Info */}
                  <div style={{ padding: '16px 18px 20px' }}>
                    <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{member.full_name}</h3>
                    {member.oc_position && (
                      <p style={{ color: 'var(--cyan)', fontSize: 11, fontWeight: 600, textTransform: 'capitalize', letterSpacing: '0.04em', marginBottom: 10 }}>
                        {member.oc_position.replace(/_/g, ' ')}
                      </p>
                    )}
                    {member.bio && (
                      <p style={{ color: 'var(--text-muted)', fontSize: 12, lineHeight: 1.5, marginBottom: 14 }}>{member.bio.slice(0, 72)}{member.bio.length > 72 ? '…' : ''}</p>
                    )}
                    {/* Social links */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      {member.github_url && (
                        <a href={member.github_url} target="_blank" rel="noopener noreferrer"
                          style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', transition: 'all 0.15s', textDecoration: 'none' }}
                          onMouseEnter={e => { e.currentTarget.style.color = 'var(--cyan)'; e.currentTarget.style.borderColor = 'rgba(0,212,255,0.3)' }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                        </a>
                      )}
                      {member.linkedin_url && (
                        <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer"
                          style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', transition: 'all 0.15s', textDecoration: 'none' }}
                          onMouseEnter={e => { e.currentTarget.style.color = '#0A66C2'; e.currentTarget.style.borderColor = 'rgba(10,102,194,0.3)' }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────── */}
      <section style={{ padding: '80px 0', background: '#07090F', borderTop: '1px solid var(--border)' }}>
        <div className="container mx-auto px-6">
          <div style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.04), rgba(255,45,155,0.04))', border: '1px solid rgba(0,212,255,0.12)', borderRadius: 20, padding: '60px 56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap' }}>
            <div style={{ maxWidth: 520 }}>
              <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 'clamp(32px,4vw,52px)', fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 1.0, marginBottom: 16 }}>
                READY TO SHAPE THE <span style={{ color: 'var(--cyan)' }}>NEXT GENERATION?</span>
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
                Join 120+ active innovators already on board. Get access to workshops, hackathons, industry connections, and real project experience. The future is built by those who show up.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link to="/apply" className="btn-primary" style={{ fontSize: 13, padding: '12px 28px' }}>Apply Now</Link>
                <Link to="/events" className="btn-outline" style={{ fontSize: 13, padding: '12px 28px' }}>Browse Events</Link>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex' }}>
                {['AK','PT','RS','BM','SJ'].map((ini, i) => (
                  <div key={i} style={{ width: 44, height: 44, borderRadius: '50%', marginLeft: i === 0 ? 0 : -12, border: '2px solid #07090F', background: i % 2 === 0 ? 'linear-gradient(135deg, var(--cyan), #0066FF)' : 'linear-gradient(135deg, var(--pink), #FF6B35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', zIndex: 5 - i }}>{ini}</div>
                ))}
                <div style={{ width: 44, height: 44, borderRadius: '50%', marginLeft: -12, border: '2px solid #07090F', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>+115</div>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>Join 120+ innovators</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}