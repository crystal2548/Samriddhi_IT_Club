import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../utils/supabase'
import { formatDateShort } from '../../utils/formatDate'

const CATEGORIES = ['All', 'Development', 'AI/ML', 'Career', 'Club News', 'Design', 'Other']

const CAT_COLORS = {
  development: { bg: 'rgba(0,212,255,0.1)',   color: 'var(--cyan)', border: 'rgba(0,212,255,0.25)' },
  'ai/ml':     { bg: 'rgba(255,45,155,0.1)',  color: 'var(--pink)', border: 'rgba(255,45,155,0.25)' },
  'ai-ml':     { bg: 'rgba(255,45,155,0.1)',  color: 'var(--pink)', border: 'rgba(255,45,155,0.25)' },
  career:      { bg: 'rgba(167,139,250,0.1)', color: '#A78BFA',     border: 'rgba(167,139,250,0.25)' },
  'club news': { bg: 'rgba(245,158,11,0.1)',  color: '#F59E0B',     border: 'rgba(245,158,11,0.25)' },
  'club-news': { bg: 'rgba(245,158,11,0.1)',  color: '#F59E0B',     border: 'rgba(245,158,11,0.25)' },
  design:      { bg: 'rgba(16,185,129,0.1)',  color: '#10B981',     border: 'rgba(16,185,129,0.25)' },
}

function getCatStyle(cat) {
  return CAT_COLORS[cat?.toLowerCase()] || { bg: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', border: 'var(--border)' }
}

function getInitials(name) {
  if (!name) return 'A'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function Blog() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')

  useEffect(() => { fetchPosts() }, [])

  async function fetchPosts() {
    setLoading(true)
    const { data } = await supabase
      .from('blog_posts')
      .select('id, title, slug, category, tags, read_time_mins, cover_image_url, published_at, profiles(full_name, photo_url)')
      .eq('status', 'published')
      // Use created_at for homepage ordering so newly created published posts
      // show up reliably even if `published_at` is still NULL for any reason.
      .order('created_at', { ascending: false })
    setPosts(data || [])
    setLoading(false)
  }

  const filtered = posts.filter(p => {
    const matchCat = category === 'All' || p.category?.toLowerCase().replace('-', ' ') === category.toLowerCase()
    const matchSearch = p.title?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const featured = filtered[0]
  const rest = filtered.slice(1)

  return (
    <div style={{ background: 'var(--bg-primary)', paddingTop: 64, minHeight: '100vh' }}>

      {/* ── Page Hero ───────────────────────────────── */}
      <div style={{ padding: '48px 0 36px', borderBottom: '1px solid var(--border)', background: 'linear-gradient(135deg, #0A0E1A, #0D1829)' }}>
        <div className="container mx-auto px-6">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, fontSize: 11, color: 'var(--text-muted)' }}>
            <span>Home</span><span>›</span>
            <span style={{ color: 'var(--cyan)' }}>Blog</span>
          </div>
          <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 'clamp(40px,6vw,64px)', fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.02em', marginBottom: 8 }}>
            Blog
          </h1>
          <div style={{ width: 60, height: 3, background: 'linear-gradient(90deg, var(--cyan), var(--pink))', borderRadius: 2, marginBottom: 16 }}/>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 520, lineHeight: 1.7 }}>
            Insights, tutorials, and stories from Samriddhi's community of developers and innovators.
          </p>
        </div>
      </div>

      {/* ── Filters ─────────────────────────────────── */}
      <div style={{ padding: '16px 0', borderBottom: '1px solid var(--border)', background: 'var(--bg-primary)', position: 'sticky', top: 64, zIndex: 30, backdropFilter: 'blur(10px)' }}>
        <div className="container mx-auto px-6">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 6, flex: 1, flexWrap: 'wrap' }}>
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategory(c)}
                  style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s', background: category === c ? 'rgba(0,212,255,0.1)' : 'transparent', color: category === c ? 'var(--cyan)' : 'var(--text-muted)', border: `1px solid ${category === c ? 'rgba(0,212,255,0.3)' : 'var(--border)'}` }}>
                  {c}
                </button>
              ))}
            </div>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search posts..."
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '7px 14px 7px 30px', color: '#fff', fontSize: 12, outline: 'none', width: 160, fontFamily: 'Inter, sans-serif' }}
                onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.4)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '40px 0 80px' }}>
        <div className="container mx-auto px-6">

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
              {[1,2,3,4,5,6].map(i => (
                <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
                  <div style={{ height: 180, background: 'rgba(255,255,255,0.03)' }}/>
                  <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ height: 10, borderRadius: 4, background: 'rgba(255,255,255,0.05)', width: '35%' }}/>
                    <div style={{ height: 14, borderRadius: 4, background: 'rgba(255,255,255,0.05)', width: '85%' }}/>
                    <div style={{ height: 10, borderRadius: 4, background: 'rgba(255,255,255,0.03)', width: '60%' }}/>
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 24px' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" style={{ margin: '0 auto 16px', display: 'block' }}>
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
              <p style={{ color: 'var(--text-secondary)', fontSize: 15, fontWeight: 500, marginBottom: 6 }}>No posts found</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Try a different category or search term.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
              {filtered.map(post => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Newsletter CTA ──────────────────────────── */}
      {!loading && posts.length > 0 && (
        <div style={{ background: '#07090F', borderTop: '1px solid var(--border)', padding: '60px 0' }}>
          <div className="container mx-auto px-6" style={{ textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 36, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.01em', marginBottom: 8 }}>
              Want to write for us?
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
              Share your knowledge with the Samriddhi community. Executive members can publish directly.
            </p>
            <Link to="/join" style={{ display: 'inline-block', padding: '12px 28px', background: 'var(--cyan)', borderRadius: 8, color: '#0A0E1A', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
              Join the Club →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Blog Card ───────────────────────────────────────────────── */
function BlogCard({ post }) {
  const cs = getCatStyle(post.category)
  return (
    <Link to={`/blog/${post.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', transition: 'border-color 0.2s, transform 0.2s' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.25)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
      >
        {/* Cover */}
        <div style={{ height: 180, background: 'linear-gradient(135deg,#0D1829,#142040)', overflow: 'hidden', position: 'relative' }}>
          {post.cover_image_url
            ? <img src={post.cover_image_url} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52, color: 'rgba(0,212,255,0.06)' }}>✦</div>
          }
        </div>

        {/* Body */}
        <div style={{ padding: '18px 18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {post.category && (
            <span style={{ ...cs, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '3px 10px', borderRadius: 20, display: 'inline-block', width: 'fit-content', marginBottom: 12 }}>
              {post.category.replace('-', '/')}
            </span>
          )}
          <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 700, lineHeight: 1.35, marginBottom: 12, flex: 1 }}>
            {post.title}
          </h3>

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
              {post.tags.slice(0, 3).map(tag => (
                <span key={tag} style={{ fontSize: 9, padding: '2px 7px', borderRadius: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              {post.profiles?.photo_url ? (
                <img src={post.profiles.photo_url} alt={post.profiles.full_name} style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }}/>
              ) : (
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, var(--cyan), #0066FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff' }}>
                  {getInitials(post.profiles?.full_name)}
                </div>
              )}
              <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{post.profiles?.full_name || 'Author'}</span>
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>
              {post.read_time_mins} min
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}