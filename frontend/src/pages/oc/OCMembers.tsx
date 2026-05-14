import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../utils/supabase'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../utils/formatters'

// ── Shared container — same pattern used across all pages ──
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

export default function OCMembers() {
  const { profile: currentProfile } = useAuth()
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [editId, setEditId] = useState<string | null>(null)
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

  async function saveRole(id: string) {
    setSaving(true)
    const updates: { role: string, oc_position?: string | null } = { role: editRole }
    if (editRole === 'oc') updates.oc_position = editPosition
    else updates.oc_position = null

    await supabase.from('profiles').update(updates).eq('id', id)
    queryClient.setQueryData(['oc_members'], (prev: any) =>
      prev ? prev.map((m: any) => m.id === id ? { ...m, ...updates } : m) : []
    )
    setEditId(null)
    setSaving(false)
  }

  async function toggleActive(id: string, current: boolean) {
    await supabase.from('profiles').update({ is_active: !current }).eq('id', id)
    queryClient.setQueryData(['oc_members'], (prev: any) =>
      prev ? prev.map((m: any) => m.id === id ? { ...m, is_active: !current } : m) : []
    )
  }

  async function deleteMember(id: string, name: string) {
    if (!window.confirm(`Are you sure you want to PERMANENTLY delete ${name}? This action cannot be undone.`)) return
    const { error } = await supabase.from('profiles').delete().eq('id', id)
    if (error) { alert('Error deleting member: ' + error.message); return }
    queryClient.setQueryData(['oc_members'], (prev: any) =>
      prev ? prev.filter((m: any) => m.id !== id) : []
    )
  }

  const filtered = members.filter((m: any) => {
    const matchesSearch = m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'all' || m.role === roleFilter
    return matchesSearch && matchesRole
  })

  const OC_POSITIONS = [
    'president', 'vice_president', 'secretary', 'treasurer',
    'event_coordinator', 'technical_lead', 'media_design', 'graphics_designer', 'video_editor'
  ]

  return (
    <div style={{ paddingTop: 40, paddingBottom: 60 }}>
      <Container>

        {/* ── Header ── */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ color: '#00D4FF', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
            Members
          </p>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, fontWeight: 800, color: 'white', textTransform: 'uppercase', margin: 0, lineHeight: 1.1 }}>
            All Members
          </h1>
          <p style={{ color: '#9ca3af', fontSize: 13, marginTop: 6 }}>
            {members.length} total members
          </p>
        </div>

        {/* ── Filters ── */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>

          {/* Search — fixed width, doesn't stretch infinitely */}
          <div style={{ position: 'relative', width: 320, flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              style={{
                width: '100%',
                background: '#0D1829',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                padding: '8px 12px 8px 36px',
                color: 'white',
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Role filter pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['all', 'general', 'executive', 'oc'].map(r => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                style={{
                  padding: '6px 16px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  border: '1px solid',
                  transition: 'all 0.15s',
                  background: roleFilter === r ? 'rgba(0,212,255,0.1)' : 'transparent',
                  color: roleFilter === r ? '#00D4FF' : '#9ca3af',
                  borderColor: roleFilter === r ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.1)',
                  whiteSpace: 'nowrap',
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* ── Table ── */}
        <div style={{
          background: '#0D1829',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12,
          overflow: 'hidden',
        }}>
          {loading ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No members found.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    {['Member', 'Role / Position', 'Year', 'Status', 'Joined', 'Actions'].map(h => (
                      <th key={h} style={{
                        padding: '12px 16px',
                        fontSize: 10,
                        fontWeight: 700,
                        color: '#9ca3af',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        whiteSpace: 'nowrap',
                        textAlign: h === 'Actions' ? 'right' : 'left',
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m: any) => (
                    <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
                      className="hover:bg-white/5 transition-colors duration-150">

                      {/* Member */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {m.photo_url
                            ? <img src={m.photo_url} alt={m.full_name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                            : <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #00D4FF, #0066FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                                {m.full_name?.[0]}
                              </div>
                          }
                          <div>
                            <p style={{ color: 'white', fontSize: 13, fontWeight: 500, margin: 0 }}>{m.full_name}</p>
                            <p style={{ color: '#9ca3af', fontSize: 11, margin: 0 }}>{m.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role / Position */}
                      <td style={{ padding: '12px 16px' }}>
                        {editId === m.id ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <select value={editRole} onChange={e => setEditRole(e.target.value)}
                              style={{ background: '#0A0E1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '4px 8px', color: 'white', fontSize: 12, outline: 'none' }}>
                              <option value="general">General</option>
                              <option value="executive">Executive</option>
                              <option value="oc">OC</option>
                            </select>
                            {editRole === 'oc' && (
                              <select value={editPosition} onChange={e => setEditPosition(e.target.value)}
                                style={{ background: '#0A0E1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '4px 8px', color: 'white', fontSize: 12, outline: 'none' }}>
                                <option value="">Select position</option>
                                {OC_POSITIONS.map(p => <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>)}
                              </select>
                            )}
                          </div>
                        ) : (
                          <div>
                            <span style={{
                              fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 999,
                              textTransform: 'capitalize', border: '1px solid',
                              background: m.role === 'oc' ? 'rgba(255,45,155,0.1)' : m.role === 'executive' ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.05)',
                              color: m.role === 'oc' ? '#FF2D9B' : m.role === 'executive' ? '#00D4FF' : '#9ca3af',
                              borderColor: m.role === 'oc' ? 'rgba(255,45,155,0.25)' : m.role === 'executive' ? 'rgba(0,212,255,0.25)' : 'rgba(255,255,255,0.1)',
                            }}>
                              {m.role}
                            </span>
                            {m.oc_position && (
                              <p style={{ color: '#9ca3af', fontSize: 10, marginTop: 4, textTransform: 'capitalize' }}>
                                {m.oc_position.replace(/_/g, ' ')}
                              </p>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Year */}
                      <td style={{ padding: '12px 16px', color: '#9ca3af', fontSize: 13 }}>
                        Year {m.college_year || '—'}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          fontSize: 10, fontWeight: 600, padding: '2px 10px', borderRadius: 999, border: '1px solid',
                          background: m.is_active ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                          color: m.is_active ? '#10B981' : '#EF4444',
                          borderColor: m.is_active ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)',
                        }}>
                          {m.is_active ? 'Active' : 'Suspended'}
                        </span>
                      </td>

                      {/* Joined */}
                      <td style={{ padding: '12px 16px', color: '#9ca3af', fontSize: 11, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                        {formatDate(m.created_at)}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 16px' }}>
                        {isPresident && (
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'nowrap', justifyContent: 'flex-end' }}>
                            {editId === m.id ? (
                              <>
                                <ActionBtn onClick={() => saveRole(m.id)} color="#10B981">
                                  {saving ? '...' : 'Save'}
                                </ActionBtn>
                                <ActionBtn onClick={() => setEditId(null)} color="#9ca3af">
                                  Cancel
                                </ActionBtn>
                              </>
                            ) : (
                              <>
                                <ActionBtn onClick={() => { setEditId(m.id); setEditRole(m.role); setEditPosition(m.oc_position || '') }} color="#00D4FF">
                                  Edit
                                </ActionBtn>
                                <ActionBtn onClick={() => toggleActive(m.id, m.is_active)} color={m.is_active ? '#EF4444' : '#10B981'}>
                                  {m.is_active ? 'Suspend' : 'Activate'}
                                </ActionBtn>
                                <ActionBtn onClick={() => deleteMember(m.id, m.full_name)} color="#EF4444">
                                  Delete
                                </ActionBtn>
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

      </Container>
    </div>
  )
}

/* ── Small reusable action button ── */
function ActionBtn({ onClick, color, children }: { onClick: () => void, color: string, children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 10px',
        borderRadius: 6,
        background: `${color}1a`,
        border: `1px solid ${color}40`,
        color,
        fontSize: 11,
        fontWeight: 500,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = `${color}33`)}
      onMouseLeave={e => (e.currentTarget.style.background = `${color}1a`)}
    >
      {children}
    </button>
  )
}