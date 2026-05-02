import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../utils/supabase'
import { useSiteSettings } from '../../context/SiteContext'

// ─── Reusable centered container — same pattern as all fixed pages ───
function Container({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      maxWidth: 1200,
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

function getInitials(name: string | undefined): string {
  if (!name) return 'A'
  return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
}

const STATUS_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  completed:   { color: '#10B981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)' },
  ongoing:     { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
  planned:     { color: '#A78BFA', bg: 'rgba(167,139,250,0.1)',border: 'rgba(167,139,250,0.25)' },
  archived:    { color: '#9CA3AF', bg: 'rgba(107,114,128,0.15)',border: 'rgba(107,114,128,0.25)' },
}

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { settings } = useSiteSettings()

  useEffect(() => {
    async function fetchProject() {
      setLoading(true)
      const { data, error } = await supabase
        .from('projects')
        .select('*, profiles!added_by(full_name, photo_url)')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching project:', error)
        navigate('/projects')
      } else {
        setProject(data)
      }
      setLoading(false)
    }
    fetchProject()
  }, [id, navigate])

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(0,212,255,0.1)', borderTopColor: 'var(--cyan)', animation: 'spin 1s linear infinite' }}/>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  if (!project) return null

  const statusKey = (project.status ?? 'completed').toLowerCase()
  const statusCfg = STATUS_COLORS[statusKey] || STATUS_COLORS.completed

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: 80, paddingBottom: 100 }}>

      {/* ── Scoped responsive styles ──────────────────────────────── */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }

        .project-detail-grid {
          display: grid;
          grid-template-columns: 7fr 4fr;
          gap: 48px;
          align-items: start;
        }
        .project-sidebar {
          position: sticky;
          top: 100px;
        }
        .back-link:hover { color: var(--cyan) !important; }
        .tech-tag:hover {
          background: rgba(0,212,255,0.08) !important;
          border-color: rgba(0,212,255,0.3) !important;
          color: var(--cyan) !important;
        }
        .action-btn-outline:hover {
          background: rgba(255,255,255,0.06) !important;
          border-color: rgba(255,255,255,0.2) !important;
        }

        @media (max-width: 900px) {
          .project-detail-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .project-sidebar {
            position: static !important;
          }
          .project-stats-bar {
            justify-content: flex-start !important;
            gap: 32px !important;
          }
        }
        @media (max-width: 480px) {
          .project-stats-bar {
            flex-wrap: wrap;
            gap: 20px !important;
          }
        }
      `}</style>

      <Container>

        {/* ── Breadcrumb ────────────────────────────────────────────── */}
        <Link
          to="/projects"
          className="back-link"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--text-muted)',
            fontSize: 13,
            textDecoration: 'none',
            marginBottom: 36,
            transition: 'color 0.2s',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Projects
        </Link>

        {/* ── Main two-column grid ──────────────────────────────────── */}
        <div className="project-detail-grid">

          {/* ── Left: Banner + Content ───────────────────────────── */}
          <div>

            {/* Banner */}
            <div style={{
              borderRadius: 20,
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #0D1829, #142040)',
              border: '1px solid var(--border)',
              marginBottom: 36,
              aspectRatio: '16/9',
            }}>
              {project.banner_url ? (
                <img
                  src={project.banner_url}
                  alt={project.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="rgba(0,212,255,0.12)" strokeWidth="1">
                    <polyline points="16 18 22 12 16 6"/>
                    <polyline points="8 6 2 12 8 18"/>
                  </svg>
                </div>
              )}
            </div>

            {/* Title */}
            <h1 style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: 'clamp(28px, 5vw, 44px)',
              fontWeight: 800,
              color: '#fff',
              textTransform: 'uppercase',
              letterSpacing: '0.01em',
              marginTop: 0,
              marginBottom: 20,
              lineHeight: 1.1,
            }}>
              {project.title}
            </h1>

            {/* Description in a card */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: '28px 32px',
            }}>
              <h4 style={{
                color: 'var(--cyan)',
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginTop: 0,
                marginBottom: 16,
              }}>
                About this Project
              </h4>
              <div style={{
                whiteSpace: 'pre-wrap',
                color: 'var(--text-secondary)',
                fontSize: 15,
                lineHeight: 1.85,
              }}>
                {project.description || 'No description provided for this project.'}
              </div>
            </div>

          </div>

          {/* ── Right: Sticky Sidebar ─────────────────────────────── */}
          <div className="project-sidebar">
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: '28px',
              boxSizing: 'border-box',
            }}>

              {/* CTA Buttons */}
              {(project.demo_url || project.github_url) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                  {project.demo_url && (
                    <a
                      href={project.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                      style={{
                        width: '100%',
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        padding: '13px 16px',
                        textDecoration: 'none',
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 700,
                        boxSizing: 'border-box',
                        transition: 'opacity 0.2s',
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                      Live Demo
                    </a>
                  )}
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="action-btn-outline"
                      style={{
                        width: '100%',
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        padding: '13px 16px',
                        textDecoration: 'none',
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 600,
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid var(--border)',
                        color: '#fff',
                        boxSizing: 'border-box',
                        transition: 'background 0.2s, border-color 0.2s',
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                      </svg>
                      View Repository
                    </a>
                  )}
                </div>
              )}

              {/* Tech Stack */}
              {(project.tech_stack?.length ?? 0) > 0 && (
                <div style={{ marginBottom: 28 }}>
                  <h4 style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--cyan)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginTop: 0,
                    marginBottom: 14,
                  }}>
                    Tech Stack
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {project.tech_stack.map((t: string) => (
                      <span
                        key={t}
                        className="tech-tag"
                        style={{
                          fontSize: 12,
                          padding: '5px 13px',
                          borderRadius: 8,
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid var(--border)',
                          color: '#fff',
                          transition: 'all 0.2s',
                          cursor: 'default',
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Divider */}
              <div style={{ borderTop: '1px solid var(--border)', marginBottom: 24 }}/>

              {/* Project Lead */}
              <div>
                <h4 style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginTop: 0,
                  marginBottom: 16,
                }}>
                  Project Lead
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  {/* Avatar — fixed: image rendered separately from initials fallback */}
                  {project.profiles?.photo_url ? (
                    <img
                      src={project.profiles.photo_url}
                      alt={project.profiles?.full_name}
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid rgba(0,212,255,0.25)',
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <div style={{
                      width: 46,
                      height: 46,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--cyan), #0066FF)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                      fontWeight: 700,
                      color: '#fff',
                      border: '2px solid rgba(0,212,255,0.2)',
                      flexShrink: 0,
                    }}>
                      {getInitials(project.profiles?.full_name)}
                    </div>
                  )}
                  <div>
                    <p style={{ color: '#fff', fontSize: 14, fontWeight: 600, margin: '0 0 3px' }}>
                      {project.profiles?.full_name || 'Team Member'}
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: 0 }}>
                      {settings.club_name}
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* ── Metadata stats bar ──────────────────────────────── */}
            <div
              className="project-stats-bar"
              style={{
                marginTop: 20,
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <StatCell
                label="Published"
                value={new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              />
              <div style={{ width: 1, background: 'var(--border)', alignSelf: 'stretch' }}/>
              <StatCell
                label="Status"
                value={project.status ?? 'Completed'}
                valueStyle={{ color: statusCfg.color }}
              />
              <div style={{ width: 1, background: 'var(--border)', alignSelf: 'stretch' }}/>
              <StatCell
                label="Category"
                value={project.category ?? 'Web Dev'}
              />
            </div>

          </div>

        </div>
      </Container>
    </div>
  )
}

// ── Small reusable stat cell ─────────────────────────────────────────
function StatCell({ label, value, valueStyle = {} }: { label: string; value: string; valueStyle?: React.CSSProperties }) {
  return (
    <div style={{ textAlign: 'center', flex: 1 }}>
      <p style={{
        color: 'var(--text-muted)',
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        margin: '0 0 5px',
        fontWeight: 600,
      }}>
        {label}
      </p>
      <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: 0, ...valueStyle }}>
        {value}
      </p>
    </div>
  )
}