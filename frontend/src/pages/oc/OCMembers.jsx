import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../utils/formatDate'

export default function OCMembers() {
  const { profile: currentProfile } = useAuth()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [editId, setEditId] = useState(null)
  const [editRole, setEditRole] = useState('')
  const [editPosition, setEditPosition] = useState('')
  const [saving, setSaving] = useState(false)

  const isPresident = currentProfile?.oc_position === 'president'

  useEffect(() => { fetchMembers() }, [])

  async function fetchMembers() {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    setMembers(data || [])
    setLoading(false)
  }

  async function saveRole(id) {
    setSaving(true)
    const updates = { role: editRole }
    if (editRole === 'oc') updates.oc_position = editPosition
    else updates.oc_position = null
    await supabase.from('profiles').update(updates).eq('id', id)
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m))
    setEditId(null)
    setSaving(false)
  }

  async function toggleActive(id, current) {
    await supabase.from('profiles').update({ is_active: !current }).eq('id', id)
    setMembers(prev => prev.map(m => m.id === id ? { ...m, is_active: !current } : m))
  }

  const filtered = members.filter(m => {
    const matchesSearch = m.full_name?.toLowerCase().includes(search.toLowerCase()) || m.email?.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'all' || m.role === roleFilter
    return matchesSearch && matchesRole
  })

  const OC_POSITIONS = ['president','vice_president','secretary','treasurer','event_coordinator','technical_lead','media_design','graphics_designer','video_editor']

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <p style={{ color: 'var(--cyan)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Members</p>
        <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 32, fontWeight: 800, color: '#fff', textTransform: 'uppercase' }}>All Members</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>{members.length} total members</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
            style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px 9px 36px', color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif' }}
            onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.4)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
        {['all','general','executive','oc'].map(r => (
          <button key={r} onClick={() => setRoleFilter(r)}
            style={{ padding: '8px 16px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', textTransform: 'capitalize', background: roleFilter === r ? 'rgba(0,212,255,0.1)' : 'transparent', color: roleFilter === r ? 'var(--cyan)' : 'var(--text-muted)', border: `1px solid ${roleFilter === r ? 'rgba(0,212,255,0.3)' : 'var(--border)'}`, transition: 'all 0.15s' }}>
            {r}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No members found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Member','Role / Position','Year','Status','Joined','Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {m.photo_url
                        ? <img src={m.photo_url} alt={m.full_name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}/>
                        : <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--cyan), #0066FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{m.full_name?.[0]}</div>
                      }
                      <div>
                        <p style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{m.full_name}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>{m.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {editId === m.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <select value={editRole} onChange={e => setEditRole(e.target.value)}
                          style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 8px', color: '#fff', fontSize: 12, outline: 'none' }}>
                          <option value="general">General</option>
                          <option value="executive">Executive</option>
                          <option value="oc">OC</option>
                        </select>
                        {editRole === 'oc' && (
                          <select value={editPosition} onChange={e => setEditPosition(e.target.value)}
                            style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 8px', color: '#fff', fontSize: 12, outline: 'none' }}>
                            <option value="">Select position</option>
                            {OC_POSITIONS.map(p => <option key={p} value={p}>{p.replace(/_/g,' ')}</option>)}
                          </select>
                        )}
                      </div>
                    ) : (
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, textTransform: 'capitalize', background: m.role === 'oc' ? 'rgba(255,45,155,0.1)' : m.role === 'executive' ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.06)', color: m.role === 'oc' ? 'var(--pink)' : m.role === 'executive' ? 'var(--cyan)' : 'var(--text-muted)', border: `1px solid ${m.role === 'oc' ? 'rgba(255,45,155,0.25)' : m.role === 'executive' ? 'rgba(0,212,255,0.25)' : 'var(--border)'}` }}>{m.role}</span>
                        {m.oc_position && <p style={{ color: 'var(--text-muted)', fontSize: 10, marginTop: 3, textTransform: 'capitalize' }}>{m.oc_position.replace(/_/g,' ')}</p>}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 13 }}>Year {m.college_year || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: m.is_active ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: m.is_active ? '#10B981' : '#EF4444', border: `1px solid ${m.is_active ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}` }}>
                      {m.is_active ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap' }}>{formatDate(m.created_at)}</td>
                  <td style={{ padding: '12px 16px' }}>
                    {isPresident && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        {editId === m.id ? (
                          <>
                            <button onClick={() => saveRole(m.id)} disabled={saving}
                              style={{ padding: '4px 10px', borderRadius: 6, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#10B981', fontSize: 11, cursor: 'pointer' }}>
                              {saving ? '...' : 'Save'}
                            </button>
                            <button onClick={() => setEditId(null)}
                              style={{ padding: '4px 10px', borderRadius: 6, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer' }}>
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => { setEditId(m.id); setEditRole(m.role); setEditPosition(m.oc_position || '') }}
                              style={{ padding: '4px 10px', borderRadius: 6, background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: 'var(--cyan)', fontSize: 11, cursor: 'pointer' }}>
                              Edit role
                            </button>
                            <button onClick={() => toggleActive(m.id, m.is_active)}
                              style={{ padding: '4px 10px', borderRadius: 6, background: m.is_active ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)', border: `1px solid ${m.is_active ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.25)'}`, color: m.is_active ? '#EF4444' : '#10B981', fontSize: 11, cursor: 'pointer' }}>
                              {m.is_active ? 'Suspend' : 'Activate'}
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
        )}
      </div>
    </div>
  )
}