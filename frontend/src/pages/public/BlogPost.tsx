import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { CSSProperties } from 'react'
import { supabase } from '../../utils/supabase'
import { formatDate } from '../../utils/formatters'

import type { BlogPost as BlogPostType } from '../../types/index'

function getInitials(name: string | undefined): string {
  if (!name) return 'A'
  return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
}

const CAT_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  development: { bg: 'rgba(0,212,255,0.1)',   color: 'var(--cyan)', border: 'rgba(0,212,255,0.25)' },
  'ai-ml':     { bg: 'rgba(255,45,155,0.1)',  color: 'var(--pink)', border: 'rgba(255,45,155,0.25)' },
  career:      { bg: 'rgba(167,139,250,0.1)', color: '#A78BFA',     border: 'rgba(167,139,250,0.25)' },
  'club-news': { bg: 'rgba(245,158,11,0.1)',  color: '#F59E0B',     border: 'rgba(245,158,11,0.25)' },
  design:      { bg: 'rgba(16,185,129,0.1)',  color: '#10B981',     border: 'rgba(16,185,129,0.25)' },
}

function getCatStyle(cat: string | undefined): CSSProperties {
  const style = CAT_COLORS[cat?.toLowerCase() ?? ''] || {
    bg: 'rgba(255,255,255,0.06)',
    color: 'var(--text-muted)',
    border: 'var(--border)',
  }
  return { background: style.bg, color: style.color, border: `1px solid ${style.border}` }
}

// ─── Reusable centered container — same pattern as all fixed pages ───
function Container({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      maxWidth: 1100,
      margin: '0 auto',
      padding: '0 32px',
      boxSizing: 'border-box',
      width: '100%',
      ...style,
    }}>
      {children}
    </div>
  )
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<BlogPostType | null>(null)
  const [related, setRelated] = useState<BlogPostType[]>([])
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
      .eq('slug', slug ?? '')
      .eq('status', 'published')
      .single()

    if (!data) { setNotFound(true); setLoading(false); return }
    setPost(data as BlogPostType)

    const { data: relatedData } = await supabase
      .from('blog_posts')
      .select('id, title, slug, category, read_time_mins, cover_image_url, published_at, status, profiles(full_name)')
      .eq('status', 'published')
      .eq('category', data.category)
      .neq('id', data.id)
      .limit(3)
    setRelated((relatedData ?? []) as BlogPostType[])
    setLoading(false)
  }

  if (loading) return (
    <div style={{ background: 'var(--bg-primary)', paddingTop: 80, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid rgba(0,212,255,0.2)', borderTopColor: 'var(--cyan)', animation: 'spin 0.7s linear infinite' }}/>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  if (notFound) return (
    <div style={{ background: 'var(--bg-primary)', paddingTop: 80, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <h1 style={{ color: '#fff', fontSize: 48, fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, margin: 0 }}>Post Not Found</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>This post may have been removed or the URL is incorrect.</p>
      <Link to="/blog" style={{ color: 'var(--cyan)', fontSize: 13, textDecoration: 'none' }}>← Back to Blog</Link>
    </div>
  )

  if (!post) return null

  const cs = getCatStyle(post.category)

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>

      {/* ── Scoped responsive styles ──────────────────────────────── */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }

        .blog-hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 340px;
          align-items: stretch;
        }
        .blog-hero-meta {
          padding: 48px 0 48px 48px;
        }
        .blog-related-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .back-link:hover { color: var(--cyan) !important; }
        .related-card:hover {
          border-color: rgba(0,212,255,0.25) !important;
          transform: translateY(-3px);
        }
        .social-link:hover { color: var(--cyan) !important; }
        .tag-chip:hover {
          background: rgba(0,212,255,0.06) !important;
          border-color: rgba(0,212,255,0.2) !important;
          color: var(--cyan) !important;
        }

        @media (max-width: 860px) {
          .blog-hero-grid {
            grid-template-columns: 1fr;
            min-height: unset;
          }
          .blog-hero-cover {
            min-height: 220px !important;
          }
          .blog-hero-meta {
            padding: 32px 0 !important;
          }
          .blog-related-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 560px) {
          .blog-related-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* ══════════════════════════════════════════════════════════════
          HERO HEADER — full-width banner with contained inner grid
      ══════════════════════════════════════════════════════════════ */}
      <div style={{
        borderBottom: '1px solid var(--border)',
        background: 'linear-gradient(135deg, #080C18 0%, #0D1829 50%, #0A1020 100%)',
        paddingTop: 80,   /* clears fixed navbar */
      }}>
        <Container>
          <div className="blog-hero-grid">

            {/* Left: cover image */}
            <div
              className="blog-hero-cover"
              style={{
                background: 'linear-gradient(135deg, #0D1829, #142040)',
                overflow: 'hidden',
                position: 'relative',
                minHeight: 300,
                borderRadius: '12px 0 0 12px',
              }}
            >
              {post.cover_image_url ? (
                <img
                  src={post.cover_image_url}
                  alt={post.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80, color: 'rgba(0,212,255,0.05)' }}>
                  ✦
                </div>
              )}
              {/* subtle gradient overlay on image for depth */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent 60%, rgba(8,12,24,0.5))', pointerEvents: 'none' }}/>
            </div>

            {/* Right: breadcrumb + category + title + author */}
            <div className="blog-hero-meta" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

              {/* Breadcrumb */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 22, fontSize: 11, color: 'var(--text-muted)' }}>
                <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >Home</Link>
                <span style={{ opacity: 0.4 }}>›</span>
                <Link to="/blog" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >Blog</Link>
                <span style={{ opacity: 0.4 }}>›</span>
                <span style={{ color: 'var(--cyan)' }}>{post.category?.replace('-', '/')}</span>
              </div>

              {/* Category badge */}
              {post.category && (
                <span style={{
                  ...cs,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.09em',
                  padding: '4px 14px',
                  borderRadius: 20,
                  display: 'inline-block',
                  marginBottom: 18,
                  width: 'fit-content',
                }}>
                  {post.category.replace('-', '/')}
                </span>
              )}

              {/* Title */}
              <h1 style={{
                fontFamily: 'Barlow Condensed, sans-serif',
                fontSize: 'clamp(26px, 3.5vw, 44px)',
                fontWeight: 900,
                color: '#fff',
                textTransform: 'uppercase',
                letterSpacing: '-0.01em',
                lineHeight: 1.05,
                marginTop: 0,
                marginBottom: 28,
              }}>
                {post.title}
              </h1>

              {/* Author + meta row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {post.profiles?.photo_url ? (
                    <img
                      src={post.profiles.photo_url}
                      alt={post.profiles.full_name}
                      style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(0,212,255,0.3)', flexShrink: 0 }}
                    />
                  ) : (
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, var(--cyan), #0066FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {getInitials(post.profiles?.full_name)}
                    </div>
                  )}
                  <div>
                    <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: 0, lineHeight: 1.3 }}>
                      {post.profiles?.full_name || 'Author'}
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'capitalize', margin: 0, lineHeight: 1.3 }}>
                      {post.profiles?.role === 'oc'
                        ? post.profiles?.oc_position?.replace(/_/g, ' ')
                        : post.profiles?.role === 'executive'
                          ? 'Executive Member'
                          : 'Member'}
                    </p>
                  </div>
                </div>

                {/* Dot separator + date + read time */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text-muted)', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>
                  <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--text-muted)', display: 'inline-block', opacity: 0.4 }}/>
                  <span>{formatDate(post.published_at ?? '')}</span>
                  <span style={{ opacity: 0.4 }}>·</span>
                  <span>{post.read_time_mins} min read</span>
                </div>
              </div>

            </div>
          </div>
        </Container>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          BODY — narrower reading width, centred
      ══════════════════════════════════════════════════════════════ */}
      <Container style={{ maxWidth: 800, paddingTop: 48, paddingBottom: 80 }}>

        {/* Post content */}
        <div style={{ marginBottom: 48 }}>
          <div style={{
            color: 'var(--text-secondary)',
            fontSize: 16,
            lineHeight: 1.9,
            whiteSpace: 'pre-wrap',
          }}>
            {post.content}
          </div>
        </div>

        {/* Tags */}
        {(post.tags?.length ?? 0) > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 40,
            paddingTop: 24,
            borderTop: '1px solid var(--border)',
          }}>
            {post.tags!.map((tag: string) => (
              <span
                key={tag}
                className="tag-chip"
                style={{
                  fontSize: 11,
                  padding: '4px 12px',
                  borderRadius: 6,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                  fontFamily: 'JetBrains Mono, monospace',
                  cursor: 'default',
                  transition: 'all 0.2s',
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Author card */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '24px',
          marginBottom: 56,
          display: 'flex',
          gap: 20,
          alignItems: 'flex-start',
        }}>
          {post.profiles?.photo_url ? (
            <img
              src={post.profiles.photo_url}
              alt={post.profiles.full_name}
              style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(0,212,255,0.2)', flexShrink: 0 }}
            />
          ) : (
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, var(--cyan), #0066FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {getInitials(post.profiles?.full_name)}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 5px' }}>
              Written by
            </p>
            <p style={{ color: '#fff', fontSize: 15, fontWeight: 700, margin: '0 0 8px' }}>
              {post.profiles?.full_name || 'Author'}
            </p>
            {post.profiles?.bio && (
              <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.65, margin: '0 0 12px' }}>
                {post.profiles.bio}
              </p>
            )}
            <div style={{ display: 'flex', gap: 14 }}>
              {post.profiles?.github_url && (
                <a href={post.profiles.github_url} target="_blank" rel="noopener noreferrer"
                  className="social-link"
                  style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, textDecoration: 'none', transition: 'color 0.2s' }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                  </svg>
                  GitHub
                </a>
              )}
              {post.profiles?.linkedin_url && (
                <a href={post.profiles.linkedin_url} target="_blank" rel="noopener noreferrer"
                  className="social-link"
                  style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, textDecoration: 'none', transition: 'color 0.2s' }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                    <rect x="2" y="9" width="4" height="12"/>
                    <circle cx="4" cy="4" r="2"/>
                  </svg>
                  LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div style={{ marginBottom: 64 }}>
            <h3 style={{
              color: 'var(--text-muted)',
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginTop: 0,
              marginBottom: 20,
            }}>
              Related Posts
            </h3>
            <div className="blog-related-grid">
              {related.map(r => {
                const rcs = getCatStyle(r.category)
                return (
                  <Link key={r.id} to={`/blog/${r.slug}`} style={{ textDecoration: 'none' }}>
                    <div
                      className="related-card"
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: 12,
                        overflow: 'hidden',
                        transition: 'border-color 0.2s, transform 0.2s',
                        height: '100%',
                        boxSizing: 'border-box',
                      }}
                    >
                      <div style={{ height: 110, background: 'linear-gradient(135deg,#0D1829,#142040)', overflow: 'hidden' }}>
                        {r.cover_image_url ? (
                          <img src={r.cover_image_url} alt={r.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: 'rgba(0,212,255,0.06)' }}>✦</div>
                        )}
                      </div>
                      <div style={{ padding: '14px 16px' }}>
                        {r.category && (
                          <span style={{ ...rcs, fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 10, display: 'inline-block', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
                            {r.category.replace('-', '/')}
                          </span>
                        )}
                        <p style={{ color: '#fff', fontSize: 12, fontWeight: 600, lineHeight: 1.4, margin: '0 0 8px' }}>
                          {r.title}
                        </p>
                        <p style={{ color: 'var(--text-muted)', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', margin: 0 }}>
                          {r.read_time_mins} min read
                        </p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Back + CTA footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 24,
          paddingBottom: 16,
          borderTop: '1px solid var(--border)',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <Link
            to="/blog"
            className="back-link"
            style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none', transition: 'color 0.2s' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Blog
          </Link>
        </div>

      </Container>
    </div>
  )
}