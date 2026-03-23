import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../utils/supabase'
import TeamMemberCard from '../../components/shared/TeamMemberCard'

export default function Team() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    async function fetchTeam() {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_active', true)
        .order('role', { ascending: false }) // Executive first
      
      if (error) console.error('Error fetching team:', error)
      else setMembers(data || [])
      setLoading(false)
    }
    fetchTeam()
  }, [])

  // Categorization
  const leadership = members.filter(m => m.role === 'executive' || m.oc_position?.toLowerCase().includes('president'))
  const ocMembers = members.filter(m => (m.role === 'oc' || m.role === 'executive') && !leadership.includes(m))

  const DEPARTMENTS = {
    'Development': ['technical_lead'],
    'Design': ['graphics_designer', 'media_design'],
    'Media': ['video_editor'],
    'Operations': ['event_coordinator', 'secretary', 'treasurer']
  }

  const getDept = (pos) => {
    if (!pos) return 'General'
    for (const [dept, roles] of Object.entries(DEPARTMENTS)) {
      if (roles.includes(pos.toLowerCase())) return dept
    }
    return 'Operations' // Default
  }

  const filteredOC = ocMembers.filter(m => {
    if (filter === 'All') return true
    return getDept(m.oc_position) === filter
  })

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: 80, paddingBottom: 100 }}>
      <div className="container mx-auto px-6">
        
        {/* ── HERO ────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: 80 }}>
           <div style={{ display: 'inline-block', padding: '4px 12px', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 20, marginBottom: 16 }}>
             <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Our Team</span>
           </div>
           <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 'clamp(40px, 8vw, 72px)', fontWeight: 900, color: '#fff', textTransform: 'uppercase', lineHeight: 0.9, marginBottom: 24 }}>
             MEET THE <br/>
             <span style={{ color: 'var(--cyan)' }}>ARCHITECTS</span>
           </h1>
           <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 650, margin: '0 auto', lineHeight: 1.6 }}>
             A diverse collection of engineers, designers, and thinkers dedicated to pushing the boundaries of technology at Samriddhi College.
           </p>
        </div>

        {/* ── FILTERS ────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 64, flexWrap: 'wrap' }}>
          {['All', 'Development', 'Design', 'Media', 'Operations'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              style={{ padding: '8px 24px', borderRadius: 30, background: filter === f ? 'var(--cyan)' : 'transparent', border: '1px solid var(--border)', color: filter === f ? '#0A0E1A' : 'var(--text-muted)', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
            >
              {f === 'All' ? '👨‍💻 All' : f === 'Development' ? '⚡ Development' : f === 'Design' ? '🎨 Design' : f === 'Media' ? '🎬 Media' : '⚙️ Operations'}
            </button>
          ))}
        </div>

        {/* ── LEADERSHIP SECTION ─────────────────────────── */}
        <section style={{ marginBottom: 100 }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ color: 'var(--pink)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Foundational</p>
            <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 32, fontWeight: 800, color: '#fff', textTransform: 'uppercase' }}>Our Leadership</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32, maxWidth: 1200, margin: '0 auto' }}>
            {loading ? (
              [1,2,3,4].map(i => <div key={i} style={{ height: 350, background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid var(--border)' }}/>)
            ) : (
              leadership.map(m => (
                <TeamMemberCard key={m.id} member={m} variant="leadership" />
              ))
            )}
          </div>
        </section>

        {/* ── DEPARTMENT TEAMS ───────────────────────────── */}
        <section>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ color: 'var(--cyan)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>The Engine</p>
            <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 32, fontWeight: 800, color: '#fff', textTransform: 'uppercase' }}>Department Teams</h2>
          </div>

          {loading ? (
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 24 }}>
               {[1,2,3,4,5,6,7,8].map(i => <div key={i} style={{ height: 280, background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid var(--border)' }}/>)}
             </div>
          ) : filteredOC.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 24 }}>
              {filteredOC.map(m => (
                <TeamMemberCard key={m.id} member={m} />
              ))}
            </div>
          ) : (
            <div style={{ padding: 80, textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 20 }}>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No members found in this category.</p>
            </div>
          )}
        </section>

        {/* ── JOIN CTA ────────────────────────────────────── */}
        <div style={{ marginTop: 120, padding: 64, borderRadius: 24, background: 'var(--bg-card)', border: '1px solid var(--border)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
           <div style={{ position: 'absolute', bottom: -50, right: -50, width: 200, height: 200, background: 'var(--cyan)', filter: 'blur(100px)', opacity: 0.1 }} />
           
           <h2 style={{ color: '#fff', fontSize: 28, fontWeight: 800, marginBottom: 16, textTransform: 'uppercase' }}>Want to be part of the team?</h2>
           <p style={{ color: 'var(--text-secondary)', fontSize: 15, maxWidth: 600, margin: '0 auto 32px', lineHeight: 1.6 }}>
             We're always looking for passionate individuals to join our mission. Whether you're a coder, a designer, or a planner, there's a place for you.
           </p>
           <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
             <Link to="/join" className="btn-primary" style={{ padding: '12px 32px' }}>Apply Now</Link>
             <Link to="/resources" style={{ padding: '12px 32px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border)', color: '#fff', textDecoration: 'none', fontWeight: 700 }}>View Roles</Link>
           </div>
        </div>

      </div>
    </div>
  )
}