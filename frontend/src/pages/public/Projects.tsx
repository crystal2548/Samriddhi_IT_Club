import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../utils/supabase'
import ProjectCard from '../../components/shared/ProjectCard'
import { useSiteSettings } from '../../context/SiteContext'

// ── Shared container ──────────────────────────────────────────────────────
function Container({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', boxSizing: 'border-box', width: '100%', ...style }}>
      {children}
    </div>
  )
}

export default function Projects() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const { settings } = useSiteSettings()

  const { data: projects = [], isLoading: loading } = useQuery({
    queryKey: ['public_projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    },
  })

  const filteredProjects = projects.filter((p: any) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
    const matchesFilter =
      filter === 'all' || p.tech_stack?.some((t: string) => t.toLowerCase() === filter.toLowerCase())
    return matchesSearch && matchesFilter
  })

  const allTags = Array.from(new Set(projects.flatMap((p: any) => p.tech_stack || []))) as string[]

  return (
    <>
      <style>{`
        .projects-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        @media (max-width: 1024px) { .projects-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px)  { .projects-grid { grid-template-columns: 1fr; } }

        .filter-pill-inactive:hover {
          color: rgba(255,255,255,0.65) !important;
          border-color: rgba(255,255,255,0.22) !important;
        }
        .search-input:focus { border-color: rgba(0,212,255,0.4) !important; outline: none; }
        .search-input::placeholder { color: rgba(255,255,255,0.2); }
        .cta-link:hover { background: #fff !important; }
      `}</style>

      <div style={{ background: '#0A0E1A', minHeight: '100vh', paddingTop: 0, fontFamily: "'Inter', -apple-system, sans-serif" }}>

        {/* ── Hero ──────────────────────────────────────────────────── */}
        <div style={{ paddingTop: 96, paddingBottom: 56, borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'linear-gradient(135deg, #0A0E1A 0%, #0D1829 100%)' }}>
          <Container>
            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 28, fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
              <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
              <span>›</span>
              <span style={{ color: '#00D4FF' }}>Projects</span>
            </div>

            <h1 style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 'clamp(48px, 7vw, 72px)',
              fontWeight: 900, color: '#fff',
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              lineHeight: 1, margin: '0 0 16px',
            }}>
              Projects
            </h1>

            <div style={{ width: 60, height: 3, background: 'linear-gradient(90deg, #00D4FF, #FF2D9B)', borderRadius: 2, marginBottom: 20 }} />

            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15, lineHeight: 1.7, maxWidth: 600, margin: 0 }}>
              Explore the innovative solutions and creative projects built by the members of {settings.club_name}. From web apps to AI models, we're building the future, one commit at a time.
            </p>
          </Container>
        </div>

        {/* ── Body ──────────────────────────────────────────────────── */}
        <div style={{ padding: '40px 0 80px' }}>
          <Container>

            {/* ── Filter Bar ──────────────────────────────────────── */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 32 }}>

              {/* Tag pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {(['all', ...allTags.slice(0, 6)] as string[]).map(tag => {
                  const active = filter === tag
                  return (
                    <button
                      key={tag}
                      className={!active ? 'filter-pill-inactive' : ''}
                      onClick={() => setFilter(tag)}
                      style={{
                        padding: '7px 16px', borderRadius: 100, fontSize: 12, fontWeight: 600,
                        cursor: 'pointer', border: '1px solid', transition: 'all 0.15s',
                        background:  active ? 'rgba(0,212,255,0.1)'      : 'rgba(255,255,255,0.04)',
                        color:       active ? '#00D4FF'                  : 'rgba(255,255,255,0.4)',
                        borderColor: active ? 'rgba(0,212,255,0.35)'     : 'rgba(255,255,255,0.1)',
                        boxShadow:   active ? '0 0 12px rgba(0,212,255,0.1)' : 'none',
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      {tag === 'all' ? 'All Projects' : tag}
                    </button>
                  )
                })}
              </div>

              {/* Search */}
              <div style={{ position: 'relative', minWidth: 240 }}>
                <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }}
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  className="search-input"
                  type="text"
                  placeholder="Search projects…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: '#0D1829', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 100, padding: '9px 16px 9px 38px',
                    color: '#fff', fontSize: 13, transition: 'border-color 0.2s',
                    fontFamily: "'Inter', sans-serif",
                  }}
                />
              </div>
            </div>

            {/* ── Grid / States ───────────────────────────────────── */}
            {loading ? (
              <div className="projects-grid">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} style={{ background: '#0D1829', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden', height: 320 }}>
                    <div style={{ height: 180, background: 'rgba(255,255,255,0.04)' }} />
                    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ height: 12, borderRadius: 4, background: 'rgba(255,255,255,0.05)', width: '60%' }} />
                      <div style={{ height: 10, borderRadius: 4, background: 'rgba(255,255,255,0.04)', width: '80%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProjects.length === 0 ? (
              <div style={{ padding: '80px 24px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 20 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(0,212,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="1.5">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                    <line x1="12" y1="22.08" x2="12" y2="12"/>
                  </svg>
                </div>
                <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No projects found</h3>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: 0 }}>
                  Try adjusting your search or filter to find what you're looking for.
                </p>
              </div>
            ) : (
              <div className="projects-grid">
                {filteredProjects.map((project: any) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}

            {/* ── CTA ─────────────────────────────────────────────── */}
            {!loading && projects.length > 0 && (
              <div style={{
                marginTop: 80,
                background: 'linear-gradient(135deg, rgba(0,212,255,0.05), rgba(255,45,155,0.05))',
                border: '1px solid rgba(0,212,255,0.1)',
                borderRadius: 20,
                padding: 'clamp(40px, 6vw, 60px) clamp(24px, 5vw, 48px)',
                textAlign: 'center',
              }}>
                <h2 style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 'clamp(24px, 3vw, 32px)',
                  fontWeight: 800, color: '#fff',
                  textTransform: 'uppercase',
                  letterSpacing: '-0.01em',
                  margin: '0 0 12px',
                }}>
                  Have a project in mind?
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, maxWidth: 500, margin: '0 auto 28px', lineHeight: 1.7 }}>
                  We're always looking for new ideas and collaborations. If you have a project you'd like to build with us, let's talk.
                </p>
                <Link
                  to="/join"
                  className="cta-link"
                  style={{
                    display: 'inline-block',
                    padding: '12px 32px',
                    borderRadius: 10,
                    background: '#00D4FF',
                    color: '#0A0E1A',
                    fontSize: 13,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    textDecoration: 'none',
                    transition: 'background 0.2s',
                    boxShadow: '0 0 20px rgba(0,212,255,0.15)',
                  }}
                >
                  Suggest a Project
                </Link>
              </div>
            )}
          </Container>
        </div>
      </div>
    </>
  )
}