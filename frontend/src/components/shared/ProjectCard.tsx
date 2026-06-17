import { Link } from 'react-router-dom'

export default function ProjectCard({ project }: { project: any }) {
  return (
    <Link to={`/projects/${project.id}`} className="no-underline block h-full group" style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      <div 
        className="transition-all duration-300 group-hover:border-[#00D4FF]/25 group-hover:-translate-y-1"
        style={{
          backgroundColor: '#0D1829',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          overflow: 'hidden',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ height: '180px', background: 'linear-gradient(135deg, #0D1829 0%, #142040 100%)', position: 'relative', overflow: 'hidden' }}>
          {project.banner_url
            ? <img src={project.banner_url} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '12px', backgroundColor: 'rgba(0, 212, 255, 0.1)', border: '1px solid rgba(0, 212, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="1.5"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
              </div>
            </div>
          }
          {project.is_featured && (
            <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
              <span style={{ fontSize: '10px', fontWeight: 600, padding: '4px 10px', borderRadius: '100px', backgroundColor: 'rgba(255, 45, 155, 0.1)', color: '#FF2D9B', border: '1px solid rgba(255, 45, 155, 0.25)' }}>Featured</span>
            </div>
          )}
        </div>
        <div 
          style={{
            padding: '20px',
            paddingBottom: '20px',
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            boxSizing: 'border-box',
          }}
        >
          <h3 style={{ color: '#ffffff', fontSize: '16px', fontWeight: 'bold', margin: '0 0 8px 0', fontFamily: "'Inter', -apple-system, sans-serif" }}>{project.title}</h3>
          <p style={{ color: '#94A3B8', fontSize: '13px', lineHeight: '1.6', margin: '0 0 16px 0', fontFamily: "'Inter', -apple-system, sans-serif" }}>{project.description?.slice(0, 90)}...</p>
          
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {project.tech_stack?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {project.tech_stack.slice(0, 4).map((t: string) => (
                  <span key={t} style={{ fontSize: '10px', padding: '4px 8px', borderRadius: '4px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#94A3B8', fontFamily: "'Inter', -apple-system, sans-serif" }}>{t}</span>
                ))}
              </div>
            )}
            {(project.github_url || project.demo_url) && (
              <div style={{ display: 'flex', gap: '16px', marginTop: project.tech_stack?.length > 0 ? '4px' : '0' }}>
                {project.github_url && (
                  <a href={project.github_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="hover:text-white transition-colors" style={{ color: '#00D4FF', fontSize: '12px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>
                    GitHub
                  </a>
                )}
                {project.demo_url && (
                  <a href={project.demo_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="hover:text-white transition-colors" style={{ color: '#FF2D9B', fontSize: '12px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                    Live Demo
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

