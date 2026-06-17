import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../utils/supabase'
import { formatDateShort } from '../../utils/formatters'
import { useSiteSettings } from '../../context/SiteContext'

const HERO_WORDS = ['INNOVATE.', 'CREATE.', 'COMPETE.', 'CONNECT.']

export default function Home() {
  const [wordIndex, setWordIndex] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [deleting, setDeleting] = useState(false)
  const typingRef = useRef<NodeJS.Timeout | null>(null)
  const { settings } = useSiteSettings()

  const { data: homeData, isLoading: loading } = useQuery({
    queryKey: ['home_data'],
    queryFn: async () => {
      const [eventsRes, projectsRes, postsRes, sponsorsRes] = await Promise.all([
        supabase.from('events').select('*').eq('is_featured', true).order('event_date', { ascending: true }).limit(3),
        supabase.from('projects').select('*').eq('is_featured', true).order('created_at', { ascending: false }).limit(3),
        supabase.from('blog_posts').select('id, title, slug, category, cover_image_url, read_time_mins, published_at, profiles(full_name)').eq('status', 'published').order('published_at', { ascending: false }).limit(3),
        supabase.from('sponsors').select('*').eq('is_active', true).order('tier'),
      ])
      return {
        events: eventsRes.data || [],
        projects: projectsRes.data || [],
        posts: postsRes.data || [],
        sponsors: sponsorsRes.data || []
      }
    }
  })

  const { events = [], projects = [], posts = [] } = homeData || {}

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
    return () => { if (typingRef.current) clearTimeout(typingRef.current) }
  }, [displayed, deleting, wordIndex])

  return (
    <div style={{ background: '#040810', paddingTop: '64px', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');

        * { box-sizing: border-box; }

        @keyframes floatA {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes floatB {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-14px); }
        }
        @keyframes spinSlow {
          from { transform: rotateY(0deg) rotateX(15deg); }
          to { transform: rotateY(360deg) rotateX(15deg); }
        }
        @keyframes spinSlowReverse {
          from { transform: rotateY(360deg) rotateX(-10deg); }
          to { transform: rotateY(0deg) rotateX(-10deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes dash-move {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: -200; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes borderPulse {
          0%, 100% { border-color: rgba(0, 212, 255, 0.2); }
          50% { border-color: rgba(0, 212, 255, 0.5); }
        }
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        .hero-word {
          background: linear-gradient(135deg, #00D4FF 0%, #7B5CFF 50%, #FF2D9B 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }

        .typing-cursor {
          display: inline-block;
          width: 4px;
          border-radius: 2px;
          background: #00D4FF;
          margin-left: 6px;
          vertical-align: middle;
          animation: cursorBlink 0.8s ease infinite;
        }

        .fade-up-1 { animation: fadeUp 0.7s ease forwards; opacity: 0; }
        .fade-up-2 { animation: fadeUp 0.7s 0.15s ease forwards; opacity: 0; }
        .fade-up-3 { animation: fadeUp 0.7s 0.3s ease forwards; opacity: 0; }
        .fade-up-4 { animation: fadeUp 0.7s 0.45s ease forwards; opacity: 0; }
        .fade-up-5 { animation: fadeUp 0.7s 0.6s ease forwards; opacity: 0; }

        .stat-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 24px 28px;
          display: flex;
          align-items: center;
          gap: 18px;
          transition: all 0.3s ease;
          cursor: default;
        }
        .stat-card:hover {
          background: rgba(0, 212, 255, 0.05);
          border-color: rgba(0, 212, 255, 0.25);
          transform: translateY(-2px);
        }

        .icon-box {
          width: 48px; height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          border-radius: 100px;
          background: #00D4FF;
          color: #040810;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.03em;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 8px 28px rgba(0, 212, 255, 0.25);
        }
        .btn-primary:hover {
          background: #33DDFF;
          transform: translateY(-2px);
          box-shadow: 0 12px 36px rgba(0, 212, 255, 0.4);
        }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 13px 28px;
          border-radius: 100px;
          background: transparent;
          color: rgba(255,255,255,0.8);
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.03em;
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.12);
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-secondary:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.25);
          color: white;
        }

        .social-icon {
          width: 40px; height: 40px;
          border-radius: 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.5);
          transition: all 0.2s ease;
          text-decoration: none;
        }
        .social-icon:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.2);
          color: white;
          transform: translateY(-1px);
        }

        .float-card {
          background: rgba(8, 12, 25, 0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px;
          padding: 14px 18px;
          display: flex;
          align-items: center;
          gap: 14px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04);
          width: 190px;
          position: absolute;
          z-index: 20;
        }
        .float-card-icon {
          width: 42px; height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .card-base {
          background: rgba(10, 16, 32, 0.9);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.35s ease;
          height: 100%;
          display: flex;
          flex-direction: column;
          text-decoration: none;
        }
        .card-base:hover {
          border-color: rgba(0, 212, 255, 0.3);
          transform: translateY(-6px);
          box-shadow: 0 20px 50px rgba(0, 212, 255, 0.08);
        }

        .section-eyebrow {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #00D4FF;
          margin-bottom: 8px;
        }
        .section-title {
          font-size: clamp(26px, 3.5vw, 36px);
          font-weight: 800;
          color: white;
          letter-spacing: -0.01em;
          margin: 0;
        }

        .grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        @media (max-width: 900px) {
          .grid-3 { grid-template-columns: 1fr; }
          .hero-flex { flex-direction: column !important; }
          .hero-visual { width: 100% !important; height: 400px !important; margin-top: 40px; }
          .hero-text { width: 100% !important; }
          .stats-bar-inner { flex-wrap: wrap; gap: 20px !important; }
          .float-left { left: -5% !important; }
          .float-topright { right: -5% !important; }
          .float-bottomright { right: 0% !important; }
        }

        .grid-card-img {
          width: 100%;
          height: 200px;
          object-fit: cover;
          display: block;
        }
        .grid-card-img-placeholder {
          width: 100%;
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(10,16,32,1) 0%, rgba(20,32,64,1) 100%);
        }

        .tag {
          display: inline-block;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 100px;
        }

        .divider { width: 1px; height: 48px; background: rgba(255,255,255,0.06); flex-shrink: 0; }

        .orbit-ring {
          position: absolute;
          top: 50%; left: 50%;
          border-radius: 50%;
          border: 1px solid rgba(0,212,255,0.12);
          transform-style: preserve-3d;
        }
        
        .cta-section {
          background: radial-gradient(ellipse at 30% 50%, rgba(0,212,255,0.06) 0%, transparent 60%),
                      radial-gradient(ellipse at 70% 50%, rgba(255,45,155,0.05) 0%, transparent 60%),
                      rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 24px;
          padding: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 40px;
          flex-wrap: wrap;
        }

        .avatar-stack {
          display: flex;
          align-items: center;
          position: relative;
          padding: 10px;
        }
        .avatar-stack::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(0,212,255,0.15) 0%, transparent 70%);
          filter: blur(20px);
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
        }
        .avatar-stack:hover::before { opacity: 1; }

        .avatar {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: -12px;
          position: relative;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 10px 30px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.05);
          cursor: pointer;
        }
        .avatar:first-child { margin-left: 0; }
        .avatar-stack:hover .avatar {
          margin-left: 10px;
          transform: translateY(-5px) scale(1.1);
          border-color: rgba(0,212,255,0.4);
        }

        .avatar-count {
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(8px);
          color: #00D4FF;
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          border-color: rgba(0,212,255,0.2);
          z-index: 0;
          animation: pulse-border 2s infinite;
        }

        @keyframes pulse-border {
          0%, 100% { border-color: rgba(0,212,255,0.2); box-shadow: 0 0 0 0 rgba(0,212,255,0); }
          50% { border-color: rgba(0,212,255,0.5); box-shadow: 0 0 15px rgba(0,212,255,0.2); }
        }

        .dynamic-text {
          font-size: 12px;
          font-weight: 600;
          color: rgba(255,255,255,0.4);
          letter-spacing: 0.05em;
          margin-top: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10B981;
          position: relative;
        }
        .live-dot::after {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 50%;
          border: 1px solid #10B981;
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes ping {
          75%, 100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>

      {/* ── HERO ──────────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 80% 20%, rgba(0,212,255,0.08) 0%, transparent 50%), radial-gradient(ellipse at 10% 80%, rgba(255,45,155,0.06) 0%, transparent 50%), #040810',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        paddingTop: '80px',
        paddingBottom: '60px',
      }}>
        {/* Dot grid background */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
        }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', position: 'relative', zIndex: 10, width: '100%' }}>
          <div className="hero-flex" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '48px' }}>

            {/* LEFT: Text */}
            <div className="hero-text" style={{ width: '48%', zIndex: 20 }}>
              {/* Eyebrow pill */}
              <div className="fade-up-1" style={{ marginBottom: 32 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  background: 'rgba(0,212,255,0.06)',
                  border: '1px solid rgba(0,212,255,0.18)',
                  borderRadius: 100, padding: '8px 18px',
                  fontSize: 10, fontWeight: 700, color: '#00D4FF',
                  letterSpacing: '0.2em', textTransform: 'uppercase',
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00D4FF', boxShadow: '0 0 8px #00D4FF', display: 'inline-block' }} />
                  The Future Is Ours To Build
                </span>
              </div>

              {/* Main heading with typing word in the middle */}
              <div className="fade-up-2">
                <h1 style={{ fontSize: 'clamp(56px, 7vw, 96px)', fontWeight: 900, lineHeight: 0.9, letterSpacing: '-0.04em', margin: '0 0 32px 0', userSelect: 'none' }}>
                  {/* Line 1: static */}
                  <span style={{ display: 'block', color: 'white' }}>CODE.</span>
                  {/* Line 2: typing animation — same size, cyan gradient */}
                  <span style={{
                    display: 'block',
                    background: 'linear-gradient(90deg, #00D4FF, #7B5CFF)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    minHeight: '1.05em',
                  }}>
                    {displayed}
                    <span className="typing-cursor" style={{ height: '0.75em', width: 5, WebkitTextFillColor: 'initial', background: '#00D4FF' }} />
                  </span>
                  {/* Line 3: static */}
                  <span style={{ display: 'block', color: 'rgba(255,255,255,0.85)' }}>CONNECT.</span>
                </h1>
              </div>

              {/* Subtitle */}
              <div className="fade-up-3" style={{ marginBottom: 36 }}>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, lineHeight: 1.7, maxWidth: 440, margin: 0, fontWeight: 400 }}>
                  Samriddhi IT Club is a community of passionate innovators, developers and leaders building tomorrow's technology together.
                </p>
              </div>

              {/* Buttons */}
              <div className="fade-up-4" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 44, alignItems: 'center' }}>
                <Link to="/apply" className="btn-primary">
                  Join the Club <span style={{ fontSize: 16 }}>→</span>
                </Link>
                <Link to="/projects" className="btn-secondary">
                  Explore Projects <span style={{ color: 'rgba(255,255,255,0.4)' }}>↗</span>
                </Link>
              </div>

              {/* Socials */}
              <div className="fade-up-5" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginRight: 4 }}>Follow</span>
                <a href="#" className="social-icon" aria-label="Instagram">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
                <a href="#" className="social-icon" aria-label="LinkedIn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                </a>
                <a href="#" className="social-icon" aria-label="GitHub">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                </a>
                <a href="#" className="social-icon" aria-label="Discord">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/></svg>
                </a>
              </div>
            </div>

            {/* RIGHT: Visual */}
            <HeroVisual settings={settings} />
          </div>

          {/* Stats bar */}
          <div style={{ marginTop: 72, position: 'relative', zIndex: 20 }}>
            <div className="stats-bar-inner" style={{
              background: 'rgba(255,255,255,0.025)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 24,
              padding: '28px 40px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 0,
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '60%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.3), transparent)' }} />

              {[
                { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, value: settings.stat_members || '100+', label: 'Active Members', color: '#00D4FF' },
                { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="1.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>, value: settings.stat_alumni || '600+', label: 'Alumni Network', color: '#00D4FF' },
                { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, value: settings.stat_events || '15+', label: 'Annual Events', color: '#00D4FF' },
                { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF2D9B" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, value: settings.stat_partners || '12+', label: 'Industry Partners', color: '#FF2D9B' },
              ].map((stat, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: i < 3 ? undefined : undefined, flex: 1 }}>
                  {i > 0 && <div className="divider" style={{ marginRight: 32 }} />}
                  <div className="stat-card" style={{ flex: 1, border: 'none', background: 'transparent', padding: '0 16px' }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: `rgba(${stat.color === '#FF2D9B' ? '255,45,155' : '0,212,255'},0.08)`,
                      border: `1px solid rgba(${stat.color === '#FF2D9B' ? '255,45,155' : '0,212,255'},0.15)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {stat.icon}
                    </div>
                    <div>
                      <div style={{ color: 'white', fontSize: 22, fontWeight: 900, lineHeight: 1.1, marginBottom: 4 }}>{stat.value}</div>
                      <div style={{ color: stat.color, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{stat.label}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── UPCOMING EVENTS ───────────────────────────────── */}
      <section style={{ padding: '80px 0', background: '#06090F' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
          <SectionHeader eyebrow="Curated for you" title="Featured Events" linkTo="/events" linkLabel="View All Events" />
          {loading ? <CardsSkeleton /> : events.length === 0
            ? <EmptyState message="No featured events right now." sub="Check back soon or follow us on Instagram." />
            : <div className="grid-3">{events.map((e: any) => <EventCard key={e.id} event={e} />)}</div>
          }
        </div>
      </section>

      {/* ── FEATURED PROJECTS ─────────────────────────────── */}
      <section style={{ padding: '80px 0', background: '#040810', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
          <SectionHeader eyebrow="Our Innovations" title="Featured Projects" linkTo="/projects" linkLabel="View All Projects" />
          {loading ? <CardsSkeleton /> : projects.length === 0
            ? <EmptyState message="No featured projects yet." sub="Projects will appear here once added by the team." />
            : <div className="grid-3">{projects.map((p: any) => <ProjectCard key={p.id} project={p} />)}</div>
          }
        </div>
      </section>

      {/* ── BLOG POSTS ────────────────────────────────────── */}
      <section style={{ padding: '80px 0', background: '#06090F', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
          <SectionHeader eyebrow="Knowledge Base" title="Latest from Blog" linkTo="/blog" linkLabel="Read All Stories" />
          {loading ? <CardsSkeleton /> : posts.length === 0
            ? <EmptyState message="No blog posts yet." sub="Articles will appear here once published." />
            : <div className="grid-3">{posts.map((p: any) => <BlogCard key={p.id} post={p} />)}</div>
          }
        </div>
      </section>

      {/* ── JOIN CTA ──────────────────────────────────────── */}
      <section style={{ padding: '80px 0', background: '#040810', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
          <div className="cta-section">
            <div style={{ maxWidth: 520 }}>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: 'white', lineHeight: 1.1, letterSpacing: '-0.02em', margin: '0 0 16px 0' }}>
                Ready to shape the{' '}
                <span style={{ background: 'linear-gradient(135deg, #00D4FF, #7B5CFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  digital frontier?
                </span>
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, lineHeight: 1.7, margin: '0 0 28px 0' }}>
                Join {settings.stat_members || '120+'} active innovators already onboard. Get access to workshops, hackathons, industry connections, and real project experience.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link to="/apply" className="btn-primary" style={{ borderRadius: 12 }}>
                  {settings.hero_cta_text || 'Join Now'}
                </Link>
                <Link to="/events" className="btn-secondary" style={{ borderRadius: 12 }}>
                  Browse Events
                </Link>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="avatar-stack">
                {[
                  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>, glow: '#00D4FF' },
                  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF2D9B" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>, glow: '#FF2D9B' },
                  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7B5CFF" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>, glow: '#7B5CFF' },
                  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00FFCC" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/></svg>, glow: '#00FFCC' },
                  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>, glow: '#F59E0B' },
                ].map((av, i) => (
                  <div key={i} className="avatar" style={{
                    zIndex: 10 - i,
                    boxShadow: `0 10px 30px rgba(0,0,0,0.3), 0 0 20px ${av.glow}15`
                  }}>
                    {av.icon}
                  </div>
                ))}
                <div className="avatar avatar-count" style={{ borderRadius: 14 }}>
                  <span style={{ fontSize: 13, fontWeight: 800 }}>+{parseInt(settings.stat_members || '120') - 5}</span>
                </div>
              </div>
              <div className="dynamic-text">
                <span className="live-dot" />
                Join {settings.stat_members || '120+'} innovators worldwide
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// ── Animated Hero Visual ──────────────────────────────────────────────────────
function HeroVisual({ settings }: { settings: any }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let W = canvas.offsetWidth, H = canvas.offsetHeight
    canvas.width = W * window.devicePixelRatio
    canvas.height = H * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const cx = W / 2, cy = H / 2

    // Particles
    const PARTICLE_COUNT = 55
    type Particle = { x: number; y: number; vx: number; vy: number; r: number; alpha: number; color: string }
    const colors = ['#00D4FF', '#7B5CFF', '#FF2D9B', '#00FFCC']
    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.5 + 0.4,
      alpha: Math.random() * 0.5 + 0.15,
      color: colors[Math.floor(Math.random() * colors.length)],
    }))

    // Orbiting dots on rings
    type OrbDot = { ring: number; angle: number; speed: number; size: number; color: string; trailLen: number; trail: {x:number,y:number}[] }
    const RINGS = [
      { r: 115, color: '#00D4FF', opacity: 0.18, dash: false, speed: 0.0006 },
      { r: 162, color: '#7B5CFF', opacity: 0.1,  dash: true,  speed: -0.0004 },
      { r: 205, color: '#00D4FF', opacity: 0.06, dash: false, speed: 0.0003 },
    ]
    const orbDots: OrbDot[] = [
      { ring: 0, angle: 0,       speed: 0.012,  size: 4, color: '#00D4FF', trailLen: 18, trail: [] },
      { ring: 0, angle: Math.PI, speed: 0.012,  size: 3, color: '#00FFCC', trailLen: 12, trail: [] },
      { ring: 1, angle: 1,       speed: -0.008, size: 4, color: '#7B5CFF', trailLen: 20, trail: [] },
      { ring: 1, angle: 3.5,     speed: -0.008, size: 3, color: '#FF2D9B', trailLen: 14, trail: [] },
      { ring: 2, angle: 2,       speed: 0.005,  size: 3.5, color: '#00D4FF', trailLen: 10, trail: [] },
    ]

    // Core pulse
    let pulseT = 0

    let t = 0
    function draw() {
      ctx.clearRect(0, 0, W, H)
      t++
      pulseT += 0.025

      // — Background radial glow —
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 260)
      grad.addColorStop(0, 'rgba(0,180,200,0.09)')
      grad.addColorStop(0.5, 'rgba(0,80,140,0.04)')
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, H)

      // — Floating particles + connections —
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.color.replace(')', `,${p.alpha})`).replace('rgb', 'rgba').replace('#', 'rgba(').replace('rgba(00', 'rgba(0,0,')
        // simpler: just draw with globalAlpha
        ctx.globalAlpha = p.alpha
        ctx.fillStyle = p.color
        ctx.fill()
        ctx.globalAlpha = 1
      }
      // Connect nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx*dx + dy*dy)
          if (dist < 80) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = '#00D4FF'
            ctx.globalAlpha = (1 - dist / 80) * 0.12
            ctx.lineWidth = 0.5
            ctx.stroke()
            ctx.globalAlpha = 1
          }
        }
      }

      // — Rings —
      for (const ring of RINGS) {
        ctx.beginPath()
        ctx.arc(cx, cy, ring.r, 0, Math.PI * 2)
        ctx.strokeStyle = ring.color
        ctx.globalAlpha = ring.opacity
        ctx.lineWidth = 1
        if (ring.dash) ctx.setLineDash([6, 10])
        else ctx.setLineDash([])
        ctx.stroke()
        ctx.setLineDash([])
        ctx.globalAlpha = 1
      }

      // — Orbiting dots with trails —
      for (const dot of orbDots) {
        dot.angle += dot.speed
        const rr = RINGS[dot.ring].r
        const dx = cx + Math.cos(dot.angle) * rr
        const dy = cy + Math.sin(dot.angle) * rr
        dot.trail.push({ x: dx, y: dy })
        if (dot.trail.length > dot.trailLen) dot.trail.shift()
        // Draw trail
        for (let i = 0; i < dot.trail.length - 1; i++) {
          const prog = i / dot.trail.length
          ctx.beginPath()
          ctx.moveTo(dot.trail[i].x, dot.trail[i].y)
          ctx.lineTo(dot.trail[i+1].x, dot.trail[i+1].y)
          ctx.strokeStyle = dot.color
          ctx.globalAlpha = prog * 0.55
          ctx.lineWidth = dot.size * 0.6 * prog
          ctx.stroke()
          ctx.globalAlpha = 1
        }
        // Draw dot + glow
        const glowG = ctx.createRadialGradient(dx, dy, 0, dx, dy, dot.size * 4)
        glowG.addColorStop(0, dot.color + 'AA')
        glowG.addColorStop(1, dot.color + '00')
        ctx.beginPath(); ctx.arc(dx, dy, dot.size * 4, 0, Math.PI * 2)
        ctx.fillStyle = glowG; ctx.fill()
        ctx.beginPath(); ctx.arc(dx, dy, dot.size, 0, Math.PI * 2)
        ctx.fillStyle = dot.color; ctx.fill()
      }

      // — Connector lines to card positions (approx) —
      const cardTargets = [
        { tx: 55,      ty: cy,    color: '#FF2D9B' },  // left card
        { tx: W - 30,  ty: 80,    color: '#00D4FF' },  // top-right card
        { tx: W - 30,  ty: H - 85, color: '#7B5CFF' }, // bottom-right card
      ]
      for (const ct of cardTargets) {
        const lineGrad = ctx.createLinearGradient(cx, cy, ct.tx, ct.ty)
        lineGrad.addColorStop(0, ct.color + '44')
        lineGrad.addColorStop(1, ct.color + '00')
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        // Slight curve via quadratic
        const midX = (cx + ct.tx) / 2 + (Math.random() * 2 - 1)
        const midY = (cy + ct.ty) / 2 + (Math.random() * 2 - 1)
        ctx.quadraticCurveTo(midX, midY, ct.tx, ct.ty)
        ctx.strokeStyle = lineGrad
        ctx.globalAlpha = 0.45
        ctx.lineWidth = 1
        ctx.setLineDash([5, 8])
        ctx.stroke()
        ctx.setLineDash([])
        ctx.globalAlpha = 1
      }

      // — Core sphere glow (pulsing) —
      const pulseScale = 1 + Math.sin(pulseT) * 0.04
      const coreR = 88 * pulseScale
      const coreGlow = ctx.createRadialGradient(cx - 18, cy - 18, 0, cx, cy, coreR * 2.2)
      coreGlow.addColorStop(0, 'rgba(0,212,255,0.18)')
      coreGlow.addColorStop(0.4, 'rgba(0,150,200,0.06)')
      coreGlow.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.beginPath(); ctx.arc(cx, cy, coreR * 2.2, 0, Math.PI*2)
      ctx.fillStyle = coreGlow; ctx.fill()

      // Outer ring of sphere
      ctx.beginPath(); ctx.arc(cx, cy, coreR, 0, Math.PI*2)
      ctx.strokeStyle = `rgba(0,212,255,${0.22 + Math.sin(pulseT) * 0.08})`
      ctx.lineWidth = 1.5; ctx.stroke()
      // Inner ring
      ctx.beginPath(); ctx.arc(cx, cy, coreR - 10, 0, Math.PI*2)
      ctx.strokeStyle = 'rgba(0,212,255,0.07)'
      ctx.lineWidth = 1; ctx.stroke()
      // Fill sphere (solid black to match the logo image background and hide the rectangle boundary)
      ctx.beginPath(); ctx.arc(cx, cy, coreR - 1, 0, Math.PI*2)
      ctx.fillStyle = '#000000'
      ctx.fill()

      rafRef.current = requestAnimationFrame(draw)
    }

    draw()

    const onResize = () => {
      W = canvas.offsetWidth; H = canvas.offsetHeight
      canvas.width = W * window.devicePixelRatio
      canvas.height = H * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <div className="hero-visual" style={{
      width: '48%', height: '560px',
      position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Canvas — full area, behind everything */}
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1, borderRadius: 16 }} />

      {/* Logo centered over sphere */}
      <div style={{
        position: 'absolute', zIndex: 10,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        width: 130, height: 130,
        pointerEvents: 'none',
      }}>
        {settings.logo_url ? (
          <img src={settings.logo_url} alt="Club Logo" style={{ width: '90%', height: '90%', objectFit: 'contain', filter: 'invert(1) hue-rotate(180deg) brightness(1.5)', mixBlendMode: 'screen' }} />
        ) : (
          <>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="1.2" style={{ marginBottom: 7, filter: 'drop-shadow(0 0 12px rgba(0,212,255,0.9))' }}>
              <circle cx="5" cy="7" r="2.2" fill="#04080E" stroke="#00D4FF" />
              <circle cx="19" cy="7" r="2.2" fill="#04080E" stroke="#00D4FF" />
              <circle cx="12" cy="3" r="1.8" fill="#04080E" stroke="#00D4FF" />
              <circle cx="12" cy="13" r="2.8" fill="#04080E" stroke="#00D4FF" />
              <circle cx="12" cy="21" r="1.8" fill="#04080E" stroke="#00D4FF" />
              <path d="M12 19V15.8" strokeLinecap="round"/><path d="M12 10.2V4.8" strokeLinecap="round"/>
              <path d="M9.5 11 L6.8 8.8" strokeLinecap="round"/><path d="M14.5 11 L17.2 8.8" strokeLinecap="round"/>
            </svg>
            <div style={{ color: 'white', fontSize: 10, fontWeight: 900, letterSpacing: '0.14em' }}>SAMRIDDHI</div>
            <div style={{ color: '#00D4FF', fontSize: 7.5, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', marginTop: 2, filter: 'drop-shadow(0 0 6px rgba(0,212,255,0.8))' }}>IT CLUB</div>
          </>
        )}
      </div>

      {/* Floating stat cards — positioned around the canvas */}

      {/* LEFT: Projects */}
      <div className="float-card float-left" style={{
        top: '50%', left: '-4%',
        transform: 'translateY(-50%)',
        animation: 'floatA 4s ease-in-out infinite',
        zIndex: 20,
      }}>
        <div className="float-card-icon" style={{ background: 'rgba(180,30,80,0.2)', border: '1px solid rgba(255,45,155,0.25)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF2D9B" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
        </div>
        <div>
          <div style={{ color: 'white', fontSize: 24, fontWeight: 900, lineHeight: 1, marginBottom: 5 }}>{settings.stat_projects || '15+'}</div>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Projects</div>
        </div>
      </div>

      {/* TOP RIGHT: Members */}
      <div className="float-card float-topright" style={{
        top: '5%', right: '-4%',
        animation: 'floatB 5s ease-in-out infinite 0.8s',
        zIndex: 20,
      }}>
        <div className="float-card-icon" style={{ background: 'rgba(0,70,110,0.35)', border: '1px solid rgba(0,212,255,0.22)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <div>
          <div style={{ color: 'white', fontSize: 24, fontWeight: 900, lineHeight: 1, marginBottom: 5 }}>{settings.stat_members || '100+'}</div>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Members</div>
        </div>
      </div>

      {/* BOTTOM RIGHT: Events */}
      <div className="float-card float-bottomright" style={{
        bottom: '5%', right: '-4%',
        animation: 'floatA 4.5s ease-in-out infinite 1.5s',
        zIndex: 20,
      }}>
        <div className="float-card-icon" style={{ background: 'rgba(50,30,120,0.3)', border: '1px solid rgba(123,92,255,0.25)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7B5CFF" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
        <div>
          <div style={{ color: 'white', fontSize: 24, fontWeight: 900, lineHeight: 1, marginBottom: 5 }}>{settings.stat_events || '15+'}</div>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Events/Year</div>
        </div>
      </div>
    </div>
  )
}

function SectionHeader({ eyebrow, title, linkTo, linkLabel }: { eyebrow: string, title: string, linkTo: string, linkLabel: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
      <div>
        <p className="section-eyebrow">{eyebrow}</p>
        <h2 className="section-title">{title}</h2>
      </div>
      <Link to={linkTo} style={{ color: '#00D4FF', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', transition: 'color 0.2s' }}>
        {linkLabel}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </Link>
    </div>
  )
}

function EventCard({ event }: { event: any }) {
  const typeColor: Record<string, string> = { hackathon: '#00D4FF', workshop: '#FF2D9B', seminar: '#00BFA5', bootcamp: '#7B5CFF', social: '#F59E0B', fest: '#FF2D9B' }
  const statusMap: Record<string, { label: string, bg: string, color: string }> = {
    upcoming:  { label: 'Upcoming',  bg: 'rgba(16,185,129,0.1)', color: '#10B981' },
    ongoing:   { label: 'Live Now', bg: 'rgba(245,158,11,0.1)', color: '#F59E0B' },
    completed: { label: 'Completed', bg: 'rgba(100,100,120,0.1)', color: '#9CA3AF' },
  }
  const st = statusMap[event.status] || statusMap.upcoming
  const color = typeColor[event.type] || '#00D4FF'

  return (
    <Link to={`/events/${event.id}`} className="card-base" style={{ textDecoration: 'none' }}>
      <div style={{ height: 220, position: 'relative', overflow: 'hidden', background: '#06090F', flexShrink: 0 }}>
        {event.banner_url && (
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${event.banner_url})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(20px)', opacity: 0.35, transform: 'scale(1.1)' }} />
        )}
        {event.banner_url
          ? <img src={event.banner_url} alt={event.title} style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', objectFit: 'contain', padding: 8 }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(0,212,255,0.1)" strokeWidth="1"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
        }
        <div style={{ position: 'absolute', top: 14, right: 14, zIndex: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 700, padding: '5px 12px', borderRadius: 100, background: st.bg, color: st.color, letterSpacing: '0.05em' }}>{st.label}</span>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${color}40, transparent)` }} />
      </div>

      <div style={{ padding: '24px 24px 28px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color, marginBottom: 10, display: 'block' }}>{event.type}</span>
        <h3 style={{ color: 'white', fontSize: 17, fontWeight: 700, lineHeight: 1.3, margin: '0 0 12px' }}>{event.title}</h3>
        {event.description && <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, lineHeight: 1.65, marginBottom: 20, flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{event.description}</p>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {event.event_date && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: 500 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              {formatDateShort(event.event_date)} · {new Date(event.event_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
          {event.location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: 500 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FF2D9B" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              {event.location}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: 500 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={st.color} strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            Status: <span style={{ color: st.color, fontWeight: 700 }}>{st.label}</span>
          </div>
        </div>

        <button style={{
          width: '100%', padding: '12px', borderRadius: 12,
          background: `rgba(${color === '#00D4FF' ? '0,212,255' : color === '#FF2D9B' ? '255,45,155' : '123,92,255'},0.08)`,
          border: `1px solid rgba(${color === '#00D4FF' ? '0,212,255' : color === '#FF2D9B' ? '255,45,155' : '123,92,255'},0.2)`,
          color, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
          transition: 'all 0.2s', fontFamily: 'inherit',
        }}>
          Explore Event →
        </button>
      </div>
    </Link>
  )
}

function ProjectCard({ project }: { project: any }) {
  return (
    <Link to={`/projects/${project.id}`} className="card-base" style={{ textDecoration: 'none' }}>
      <div style={{ height: 180, position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #06090F, #0D1829)', flexShrink: 0 }}>
        {project.banner_url
          ? <img src={project.banner_url} alt={project.title} className="grid-card-img" />
          : <div className="grid-card-img-placeholder">
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="1.5"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
              </div>
            </div>
        }
        {project.is_featured && (
          <div style={{ position: 'absolute', top: 12, right: 12 }}>
            <span style={{ fontSize: 10, fontWeight: 600, padding: '4px 10px', borderRadius: 100, background: 'rgba(255,45,155,0.1)', color: '#FF2D9B', border: '1px solid rgba(255,45,155,0.2)' }}>Featured</span>
          </div>
        )}
      </div>
      <div style={{ padding: '20px 20px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{ color: 'white', fontSize: 15, fontWeight: 700, margin: '0 0 8px' }}>{project.title}</h3>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, lineHeight: 1.6, margin: '0 0 16px', flex: 1 }}>{project.description?.slice(0, 90)}...</p>
        {project.tech_stack?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {project.tech_stack.slice(0, 4).map((t: string) => (
              <span key={t} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>{t}</span>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 16 }}>
          {project.github_url && (
            <a href={project.github_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ color: '#00D4FF', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
              GitHub
            </a>
          )}
          {project.demo_url && (
            <a href={project.demo_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ color: '#FF2D9B', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              Live Demo
            </a>
          )}
        </div>
      </div>
    </Link>
  )
}

function BlogCard({ post }: { post: any }) {
  const catMeta: Record<string, { color: string, bg: string }> = {
    development: { color: '#00D4FF', bg: 'rgba(0,212,255,0.1)' },
    'ai-ml': { color: '#FF2D9B', bg: 'rgba(255,45,155,0.1)' },
    career: { color: '#7B5CFF', bg: 'rgba(123,92,255,0.1)' },
    'club-news': { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  }
  const meta = catMeta[post.category] || catMeta.development

  return (
    <Link to={`/blog/${post.slug}`} className="card-base" style={{ textDecoration: 'none' }}>
      <div style={{ height: 180, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
        {post.cover_image_url
          ? <img src={post.cover_image_url} alt={post.title} className="grid-card-img" />
          : <div className="grid-card-img-placeholder" style={{ color: 'rgba(0,212,255,0.08)', fontSize: 64 }}>✦</div>
        }
      </div>
      <div style={{ padding: '20px 20px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {post.category && (
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 100, background: meta.bg, color: meta.color, display: 'inline-block', width: 'fit-content', marginBottom: 12 }}>
            {post.category.replace('-', '/')}
          </span>
        )}
        <h3 style={{ color: 'white', fontSize: 15, fontWeight: 700, lineHeight: 1.4, margin: '0 0 16px', flex: 1 }}>{post.title}</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #00D4FF, #0055FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white', flexShrink: 0 }}>
              {post.profiles?.full_name?.[0] || 'A'}
            </div>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{post.profiles?.full_name || 'Author'}</span>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, fontFamily: "'Space Mono', monospace" }}>{post.read_time_mins} min</span>
        </div>
      </div>
    </Link>
  )
}

function EmptyState({ message, sub }: { message: string, sub: string }) {
  return (
    <div style={{ borderRadius: 16, padding: '64px 32px', border: '1px dashed rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: 500, margin: '0 0 6px' }}>{message}</p>
      <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, margin: 0 }}>{sub}</p>
    </div>
  )
}

function CardsSkeleton() {
  return (
    <div className="grid-3">
      {[1,2,3].map(i => (
        <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, overflow: 'hidden', animation: 'pulse 1.5s ease-in-out infinite' }}>
          <div style={{ height: 180, background: 'rgba(255,255,255,0.03)' }} />
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ height: 10, borderRadius: 6, background: 'rgba(255,255,255,0.04)', width: '40%' }} />
            <div style={{ height: 14, borderRadius: 6, background: 'rgba(255,255,255,0.03)', width: '80%' }} />
            <div style={{ height: 10, borderRadius: 6, background: 'rgba(255,255,255,0.02)', width: '60%' }} />
          </div>
        </div>
      ))}
    </div>
  )
}