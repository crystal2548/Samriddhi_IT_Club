import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase'

export default function MemberDirectory() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id, full_name, role, oc_position, college_year, photo_url, bio, skills, github_url, linkedin_url')
      .eq('is_active', true)
      .order('role')
      .then(({ data }) => { setMembers(data || []); setLoading(false) })
  }, [])

  const filtered = members.filter(m => {
    const matchSearch = m.full_name?.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'all' || m.role === roleFilter
    return matchSearch && matchRole
  })

  const ROLE_COLORS = {
    oc:        { bg: 'rgba(255,45,155,0.1)',  color: 'var(--pink)', border: 'rgba(255,45,155,0.25)' },
    executive: { bg: 'rgba(0,212,255,0.1)',   color: 'var(--cyan)', border: 'rgba(0,212,255,0.25)' },
    general:   { bg: 'rgba(107,114,128,0.1)', color: '#9CA3AF',     border: 'rgba(107,114,128,0.2)' },
  }

  function getRoleLabel(m) {
    if (m.role === 'oc') return m.oc_position?.replace(/_/g, ' ') || 'OC'
    if (m.role === 'executive') return 'Executive'
    return 'Member'
  }

  function getInitials(name) {
    if (!name) return 'M'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div style={{ maxWidth: 960 }}>

      {/* Page header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ color: 'var(--cyan)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Club</p>
        <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 32, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.01em' }}>
          Member Directory
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
          {members.length} active members in Samriddhi IT Club.
        </p>
      </div>

      {/* Search + filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search members..."
            style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px 9px 36px', color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif' }}
            onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.4)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
        {['all', 'oc', 'executive', 'general'].map(r => (
          <button key={r} onClick={() => setRoleFilter(r)}
            style={{ padding: '8px 16px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.15s', background: roleFilter === r ? 'rgba(0,212,255,0.1)' : 'transparent', color: roleFilter === r ? 'var(--cyan)' : 'var(--text-muted)', border: `1px solid ${roleFilter === r ? 'rgba(0,212,255,0.3)' : 'var(--border)'}` }}>
            {r}
          </button>
        ))}
      </div>

      {/* Members grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {[1,2,3,4,5,6].map(i => <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, height: 140 }}/>)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', border: '1px dashed var(--border)', borderRadius: 14, padding: '56px 24px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500 }}>No members found</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>Try a different search or filter.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {filtered.map(m => {
            const rc = ROLE_COLORS[m.role] || ROLE_COLORS.general
            return (
              <div key={m.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px', transition: 'border-color 0.2s, transform 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                {/* Avatar + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  {m.photo_url ? (
                    <img src={m.photo_url} alt={m.full_name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--border)', flexShrink: 0 }}/>
                  ) : (
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--cyan), #0066FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {getInitials(m.full_name)}
                    </div>
                  )}
                  <div style={{ overflow: 'hidden' }}>
                    <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.full_name}</p>
                    <span style={{ fontSize: 9, fontWeight: 600, padding: '1px 7px', borderRadius: 10, background: rc.bg, color: rc.color, border: `1px solid ${rc.border}`, textTransform: 'capitalize' }}>
                      {getRoleLabel(m)}
                    </span>
                  </div>
                </div>

                {/* Bio */}
                {m.bio && (
                  <p style={{ color: 'var(--text-muted)', fontSize: 11, lineHeight: 1.5, marginBottom: 10, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {m.bio}
                  </p>
                )}

                {/* Skills */}
                {m.skills?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                    {m.skills.slice(0, 3).map(s => (
                      <span key={s} style={{ fontSize: 9, padding: '2px 7px', borderRadius: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>{s}</span>
                    ))}
                    {m.skills.length > 3 && <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>+{m.skills.length - 3} more</span>}
                  </div>
                )}

                {/* Footer: year + socials */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                    {m.college_year ? `Year ${m.college_year}` : ''}
                  </span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {m.github_url && (
                      <a href={m.github_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', transition: 'color 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--cyan)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                      </a>
                    )}
                    {m.linkedin_url && (
                      <a href={m.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', transition: 'color 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--cyan)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}