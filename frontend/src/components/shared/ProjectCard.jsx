import { Link } from 'react-router-dom'

export default function ProjectCard({ project }) {
  return (
    <Link to={`/projects/${project.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', transition: 'border-color 0.2s, transform 0.2s' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.25)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
      >
        <div style={{ height: 180, background: 'linear-gradient(135deg, #0D1829, #142040)', position: 'relative', overflow: 'hidden' }}>
          {project.banner_url
            ? <img src={project.banner_url} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="1.5"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                </div>
              </div>
          }
          {project.is_featured && (
            <div style={{ position: 'absolute', top: 12, right: 12 }}>
              <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: 'rgba(255,45,155,0.12)', color: 'var(--pink)', border: '1px solid rgba(255,45,155,0.25)' }}>Featured</span>
            </div>
          )}
        </div>
        <div style={{ padding: '20px 20px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{project.title}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, lineHeight: 1.6, marginBottom: 16, flex: 1 }}>{project.description?.slice(0, 90)}...</p>
          {project.tech_stack?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
              {project.tech_stack.slice(0, 4).map(t => (
                <span key={t} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>{t}</span>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: 16 }}>
            {project.github_url && (
              <a href={project.github_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ color: 'var(--cyan)', fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                GitHub
              </a>
            )}
            {project.demo_url && (
              <a href={project.demo_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ color: 'var(--pink)', fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                Live Demo
              </a>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}