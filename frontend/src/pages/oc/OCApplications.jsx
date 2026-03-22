import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../utils/formatDate'

const STATUS_STYLES = {
  pending:     { bg: 'rgba(245,158,11,0.1)',  color: '#F59E0B', border: 'rgba(245,158,11,0.25)',  label: 'Pending' },
  shortlisted: { bg: 'rgba(167,139,250,0.1)', color: '#A78BFA', border: 'rgba(167,139,250,0.25)', label: 'Shortlisted' },
  approved:    { bg: 'rgba(16,185,129,0.1)',  color: '#10B981', border: 'rgba(16,185,129,0.25)',  label: 'Approved' },
  rejected:    { bg: 'rgba(239,68,68,0.1)',   color: '#EF4444', border: 'rgba(239,68,68,0.25)',   label: 'Rejected' },
}

export default function OCApplications() {
  const { profile } = useAuth()
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [selected, setSelected] = useState(null)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchApps() }, [filter])

  async function fetchApps() {
    setLoading(true)
    let query = supabase.from('applications').select('*, recruitment_cycles(title, type)').order('created_at', { ascending: false })
    if (filter !== 'all') query = query.eq('status', filter)
    const { data } = await query
    setApps(data || [])
    setLoading(false)
  }

  async function updateStatus(id, status) {
    setSaving(true)
    await supabase.from('applications').update({ status, reviewed_by: profile?.id, reviewed_at: new Date().toISOString() }).eq('id', id)
    setApps(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    if (selected?.id === id) setSelected(prev => ({ ...prev, status }))
    setSaving(false)
  }

  async function saveNotes() {
    if (!selected) return
    setSaving(true)
    await supabase.from('applications').update({ interview_notes: notes }).eq('id', selected.id)
    setApps(prev => prev.map(a => a.id === selected.id ? { ...a, interview_notes: notes } : a))
    setSaving(false)
  }

  const FILTERS = ['all', 'pending', 'shortlisted', 'approved', 'rejected']

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <p style={{ color: 'var(--cyan)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Members</p>
        <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 32, fontWeight: 800, color: '#fff', textTransform: 'uppercase' }}>Applications</h1>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.15s', background: filter === f ? 'rgba(0,212,255,0.1)' : 'transparent', color: filter === f ? 'var(--cyan)' : 'var(--text-muted)', border: `1px solid ${filter === f ? 'rgba(0,212,255,0.3)' : 'var(--border)'}` }}>
            {f}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 400px' : '1fr', gap: 20 }}>

        {/* Applications list */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Loading...</div>
          ) : apps.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No {filter} applications found.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Applicant', 'Type', 'Year', 'Status', 'Applied', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {apps.map(app => {
                  const st = STATUS_STYLES[app.status] || STATUS_STYLES.pending
                  return (
                    <tr key={app.id}
                      onClick={() => { setSelected(app); setNotes(app.interview_notes || '') }}
                      style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', background: selected?.id === app.id ? 'rgba(0,212,255,0.04)' : 'transparent', transition: 'background 0.15s' }}
                      onMouseEnter={e => { if (selected?.id !== app.id) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                      onMouseLeave={e => { if (selected?.id !== app.id) e.currentTarget.style.background = 'transparent' }}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--cyan), #0066FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{app.full_name?.[0]}</div>
                          <div>
                            <p style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{app.full_name}</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>{app.email}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 12, textTransform: 'capitalize' }}>{app.recruitment_cycles?.type || '—'}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 12 }}>Year {app.college_year || '—'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>{st.label}</span>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap' }}>{formatDate(app.created_at)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                          {app.status === 'pending' && (
                            <button onClick={() => updateStatus(app.id, 'shortlisted')}
                              style={{ padding: '3px 8px', borderRadius: 4, background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)', color: '#A78BFA', fontSize: 10, cursor: 'pointer' }}>
                              Shortlist
                            </button>
                          )}
                          {['pending', 'shortlisted'].includes(app.status) && (
                            <>
                              <button onClick={() => updateStatus(app.id, 'approved')}
                                style={{ padding: '3px 8px', borderRadius: 4, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#10B981', fontSize: 10, cursor: 'pointer' }}>
                                Approve
                              </button>
                              <button onClick={() => updateStatus(app.id, 'rejected')}
                                style={{ padding: '3px 8px', borderRadius: 4, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444', fontSize: 10, cursor: 'pointer' }}>
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
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 20, height: 'fit-content' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 600 }}>Application Detail</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <InfoRow label="Name" value={selected.full_name} />
              <InfoRow label="Email" value={selected.email} />
              <InfoRow label="Phone" value={selected.phone || '—'} />
              <InfoRow label="Year" value={selected.college_year ? `Year ${selected.college_year}` : '—'} />
              <InfoRow label="Position" value={selected.position_applying || '—'} />

              {selected.skills && (
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Skills</p>
                  <p style={{ color: '#fff', fontSize: 13, lineHeight: 1.5 }}>{selected.skills}</p>
                </div>
              )}

              {selected.why_join && (
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Why join?</p>
                  <p style={{ color: '#fff', fontSize: 13, lineHeight: 1.6 }}>{selected.why_join}</p>
                </div>
              )}

              {/* Interview notes */}
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Interview notes (internal)</p>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Add interview notes here..."
                  rows={4}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 12, resize: 'vertical', outline: 'none', fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}
                  onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.4)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
                <button onClick={saveNotes} disabled={saving}
                  style={{ marginTop: 8, padding: '6px 14px', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 6, color: 'var(--cyan)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                  {saving ? 'Saving...' : 'Save notes'}
                </button>
              </div>

              {/* Status actions */}
              {['pending', 'shortlisted'].includes(selected.status) && (
                <div style={{ display: 'flex', gap: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                  <button onClick={() => updateStatus(selected.id, 'approved')}
                    style={{ flex: 1, padding: '9px', borderRadius: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#10B981', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    ✓ Approve
                  </button>
                  <button onClick={() => updateStatus(selected.id, 'rejected')}
                    style={{ flex: 1, padding: '9px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
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
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
      <span style={{ color: 'var(--text-muted)', fontSize: 12, flexShrink: 0 }}>{label}</span>
      <span style={{ color: '#fff', fontSize: 12, textAlign: 'right' }}>{value}</span>
    </div>
  )
}