import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../utils/supabase'
import ProjectCard from '../../components/shared/ProjectCard'

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true)
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) console.error('Error fetching projects:', error)
      else setProjects(data || [])
      setLoading(false)
    }
    fetchProjects()
  }, [])

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                          p.description?.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || p.tech_stack?.some(t => t.toLowerCase() === filter.toLowerCase())
    return matchesSearch && matchesFilter
  })

  // Get unique tags for filter
  const allTags = Array.from(new Set(projects.flatMap(p => p.tech_stack || [])))

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: 80, paddingBottom: 80 }}>
      <div className="container mx-auto px-6">
        
        {/* ── Header ─────────────────────────────────── */}
        <div style={{ marginBottom: 48 }}>
          <p style={{ color: 'var(--cyan)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Our Works</p>
          <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: 16 }}>PROJECTS</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, maxWidth: 600 }}>
            Explore the innovative solutions and creative projects built by the members of Samriddhi IT Club. From web apps to AI models, we're building the future, one commit at a time.
          </p>
        </div>

        {/* ── Filter Bar ─────────────────────────────── */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 32, alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <button 
              onClick={() => setFilter('all')}
              style={{ padding: '8px 16px', borderRadius: 8, background: filter === 'all' ? 'var(--cyan)' : 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: filter === 'all' ? '#0A0E1A' : 'var(--text-muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
            >All Projects</button>
            {allTags.slice(0, 6).map(tag => (
              <button 
                key={tag}
                onClick={() => setFilter(tag)}
                style={{ padding: '8px 16px', borderRadius: 8, background: filter === tag ? 'var(--cyan)' : 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: filter === tag ? '#0A0E1A' : 'var(--text-muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
              >{tag}</button>
            ))}
          </div>

          <div style={{ position: 'relative', minWidth: 280 }}>
            <input 
              type="text" 
              placeholder="Search projects..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 16px 10px 40px', color: '#fff', fontSize: 14, outline: 'none', transition: 'border-color 0.2s' }}
              onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.4)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
        </div>

        {/* ── Content ────────────────────────────────── */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', height: 320 }}>
                <div style={{ height: 180, background: 'rgba(255,255,255,0.03)' }}/>
                <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ height: 12, borderRadius: 4, background: 'rgba(255,255,255,0.05)', width: '60%' }}/>
                  <div style={{ height: 10, borderRadius: 4, background: 'rgba(255,255,255,0.03)', width: '80%' }}/>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div style={{ padding: '80px 24px', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(0,212,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            </div>
            <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No projects found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Try adjusting your search or filter to find what you're looking for.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {filteredProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}

        {/* ── CTA ────────────────────────────────────── */}
        {!loading && projects.length > 0 && (
          <div style={{ marginTop: 80, background: 'linear-gradient(135deg, rgba(0,212,255,0.04), rgba(255,45,155,0.04))', border: '1px solid rgba(0,212,255,0.1)', borderRadius: 20, padding: '48px', textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 28, fontWeight: 800, color: '#fff', textTransform: 'uppercase', marginBottom: 12 }}>Have a project in mind?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 500, margin: '0 auto 28px' }}>
              We're always looking for new ideas and collaborations. If you have a project you'd like to build with us, let's talk.
            </p>
            <Link to="/join" className="btn-primary" style={{ padding: '12px 32px' }}>Suggest a Project</Link>
          </div>
        )}

      </div>
    </div>
  )
}