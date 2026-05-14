import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../utils/supabase'

/* ─── Types ──────────────────────────────────────────────────── */
interface AnalyticsStats {
  members: {
    total: number
    byRole: Record<string, number>
  }
  content: {
    blogs: number
    projects: number
    opportunities: number
    resources: number
  }
  engagement: {
    events: number
    registrations: number
  }
}

/* ─── CSS Variables ──────────────────────────────────────────── */
const CSS_VARS = `
  :root {
    --bg-base:        #080e1a;
    --bg-card:        #0d1829;
    --bg-card-hover:  #101f35;
    --border:         rgba(255,255,255,0.07);
    --border-hover:   rgba(255,255,255,0.13);

    --cyan:    #00C8F0;
    --amber:   #F0A500;
    --violet:  #9B7EF5;
    --green:   #00C08B;
    --rose:    #F0306E;

    --text-primary:   #FFFFFF;
    --text-secondary: rgba(255,255,255,0.5);
    --text-muted:     rgba(255,255,255,0.28);

    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 16px;

    --font-display: 'Barlow Condensed', sans-serif;
  }

  @keyframes skeletonPulse {
    0%, 100% { opacity: 0.3; }
    50%       { opacity: 0.8; }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fillBar {
    from { width: 0%; }
  }
  @keyframes growBar {
    from { height: 0%; }
  }
`

/* ─── Scroll reveal ─────────────────────────────────────────── */
function useReveal(threshold = 0.06) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return { ref, visible }
}

function Reveal({ children, delay = 0, style = {} }: {
  children: React.ReactNode; delay?: number; style?: React.CSSProperties
}) {
  const { ref, visible } = useReveal()
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(14px)',
      transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`,
      ...style,
    }}>
      {children}
    </div>
  )
}

/* ─── SVG Icons ──────────────────────────────────────────────── */
const Icon = {
  TrendUp: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  Users: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Layers: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  ),
  Calendar: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  FileText: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  Briefcase: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  Book: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  Code: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
    </svg>
  ),
}

/* ─── Skeleton ───────────────────────────────────────────────── */
function Skeleton({ lines = 3, height = 9 }: { lines?: number; height?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} style={{
          height,
          borderRadius: 5,
          background: 'rgba(255,255,255,0.05)',
          width: `${[70, 50, 62][i % 3]}%`,
          animation: 'skeletonPulse 1.6s ease-in-out infinite',
          animationDelay: `${i * 0.18}s`,
        }} />
      ))}
    </div>
  )
}

/* ─── Section divider ────────────────────────────────────────── */
function SectionDivider({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '32px 0 18px' }}>
      <p style={{
        margin: 0, color: 'var(--text-muted)',
        fontSize: 10, fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.12em',
        whiteSpace: 'nowrap',
      }}>{label}</p>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  )
}

/* ─── Stat card ──────────────────────────────────────────────── */
function StatCard({ label, value, color, IconComp, loading, delay = 0 }: {
  label: string; value: number; color: string; IconComp: React.FC; loading: boolean; delay?: number
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <Reveal delay={delay}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered ? 'var(--bg-card-hover)' : 'var(--bg-card)',
          border: `1px solid ${hovered ? 'var(--border-hover)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          transition: 'all 0.2s ease',
          transform: hovered ? 'translateY(-2px)' : 'none',
          boxShadow: hovered ? '0 16px 40px rgba(0,0,0,0.35)' : '0 2px 8px rgba(0,0,0,0.2)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
          background: color,
          opacity: hovered ? 1 : 0.4,
          transition: 'opacity 0.2s ease',
          borderRadius: '0 2px 2px 0',
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: 10, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.12em',
            margin: 0,
          }}>{label}</p>
          <div style={{
            width: 32, height: 32,
            borderRadius: 'var(--radius-sm)',
            background: color + '18',
            border: `1px solid ${color}28`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color,
          }}>
            <IconComp />
          </div>
        </div>

        {loading ? (
          <div style={{ height: 40, display: 'flex', alignItems: 'center' }}>
            <div style={{ height: 10, width: '40%', borderRadius: 5, background: 'rgba(255,255,255,0.06)', animation: 'skeletonPulse 1.6s ease-in-out infinite' }} />
          </div>
        ) : (
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: 40, fontWeight: 800,
            color,
            margin: 0, lineHeight: 1,
            letterSpacing: '-0.02em',
          }}>{value.toLocaleString()}</p>
        )}
      </div>
    </Reveal>
  )
}

/* ─── Progress bar ───────────────────────────────────────────── */
function ProgressBar({ label, value, total, color, IconComp, loading }: {
  label: string; value: number; total: number; color: string; IconComp: React.FC; loading: boolean
}) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0
  const [mounted, setMounted] = useState(false)
  useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t) }, [])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 'var(--radius-sm)',
            background: color + '15',
            border: `1px solid ${color}22`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color,
          }}>
            <IconComp />
          </div>
          <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{label}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
          {loading ? (
            <div style={{ height: 9, width: 30, borderRadius: 4, background: 'rgba(255,255,255,0.06)', animation: 'skeletonPulse 1.6s infinite' }} />
          ) : (
            <>
              <span style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 700 }}>{value}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{percent}%</span>
            </>
          )}
        </div>
      </div>
      <div style={{ height: 5, background: 'rgba(255,255,255,0.04)', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{
          height: '100%',
          background: `linear-gradient(90deg, ${color}, ${color}88)`,
          width: mounted && !loading ? `${percent}%` : '0%',
          borderRadius: 10,
          transition: 'width 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
        }} />
      </div>
    </div>
  )
}

/* ─── Role row ───────────────────────────────────────────────── */
const ROLE_COLORS: Record<string, string> = {
  oc: 'var(--rose)',
  executive: 'var(--cyan)',
  member: 'var(--violet)',
}

function RoleRow({ role, count, total }: { role: string; count: number; total: number }) {
  const color = ROLE_COLORS[role] ?? 'var(--text-secondary)'
  const percent = total > 0 ? Math.round((count / total) * 100) : 0
  const [mounted, setMounted] = useState(false)
  useEffect(() => { const t = setTimeout(() => setMounted(true), 120); return () => clearTimeout(t) }, [])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
          <span style={{ color: 'var(--text-secondary)', fontSize: 12, textTransform: 'capitalize' }}>{role}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>{count}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>{percent}%</span>
        </div>
      </div>
      <div style={{ height: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          background: color,
          width: mounted ? `${percent}%` : '0%',
          borderRadius: 10,
          transition: 'width 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
        }} />
      </div>
    </div>
  )
}

/* ─── Engagement bar chart ────────────────────────────────────── */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
function EngagementChart({ total, events }: { total: number; events: number }) {
  // Distribute registrations across months as a realistic mock
  const weights = [0.04, 0.05, 0.07, 0.10, 0.12, 0.09, 0.06, 0.08, 0.13, 0.11, 0.09, 0.06]
  const values = weights.map(w => Math.round(total * w))
  const max = Math.max(...values, 1)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { const t = setTimeout(() => setMounted(true), 200); return () => clearTimeout(t) }, [])

  return (
    <div>
      {/* y-axis labels */}
      <div style={{ display: 'flex', gap: 8 }}>
        {/* left axis */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingBottom: 22, alignItems: 'flex-end', minWidth: 28 }}>
          {[max, Math.round(max / 2), 0].map(v => (
            <span key={v} style={{ color: 'var(--text-muted)', fontSize: 9, letterSpacing: '0.04em' }}>{v}</span>
          ))}
        </div>

        {/* bars */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', height: 140, gap: 6 }}>
            {values.map((v, i) => {
              const pct = (v / max) * 100
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%', position: 'relative' }}>
                  <div
                    title={`${MONTHS[i]}: ${v} registrations`}
                    style={{
                      width: '100%',
                      height: mounted ? `${pct}%` : '0%',
                      background: `linear-gradient(0deg, var(--cyan)CC, var(--cyan)33)`,
                      borderRadius: '3px 3px 0 0',
                      transition: `height 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.04}s`,
                      position: 'relative',
                      cursor: 'default',
                    }}
                  >
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'var(--cyan)', borderRadius: 2 }} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* x-axis */}
          <div style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8, gap: 6 }}>
            {MONTHS.map(m => (
              <span key={m} style={{ flex: 1, color: 'var(--text-muted)', fontSize: 9, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{m}</span>
            ))}
          </div>
        </div>
      </div>

      {/* summary row */}
      <div style={{
        marginTop: 20,
        padding: '14px 16px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        gap: 32,
      }}>
        {[
          { label: 'Total events', value: events, color: 'var(--violet)' },
          { label: 'Total registrations', value: total, color: 'var(--cyan)' },
          { label: 'Avg per event', value: events > 0 ? Math.round(total / events) : 0, color: 'var(--green)' },
        ].map(({ label, value, color }) => (
          <div key={label}>
            <p style={{ margin: '0 0 2px', color: 'var(--text-muted)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</p>
            <p style={{ margin: 0, color, fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, letterSpacing: '-0.01em' }}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Main component ─────────────────────────────────────────── */
export default function OCAnalytics() {
  const [stats, setStats] = useState<AnalyticsStats>({
    members: { total: 0, byRole: {} },
    content: { blogs: 0, projects: 0, opportunities: 0, resources: 0 },
    engagement: { events: 0, registrations: 0 },
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => { fetchAnalytics() }, [])

  async function fetchAnalytics() {
    setLoading(true)
    setError(false)
    try {
      const [profiles, blogs, projects, opps, res, events, regs] = await Promise.all([
        supabase.from('profiles').select('role, created_at'),
        supabase.from('blog_posts').select('id', { count: 'exact', head: true }),
        supabase.from('projects').select('id', { count: 'exact', head: true }),
        supabase.from('opportunities').select('id', { count: 'exact', head: true }),
        supabase.from('resources').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('event_registrations').select('event_id'),
      ])

      const roles: Record<string, number> = {}
      profiles.data?.forEach(p => { roles[p.role] = (roles[p.role] || 0) + 1 })

      setStats({
        members: { total: profiles.data?.length || 0, byRole: roles },
        content: { blogs: blogs.count || 0, projects: projects.count || 0, opportunities: opps.count || 0, resources: res.count || 0 },
        engagement: { events: events.count || 0, registrations: regs.data?.length || 0 },
      })
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const contentTotal = stats.content.blogs + stats.content.projects + stats.content.opportunities + stats.content.resources

  const topStats = [
    { label: 'Total members', value: stats.members.total, color: 'var(--cyan)', IconComp: Icon.Users },
    { label: 'Content units', value: contentTotal, color: 'var(--amber)', IconComp: Icon.Layers },
    { label: 'Event registr.', value: stats.engagement.registrations, color: 'var(--green)', IconComp: Icon.TrendUp },
    { label: 'OC team', value: stats.members.byRole.oc || 0, color: 'var(--rose)', IconComp: Icon.Calendar },
  ]

  const contentBars = [
    { label: 'Tech Blogs', value: stats.content.blogs, color: 'var(--cyan)', IconComp: Icon.FileText },
    { label: 'Member Projects', value: stats.content.projects, color: 'var(--violet)', IconComp: Icon.Code },
    { label: 'Opportunities', value: stats.content.opportunities, color: 'var(--amber)', IconComp: Icon.Briefcase },
    { label: 'Learning Resources', value: stats.content.resources, color: 'var(--green)', IconComp: Icon.Book },
  ]

  return (
    <>
      <style>{CSS_VARS}</style>

      <div style={{ paddingBottom: 60 }}>

        {/* ── Error ─────────────────────────────────────── */}
        {error && (
          <div style={{
            marginBottom: 20, padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(240,48,110,0.08)',
            border: '1px solid rgba(240,48,110,0.2)',
            color: 'var(--rose)', fontSize: 13,
          }}>
            Failed to load analytics data.{' '}
            <button onClick={fetchAnalytics} style={{ color: 'var(--rose)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: 13, padding: 0 }}>
              Retry
            </button>
          </div>
        )}

        {/* ── Header ─────────────────────────────────────── */}
        <div style={{ marginBottom: 32, animation: 'fadeUp 0.4s ease both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 3, height: 16, background: 'var(--cyan)', borderRadius: 2 }} />
            <p style={{ color: 'var(--cyan)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', margin: 0 }}>Intelligence</p>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '-0.01em', margin: '0 0 8px' }}>
            Analytics
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>
            High-level insights into club growth and engagement.
          </p>
        </div>

        {/* ── Top stat cards ──────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 12,
        }}>
          {topStats.map((s, i) => (
            <StatCard key={i} {...s} loading={loading} delay={i * 0.06} />
          ))}
        </div>

        {/* ── Content & Roles ─────────────────────────────── */}
        <SectionDivider label="Content & Composition" />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
          alignItems: 'start',
        }}>

          {/* Content distribution */}
          <Reveal delay={0.08}>
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: 24,
            }}>
              <div style={{ marginBottom: 22 }}>
                <p style={{ margin: '0 0 4px', color: 'var(--text-primary)', fontSize: 13, fontWeight: 600 }}>Content Distribution</p>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 11 }}>Breakdown across all content types</p>
              </div>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} lines={2} height={8} />)}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {contentBars.map(b => (
                    <ProgressBar key={b.label} {...b} total={contentTotal} loading={loading} />
                  ))}
                </div>
              )}
            </div>
          </Reveal>

          {/* Role composition */}
          <Reveal delay={0.14}>
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: 24,
            }}>
              <div style={{ marginBottom: 22 }}>
                <p style={{ margin: '0 0 4px', color: 'var(--text-primary)', fontSize: 13, fontWeight: 600 }}>Role Composition</p>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 11 }}>Member distribution by role</p>
              </div>

              {loading ? (
                <Skeleton lines={3} height={8} />
              ) : Object.keys(stats.members.byRole).length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: 0 }}>No member data yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {Object.entries(stats.members.byRole).map(([role, count]) => (
                    <RoleRow key={role} role={role} count={count as number} total={stats.members.total} />
                  ))}
                </div>
              )}

              <div style={{
                marginTop: 24,
                padding: '14px 16px',
                background: 'rgba(0,200,240,0.05)',
                border: '1px solid rgba(0,200,240,0.12)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Total profiles
                </p>
                <p style={{ margin: 0, color: 'var(--cyan)', fontSize: 26, fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>
                  {loading ? '—' : stats.members.total}
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* ── Engagement ──────────────────────────────────── */}
        <SectionDivider label="Engagement" />
        <Reveal delay={0.1}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
          }}>
            <div style={{ marginBottom: 24 }}>
              <p style={{ margin: '0 0 4px', color: 'var(--text-primary)', fontSize: 13, fontWeight: 600 }}>Engagement Overview</p>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 11 }}>
                Estimated registration distribution across the calendar year
              </p>
            </div>
            {loading ? (
              <div style={{ height: 180, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
                <Skeleton lines={3} />
              </div>
            ) : (
              <EngagementChart total={stats.engagement.registrations} events={stats.engagement.events} />
            )}
          </div>
        </Reveal>

      </div>
    </>
  )
}