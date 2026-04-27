import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../utils/supabase'
import ProjectCard from '../../components/shared/ProjectCard'
import { useSiteSettings } from '../../context/SiteContext'

export default function Projects() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const { settings } = useSiteSettings()

  const { data: projects = [], isLoading: loading } = useQuery({
    queryKey: ['public_projects'],
    queryFn: async () => {
      const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    }
  })

  const filteredProjects = projects.filter((p: any) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                          p.description?.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || p.tech_stack?.some((t: string) => t.toLowerCase() === filter.toLowerCase())
    return matchesSearch && matchesFilter
  })

  // Get unique tags for filter
  const allTags = Array.from(new Set(projects.flatMap((p: any) => p.tech_stack || []))) as string[]

  return (
    <div className="bg-[#0A0E1A] min-h-screen pt-20 pb-20">
      <div className="container mx-auto px-6">
        
        {/* ── Header ─────────────────────────────────── */}
        <div className="mb-12">
          <p className="text-[#00D4FF] text-[11px] font-bold uppercase tracking-[0.1em] mb-2">Our Works</p>
          <h1 className="font-['Barlow_Condensed',sans-serif] text-[clamp(32px,5vw,48px)] font-extrabold text-white uppercase tracking-[0.02em] mb-4">PROJECTS</h1>
          <p className="text-gray-400 text-[14px] leading-[1.6] max-w-[600px]">
            Explore the innovative solutions and creative projects built by the members of {settings.club_name}. From web apps to AI models, we're building the future, one commit at a time.
          </p>
        </div>

        {/* ── Filter Bar ─────────────────────────────── */}
        <div className="flex flex-wrap gap-4 mb-8 items-center justify-between">
          <div className="flex flex-wrap gap-2.5">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-[13px] font-semibold cursor-pointer transition-all border ${
                filter === 'all' ? 'bg-[#00D4FF] border-[#00D4FF] text-[#0A0E1A] shadow-[0_0_15px_rgba(0,212,255,0.2)]' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white hover:border-[#00D4FF]/30 hover:bg-[#00D4FF]/5'
              }`}
            >All Projects</button>
            {allTags.slice(0, 6).map(tag => (
              <button 
                key={tag}
                onClick={() => setFilter(tag)}
                className={`px-4 py-2 rounded-lg text-[13px] font-semibold cursor-pointer transition-all border ${
                  filter === tag ? 'bg-[#00D4FF] border-[#00D4FF] text-[#0A0E1A] shadow-[0_0_15px_rgba(0,212,255,0.2)]' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white hover:border-[#00D4FF]/30 hover:bg-[#00D4FF]/5'
                }`}
              >{tag}</button>
            ))}
          </div>

          <div className="relative min-w-[280px]">
            <input 
              type="text" 
              placeholder="Search projects..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pr-4 pl-10 text-white text-[14px] outline-none transition-colors focus:border-[#00D4FF]/40"
            />
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
        </div>

        {/* ── Content ────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-[#0D1829] border border-white/10 rounded-xl overflow-hidden h-[320px] animate-pulse">
                <div className="h-[180px] bg-white/5"/>
                <div className="p-5 flex flex-col gap-3">
                  <div className="h-3 rounded bg-white/5 w-[60%]"/>
                  <div className="h-2.5 rounded bg-white/5 w-[80%]"/>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="py-20 px-6 text-center border border-dashed border-white/10 rounded-2xl">
            <div className="w-16 h-16 rounded-full bg-[#00D4FF]/10 flex items-center justify-center mx-auto mb-5">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            </div>
            <h3 className="text-white text-[18px] font-bold mb-2">No projects found</h3>
            <p className="text-gray-400 text-[14px]">Try adjusting your search or filter to find what you're looking for.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project: any) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}

        {/* ── CTA ────────────────────────────────────── */}
        {!loading && projects.length > 0 && (
          <div className="mt-20 bg-gradient-to-br from-[#00D4FF]/5 to-[#FF2D9B]/5 border border-[#00D4FF]/10 rounded-[20px] p-12 text-center">
            <h2 className="font-['Barlow_Condensed',sans-serif] text-[28px] font-extrabold text-white uppercase mb-3">Have a project in mind?</h2>
            <p className="text-gray-400 text-[14px] max-w-[500px] mx-auto mb-7 leading-relaxed">
              We're always looking for new ideas and collaborations. If you have a project you'd like to build with us, let's talk.
            </p>
            <Link to="/join" className="inline-block px-8 py-3 rounded-lg bg-[#00D4FF] text-[#0A0E1A] text-[13px] font-bold uppercase tracking-[0.05em] hover:bg-white transition-colors shadow-[0_0_15px_rgba(0,212,255,0.15)]">Suggest a Project</Link>
          </div>
        )}

      </div>
    </div>
  )
}
