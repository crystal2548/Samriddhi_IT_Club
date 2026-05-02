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
function HeroCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  const mouse = useRef({ x: -1000, y: -1000 })
  const raf = useRef(0)

  useEffect(() => {
    const c = ref.current!; const ctx = c.getContext('2d')!
    const dpr = window.devicePixelRatio || 1
    let W = 0, H = 0
    const resize = () => {
      W = c.offsetWidth; H = c.offsetHeight
      c.width = W * dpr; c.height = H * dpr; ctx.scale(dpr, dpr)
    }
    resize(); window.addEventListener('resize', resize)

    const onMove = (e: MouseEvent) => { const r = c.getBoundingClientRect(); mouse.current = { x: e.clientX - r.left, y: e.clientY - r.top } }
    c.addEventListener('mousemove', onMove)
    c.addEventListener('mouseleave', () => { mouse.current = { x: -1000, y: -1000 } })

    type P = { x: number; y: number; ox: number; oy: number; r: number; a: number; color: string }
    const COLS = ['#00D4FF', '#7B5CFF', '#FF2D9B', '#00FFCC', '#ffffff']
    const pts: P[] = Array.from({ length: 65 }, () => ({
      x: Math.random() * 1600, y: Math.random() * 900,
      ox: Math.random() * 100, oy: Math.random() * 100,
      r: Math.random() * 1.6 + 0.3,
      a: Math.random() * 0.45 + 0.07,
      color: COLS[Math.floor(Math.random() * COLS.length)],
    }))

    // Orbiting rings around hero center
    type Ring = { r: number; color: string; speed: number; dash: boolean; op: number }
    const rings: Ring[] = [
      { r: 180, color: '#00D4FF', speed: 0.0004,  dash: false, op: 0.12 },
      { r: 260, color: '#7B5CFF', speed: -0.0003, dash: true,  op: 0.07 },
      { r: 340, color: '#FF2D9B', speed: 0.0002,  dash: false, op: 0.04 },
    ]
    type Orb = { ring: number; angle: number; speed: number; color: string; size: number; trail: {x:number;y:number}[]; trailLen: number }
    const orbs: Orb[] = [
      { ring: 0, angle: 0,       speed:  0.013, color: '#00D4FF', size: 3.5, trail: [], trailLen: 18 },
      { ring: 0, angle: Math.PI, speed:  0.013, color: '#00FFCC', size: 2.5, trail: [], trailLen: 12 },
      { ring: 1, angle: 1.3,     speed: -0.008, color: '#7B5CFF', size: 4,   trail: [], trailLen: 22 },
      { ring: 2, angle: 2.5,     speed:  0.005, color: '#FF2D9B', size: 3,   trail: [], trailLen: 14 },
    ]

    let t = 0
    function draw() {
      ctx.clearRect(0, 0, W, H); t += 0.008

      const cx = W * 0.62, cy = H * 0.48  // center of ring system (right side of hero)

      // Radial bg glow
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 380)
      g.addColorStop(0, 'rgba(0,160,190,0.08)'); g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)

      // Particles
      for (const p of pts) {
        p.x += Math.sin(t + p.ox * 0.05) * 0.35
        p.y += Math.cos(t + p.oy * 0.05) * 0.28
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0
        // Mouse repulsion
        const dx = p.x - mouse.current.x, dy = p.y - mouse.current.y
        const d = Math.hypot(dx, dy)
        if (d < 90) { const f = (90 - d) / 90; p.x += dx / d * f * 2.2; p.y += dy / d * f * 2.2 }
        ctx.globalAlpha = p.a; ctx.fillStyle = p.color
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill()
      }
      ctx.globalAlpha = 1

      // Particle connections
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d = Math.hypot(dx, dy)
        if (d < 90) {
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y)
          ctx.strokeStyle = '#00D4FF'; ctx.globalAlpha = (1 - d / 90) * 0.09; ctx.lineWidth = 0.5; ctx.stroke()
        }
      }
      ctx.globalAlpha = 1

      // Rings
      for (const ring of rings) {
        ctx.beginPath(); ctx.arc(cx, cy, ring.r, 0, Math.PI * 2)
        ctx.strokeStyle = ring.color; ctx.globalAlpha = ring.op; ctx.lineWidth = 1
        ctx.setLineDash(ring.dash ? [6, 12] : []); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1
      }

      // Orbiting dots with trails
      for (const orb of orbs) {
        orb.angle += orb.speed
        const rr = rings[orb.ring].r
        const px = cx + Math.cos(orb.angle) * rr, py = cy + Math.sin(orb.angle) * rr
        orb.trail.push({ x: px, y: py }); if (orb.trail.length > orb.trailLen) orb.trail.shift()
        for (let i = 1; i < orb.trail.length; i++) {
          const prog = i / orb.trail.length
          ctx.beginPath(); ctx.moveTo(orb.trail[i-1].x, orb.trail[i-1].y); ctx.lineTo(orb.trail[i].x, orb.trail[i].y)
          ctx.strokeStyle = orb.color; ctx.globalAlpha = prog * 0.55; ctx.lineWidth = orb.size * 0.55 * prog; ctx.stroke()
        }
        ctx.globalAlpha = 1
        const gg = ctx.createRadialGradient(px, py, 0, px, py, orb.size * 5)
        gg.addColorStop(0, orb.color + '88'); gg.addColorStop(1, orb.color + '00')
        ctx.beginPath(); ctx.arc(px, py, orb.size * 5, 0, Math.PI * 2); ctx.fillStyle = gg; ctx.fill()
        ctx.beginPath(); ctx.arc(px, py, orb.size, 0, Math.PI * 2); ctx.fillStyle = orb.color; ctx.fill()
      }

      raf.current = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener('resize', resize); c.removeEventListener('mousemove', onMove) }
  }, [])

  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }} />
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
          border: `1px solid ${hovered ? v.border : 'rgba(255,255,255,0.06)'}`,
          borderRadius: 20, padding: '32px 28px',
          transition: 'all 0.35s ease',
          transform: hovered ? 'translateY(-6px)' : 'none',
          boxShadow: hovered ? `0 20px 50px ${v.bg}` : 'none',
          cursor: 'default',
        }}
      >
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: v.bg, border: `1px solid ${v.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: v.color, marginBottom: 24,
          transform: hovered ? 'scale(1.1) rotate(3deg)' : 'scale(1)',
          transition: 'transform 0.35s ease',
        }}>
          {v.icon}
        </div>
        <h3 style={{ color: 'white', fontSize: 16, fontWeight: 700, margin: '0 0 10px', letterSpacing: '-0.01em' }}>{v.title}</h3>
        <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 13, lineHeight: 1.72, margin: 0 }}>{v.desc}</p>
      </div>
    </Reveal>
  )
}

// ── Team card ─────────────────────────────────────────────────────────────────
function TeamCard({ member, delay }: { member: Profile; delay: number }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Reveal delay={delay}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: 'rgba(8,14,28,0.9)',
          border: `1px solid ${hovered ? 'rgba(0,212,255,0.22)' : 'rgba(255,255,255,0.06)'}`,
          borderRadius: 18, overflow: 'hidden',
          transition: 'all 0.35s ease',
          transform: hovered ? 'translateY(-7px)' : 'none',
          boxShadow: hovered ? '0 24px 56px rgba(0,212,255,0.08)' : 'none',
        }}
      >
        {/* Photo */}
        <div style={{ position: 'relative', paddingBottom: '100%', background: '#06090F', overflow: 'hidden' }}>
          {member.photo_url ? (
            <img src={member.photo_url} alt={member.full_name} style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
              transform: hovered ? 'scale(1.07)' : 'scale(1)',
              transition: 'transform 0.55s ease',
            }} />
          ) : (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `linear-gradient(135deg, rgba(0,212,255,0.12), rgba(123,92,255,0.12))`,
              fontSize: 30, fontWeight: 800, color: 'white',
            }}>{getInitials(member.full_name)}</div>
          )}
          {/* Gradient overlay at bottom */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%', background: 'linear-gradient(to top, rgba(8,14,28,0.85), transparent)', transition: 'opacity 0.35s', opacity: hovered ? 1 : 0.5 }} />
        </div>

        {/* Info */}
        <div style={{ padding: '16px 18px 20px', textAlign: 'center' }}>
          <h3 style={{ color: 'white', fontWeight: 700, fontSize: 14, margin: '0 0 4px', letterSpacing: '-0.01em' }}>{member.full_name}</h3>
          {member.oc_position && (
            <span style={{ color: '#00D4FF', fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>
              {member.oc_position.replace(/_/g, ' ')}
            </span>
          )}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            {member.github_url && (
              <a href={member.github_url} target="_blank" rel="noopener noreferrer"
                style={{ color: 'rgba(255,255,255,0.3)', transition: 'color 0.2s', textDecoration: 'none' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
              </a>
            )}
            {member.linkedin_url && (
              <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer"
                style={{ color: 'rgba(255,255,255,0.3)', transition: 'color 0.2s', textDecoration: 'none' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#00D4FF')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </Reveal>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function About() {
  const [team, setTeam] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const { settings } = useSiteSettings()

  useEffect(() => {
    supabase.from('profiles')
      .select('id, full_name, photo_url, oc_position, bio, github_url, linkedin_url')
      .eq('role', 'oc').order('created_at', { ascending: true })
      .then(({ data }) => { setTeam(data as Profile[] || []); setLoading(false) })
  }, [])

  return (
    <div style={{ background: '#040810', minHeight: '100vh', paddingTop: 64, fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes shimmerGrad {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes dotPulse {
          0%,100% { opacity: 1;   transform: scale(1); }
          50%      { opacity: 0.5; transform: scale(0.75); }
        }
        @keyframes lineGrow {
          from { transform: scaleY(0); }
          to   { transform: scaleY(1); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(-16px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .gradient-text {
          background: linear-gradient(90deg, #00D4FF 0%, #7B5CFF 50%, #FF2D9B 100%);
          background-size: 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmerGrad 5s linear infinite;
        }

        .wrap { max-width: 1200px; margin: 0 auto; padding: 0 32px; }

        .btn-solid {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 28px; border-radius: 100px;
          background: #00D4FF; color: #040810;
          font-size: 13px; font-weight: 700; letter-spacing: 0.03em;
          text-decoration: none; border: none; cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 6px 22px rgba(0,212,255,0.22);
        }
        .btn-solid:hover { background: #33DDFF; transform: translateY(-2px); box-shadow: 0 10px 30px rgba(0,212,255,0.35); }

        .btn-outline {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 28px; border-radius: 100px;
          background: transparent; color: rgba(255,255,255,0.6);
          font-size: 13px; font-weight: 500;
          text-decoration: none; border: 1px solid rgba(255,255,255,0.1); cursor: pointer;
          transition: all 0.25s ease;
        }
        .btn-outline:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.22); color: white; transform: translateY(-1px); }

        .grid3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 18px; }
        .grid4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 18px; }

        @media(max-width:1000px) { .grid4 { grid-template-columns: repeat(2,1fr); } }
        @media(max-width:760px)  { .grid3 { grid-template-columns: 1fr; } .grid4 { grid-template-columns: repeat(2,1fr); } .story-flex { flex-direction: column !important; } }
        @media(max-width:500px)  { .grid4 { grid-template-columns: 1fr; } }

        /* Stat counter cell */
        .stat-cell {
          padding: 36px 20px; text-align: center;
          border-right: 1px solid rgba(255,255,255,0.05);
          transition: background 0.3s;
          cursor: default;
        }
        .stat-cell:last-child { border-right: none; }
        .stat-cell:hover { background: rgba(0,212,255,0.03); }
      `}</style>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section style={{ position: 'relative', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '100px 32px 80px' }}>
        <HeroCanvas />

        {/* Dot grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          maskImage: 'radial-gradient(ellipse at 50% 55%, black 25%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 55%, black 25%, transparent 75%)',
        }} />

        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: 820, width: '100%' }}>
          {/* Eyebrow */}
          <div style={{ marginBottom: 26, opacity: 0, animation: 'fadeSlideIn 0.6s 0.1s ease forwards' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 9,
              background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.16)',
              borderRadius: 100, padding: '7px 18px',
              fontSize: 10, fontWeight: 600, color: '#00D4FF', letterSpacing: '0.2em', textTransform: 'uppercase',
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#00D4FF', boxShadow: '0 0 8px #00D4FF', display: 'block', flexShrink: 0, animation: 'dotPulse 2s ease infinite' }} />
              Our Origin Story
            </span>
          </div>

          {/* Heading */}
          <div style={{ opacity: 0, animation: 'fadeSlideIn 0.7s 0.2s ease forwards' }}>
            <h1 style={{ fontSize: 'clamp(40px, 7vw, 88px)', fontWeight: 900, lineHeight: 0.88, letterSpacing: '-0.04em', margin: '0 0 26px', color: 'white', userSelect: 'none' }}>
              We are the<br />
              <span className="gradient-text" style={{ fontStyle: 'italic' }}>Future Architects</span>
            </h1>
          </div>

          {/* Subtitle */}
          <div style={{ opacity: 0, animation: 'fadeSlideIn 0.7s 0.32s ease forwards', marginBottom: 36 }}>
            <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 16, lineHeight: 1.75, maxWidth: 560, margin: '0 auto', fontWeight: 400 }}>
              {settings.about_description || `${settings.club_name || 'Samriddhi IT Club'} is a premier community of developers, designers, and tech entrepreneurs dedicated to shaping the digital future.`}
            </p>
          </div>

          {/* Buttons */}
          <div style={{ opacity: 0, animation: 'fadeSlideIn 0.7s 0.44s ease forwards', display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/apply" className="btn-solid">Join the Mission</Link>
            <Link to="/team" className="btn-outline">Meet the Squad ↗</Link>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────── */}
      <section style={{ background: 'rgba(255,255,255,0.015)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)' }}>
        <div className="wrap">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
            {[
              { n: settings.stat_members  || '120+', l: 'Active Members',    color: '#00D4FF' },
              { n: settings.stat_events   || '30+',  l: 'Annual Events',     color: '#FF2D9B' },
              { n: settings.stat_alumni   || '500+', l: 'Alumni Network',    color: '#7B5CFF' },
              { n: settings.stat_partners || '12+',  l: 'Industry Partners', color: '#00D4FF' },
            ].map((s, i) => (
              <div key={i} className="stat-cell">
                <div style={{ fontSize: 'clamp(28px, 3.5vw, 46px)', fontWeight: 800, color: 'white', lineHeight: 1, marginBottom: 8, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
                  <Counter target={s.n} />
                </div>
                <div style={{ fontSize: 10, fontWeight: 600, color: s.color, letterSpacing: '0.16em', textTransform: 'uppercase' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CORE VALUES ──────────────────────────────────── */}
      <section style={{ padding: '88px 32px' }}>
        <div className="wrap">
          <Reveal style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ color: '#00D4FF', fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10 }}>The DNA of our club</p>
            <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>What drives us</h2>
          </Reveal>
          <div className="grid3">
            {VALUES.map((v, i) => <ValueCard key={i} v={v} delay={i * 0.1} />)}
          </div>
        </div>
      </section>

      {/* ── OUR STORY + TIMELINE ─────────────────────────── */}
      <section style={{ padding: '88px 32px', background: 'rgba(255,255,255,0.012)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="wrap">
          <div className="story-flex" style={{ display: 'flex', gap: 72, alignItems: 'flex-start' }}>

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
            <div style={{ flex: 1, minWidth: 0, paddingLeft: 40, borderLeft: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
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

      {/* ── LEADERSHIP ───────────────────────────────────── */}
      <section style={{ padding: '88px 32px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="wrap">
          <Reveal style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <p style={{ color: '#7B5CFF', fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10 }}>Executive Committee</p>
              <h2 style={{ fontSize: 'clamp(22px, 3vw, 34px)', fontWeight: 800, color: 'white', letterSpacing: '-0.02em', margin: 0 }}>The Leadership</h2>
            </div>
            <Link to="/team" style={{ color: '#00D4FF', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', letterSpacing: '0.06em', opacity: 0.8, transition: 'opacity 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '1')} onMouseLeave={e => (e.currentTarget.style.opacity = '0.8')}>
              View All <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </Reveal>

          {loading ? (
            <div className="grid4">
              {[1,2,3,4].map(i => (
                <div key={i} style={{ borderRadius: 18, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                  <div style={{ paddingBottom: '100%', background: 'rgba(255,255,255,0.03)' }} />
                  <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                    <div style={{ width: '60%', height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.04)' }} />
                    <div style={{ width: '40%', height: 8, borderRadius: 5, background: 'rgba(255,255,255,0.03)' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : team.length > 0 ? (
            <div className="grid4">
              {team.map((m, i) => <TeamCard key={m.id} member={m} delay={i * 0.07} />)}
            </div>
          ) : (
            <div style={{ padding: '56px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.07)', borderRadius: 18 }}>
              <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13, fontWeight: 500, letterSpacing: '0.1em' }}>Leadership coming soon</p>
            </div>
          )}
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────── */}
      <section style={{ padding: '72px 32px 100px' }}>
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
                  <Link to="/apply" className="btn-solid" style={{ borderRadius: 12 }}>Join Now</Link>
                  <Link to="/events" className="btn-outline" style={{ borderRadius: 12 }}>Browse Events</Link>
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