import { Outlet, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../utils/supabase'
import OCSidebar from './OCSidebar'

export default function OCLayout() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [badges, setBadges] = useState({})

  useEffect(() => {
    async function fetchBadges() {
      const [appsRes, permsRes] = await Promise.all([
        supabase.from('applications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('permission_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      ])
      setBadges({ applications: appsRes.count || 0, permissions: permsRes.count || 0 })
    }
    fetchBadges()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <OCSidebar badges={badges} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ height: 56, background: '#07090F', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0, position: 'sticky', top: 0, zIndex: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--cyan)' }}/>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>OC Control Panel</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{profile?.full_name}</span>
            <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 10px', borderRadius: 20, textTransform: 'capitalize', background: 'rgba(0,212,255,0.08)', color: 'var(--cyan)', border: '1px solid rgba(0,212,255,0.2)' }}>
              {profile?.oc_position?.replace(/_/g, ' ') || 'OC'}
            </span>
            <button onClick={handleSignOut}
              style={{ fontSize: 11, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 6, transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign out
            </button>
          </div>
        </header>
        <main style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}