import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase'
import { useAuth } from '../../context/AuthContext'

export default function OCSiteSettings() {
  const { profile } = useAuth()
  const [settings, setSettings] = useState({ club_name: '', tagline: '', logo_url: '', hero_cta_text: '', contact_email: '', instagram_url: '', linkedin_url: '', github_org_url: '', maintenance_mode: false })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const isPresident = profile?.oc_position === 'president'

  useEffect(() => {
    supabase.from('site_settings').select('*').eq('id', 1).single().then(({ data }) => {
      if (data) setSettings(data)
      setLoading(false)
    })
  }, [])

  async function handleSave() {
    if (!isPresident) return
    setSaving(true)
    await supabase.from('site_settings').upsert({ ...settings, id: 1, updated_at: new Date().toISOString() })
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 3000)
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
              <Field label="Logo URL" value={settings.logo_url} onChange={v => setSettings(p => ({ ...p, logo_url: v }))} placeholder="Cloudinary URL" />
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