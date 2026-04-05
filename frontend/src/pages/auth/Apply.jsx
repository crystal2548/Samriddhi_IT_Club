import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../utils/supabase'
import { useSiteSettings } from '../../context/SiteContext'

export default function Apply() {
  const { settings } = useSiteSettings()
  const [cycles, setCycles] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    cycle_id: '',
    full_name: '',
    email: '',
    phone: '',
    college_year: '',
    position_applying: '',
    skills: '',
    why_join: ''
  })

  useEffect(() => {
    async function fetchCycles() {
      const { data } = await supabase
        .from('recruitment_cycles')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
      
      setCycles(data || [])
      if (data?.length > 0) {
        setForm(p => ({ ...p, cycle_id: data[0].id }))
      }
      setLoading(false)
    }
    fetchCycles()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.cycle_id) return setError('Please select a recruitment cycle.')
    setSaving(true)
    setError('')

    const { error: submitError } = await supabase
      .from('applications')
      .insert([form])

    if (submitError) {
      console.error('Submission Error:', submitError)
      setError(submitError.message)
      setSaving(false)
    } else {
      setSubmitted(true)
      setSaving(false)
    }
  }

  // Common styles to map exactly to Login.jsx
  const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }
  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.04)',
    border: '1px solid var(--border)', borderRadius: 8,
    padding: '11px 14px', color: '#fff', fontSize: 14,
    outline: 'none', transition: 'border-color 0.2s',
    fontFamily: 'Inter, sans-serif',
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '36px 32px', textAlign: 'center', maxWidth: 440, width: '100%' }}>
          <div style={{ width: 48, height: 48, background: 'rgba(16,185,129,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 28, fontWeight: 900, color: '#fff', textTransform: 'uppercase', marginBottom: 12 }}>Application Sent!</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.5, marginBottom: 24 }}>
            Thank you for applying. Our team will review your application and get back to you shortly.
          </p>
          <Link to="/" style={{ display: 'block', width: '100%', padding: '13px', background: 'var(--cyan)', border: 'none', borderRadius: 8, color: '#0A0E1A', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', textDecoration: 'none', textAlign: 'center' }}>
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Background glow identical to Login */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,212,255,0.03) 0%, transparent 70%)',
        pointerEvents: 'none',
      }}/>

      <div style={{ width: '100%', maxWidth: 640, position: 'relative', zIndex: 10, marginTop: '40px', marginBottom: '40px' }}>

        {/* ── Header ───────────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h1 style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontSize: 36, fontWeight: 900,
            color: '#fff', textTransform: 'uppercase',
            letterSpacing: '-0.01em', marginBottom: 8,
          }}>
            Apply to Join
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Fill out the form below to submit your application.
          </p>
        </div>

        {/* ── Card ───────────────────────────────────────── */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '36px 32px',
        }}>

          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>Loading recruitment drives...</div>
          ) : cycles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>No active recruitment cycles at the moment.</p>
              <Link to="/" style={{ color: 'var(--cyan)', textDecoration: 'none', fontWeight: 600 }}>Back to Home</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {error && (
                <div style={{
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  borderRadius: 8, padding: '12px 14px',
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <p style={{ color: '#EF4444', fontSize: 13, lineHeight: 1.5 }}>{error}</p>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input type="text" required value={form.full_name} onChange={e => setForm(p=>({...p, full_name: e.target.value}))} placeholder="e.g. John Doe" style={inputStyle} onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.4)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </div>
                <div>
                  <label style={labelStyle}>Email Address</label>
                  <input type="email" required value={form.email} onChange={e => setForm(p=>({...p, email: e.target.value}))} placeholder="john@college.edu" style={inputStyle} onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.4)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
                <div>
                  <label style={labelStyle}>Phone Number</label>
                  <input type="text" required value={form.phone} onChange={e => setForm(p=>({...p, phone: e.target.value}))} placeholder="+977 98..." style={inputStyle} onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.4)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </div>
                <div>
                  <label style={labelStyle}>College Year</label>
                  <select required value={form.college_year} onChange={e => setForm(p=>({...p, college_year: e.target.value}))} style={{...inputStyle, WebkitAppearance: 'none', appearance: 'none'}} onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.4)'} onBlur={e => e.target.style.borderColor = 'var(--border)'}>
                    <option value="" disabled style={{color: 'var(--text-muted)'}}>Select year</option>
                    <option value="1" style={{background: 'var(--bg-card)'}}>1st Year</option>
                    <option value="2" style={{background: 'var(--bg-card)'}}>2nd Year</option>
                    <option value="3" style={{background: 'var(--bg-card)'}}>3rd Year</option>
                    <option value="4" style={{background: 'var(--bg-card)'}}>4th Year</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
                <div>
                  <label style={labelStyle}>Applying For</label>
                  <select required value={form.cycle_id} onChange={e => setForm(p=>({...p, cycle_id: e.target.value}))} style={{...inputStyle, WebkitAppearance: 'none', appearance: 'none', border: '1px solid rgba(0,212,255,0.3)', color: 'var(--cyan)'}} onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.8)'} onBlur={e => e.target.style.borderColor = 'rgba(0,212,255,0.3)'}>
                    {cycles.map(c => (
                      <option key={c.id} value={c.id} style={{background: 'var(--bg-card)', color: '#fff'}}>{c.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Specific Interest</label>
                  <input type="text" value={form.position_applying} onChange={e => setForm(p=>({...p, position_applying: e.target.value}))} placeholder="e.g. Design, Frontend..." style={inputStyle} onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.4)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Technical Skills & Tools</label>
                <textarea required rows={3} value={form.skills} onChange={e => setForm(p=>({...p, skills: e.target.value}))} placeholder="React, Figma, Python..." style={{...inputStyle, resize: 'vertical'}} onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.4)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </div>

              <div>
                <label style={labelStyle}>Why do you want to join?</label>
                <textarea required rows={3} value={form.why_join} onChange={e => setForm(p=>({...p, why_join: e.target.value}))} placeholder="Briefly describe your motivation..." style={{...inputStyle, resize: 'vertical'}} onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.4)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </div>

              <button
                type="submit"
                disabled={saving}
                style={{
                  width: '100%', padding: '13px', marginTop: 10,
                  background: saving ? 'rgba(0,212,255,0.5)' : 'var(--cyan)',
                  border: 'none', borderRadius: 8,
                  color: '#0A0E1A', fontSize: 13, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#00bde6' }}
                onMouseLeave={e => { if (!saving) e.currentTarget.style.background = 'var(--cyan)' }}
              >
                {saving ? 'Submitting...' : 'Submit Application'}
              </button>

            </form>
          )}

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }}/>
            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }}/>
          </div>

          {/* Login Link */}
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link
              to="/login"
              style={{ color: 'var(--cyan)', textDecoration: 'none', fontWeight: 600 }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Sign In →
            </Link>
          </p>

        </div>

        {/* Back to home */}
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link
            to="/"
            style={{ color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to home
          </Link>
        </div>

      </div>
    </div>
  )
}


