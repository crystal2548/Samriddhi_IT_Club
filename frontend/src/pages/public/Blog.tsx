import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../utils/supabase'

const CATEGORIES = ['All', 'Development', 'AI/ML', 'Career', 'Club News', 'Design', 'Other']

const CAT_COLORS: Record<string, { bg: string, color: string, border: string }> = {
  development: { bg: 'bg-[#00D4FF]/10',   color: 'text-[#00D4FF]', border: 'border-[#00D4FF]/25' },
  'ai/ml':     { bg: 'bg-[#FF2D9B]/10',  color: 'text-[#FF2D9B]', border: 'border-[#FF2D9B]/25' },
  'ai-ml':     { bg: 'bg-[#FF2D9B]/10',  color: 'text-[#FF2D9B]', border: 'border-[#FF2D9B]/25' },
  career:      { bg: 'bg-[#A78BFA]/10', color: 'text-[#A78BFA]',     border: 'border-[#A78BFA]/25' },
  'club news': { bg: 'bg-[#F59E0B]/10',  color: 'text-[#F59E0B]',     border: 'border-[#F59E0B]/25' },
  'club-news': { bg: 'bg-[#F59E0B]/10',  color: 'text-[#F59E0B]',     border: 'border-[#F59E0B]/25' },
  design:      { bg: 'bg-[#10B981]/10',  color: 'text-[#10B981]',     border: 'border-[#10B981]/25' },
}

function getCatStyle(cat: string) {
  return CAT_COLORS[cat?.toLowerCase()] || { bg: 'bg-white/5', color: 'text-gray-400', border: 'border-white/10' }
}

function getInitials(name?: string) {
  if (!name) return 'A'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function Blog() {
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')

  const { data: posts = [], isLoading: loading } = useQuery({
    queryKey: ['public_posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, category, tags, read_time_mins, cover_image_url, published_at, profiles(full_name, photo_url)')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    }
  })

  const filtered = posts.filter((p: any) => {
    const matchCat = category === 'All' || p.category?.toLowerCase().replace('-', ' ') === category.toLowerCase()
    const matchSearch = p.title?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="bg-[#0A0E1A] pt-[64px] min-h-screen">

      {/* ── Page Hero ───────────────────────────────── */}
      <div className="py-12 border-b border-white/10 bg-gradient-to-br from-[#0A0E1A] to-[#0D1829]">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-1.5 mb-4 text-[11px] text-gray-500">
            <span>Home</span><span>›</span>
            <span className="text-[#00D4FF]">Blog</span>
          </div>
          <h1 className="font-['Barlow_Condensed',sans-serif] text-[clamp(40px,6vw,64px)] font-black text-white uppercase tracking-[-0.02em] mb-2">
            Blog
          </h1>
          <div className="w-[60px] h-[3px] bg-gradient-to-r from-[#00D4FF] to-[#FF2D9B] rounded-sm mb-4"/>
          <p className="text-gray-400 text-[14px] max-w-[520px] leading-[1.7]">
            Insights, tutorials, and stories from Samriddhi's community of developers and innovators.
          </p>
        </div>
      </div>

      {/* ── Filters ─────────────────────────────────── */}
      <div className="py-4 border-b border-white/10 bg-[#0A0E1A]/80 sticky top-[64px] z-30 backdrop-blur-md">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex gap-1.5 flex-wrap">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategory(c)}
                  className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium cursor-pointer transition-all ${category === c ? 'bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/30' : 'bg-transparent text-gray-500 border border-white/10 hover:border-white/20'}`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search posts..."
                className="bg-[#0D1829] border border-white/10 rounded-full py-1.5 pr-3.5 pl-8 text-white text-[12px] outline-none w-[160px] font-['Inter',sans-serif] focus:border-[#00D4FF]/40 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="py-10 pb-20">
        <div className="container mx-auto px-6">

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-[#0D1829] border border-white/10 rounded-xl overflow-hidden h-full animate-pulse">
                  <div className="h-[180px] bg-white/5"/>
                  <div className="p-5 flex flex-col gap-2.5">
                    <div className="h-2.5 rounded bg-white/5 w-[35%]"/>
                    <div className="h-3.5 rounded bg-white/5 w-[85%]"/>
                    <div className="h-2.5 rounded bg-white/[0.03] w-[60%]"/>
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 px-6 border border-dashed border-white/10 rounded-2xl">
              <svg className="mx-auto mb-4 text-white/10" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
              <p className="text-gray-300 text-[15px] font-medium mb-1.5">No posts found</p>
              <p className="text-gray-500 text-[13px]">Try a different category or search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filtered.map((post: any) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Newsletter CTA ──────────────────────────── */}
      {!loading && posts.length > 0 && (
        <div className="bg-[#07090F] border-t border-white/10 py-16">
          <div className="container mx-auto px-6 text-center">
            <h2 className="font-['Barlow_Condensed',sans-serif] text-[36px] font-extrabold text-white uppercase tracking-[-0.01em] mb-2">
              Want to write for us?
            </h2>
            <p className="text-gray-400 text-[14px] mb-6">
              Share your knowledge with the Samriddhi community. Executive members can publish directly.
            </p>
            <Link to="/join" className="inline-block px-7 py-3 bg-[#00D4FF] rounded-lg text-[#0A0E1A] text-[13px] font-bold no-underline hover:bg-white transition-colors">
              Join the Club →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Blog Card ───────────────────────────────────────────────── */
function BlogCard({ post }: { post: any }) {
  const cs = getCatStyle(post.category)
  return (
    <Link to={`/blog/${post.slug}`} className="no-underline block h-full group">
      <div className="bg-[#0D1829] border border-white/10 rounded-xl overflow-hidden h-full flex flex-col transition-all duration-300 group-hover:border-[#00D4FF]/25 group-hover:-translate-y-1">
        {/* Cover */}
        <div className="h-[180px] bg-gradient-to-br from-[#0D1829] to-[#142040] relative overflow-hidden">
          {post.cover_image_url
            ? <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover"/>
            : <div className="w-full h-full flex items-center justify-center text-[52px] text-[#00D4FF]/10">✦</div>
          }
        </div>

        {/* Body */}
        <div className="p-4.5 pb-5 flex-1 flex flex-col">
          {post.category && (
            <span className={`${cs.color} ${cs.bg} border ${cs.border} text-[10px] font-bold uppercase tracking-[0.08em] px-2.5 py-1 rounded-full inline-block w-fit mb-3`}>
              {post.category.replace('-', '/')}
            </span>
          )}
          <h3 className="text-white text-[14px] font-bold leading-[1.35] mb-3 flex-1">
            {post.title}
          </h3>

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {post.tags.slice(0, 3).map((tag: string) => (
                <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-500 font-['JetBrains_Mono',monospace]">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <div className="flex items-center gap-1.5">
              {post.profiles?.photo_url ? (
                <img src={post.profiles.photo_url} alt={post.profiles.full_name} className="w-6 h-6 rounded-full object-cover"/>
              ) : (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#00D4FF] to-[#0066FF] flex items-center justify-center text-[9px] font-bold text-white">
                  {getInitials(post.profiles?.full_name)}
                </div>
              )}
              <span className="text-gray-400 text-[11px]">{post.profiles?.full_name || 'Author'}</span>
            </div>
            <span className="text-gray-500 text-[11px] font-['JetBrains_Mono',monospace]">
              {post.read_time_mins} min
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
