import React, { useEffect, useState, useRef } from 'react'
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
        supabase.from('events').select('*').in('status', ['upcoming', 'ongoing']).order('event_date', { ascending: true }).limit(3),
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

  const { events = [], projects = [], posts = [], sponsors = [] } = homeData || {}

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
    return () => {
      if (typingRef.current) clearTimeout(typingRef.current)
    }
  }, [displayed, deleting, wordIndex])

  return (
    <div className="bg-[#0A0E1A] pt-[64px]">
      <style>{`
        @keyframes custom-blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes float1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes float2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        .animate-float1 { animation: float1 3s ease-in-out infinite; }
        .animate-float2 { animation: float2 4s ease-in-out infinite 1s; }
        .animate-blink { animation: custom-blink 1s step-end infinite; }
      `}</style>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-[#0A0E1A] via-[#0D1829] to-[#0A0E1A] border-b border-white/10 flex items-center relative overflow-hidden py-20">
        
        {/* Rings */}
        {[500,380,260,160].map((size, i) => (
          <div key={i} 
            className="absolute right-[8%] top-1/2 -translate-y-1/2 rounded-full pointer-events-none"
            style={{ 
              width: size, height: size, 
              border: `1px solid rgba(0,212,255,${0.04 + i * 0.02})` 
            }}
          />
        ))}
        <div className="absolute right-[8%] top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(0,212,255,0.03)_0%,transparent_70%)] pointer-events-none"/>

        {/* Center icon */}
        <div className="animate-float1 absolute right-[calc(8%+185px)] top-1/2 -translate-y-1/2">
          <div className="w-16 h-16 rounded-2xl bg-[#00D4FF]/10 border border-[#00D4FF]/30 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="1.5">
              <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          </div>
        </div>

        {/* Floating stat cards */}
        <div className="animate-float2 absolute right-[calc(8%-20px)] top-[calc(50%-110px)]">
          <div className="bg-[#0D1829]/90 border border-[#00D4FF]/20 rounded-xl px-4 py-2.5 backdrop-blur-md">
            <div className="text-[#00D4FF] text-[22px] font-extrabold font-['Barlow_Condensed',sans-serif]">{settings.stat_members || '120+'}</div>
            <div className="text-gray-400 text-[10px] uppercase tracking-[0.08em]">Members</div>
          </div>
        </div>
        <div className="animate-float1 absolute right-[calc(8%-30px)] top-[calc(50%+60px)]">
          <div className="bg-[#0D1829]/90 border border-[#FF2D9B]/20 rounded-xl px-4 py-2.5 backdrop-blur-md">
            <div className="text-[#FF2D9B] text-[22px] font-extrabold font-['Barlow_Condensed',sans-serif]">{settings.stat_projects || '15+'}</div>
            <div className="text-gray-400 text-[10px] uppercase tracking-[0.08em]">Projects</div>
          </div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-[640px]">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 mb-6 bg-[#00D4FF]/10 border border-[#00D4FF]/20 rounded-full px-3.5 py-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00D4FF]"/>
              <span className="text-[#00D4FF] text-[11px] font-bold uppercase tracking-[0.1em]">The future is ours to build</span>
            </div>

            {/* Heading */}
            <h1 className="font-['Barlow_Condensed',sans-serif] text-[clamp(64px,10vw,96px)] font-black leading-[0.95] tracking-[-0.02em] uppercase text-white mb-7">
              CODE.
              <br/>
              <span className="text-[#00D4FF]">
                {displayed}
                <span className="animate-blink">|</span>
              </span>
              <br/>
              <span className="text-[#FF2D9B]">CONNECT.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-gray-300 text-[14px] leading-relaxed max-w-[480px] mb-9 uppercase tracking-[0.04em] font-medium">
              {settings.tagline || "Join premier community of developers, designers, and tech enthusiasts. We turn complex problems into elegant solutions through collaborative excellence."}
            </p>

            {/* Buttons */}
            <div className="flex gap-3 flex-wrap">
              <Link to="/apply" className="px-7 py-3 rounded-lg bg-[#00D4FF] text-[#0A0E1A] text-[13px] font-bold tracking-[0.05em] hover:bg-white transition-colors shadow-[0_0_15px_rgba(0,212,255,0.15)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                {settings.hero_cta_text || 'Join Now'}
              </Link>
              <Link to="/projects" className="px-7 py-3 rounded-lg border-2 border-[#00D4FF]/30 text-[#00D4FF] text-[13px] font-bold tracking-[0.05em] hover:bg-[#00D4FF]/10 transition-colors">
                View Projects
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────── */}
      <section className="bg-[#07090F] border-b border-white/10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {[
              { n: settings.stat_members  || '120+', l: 'Active members' },
              { n: settings.stat_events   || '30+',  l: 'Annual events' },
              { n: settings.stat_alumni   || '500+', l: 'Alumni network' },
              { n: settings.stat_partners || '12+',  l: 'Industry partners' },
            ].map((s, i) => (
              <div key={i} className={`p-8 text-center ${i < 3 ? 'md:border-r border-white/10' : ''}`}>
                <div className="font-['Barlow_Condensed',sans-serif] text-[44px] font-extrabold text-[#00D4FF] tracking-[-0.02em] leading-none mb-2">{s.n}</div>
                <div className="text-gray-500 text-[10px] uppercase tracking-[0.1em]">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── UPCOMING EVENTS ──────────────────────────────── */}
      <section className="py-20 bg-[#0A0E1A]">
        <div className="container mx-auto px-6">
          <SectionHeader eyebrow="Engage with us" title="Upcoming Events" linkTo="/events" linkLabel="View All Events" />
          {loading ? <CardsSkeleton /> : events.length === 0
            ? <EmptyState message="No upcoming events right now." sub="Check back soon or follow us on Instagram." />
            : <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{events.map((e: any) => <EventCard key={e.id} event={e} />)}</div>
          }
        </div>
      </section>

      {/* ── FEATURED PROJECTS ────────────────────────────── */}
      <section className="py-20 bg-[#07090F] border-t border-white/10">
        <div className="container mx-auto px-6">
          <SectionHeader eyebrow="Our innovations" title="Featured Projects" linkTo="/projects" linkLabel="View All Projects" />
          {loading ? <CardsSkeleton /> : projects.length === 0
            ? <EmptyState message="No featured projects yet." sub="Projects will appear here once added by the team." />
            : <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{projects.map((p: any) => <ProjectCard key={p.id} project={p} />)}</div>
          }
        </div>
      </section>

      {/* ── BLOG POSTS ───────────────────────────────────── */}
      <section className="py-20 bg-[#0A0E1A] border-t border-white/10">
        <div className="container mx-auto px-6">
          <SectionHeader eyebrow="Knowledge base" title="Latest from Blog" linkTo="/blog" linkLabel="Read All Stories" />
          {loading ? <CardsSkeleton /> : posts.length === 0
            ? <EmptyState message="No blog posts yet." sub="Articles will appear here once published." />
            : <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{posts.map((p: any) => <BlogCard key={p.id} post={p} />)}</div>
          }
        </div>
      </section>

      {/* ── JOIN CTA ─────────────────────────────────────── */}
      <section className="py-20 bg-[#07090F] border-t border-white/10">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-br from-[#00D4FF]/5 to-[#FF2D9B]/5 border border-[#00D4FF]/10 rounded-[20px] p-[60px] flex items-center justify-between gap-10 flex-wrap">
            <div className="max-w-[520px]">
              <h2 className="font-['Barlow_Condensed',sans-serif] text-[clamp(32px,4vw,48px)] font-black text-white uppercase tracking-[-0.01em] leading-[1.05] mb-4">
                Ready to shape the <span className="text-[#00D4FF]">digital frontier?</span>
              </h2>
              <p className="text-gray-400 text-[14px] leading-relaxed mb-7">
                Join {settings.stat_members || '120+'} active innovators already onboard. Get access to workshops, hackathons, industry connections, and real project experience.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Link to="/apply" className="px-7 py-3 rounded-lg bg-[#00D4FF] text-[#0A0E1A] text-[13px] font-bold tracking-[0.05em] hover:bg-white transition-colors shadow-[0_0_15px_rgba(0,212,255,0.15)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                  {settings.hero_cta_text || 'Join Now'}
                </Link>
                <Link to="/events" className="px-7 py-3 rounded-lg border-2 border-[#00D4FF]/30 text-[#00D4FF] text-[13px] font-bold tracking-[0.05em] hover:bg-[#00D4FF]/10 transition-colors">
                  Browse Events
                </Link>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="flex">
                {['AK','PT','RS','BM','SJ'].map((ini, i) => (
                  <div key={i} 
                    className={`w-11 h-11 rounded-full border-2 border-[#07090F] flex items-center justify-center text-[12px] font-bold text-white relative
                      ${i === 0 ? 'ml-0' : '-ml-3'}
                      ${i % 2 === 0 ? 'bg-gradient-to-br from-[#00D4FF] to-[#0066FF]' : 'bg-gradient-to-br from-[#FF2D9B] to-[#FF6B35]'}`}
                    style={{ zIndex: 5 - i }}
                  >{ini}</div>
                ))}
                <div className="w-11 h-11 rounded-full -ml-3 border-2 border-[#07090F] bg-[#0D1829] flex items-center justify-center text-[11px] font-bold text-gray-400 z-0">
                  +115
                </div>
              </div>
              <span className="text-gray-500 text-[11px] font-['JetBrains_Mono',monospace]">Join {settings.stat_members || '120+'} innovators</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function SectionHeader({ eyebrow, title, linkTo, linkLabel }: { eyebrow: string, title: string, linkTo: string, linkLabel: string }) {
  return (
    <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
      <div>
        <p className="text-[#00D4FF] text-[11px] font-bold uppercase tracking-[0.1em] mb-2">{eyebrow}</p>
        <h2 className="font-['Barlow_Condensed',sans-serif] text-[clamp(28px,4vw,36px)] font-extrabold text-white uppercase tracking-[0.02em]">{title}</h2>
      </div>
      <Link to={linkTo} className="text-[#00D4FF] text-[13px] font-medium flex items-center gap-1 no-underline hover:text-white transition-colors">
        {linkLabel}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </Link>
    </div>
  )
}

function EventCard({ event }: { event: any }) {
  const typeColor: Record<string, string> = { hackathon: 'text-[#00D4FF]', workshop: 'text-[#FF2D9B]', seminar: 'text-[#00BFA5]', bootcamp: 'text-[#A78BFA]', social: 'text-[#F59E0B]', fest: 'text-[#FF2D9B]' }
  const statusMap: Record<string, { label: string, classes: string }> = {
    upcoming:  { label: 'Upcoming',  classes: 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/25' },
    ongoing:   { label: 'Ongoing',   classes: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/25' },
    completed: { label: 'Completed', classes: 'bg-gray-500/10 text-gray-400 border-gray-500/25' },
  }
  const st = statusMap[event.status] || statusMap.upcoming
  return (
    <Link to={`/events/${event.id}`} className="no-underline block h-full group">
      <div className="bg-[#0D1829] border border-white/10 rounded-xl overflow-hidden h-full flex flex-col transition-all duration-300 group-hover:border-[#00D4FF]/30 group-hover:-translate-y-1">
        <div className="h-[180px] bg-gradient-to-br from-[#0D1829] to-[#142040] relative overflow-hidden">
          {event.banner_url
            ? <img src={event.banner_url} alt={event.title} className="w-full h-full object-cover"/>
            : <div className="w-full h-full flex items-center justify-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(0,212,255,0.15)" strokeWidth="1"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
          }
          <div className="absolute top-3 right-3">
            <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${st.classes}`}>{st.label}</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00D4FF]/40 to-transparent"/>
        </div>
        <div className="p-5 pb-6 flex-1 flex flex-col">
          <span className={`text-[10px] font-bold uppercase tracking-[0.08em] mb-2 block ${typeColor[event.type] || 'text-[#00D4FF]'}`}>{event.type}</span>
          <h3 className="text-white text-[15px] font-bold leading-[1.3] mb-2">{event.title}</h3>
          {event.description && <p className="text-gray-400 text-[12px] leading-[1.6] mb-4 flex-1">{event.description.slice(0, 80)}...</p>}
          <div className="flex flex-col gap-1.5 mb-4">
            {event.event_date && (
              <div className="flex items-center gap-1.5 text-gray-400 text-[12px]">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {formatDateShort(event.event_date)} • {new Date(event.event_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
            {event.location && (
              <div className="flex items-center gap-1.5 text-gray-400 text-[12px]">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {event.location}
              </div>
            )}
            {event.max_participants && (
              <div className="flex items-center gap-1.5 text-gray-400 text-[12px]">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                {event.max_participants} seats
              </div>
            )}
          </div>
          <button className="w-full p-2.5 rounded-lg bg-[#00D4FF]/10 border border-[#00D4FF]/20 text-[#00D4FF] text-[11px] font-bold uppercase tracking-[0.06em] cursor-pointer transition-colors group-hover:bg-[#00D4FF]/20">
            Register Now →
          </button>
        </div>
      </div>
    </Link>
  )
}

function ProjectCard({ project }: { project: any }) {
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

function BlogCard({ post }: { post: any }) {
  const catColor: Record<string, string> = { development: 'text-[#00D4FF]', 'ai-ml': 'text-[#FF2D9B]', career: 'text-[#A78BFA]', 'club-news': 'text-[#F59E0B]' }
  const catBg: Record<string, string>    = { development: 'bg-[#00D4FF]/10', 'ai-ml': 'bg-[#FF2D9B]/10', career: 'bg-[#A78BFA]/10', 'club-news': 'bg-[#F59E0B]/10' }
  return (
    <Link to={`/blog/${post.slug}`} className="no-underline block h-full group">
      <div className="bg-[#0D1829] border border-white/10 rounded-xl overflow-hidden h-full flex flex-col transition-all duration-300 group-hover:border-[#00D4FF]/25 group-hover:-translate-y-1">
        <div className="h-[180px] bg-gradient-to-br from-[#0D1829] to-[#142040] relative overflow-hidden">
          {post.cover_image_url
            ? <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover"/>
            : <div className="w-full h-full flex items-center justify-center text-[56px] text-[#00D4FF]/10">✦</div>
          }
        </div>
        <div className="p-5 pb-6 flex-1 flex flex-col">
          {post.category && (
            <span className={`text-[10px] font-bold uppercase tracking-[0.08em] px-2.5 py-1 rounded-full w-w-fit mb-3 inline-block ${catColor[post.category] || 'text-[#00D4FF]'} ${catBg[post.category] || 'bg-[#00D4FF]/10'}`}>
              {post.category.replace('-', '/')}
            </span>
          )}
          <h3 className="text-white text-[15px] font-bold leading-[1.35] mb-4 flex-1">{post.title}</h3>
          <div className="flex items-center justify-between pt-3.5 border-t border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00D4FF] to-[#0066FF] flex items-center justify-center text-[11px] font-bold text-white">
                {post.profiles?.full_name?.[0] || 'A'}
              </div>
              <span className="text-gray-400 text-[12px]">{post.profiles?.full_name || 'Author'}</span>
            </div>
            <span className="text-gray-400 text-[11px] font-['JetBrains_Mono',monospace]">{post.read_time_mins} min read</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

function EmptyState({ message, sub }: { message: string, sub: string }) {
  return (
    <div className="rounded-xl p-16 border border-dashed border-white/10 flex flex-col items-center justify-center text-center">
      <p className="text-gray-300 text-[14px] font-medium mb-1.5">{message}</p>
      <p className="text-gray-500 text-[12px]">{sub}</p>
    </div>
  )
}

function CardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1,2,3].map(i => (
        <div key={i} className="bg-[#0D1829] border border-white/10 rounded-xl overflow-hidden animate-pulse">
          <div className="h-[180px] bg-white/5"/>
          <div className="p-5 flex flex-col gap-3">
            <div className="h-2.5 rounded bg-white/5 w-[40%]"/>
            <div className="h-3.5 rounded bg-white/5 w-[80%]"/>
            <div className="h-2.5 rounded bg-white/[0.03] w-[65%]"/>
          </div>
        </div>
      ))}
    </div>
  )
}
