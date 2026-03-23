import { formatDateShort } from '../../utils/formatDate'

export default function OpportunityItem({ opportunity }) {
  const typeColor = {
    hiring: 'var(--cyan)',
    internship: 'var(--pink)',
    hackathon: '#A78BFA',
    fellowship: '#F59E0B',
  }

  return (
    <a href={opportunity.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', marginBottom: 12, transition: 'all 0.2s' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,45,155,0.3)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: typeColor[opportunity.type?.toLowerCase()] || 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{opportunity.type}</span>
          {opportunity.deadline && (
            <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>Due {formatDateShort(opportunity.deadline)}</span>
          )}
        </div>
        <h4 style={{ color: '#fff', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{opportunity.title}</h4>
        <p style={{ color: 'var(--text-muted)', fontSize: 11, lineHeight: 1.4 }}>{opportunity.description?.slice(0, 60)}...</p>
      </div>
    </a>
  )
}
