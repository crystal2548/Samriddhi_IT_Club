import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../utils/supabase'

const CATEGORIES = ['All', 'Development', 'AI/ML', 'Career', 'Club News', 'Design', 'Other']

const CAT_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  development: { bg: 'rgba(0,212,255,0.08)',   color: '#00D4FF', border: 'rgba(0,212,255,0.25)' },
  'ai/ml':     { bg: 'rgba(255,45,155,0.08)',  color: '#FF2D9B', border: 'rgba(255,45,155,0.25)' },
  'ai-ml':     { bg: 'rgba(255,45,155,0.08)',  color: '#FF2D9B', border: 'rgba(255,45,155,0.25)' },
  career:      { bg: 'rgba(167,139,250,0.08)', color: '#A78BFA', border: 'rgba(167,139,250,0.25)' },
  'club news': { bg: 'rgba(245,158,11,0.08)',  color: '#F59E0B', border: 'rgba(245,158,11,0.25)' },
  'club-news': { bg: 'rgba(245,158,11,0.08)',  color: '#F59E0B', border: 'rgba(245,158,11,0.25)' },
  design:      { bg: 'rgba(16,185,129,0.08)',  color: '#10B981', border: 'rgba(16,185,129,0.25)' },
}

function getCatStyle(cat: string) {
  return CAT_COLORS[cat?.toLowerCase()] ?? { bg: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: 'rgba(255,255,255,0.1)' }
}

function getInitials(name?: string) {
  if (!name) return 'A'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function Container({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', boxSizing: 'border-box', width: '100%', ...style }}>
      {children}
    </div>
  )
}

export default function Blog() {
  const [category, setCategory] = useState('All')
  const [search, setSearch]     = useState('')

  const { data: posts = [], isLoading: loading } = useQuery({
    queryKey: ['public_posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, category, tags, read_time_mins, cover_image_url, published_at, profiles(full_name, photo_url)')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })

  const filtered = posts.filter((p: any) => {
    const matchCat    = category === 'All' || p.category?.toLowerCase().replace('-', ' ') === category.toLowerCase()
    const matchSearch = p.title?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <>
      <style>{`
        .blog-post-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        @media (max-width: 1024px) { .blog-post-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px)  { .blog-post-grid { grid-template-columns: 1fr; } }
        .blog-card { transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease; }
        .blog-card:hover {
          border-color: rgba(0,212,255,0.3) !important;
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0,212,255,0.07);
        }
        .cat-pill-inactive:hover {
          border-color: rgba(255,255,255,0.22) !important;
          color: rgba(255,255,255,0.65) !important;
        }
        .search-input:focus { border-color: rgba(0,212,255,0.4) !important; outline: none; }
        .search-input::placeholder { color: rgba(255,255,255,0.2); }
        .cta-link:hover { background: #fff !important; }
      `}</style>

      <div style={{ background: '#0A0E1A', minHeight: '100vh', fontFamily: "'Inter', -apple-system, sans-serif" }}>

        {/* ── Hero ────────────────────────────────────────────────── */}
        <div style={{ paddingTop: 96, paddingBottom: 56, borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'linear-gradient(135deg, #0A0E1A 0%, #0D1829 100%)' }}>
          <Container>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 28, fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
              <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
              <span>›</span>
              <span style={{ color: '#00D4FF' }}>Blog</span>
            </div>

            <h1 style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 'clamp(48px, 7vw, 72px)',
              fontWeight: 900, color: '#fff',
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              lineHeight: 1, margin: '0 0 16px',
            }}>
              Blog
            </h1>

            <div style={{ width: 60, height: 3, background: 'linear-gradient(90deg, #00D4FF, #FF2D9B)', borderRadius: 2, marginBottom: 20 }} />

            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15, lineHeight: 1.7, maxWidth: 520, margin: 0 }}>
              Insights, tutorials, and stories from Samriddhi's community of developers and innovators.
            </p>
          </Container>
        </div>

        {/* ── Filter Bar ──────────────────────────────────────────── */}
        <div style={{
          position: 'sticky', top: 64, zIndex: 30,
          background: 'rgba(10,14,26,0.96)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          padding: '12px 0',
        }}>
          <Container>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {CATEGORIES.map(c => (
                  <button
                    key={c}
                    className={category !== c ? 'cat-pill-inactive' : ''}
                    onClick={() => setCategory(c)}
                    style={{
                      padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600,
                      cursor: 'pointer', border: '1px solid', transition: 'all 0.15s',
                      background:  category === c ? 'rgba(0,212,255,0.1)'       : 'transparent',
                      color:       category === c ? '#00D4FF'                   : 'rgba(255,255,255,0.4)',
                      borderColor: category === c ? 'rgba(0,212,255,0.35)'      : 'rgba(255,255,255,0.1)',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div style={{ position: 'relative', flexShrink: 0 }}>
                <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }}
                  width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  className="search-input"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search posts…"
                  style={{
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 100, padding: '7px 14px 7px 34px',
                    color: '#fff', fontSize: 12, width: 180, boxSizing: 'border-box',
                    fontFamily: "'Inter', sans-serif", transition: 'border-color 0.2s',
                  }}
                />
              </div>
            </div>
          </Container>
        </div>

        {/* ── Posts ───────────────────────────────────────────────── */}
        <div style={{ padding: '48px 0 80px' }}>
          <Container>
            {loading ? (
              <div className="blog-post-grid">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} style={{ background: '#0D1829', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
                    <div style={{ height: 180, background: 'rgba(255,255,255,0.04)' }} />
                    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ height: 10, borderRadius: 4, background: 'rgba(255,255,255,0.05)', width: '35%' }} />
                      <div style={{ height: 14, borderRadius: 4, background: 'rgba(255,255,255,0.05)', width: '85%' }} />
                      <div style={{ height: 10, borderRadius: 4, background: 'rgba(255,255,255,0.03)', width: '60%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 24px', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 20 }}>
                <svg style={{ margin: '0 auto 16px', display: 'block', color: 'rgba(255,255,255,0.1)' }}
                  width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No posts found</p>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Try a different category or search term.</p>
              </div>
            ) : (
              <div className="blog-post-grid">
                {filtered.map((post: any) => <BlogCard key={post.id} post={post} />)}
              </div>
            )}
          </Container>
        </div>

        {/* ── CTA ─────────────────────────────────────────────────── */}
        {!loading && posts.length > 0 && (
          <div style={{ background: '#07090F', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '64px 0' }}>
            <Container style={{ textAlign: 'center' }}>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.01em', margin: '0 0 10px' }}>
                Want to write for us?
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, maxWidth: 420, margin: '0 auto 28px' }}>
                Share your knowledge with the Samriddhi community. Executive members can publish directly.
              </p>
              <Link to="/join" className="cta-link" style={{ display: 'inline-block', padding: '12px 28px', background: '#00D4FF', borderRadius: 10, color: '#0A0E1A', fontSize: 13, fontWeight: 700, textDecoration: 'none', transition: 'background 0.2s' }}>
                Join the Club →
              </Link>
            </Container>
          </div>
        )}
      </div>
    </>
  )
}

// ── Blog Card ──────────────────────────────────────────────────────────────
function BlogCard({ post }: { post: any }) {
  const cs = getCatStyle(post.category)
  return (
    <Link to={`/blog/${post.slug}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      <div className="blog-card" style={{ background: '#0D1829', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>

        {/* Cover */}
        <div style={{ height: 180, background: 'linear-gradient(135deg, #0D1829, #142040)', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
          {post.cover_image_url ? (
            <img src={post.cover_image_url} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(0,212,255,0.15)" strokeWidth="1.5">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em' }}>No Cover</span>
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: '20px 20px 22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {post.category && (
            <span style={{ background: cs.bg, color: cs.color, border: `1px solid ${cs.border}`, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 10px', borderRadius: 100, display: 'inline-block', width: 'fit-content', marginBottom: 12 }}>
              {post.category.replace('-', '/')}
            </span>
          )}

          <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 700, lineHeight: 1.4, margin: '0 0 12px', flex: 1 }}>
            {post.title}
          </h3>

          {post.tags?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
              {post.tags.slice(0, 3).map((tag: string) => (
                <span key={tag} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)', fontFamily: "'JetBrains Mono', monospace" }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.07)', marginTop: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {post.profiles?.photo_url ? (
                <img src={post.profiles.photo_url} alt={post.profiles.full_name} style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #00D4FF, #0066FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                  {getInitials(post.profiles?.full_name)}
                </div>
              )}
              <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>{post.profiles?.full_name || 'Author'}</span>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
              {post.read_time_mins} min
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}