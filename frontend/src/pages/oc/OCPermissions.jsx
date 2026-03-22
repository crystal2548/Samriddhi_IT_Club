// ─── OCPermissions.jsx ────────────────────────────────────────
import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../utils/formatDate'

export function OCPermissions() {
  const { profile } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const isPresident = profile?.oc_position === 'president'

  useEffect(() => {
    supabase.from('permission_requests').select('*, profiles!requester_id(full_name, oc_position, email)').order('created_at', { ascending: false })
      .then(({ data }) => { setRequests(data || []); setLoading(false) })
  }, [])

  async function handleAction(id, status, requesterId, permission) {
    await supabase.from('permission_requests').update({ status, reviewed_by: profile?.id, reviewed_at: new Date().toISOString() }).eq('id', id)
    if (status === 'approved') {
      const { data: prof } = await supabase.from('profiles').select('extra_permissions').eq('id', requesterId).single()
      const existing = prof?.extra_permissions || []
      if (!existing.includes(permission)) {
        await supabase.from('profiles').update({ extra_permissions: [...existing, permission] }).eq('id', requesterId)
      }
    }
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r))
  }

  const STATUS_S = { pending: { bg: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: 'rgba(245,158,11,0.25)' }, approved: { bg: 'rgba(16,185,129,0.1)', color: '#10B981', border: 'rgba(16,185,129,0.25)' }, rejected: { bg: 'rgba(239,68,68,0.1)', color: '#EF4444', border: 'rgba(239,68,68,0.25)' } }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <p style={{ color: 'var(--cyan)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>System</p>
        <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 32, fontWeight: 800, color: '#fff', textTransform: 'uppercase' }}>Permission Requests</h1>
        {!isPresident && <p style={{ color: '#F59E0B', fontSize: 13, marginTop: 8 }}>Only the President can approve or deny permission requests.</p>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading ? <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>Loading...</div>
          : requests.length === 0 ? <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 48, fontSize: 13 }}>No permission requests.</div>
          : requests.map(r => {
            const st = STATUS_S[r.status] || STATUS_S.pending
            return (
              <div key={r.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <p style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{r.profiles?.full_name}</p>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{r.profiles?.oc_position?.replace(/_/g,' ')}</span>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: st.bg, color: st.color, border: `1px solid ${st.border}`, textTransform: 'capitalize' }}>{r.status}</span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 12px', marginBottom: 8 }}>
                      <p style={{ color: 'var(--cyan)', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', marginBottom: 4 }}>Requesting: {r.permission_requested}</p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{r.reason}</p>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>{formatDate(r.created_at)}</p>
                  </div>
                  {isPresident && r.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <button onClick={() => handleAction(r.id, 'approved', r.requester_id, r.permission_requested)}
                        style={{ padding: '6px 14px', borderRadius: 6, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#10B981', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Grant</button>
                      <button onClick={() => handleAction(r.id, 'rejected', r.requester_id, r.permission_requested)}
                        style={{ padding: '6px 14px', borderRadius: 6, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Deny</button>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        }
      </div>
    </div>
  )
}

export default OCPermissions