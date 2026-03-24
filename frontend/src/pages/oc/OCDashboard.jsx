import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../utils/supabase'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../utils/formatDate'

export default function OCDashboard() {
  const { profile } = useAuth()
  const [stats, setStats] = useState({ members: 0, applications: 0, events: 0, permissions: 0, messages: 0 })
  const [applications, setApplications] = useState([])
  const [messages, setMessages] = useState([])
  const [permRequests, setPermRequests] = useState([])
  const [recentMembers, setRecentMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    const [membersRes, appsRes, eventsRes, permsRes, contactRes, recentRes, permReqRes] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('applications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('events').select('id', { count: 'exact', head: true }).in('status', ['upcoming', 'ongoing']),
      supabase.from('permission_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('contact_messages').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id, full_name, role, college_year, created_at').order('created_at', { ascending: false }).limit(5),
      supabase.from('permission_requests').select('*, profiles!requester_id(full_name, oc_position)').eq('status', 'pending').order('created_at', { ascending: false }).limit(5),
    ])

    setStats({
      members: membersRes.count || 0,
      applications: appsRes.count || 0,
      events: eventsRes.count || 0,
      permissions: permsRes.count || 0,
      messages: contactRes.count || 0,
    })

    // Fetch pending applications and recent messages
    const [pendingApps, recentMsgs] = await Promise.all([
      supabase.from('applications').select('*').eq('status', 'pending').order('created_at', { ascending: false }).limit(8),
      supabase.from('contact_messages').select('*').order('created_at', { ascending: false }).limit(5)
    ])

    setApplications(pendingApps.data || [])
    setMessages(recentMsgs.data || [])
    setRecentMembers(recentRes.data || [])
    setPermRequests(permReqRes.data || [])
    setLoading(false)
  }

  async function handleApplication(id, status) {
    await supabase.from('applications').update({ status, reviewed_by: profile?.id, reviewed_at: new Date().toISOString() }).eq('id', id)
    setApplications(prev => prev.filter(a => a.id !== id))
    setStats(prev => ({ ...prev, applications: prev.applications - 1 }))
  }

  async function handlePermission(id, status) {
    const req = permRequests.find(p => p.id === id)
    await supabase.from('permission_requests').update({ status, reviewed_by: profile?.id, reviewed_at: new Date().toISOString() }).eq('id', id)

    // If approved, add permission to the requester's profile
    if (status === 'approved' && req) {
      const { data: prof } = await supabase.from('profiles').select('extra_permissions').eq('id', req.requester_id).single()
      const existing = prof?.extra_permissions || []
      if (!existing.includes(req.permission_requested)) {
        await supabase.from('profiles').update({ extra_permissions: [...existing, req.permission_requested] }).eq('id', req.requester_id)
      }
    }

    setPermRequests(prev => prev.filter(p => p.id !== id))
    setStats(prev => ({ ...prev, permissions: prev.permissions - 1 }))
  }

  const isPresident = profile?.oc_position === 'president'

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ color: 'var(--cyan)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
          Overview
        </p>
        <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 32, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.01em' }}>
          Dashboard
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
          Welcome back, {profile?.full_name?.split(' ')[0]}. Here's what needs your attention.
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Total members',      value: stats.members,      color: 'var(--cyan)', link: '/oc/members' },
          { label: 'Pending apps',       value: stats.applications, color: '#F59E0B',     link: '/oc/applications' },
          { label: 'Active events',      value: stats.events,       color: '#A78BFA',     link: '/oc/events' },
          { label: 'New Messages',       value: stats.messages,     color: '#10B981',     link: '/oc/messages' },
          { label: 'Perm requests',      value: stats.permissions,  color: 'var(--pink)', link: '/oc/permissions' },
        ].map((s, i) => (
          <Link key={i} to={s.link} style={{ textDecoration: 'none' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 20px 16px', transition: 'border-color 0.2s, transform 0.2s', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <p style={{ color: 'var(--text-muted)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>{s.label}</p>
              <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 32, fontWeight: 800, color: s.color, lineHeight: 1 }}>
                {loading ? '—' : s.value}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>

        {/* Pending Applications */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>Pending Apps</h3>
            <Link to="/oc/applications" style={{ color: 'var(--cyan)', fontSize: 11, textDecoration: 'none' }}>View all →</Link>
          </div>
          <div>
            {loading ? (
              <div style={{ padding: 20 }}><Skeleton /></div>
            ) : applications.length === 0 ? (
              <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>No pending apps</div>
            ) : (
              applications.map((app) => (
                <div key={app.id} style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--cyan), #0066FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    {app.full_name?.[0]}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <p style={{ color: '#fff', fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.full_name}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 10 }}>{formatDate(app.created_at)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Messages */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>Recent Messages</h3>
            <Link to="/oc/messages" style={{ color: 'var(--cyan)', fontSize: 11, textDecoration: 'none' }}>View all →</Link>
          </div>
          <div>
            {loading ? (
              <div style={{ padding: 20 }}><Skeleton /></div>
            ) : messages.length === 0 ? (
              <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>No recent messages</div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, var(--pink), #00D4FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    {msg.full_name?.[0]}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <p style={{ color: '#fff', fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.full_name}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 10 }}>{msg.subject}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Permission Requests */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>Perm Requests</h3>
            <Link to="/oc/permissions" style={{ color: 'var(--cyan)', fontSize: 11, textDecoration: 'none' }}>View all →</Link>
          </div>
          <div>
            {!isPresident ? (
              <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>President only</div>
            ) : loading ? (
              <div style={{ padding: 20 }}><Skeleton /></div>
            ) : permRequests.length === 0 ? (
              <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>No pending requests</div>
            ) : (
              permRequests.map((req) => (
                <div key={req.id} style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--cyan)', flexShrink: 0 }}>
                    {req.profiles?.full_name?.[0]}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <p style={{ color: '#fff', fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.profiles?.full_name}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 10 }}>{req.permission_requested}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Members */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', marginTop: 24 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>Recent Members</h3>
          <Link to="/oc/members" style={{ color: 'var(--cyan)', fontSize: 12, textDecoration: 'none' }}>View all →</Link>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Member', 'Role', 'Year', 'Joined'].map(h => (
                <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ padding: 20 }}><Skeleton /></td></tr>
            ) : recentMembers.map((m) => (
              <tr key={m.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--cyan), #0066FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff' }}>
                      {m.full_name?.[0]}
                    </div>
                    <span style={{ color: '#fff', fontSize: 13 }}>{m.full_name}</span>
                  </div>
                </td>
                <td style={{ padding: '12px 20px' }}>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, textTransform: 'capitalize',
                    background: m.role === 'oc' ? 'rgba(255,45,155,0.1)' : m.role === 'executive' ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.06)',
                    color: m.role === 'oc' ? 'var(--pink)' : m.role === 'executive' ? 'var(--cyan)' : 'var(--text-muted)',
                    border: `1px solid ${m.role === 'oc' ? 'rgba(255,45,155,0.25)' : m.role === 'executive' ? 'rgba(0,212,255,0.25)' : 'var(--border)'}`,
                  }}>{m.role}</span>
                </td>
                <td style={{ padding: '12px 20px', color: 'var(--text-muted)', fontSize: 13 }}>Year {m.college_year || '—'}</td>
                <td style={{ padding: '12px 20px', color: 'var(--text-muted)', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>{formatDate(m.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Skeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[1,2,3].map(i => <div key={i} style={{ height: 12, borderRadius: 4, background: 'rgba(255,255,255,0.05)', width: `${60 + i * 10}%` }}/>)}
    </div>
  )
}