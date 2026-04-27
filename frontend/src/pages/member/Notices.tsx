import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../utils/formatters'

export default function Notices() {
  const { profile } = useAuth()
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchNotices()
  }, [profile])

  async function fetchNotices() {
    setLoading(true)

    // Build audience filter based on role
    const audiences = ['all']
    if (profile?.role === 'general')   audiences.push('general')
    if (profile?.role === 'executive') audiences.push('general', 'executive')
    if (profile?.role === 'oc')        audiences.push('general', 'executive', 'oc')

    const { data } = await supabase
      .from('announcements')
      .select('*')
      .in('audience', audiences)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })

    setNotices(data || [])
    setLoading(false)
  }

  const AUDIENCE_COLORS = {
    all:       { bg: 'rgba(0,212,255,0.08)',   color: 'var(--cyan)', border: 'rgba(0,212,255,0.2)' },
    general:   { bg: 'rgba(16,185,129,0.08)',  color: '#10B981',     border: 'rgba(16,185,129,0.2)' },
    executive: { bg: 'rgba(167,139,250,0.08)', color: '#A78BFA',     border: 'rgba(167,139,250,0.2)' },
    oc:        { bg: 'rgba(255,45,155,0.08)',  color: 'var(--pink)', border: 'rgba(255,45,155,0.2)' },
  }

  const filtered = notices.filter(n => {
    if (filter === 'all') return true
    return n.audience === filter
  })

  const pinned = filtered.filter(n => n.is_pinned)
  const regular = filtered.filter(n => !n.is_pinned)

  return (
    <div style={{ maxWidth: 720 }}>

      {/* Page header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ color: 'var(--cyan)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Club</p>
        <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 32, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.01em' }}>
          Notices
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
          Announcements and updates from the Organizing Committee.
        </p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {['all', 'general', ...(profile?.role === 'executive' || profile?.role === 'oc' ? ['executive'] : []), ...(profile?.role === 'oc' ? ['oc'] : [])].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.15s', background: filter === f ? 'rgba(0,212,255,0.1)' : 'transparent', color: filter === f ? 'var(--cyan)' : 'var(--text-muted)', border: `1px solid ${filter === f ? 'rgba(0,212,255,0.3)' : 'var(--border)'}` }}>
            {f === 'all' ? `All (${notices.length})` : f}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3].map(i => <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, height: 90 }}/>)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', border: '1px dashed var(--border)', borderRadius: 14, padding: '56px 24px', textAlign: 'center' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" style={{ margin: '0 auto 12px', display: 'block' }}>
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500 }}>No notices yet</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>Announcements from the OC will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Pinned notices */}
          {pinned.length > 0 && (
            <>
              <p style={{ color: 'var(--text-muted)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Pinned</p>
              {pinned.map(n => <NoticeCard key={n.id} notice={n} audienceColors={AUDIENCE_COLORS} />)}
              {regular.length > 0 && <p style={{ color: 'var(--text-muted)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginTop: 8 }}>All notices</p>}
            </>
          )}

          {/* Regular notices */}
          {regular.map(n => <NoticeCard key={n.id} notice={n} audienceColors={AUDIENCE_COLORS} />)}
        </div>
      )}
    </div>
  )
}

function NoticeCard({ notice, audienceColors }) {
  const [expanded, setExpanded] = useState(false)
  const ac = audienceColors[notice.audience] || audienceColors.all
  const isLong = notice.body?.length > 160

  return (
    <div style={{ background: 'var(--bg-card)', border: `1px solid ${notice.is_pinned ? 'rgba(0,212,255,0.2)' : 'var(--border)'}`, borderRadius: 12, padding: '16px 18px', transition: 'border-color 0.2s' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {notice.is_pinned && (
            <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.25)' }}>
              📌 PINNED
            </span>
          )}
          <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{notice.title}</h3>
        </div>
        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: ac.bg, color: ac.color, border: `1px solid ${ac.border}`, textTransform: 'capitalize', flexShrink: 0 }}>
          {notice.audience}
        </span>
      </div>

      <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.65, marginBottom: 10 }}>
        {isLong && !expanded ? `${notice.body?.slice(0, 160)}...` : notice.body}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>
          {formatDate(notice.created_at)}
        </p>
        {isLong && (
          <button onClick={() => setExpanded(!expanded)}
            style={{ background: 'none', border: 'none', color: 'var(--cyan)', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>
    </div>
  )
}
