import { useSiteSettings } from '../../context/SiteContext'

export default function TeamMemberCard({ member, variant = 'grid' }) {
  const { settings } = useSiteSettings()
  const isLeadership = variant === 'leadership'
  
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: isLeadership ? 32 : 24, textAlign: 'center', transition: 'all 0.3s', position: 'relative', overflow: 'hidden' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.4)'; e.currentTarget.style.transform = 'translateY(-6px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      {/* Glow Effect for Leadership */}
      {isLeadership && (
        <div style={{ position: 'absolute', top: -100, left: -100, width: 200, height: 200, background: 'var(--cyan)', filter: 'blur(100px)', opacity: 0.05, pointerEvents: 'none' }} />
      )}

      <div style={{ position: 'relative', width: isLeadership ? 120 : 90, height: isLeadership ? 120 : 90, margin: '0 auto 20px', borderRadius: '50%', padding: 4, background: 'linear-gradient(135deg, var(--cyan), var(--pink))' }}>
        <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#0A0E1A', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {member.photo_url ? (
            <img src={member.photo_url} alt={member.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: isLeadership ? 32 : 24, fontWeight: 800, color: 'var(--cyan)' }}>{member.full_name?.[0]}</span>
          )}
        </div>
        {/* Active Badge */}
        <div style={{ position: 'absolute', bottom: 4, right: 4, width: 14, height: 14, borderRadius: '50%', background: '#10B981', border: '2px solid #0A0E1A' }} />
      </div>

      <h3 style={{ color: '#fff', fontSize: isLeadership ? 20 : 16, fontWeight: 700, marginBottom: 4 }}>{member.full_name}</h3>
      <p style={{ color: 'var(--cyan)', fontSize: isLeadership ? 13 : 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
        {member.oc_position?.replace(/_/g, ' ') || member.role}
      </p>

      <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6, marginBottom: 20, display: isLeadership ? 'block' : '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {member.bio || `Passionate member of ${settings.club_name} working as a ${member.oc_position?.replace(/_/g, ' ') || member.role}.`}
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
        {member.github_url && (
          <a href={member.github_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
          </a>
        )}
        {member.linkedin_url && (
          <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#0077b5'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
          </a>
        )}
      </div>
    </div>
  )
}
