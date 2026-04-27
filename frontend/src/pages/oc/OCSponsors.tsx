import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase'
import { useAuth } from '../../context/AuthContext'

const EMPTY = { name: '', logo_url: '', website_url: '', tier: 'partner', contact_email: '', amount: '', is_active: true }

export default function OCSponsors() {
  const { profile } = useAuth()
  const [sponsors, setSponsors] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const canEdit = ['president','vice_president','treasurer'].includes(profile?.oc_position)

  useEffect(() => {
    supabase.from('sponsors').select('*').order('tier').then(({ data }) => { setSponsors(data || []); setLoading(false) })
  }, [])

  async function handleSave() {
    if (!form.name) return
    setSaving(true)
    const payload = { ...form, amount: form.amount ? parseFloat(form.amount) : null }
    const { data } = await supabase.from('sponsors').insert(payload).select().single()
    if (data) setSponsors(prev => [data, ...prev])
    setShowForm(false); setForm(EMPTY); setSaving(false)
  }

  async function toggleActive(id, current) {
    await supabase.from('sponsors').update({ is_active: !current }).eq('id', id)
    setSponsors(prev => prev.map(s => s.id === id ? { ...s, is_active: !current } : s))
  }

  async function handleDelete(id) {
    if (!confirm('Remove this sponsor?')) return
    await supabase.from('sponsors').delete().eq('id', id)
    setSponsors(prev => prev.filter(s => s.id !== id))
  }

  const TIER_COLORS = { gold: '#F59E0B', silver: '#94A3B8', bronze: '#CD7C2F', partner: 'var(--cyan)' }
  const LS = { display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }
  const IS = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif' }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <p style={{ color: 'var(--cyan)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>System</p>
          <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 32, fontWeight: 800, color: '#fff', textTransform: 'uppercase' }}>Sponsors</h1>
        </div>
        {canEdit && <button onClick={() => setShowForm(true)} style={{ padding: '10px 20px', background: 'var(--cyan)', border: 'none', borderRadius: 8, color: '#0A0E1A', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>+ Add Sponsor</button>}
      </div>

      {showForm && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 14, padding: 24, marginBottom: 24 }}>
          <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Add Sponsor</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[['Name','name',''],['Logo URL','logo_url','Cloudinary URL'],['Website URL','website_url','https://...'],['Contact Email (private)','contact_email',''],['Amount (private)','amount','NPR or USD']].map(([label,key,ph]) => (
              <div key={key}>
                <label style={LS}>{label}</label>
                <input value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={ph} style={IS} onFocus={e => e.target.style.borderColor='rgba(0,212,255,0.4)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
              </div>
            ))}
            <div>
              <label style={LS}>Tier</label>
              <select value={form.tier} onChange={e => setForm(p => ({ ...p, tier: e.target.value }))} style={{ ...IS, cursor: 'pointer' }}>
                {['gold','silver','bronze','partner'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 24 }}>
              <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} id="active" />
              <label htmlFor="active" style={{ color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer' }}>Show on homepage</label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button onClick={handleSave} disabled={saving} style={{ padding: '10px 24px', background: 'var(--cyan)', border: 'none', borderRadius: 8, color: '#0A0E1A', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>{saving ? 'Saving...' : 'Add Sponsor'}</button>
            <button onClick={() => setShowForm(false)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {loading ? <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>Loading...</div>
          : sponsors.length === 0 ? <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)', padding: 48, fontSize: 13 }}>No sponsors yet.</div>
          : sponsors.map(s => (
            <div key={s.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, color: TIER_COLORS[s.tier] || 'var(--cyan)', background: `${TIER_COLORS[s.tier] || 'rgba(0,212,255'}18`, border: `1px solid ${TIER_COLORS[s.tier] || 'rgba(0,212,255'}40`, textTransform: 'capitalize' }}>{s.tier}</span>
                <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10, background: s.is_active ? 'rgba(16,185,129,0.1)' : 'rgba(107,114,128,0.1)', color: s.is_active ? '#10B981' : '#6B7280' }}>{s.is_active ? 'Active' : 'Hidden'}</span>
              </div>
              {s.logo_url ? <img src={s.logo_url} alt={s.name} style={{ width: '100%', height: 60, objectFit: 'contain', marginBottom: 10 }} /> : <div style={{ height: 60, marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}><span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{s.name}</span></div>}
              <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{s.name}</p>
              {canEdit && s.contact_email && <p style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 4 }}>{s.contact_email}</p>}
              {canEdit && s.amount && <p style={{ color: 'var(--cyan)', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>{s.amount}</p>}
              {canEdit && (
                <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                  <button onClick={() => toggleActive(s.id, s.is_active)} style={{ flex: 1, padding: '5px', borderRadius: 6, background: s.is_active ? 'rgba(107,114,128,0.1)' : 'rgba(16,185,129,0.1)', border: `1px solid ${s.is_active ? 'rgba(107,114,128,0.25)' : 'rgba(16,185,129,0.25)'}`, color: s.is_active ? '#6B7280' : '#10B981', fontSize: 11, cursor: 'pointer' }}>{s.is_active ? 'Hide' : 'Show'}</button>
                  <button onClick={() => handleDelete(s.id)} style={{ flex: 1, padding: '5px', borderRadius: 6, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', fontSize: 11, cursor: 'pointer' }}>Remove</button>
                </div>
              )}
            </div>
          ))
        }
      </div>
    </div>
  )
}
