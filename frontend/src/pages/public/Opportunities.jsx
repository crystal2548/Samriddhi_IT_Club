import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../utils/supabase'
import OpportunityItem from '../../components/shared/OpportunityItem'
import { formatDateShort } from '../../utils/formatDate'

export default function Opportunities() {
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    async function fetchOpportunities() {
      setLoading(true)
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      
      if (error) console.error('Error fetching opportunities:', error)
      else setOpportunities(data || [])
      setLoading(false)
    }
    fetchOpportunities()
  }, [])

  const filtered = opportunities.filter(o => filter === 'all' || o.type?.toLowerCase() === filter.toLowerCase())
  const types = ['all', 'hiring', 'internship', 'hackathon', 'fellowship']

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: 80, paddingBottom: 100 }}>
      <div className="container mx-auto px-6">
        
        {/* ── Header ─────────────────────────────────── */}
        <div style={{ marginBottom: 48 }}>
           <Link to="/resources" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none', marginBottom: 24, transition: 'color 0.2s' }}
             onMouseEnter={e => e.currentTarget.style.color = 'var(--cyan)'}
             onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
           >
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
             Back to Resources Hub
           </Link>
           <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: 16 }}>Career Opportunities</h1>
           <p style={{ color: 'var(--text-secondary)', fontSize: 15, maxWidth: 600 }}>
             Find your next role, internship, or hackathon. We curate global and local opportunities specifically for Samriddhi members.
           </p>
        </div>

        {/* ── Filters ────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 40, overflowX: 'auto', paddingBottom: 10 }}>
          {types.map(t => (
            <button 
              key={t}
              onClick={() => setFilter(t)}
              style={{ padding: '8px 18px', borderRadius: 8, background: filter === t ? 'var(--pink)' : 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: filter === t ? '#fff' : 'var(--text-muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', textTransform: 'capitalize' }}
            >{t}</button>
          ))}
        </div>

        {/* ── Grid ───────────────────────────────────── */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {[1,2,3,4].map(i => <div key={i} style={{ height: 120, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid var(--border)' }}/>)}
          </div>
        ) : filtered.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {filtered.map(o => (
              <a href={o.link} target="_blank" rel="noopener noreferrer" key={o.id} style={{ textDecoration: 'none' }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, height: '100%', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,45,155,0.3)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', color: 'var(--pink)', textTransform: 'uppercase' }}>{o.type}</span>
                    {o.deadline && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Ends {formatDateShort(o.deadline)}</span>}
                  </div>
                  <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{o.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>{o.description}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--cyan)', fontSize: 13, fontWeight: 600 }}>
                    Apply Now
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div style={{ padding: 80, textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 20 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No opportunities found in this category.</p>
          </div>
        )}

      </div>
    </div>
  )
}