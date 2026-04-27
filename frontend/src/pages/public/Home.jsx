import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../utils/supabase'
import { formatDateShort } from '../../utils/formatters'
import { useSiteSettings } from '../../context/SiteContext'

const HERO_WORDS = ['INNOVATE.', 'CREATE.', 'COMPETE.', 'CONNECT.']

export default function Home() {
  const [events, setEvents]     = useState([])
  const [projects, setProjects] = useState([])
  const [posts, setPosts]       = useState([])
  const [sponsors, setSponsors] = useState([])
  const [loading, setLoading]   = useState(true)
  const [wordIndex, setWordIndex]   = useState(0)
  const [displayed, setDisplayed]   = useState('')
  const [deleting, setDeleting]     = useState(false)
  const typingRef = useRef(null)
  const { settings } = useSiteSettings()

  useEffect(() => {
    async function fetchAll() {
      const [eventsRes, projectsRes, postsRes, sponsorsRes] = await Promise.all([
        supabase.from('events').select('*').in('status', ['upcoming', 'ongoing']).order('event_date', { ascending: true }).limit(3),
        supabase.from('projects').select('*').eq('is_featured', true).order('created_at', { ascending: false }).limit(3),
        supabase.from('blog_posts').select('id, title, slug, category, cover_image_url, read_time_mins, published_at, profiles(full_name)').eq('status', 'published').order('published_at', { ascending: false }).limit(3),
        supabase.from('sponsors').select('*').eq('is_active', true).order('tier'),
      ])
      setEvents(eventsRes.data || [])
      setProjects(projectsRes.data || [])
      setPosts(postsRes.data || [])
      setSponsors(sponsorsRes.data || [])
      setLoading(false)
    }
    fetchAll()
  }, [])

  useEffect(() => {
    const word = HERO_WORDS[wordIndex]
    if (!deleting) {
      if (displayed.length < word.length) {
        typingRef.current = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 100)
      } else {
        typingRef.current = setTimeout(() => setDeleting(true), 2000)
      }
    } else {
      if (displayed.length > 0) {
        typingRef.current = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 50)
      } else {
        setDeleting(false)
        setWordIndex(i => (i + 1) % HERO_WORDS.length)
      }
    }
    return () => clearTimeout(typingRef.current)
  }, [displayed, deleting, wordIndex])

  return (
    <div style={{ background: 'var(--bg-primary)', paddingTop: '64px' }}>
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes float1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes float2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        .float1 { animation: float1 3s ease-in-out infinite; }
        .float2 { animation: float2 4s ease-in-out infinite 1s; }
      `}</style>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section style={{
        minHeight: 'calc(100vh - 64px)',
        background: 'linear-gradient(135deg, #0A0E1A 0%, #0D1829 50%, #0A0E1A 100%)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
        padding: '80px 0',
      }}>
        {/* Rings */}
        {[500,380,260,160].map((size, i) => (
          <div key={i} style={{
            position: 'absolute', right: '8%', top: '50%',
            transform: 'translateY(-50%)',
            width: size, height: size, borderRadius: '50%',
            border: `1px solid rgba(0,212,255,${0.04 + i * 0.02})`,
            pointerEvents: 'none',
          }}/>
        ))}
        <div style={{
          position: 'absolute', right: '8%', top: '50%',
          transform: 'translateY(-50%)',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,212,255,0.03) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}/>

        {/* Center icon */}
        <div className="float1" style={{ position: 'absolute', right: 'calc(8% + 185px)', top: '50%', transform: 'translateY(-50%)' }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="1.5">
              <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          </div>
        </div>

        {/* Floating stat cards */}
        <div className="float2" style={{ position: 'absolute', right: 'calc(8% - 20px)', top: 'calc(50% - 110px)' }}>
          <div style={{ background: 'rgba(13,24,41,0.9)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 10, padding: '10px 18px', backdropFilter: 'blur(10px)' }}>
            <div style={{ color: 'var(--cyan)', fontSize: 22, fontWeight: 800, fontFamily: 'Barlow Condensed, sans-serif' }}>120+</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Members</div>
          </div>
        </div>
        <div className="float1" style={{ position: 'absolute', right: 'calc(8% - 30px)', top: 'calc(50% + 60px)' }}>
          <div style={{ background: 'rgba(13,24,41,0.9)', border: '1px solid rgba(255,45,155,0.2)', borderRadius: 10, padding: '10px 18px', backdropFilter: 'blur(10px)' }}>
            <div style={{ color: 'var(--pink)', fontSize: 22, fontWeight: 800, fontFamily: 'Barlow Condensed, sans-serif' }}>15+</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Projects</div>
          </div>
        </div>

        <div className="container mx-auto px-6 relative" style={{ zIndex: 10 }}>
          <div style={{ maxWidth: 640 }}>
            {/* Eyebrow */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24, background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 20, padding: '5px 14px' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--cyan)' }}/>
              <span style={{ color: 'var(--cyan)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>The future is ours to build</span>
            </div>

            {/* Heading */}
            <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 'clamp(64px, 10vw, 96px)', fontWeight: 900, lineHeight: 0.95, letterSpacing: '-0.02em', textTransform: 'uppercase', color: '#fff', marginBottom: 28 }}>
              CODE.
              <br/>
              <span style={{ color: 'var(--cyan)' }}>
                {displayed}
                <span style={{ animation: 'blink 1s step-end infinite' }}>|</span>
              </span>
              <br/>
              <span style={{ color: 'var(--pink)' }}>CONNECT.</span>
            </h1>

            {/* Subtitle */}
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.75, maxWidth: 480, marginBottom: 36, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500 }}>
              {settings.tagline || "Join premier community of developers, designers, and tech enthusiasts. We turn complex problems into elegant solutions through collaborative excellence."}
            </p>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/apply" className="btn-primary" style={{ fontSize: 13, padding: '12px 28px' }}>{settings.hero_cta_text || 'Join Now'}</Link>
              <Link to="/projects" className="btn-outline" style={{ fontSize: 13, padding: '12px 28px' }}>View Projects</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────── */}
      <section style={{ background: '#07090F', borderBottom: '1px solid var(--border)' }}>
        <div className="container mx-auto px-6">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {[
              { n: settings.stat_members  || '120+', l: 'Active members' },
              { n: settings.stat_events   || '30+',  l: 'Annual events' },
              { n: settings.stat_alumni   || '500+', l: 'Alumni network' },
              { n: settings.stat_partners || '12+',  l: 'Industry partners' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '36px 24px', textAlign: 'center', borderRight: i < 3 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 44, fontWeight: 800, color: 'var(--cyan)', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 8 }}>{s.n}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── UPCOMING EVENTS ──────────────────────────────── */}
      <section style={{ padding: '80px 0', background: 'var(--bg-primary)' }}>
        <div className="container mx-auto px-6">
          <SectionHeader eyebrow="Engage with us" title="Upcoming Events" linkTo="/events" linkLabel="View All Events" />
          {loading ? <CardsSkeleton /> : events.length === 0
            ? <EmptyState message="No upcoming events right now." sub="Check back soon or follow us on Instagram." />
            : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>{events.map(e => <EventCard key={e.id} event={e} />)}</div>
          }
        </div>
      </section>

      {/* ── FEATURED PROJECTS ────────────────────────────── */}
      <section style={{ padding: '80px 0', background: '#07090F', borderTop: '1px solid var(--border)' }}>
        <div className="container mx-auto px-6">
          <SectionHeader eyebrow="Our innovations" title="Featured Projects" linkTo="/projects" linkLabel="View All Projects" />
          {loading ? <CardsSkeleton /> : projects.length === 0
            ? <EmptyState message="No featured projects yet." sub="Projects will appear here once added by the team." />
            : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>{projects.map(p => <ProjectCard key={p.id} project={p} />)}</div>
          }
        </div>
      </section>

      {/* ── BLOG POSTS ───────────────────────────────────── */}
      <section style={{ padding: '80px 0', background: 'var(--bg-primary)', borderTop: '1px solid var(--border)' }}>
        <div className="container mx-auto px-6">
          <SectionHeader eyebrow="Knowledge base" title="Latest from Blog" linkTo="/blog" linkLabel="Read All Stories" />
          {loading ? <CardsSkeleton /> : posts.length === 0
            ? <EmptyState message="No blog posts yet." sub="Articles will appear here once published." />
            : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>{posts.map(p => <BlogCard key={p.id} post={p} />)}</div>
          }
        </div>
      </section>

      {/* ── JOIN CTA ─────────────────────────────────────── */}
      <section style={{ padding: '80px 0', background: '#07090F', borderTop: '1px solid var(--border)' }}>
        <div className="container mx-auto px-6">
          <div style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.04), rgba(255,45,155,0.04))', border: '1px solid rgba(0,212,255,0.12)', borderRadius: 20, padding: '60px 56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap' }}>
            <div style={{ maxWidth: 520 }}>
              <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 1.05, marginBottom: 16 }}>
                Ready to shape the <span style={{ color: 'var(--cyan)' }}>digital frontier?</span>
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
                Join 120+ active innovators already onboard. Get access to workshops, hackathons, industry connections, and real project experience.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link to="/apply" className="btn-primary" style={{ fontSize: 13, padding: '12px 28px' }}>{settings.hero_cta_text || 'Join Now'}</Link>
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

function SectionHeader({ eyebrow, title, linkTo, linkLabel }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40 }}>
      <div>
        <p style={{ color: 'var(--cyan)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{eyebrow}</p>
        <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{title}</h2>
      </div>
      <Link to={linkTo} style={{ color: 'var(--cyan)', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
        {linkLabel}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </Link>
    </div>
  )
}

function EventCard({ event }) {
  const typeColor = { hackathon: 'var(--cyan)', workshop: 'var(--pink)', seminar: '#00BFA5', bootcamp: '#A78BFA', social: '#F59E0B', fest: 'var(--pink)' }
  const statusMap = {
    upcoming:  { label: 'Upcoming',  bg: 'rgba(16,185,129,0.12)',  color: '#10B981', border: 'rgba(16,185,129,0.25)' },
    ongoing:   { label: 'Ongoing',   bg: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: 'rgba(245,158,11,0.25)' },
    completed: { label: 'Completed', bg: 'rgba(75,85,99,0.15)',   color: '#9CA3AF', border: 'rgba(75,85,99,0.25)' },
  }
  const st = statusMap[event.status] || statusMap.upcoming
  return (
    <Link to={`/events/${event.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', transition: 'border-color 0.2s, transform 0.2s', cursor: 'pointer' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.3)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
      >
        <div style={{ height: 180, background: 'linear-gradient(135deg, #0D1829, #142040)', position: 'relative', overflow: 'hidden' }}>
          {event.banner_url
            ? <img src={event.banner_url} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(0,212,255,0.15)" strokeWidth="1"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
          }
          <div style={{ position: 'absolute', top: 12, right: 12 }}>
            <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>{st.label}</span>
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.4), transparent)' }}/>
        </div>
        <div style={{ padding: '20px 20px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: typeColor[event.type] || 'var(--cyan)', marginBottom: 10, display: 'block' }}>{event.type}</span>
          <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 700, lineHeight: 1.3, marginBottom: 8 }}>{event.title}</h3>
          {event.description && <p style={{ color: 'var(--text-muted)', fontSize: 12, lineHeight: 1.6, marginBottom: 16, flex: 1 }}>{event.description.slice(0, 80)}...</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
            {event.event_date && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 12 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {formatDateShort(event.event_date)} • {new Date(event.event_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
            {event.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 12 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {event.location}
              </div>
            )}
            {event.max_participants && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 12 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                {event.max_participants} seats
              </div>
            )}
          </div>
          <button style={{ width: '100%', padding: '10px', borderRadius: 8, background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: 'var(--cyan)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer', transition: 'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,212,255,0.08)'}
          >Register Now →</button>
        </div>
      </div>
    </Link>
  )
}

function ProjectCard({ project }) {
  return (
    <Link to={`/projects/${project.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', transition: 'border-color 0.2s, transform 0.2s' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.25)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
      >
        <div style={{ height: 180, background: 'linear-gradient(135deg, #0D1829, #142040)', position: 'relative', overflow: 'hidden' }}>
          {project.banner_url
            ? <img src={project.banner_url} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="1.5"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                </div>
              </div>
          }
          {project.is_featured && (
            <div style={{ position: 'absolute', top: 12, right: 12 }}>
              <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: 'rgba(255,45,155,0.12)', color: 'var(--pink)', border: '1px solid rgba(255,45,155,0.25)' }}>Featured</span>
            </div>
          )}
        </div>
        <div style={{ padding: '20px 20px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{project.title}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, lineHeight: 1.6, marginBottom: 16, flex: 1 }}>{project.description?.slice(0, 90)}...</p>
          {project.tech_stack?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
              {project.tech_stack.slice(0, 4).map(t => (
                <span key={t} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>{t}</span>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: 16 }}>
            {project.github_url && (
              <a href={project.github_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ color: 'var(--cyan)', fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                GitHub
              </a>
            )}
            {project.demo_url && (
              <a href={project.demo_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ color: 'var(--pink)', fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                Live Demo
              </a>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

function BlogCard({ post }) {
  const catColor = { development: 'var(--cyan)', 'ai-ml': 'var(--pink)', career: '#A78BFA', 'club-news': '#F59E0B' }
  const catBg    = { development: 'rgba(0,212,255,0.08)', 'ai-ml': 'rgba(255,45,155,0.08)', career: 'rgba(167,139,250,0.08)', 'club-news': 'rgba(245,158,11,0.08)' }
  return (
    <Link to={`/blog/${post.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', transition: 'border-color 0.2s, transform 0.2s' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.25)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
      >
        <div style={{ height: 180, background: 'linear-gradient(135deg, #0D1829, #142040)', overflow: 'hidden', position: 'relative' }}>
          {post.cover_image_url
            ? <img src={post.cover_image_url} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, color: 'rgba(0,212,255,0.08)' }}>✦</div>
          }
        </div>
        <div style={{ padding: '20px 20px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {post.category && (
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: catColor[post.category] || 'var(--cyan)', background: catBg[post.category] || 'rgba(0,212,255,0.08)', padding: '3px 10px', borderRadius: 20, display: 'inline-block', marginBottom: 12, width: 'fit-content' }}>
              {post.category.replace('-', '/')}
            </span>
          )}
          <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 700, lineHeight: 1.35, marginBottom: 16, flex: 1 }}>{post.title}</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--cyan), #0066FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>
                {post.profiles?.full_name?.[0] || 'A'}
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{post.profiles?.full_name || 'Author'}</span>
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>{post.read_time_mins} min read</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

function EmptyState({ message, sub }) {
  return (
    <div style={{ borderRadius: 14, padding: '64px 24px', border: '1px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500, marginBottom: 6 }}>{message}</p>
      <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>{sub}</p>
    </div>
  )
}

function CardsSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
      {[1,2,3].map(i => (
        <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ height: 180, background: 'rgba(255,255,255,0.03)' }}/>
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ height: 10, borderRadius: 4, background: 'rgba(255,255,255,0.05)', width: '40%' }}/>
            <div style={{ height: 14, borderRadius: 4, background: 'rgba(255,255,255,0.05)', width: '80%' }}/>
            <div style={{ height: 10, borderRadius: 4, background: 'rgba(255,255,255,0.03)', width: '65%' }}/>
          </div>
        </div>
      ))}
    </div>
  )
}
