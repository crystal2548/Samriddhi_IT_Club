import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../utils/supabase'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../utils/formatters'

export default function OCMembers() {
  const { profile: currentProfile } = useAuth()
  const queryClient = useQueryClient()
  
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [editId, setEditId] = useState(null)
  const [editRole, setEditRole] = useState('')
  const [editPosition, setEditPosition] = useState('')
  const [saving, setSaving] = useState(false)

  const isPresident = currentProfile?.oc_position === 'president'

  const { data: members = [], isLoading: loading } = useQuery({
    queryKey: ['oc_members'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      return data || []
    }
  })

  async function saveRole(id) {
    setSaving(true)
    const updates = { role: editRole }
    if (editRole === 'oc') updates.oc_position = editPosition
    else updates.oc_position = null
    
    await supabase.from('profiles').update(updates).eq('id', id)
    
    queryClient.setQueryData(['oc_members'], prev => 
      prev ? prev.map(m => m.id === id ? { ...m, ...updates } : m) : []
    )
    
    setEditId(null)
    setSaving(false)
  }

  async function toggleActive(id, current) {
    await supabase.from('profiles').update({ is_active: !current }).eq('id', id)
    queryClient.setQueryData(['oc_members'], prev => 
      prev ? prev.map(m => m.id === id ? { ...m, is_active: !current } : m) : []
    )
  }

  async function deleteMember(id, name) {
    if (!window.confirm(`Are you sure you want to PERMANENTLY delete ${name}? This action cannot be undone.`)) return
    
    const { error } = await supabase.from('profiles').delete().eq('id', id)
    if (error) {
      alert("Error deleting member: " + error.message)
      return
    }
    
    queryClient.setQueryData(['oc_members'], prev => 
      prev ? prev.filter(m => m.id !== id) : []
    )
  }

  const filtered = members.filter(m => {
    const matchesSearch = m.full_name?.toLowerCase().includes(search.toLowerCase()) || m.email?.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'all' || m.role === roleFilter
    return matchesSearch && matchesRole
  })

  const OC_POSITIONS = ['president','vice_president','secretary','treasurer','event_coordinator','technical_lead','media_design','graphics_designer','video_editor']

  return (
    <div>
      <div className="mb-7">
        <p className="text-[#00D4FF] text-[11px] font-bold uppercase tracking-[0.1em] mb-1.5">Members</p>
        <h1 className="font-['Barlow_Condensed',sans-serif] text-[32px] font-extrabold text-white uppercase">All Members</h1>
        <p className="text-gray-400 text-[13px] mt-1">{members.length} total members</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
            className="w-full bg-[#0D1829] border border-white/10 rounded-lg py-2 px-3 pl-9 text-white text-[13px] outline-none font-sans focus:border-[#00D4FF]/40 transition-colors"
          />
        </div>
        
        {['all','general','executive','oc'].map(r => (
          <button key={r} onClick={() => setRoleFilter(r)}
            className={`px-4 py-2 rounded-full text-[12px] font-medium cursor-pointer capitalize transition-all duration-150 border ${
              roleFilter === r 
                ? 'bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/30' 
                : 'bg-transparent text-gray-400 border-white/10 hover:border-white/20'
            }`}>
            {r}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#0D1829] border border-white/10 rounded-xl overflow-hidden self-start">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-[13px]">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-[13px]">No members found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  {['Member','Role / Position','Year','Status','Joined','Actions'].map(h => (
                    <th key={h} className={`p-3 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em] whitespace-nowrap ${h === 'Actions' ? 'text-right' : 'text-left'}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => (
                  <tr key={m.id} className="border-b border-white/10 hover:bg-white/5 transition-colors duration-150">
                    <td className="p-3 px-4">
                      <div className="flex items-center gap-2.5">
                        {m.photo_url
                          ? <img src={m.photo_url} alt={m.full_name} className="w-8 h-8 rounded-full object-cover shrink-0"/>
                          : <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00D4FF] to-[#0066FF] flex items-center justify-center text-[11px] font-bold text-white shrink-0">{m.full_name?.[0]}</div>
                        }
                        <div>
                          <p className="text-white text-[13px] font-medium">{m.full_name}</p>
                          <p className="text-gray-400 text-[11px]">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 px-4">
                      {editId === m.id ? (
                        <div className="flex flex-col gap-1.5">
                          <select value={editRole} onChange={e => setEditRole(e.target.value)}
                            className="bg-[#0A0E1A] border border-white/10 rounded-md py-1 px-2 text-white text-[12px] outline-none">
                            <option value="general">General</option>
                            <option value="executive">Executive</option>
                            <option value="oc">OC</option>
                          </select>
                          {editRole === 'oc' && (
                            <select value={editPosition} onChange={e => setEditPosition(e.target.value)}
                              className="bg-[#0A0E1A] border border-white/10 rounded-md py-1 px-2 text-white text-[12px] outline-none">
                              <option value="">Select position</option>
                              {OC_POSITIONS.map(p => <option key={p} value={p}>{p.replace(/_/g,' ')}</option>)}
                            </select>
                          )}
                        </div>
                      ) : (
                        <div>
                          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize border ${
                            m.role === 'oc' ? 'bg-[#FF2D9B]/10 text-[#FF2D9B] border-[#FF2D9B]/25' : 
                            m.role === 'executive' ? 'bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/25' : 
                            'bg-white/5 text-gray-400 border-white/10'
                          }`}>
                            {m.role}
                          </span>
                          {m.oc_position && <p className="text-gray-400 text-[10px] mt-1 capitalize">{m.oc_position.replace(/_/g,' ')}</p>}
                        </div>
                      )}
                    </td>
                    <td className="p-3 px-4 text-gray-400 text-[13px]">Year {m.college_year || '—'}</td>
                    <td className="p-3 px-4">
                      <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
                        m.is_active ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/25' : 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/25'
                      }`}>
                        {m.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="p-3 px-4 text-gray-400 text-[11px] font-mono whitespace-nowrap">{formatDate(m.created_at)}</td>
                    <td className="p-3 px-4">
                      {isPresident && (
                        <div className="flex gap-1 flex-nowrap justify-end">
                          {editId === m.id ? (
                            <>
                              <button onClick={() => saveRole(m.id)} disabled={saving}
                                className="px-2.5 py-1.5 rounded-md bg-[#10B981]/10 border border-[#10B981]/25 text-[#10B981] text-[11px] font-medium cursor-pointer whitespace-nowrap hover:bg-[#10B981]/20">
                                {saving ? '...' : 'Save'}
                              </button>
                              <button onClick={() => setEditId(null)}
                                className="px-2.5 py-1.5 rounded-md bg-transparent border border-white/10 text-gray-400 text-[11px] font-medium cursor-pointer whitespace-nowrap hover:bg-white/5">
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => { setEditId(m.id); setEditRole(m.role); setEditPosition(m.oc_position || '') }}
                                className="px-2.5 py-1.5 rounded-md bg-[#00D4FF]/10 border border-[#00D4FF]/20 text-[#00D4FF] text-[11px] font-medium cursor-pointer whitespace-nowrap hover:bg-[#00D4FF]/20">
                                Edit
                              </button>
                              <button onClick={() => toggleActive(m.id, m.is_active)}
                                className={`px-2.5 py-1.5 rounded-md border text-[11px] font-medium cursor-pointer whitespace-nowrap ${
                                  m.is_active 
                                    ? 'bg-[#EF4444]/10 border-[#EF4444]/25 text-[#EF4444] hover:bg-[#EF4444]/20' 
                                    : 'bg-[#10B981]/10 border-[#10B981]/25 text-[#10B981] hover:bg-[#10B981]/20'
                                }`}>
                                {m.is_active ? 'Suspend' : 'Activate'}
                              </button>
                              <button onClick={() => deleteMember(m.id, m.full_name)}
                                className="px-2.5 py-1.5 rounded-md bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] text-[11px] font-medium cursor-pointer whitespace-nowrap hover:bg-[#EF4444]/25">
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
