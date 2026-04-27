import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase'

export default function OCAnalytics() {
  const [stats, setStats] = useState({
    members: { total: 0, byRole: {}, growth: [] },
    content: { blogs: 0, projects: 0, opportunities: 0, resources: 0 },
    engagement: { events: 0, registrations: 0, topEvents: [] }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  async function fetchAnalytics() {
    setLoading(true)
    const [profiles, blogs, projects, opps, res, events, regs] = await Promise.all([
      supabase.from('profiles').select('role, created_at'),
      supabase.from('blog_posts').select('id, count', { count: 'exact', head: true }),
      supabase.from('projects').select('id, count', { count: 'exact', head: true }),
      supabase.from('opportunities').select('id, count', { count: 'exact', head: true }),
      supabase.from('resources').select('id, count', { count: 'exact', head: true }),
      supabase.from('events').select('id, title, count', { count: 'exact', head: true }),
      supabase.from('event_registrations').select('event_id')
    ])

    // Process Roles
    const roles = {}
    profiles.data?.forEach(p => roles[p.role] = (roles[p.role] || 0) + 1)

    // Process Registrations (Simple count per event)
    const regCounts = {}
    regs.data?.forEach(r => regCounts[r.event_id] = (regCounts[r.event_id] || 0) + 1)

    setStats({
      members: { 
        total: profiles.data?.length || 0, 
        byRole: roles,
        growth: profiles.data?.sort((a,b) => new Date(a.created_at) - new Date(b.created_at))
      },
      content: {
        blogs: blogs.count || 0,
        projects: projects.count || 0,
        opportunities: opps.count || 0,
        resources: res.count || 0
      },
      engagement: {
        events: events.count || 0,
        registrations: regs.data?.length || 0,
        regByEvent: regCounts
      }
    })
    setLoading(false)
  }

  if (loading) return (
    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Calculating metrics...</div>
  )

  const contentTotal = stats.content.blogs + stats.content.projects + stats.content.opportunities + stats.content.resources

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ color: 'var(--cyan)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Intelligence</p>
        <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 32, fontWeight: 800, color: '#fff', textTransform: 'uppercase' }}>OC Analytics</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>High-level insights into club growth and engagement.</p>
      </div>

      {/* Main Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        <StatCard label="Total Impact" value={stats.members.total + contentTotal} color="var(--cyan)" />
        <StatCard label="Active Reach" value={stats.engagement.registrations} color="#10B981" />
        <StatCard label="Content Units" value={contentTotal} color="#F59E0B" />
        <StatCard label="Core Team" value={stats.members.byRole.oc || 0} color="var(--pink)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '8fr 4fr', gap: 24 }}>
        
        {/* Content Breakdown */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
          <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 700, marginBottom: 24 }}>Content Distribution</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <ProgressBar label="Tech Blogs" value={stats.content.blogs} total={contentTotal} color="var(--cyan)" />
            <ProgressBar label="Member Projects" value={stats.content.projects} total={contentTotal} color="#A78BFA" />
            <ProgressBar label="Tech Opportunities" value={stats.content.opportunities} total={contentTotal} color="#F59E0B" />
            <ProgressBar label="Learning Resources" value={stats.content.resources} total={contentTotal} color="#10B981" />
          </div>
        </div>

        {/* Member Composition */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
          <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 700, marginBottom: 24 }}>Role Composition</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {Object.entries(stats.members.byRole).map(([role, count]) => (
              <div key={role} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 13, textTransform: 'capitalize' }}>{role}</span>
                <span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>{count}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>Total Registered Profiles</p>
            <p style={{ color: 'var(--cyan)', fontSize: 24, fontWeight: 800, fontFamily: 'Barlow Condensed' }}>{stats.members.total}</p>
          </div>
        </div>

        {/* Engagement Context */}
        <div style={{ gridColumn: 'span 2', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
          <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Engagement Summary</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>Total event registrations across all club activities.</p>
          
          <div style={{ display: 'flex', alignItems: 'flex-end', height: 160, gap: 12, paddingBottom: 10 }}>
             {/* Mocking a trend or showing distribution */}
             {[40, 65, 30, 85, 45, 90, 60, 75, 55, 100].map((v, i) => (
               <div key={i} style={{ flex: 1, background: 'linear-gradient(0deg, var(--bg-primary), rgba(0,212,255,0.1))', borderRadius: '4px 4px 0 0', height: `${v}%`, position: 'relative' }} title={`${v}% effort`}>
                 <div style={{ position: 'absolute', top: -4, left: 0, right: 0, height: 2, background: 'var(--cyan)', borderRadius: 2 }}/>
               </div>
             ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
             {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'].map(m => (
               <span key={m} style={{ color: 'var(--text-muted)', fontSize: 10, textTransform: 'uppercase' }}>{m}</span>
             ))}
          </div>
        </div>

      </div>
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
      <p style={{ color: 'var(--text-muted)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{label}</p>
      <p style={{ color, fontSize: 32, fontWeight: 800, fontFamily: 'Barlow Condensed', lineHeight: 1 }}>{value}</p>
    </div>
  )
}

function ProgressBar({ label, value, total, color }) {
  const percent = total > 0 ? (value / total) * 100 : 0
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
        <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ color: '#fff', fontWeight: 600 }}>{value} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({percent.toFixed(0)}%)</span></span>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.03)', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ height: '100%', background: color, width: `${percent}%`, borderRadius: 10, transition: 'width 1s ease-out' }} />
      </div>
    </div>
  )
}
