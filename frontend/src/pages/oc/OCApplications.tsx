import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../utils/supabase'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../utils/formatters'
import emailjs from '@emailjs/browser'
import type { Application } from '../../types/index'

type AppStatus = 'pending' | 'shortlisted' | 'approved' | 'rejected'

const STATUS_STYLES: Record<AppStatus, { bg: string; color: string; border: string; label: string }> = {
  pending:     { bg: 'rgba(245,158,11,0.1)',  color: '#F59E0B', border: 'rgba(245,158,11,0.25)',  label: 'Pending' },
  shortlisted: { bg: 'rgba(167,139,250,0.1)', color: '#A78BFA', border: 'rgba(167,139,250,0.25)', label: 'Shortlisted' },
  approved:    { bg: 'rgba(16,185,129,0.1)',  color: '#10B981', border: 'rgba(16,185,129,0.25)',  label: 'Approved' },
  rejected:    { bg: 'rgba(239,68,68,0.1)',   color: '#EF4444', border: 'rgba(239,68,68,0.25)',   label: 'Rejected' },
}

interface AppWithCycle extends Application {
  interview_notes?: string
  reviewed_by?: string
  reviewed_at?: string
  recruitment_cycles?: { title: string; type: string } | null
}

// ── Shared container ──
function Container({ children, style = {} }: { children: React.ReactNode, style?: React.CSSProperties }) {
  return (
    <div style={{
      width: '100%',
      maxWidth: 1200,
      margin: '0 auto',
      padding: '0 32px',
      boxSizing: 'border-box',
      ...style
    }}>
      {children}
    </div>
  )
}

export default function OCApplications() {
  const { profile } = useAuth()
  const queryClient = useQueryClient()

  const [filter, setFilter] = useState('pending')
  const [selected, setSelected] = useState<AppWithCycle | null>(null)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [inviteRole, setInviteRole] = useState('member')
  const [invitePosition, setInvitePosition] = useState('')

  const isPresidentOrVP = ['president', 'vice_president'].includes(profile?.oc_position ?? '')

  const { data: apps = [], isLoading: loading } = useQuery<AppWithCycle[]>({
    queryKey: ['applications', filter],
    queryFn: async () => {
      let query = supabase
        .from('applications')
        .select('*, recruitment_cycles(title, type)')
        .order('created_at', { ascending: false })
      if (filter !== 'all') query = query.eq('status', filter)
      const { data } = await query
      return (data ?? []) as AppWithCycle[]
    }
  })

  async function updateStatus(id: string, status: AppStatus) {
    setSaving(true)
    await supabase
      .from('applications')
      .update({ status, reviewed_by: profile?.id, reviewed_at: new Date().toISOString() })
      .eq('id', id)
    queryClient.setQueryData<AppWithCycle[]>(['applications', filter], prev =>
      prev ? prev.map(a => a.id === id ? { ...a, status } : a) : []
    )
    if (selected?.id === id) setSelected(prev => prev ? ({ ...prev, status }) : null)
    setSaving(false)
  }

  async function saveNotes() {
    if (!selected) return
    setSaving(true)
    await supabase.from('applications').update({ interview_notes: notes }).eq('id', selected.id!)
    queryClient.setQueryData<AppWithCycle[]>(['applications', filter], prev =>
      prev ? prev.map(a => a.id === selected.id ? { ...a, interview_notes: notes } : a) : []
    )
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
      const data = await resp.json() as { success: boolean; inviteLink?: string; error?: string }

      if (data.success && data.inviteLink) {
        const emailParams = {
          to_name: selected.full_name,
          to_email: selected.email,
          from_name: 'Samriddhi IT Club',
          invite_link: data.inviteLink,
          role: inviteRole,
          message: `You have been invited to join Samriddhi IT Club as a ${inviteRole}. Click here to set your password: ${data.inviteLink}`
        }
        const emailRes = await emailjs.send(
          import.meta.env.VITE_EMAILJS_INVITE_SERVICE_ID as string,
          import.meta.env.VITE_EMAILJS_INVITE_TEMPLATE_ID as string,
          emailParams,
          import.meta.env.VITE_EMAILJS_INVITE_PUBLIC_KEY as string
        )
        if (emailRes.status !== 200) throw new Error(`EmailJS failed: ${emailRes.text}`)

        const now = new Date().toISOString()
        queryClient.setQueryData<AppWithCycle[]>(['applications', filter], prev =>
          prev ? prev.map(a => a.id === selected.id ? { ...a, invited_at: now } : a) : []
        )
        setSelected(prev => prev ? ({ ...prev, invited_at: now }) : null)
      } else {
        alert('Invite failed: ' + (data.error || 'Unknown error'))
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      console.error('Invite Error:', err)
      alert('Failed to send invite: ' + msg)
    } finally {
      setInviting(false)
    }
  }

  const OC_POSITIONS = ['president','vice_president','secretary','treasurer','event_coordinator','technical_lead','media_design','graphics_designer','video_editor']
  const FILTERS = ['all', 'pending', 'shortlisted', 'approved', 'rejected']

  return (
    <div style={{ paddingTop: 40, paddingBottom: 60 }}>
      <Container>

        {/* ── Header ── */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ color: '#00D4FF', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
            Members
          </p>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, fontWeight: 800, color: 'white', textTransform: 'uppercase', margin: 0, lineHeight: 1.1 }}>
            Applications
          </h1>
        </div>

        {/* ── Filter tabs ── */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 16px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                textTransform: 'capitalize',
                border: '1px solid',
                transition: 'all 0.15s',
                background: filter === f ? 'rgba(0,212,255,0.1)' : 'transparent',
                color: filter === f ? '#00D4FF' : '#9ca3af',
                borderColor: filter === f ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.1)',
                whiteSpace: 'nowrap',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* ── Main grid: list + detail panel ── */}
        <div style={{
          display: 'grid',
          gap: 20,
          gridTemplateColumns: selected ? '1fr 400px' : '1fr',
          alignItems: 'start',
        }}>

          {/* Applications list */}
          <div style={{
            background: '#0D1829',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
            overflow: 'hidden',
          }}>
            {loading ? (
              <div style={{ padding: 32, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Loading...</div>
            ) : apps.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                No {filter} applications found.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      {['Applicant', 'Type', 'Year', 'Status', 'Applied', 'Actions'].map(h => (
                        <th key={h} style={{
                          padding: '12px 16px',
                          textAlign: 'left',
                          fontSize: 10,
                          fontWeight: 700,
                          color: '#9ca3af',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          whiteSpace: 'nowrap',
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {apps.map(app => {
                      const st = STATUS_STYLES[app.status as AppStatus] || STATUS_STYLES.pending
                      const isActive = selected?.id === app.id
                      return (
                        <tr
                          key={app.id}
                          onClick={() => { setSelected(app); setNotes(app.interview_notes || '') }}
                          style={{
                            borderBottom: '1px solid rgba(255,255,255,0.1)',
                            cursor: 'pointer',
                            background: isActive ? 'rgba(0,212,255,0.05)' : 'transparent',
                            transition: 'background 0.15s',
                          }}
                          className="hover:bg-white/5"
                        >
                          {/* Applicant */}
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{
                                width: 28, height: 28, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #00D4FF, #0066FF)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 10, fontWeight: 700, color: 'white', flexShrink: 0,
                              }}>
                                {app.full_name?.[0]}
                              </div>
                              <div>
                                <p style={{ color: 'white', fontSize: 13, fontWeight: 500, margin: 0 }}>{app.full_name}</p>
                                <p style={{ color: '#9ca3af', fontSize: 11, margin: 0 }}>{app.email}</p>
                              </div>
                            </div>
                          </td>

                          {/* Type */}
                          <td style={{ padding: '12px 16px', color: '#9ca3af', fontSize: 12, textTransform: 'capitalize' }}>
                            {app.recruitment_cycles?.type || '—'}
                          </td>

                          {/* Year */}
                          <td style={{ padding: '12px 16px', color: '#9ca3af', fontSize: 12 }}>
                            Year {app.college_year || '—'}
                          </td>

                          {/* Status */}
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{
                              fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 999,
                              border: `1px solid ${st.border}`,
                              background: st.bg,
                              color: st.color,
                            }}>
                              {st.label}
                            </span>
                          </td>

                          {/* Applied */}
                          <td style={{ padding: '12px 16px', color: '#9ca3af', fontSize: 11, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                            {formatDate(app.created_at ?? '')}
                          </td>

                          {/* Actions */}
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                              {app.status === 'pending' && (
                                <ActionBtn onClick={() => updateStatus(app.id!, 'shortlisted')} color="#A78BFA">Shortlist</ActionBtn>
                              )}
                              {['pending', 'shortlisted'].includes(app.status) && (
                                <>
                                  <ActionBtn onClick={() => updateStatus(app.id!, 'approved')} color="#10B981">Approve</ActionBtn>
                                  <ActionBtn onClick={() => updateStatus(app.id!, 'rejected')} color="#EF4444">Reject</ActionBtn>
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

          {/* ── Detail panel ── */}
          {selected && (
            <div style={{
              background: '#0D1829',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              padding: 20,
              position: 'sticky',
              top: 24,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ color: 'white', fontSize: 15, fontWeight: 600, margin: 0 }}>Application Detail</h3>
                <button
                  onClick={() => setSelected(null)}
                  style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}
                >×</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <InfoRow label="Name" value={selected.full_name} />
                <InfoRow label="Email" value={selected.email} />
                <InfoRow label="Phone" value={selected.phone || '—'} />
                <InfoRow label="Year" value={selected.college_year ? `Year ${selected.college_year}` : '—'} />
                <InfoRow label="Position" value={selected.position_applying || '—'} />

                {selected.skills && (
                  <div>
                    <p style={{ color: '#9ca3af', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Skills</p>
                    <p style={{ color: 'white', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                      {Array.isArray(selected.skills) ? selected.skills.join(', ') : String(selected.skills)}
                    </p>
                  </div>
                )}

                {selected.why_join && (
                  <div>
                    <p style={{ color: '#9ca3af', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Why join?</p>
                    <p style={{ color: 'white', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{selected.why_join}</p>
                  </div>
                )}

                <div>
                  <p style={{ color: '#9ca3af', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                    Interview notes (internal)
                  </p>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Add interview notes here..."
                    rows={4}
                    style={{
                      width: '100%', background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                      padding: '10px 12px', color: 'white', fontSize: 12,
                      resize: 'vertical', outline: 'none', fontFamily: 'sans-serif',
                      lineHeight: 1.6, boxSizing: 'border-box',
                    }}
                  />
                  <button
                    onClick={saveNotes}
                    disabled={saving}
                    style={{
                      marginTop: 8, padding: '6px 14px',
                      background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)',
                      borderRadius: 6, color: '#00D4FF', fontSize: 11, fontWeight: 600,
                      cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.5 : 1,
                    }}
                  >
                    {saving ? 'Saving...' : 'Save notes'}
                  </button>
                </div>

                {selected.status === 'approved' && isPresidentOrVP && (
                  <div style={{ marginTop: 8, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <p style={{ color: '#9ca3af', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                      Invite to Club
                    </p>
                    {selected.invited_at ? (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        color: '#10B981', fontSize: 13, fontWeight: 600,
                        background: 'rgba(16,185,129,0.1)', padding: '10px 14px',
                        borderRadius: 8, border: '1px solid rgba(16,185,129,0.2)',
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Invitation Sent
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: inviteRole === 'oc' ? '1fr 1fr' : '1fr', gap: 10 }}>
                          <div>
                            <label style={{ display: 'block', fontSize: 10, color: '#9ca3af', marginBottom: 4 }}>Assign Role</label>
                            <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
                              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '6px 8px', color: 'white', fontSize: 12, outline: 'none' }}>
                              <option value="member" className="bg-[#0A0E1A]">General Member</option>
                              <option value="executive" className="bg-[#0A0E1A]">Executive</option>
                              <option value="oc" className="bg-[#0A0E1A]">OC Member</option>
                            </select>
                          </div>
                          {inviteRole === 'oc' && (
                            <div>
                              <label style={{ display: 'block', fontSize: 10, color: '#9ca3af', marginBottom: 4 }}>Position</label>
                              <select value={invitePosition} onChange={e => setInvitePosition(e.target.value)}
                                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '6px 8px', color: 'white', fontSize: 12, outline: 'none' }}>
                                <option value="">Select Position</option>
                                {OC_POSITIONS.map(p => <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>)}
                              </select>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={handleInvite}
                          disabled={inviting || (inviteRole === 'oc' && !invitePosition)}
                          style={{
                            padding: '10px', borderRadius: 8, border: 'none',
                            background: '#00D4FF', color: '#0A0E1A', fontSize: 12,
                            fontWeight: 700, cursor: inviting ? 'not-allowed' : 'pointer',
                            opacity: (inviting || (inviteRole === 'oc' && !invitePosition)) ? 0.5 : 1,
                          }}
                        >
                          {inviting ? 'Sending Invite...' : 'Send Invitation Email'}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {['pending', 'shortlisted'].includes(selected.status) && (
                  <div style={{ display: 'flex', gap: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <button
                      onClick={() => updateStatus(selected.id!, 'approved')}
                      style={{
                        flex: 1, padding: '8px', borderRadius: 8,
                        background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
                        color: '#10B981', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      }}
                    >✓ Approve</button>
                    <button
                      onClick={() => updateStatus(selected.id!, 'rejected')}
                      style={{
                        flex: 1, padding: '8px', borderRadius: 8,
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                        color: '#EF4444', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      }}
                    >✗ Reject</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </Container>
    </div>
  )
}

/* ── Small action button ── */
function ActionBtn({ onClick, color, children }: { onClick: () => void, color: string, children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '4px 8px', borderRadius: 4,
        background: `${color}1a`, border: `1px solid ${color}40`,
        color, fontSize: 10, fontWeight: 500, cursor: 'pointer',
        whiteSpace: 'nowrap', transition: 'background 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = `${color}33`)}
      onMouseLeave={e => (e.currentTarget.style.background = `${color}1a`)}
    >
      {children}
    </button>
  )
}

/* ── Info row ── */
interface InfoRowProps { label: string; value: string | number | undefined }
function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
      <span style={{ color: '#9ca3af', fontSize: 12, flexShrink: 0 }}>{label}</span>
      <span style={{ color: 'white', fontSize: 12, textAlign: 'right' }}>{value ?? '—'}</span>
    </div>
  )
}