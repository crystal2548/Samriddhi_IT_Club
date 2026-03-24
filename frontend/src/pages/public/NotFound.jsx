import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background Decor */}
      <div style={{ position: 'absolute', top: '10%', left: '5%', width: 300, height: 300, background: 'var(--pink)', filter: 'blur(150px)', opacity: 0.1, pointerEvents: 'none' }}/>
      <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 300, height: 300, background: 'var(--cyan)', filter: 'blur(150px)', opacity: 0.1, pointerEvents: 'none' }}/>

      <div style={{ textAlign: 'center', zIndex: 10 }}>
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 20 }}>
          <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 'clamp(120px, 20vw, 200px)', fontWeight: 900, color: 'transparent', WebkitTextStroke: '1px rgba(255,255,255,0.1)', lineHeight: 0.9 }}>
            404
          </h1>
          <h1 style={{ position: 'absolute', inset: 0, fontFamily: 'Barlow Condensed, sans-serif', fontSize: 'clamp(120px, 20vw, 200px)', fontWeight: 900, color: 'var(--cyan)', lineHeight: 0.9, clipPath: 'inset(45% 0 0 0)', opacity: 0.8 }}>
            404
          </h1>
          <div style={{ position: 'absolute', top: '48%', left: '50%', transform: 'translateX(-50%)', width: '120%', height: 2, background: 'var(--pink)', boxShadow: '0 0 20px var(--pink)' }}/>
        </div>

        <h2 style={{ color: '#fff', fontSize: 24, fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Data Missing from Node</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 16, maxWidth: 400, margin: '0 auto 40px', lineHeight: 1.6 }}>
          The requested resource was not found on this server. It may have been relocated or purged from the database.
        </p>

        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'var(--cyan)', color: '#0A0E1A', padding: '14px 32px', borderRadius: 10, textDecoration: 'none', fontWeight: 800, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'all 0.2s' }}
           onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
           onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Return Home
        </Link>
      </div>

      {/* Retro lines */}
      <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, transparent 1px, transparent 2px)', pointerEvents: 'none' }}/>
    </div>
  )
}