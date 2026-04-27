import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../utils/supabase'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../utils/formatters'

export default function OCDashboard() {
  const { profile } = useAuth()
  
  const { data, isLoading: loading } = useQuery({
    queryKey: ['oc-dashboard-stats'],
    queryFn: async () => {
      const [membersRes, appsRes, eventsRes, permsRes, contactRes, recentRes, permReqRes, pendingAppsRes, recentMsgsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('applications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('events').select('id', { count: 'exact', head: true }).in('status', ['upcoming', 'ongoing']),
        supabase.from('permission_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('contact_messages').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id, full_name, role, college_year, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('permission_requests').select('*, profiles!requester_id(full_name, oc_position)').eq('status', 'pending').order('created_at', { ascending: false }).limit(5),
        supabase.from('applications').select('*').eq('status', 'pending').order('created_at', { ascending: false }).limit(8),
        supabase.from('contact_messages').select('*').order('created_at', { ascending: false }).limit(5)
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
        messages: recentMsgsRes.data || []
      }
    }
  })

  // We fall back to empty defaults if undefined
  const stats = data?.stats || { members: 0, applications: 0, events: 0, permissions: 0, messages: 0 }
  const recentMembers = data?.recentMembers || []
  const permRequests = data?.permRequests || []
  const applications = data?.applications || []
  const messages = data?.messages || []

  const isPresident = profile?.oc_position === 'president'

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <p className="text-[#00D4FF] text-[11px] font-bold uppercase tracking-[0.1em] mb-1.5">
          Overview
        </p>
        <h1 className="font-['Barlow_Condensed',sans-serif] text-[32px] font-extrabold text-white uppercase tracking-[-0.01em]">
          Dashboard
        </h1>
        <p className="text-gray-400 text-[13px] mt-1">
          Welcome back, {profile?.full_name?.split(' ')[0]}. Here's what needs your attention.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Total members',      value: stats.members,      color: 'text-[#00D4FF]', link: '/oc/members' },
          { label: 'Pending apps',       value: stats.applications, color: 'text-[#F59E0B]', link: '/oc/applications' },
          { label: 'Active events',      value: stats.events,       color: 'text-[#A78BFA]', link: '/oc/events' },
          { label: 'New Messages',       value: stats.messages,     color: 'text-[#10B981]', link: '/oc/messages' },
          { label: 'Perm requests',      value: stats.permissions,  color: 'text-[#FF2D9B]', link: '/oc/permissions' },
        ].map((s, i) => (
          <Link key={i} to={s.link} className="no-underline">
            <div className="bg-[#0D1829] border border-white/10 rounded-xl p-5 pb-4 transition-all duration-200 cursor-pointer hover:border-[#00D4FF]/20 hover:-translate-y-0.5">
              <p className="text-gray-400 text-[10px] uppercase tracking-[0.08em] mb-2.5">{s.label}</p>
              <p className={`font-['Barlow_Condensed',sans-serif] text-[32px] font-extrabold leading-none ${s.color}`}>
                {loading ? '—' : s.value}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">

        {/* Pending Applications */}
        <div className="bg-[#0D1829] border border-white/10 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-white text-[13px] font-semibold">Pending Apps</h3>
            <Link to="/oc/applications" className="text-[#00D4FF] text-[11px] no-underline">View all →</Link>
          </div>
          <div>
            {loading ? (
              <div className="p-5"><Skeleton /></div>
            ) : applications.length === 0 ? (
              <div className="py-8 px-5 text-center text-gray-400 text-[12px]">No pending apps</div>
            ) : (
              applications.map((app) => (
                <div key={app.id} className="px-5 py-3 border-b border-white/10 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00D4FF] to-[#0066FF] flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                    {app.full_name?.[0]}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-white text-[12px] font-medium overflow-hidden text-ellipsis whitespace-nowrap">{app.full_name}</p>
                    <p className="text-gray-400 text-[10px]">{formatDate(app.created_at)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="bg-[#0D1829] border border-white/10 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-white text-[13px] font-semibold">Recent Messages</h3>
            <Link to="/oc/messages" className="text-[#00D4FF] text-[11px] no-underline">View all →</Link>
          </div>
          <div>
            {loading ? (
              <div className="p-5"><Skeleton /></div>
            ) : messages.length === 0 ? (
              <div className="py-8 px-5 text-center text-gray-400 text-[12px]">No recent messages</div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="px-5 py-3 border-b border-white/10 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#FF2D9B] to-[#00D4FF] flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                    {msg.full_name?.[0]}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-white text-[12px] font-medium overflow-hidden text-ellipsis whitespace-nowrap">{msg.full_name}</p>
                    <p className="text-gray-400 text-[10px]">{msg.subject}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Permission Requests */}
        <div className="bg-[#0D1829] border border-white/10 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-white text-[13px] font-semibold">Perm Requests</h3>
            <Link to="/oc/permissions" className="text-[#00D4FF] text-[11px] no-underline">View all →</Link>
          </div>
          <div>
            {!isPresident ? (
              <div className="py-8 px-5 text-center text-gray-400 text-[12px]">President only</div>
            ) : loading ? (
              <div className="p-5"><Skeleton /></div>
            ) : permRequests.length === 0 ? (
              <div className="py-8 px-5 text-center text-gray-400 text-[12px]">No pending requests</div>
            ) : (
              permRequests.map((req) => (
                <div key={req.id} className="px-5 py-3 border-b border-white/10 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-[#00D4FF] shrink-0">
                    {req.profiles?.full_name?.[0]}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-white text-[12px] font-medium overflow-hidden text-ellipsis whitespace-nowrap">{req.profiles?.full_name}</p>
                    <p className="text-gray-400 text-[10px]">{req.permission_requested}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Members */}
      <div className="bg-[#0D1829] border border-white/10 rounded-xl overflow-hidden mt-6">
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-white text-[14px] font-semibold">Recent Members</h3>
          <Link to="/oc/members" className="text-[#00D4FF] text-[12px] no-underline">View all →</Link>
        </div>
        <table className="w-full collapse">
          <thead>
            <tr className="border-b border-white/10">
              {['Member', 'Role', 'Year', 'Joined'].map(h => (
                <th key={h} className="px-5 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="p-5"><Skeleton /></td></tr>
            ) : recentMembers.map((m) => (
              <tr key={m.id} className="border-b border-white/10">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00D4FF] to-[#0066FF] flex items-center justify-center text-[10px] font-bold text-white">
                      {m.full_name?.[0]}
                    </div>
                    <span className="text-white text-[13px]">{m.full_name}</span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize border ${
                    m.role === 'oc' ? 'bg-[#FF2D9B]/10 text-[#FF2D9B] border-[#FF2D9B]/25' : 
                    m.role === 'executive' ? 'bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/25' : 
                    'bg-white/5 text-gray-400 border-white/10'
                  }`}>
                    {m.role}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-400 text-[13px]">Year {m.college_year || '—'}</td>
                <td className="px-5 py-3 text-gray-400 text-[12px] font-mono">{formatDate(m.created_at)}</td>
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
    <div className="flex flex-col gap-2">
      {[1,2,3].map(i => <div key={i} className="h-3 rounded bg-white/5" style={{ width: `${60 + i * 10}%` }}/>)}
    </div>
  )
}
