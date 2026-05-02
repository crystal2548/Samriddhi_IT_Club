import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../utils/supabase'

interface Profile {
  id: string
  full_name: string
  role: string
  oc_position: string | null
  photo_url: string | null
  bio: string | null
  github_url: string | null
  linkedin_url: string | null
}

const DEPARTMENTS = ['All', 'Development', 'Design', 'Media', 'Operations']
const DEPT_MAP: Record<string, string[]> = {
  Development: ['technical_lead', 'developer'],
  Design:      ['graphics_designer', 'media_design', 'designer'],
  Media:       ['video_editor', 'photographer'],
  Operations:  ['event_coordinator', 'secretary', 'treasurer', 'moderator', 'president', 'vice_president'],
}

// Colors per dept / role
const ROLE_PALETTE: Record<string, { primary: string; glow: string; dim: string }> = {
  executive:   { primary: '#00D4FF', glow: 'rgba(0,212,255,0.35)',   dim: 'rgba(0,212,255,0.08)'   },
  Development: { primary: '#00D4FF', glow: 'rgba(0,212,255,0.3)',    dim: 'rgba(0,212,255,0.07)'   },
  Design:      { primary: '#FF2D9B', glow: 'rgba(255,45,155,0.3)',   dim: 'rgba(255,45,155,0.07)'  },
  Media:       { primary: '#F59E0B', glow: 'rgba(245,158,11,0.3)',   dim: 'rgba(245,158,11,0.07)'  },
  Operations:  { primary: '#7B5CFF', glow: 'rgba(123,92,255,0.3)',   dim: 'rgba(123,92,255,0.07)'  },
  default:     { primary: '#00D4FF', glow: 'rgba(0,212,255,0.25)',   dim: 'rgba(0,212,255,0.06)'   },
}

function getDept(pos: string | null): string {
  if (!pos) return 'Operations'
  const p = pos.toLowerCase()
  for (const [dept, roles] of Object.entries(DEPT_MAP)) {
    if (roles.some(r => p.includes(r))) return dept
  }
  return 'Operations'
}

function getPalette(member: Profile) {
  if (member.role === 'executive') return ROLE_PALETTE.executive
  return ROLE_PALETTE[getDept(member.oc_position)] || ROLE_PALETTE.default
}

function fmtRole(pos: string | null, role: string) {
  if (pos) return pos.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  if (role === 'executive') return 'Executive'
  return 'Member'
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

// ── Reveal hook ────────────────────────────────────────────────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [v, setV] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect() } }, { threshold: 0.08 })
    obs.observe(el); return () => obs.disconnect()
  }, [])
  return { ref, v }
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, v } = useReveal()
  return (
    <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? 'translateY(0)' : 'translateY(24px)', transition: `opacity 0.6s ${delay}s ease, transform 0.6s ${delay}s ease` }}>
      {children}
    </div>
  )
}

// ── Sci-fi corner decorator ────────────────────────────────────────────────────
function Corners({ color }: { color: string }) {
  const s: React.CSSProperties = { position: 'absolute', width: 14, height: 14, borderColor: color, borderStyle: 'solid', borderWidth: 0 }
  return <>
    <div style={{ ...s, top: 8, left: 8,   borderTopWidth: 2,    borderLeftWidth: 2  }} />
    <div style={{ ...s, top: 8, right: 8,  borderTopWidth: 2,    borderRightWidth: 2 }} />
    <div style={{ ...s, bottom: 8, left: 8,  borderBottomWidth: 2, borderLeftWidth: 2  }} />
    <div style={{ ...s, bottom: 8, right: 8, borderBottomWidth: 2, borderRightWidth: 2 }} />
  </>
}

// ── Hero canvas ────────────────────────────────────────────────────────────────
function HeroCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  const raf = useRef(0)
  useEffect(() => {
    const c = ref.current!; const ctx = c.getContext('2d')!
    const dpr = window.devicePixelRatio || 1
    let W = 0, H = 0
    const resize = () => { W = c.offsetWidth; H = c.offsetHeight; c.width = W * dpr; c.height = H * dpr; ctx.scale(dpr, dpr) }
    resize(); window.addEventListener('resize', resize)
    type P = { x: number; y: number; vx: number; vy: number; r: number; a: number; color: string }
    const COLS = ['#00D4FF','#7B5CFF','#FF2D9B']
    const pts: P[] = Array.from({ length: 50 }, () => ({
      x: Math.random() * 2000, y: Math.random() * 600, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.4 + 0.3, a: Math.random() * 0.4 + 0.08, color: COLS[Math.floor(Math.random() * 3)],
    }))
    let t = 0
    function draw() {
      ctx.clearRect(0, 0, W, H); t += 0.006
      // Glow
      const g = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, W * 0.5)
      g.addColorStop(0, 'rgba(0,150,180,0.06)'); g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
      for (const p of pts) {
        p.x += p.vx + Math.sin(t + p.y * 0.01) * 0.2
        p.y += p.vy + Math.cos(t + p.x * 0.01) * 0.15
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0; if (p.y < 0) p.y = H; if (p.y > H) p.y = 0
        ctx.globalAlpha = p.a; ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill()
      }
      ctx.globalAlpha = 1
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d = Math.hypot(dx, dy)
        if (d < 95) { ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.strokeStyle = '#00D4FF'; ctx.globalAlpha = (1 - d / 95) * 0.08; ctx.lineWidth = 0.5; ctx.stroke(); ctx.globalAlpha = 1 }
      }
      raf.current = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }} />
}

// ── Member card ────────────────────────────────────────────────────────────────
function MemberCard({ member, delay, onClick }: { member: Profile; delay: number; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  const pal = getPalette(member)
  const isLeader = member.role === 'executive'

  return (
    <Reveal delay={delay}>
      <div
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: 'relative', cursor: 'pointer',
          background: hovered
            ? `linear-gradient(160deg, ${pal.dim} 0%, rgba(4,8,16,0.98) 60%)`
            : 'rgba(6,10,20,0.95)',
          border: `1px solid ${hovered ? pal.primary + '55' : 'rgba(255,255,255,0.07)'}`,
          borderRadius: 4,
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          transform: hovered ? 'translateY(-6px) scale(1.01)' : 'none',
          boxShadow: hovered ? `0 20px 50px ${pal.glow}, 0 0 0 1px ${pal.primary}22` : '0 4px 20px rgba(0,0,0,0.4)',
          aspectRatio: isLeader ? '3/4' : '2/3',
        }}
      >
        {/* Sci-fi corners */}
        <Corners color={hovered ? pal.primary : pal.primary + '55'} />

        {/* Scan line on hover */}
        {hovered && (
          <div style={{
            position: 'absolute', left: 0, right: 0, height: 2, zIndex: 20, pointerEvents: 'none',
            background: `linear-gradient(90deg, transparent, ${pal.primary}88, transparent)`,
            animation: 'scanline 1.5s ease-in-out infinite',
          }} />
        )}

        {/* Top HUD bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
          padding: '10px 14px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)',
        }}>
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: pal.primary, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.8 }}>
            {isLeader ? 'EXEC' : getDept(member.oc_position).slice(0, 3).toUpperCase()}
          </span>
          {/* HUD dots */}
          <div style={{ display: 'flex', gap: 3 }}>
            {[1,2,3].map(i => <div key={i} style={{ width: 4, height: 4, borderRadius: 1, background: pal.primary, opacity: i === 1 ? 1 : 0.3 }} />)}
          </div>
        </div>

        {/* Photo */}
        <div style={{ position: 'absolute', inset: 0 }}>
          {member.photo_url ? (
            <img src={member.photo_url} alt={member.full_name} style={{
              width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center',
              transform: hovered ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.5s ease',
              filter: hovered ? `brightness(0.75) saturate(1.1)` : 'brightness(0.6) saturate(0.9)',
            }} />
          ) : (
            <div style={{
              width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `linear-gradient(135deg, ${pal.dim}, rgba(4,8,16,0.95))`,
              fontSize: 40, fontWeight: 900, color: pal.primary,
            }}>{getInitials(member.full_name)}</div>
          )}
          {/* Bottom gradient overlay */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: '55%',
            background: `linear-gradient(to top, rgba(4,8,16,0.98) 0%, rgba(4,8,16,0.7) 50%, transparent 100%)`,
          }} />
        </div>

        {/* Vertical role text on right edge */}
        <div style={{
          position: 'absolute', right: 12, top: '50%', zIndex: 10,
          transform: 'translateY(-50%) rotate(90deg)',
          transformOrigin: 'center center',
          fontFamily: "'Space Mono',monospace",
          fontSize: 8, fontWeight: 700, color: pal.primary,
          letterSpacing: '0.2em', textTransform: 'uppercase',
          opacity: 0.7, whiteSpace: 'nowrap',
        }}>
          {fmtRole(member.oc_position, member.role)}
        </div>

        {/* Bottom info */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10, padding: '0 14px 14px' }}>
          {/* Color accent bar */}
          <div style={{ height: 1, background: `linear-gradient(90deg, ${pal.primary}88, transparent)`, marginBottom: 10 }} />
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: pal.primary, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 3, opacity: 0.8 }}>
            {getDept(member.oc_position)}
          </div>
          <h3 style={{ color: 'white', fontWeight: 800, fontSize: 14, letterSpacing: '-0.01em', lineHeight: 1.2, margin: 0 }}>
            {member.full_name}
          </h3>
          {/* Click hint */}
          {hovered && (
            <div style={{ marginTop: 6, fontSize: 9, color: pal.primary, fontFamily: "'Space Mono',monospace", letterSpacing: '0.12em', opacity: 0.7 }}>
              [ VIEW PROFILE ]
            </div>
          )}
        </div>

        {/* Corner glow on hover */}
        {hovered && (
          <div style={{ position: 'absolute', bottom: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: pal.glow, filter: 'blur(30px)', pointerEvents: 'none', zIndex: 0 }} />
        )}
      </div>
    </Reveal>
  )
}

// ── Detail panel (click to open) ──────────────────────────────────────────────
function DetailPanel({ member, onClose }: { member: Profile | null; onClose: () => void }) {
  const pal = member ? getPalette(member) : ROLE_PALETTE.default
  const visible = !!member

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(2,5,14,0.85)', backdropFilter: 'blur(8px)',
        opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 0.3s ease',
      }} />

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 101,
        width: 'min(520px, 100vw)',
        background: 'rgba(4,8,16,0.98)',
        borderLeft: `1px solid ${pal.primary}33`,
        transform: visible ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {member && (
          <>
            {/* Photo half */}
            <div style={{ position: 'relative', height: '45%', flexShrink: 0, overflow: 'hidden' }}>
              {member.photo_url ? (
                <img src={member.photo_url} alt={member.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', filter: 'brightness(0.55) saturate(0.9)' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${pal.dim}, rgba(4,8,16,0.98))`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72, fontWeight: 900, color: pal.primary }}>{getInitials(member.full_name)}</div>
              )}

              {/* Ghost name watermark */}
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 'clamp(32px, 8vw, 72px)', fontWeight: 900, color: 'rgba(255,255,255,0.04)',
                letterSpacing: '-0.04em', textTransform: 'uppercase', lineHeight: 1, textAlign: 'center', padding: '0 16px',
                userSelect: 'none', pointerEvents: 'none',
              }}>
                {member.full_name}
              </div>

              {/* Bottom fade */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to top, rgba(4,8,16,0.98), transparent)' }} />

              {/* Close button */}
              <button onClick={onClose} style={{
                position: 'absolute', top: 16, right: 16,
                width: 36, height: 36, borderRadius: 8,
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                color: 'white', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'monospace', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
              >✕</button>

              {/* HUD corners on photo */}
              <Corners color={pal.primary + '88'} />
            </div>

            {/* Info half */}
            <div style={{ flex: 1, overflow: 'auto', padding: '28px 32px 36px' }}>
              {/* Label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 6, height: 6, borderRadius: 1, background: pal.primary }} />
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: pal.primary, letterSpacing: '0.22em', textTransform: 'uppercase' }}>
                  {getDept(member.oc_position)}
                </span>
              </div>

              {/* Name */}
              <h2 style={{ color: 'white', fontWeight: 900, fontSize: 'clamp(28px,5vw,44px)', lineHeight: 0.95, letterSpacing: '-0.03em', margin: '0 0 22px', textTransform: 'uppercase' }}>
                {member.full_name}
              </h2>

              {/* Role box */}
              <div style={{
                background: pal.dim, border: `1px solid ${pal.primary}33`,
                borderRadius: 6, padding: '14px 18px', marginBottom: 24,
              }}>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.18em', marginBottom: 6 }}>[ OPERATIONAL ROLE ]</div>
                <div style={{ color: 'white', fontWeight: 800, fontSize: 18, letterSpacing: '-0.01em', textTransform: 'uppercase' }}>
                  {fmtRole(member.oc_position, member.role)}
                </div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: pal.primary, letterSpacing: '0.14em', marginTop: 4, textTransform: 'uppercase' }}>
                  {member.role === 'executive' ? 'Executive Committee' : 'Organizing Committee'}
                </div>
              </div>

              {/* Bio */}
              {member.bio && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10 }}>ROLE SNAPSHOT</div>
                  <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 1.75 }}>{member.bio}</p>
                </div>
              )}

              {/* Links */}
              {(member.github_url || member.linkedin_url) && (
                <div style={{ display: 'flex', gap: 10 }}>
                  {member.github_url && (
                    <a href={member.github_url} target="_blank" rel="noopener noreferrer" style={{
                      display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 8,
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 500, textDecoration: 'none',
                      transition: 'all 0.2s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'white' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                      GitHub
                    </a>
                  )}
                  {member.linkedin_url && (
                    <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" style={{
                      display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 8,
                      background: `${pal.dim}`, border: `1px solid ${pal.primary}33`,
                      color: pal.primary, fontSize: 12, fontWeight: 500, textDecoration: 'none',
                      transition: 'all 0.2s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = pal.glow.replace('0.3', '0.15') }}
                      onMouseLeave={e => { e.currentTarget.style.background = pal.dim }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                      LinkedIn
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Bottom accent bar */}
            <div style={{ height: 3, background: `linear-gradient(90deg, ${pal.primary}, ${pal.primary}00)`, flexShrink: 0 }} />
          </>
        )}
      </div>
    </>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function Team() {
  const [members, setMembers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState<Profile | null>(null)

  useEffect(() => {
    supabase.from('profiles').select('*').eq('is_active', true).order('role', { ascending: false })
      .then(({ data }) => { setMembers(data || []); setLoading(false) })
  }, [])

  const leadership = members.filter(m => m.role === 'executive' || m.oc_position?.toLowerCase().includes('president'))
  const ocMembers  = members.filter(m => !leadership.includes(m) && (m.role === 'oc' || m.role === 'executive'))
  const filteredOC = ocMembers.filter(m => filter === 'All' || getDept(m.oc_position) === filter)

  return (
    <div style={{ background: '#040810', minHeight: '100vh', paddingTop: 64, fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes scanline {
          0%   { top: 0; opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes dotPing {
          0%   { transform: scale(1);   opacity: 1; }
          80%  { transform: scale(2.5); opacity: 0; }
          100% { transform: scale(1);   opacity: 0; }
        }
        @keyframes shimmerGrad {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes glitch {
          0%,95%,100% { clip-path: none; transform: none; }
          96%  { clip-path: inset(30% 0 40% 0); transform: translateX(-4px); }
          97%  { clip-path: inset(60% 0 10% 0); transform: translateX(4px); }
          98%  { clip-path: inset(10% 0 70% 0); transform: translateX(-2px); }
        }

        .gradient-text {
          background: linear-gradient(90deg, #00D4FF 0%, #7B5CFF 50%, #FF2D9B 100%);
          background-size: 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmerGrad 5s linear infinite;
        }
        .glitch-text { animation: glitch 6s ease infinite; }

        .wrap { max-width: 1280px; margin: 0 auto; padding: 0 32px; }

        /* Filter pills */
        .filter-pill {
          padding: 8px 20px; border-radius: 100px; font-size: 11px; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer;
          border: 1px solid rgba(255,255,255,0.08); background: transparent;
          color: rgba(255,255,255,0.4); font-family: inherit;
          transition: all 0.2s ease;
        }
        .filter-pill:hover { border-color: rgba(255,255,255,0.2); color: rgba(255,255,255,0.75); }
        .filter-pill.active { background: #00D4FF; border-color: #00D4FF; color: #040810; font-weight: 700; box-shadow: 0 4px 18px rgba(0,212,255,0.3); }

        /* Section divider */
        .section-rule {
          display: flex; align-items: center; gap: 20; margin-bottom: 36px;
        }

        @media(max-width:900px) {
          .leader-grid { grid-template-columns: repeat(2,1fr) !important; }
          .member-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media(max-width:540px) {
          .leader-grid { grid-template-columns: 1fr !important; }
          .member-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── HERO ────────────────────────────────────────── */}
      <section style={{ position: 'relative', minHeight: '55vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '80px 32px 60px' }}>
        <HeroCanvas />
        {/* Dot grid */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at 50% 60%, black 20%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 60%, black 20%, transparent 75%)',
        }} />

        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: 780 }}>
          {/* Eyebrow */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 24, opacity: 0, animation: 'shimmerGrad 0s 0.1s forwards' }}
            ref={el => { if (el) setTimeout(() => { el.style.opacity = '1'; el.style.transition = 'opacity 0.5s' }, 100) }}>
            <div style={{ position: 'relative', width: 8, height: 8 }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#00D4FF', opacity: 0.7, animation: 'dotPing 2s ease infinite' }} />
              <div style={{ position: 'relative', width: 8, height: 8, borderRadius: '50%', background: '#00D4FF' }} />
            </div>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: '#00D4FF', letterSpacing: '0.22em', textTransform: 'uppercase' }}>Our Team</span>
          </div>

          <h1 className="glitch-text" style={{ fontSize: 'clamp(44px,8vw,88px)', fontWeight: 900, lineHeight: 0.88, letterSpacing: '-0.04em', margin: '0 0 24px', color: 'white', userSelect: 'none' }}>
            MEET THE<br /><span className="gradient-text">ARCHITECTS</span>
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 15, lineHeight: 1.75, maxWidth: 540, margin: '0 auto' }}>
            A collective of engineers, designers and visionaries pushing the boundaries of technology at Samriddhi College.
          </p>
        </div>
      </section>

      {/* ── FILTERS ─────────────────────────────────── */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap',
        padding: '24px 32px 52px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(4,8,16,0.5)',
      }}>
        {DEPARTMENTS.map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`filter-pill${filter === f ? ' active' : ''}`}>{f}</button>
        ))}
      </div>

      <div className="wrap">

        {/* ── LEADERSHIP ──────────────────────────────── */}
        <section style={{ marginBottom: 72 }}>
          <Reveal>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 3, height: 22, background: '#00D4FF', borderRadius: 2 }} />
                <h2 style={{ color: 'white', fontWeight: 800, fontSize: 18, letterSpacing: '-0.01em', margin: 0 }}>Core Leadership</h2>
              </div>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(0,212,255,0.2), transparent)' }} />
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: 'rgba(0,212,255,0.55)', letterSpacing: '0.12em' }}>
                {loading ? '—' : `${leadership.length} MEMBERS`}
              </span>
            </div>
          </Reveal>

          {loading ? (
            <div className="leader-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ aspectRatio: '3/4', borderRadius: 4, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease infinite' }} />
              ))}
            </div>
          ) : leadership.length > 0 ? (
            <div className="leader-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
              {leadership.map((m, i) => (
                <MemberCard key={m.id} member={m} delay={i * 0.07} onClick={() => setSelected(m)} />
              ))}
            </div>
          ) : (
            <div style={{ padding: '48px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.06)', borderRadius: 8 }}>
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>Leadership coming soon</p>
            </div>
          )}
        </section>

        {/* ── DEPARTMENT TEAMS ────────────────────────── */}
        <section style={{ marginBottom: 72 }}>
          <Reveal>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 3, height: 22, background: '#7B5CFF', borderRadius: 2 }} />
                <h2 style={{ color: 'white', fontWeight: 800, fontSize: 18, letterSpacing: '-0.01em', margin: 0 }}>
                  {filter === 'All' ? 'Department Teams' : `${filter} Team`}
                </h2>
              </div>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(123,92,255,0.2), transparent)' }} />
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: 'rgba(123,92,255,0.55)', letterSpacing: '0.12em' }}>
                {loading ? '—' : `${filteredOC.length} MEMBERS`}
              </span>
            </div>
          </Reveal>

          {loading ? (
            <div className="member-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} style={{ aspectRatio: '2/3', borderRadius: 4, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', animation: 'pulse 1.5s ease infinite' }} />
              ))}
            </div>
          ) : filteredOC.length > 0 ? (
            <div className="member-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
              {filteredOC.map((m, i) => (
                <MemberCard key={m.id} member={m} delay={i * 0.05} onClick={() => setSelected(m)} />
              ))}
            </div>
          ) : (
            <div style={{ padding: '56px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.06)', borderRadius: 8 }}>
              <p style={{ color: 'rgba(255,255,255,0.22)', fontSize: 13 }}>No members in this category</p>
            </div>
          )}
        </section>

        {/* ── JOIN CTA ────────────────────────────────── */}
        <Reveal>
          <div style={{
            position: 'relative', overflow: 'hidden',
            background: 'radial-gradient(ellipse at 20% 50%, rgba(0,212,255,0.05), transparent 55%), rgba(255,255,255,0.018)',
            border: '1px solid rgba(0,212,255,0.12)', borderRadius: 8,
            padding: '56px 48px', textAlign: 'center', marginBottom: 80,
          }}>
            <Corners color="rgba(0,212,255,0.3)" />
            <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(0,212,255,0.06)', filter: 'blur(50px)', pointerEvents: 'none' }} />

            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: '#00D4FF', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 16, opacity: 0.7 }}>
              [ OPEN POSITIONS ]
            </div>
            <h2 style={{ color: 'white', fontWeight: 900, fontSize: 'clamp(24px, 4vw, 40px)', lineHeight: 1.1, letterSpacing: '-0.025em', margin: '0 0 14px' }}>
              Ready to Build<br />
              <span className="gradient-text">The Future?</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.36)', fontSize: 14, lineHeight: 1.72, maxWidth: 420, margin: '0 auto 32px' }}>
              We're always looking for passionate builders. Whether you code, design, or organize — there's a seat for you here.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/apply" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 28px', borderRadius: 100,
                background: '#00D4FF', color: '#040810',
                fontSize: 13, fontWeight: 700, letterSpacing: '0.03em', textDecoration: 'none',
                transition: 'all 0.25s', boxShadow: '0 6px 22px rgba(0,212,255,0.25)',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#33DDFF'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#00D4FF'; e.currentTarget.style.transform = 'none' }}
              >
                Join the Team →
              </Link>
              <Link to="/resources" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '11px 28px', borderRadius: 100,
                background: 'transparent', color: 'rgba(255,255,255,0.6)',
                fontSize: 13, fontWeight: 500, textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.25s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'; e.currentTarget.style.color = 'white' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
              >
                Explore Roles
              </Link>
            </div>
          </div>
        </Reveal>

      </div>

      {/* ── Detail Slide Panel ───────────────────────────── */}
      <DetailPanel member={selected} onClose={() => setSelected(null)} />
    </div>
  )
}