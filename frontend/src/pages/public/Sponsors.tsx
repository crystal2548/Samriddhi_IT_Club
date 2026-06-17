import React, { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../utils/supabase'
import type { Sponsor } from '../../types/index'

type SponsorTier = 'gold' | 'silver' | 'bronze' | 'partner'

const TIER_META: Record<SponsorTier, { label: string; color: string; bg: string; border: string; icon: React.ReactNode; order: number }> = {
  gold: {
    label: 'Gold Sponsors', color: '#F59E0B', bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.18)', order: 0,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  },
  silver: {
    label: 'Silver Sponsors', color: '#94A3B8', bg: 'rgba(148,163,184,0.06)', border: 'rgba(148,163,184,0.18)', order: 1,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5"><path d="M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14z" /><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" /></svg>,
  },
  bronze: {
    label: 'Bronze Sponsors', color: '#CD7C2F', bg: 'rgba(205,124,47,0.06)', border: 'rgba(205,124,47,0.18)', order: 2,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CD7C2F" strokeWidth="1.5"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>,
  },
  partner: {
    label: 'Partners', color: '#00D4FF', bg: 'rgba(0,212,255,0.06)', border: 'rgba(0,212,255,0.18)', order: 3,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="1.5"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 7.65l.78.77L12 20.64l7.64-7.64.78-.77a5.4 5.4 0 0 0 0-7.65z" /></svg>,
  },
}

// Reveal-on-scroll hook
function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
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

// ── Sponsor Card ──────────────────────────────────────────────────────────────
function SponsorCard({ sponsor, tierColor, delay }: { sponsor: Sponsor; tierColor: string; delay: number }) {
  const [hovered, setHovered] = useState(false)

  return (
    <Reveal delay={delay}>
      <a
        href={sponsor.website_url || '#'}
        target={sponsor.website_url ? '_blank' : undefined}
        rel="noopener noreferrer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'block', textDecoration: 'none',
          background: hovered ? `radial-gradient(circle at 50% 0%, ${tierColor}08 0%, rgba(255,255,255,0.02) 70%)` : 'rgba(255,255,255,0.02)',
          border: `1px solid ${hovered ? `${tierColor}40` : 'rgba(255,255,255,0.07)'}`,
          borderRadius: 20, padding: '36px 28px',
          transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
          transform: hovered ? 'translateY(-8px)' : 'none',
          boxShadow: hovered ? `0 25px 50px -12px ${tierColor}15` : 'none',
          cursor: sponsor.website_url ? 'pointer' : 'default',
          height: '100%',
        }}
      >
        {/* Logo */}
        <div style={{
          width: '100%', height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20, borderRadius: 14,
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
          overflow: 'hidden',
        }}>
          {sponsor.logo_url ? (
            <img src={sponsor.logo_url} alt={sponsor.name} style={{
              maxWidth: '80%', maxHeight: 60, objectFit: 'contain',
              filter: hovered ? 'grayscale(0) brightness(1.1)' : 'grayscale(0.3) brightness(0.9)',
              transition: 'filter 0.4s ease',
            }} />
          ) : (
            <span style={{ fontSize: 28, fontWeight: 900, color: `${tierColor}60`, letterSpacing: '-0.03em' }}>
              {sponsor.name.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>

        {/* Name */}
        <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 700, margin: '0 0 6px', textAlign: 'center', letterSpacing: '-0.01em' }}>
          {sponsor.name}
        </h3>

        {/* External link hint */}
        {sponsor.website_url && (
          <p style={{
            color: tierColor, fontSize: 11, fontWeight: 600, textAlign: 'center', margin: 0,
            opacity: hovered ? 1 : 0.5, transition: 'opacity 0.3s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
          }}>
            Visit Website
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17L17 7M17 7H7M17 7v10" /></svg>
          </p>
        )}
      </a>
    </Reveal>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Sponsors() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('sponsors').select('*').eq('is_active', true).order('tier')
      .then(({ data }) => {
        setSponsors((data ?? []) as Sponsor[])
        setLoading(false)
      })
  }, [])

  // Group by tier
  const grouped = sponsors.reduce<Record<SponsorTier, Sponsor[]>>((acc, s) => {
    const tier = (s.tier as SponsorTier) || 'partner'
    if (!acc[tier]) acc[tier] = []
    acc[tier].push(s)
    return acc
  }, { gold: [], silver: [], bronze: [], partner: [] })

  const orderedTiers = (Object.keys(TIER_META) as SponsorTier[])
    .filter(t => grouped[t]?.length > 0)
    .sort((a, b) => TIER_META[a].order - TIER_META[b].order)

  const totalSponsors = sponsors.length

  return (
    <div style={{ background: '#040810', minHeight: '100vh', paddingTop: 64, fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        .gradient-text { background: linear-gradient(90deg, #00D4FF 0%, #7B5CFF 50%, #FF2D9B 100%); background-size: 200%; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; animation: shimmerGrad 5s linear infinite; }
        @keyframes shimmerGrad { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes auroraFloat2 { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(5%, 8%) scale(1.08); } }
        @keyframes fadeUp2 { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .sp-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .sp-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .sp-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        @media(max-width: 1000px) { .sp-grid-4 { grid-template-columns: repeat(3, 1fr); } }
        @media(max-width: 768px) { .sp-grid-4, .sp-grid-3 { grid-template-columns: repeat(2, 1fr); } }
        @media(max-width: 500px) { .sp-grid-4, .sp-grid-3, .sp-grid-2 { grid-template-columns: 1fr; } }
      `}</style>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section style={{ position: 'relative', minHeight: '55vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 32px 80px', overflow: 'hidden' }}>
        {/* Background blobs */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '-15%', left: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)', filter: 'blur(100px)', animation: 'auroraFloat2 18s infinite alternate' }} />
          <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(255,45,155,0.06) 0%, transparent 70%)', filter: 'blur(100px)', animation: 'auroraFloat2 22s infinite alternate-reverse' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px', maskImage: 'radial-gradient(ellipse at 50% 50%, black 20%, transparent 80%)', WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, black 20%, transparent 80%)' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 800 }}>
          <div style={{ marginBottom: 24, opacity: 0, animation: 'fadeUp2 0.7s 0.2s ease forwards' }}>
            <span style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 100, padding: '8px 20px', fontSize: 10, fontWeight: 800, color: '#00D4FF', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              Our Supporters
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(40px, 7vw, 80px)', fontWeight: 900, lineHeight: 0.92, letterSpacing: '-0.04em', margin: '0 0 24px', color: 'white', opacity: 0, animation: 'fadeUp2 0.7s 0.35s ease forwards' }}>
            Powered by<br />
            <span className="gradient-text">Amazing Partners</span>
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 'clamp(14px, 1.8vw, 17px)', lineHeight: 1.7, maxWidth: 560, margin: '0 auto', opacity: 0, animation: 'fadeUp2 0.7s 0.5s ease forwards' }}>
            These organizations believe in our mission and help us deliver world-class experiences to our community of innovators.
          </p>

          {totalSponsors > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginTop: 48, opacity: 0, animation: 'fadeUp2 0.7s 0.65s ease forwards' }}>
              {[
                { val: String(totalSponsors), label: 'Total Partners' },
                { val: String(grouped.gold.length + grouped.silver.length), label: 'Premium Sponsors' },
                { val: String(orderedTiers.length), label: 'Tier Levels' },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 6 }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── SPONSOR TIERS ───────────────────────────────── */}
      <section style={{ padding: '40px 0 100px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 80 }}>
              <div style={{ width: 32, height: 32, border: '3px solid rgba(255,255,255,0.08)', borderTopColor: '#00D4FF', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Loading sponsors...</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : totalSponsors === 0 ? (
            <Reveal>
              <div style={{ textAlign: 'center', padding: '80px 32px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24 }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="1.5"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 7.65l.78.77L12 20.64l7.64-7.64.78-.77a5.4 5.4 0 0 0 0-7.65z" /></svg>
                </div>
                <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>Sponsors Coming Soon</h3>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, maxWidth: 400, margin: '0 auto' }}>
                  We're partnering with amazing organizations. Check back soon!
                </p>
              </div>
            </Reveal>
          ) : (
            orderedTiers.map((tier, tierIdx) => {
              const meta = TIER_META[tier]
              const items = grouped[tier]
              const gridClass = tier === 'gold' ? 'sp-grid-3' : 'sp-grid-4'

              return (
                <div key={tier} style={{ marginBottom: tierIdx < orderedTiers.length - 1 ? 64 : 0 }}>
                  {/* Tier header */}
                  <Reveal>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 14, background: meta.bg, border: `1px solid ${meta.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {meta.icon}
                      </div>
                      <div>
                        <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>{meta.label}</h2>
                        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, margin: 0 }}>{items.length} {items.length === 1 ? 'sponsor' : 'sponsors'}</p>
                      </div>
                      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${meta.border}, transparent)`, marginLeft: 8 }} />
                    </div>
                  </Reveal>

                  {/* Sponsor cards grid */}
                  <div className={gridClass}>
                    {items.map((s, i) => (
                      <SponsorCard key={s.id} sponsor={s} tierColor={meta.color} delay={i * 0.08} />
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </section>

      {/* ── BECOME A SPONSOR CTA ────────────────────────── */}
      <section style={{ padding: '0 32px 100px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Reveal>
            <div style={{
              position: 'relative', overflow: 'hidden',
              background: 'radial-gradient(ellipse at 20% 50%, rgba(0,212,255,0.06) 0%, transparent 55%), radial-gradient(ellipse at 80% 50%, rgba(255,45,155,0.04) 0%, transparent 55%), rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.07)', borderRadius: 28,
              padding: '64px 56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap',
            }}>
              <div style={{ position: 'absolute', top: -60, left: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(0,212,255,0.05)', filter: 'blur(50px)', pointerEvents: 'none' }} />

              <div style={{ maxWidth: 500, position: 'relative', zIndex: 1 }}>
                <h2 style={{ fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 800, color: 'white', lineHeight: 1.15, letterSpacing: '-0.025em', margin: '0 0 14px' }}>
                  Interested in{' '}
                  <span className="gradient-text">sponsoring us?</span>
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.36)', fontSize: 14, lineHeight: 1.72, margin: '0 0 28px' }}>
                  Partner with Samriddhi IT Club to reach a vibrant community of tech innovators, developers, and future industry leaders.
                </p>
                <Link to="/contact" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '14px 32px', borderRadius: 100,
                  background: '#00D4FF', color: '#040810',
                  fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em',
                  textDecoration: 'none', transition: 'all 0.3s',
                  boxShadow: '0 10px 30px rgba(0,212,255,0.2)',
                }}>
                  Get In Touch
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', zIndex: 1, minWidth: 280 }}>
                {[
                  {
                    icon: (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="6" />
                        <circle cx="12" cy="12" r="2" />
                      </svg>
                    ),
                    text: 'Brand visibility at all events'
                  },
                  {
                    icon: (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    ),
                    text: 'Access to top student talent'
                  },
                  {
                    icon: (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7B5CFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                        <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
                      </svg>
                    ),
                    text: 'Co-branded workshops & projects'
                  },
                  {
                    icon: (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF2D9B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <path d="M11 5L6 9H2v6h4l5 4V5z" />
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                      </svg>
                    ),
                    text: 'Featured on all digital channels'
                  },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    {item.icon}
                    <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: 500 }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
