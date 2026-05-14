import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../utils/supabase'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../utils/formatters'
import { useEffect, useRef, useState } from 'react'

/* ─── Types ──────────────────────────────────────────────────── */
interface Profile {
  id: string
  full_name: string
  role: string
  college_year: number | null
  created_at: string
}

interface Application {
  id: string
  full_name: string
  created_at: string
  status: string
}

interface PermissionRequest {
  id: string
  permission_requested: string
  created_at: string
  profiles?: { full_name: string; oc_position: string }
}

interface ContactMessage {
  id: string
  full_name: string
  subject: string
  created_at: string
}

interface DashboardStats {
  members: number
  applications: number
  events: number
  permissions: number
  messages: number
}

interface DashboardData {
  stats: DashboardStats
  recentMembers: Profile[]
  permRequests: PermissionRequest[]
  applications: Application[]
  messages: ContactMessage[]
}

/* ─── CSS variables injected once ───────────────────────────── */
const CSS_VARS = `
  :root {
    --bg-base:       #080e1a;
    --bg-card:       #0d1829;
    --bg-card-hover: #101f35;
    --border:        rgba(255,255,255,0.07);
    --border-hover:  rgba(255,255,255,0.13);

    --cyan:   #00C8F0;
    --amber:  #F0A500;
    --violet: #9B7EF5;
    --green:  #00C08B;
    --rose:   #F0306E;

    --text-primary:   #FFFFFF;
    --text-secondary: rgba(255,255,255,0.5);
    --text-muted:     rgba(255,255,255,0.25);

    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 16px;

    --font-display: 'Barlow Condensed', sans-serif;
  }

  @keyframes skeletonPulse {
    0%, 100% { opacity: 0.3; }
    50%       { opacity: 0.7; }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
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

/* ─── SVG Icons (no emojis) ──────────────────────────────────── */
const Icon = {
  Members: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Apps: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  Events: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Messages: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Key: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  ),
  Lock: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Check: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  ChevronRight: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  User: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
}

/* ─── Stat card ──────────────────────────────────────────────── */
function StatCard({ label, value, color, IconComp, link, loading, delay }: {
  label: string
  value: number
  color: string
  IconComp: React.FC
  link: string
  loading: boolean
  delay: number
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <Reveal delay={delay}>
      <Link to={link} style={{ textDecoration: 'none', display: 'block' }}>
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            background: hovered ? 'var(--bg-card-hover)' : 'var(--bg-card)',
            border: `1px solid ${hovered ? 'var(--border-hover)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            transform: hovered ? 'translateY(-2px)' : 'none',
            boxShadow: hovered ? `0 16px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)` : '0 2px 8px rgba(0,0,0,0.2)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Left accent border */}
          <div style={{
            position: 'absolute',
            left: 0, top: 0, bottom: 0,
            width: 3,
            background: color,
            opacity: hovered ? 1 : 0.4,
            transition: 'opacity 0.2s ease',
            borderRadius: '0 2px 2px 0',
          }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
            <p style={{
              color: 'var(--text-muted)',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
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

          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: 40,
            fontWeight: 800,
            color: loading ? 'rgba(255,255,255,0.1)' : color,
            margin: 0,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            transition: 'color 0.2s',
          }}>
            {loading ? '—' : value}
          </p>
        </div>
      </Link>
    </Reveal>
  )
}

/* ─── Panel card ──────────────────────────────────────────────── */
function Panel({ title, link, children, delay = 0 }: {
  title: string; link: string; children: React.ReactNode; delay?: number
}) {
  return (
    <Reveal delay={delay} style={{ height: '100%' }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: 13, fontWeight: 600, letterSpacing: '0.01em' }}>{title}</p>
          <Link to={link} style={{
            display: 'flex', alignItems: 'center', gap: 4,
            color: 'var(--cyan)',
            fontSize: 11,
            fontWeight: 600,
            textDecoration: 'none',
            opacity: 0.8,
            letterSpacing: '0.03em',
            transition: 'opacity 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.8')}
          >
            View all <Icon.ChevronRight />
          </Link>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>{children}</div>
      </div>
    </Reveal>
  )
}

/* ─── Avatar ─────────────────────────────────────────────────── */
const GRADIENTS = [
  'linear-gradient(135deg,#00C8F0,#0055CC)',
  'linear-gradient(135deg,#9B7EF5,#5533CC)',
  'linear-gradient(135deg,#F0306E,#991144)',
  'linear-gradient(135deg,#00C08B,#006655)',
  'linear-gradient(135deg,#F0A500,#CC6600)',
]
function Avatar({ name, index = 0, shape = 'circle' }: { name: string; index?: number; shape?: 'circle' | 'square' }) {
  const initials = name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?'
  return (
    <div style={{
      width: 32, height: 32,
      borderRadius: shape === 'circle' ? '50%' : 'var(--radius-sm)',
      background: GRADIENTS[index % GRADIENTS.length],
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 11, fontWeight: 700, color: '#fff',
      flexShrink: 0,
      letterSpacing: '0.04em',
    }}>
      {initials}
    </div>
  )
}

/* ─── Row item ───────────────────────────────────────────────── */
function RowItem({ children }: { children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '10px 18px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: hovered ? 'rgba(255,255,255,0.02)' : 'transparent',
        transition: 'background 0.15s ease',
      }}
    >
      {children}
    </div>
  )
}

/* ─── Empty state ────────────────────────────────────────────── */
function Empty({ text }: { text: string }) {
  return (
    <div style={{
      padding: '36px 18px',
      textAlign: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 'var(--radius-sm)',
        background: 'rgba(0,200,143,0.08)',
        border: '1px solid rgba(0,200,143,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--green)',
        marginBottom: 2,
      }}>
        <Icon.Check />
      </div>
      <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 12 }}>{text}</p>
    </div>
  )
}

/* ─── Skeleton ───────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[70, 50, 60].map((w, i) => (
        <div key={i} style={{
          height: 9, borderRadius: 5,
          background: 'rgba(255,255,255,0.05)',
          width: `${w}%`,
          animation: 'skeletonPulse 1.6s ease-in-out infinite',
          animationDelay: `${i * 0.18}s`,
        }} />
      ))}
    </div>
  )
}

/* ─── Role badge ──────────────────────────────────────────────── */
function RoleBadge({ role }: { role: string }) {
  const map: Record<string, { bg: string; text: string; border: string }> = {
    oc: { bg: 'rgba(240,48,110,0.1)', text: 'var(--rose)', border: 'rgba(240,48,110,0.22)' },
    executive: { bg: 'rgba(0,200,240,0.1)', text: 'var(--cyan)', border: 'rgba(0,200,240,0.22)' },
    member: { bg: 'rgba(255,255,255,0.05)', text: 'var(--text-secondary)', border: 'rgba(255,255,255,0.1)' },
  }
  const c = map[role] || map.member
  return (
    <span style={{
      fontSize: 10, fontWeight: 700,
      padding: '2px 8px',
      borderRadius: 20,
      border: `1px solid ${c.border}`,
      background: c.bg,
      color: c.text,
      textTransform: 'capitalize',
      letterSpacing: '0.05em',
      whiteSpace: 'nowrap',
    }}>
      {role}
    </span>
  )
}

/* ─── Status badge ───────────────────────────────────────────── */
function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, letterSpacing: '0.09em',
      padding: '2px 8px', borderRadius: 20,
      background: color + '15',
      border: `1px solid ${color}28`,
      color,
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
    }}>{label}</span>
  )
}

/* ─── Divider ────────────────────────────────────────────────── */
function SectionDivider({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '28px 0 16px' }}>
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

/* ─── Main dashboard ─────────────────────────────────────────── */
export default function OCDashboard() {
  const { profile } = useAuth()

  const { data, isLoading: loading, isError } = useQuery<DashboardData>({
    queryKey: ['oc-dashboard-stats'],
    queryFn: async () => {
      const [membersRes, appsRes, eventsRes, permsRes, contactRes, recentRes, permReqRes, pendingAppsRes, recentMsgsRes] =
        await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('applications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('events').select('id', { count: 'exact', head: true }).in('status', ['upcoming', 'ongoing']),
          supabase.from('permission_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('contact_messages').select('id', { count: 'exact', head: true }),
          supabase.from('profiles').select('id, full_name, role, college_year, created_at').order('created_at', { ascending: false }).limit(5),
          supabase.from('permission_requests').select('*, profiles!requester_id(full_name, oc_position)').eq('status', 'pending').order('created_at', { ascending: false }).limit(5),
          supabase.from('applications').select('*').eq('status', 'pending').order('created_at', { ascending: false }).limit(8),
          supabase.from('contact_messages').select('*').order('created_at', { ascending: false }).limit(5),
        ])
      return {
        stats: {
          members: membersRes.count || 0,
          applications: appsRes.count || 0,
          events: eventsRes.count || 0,
          permissions: permsRes.count || 0,
          messages: contactRes.count || 0,
        },
        recentMembers: recentRes.data || [],
        permRequests: permReqRes.data || [],
        applications: pendingAppsRes.data || [],
        messages: recentMsgsRes.data || [],
      }
    },
  })

  const stats = data?.stats ?? { members: 0, applications: 0, events: 0, permissions: 0, messages: 0 }
  const recentMembers = data?.recentMembers ?? []
  const permRequests = data?.permRequests ?? []
  const applications = data?.applications ?? []
  const messages = data?.messages ?? []
  const isPresident = profile?.oc_position === 'president'
  const firstName = profile?.full_name?.split(' ')[0]

  const statCards = [
    { label: 'Total members', value: stats.members, color: 'var(--cyan)', IconComp: Icon.Members, link: '/oc/members' },
    { label: 'Pending apps', value: stats.applications, color: 'var(--amber)', IconComp: Icon.Apps, link: '/oc/applications' },
    { label: 'Active events', value: stats.events, color: 'var(--violet)', IconComp: Icon.Events, link: '/oc/events' },
    { label: 'New messages', value: stats.messages, color: 'var(--green)', IconComp: Icon.Messages, link: '/oc/messages' },
    { label: 'Perm requests', value: stats.permissions, color: 'var(--rose)', IconComp: Icon.Key, link: '/oc/permissions' },
  ]

  return (
    <>
      <style>{CSS_VARS}</style>

      <div style={{ padding: '0 0 48px' }}>

        {/* ── Error state ─────────────────────────────── */}
        {isError && (
          <div style={{
            marginBottom: 20,
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(240,48,110,0.08)',
            border: '1px solid rgba(240,48,110,0.2)',
            color: 'var(--rose)',
            fontSize: 13,
          }}>
            Failed to load dashboard data. Please refresh the page.
          </div>
        )}

        {/* ── Page header ─────────────────────────────── */}
        <div style={{ marginBottom: 32, animation: 'fadeUp 0.4s ease both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 3, height: 16, background: 'var(--cyan)', borderRadius: 2 }} />
            <p style={{
              color: 'var(--cyan)',
              fontSize: 10, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.14em',
              margin: 0,
            }}>Overview</p>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 36,
            fontWeight: 800,
            color: 'var(--text-primary)',
            textTransform: 'uppercase',
            letterSpacing: '-0.01em',
            margin: '0 0 8px',
          }}>Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0, lineHeight: 1.5 }}>
            Welcome back,{' '}
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{firstName}</span>.
            {' '}Here's what needs your attention.
          </p>
        </div>

        {/* ── Stat cards ──────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 12,
          marginBottom: 8,
        }}>
          {statCards.map((s, i) => (
            <StatCard key={i} {...s} loading={loading} delay={i * 0.06} />
          ))}
        </div>

        {/* ── Panels ──────────────────────────────────── */}
        <SectionDivider label="Activity" />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 14,
          marginBottom: 14,
          alignItems: 'start',
        }}>

          {/* Pending Applications */}
          <Panel title="Pending applications" link="/oc/applications" delay={0.1}>
            {loading ? <Skeleton /> : applications.length === 0 ? (
              <Empty text="No pending applications" />
            ) : (
              applications.map((app, idx) => (
                <RowItem key={app.id}>
                  <Avatar name={app.full_name} index={idx} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {app.full_name}
                    </p>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 10, marginTop: 2 }}>
                      {formatDate(app.created_at)}
                    </p>
                  </div>
                  <StatusBadge label="Pending" color="var(--amber)" />
                </RowItem>
              ))
            )}
          </Panel>

          {/* Recent Messages */}
          <Panel title="Recent messages" link="/oc/messages" delay={0.16}>
            {loading ? <Skeleton /> : messages.length === 0 ? (
              <Empty text="No new messages" />
            ) : (
              messages.map((msg, idx) => (
                <RowItem key={msg.id}>
                  <Avatar name={msg.full_name} index={idx + 2} shape="square" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {msg.full_name}
                    </p>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
                      {msg.subject}
                    </p>
                  </div>
                </RowItem>
              ))
            )}
          </Panel>

          {/* Permission Requests */}
          <Panel title="Permission requests" link="/oc/permissions" delay={0.22}>
            {!isPresident ? (
              <div style={{
                padding: '32px 18px',
                textAlign: 'center',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 'var(--radius-sm)',
                  background: 'rgba(240,48,110,0.08)',
                  border: '1px solid rgba(240,48,110,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--rose)',
                }}>
                  <Icon.Lock />
                </div>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 11 }}>President access only</p>
              </div>
            ) : loading ? <Skeleton /> : permRequests.length === 0 ? (
              <Empty text="No pending requests" />
            ) : (
              permRequests.map((req, idx) => (
                <RowItem key={req.id}>
                  <Avatar name={req.profiles?.full_name ?? '?'} index={idx + 4} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {req.profiles?.full_name}
                    </p>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
                      {req.permission_requested}
                    </p>
                  </div>
                </RowItem>
              ))
            )}
          </Panel>
        </div>

        {/* ── Recent Members ───────────────────────────── */}
        <SectionDivider label="Recent Members" />
        <Reveal delay={0.28}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '14px 20px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: 13, fontWeight: 600 }}>Recent members</p>
                {!loading && recentMembers.length > 0 && (
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    padding: '1px 7px', borderRadius: 20,
                    background: 'rgba(0,200,240,0.1)',
                    border: '1px solid rgba(0,200,240,0.2)',
                    color: 'var(--cyan)',
                    letterSpacing: '0.04em',
                  }}>{recentMembers.length}</span>
                )}
              </div>
              <Link to="/oc/members" style={{
                display: 'flex', alignItems: 'center', gap: 4,
                color: 'var(--cyan)', fontSize: 11, fontWeight: 600, textDecoration: 'none', opacity: 0.8,
              }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '0.8')}
              >
                View all <Icon.ChevronRight />
              </Link>
            </div>

            {loading ? (
              <div style={{ padding: '6px 0' }}><Skeleton /></div>
            ) : recentMembers.length === 0 ? (
              <Empty text="No members yet" />
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Member', 'Role', 'Year', 'Joined'].map(h => (
                      <th key={h} scope="col" style={{
                        padding: '9px 20px',
                        textAlign: 'left',
                        fontSize: 10,
                        fontWeight: 700,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentMembers.map((m, idx) => (
                    <MemberRow key={m.id} m={m} idx={idx} last={idx === recentMembers.length - 1} />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Reveal>
      </div>
    </>
  )
}

/* ─── Member row ─────────────────────────────────────────────── */
function MemberRow({ m, idx, last }: { m: Profile; idx: number; last: boolean }) {
  const [hovered, setHovered] = useState(false)
  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.04)',
        background: hovered ? 'rgba(255,255,255,0.02)' : 'transparent',
        transition: 'background 0.15s ease',
      }}
    >
      <td style={{ padding: '11px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name={m.full_name} index={idx} />
          <span style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 500 }}>{m.full_name}</span>
        </div>
      </td>
      <td style={{ padding: '11px 20px' }}>
        <RoleBadge role={m.role} />
      </td>
      <td style={{ padding: '11px 20px', color: 'var(--text-secondary)', fontSize: 13 }}>
        {m.college_year ? `Year ${m.college_year}` : '—'}
      </td>
      <td style={{ padding: '11px 20px', color: 'var(--text-muted)', fontSize: 12, fontFamily: 'monospace' }}>
        {formatDate(m.created_at)}
      </td>
    </tr>
  )
}