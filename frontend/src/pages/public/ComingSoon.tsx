import { Link, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function ComingSoon() {
  const [searchParams] = useSearchParams()
  const title = searchParams.get('title') || 'Learning Path'
  const [dots, setDots] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.')
    }, 500)
    return () => clearInterval(interval)
  }, [])

  const features = [
    { icon: '📚', label: 'Curated Resources', desc: 'Hand-picked articles, videos & docs' },
    { icon: '🛠️', label: 'Hands-on Projects', desc: 'Build real things from day one' },
    { icon: '🗺️', label: 'Structured Roadmap', desc: 'Step-by-step progression path' },
    { icon: '🤝', label: 'Peer Support', desc: 'Learn alongside club members' },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      position: 'relative',
      overflow: 'hidden',
      padding: '100px 24px 80px',
    }}>

      {/* ── Background blobs ── */}
      <div style={{ position: 'absolute', top: '10%', left: '5%', width: 400, height: 400, background: 'var(--cyan)', filter: 'blur(180px)', opacity: 0.07, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 400, height: 400, background: 'var(--pink)', filter: 'blur(180px)', opacity: 0.07, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 700, background: '#A78BFA', filter: 'blur(260px)', opacity: 0.04, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.015) 0px, transparent 1px, transparent 2px)', pointerEvents: 'none' }} />

      {/* ── Main card ── */}
      <div style={{
        position: 'relative', zIndex: 10,
        width: '100%', maxWidth: 660,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 24,
        padding: '52px 48px',
        backdropFilter: 'blur(20px)',
        textAlign: 'center',
      }}>

        {/* Rocket icon */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 28 }}>
          <div style={{
            width: 96, height: 96, borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(0,212,255,0.12), rgba(255,45,155,0.12))',
            border: '1px solid rgba(0,212,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'csFloat 3s ease-in-out infinite',
          }}>
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
              <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
              <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
              <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
            </svg>
          </div>
          <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', border: '1px solid rgba(0,212,255,0.1)', animation: 'csPulse 2s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', inset: -18, borderRadius: '50%', border: '1px solid rgba(0,212,255,0.05)', animation: 'csPulse 2s ease-in-out infinite 0.5s' }} />
        </div>

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '5px 14px', borderRadius: 20, marginBottom: 20,
          background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--cyan)', animation: 'csBlink 1.5s ease-in-out infinite', flexShrink: 0 }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Under Construction</span>
        </div>

        {/* Title */}
        <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 'clamp(40px, 8vw, 60px)', fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 1, margin: '0 0 10px' }}>
          Coming Soon
        </h1>
        <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 'clamp(20px, 4vw, 30px)', fontWeight: 700, background: 'linear-gradient(90deg, var(--cyan), var(--pink))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textTransform: 'uppercase', margin: '0 0 20px' }}>
          {title}{dots}
        </h2>
        <div style={{ width: 56, height: 3, background: 'linear-gradient(90deg, var(--cyan), var(--pink))', borderRadius: 2, margin: '0 auto 24px' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: 15, maxWidth: 420, margin: '0 auto 36px', lineHeight: 1.75 }}>
          Our team is curating this learning path. When it's ready, here's what you'll get:
        </p>

        {/* What's coming grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 28, textAlign: 'left' }}>
          {features.map((f, i) => (
            <div key={i}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', transition: 'border-color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(0,212,255,0.2)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
            >
              <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }}>{f.icon}</span>
              <div>
                <p style={{ color: '#fff', fontSize: 13, fontWeight: 700, margin: '0 0 3px' }}>{f.label}</p>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: 0, lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Notify callout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderRadius: 12, marginBottom: 36, background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.15)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: 0, lineHeight: 1.5, textAlign: 'left' }}>
            Keep an eye on the <span style={{ color: '#A78BFA', fontWeight: 600 }}>Resources Hub</span> — we'll announce it there when it goes live.
          </p>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/resources"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--cyan)', color: '#0A0E1A', padding: '12px 28px', borderRadius: 10, textDecoration: 'none', fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to Resources
          </Link>
          <Link to="/"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: 'var(--text-muted)', padding: '12px 28px', borderRadius: 10, border: '1px solid var(--border)', textDecoration: 'none', fontWeight: 600, fontSize: 13, transition: 'all 0.2s', whiteSpace: 'nowrap' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.3)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            Return Home
          </Link>
        </div>

      </div>

      <style>{`
        @keyframes csFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes csPulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.3; transform: scale(1.1); } }
        @keyframes csBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }
      `}</style>
    </div>
  )
}