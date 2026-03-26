import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../utils/supabase'
import { useAuth } from '../../context/AuthContext'
import { useSiteSettings } from '../../context/SiteContext'

export default function OCSiteSettings() {
  const { profile } = useAuth()
  const { refetch } = useSiteSettings()
  const [settings, setSettings] = useState({ club_name: '', tagline: '', logo_url: '', hero_cta_text: '', contact_email: '', instagram_url: '', linkedin_url: '', github_org_url: '', maintenance_mode: false })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')

  const isPresident = profile?.oc_position === 'president'

  useEffect(() => {
    supabase.from('site_settings').select('*').eq('id', 1).single().then(({ data, error }) => {
      if (data) setSettings(data)
      if (error) console.error('Failed to load site settings:', error)
      setLoading(false)
    })
  }, [])

  async function handleSave() {
    if (!isPresident) return
    setSaving(true)
    setSaveError('')
    const { error } = await supabase
      .from('site_settings')
      .upsert({ ...settings, id: 1, updated_at: new Date().toISOString() })
    setSaving(false)
    if (error) {
      console.error('Save failed:', error)
      setSaveError(`Save failed: ${error.message}`)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      await refetch()   // ← propagate changes globally without page reload
    }
  }

  if (!isPresident) return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <p style={{ color: 'var(--cyan)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>System</p>
        <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 32, fontWeight: 800, color: '#fff', textTransform: 'uppercase' }}>Site Settings</h1>
      </div>
      <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, padding: 24, color: '#F59E0B', fontSize: 13 }}>
        Only the President can edit site settings.
      </div>
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <p style={{ color: 'var(--cyan)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>System</p>
          <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 32, fontWeight: 800, color: '#fff', textTransform: 'uppercase' }}>Site Settings</h1>
        </div>
        {saved && <span style={{ fontSize: 12, color: '#10B981', background: 'rgba(16,185,129,0.1)', padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(16,185,129,0.25)' }}>✓ Saved successfully</span>}
      </div>

      {loading ? <div style={{ color: 'var(--text-muted)', padding: 32 }}>Loading...</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          <SettingsSection title="Club Identity">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Club Name" value={settings.club_name} onChange={v => setSettings(p => ({ ...p, club_name: v }))} />
              <Field label="Tagline" value={settings.tagline} onChange={v => setSettings(p => ({ ...p, tagline: v }))} />
              <div style={{ gridColumn: '1 / -1' }}>
                <LogoUpload label="Club Logo" value={settings.logo_url} onChange={url => setSettings(p => ({ ...p, logo_url: url }))} />
              </div>
              <Field label="Hero CTA Button Text" value={settings.hero_cta_text} onChange={v => setSettings(p => ({ ...p, hero_cta_text: v }))} placeholder="e.g. Join the Club" />
              <Field label="Contact Email" type="email" value={settings.contact_email} onChange={v => setSettings(p => ({ ...p, contact_email: v }))} />
            </div>
          </SettingsSection>

          <SettingsSection title="Social Links">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Instagram URL" value={settings.instagram_url} onChange={v => setSettings(p => ({ ...p, instagram_url: v }))} placeholder="https://instagram.com/..." />
              <Field label="LinkedIn URL" value={settings.linkedin_url} onChange={v => setSettings(p => ({ ...p, linkedin_url: v }))} placeholder="https://linkedin.com/..." />
              <Field label="GitHub Org URL" value={settings.github_org_url} onChange={v => setSettings(p => ({ ...p, github_org_url: v }))} placeholder="https://github.com/..." />
            </div>
          </SettingsSection>

          <SettingsSection title="About Page Content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Textarea
                label="About Hero Description"
                value={settings.about_description}
                onChange={v => setSettings(p => ({ ...p, about_description: v }))}
                placeholder="Short description that appears in the About page hero section..."
                rows={3}
              />
              <Textarea
                label="Our Story"
                value={settings.about_story}
                onChange={v => setSettings(p => ({ ...p, about_story: v }))}
                placeholder="The full story paragraph shown in the 'Our Story' section..."
                rows={5}
              />
            </div>
          </SettingsSection>

          <SettingsSection title="Stats Bar (About & Home pages)">
            <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 16 }}>These numbers appear in the stats bar across the site. Include the + symbol if needed (e.g. "120+").</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Active Members" value={settings.stat_members} onChange={v => setSettings(p => ({ ...p, stat_members: v }))} placeholder="e.g. 120+" />
              <Field label="Annual Events" value={settings.stat_events} onChange={v => setSettings(p => ({ ...p, stat_events: v }))} placeholder="e.g. 30+" />
              <Field label="Alumni Network" value={settings.stat_alumni} onChange={v => setSettings(p => ({ ...p, stat_alumni: v }))} placeholder="e.g. 500+" />
              <Field label="Industry Partners" value={settings.stat_partners} onChange={v => setSettings(p => ({ ...p, stat_partners: v }))} placeholder="e.g. 12+" />
            </div>
          </SettingsSection>

          <SettingsSection title="Maintenance">
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <div style={{ position: 'relative', width: 44, height: 24 }}>
                <input type="checkbox" checked={settings.maintenance_mode} onChange={e => setSettings(p => ({ ...p, maintenance_mode: e.target.checked }))} style={{ opacity: 0, width: '100%', height: '100%', position: 'absolute', cursor: 'pointer', margin: 0, zIndex: 1 }} />
                <div style={{ width: '100%', height: '100%', borderRadius: 12, background: settings.maintenance_mode ? 'var(--cyan)' : 'rgba(255,255,255,0.1)', transition: 'background 0.2s' }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: settings.maintenance_mode ? 23 : 3, transition: 'left 0.2s' }}/>
                </div>
              </div>
              <div>
                <p style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>Maintenance Mode</p>
                <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Shows a "coming soon" page to visitors when enabled</p>
              </div>
            </label>
          </SettingsSection>

          <button onClick={handleSave} disabled={saving} style={{ padding: '12px 28px', background: 'var(--cyan)', border: 'none', borderRadius: 8, color: '#0A0E1A', fontSize: 13, fontWeight: 700, cursor: 'pointer', width: 'fit-content' }}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          {saveError && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 16px', color: '#EF4444', fontSize: 12 }}>
              {saveError}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SettingsSection({ title, children }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
      <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600, marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>{title}</h3>
      {children}
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</label>
      <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif' }}
        onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.4)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
      />
    </div>
  )
}

function Textarea({ label, value, onChange, placeholder = '', rows = 4 }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</label>
      <textarea rows={rows} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif', resize: 'vertical', lineHeight: 1.7 }}
        onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.4)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
      />
    </div>
  )
}


function LogoUpload({ label, value, onChange }) {
  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5MB.'); return }
    setUploading(true); setError('')

    try {
      const signRes = await fetch(`${import.meta.env.VITE_API_URL}/api/upload/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!signRes.ok) throw new Error(`Sign request failed with status: ${signRes.status}`)
      
      const { signature, timestamp, api_key, cloud_name } = await signRes.json()

      const formData = new FormData()
      formData.append('file', file)
      formData.append('timestamp', timestamp)
      formData.append('signature', signature)
      formData.append('api_key', api_key)

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
        { method: 'POST', body: formData }
      )
      
      if (!uploadRes.ok) {
        const errData = await uploadRes.json()
        throw new Error(errData.error?.message || 'Cloudinary upload failed')
      }

      const result = await uploadRes.json()
      if (result.secure_url) {
        onChange(result.secure_url)
      } else {
        throw new Error('No secure_url returned from Cloudinary')
      }
    } catch (err) {
      console.error('Upload flow error:', err)
      setError(`Upload failed: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</label>
      <div style={{ border: '1px dashed var(--border)', borderRadius: 12, padding: 20, textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
        {value ? (
          <div style={{ position: 'relative', width: 'fit-content', margin: '0 auto' }}>
            <img src={value} alt="Logo" style={{ height: 60, borderRadius: 8, objectFit: 'contain', background: '#fff', padding: 8 }}/>
            <button onClick={() => onChange('')} style={{ position: 'absolute', top: -10, right: -10, width: 24, height: 24, borderRadius: '50%', background: '#EF4444', border: 'none', color: '#fff', cursor: 'pointer' }}>×</button>
          </div>
        ) : (
          <div onClick={() => !uploading && fileRef.current?.click()} style={{ cursor: uploading ? 'wait' : 'pointer' }}>
            <div style={{ fontSize: 24, color: 'var(--text-muted)', marginBottom: 8 }}>{uploading ? '...' : '+'}</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{uploading ? 'Uploading...' : 'Click to upload logo'}</p>
          </div>
        )}
        <input ref={fileRef} type="file" hidden onChange={handleFile} accept="image/*" />
      </div>
      {error && <p style={{ color: '#EF4444', fontSize: 11, marginTop: 4 }}>{error}</p>}
    </div>
  )
}