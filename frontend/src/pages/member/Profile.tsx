import { useEffect, useState, useRef } from 'react'
import type { ChangeEvent, KeyboardEvent } from 'react'
import type { CSSProperties } from 'react'
import { supabase } from '../../utils/supabase'
import { useAuth } from '../../context/AuthContext'

const SKILL_SUGGESTIONS = [
  'React', 'Node.js', 'Python', 'JavaScript', 'TypeScript',
  'Flutter', 'MongoDB', 'PostgreSQL', 'Django', 'FastAPI',
  'Machine Learning', 'AI/ML', 'UI/UX Design', 'Figma',
  'Docker', 'Git', 'AWS', 'Firebase', 'Supabase', 'C++', 'Java',
]

interface ProfileForm {
  full_name: string
  phone: string
  bio: string
  college_year: string
  github_url: string
  linkedin_url: string
  skills: string[]
}

export default function Profile() {
  const { user, profile } = useAuth()
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<ProfileForm>({
    full_name: '',
    phone: '',
    bio: '',
    college_year: '',
    github_url: '',
    linkedin_url: '',
    skills: [],
  })
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [skillInput, setSkillInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  // Populate form from profile
  useEffect(() => {
    if (profile) {
      setForm({
        full_name:    profile.full_name    || '',
        phone:        profile.phone        || '',
        bio:          profile.bio          || '',
        college_year: String(profile.college_year ?? ''),
        github_url:   profile.github_url   || '',
        linkedin_url: profile.linkedin_url || '',
        skills:       profile.skills       || [],
      })
      setPhotoPreview(profile.photo_url || null)
    }
  }, [profile])

  // Handle photo selection
  function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('Photo must be under 5MB.')
      return
    }
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
    setError('')
  }

  // Upload photo to Cloudinary (Signed)
  async function uploadPhoto(): Promise<string | null> {
    if (!photo) return null
    setUploading(true)

    try {
      const signRes = await fetch(`${import.meta.env.VITE_API_URL}/api/upload/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!signRes.ok) throw new Error('Failed to get signature')
      const { signature, timestamp, api_key, cloud_name } = await signRes.json() as {
        signature: string; timestamp: string; api_key: string; cloud_name: string
      }

      const data = new FormData()
      data.append('file', photo)
      data.append('timestamp', timestamp)
      data.append('signature', signature)
      data.append('api_key', api_key)

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, {
        method: 'POST',
        body: data,
      })
      if (!res.ok) throw new Error('Cloudinary upload failed')

      const result = await res.json() as { secure_url?: string }
      setUploading(false)
      return result.secure_url || null
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      console.error('Photo upload error:', err)
      setUploading(false)
      setError(`Failed to upload photo: ${msg}`)
      return null
    }
  }

  function addSkill(skill: string) {
    const s = skill.trim()
    if (!s || form.skills.includes(s)) return
    setForm(prev => ({ ...prev, skills: [...prev.skills, s] }))
    setSkillInput('')
  }

  function removeSkill(skill: string) {
    setForm(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }))
  }

  function handleSkillKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addSkill(skillInput)
    }
    if (e.key === 'Backspace' && !skillInput && form.skills.length > 0) {
      removeSkill(form.skills[form.skills.length - 1])
    }
  }

  async function handleSave() {
    if (!form.full_name.trim()) {
      setError('Full name is required.')
      return
    }
    setSaving(true)
    setError('')

    let photo_url = profile?.photo_url || null

    if (photo) {
      const url = await uploadPhoto()
      if (url) {
        photo_url = url
      } else {
        setSaving(false)
        return
      }
    }

    const updates = {
      ...form,
      photo_url,
      college_year: form.college_year ? parseInt(form.college_year) : null,
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user!.id)

    setSaving(false)

    if (updateError) {
      console.error('Supabase update error:', updateError)
      setError(`Failed to save: ${updateError.message}`)
      return
    }

    setSaved(true)
    setPhoto(null)
    setTimeout(() => setSaved(false), 3000)
  }

  const getInitials = (name: string | undefined) => {
    if (!name) return 'M'
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div style={{ maxWidth: 720 }}>

      {/* ── Page header ──────────────────────────────── */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ color: 'var(--cyan)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
          Member Portal
        </p>
        <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 32, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.01em' }}>
          My Profile
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
          Update your personal information and public profile.
        </p>
      </div>

      {/* ── Success / Error messages ─────────────────── */}
      {saved && (
        <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
          <p style={{ color: '#10B981', fontSize: 13 }}>Profile saved successfully!</p>
        </div>
      )}
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p style={{ color: '#EF4444', fontSize: 13 }}>{error}</p>
        </div>
      )}

      {/* ── Photo section ────────────────────────────── */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '24px', marginBottom: 16 }}>
        <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600, marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
          Profile Photo
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Profile"
                style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--cyan-border)' }}
              />
            ) : (
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--cyan), #0066FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#fff' }}>
                {getInitials(form.full_name)}
              </div>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              style={{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: '50%', background: 'var(--cyan)', border: '2px solid var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#0A0E1A" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
          </div>

          <div>
            <p style={{ color: '#fff', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
              {photo ? photo.name : 'Upload a profile photo'}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 12 }}>
              JPG, PNG or WebP. Max 5MB.
            </p>
            <button
              onClick={() => fileRef.current?.click()}
              style={{ padding: '7px 16px', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 7, color: 'var(--cyan)', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}
            >
              {uploading ? 'Uploading...' : 'Choose photo'}
            </button>
            {photo && (
              <button
                onClick={() => { setPhoto(null); setPhotoPreview(profile?.photo_url || null) }}
                style={{ marginLeft: 8, padding: '7px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer' }}
              >
                Remove
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
        </div>
      </div>

      {/* ── Personal Info ────────────────────────────── */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '24px', marginBottom: 16 }}>
        <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600, marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
          Personal Information
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field
            label="Full Name *"
            value={form.full_name}
            onChange={(v: string) => setForm(p => ({ ...p, full_name: v }))}
            placeholder="Your full name"
          />
          <Field
            label="Phone"
            value={form.phone}
            onChange={(v: string) => setForm(p => ({ ...p, phone: v }))}
            placeholder="+977-98XXXXXXXX"
          />
          <div>
            <label style={LS}>College Year</label>
            <select
              value={form.college_year}
              onChange={e => setForm(p => ({ ...p, college_year: e.target.value }))}
              style={SS}
            >
              <option value="">Select year</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>
          <Field
            label="Email"
            value={profile?.email || ''}
            onChange={() => {}}
            disabled
            placeholder="Your email"
          />
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={LS}>Bio</label>
            <textarea
              value={form.bio}
              onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
              placeholder="Tell other members a bit about yourself..."
              rows={3}
              style={{ ...IS, resize: 'vertical' } as CSSProperties}
              onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.4)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        </div>
      </div>

      {/* ── Skills ───────────────────────────────────── */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '24px', marginBottom: 16 }}>
        <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600, marginBottom: 6, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
          Skills
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 14 }}>
          Press Enter or comma to add a skill. Click a skill to remove it.
        </p>

        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px', display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14, cursor: 'text', minHeight: 44 }}
          onClick={() => document.getElementById('skill-input')?.focus()}
        >
          {form.skills.map(skill => (
            <span
              key={skill}
              onClick={() => removeSkill(skill)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)', color: 'var(--cyan)', fontSize: 12, cursor: 'pointer', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,212,255,0.1)'}
            >
              {skill}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </span>
          ))}
          <input
            id="skill-input"
            value={skillInput}
            onChange={e => setSkillInput(e.target.value)}
            onKeyDown={handleSkillKeyDown}
            placeholder={form.skills.length === 0 ? 'Type a skill and press Enter...' : ''}
            style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 13, minWidth: 140, flex: 1, fontFamily: 'Inter, sans-serif' }}
          />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {SKILL_SUGGESTIONS.filter(s => !form.skills.includes(s)).slice(0, 10).map(s => (
            <button
              key={s}
              onClick={() => addSkill(s)}
              style={{ padding: '3px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.3)'; e.currentTarget.style.color = 'var(--cyan)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              + {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Social Links ─────────────────────────────── */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '24px', marginBottom: 24 }}>
        <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600, marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
          Social Links
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={LS}>GitHub URL</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
              </span>
              <input
                value={form.github_url}
                onChange={e => setForm(p => ({ ...p, github_url: e.target.value }))}
                placeholder="https://github.com/username"
                style={{ ...IS, paddingLeft: 36 }}
                onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.4)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          </div>
          <div>
            <label style={LS}>LinkedIn URL</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </span>
              <input
                value={form.linkedin_url}
                onChange={e => setForm(p => ({ ...p, linkedin_url: e.target.value }))}
                placeholder="https://linkedin.com/in/username"
                style={{ ...IS, paddingLeft: 36 }}
                onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.4)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Save button ──────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={handleSave}
          disabled={saving || uploading}
          style={{ padding: '12px 32px', background: saving || uploading ? 'rgba(0,212,255,0.5)' : 'var(--cyan)', border: 'none', borderRadius: 8, color: '#0A0E1A', fontSize: 13, fontWeight: 700, cursor: saving || uploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}
        >
          {saving || uploading ? (
            <>
              <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#0A0E1A', animation: 'spin 0.7s linear infinite' }}/>
              {uploading ? 'Uploading photo...' : 'Saving...'}
            </>
          ) : 'Save Profile'}
        </button>
        {saved && (
          <span style={{ color: '#10B981', fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            Saved!
          </span>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

/* ── Shared styles ───────────────────────────────────────────── */
const LS: CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: 6,
}

const IS: CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: '9px 12px',
  color: '#fff',
  fontSize: 13,
  outline: 'none',
  fontFamily: 'Inter, sans-serif',
  transition: 'border-color 0.2s',
}

const SS: CSSProperties = {
  ...IS,
  cursor: 'pointer',
}

interface FieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  disabled?: boolean
}

function Field({ label, value, onChange, placeholder = '', type = 'text', disabled = false }: FieldProps) {
  return (
    <div>
      <label style={LS}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange ? e => onChange(e.target.value) : undefined}
        placeholder={placeholder}
        disabled={disabled}
        style={{ ...IS, opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'text' }}
        onFocus={e => { if (!disabled) e.target.style.borderColor = 'rgba(0,212,255,0.4)' }}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
      />
    </div>
  )
}
