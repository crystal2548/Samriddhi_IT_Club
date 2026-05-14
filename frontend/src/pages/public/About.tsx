import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../utils/supabase'
import { useSiteSettings } from '../../context/SiteContext'

interface Profile {
  id: string
  full_name: string
  photo_url: string | null
  oc_position: string | null
  bio: string | null
  github_url: string | null
  linkedin_url: string | null
}

function getInitials(name: string | null) {
  if (!name) return 'A'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const VALUES = [
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
    color: '#00D4FF', bg: 'rgba(0,212,255,0.07)', border: 'rgba(0,212,255,0.15)',
    title: 'Learn Continuously',
    desc: 'We foster a culture of curiosity and growth. Every workshop, hackathon, and project is a chance to level up.',
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    color: '#FF2D9B', bg: 'rgba(255,45,155,0.07)', border: 'rgba(255,45,155,0.15)',
    title: 'Build Together',
    desc: 'Developers, designers, and entrepreneurs collaborate to turn shared visions into real products.',
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    color: '#7B5CFF', bg: 'rgba(123,92,255,0.07)', border: 'rgba(123,92,255,0.15)',
    title: 'Create Impact',
    desc: 'We build real projects that solve real problems — for our community and beyond.',
  },
]

const TIMELINE = [
  { year: '2018', title: 'Club Founded',         desc: 'Samriddhi IT Club was born from a small group of passionate developers with a big vision.',       color: '#00D4FF' },
  { year: '2019', title: 'First Hackathon',       desc: 'Our debut 24-hour hackathon drew 80+ participants and set the standard for everything after.',      color: '#FF2D9B' },
  { year: '2021', title: 'Going Digital',         desc: 'Virtual workshops and an expanded online presence brought us to 200+ students nationwide.',         color: '#7B5CFF' },
  { year: '2023', title: 'Industry Partnerships', desc: '12+ tech companies partnered with us, opening real internship pipelines for our members.',           color: '#00D4FF' },
  { year: '2024', title: '500+ Alumni',           desc: 'Our alumni network crossed 500 — with members placed in top tech roles around the world.',          color: '#FF2D9B' },
]

// ── Hooks ─────────────────────────────────────────────────────────────────────
function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return { ref, visible }
}

function Reveal({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const { ref, visible } = useReveal()
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(28px)',
      transition: `opacity 0.65s ${delay}s ease, transform 0.65s ${delay}s ease`,
      ...style,
    }}>
      {children}
    </div>
  )
}

function Counter({ target }: { target: string }) {
  const num = parseInt(target.replace(/\D/g, ''))
  const suffix = target.replace(/[0-9]/g, '')
  const [val, setVal] = useState(0)
  const { ref, visible } = useReveal()
  useEffect(() => {
    if (!visible) return
    const dur = 1600; const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / dur)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(eased * num))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [visible])
  return <span ref={ref as any}>{val}{suffix}</span>
}

// ── Canvas: hero background ───────────────────────────────────────────────────
// ── Hero Background: Vibrant Prismatic Aurora ──────────────────────────────
function HeroBackground() {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none', background: '#040810' }}>
      {/* Aurora Blobs */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-10%', width: '70vw', height: '70vw',
        background: 'radial-gradient(circle, rgba(0,212,255,0.12) 0%, transparent 70%)',
        filter: 'blur(100px)', animation: 'auroraFloat 20s infinite alternate',
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', right: '-10%', width: '60vw', height: '60vw',
        background: 'radial-gradient(circle, rgba(255,45,155,0.08) 0%, transparent 70%)',
        filter: 'blur(100px)', animation: 'auroraFloat 25s infinite alternate-reverse',
      }} />
      <div style={{
        position: 'absolute', top: '20%', right: '10%', width: '50vw', height: '50vw',
        background: 'radial-gradient(circle, rgba(123,92,255,0.06) 0%, transparent 70%)',
        filter: 'blur(120px)', animation: 'auroraFloat 18s infinite alternate',
      }} />

      {/* Grid Overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
        maskImage: 'radial-gradient(ellipse at 50% 50%, black 20%, transparent 80%)',
        WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, black 20%, transparent 80%)',
      }} />
      
      <style>{`
        @keyframes auroraFloat {
          0%   { transform: translate(0, 0) scale(1); }
          100% { transform: translate(5%, 10%) scale(1.1); }
        }
      `}</style>
    </div>
  )
}

// ── Value card with hover glow ────────────────────────────────────────────────
function ValueCard({ v, delay }: { v: typeof VALUES[0]; delay: number }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Reveal delay={delay}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered ? `radial-gradient(circle at 20% 20%, ${v.bg} 0%, rgba(255,255,255,0.02) 60%)` : 'rgba(255,255,255,0.02)',
          border: `1px solid ${hovered ? v.border : 'rgba(255,255,255,0.08)'}`,
          borderRadius: 24, padding: '40px 32px',
          transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
          transform: hovered ? 'translateY(-10px)' : 'none',
          boxShadow: hovered ? `0 30px 60px -15px ${v.bg}` : 'none',
          cursor: 'default',
        }}
      >
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: v.bg, border: `1px solid ${v.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: v.color, marginBottom: 28,
          transform: hovered ? 'scale(1.1) rotate(5deg)' : 'none',
          transition: 'transform 0.4s ease',
        }}>
          {v.icon}
        </div>
        <h3 style={{ color: 'white', fontSize: 18, fontWeight: 700, margin: '0 0 12px', letterSpacing: '-0.02em' }}>{v.title}</h3>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>{v.desc}</p>
      </div>
    </Reveal>
  )
}

// ── Team card: Compact & Elegant ─────────────────────────────────────────────
function TeamCard({ member, delay }: { member: Profile; delay: number }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Reveal delay={delay}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: 'rgba(255,255,255,0.01)',
          border: `1px solid ${hovered ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.05)'}`,
          borderRadius: 14, overflow: 'hidden',
          transition: 'all 0.3s ease',
          transform: hovered ? 'translateY(-4px)' : 'none',
        }}
      >
        <div style={{ position: 'relative', paddingBottom: '110%', background: '#0a0d14', overflow: 'hidden' }}>
          {member.photo_url ? (
            <img src={member.photo_url} alt={member.full_name} style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
              transform: hovered ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.5s ease',
              filter: hovered ? 'grayscale(0)' : 'grayscale(0.2)',
            }} />
          ) : (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))`,
              fontSize: 24, fontWeight: 700, color: 'rgba(255,255,255,0.2)',
            }}>{getInitials(member.full_name)}</div>
          )}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to top, #040810, transparent)' }} />
          
          <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, textAlign: 'left' }}>
            <h4 style={{ color: 'white', fontWeight: 700, fontSize: 13, margin: 0, lineHeight: 1.2 }}>{member.full_name}</h4>
            <span style={{ color: '#00D4FF', fontSize: 9, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', opacity: 0.8 }}>
              {member.oc_position?.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      </div>
    </Reveal>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function About() {
  const { settings } = useSiteSettings()

  return (
    <div style={{ background: '#040810', minHeight: '100vh', paddingTop: 64, fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        .gradient-text {
          background: linear-gradient(90deg, #00D4FF 0%, #7B5CFF 50%, #FF2D9B 100%);
          background-size: 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmerGrad 6s linear infinite;
        }

        @keyframes shimmerGrad {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }

        .btn-vibrant {
          padding: 14px 32px; border-radius: 100px;
          background: #00D4FF; color: #040810;
          font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;
          text-decoration: none; transition: all 0.3s;
          box-shadow: 0 10px 30px rgba(0,212,255,0.2);
        }
        .btn-vibrant:hover { transform: translateY(-3px); box-shadow: 0 15px 40px rgba(0,212,255,0.35); background: #33DDFF; }

        .btn-vibrant-outline {
          padding: 13px 32px; border-radius: 100px;
          background: rgba(255,255,255,0.02); color: white;
          border: 1px solid rgba(255,255,255,0.1);
          font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;
          text-decoration: none; transition: all 0.3s;
        }
        .btn-vibrant-outline:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.25); transform: translateY(-2px); }

        .grid-team { display: grid; grid-template-columns: repeat(5,1fr); gap: 16px; }
        .grid3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
        .grid4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 20px; }

        .stat-cell { flex: 1; padding: 40px 20px; border-right: 1px solid rgba(255,255,255,0.05); text-align: center; }
        .stat-cell:last-child { border-right: none; }

        .story-flex { display: flex; gap: 80px; alignItems: center; }

        @media(max-width:1100px) { .grid-team { grid-template-columns: repeat(4,1fr); } .grid4 { grid-template-columns: repeat(2,1fr); } }
        @media(max-width:850px)  { 
          .grid-team { grid-template-columns: repeat(3,1fr); } 
          .grid3 { grid-template-columns: 1fr; } 
          .story-flex { flex-direction: column; gap: 48px; }
          .stat-cell { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.05); }
        }
        @media(max-width:600px)  { .grid-team { grid-template-columns: repeat(2,1fr); } }

        .wrap { max-width: 1200px; margin: 0 auto; padding: 0 32px; }
        
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes lineGrow { from { transform: scaleY(0); } to { transform: scaleY(1); } }
        @keyframes dotPulse { 
          0% { box-shadow: 0 0 0 0 rgba(0,212,255,0.4); }
          70% { box-shadow: 0 0 0 10px rgba(0,212,255,0); }
          100% { box-shadow: 0 0 0 0 rgba(0,212,255,0); }
        }
      `}</style>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section style={{ position: 'relative', minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 32px' }}>
        <HeroBackground />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 900 }}>
          <div style={{ marginBottom: 28, opacity: 0, animation: 'fadeSlideIn 0.8s 0.2s ease forwards' }}>
            <span style={{
              background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)',
              borderRadius: 100, padding: '8px 20px',
              fontSize: 10, fontWeight: 800, color: '#00D4FF', letterSpacing: '0.2em', textTransform: 'uppercase'
            }}>
              Innovating Nepal
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(44px, 8.5vw, 96px)', fontWeight: 900, lineHeight: 0.88, letterSpacing: '-0.04em', margin: '0 0 28px', color: 'white' }}>
            We are the<br />
            <span className="gradient-text">Future Architects</span>
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 'clamp(16px, 2vw, 18px)', lineHeight: 1.6, maxWidth: 600, margin: '0 auto 48px' }}>
            {settings.about_description || "Empowering students to build the digital future through collaboration and radical innovation."}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <Link to="/apply" className="btn-vibrant">Join the Mission</Link>
            <Link to="/team" className="btn-vibrant-outline">Our Squad</Link>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────── */}
      <section style={{ padding: '50px 0', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)' }}>
        <div className="wrap">
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap' }}>
            {[
              { n: settings.stat_members  || '120+', l: 'Active Members' },
              { n: settings.stat_events   || '30+',  l: 'Annual Events' },
              { n: settings.stat_alumni   || '500+', l: 'Alumni Network' },
              { n: settings.stat_partners || '12+',  l: 'Industry Partners' },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1, minWidth: 140, textAlign: 'center' }}>
                <div style={{ fontSize: 40, fontWeight: 900, color: 'white', marginBottom: 4 }}><Counter target={s.n} /></div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CORE VALUES ──────────────────────────────────── */}
      <section style={{ padding: '100px 32px 60px' }}>
        <div className="wrap">
          <Reveal style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>Driven by Purpose</h2>
          </Reveal>
          <div className="grid3">
            {VALUES.map((v, i) => <ValueCard key={i} v={v} delay={i * 0.1} />)}
          </div>
        </div>
      </section>
      {/* ── OUR STORY + TIMELINE ─────────────────────────── */}
      <section style={{ padding: '60px 32px', background: 'rgba(255,255,255,0.005)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="wrap">
          <div className="story-flex" style={{ display: 'flex', gap: 72, alignItems: 'center' }}>

            {/* Story */}
            <Reveal style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: '#FF2D9B', fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 14 }}>The Journey</p>
              <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, color: 'white', letterSpacing: '-0.02em', marginBottom: 22 }}>Our Story</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, lineHeight: 1.78, marginBottom: 16, fontStyle: 'italic' }}>
                {settings.about_story || `Born from a shared passion for technology, ${settings.club_name || 'Samriddhi IT Club'} began as a small group of students who believed that the best way to learn was to build together.`}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, lineHeight: 1.78, marginBottom: 36 }}>
                Today, we are a thriving community driving innovation through real-world projects, industry-level hackathons, and networking events that bridge students to the broader tech ecosystem.
              </p>
              <Link to="/apply" className="btn-solid">Write History With Us →</Link>
            </Reveal>

            {/* Timeline */}
            <div style={{ flex: 1, minWidth: 0, paddingLeft: 52, borderLeft: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
              {/* Animated line */}
              <div style={{
                position: 'absolute', left: -1, top: 0, bottom: 0, width: 2,
                background: 'linear-gradient(to bottom, #00D4FF, #7B5CFF, #FF2D9B, transparent)',
                opacity: 0.25,
                transformOrigin: 'top',
                animation: 'lineGrow 1.2s 0.3s ease forwards',
                transform: 'scaleY(0)',
              }} />

              {TIMELINE.map((item, i) => (
                <Reveal key={i} delay={i * 0.12} style={{ position: 'relative', paddingBottom: i < TIMELINE.length - 1 ? 36 : 0 }}>
                  {/* Dot */}
                  <div style={{
                    position: 'absolute', left: -48, top: 2,
                    width: 12, height: 12, borderRadius: '50%',
                    background: item.color,
                    boxShadow: `0 0 0 4px rgba(${item.color === '#00D4FF' ? '0,212,255' : item.color === '#FF2D9B' ? '255,45,155' : '123,92,255'},0.15)`,
                    animation: 'dotPulse 2.5s ease infinite',
                    animationDelay: `${i * 0.4}s`,
                  }} />
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: item.color, fontWeight: 700, letterSpacing: '0.15em', display: 'block', marginBottom: 5 }}>{item.year}</span>
                  <h4 style={{ color: 'white', fontWeight: 700, fontSize: 15, margin: '0 0 6px', letterSpacing: '-0.01em' }}>{item.title}</h4>
                  <p style={{ color: 'rgba(255,255,255,0.32)', fontSize: 13, lineHeight: 1.68, margin: 0 }}>{item.desc}</p>
                </Reveal>
              ))}
            </div>

          </div>
        </div>
      </section>
      {/* ── FINAL CTA ────────────────────────────────────── */}
      <section style={{ padding: '20px 32px 80px' }}>
        <div className="wrap">
          <Reveal>
            <div style={{
              position: 'relative', overflow: 'hidden',
              background: 'radial-gradient(ellipse at 20% 50%, rgba(0,212,255,0.06) 0%, transparent 55%), radial-gradient(ellipse at 80% 50%, rgba(255,45,155,0.05) 0%, transparent 55%), rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 28, padding: '64px 56px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap',
            }}>
              {/* Glow blobs */}
              <div style={{ position: 'absolute', top: -80, left: -80, width: 280, height: 280, borderRadius: '50%', background: 'rgba(0,212,255,0.05)', filter: 'blur(60px)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: -80, right: -80, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,45,155,0.04)', filter: 'blur(60px)', pointerEvents: 'none' }} />

              <div style={{ maxWidth: 500, position: 'relative', zIndex: 1 }}>
                <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 40px)', fontWeight: 800, color: 'white', lineHeight: 1.15, letterSpacing: '-0.025em', margin: '0 0 14px' }}>
                  The future is built{' '}
                  <span className="gradient-text">by those who show up.</span>
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.36)', fontSize: 14, lineHeight: 1.72, margin: '0 0 28px' }}>
                  Join {settings.stat_members || '120+'} active innovators already onboard — workshops, hackathons, industry connections, and real project experience.
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <Link to="/apply" className="btn-solid" style={{ borderRadius: 100 }}>Join Now</Link>
                  <Link to="/events" className="btn-outline" style={{ borderRadius: 100 }}>Browse Events</Link>
                </div>
              </div>

              {/* Avatar stack */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex' }}>
                  {['AK','PT','RS','BM','SJ'].map((ini, i) => (
                    <div key={i} style={{
                      width: 40, height: 40, borderRadius: '50%', border: '2px solid #040810',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, color: 'white',
                      marginLeft: i > 0 ? -10 : 0, zIndex: 5 - i,
                      background: i % 2 === 0 ? 'linear-gradient(135deg,#00D4FF,#0055FF)' : 'linear-gradient(135deg,#FF2D9B,#FF6B35)',
                    }}>{ini}</div>
                  ))}
                  <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid #040810', marginLeft: -10, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>+115</div>
                </div>
                <span style={{ color: 'rgba(255,255,255,0.22)', fontSize: 11, fontFamily: "'Space Mono', monospace" }}>
                  {settings.stat_members || '120+'} innovators and counting
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}