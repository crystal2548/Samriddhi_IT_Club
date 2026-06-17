import { useEffect, useState, useRef } from 'react'
import type { CSSProperties } from 'react'
import { supabase } from '../../utils/supabase'
import { useAuth } from '../../context/AuthContext'
import type { Sponsor } from '../../types/index'

type SponsorTier = 'gold' | 'silver' | 'bronze' | 'partner'

interface SponsorForm {
  name: string
  logo_url: string
  website_url: string
  tier: SponsorTier
  contact_email: string
  amount: string
  is_active: boolean
}

const EMPTY: SponsorForm = {
  name: '', logo_url: '', website_url: '', tier: 'partner',
  contact_email: '', amount: '', is_active: true
}

const TIER_COLORS: Record<SponsorTier, string> = {
  gold: '#F59E0B', silver: '#94A3B8', bronze: '#CD7C2F', partner: 'var(--cyan)'
}

const FORM_FIELDS: [string, keyof Omit<SponsorForm, 'logo_url' | 'tier' | 'is_active'>, string][] = [
  ['Name', 'name', ''],
  ['Website URL', 'website_url', 'https://...'],
  ['Contact Email (private)', 'contact_email', ''],
  ['Amount (private)', 'amount', 'NPR or USD'],
]

// ── Logo Upload Component ───────────────────────────────────────────────────
function LogoUpload({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5MB.'); return }
    setUploading(true); setError('')

    try {
      const signRes = await fetch(`${import.meta.env.VITE_API_URL}/api/upload/sign`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
      })
      if (!signRes.ok) throw new Error(`Sign request failed with status: ${signRes.status}`)
      const { signature, timestamp, api_key, cloud_name } = await signRes.json()

      const formData = new FormData()
      formData.append('file', file)
      formData.append('timestamp', timestamp)
      formData.append('signature', signature)
      formData.append('api_key', api_key)

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, { method: 'POST', body: formData })
      if (!uploadRes.ok) throw new Error('Cloudinary upload failed')
      const result = await uploadRes.json()
      if (result.secure_url) { onChange(result.secure_url) }
      else throw new Error('No secure_url returned from Cloudinary')
    } catch (err: any) {
      setError(`Upload failed: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
        Sponsor Logo
      </label>
      <div
        style={{
          border: '1px dashed rgba(255,255,255,0.15)', borderRadius: 10,
          padding: 16, textAlign: 'center', transition: 'border-color 0.2s',
          background: 'rgba(255,255,255,0.01)', position: 'relative'
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(0,212,255,0.4)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)')}
      >
        {value ? (
          <div style={{ position: 'relative', width: 'fit-content', margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16 }}>
            <img src={value} alt="Sponsor logo preview" style={{ height: 60, borderRadius: 8, objectFit: 'contain', background: 'rgba(255,255,255,0.02)', padding: 6, border: '1px solid rgba(255,255,255,0.05)' }} />
            <button
              onClick={() => onChange('')}
              style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444',
                cursor: 'pointer', padding: '6px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)' }}
            >Remove Logo</button>
          </div>
        ) : (
          <div
            onClick={() => !uploading && fileRef.current?.click()}
            style={{ cursor: uploading ? 'wait' : 'pointer', opacity: uploading ? 0.7 : 1, padding: '12px 0' }}
          >
            <div style={{ fontSize: 20, color: 'var(--cyan)', marginBottom: 6 }}>
              {uploading
                ? <div style={{ width: 20, height: 20, margin: '0 auto', borderRadius: '50%', border: '2px solid rgba(0,212,255,0.2)', borderTopColor: 'var(--cyan)', animation: 'spin 0.8s linear infinite' }} />
                : '＋ Upload Logo File'}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: 0 }}>{uploading ? 'Uploading to Cloudinary...' : 'Click to select sponsor logo (PNG, JPG, SVG)'}</p>
          </div>
        )}
        <input ref={fileRef} type="file" hidden onChange={handleFile} accept="image/*" />
      </div>
      {error && <p style={{ color: '#EF4444', fontSize: 11, marginTop: 6, margin: '6px 0 0' }}>{error}</p>}
    </div>
  )
}

export default function OCSponsors() {
  const { profile } = useAuth()
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<SponsorForm>(EMPTY)
  const [saving, setSaving] = useState(false)

  const canEdit = ['president', 'vice_president', 'treasurer'].includes(profile?.oc_position ?? '')

  const LS: CSSProperties = { display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }
  const IS: CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif' }

  useEffect(() => {
    supabase.from('sponsors').select('*').order('tier').then(({ data }: { data: Sponsor[] | null }) => {
      setSponsors((data ?? []) as Sponsor[])
      setLoading(false)
    })
  }, [])

  async function handleSave() {
    if (!form.name) return
    setSaving(true)
    const payload = { ...form, amount: form.amount ? String(parseFloat(form.amount)) : null }
    const { data } = await supabase.from('sponsors').insert(payload).select().single()
    if (data) setSponsors(prev => [data as Sponsor, ...prev])
    setShowForm(false); setForm(EMPTY); setSaving(false)
  }

  async function toggleActive(id: string, current: boolean) {
    await supabase.from('sponsors').update({ is_active: !current }).eq('id', id)
    setSponsors(prev => prev.map(s => s.id === id ? { ...s, is_active: !current } : s))
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this sponsor?')) return
    await supabase.from('sponsors').delete().eq('id', id)
    setSponsors(prev => prev.filter(s => s.id !== id))
  }

  return (
    <div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <p style={{ color: 'var(--cyan)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>System</p>
          <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 32, fontWeight: 800, color: '#fff', textTransform: 'uppercase' }}>Sponsors</h1>
        </div>
        {canEdit && (
          <button onClick={() => setShowForm(true)} style={{ padding: '10px 20px', background: 'var(--cyan)', border: 'none', borderRadius: 8, color: '#0A0E1A', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            + Add Sponsor
          </button>
        )}
      </div>

      {showForm && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 14, padding: 24, marginBottom: 24 }}>
          <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Add Sponsor</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {FORM_FIELDS.map(([label, key, ph]) => (
              <div key={key}>
                <label style={LS}>{label}</label>
                <input
                  value={String(form[key])}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  placeholder={ph}
                  style={IS}
                  onFocus={e => (e.target.style.borderColor = 'rgba(0,212,255,0.4)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>
            ))}
            
            <div style={{ gridColumn: '1 / -1' }}>
              <LogoUpload value={form.logo_url} onChange={url => setForm(p => ({ ...p, logo_url: url }))} />
            </div>

            <div>
              <label style={LS}>Tier</label>
              <select 
                value={form.tier} 
                onChange={e => setForm(p => ({ ...p, tier: e.target.value as SponsorTier }))} 
                style={{ ...IS, background: '#0D1829', color: '#fff', cursor: 'pointer' }}
              >
                {(['gold', 'silver', 'bronze', 'partner'] as SponsorTier[]).map(t => (
                  <option key={t} value={t} style={{ background: '#0D1829', color: '#fff' }}>{t}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 24 }}>
              <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} id="active" />
              <label htmlFor="active" style={{ color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer' }}>Show on homepage</label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button onClick={handleSave} disabled={saving} style={{ padding: '10px 24px', background: 'var(--cyan)', border: 'none', borderRadius: 8, color: '#0A0E1A', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              {saving ? 'Saving...' : 'Add Sponsor'}
            </button>
            <button onClick={() => setShowForm(false)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {loading
          ? <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>Loading...</div>
          : sponsors.length === 0
            ? <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)', padding: 48, fontSize: 13 }}>No sponsors yet.</div>
            : sponsors.map(s => {
              const tierColor = TIER_COLORS[s.tier as SponsorTier] ?? 'var(--cyan)'
              return (
                <div key={s.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, color: tierColor, background: `${tierColor}18`, border: `1px solid ${tierColor}40`, textTransform: 'capitalize' }}>{s.tier}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10, background: s.is_active ? 'rgba(16,185,129,0.1)' : 'rgba(107,114,128,0.1)', color: s.is_active ? '#10B981' : '#6B7280' }}>{s.is_active ? 'Active' : 'Hidden'}</span>
                  </div>
                  {s.logo_url
                    ? <img src={s.logo_url} alt={s.name} style={{ width: '100%', height: 60, objectFit: 'contain', marginBottom: 10 }} />
                    : <div style={{ height: 60, marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}><span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{s.name}</span></div>
                  }
                  <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{s.name}</p>
                  {canEdit && s.contact_email && <p style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 4 }}>{s.contact_email}</p>}
                  {canEdit && s.amount && <p style={{ color: 'var(--cyan)', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>{s.amount}</p>}
                  {canEdit && (
                    <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                      <button onClick={() => toggleActive(s.id!, s.is_active ?? false)} style={{ flex: 1, padding: '5px', borderRadius: 6, background: s.is_active ? 'rgba(107,114,128,0.1)' : 'rgba(16,185,129,0.1)', border: `1px solid ${s.is_active ? 'rgba(107,114,128,0.25)' : 'rgba(16,185,129,0.25)'}`, color: s.is_active ? '#6B7280' : '#10B981', fontSize: 11, cursor: 'pointer' }}>{s.is_active ? 'Hide' : 'Show'}</button>
                      <button onClick={() => handleDelete(s.id!)} style={{ flex: 1, padding: '5px', borderRadius: 6, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', fontSize: 11, cursor: 'pointer' }}>Remove</button>
                    </div>
                  )}
                </div>
              )
            })
        }
      </div>
    </div>
  )
}
