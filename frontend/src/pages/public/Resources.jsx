import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../utils/supabase'
import ResourceCard from '../../components/shared/ResourceCard'
import OpportunityItem from '../../components/shared/OpportunityItem'

export default function Resources() {
  const [resources, setResources] = useState([])
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeTrack, setActiveTrack] = useState('All')

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const [resData, oppData] = await Promise.all([
        supabase.from('resources').select('*').order('created_at', { ascending: false }),
        supabase.from('opportunities').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(5)
      ])
      
      setResources(resData.data || [])
      setOpportunities(oppData.data || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  const filteredResources = resources.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) || 
                          r.description?.toLowerCase().includes(search.toLowerCase())
    const matchesTrack  = activeTrack === 'All' || r.track === activeTrack
    return matchesSearch && matchesTrack
  })

  const tracks = ['All', ...new Set(resources.map(r => r.track).filter(Boolean))]

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: 80, paddingBottom: 100 }}>
      <div className="container mx-auto px-6">
        
        {/* ── HERO ────────────────────────────────────────── */}
        <div style={{ marginBottom: 64 }}>
           <div style={{ display: 'inline-block', padding: '4px 12px', background: 'rgba(255,45,155,0.1)', border: '1px solid rgba(255,45,155,0.2)', borderRadius: 20, marginBottom: 16 }}>
             <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--pink)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Member Hub</span>
           </div>
           <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 900, color: '#fff', textTransform: 'uppercase', lineHeight: 0.9, marginBottom: 24 }}>
             RESOURCES & <br/>
             <span style={{ color: 'var(--cyan)' }}>OPPORTUNITIES</span>
           </h1>
           <p style={{ color: 'var(--text-secondary)', fontSize: 15, maxWidth: 500, lineHeight: 1.6 }}>
             Access curated learning materials, technical documentation, and exclusive career paths handpicked by the Samriddhi IT community.
           </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '8fr 3fr', gap: 48, alignItems: 'start' }}>
          
          {/* ── LEFT: RESOURCE LIBRARY ─────────────────────── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
               <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 24, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Resource Library</h2>
               <div style={{ display: 'flex', gap: 12 }}>
                 <div style={{ position: 'relative' }}>
                   <input 
                     type="text" 
                     placeholder="Search resources..." 
                     value={search}
                     onChange={e => setSearch(e.target.value)}
                     style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px 8px 36px', color: '#fff', fontSize: 13, outline: 'none', width: 220 }}
                   />
                   <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                 </div>
               </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
              {tracks.map(t => (
                <button 
                  key={t}
                  onClick={() => setActiveTrack(t)}
                  style={{ padding: '6px 14px', borderRadius: 6, background: activeTrack === t ? 'var(--cyan)' : 'transparent', border: '1px solid var(--border)', color: activeTrack === t ? '#0A0E1A' : 'var(--text-muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                >{t}</button>
              ))}
            </div>

            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
                {[1,2,3,4,5,6].map(i => <div key={i} style={{ height: 180, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid var(--border)' }}/>)}
              </div>
            ) : filteredResources.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
                {filteredResources.map(r => <ResourceCard key={r.id} resource={r} />)}
              </div>
            ) : (
              <div style={{ padding: 60, textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 16 }}>
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No resources found matching your criteria.</p>
              </div>
            )}

            {/* Newsletter CTA */}
            <div style={{ marginTop: 64, padding: 32, borderRadius: 20, background: 'linear-gradient(135deg, rgba(0,212,255,0.05), rgba(255,45,155,0.05))', border: '1px solid rgba(0,212,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32 }}>
               <div>
                  <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Weekly Tech Digest</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Get notified about new resources and opportunities every Monday.</p>
               </div>
               <div style={{ display: 'flex', gap: 8 }}>
                 <input type="email" placeholder="Your email" style={{ background: '#0D1117', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 16px', color: '#fff', fontSize: 13, width: 220 }} />
                 <button className="btn-primary" style={{ padding: '0 20px', fontSize: 13 }}>Subscribe</button>
               </div>
            </div>
          </div>

          {/* ── RIGHT: SIDEBAR OPPORTUNITIES ────────────────── */}
          <aside>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
               <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 18, fontWeight: 800, color: '#fff', textTransform: 'uppercase' }}>Latest Openings</h2>
               <Link to="/opportunities" style={{ color: 'var(--pink)', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>View All →</Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
               {loading ? (
                 [1,2,3].map(i => <div key={i} style={{ height: 80, background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid var(--border)', marginBottom: 12 }}/>)
               ) : opportunities.length > 0 ? (
                 opportunities.map(o => <OpportunityItem key={o.id} opportunity={o} />)
               ) : (
                 <p style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center', padding: 20 }}>No active openings right now.</p>
               )}
            </div>

            {/* Quick Link Card */}
            <div style={{ marginTop: 32, padding: 24, borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,45,155,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--pink)', marginBottom: 16 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              </div>
              <h4 style={{ color: '#fff', fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Member Perks</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: 11, lineHeight: 1.5, marginBottom: 16 }}>Samriddhi members get access to exclusive referral codes and job boards.</p>
              <Link to="/join" style={{ color: 'var(--cyan)', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>Learn more</Link>
            </div>
          </aside>

        </div>

        {/* ── GUIDED LEARNING PATHS ─────────────────────── */}
        <section style={{ marginTop: 100 }}>
          <div style={{ marginBottom: 32 }}>
            <p style={{ color: 'var(--pink)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Curated Paths</p>
            <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 28, fontWeight: 800, color: '#fff', textTransform: 'uppercase' }}>Guided Learning Paths</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
             <PathCard 
               title="Frontend Engineering" 
               desc="Master the modern web with React, TypeScript, and Advanced CSS."
               steps={['JS Fundamentals', 'React Patterns', 'State Management']}
               color="var(--cyan)"
             />
             <PathCard 
               title="Backend & Cloud" 
               desc="Learn to build scalable APIs and manage cloud infrastructure."
               steps={['Node.js & Express', 'PostgreSQL/Supabase', 'AWS Basics']}
               color="var(--pink)"
             />
             <PathCard 
               title="UI/UX Design" 
               desc="Design beautiful and functional user experiences from scratch."
               steps={['Design Principles', 'Figma Mastery', 'Prototyping']}
               color="#A78BFA"
             />
          </div>
        </section>

      </div>
    </div>
  )
}

function PathCard({ title, desc, steps, color }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, transition: 'all 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = color}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 700, marginBottom: 12 }}>{title}</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>{desc}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: color, fontWeight: 800 }}>{i+1}</div>
            <span style={{ color: '#fff', fontSize: 12 }}>{s}</span>
          </div>
        ))}
      </div>
      <button style={{ marginTop: 24, width: '100%', padding: '10px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Start Path</button>
    </div>
  )
}
