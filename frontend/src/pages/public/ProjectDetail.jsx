import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../utils/supabase'

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProject() {
      setLoading(true)
      const { data, error } = await supabase
        .from('projects')
        .select('*, profiles!added_by(full_name, photo_url)')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching project:', error)
        navigate('/projects')
      } else {
        setProject(data)
      }
      setLoading(false)
    }
    fetchProject()
  }, [id, navigate])

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(0,212,255,0.1)', borderTopColor: 'var(--cyan)', animation: 'spin 1s linear infinite' }}/>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  if (!project) return null

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: 80, paddingBottom: 100 }}>
      <div className="container mx-auto px-6">
        
        {/* ── Breadcrumb ────────────────────────────── */}
        <Link to="/projects" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none', marginBottom: 32, transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--cyan)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to Projects
        </Link>

        {/* ── Main Grid ──────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '7fr 4fr', gap: 48, alignItems: 'start' }}>
          
          {/* Left: Banner + Content */}
          <div>
            <div style={{ borderRadius: 20, overflow: 'hidden', background: 'linear-gradient(135deg, #0D1829, #142040)', border: '1px solid var(--border)', marginBottom: 40, aspectRatio: '16/9' }}>
              {project.banner_url ? (
                <img src={project.banner_url} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="rgba(0,212,255,0.15)" strokeWidth="1"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                </div>
              )}
            </div>

            <div style={{ marginBottom: 48 }}>
              <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 'clamp(32px, 5vw, 44px)', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.01em', marginBottom: 24 }}>{project.title}</h1>
              
              <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.8 }}>
                {project.description}
              </div>
            </div>
          </div>

          {/* Right: Sidebar Info */}
          <div style={{ position: 'sticky', top: 100 }}>
            
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '32px' }}>
              
              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                {project.demo_url && (
                  <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ width: '100%', textAlign: 'center', py: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    Live Demo
                  </a>
                )}
                {project.github_url && (
                  <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="btn-outline" style={{ width: '100%', textAlign: 'center', py: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                    View Repository
                  </a>
                )}
              </div>

              {/* Tech Stack */}
              <div style={{ marginBottom: 32 }}>
                <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Tech Stack</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {project.tech_stack?.map(t => (
                    <span key={t} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: '#fff' }}>{t}</span>
                  ))}
                </div>
              </div>

              {/* Author */}
              <div style={{ paddingTop: 24, borderTop: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Project Lead</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, var(--cyan), #0066FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff', border: '2px solid rgba(0,212,255,0.2)' }}>
                    {project.profiles?.photo_url 
                      ? <img src={project.profiles.photo_url} alt={project.profiles.full_name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}/>
                      : project.profiles?.full_name?.[0] || 'A'
                    }
                  </div>
                  <div>
                    <p style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{project.profiles?.full_name || 'Innovator'}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Samriddhi IT Club</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Stats / Metadata */}
            <div style={{ marginTop: 24, padding: '0 12px', display: 'flex', justifyContent: 'space-between' }}>
               <div style={{ textAlign: 'center' }}>
                 <p style={{ color: 'var(--text-muted)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Published</p>
                 <p style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
               </div>
               <div style={{ textAlign: 'center' }}>
                 <p style={{ color: 'var(--text-muted)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Status</p>
                 <p style={{ color: 'var(--cyan)', fontSize: 13, fontWeight: 600 }}>Completed</p>
               </div>
               <div style={{ textAlign: 'center' }}>
                 <p style={{ color: 'var(--text-muted)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Category</p>
                 <p style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>Web Dev</p>
               </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}