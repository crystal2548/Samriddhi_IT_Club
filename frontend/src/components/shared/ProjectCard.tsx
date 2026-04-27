import { Link } from 'react-router-dom'

export default function ProjectCard({ project }: { project: any }) {
  return (
    <Link to={`/projects/${project.id}`} className="no-underline block h-full group">
      <div className="bg-[#0D1829] border border-white/10 rounded-xl overflow-hidden h-full flex flex-col transition-all duration-300 group-hover:border-[#00D4FF]/25 group-hover:-translate-y-1">
        <div className="h-[180px] bg-gradient-to-br from-[#0D1829] to-[#142040] relative overflow-hidden">
          {project.banner_url
            ? <img src={project.banner_url} alt={project.title} className="w-full h-full object-cover"/>
            : <div className="w-full h-full flex items-center justify-center">
                <div className="w-14 h-14 rounded-xl bg-[#00D4FF]/10 border border-[#00D4FF]/20 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="1.5"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                </div>
              </div>
          }
          {project.is_featured && (
            <div className="absolute top-3 right-3">
              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#FF2D9B]/10 text-[#FF2D9B] border border-[#FF2D9B]/25">Featured</span>
            </div>
          )}
        </div>
        <div className="p-5 pb-6 flex-1 flex flex-col">
          <h3 className="text-white text-[15px] font-bold mb-2">{project.title}</h3>
          <p className="text-gray-400 text-[12px] leading-[1.6] mb-4 flex-1">{project.description?.slice(0, 90)}...</p>
          {project.tech_stack?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {project.tech_stack.slice(0, 4).map((t: string) => (
                <span key={t} className="text-[10px] px-2 py-1 rounded bg-white/5 border border-white/10 text-gray-400">{t}</span>
              ))}
            </div>
          )}
          <div className="flex gap-4">
            {project.github_url && (
              <a href={project.github_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-[#00D4FF] text-[12px] font-medium flex items-center gap-1 hover:text-white transition-colors">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                GitHub
              </a>
            )}
            {project.demo_url && (
              <a href={project.demo_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-[#FF2D9B] text-[12px] font-medium flex items-center gap-1 hover:text-white transition-colors">
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
