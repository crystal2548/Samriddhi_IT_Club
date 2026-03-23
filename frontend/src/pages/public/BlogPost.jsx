import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../utils/supabase'
import { formatDate } from '../../utils/formatDate'

function getInitials(name) {
  if (!name) return 'A'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const CAT_COLORS = {
  development: { bg: 'rgba(0,212,255,0.1)',   color: 'var(--cyan)', border: 'rgba(0,212,255,0.25)' },
  'ai-ml':     { bg: 'rgba(255,45,155,0.1)',  color: 'var(--pink)', border: 'rgba(255,45,155,0.25)' },
  career:      { bg: 'rgba(167,139,250,0.1)', color: '#A78BFA',     border: 'rgba(167,139,250,0.25)' },
  'club-news': { bg: 'rgba(245,158,11,0.1)',  color: '#F59E0B',     border: 'rgba(245,158,11,0.25)' },
  design:      { bg: 'rgba(16,185,129,0.1)',  color: '#10B981',     border: 'rgba(16,185,129,0.25)' },
}

function getCatStyle(cat) {
  return CAT_COLORS[cat?.toLowerCase()] || { bg: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', border: 'var(--border)' }
}

export default function BlogPost() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetchPost()
    window.scrollTo(0, 0)
  }, [slug])

  async function fetchPost() {
    setLoading(true)
    const { data } = await supabase
      .from('blog_posts')
      .select('*, profiles(full_name, photo_url, bio, role, oc_position, github_url, linkedin_url)')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (!data) { setNotFound(true); setLoading(false); return }
    setPost(data)

    // Fetch related posts same category
    const { data: relatedData } = await supabase
      .from('blog_posts')
      .select('id, title, slug, category, read_time_mins, cover_image_url, published_at, profiles(full_name)')
      .eq('status', 'published')
      .eq('category', data.category)
      .neq('id', data.id)
      .limit(3)
    setRelated(relatedData || [])
    setLoading(false)
  }

  if (loading) return (
    <div style={{ background: 'var(--bg-primary)', paddingTop: 64, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid rgba(0,212,255,0.2)', borderTopColor: 'var(--cyan)', animation: 'spin 0.7s linear infinite' }}/>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  if (notFound) return (
    <div style={{ background: 'var(--bg-primary)', paddingTop: 64, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <h1 style={{ color: '#fff', fontSize: 48, fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800 }}>Post Not Found</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>This post may have been removed or the URL is incorrect.</p>
      <Link to="/blog" style={{ color: 'var(--cyan)', fontSize: 13, textDecoration: 'none' }}>← Back to Blog</Link>
    </div>
  )

  const cs = getCatStyle(post.category)

  return (
    <div style={{ background: 'var(--bg-primary)', paddingTop: 64, minHeight: '100vh' }}>

      {/* ── Two-column hero header ───────────────────── */}
      <div style={{ borderBottom: '1px solid var(--border)', background: 'linear-gradient(135deg, #0A0E1A, #0D1829)' }}>
        <div className="container mx-auto px-6" style={{ maxWidth: 1100 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, minHeight: 320, alignItems: 'stretch' }}>

            {/* Left: cover image */}
            <div style={{ background: 'linear-gradient(135deg, #0D1829, #142040)', overflow: 'hidden', position: 'relative', minHeight: 280 }}>
              {post.cover_image_url
                ? <img src={post.cover_image_url} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80, color: 'rgba(0,212,255,0.05)' }}>✦</div>
              }
            </div>

            {/* Right: meta + title */}
            <div style={{ padding: '40px 0 40px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {/* Breadcrumb */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, fontSize: 11, color: 'var(--text-muted)' }}>
                <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
                <span>›</span>
                <Link to="/blog" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Blog</Link>
                <span>›</span>
                <span style={{ color: 'var(--cyan)' }}>{post.category?.replace('-', '/')}</span>
              </div>

              {/* Category badge */}
              {post.category && (
                <span style={{ ...cs, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px', borderRadius: 20, display: 'inline-block', marginBottom: 16, width: 'fit-content' }}>
                  {post.category.replace('-', '/')}
                </span>
              )}

              {/* Title */}
              <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 1.05, marginBottom: 24 }}>
                {post.title}
              </h1>

              {/* Author + meta */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {post.profiles?.photo_url ? (
                    <img src={post.profiles.photo_url} alt={post.profiles.full_name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--border)' }}/>
                  ) : (
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--cyan), #0066FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>
                      {getInitials(post.profiles?.full_name)}
                    </div>
                  )}
                  <div>
                    <p style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{post.profiles?.full_name || 'Author'}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'capitalize' }}>
                      {post.profiles?.role === 'oc' ? post.profiles?.oc_position?.replace(/_/g, ' ') : post.profiles?.role === 'executive' ? 'Executive Member' : 'Member'}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, color: 'var(--text-muted)', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>
                  <span>{formatDate(post.published_at)}</span>
                  <span>·</span>
                  <span>{post.read_time_mins} min read</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="container mx-auto px-6" style={{ maxWidth: 800 }}>

        {/* ── Divider replacing old meta row border ── */}
        <div style={{ height: 1, background: 'var(--border)', margin: '40px 0 40px' }}/>


        {/* ── Post content ────────────────────────────── */}
        <div style={{ marginBottom: 48 }}>
          <div style={{
            color: 'var(--text-secondary)',
            fontSize: 15,
            lineHeight: 1.85,
            whiteSpace: 'pre-wrap',
          }}>
            {post.content}
          </div>
        </div>

        {/* ── Tags ────────────────────────────────────── */}
        {post.tags?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 40, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
            {post.tags.map(tag => (
              <span key={tag} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* ── Author card ─────────────────────────────── */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '24px', marginBottom: 48, display: 'flex', gap: 18, alignItems: 'flex-start' }}>
          {post.profiles?.photo_url ? (
            <img src={post.profiles.photo_url} alt={post.profiles.full_name} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)', flexShrink: 0 }}/>
          ) : (
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, var(--cyan), #0066FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {getInitials(post.profiles?.full_name)}
            </div>
          )}
          <div style={{ flex: 1 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Written by</p>
            <p style={{ color: '#fff', fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{post.profiles?.full_name || 'Author'}</p>
            {post.profiles?.bio && (
              <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6, marginBottom: 10 }}>{post.profiles.bio}</p>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              {post.profiles?.github_url && (
                <a href={post.profiles.github_url} target="_blank" rel="noopener noreferrer"
                  style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, textDecoration: 'none' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--cyan)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                  GitHub
                </a>
              )}
              {post.profiles?.linkedin_url && (
                <a href={post.profiles.linkedin_url} target="_blank" rel="noopener noreferrer"
                  style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, textDecoration: 'none' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--cyan)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                  LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ── Related posts ────────────────────────────── */}
        {related.length > 0 && (
          <div style={{ marginBottom: 64 }}>
            <h3 style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>Related Posts</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {related.map(r => {
                const rcs = getCatStyle(r.category)
                return (
                  <Link key={r.id} to={`/blog/${r.slug}`} style={{ textDecoration: 'none' }}>
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', transition: 'border-color 0.2s, transform 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
                    >
                      <div style={{ height: 100, background: 'linear-gradient(135deg,#0D1829,#142040)', overflow: 'hidden' }}>
                        {r.cover_image_url
                          ? <img src={r.cover_image_url} alt={r.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: 'rgba(0,212,255,0.06)' }}>✦</div>
                        }
                      </div>
                      <div style={{ padding: '12px 14px' }}>
                        {r.category && (
                          <span style={{ ...rcs, fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 10, display: 'inline-block', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                            {r.category.replace('-', '/')}
                          </span>
                        )}
                        <p style={{ color: '#fff', fontSize: 12, fontWeight: 600, lineHeight: 1.3, marginBottom: 6 }}>{r.title}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}>{r.read_time_mins} min read</p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Back + CTA ──────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 64, flexWrap: 'wrap', gap: 12 }}>
          <Link to="/blog" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--cyan)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to Blog
          </Link>
          <Link to="/join" style={{ padding: '9px 20px', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 8, color: 'var(--cyan)', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
            Join Samriddhi IT Club →
          </Link>
        </div>

      </div>
    </div>
  )
}