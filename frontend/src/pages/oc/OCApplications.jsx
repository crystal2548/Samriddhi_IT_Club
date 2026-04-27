import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../utils/supabase'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../utils/formatters'
import emailjs from '@emailjs/browser'

const STATUS_STYLES = {
  pending:     { bg: 'bg-[#F59E0B]/10',  color: 'text-[#F59E0B]', border: 'border-[#F59E0B]/25',  label: 'Pending' },
  shortlisted: { bg: 'bg-[#A78BFA]/10', color: 'text-[#A78BFA]', border: 'border-[#A78BFA]/25', label: 'Shortlisted' },
  approved:    { bg: 'bg-[#10B981]/10',  color: 'text-[#10B981]', border: 'border-[#10B981]/25',  label: 'Approved' },
  rejected:    { bg: 'bg-[#EF4444]/10',   color: 'text-[#EF4444]', border: 'border-[#EF4444]/25',   label: 'Rejected' },
}

export default function OCApplications() {
  const { profile } = useAuth()
  const queryClient = useQueryClient()
  
  const [filter, setFilter] = useState('pending')
  const [selected, setSelected] = useState(null)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [inviteRole, setInviteRole] = useState('member')
  const [invitePosition, setInvitePosition] = useState('')

  const isPresidentOrVP = ['president', 'vice_president'].includes(profile?.oc_position)

  const { data: apps = [], isLoading: loading } = useQuery({
    queryKey: ['applications', filter],
    queryFn: async () => {
      let query = supabase.from('applications').select('*, recruitment_cycles(title, type)').order('created_at', { ascending: false })
      if (filter !== 'all') query = query.eq('status', filter)
      const { data } = await query
      return data || []
    }
  })

  async function updateStatus(id, status) {
    setSaving(true)
    await supabase.from('applications').update({ status, reviewed_by: profile?.id, reviewed_at: new Date().toISOString() }).eq('id', id)
    queryClient.setQueryData(['applications', filter], prev => prev ? prev.map(a => a.id === id ? { ...a, status } : a) : [])
    if (selected?.id === id) setSelected(prev => ({ ...prev, status }))
    setSaving(false)
  }

  async function saveNotes() {
    if (!selected) return
    setSaving(true)
    await supabase.from('applications').update({ interview_notes: notes }).eq('id', selected.id)
    queryClient.setQueryData(['applications', filter], prev => prev ? prev.map(a => a.id === selected.id ? { ...a, interview_notes: notes } : a) : [])
    setSaving(false)
  }

  async function handleInvite() {
    if (!selected || !isPresidentOrVP) return
    setInviting(true)
    
    try {
      const resp = await fetch('http://localhost:5000/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: selected.email,
          full_name: selected.full_name,
          role: inviteRole,
          oc_position: inviteRole === 'oc' ? invitePosition : null,
          application_id: selected.id
        })
      })

      const data = await resp.json()
      
      if (data.success && data.inviteLink) {
        console.log('Invite link generated:', data.inviteLink)
        
        const emailParams = {
          to_name: selected.full_name,
          to_email: selected.email,
          from_name: 'Samriddhi IT Club',
          invite_link: data.inviteLink,
          role: inviteRole,
          message: `You have been invited to join Samriddhi IT Club as a ${inviteRole}. Click here to set your password: ${data.inviteLink}`
        }

        const emailRes = await emailjs.send(
          import.meta.env.VITE_EMAILJS_INVITE_SERVICE_ID,
          import.meta.env.VITE_EMAILJS_INVITE_TEMPLATE_ID,
          emailParams,
          import.meta.env.VITE_EMAILJS_INVITE_PUBLIC_KEY
        )

        if (emailRes.status !== 200) {
          throw new Error(`EmailJS failed with status ${emailRes.status}: ${emailRes.text}`)
        }

        const now = new Date().toISOString()
        queryClient.setQueryData(['applications', filter], prev => prev ? prev.map(a => a.id === selected.id ? { ...a, invited_at: now } : a) : [])
        setSelected(prev => ({ ...prev, invited_at: now }))
      } else {
        alert('Invite failed: ' + (data.error || 'Unknown error'))
      }
    } catch (err) {
      console.error('Invite Error:', err)
      alert('Failed to send invite: ' + err.message)
    } finally {
      setInviting(false)
    }
  }

  const OC_POSITIONS = ['president','vice_president','secretary','treasurer','event_coordinator','technical_lead','media_design','graphics_designer','video_editor']
  const FILTERS = ['all', 'pending', 'shortlisted', 'approved', 'rejected']

  return (
    <div>
      <div className="mb-7">
        <p className="text-[#00D4FF] text-[11px] font-bold uppercase tracking-[0.1em] mb-1.5">Members</p>
        <h1 className="font-['Barlow_Condensed',sans-serif] text-[32px] font-extrabold text-white uppercase">Applications</h1>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium cursor-pointer capitalize transition-all duration-150 border ${
              filter === f 
                ? 'bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/30' 
                : 'bg-transparent text-gray-400 border-white/10 hover:border-white/20'
            }`}>
            {f}
          </button>
        ))}
      </div>

      <div className={`grid gap-5 ${selected ? 'grid-cols-[1fr_400px]' : 'grid-cols-1'}`}>

        {/* Applications list */}
        <div className="bg-[#0D1829] border border-white/10 rounded-xl overflow-hidden self-start">
          {loading ? (
            <div className="p-8 text-center text-gray-400 text-[13px]">Loading...</div>
          ) : apps.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-[13px]">No {filter} applications found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    {['Applicant', 'Type', 'Year', 'Status', 'Applied', 'Actions'].map(h => (
                      <th key={h} className="p-3 px-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em] whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {apps.map(app => {
                    const st = STATUS_STYLES[app.status] || STATUS_STYLES.pending
                    return (
                      <tr key={app.id}
                        onClick={() => { setSelected(app); setNotes(app.interview_notes || '') }}
                        className={`border-b border-white/10 cursor-pointer transition-colors duration-150 group ${selected?.id === app.id ? 'bg-[#00D4FF]/5' : 'hover:bg-white/5'}`}
                      >
                        <td className="p-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00D4FF] to-[#0066FF] flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                              {app.full_name?.[0]}
                            </div>
                            <div>
                              <p className="text-white text-[13px] font-medium">{app.full_name}</p>
                              <p className="text-gray-400 text-[11px]">{app.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 px-4 text-gray-400 text-[12px] capitalize">{app.recruitment_cycles?.type || '—'}</td>
                        <td className="p-3 px-4 text-gray-400 text-[12px]">Year {app.college_year || '—'}</td>
                        <td className="p-3 px-4">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${st.bg} ${st.color} ${st.border}`}>{st.label}</span>
                        </td>
                        <td className="p-3 px-4 text-gray-400 text-[11px] font-mono whitespace-nowrap">{formatDate(app.created_at)}</td>
                        <td className="p-3 px-4">
                          <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                            {app.status === 'pending' && (
                              <button onClick={() => updateStatus(app.id, 'shortlisted')}
                                className="px-2 py-1 rounded bg-[#A78BFA]/10 border border-[#A78BFA]/25 text-[#A78BFA] text-[10px] cursor-pointer hover:bg-[#A78BFA]/20">
                                Shortlist
                              </button>
                            )}
                            {['pending', 'shortlisted'].includes(app.status) && (
                              <>
                                <button onClick={() => updateStatus(app.id, 'approved')}
                                  className="px-2 py-1 rounded bg-[#10B981]/10 border border-[#10B981]/25 text-[#10B981] text-[10px] cursor-pointer hover:bg-[#10B981]/20">
                                  Approve
                                </button>
                                <button onClick={() => updateStatus(app.id, 'rejected')}
                                  className="px-2 py-1 rounded bg-[#EF4444]/10 border border-[#EF4444]/25 text-[#EF4444] text-[10px] cursor-pointer hover:bg-[#EF4444]/20">
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="bg-[#0D1829] border border-white/10 rounded-xl p-5 h-fit sticky top-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white text-[15px] font-semibold">Application Detail</h3>
              <button onClick={() => setSelected(null)} className="appearance-none bg-transparent border-none text-gray-400 cursor-pointer text-lg leading-none hover:text-white">×</button>
            </div>

            <div className="flex flex-col gap-3.5">
              <InfoRow label="Name" value={selected.full_name} />
              <InfoRow label="Email" value={selected.email} />
              <InfoRow label="Phone" value={selected.phone || '—'} />
              <InfoRow label="Year" value={selected.college_year ? `Year ${selected.college_year}` : '—'} />
              <InfoRow label="Position" value={selected.position_applying || '—'} />

              {selected.skills && (
                <div>
                  <p className="text-gray-400 text-[10px] uppercase tracking-[0.08em] mb-1.5">Skills</p>
                  <p className="text-white text-[13px] leading-relaxed">{selected.skills}</p>
                </div>
              )}

              {selected.why_join && (
                <div>
                  <p className="text-gray-400 text-[10px] uppercase tracking-[0.08em] mb-1.5">Why join?</p>
                  <p className="text-white text-[13px] leading-relaxed">{selected.why_join}</p>
                </div>
              )}

              {/* Interview notes */}
              <div>
                <p className="text-gray-400 text-[10px] uppercase tracking-[0.08em] mb-1.5">Interview notes (internal)</p>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Add interview notes here..."
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-[12px] resize-y outline-none font-sans leading-relaxed focus:border-[#00D4FF]/40 transition-colors"
                />
                <button onClick={saveNotes} disabled={saving}
                  className="mt-2 px-3.5 py-1.5 bg-[#00D4FF]/10 border border-[#00D4FF]/20 rounded-md text-[#00D4FF] text-[11px] font-semibold cursor-pointer hover:bg-[#00D4FF]/20 disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save notes'}
                </button>
              </div>

              {/* Invitation Section */}
              {selected.status === 'approved' && isPresidentOrVP && (
                <div className="mt-2 pt-4 border-t border-white/10">
                  <p className="text-gray-400 text-[10px] uppercase tracking-[0.08em] mb-3">Invite to Club</p>
                  
                  {selected.invited_at ? (
                    <div className="flex items-center gap-2 text-[#10B981] text-[13px] font-semibold bg-[#10B981]/10 px-3.5 py-2.5 rounded-lg border border-[#10B981]/20">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      Invitation Sent
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3.5">
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[10px] text-gray-400 mb-1">Assign Role</label>
                          <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-white text-[12px] outline-none focus:border-[#00D4FF]/40">
                            <option value="member" className="bg-[#0A0E1A]">General Member</option>
                            <option value="executive" className="bg-[#0A0E1A]">Executive</option>
                            <option value="oc" className="bg-[#0A0E1A]">OC Member</option>
                          </select>
                        </div>
                        {inviteRole === 'oc' && (
                          <div>
                            <label className="block text-[10px] text-gray-400 mb-1">Position</label>
                            <select value={invitePosition} onChange={e => setInvitePosition(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-white text-[12px] outline-none focus:border-[#00D4FF]/40">
                              <option value="" className="bg-[#0A0E1A]">Select Position</option>
                              {OC_POSITIONS.map(p => <option key={p} value={p} className="bg-[#0A0E1A]">{p.replace(/_/g, ' ')}</option>)}
                            </select>
                          </div>
                        )}
                      </div>
                      <button onClick={handleInvite} disabled={inviting || (inviteRole === 'oc' && !invitePosition)}
                        className="p-2.5 rounded-lg bg-[#00D4FF] border-none text-[#0A0E1A] text-[12px] font-bold cursor-pointer hover:bg-[#00bde6] disabled:opacity-50 disabled:cursor-not-allowed">
                        {inviting ? 'Sending Invite...' : 'Send Invitation Email'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Status actions */}
              {['pending', 'shortlisted'].includes(selected.status) && (
                <div className="flex gap-2 pt-2 border-t border-white/10">
                  <button onClick={() => updateStatus(selected.id, 'approved')}
                    className="flex-1 py-2 rounded-lg bg-[#10B981]/10 border border-[#10B981]/25 text-[#10B981] text-[12px] font-bold cursor-pointer hover:bg-[#10B981]/20">
                    ✓ Approve
                  </button>
                  <button onClick={() => updateStatus(selected.id, 'rejected')}
                    className="flex-1 py-2 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/25 text-[#EF4444] text-[12px] font-bold cursor-pointer hover:bg-[#EF4444]/20">
                    ✗ Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-gray-400 text-[12px] shrink-0">{label}</span>
      <span className="text-white text-[12px] text-right">{value}</span>
    </div>
  )
}
