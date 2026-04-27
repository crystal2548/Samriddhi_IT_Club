import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../utils/supabase'

export default function ForgotPassword() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')

  const handleReset = async (e) => {
    e.preventDefault()
    setError('')
    if (!email) { setError('Please enter your email address.'); return }
    setLoading(true)

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: `${window.location.origin}/reset-password` }
    )

    if (resetError) {
      setError(resetError.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(0,212,255,0.08)', border: '1.5px solid rgba(0,212,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                <rect x="6" y="6" width="4" height="4" rx="1" stroke="var(--cyan)" strokeWidth="1.5"/>
                <line x1="8" y1="1" x2="8" y2="6" stroke="var(--cyan)" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="8" y1="10" x2="8" y2="15" stroke="var(--cyan)" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="1" y1="8" x2="6" y2="8" stroke="var(--cyan)" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="10" y1="8" x2="15" y2="8" stroke="var(--cyan)" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="8" cy="1" r="1" fill="var(--cyan)"/>
                <circle cx="8" cy="15" r="1" fill="var(--cyan)"/>
                <circle cx="1" cy="8" r="1" fill="var(--pink)"/>
                <circle cx="15" cy="8" r="1" fill="var(--pink)"/>
              </svg>
            </div>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: '0.04em' }}>
              SAMRIDDHI <span style={{ color: 'var(--cyan)' }}>IT CLUB</span>
            </span>
          </Link>
          <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 36, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.01em', marginBottom: 8 }}>
            Reset Password
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '36px 32px' }}>

          {sent ? (
            /* ── Success state ─────────────────────────── */
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Check your email</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6, marginBottom: 24 }}>
                We sent a password reset link to <strong style={{ color: 'var(--text-secondary)' }}>{email}</strong>. Check your inbox and follow the instructions.
              </p>
              <Link to="/login" style={{ color: 'var(--cyan)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                ← Back to login
              </Link>
            </div>
          ) : (
            /* ── Form ──────────────────────────────────── */
            <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {error && (
                <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '12px 14px' }}>
                  <p style={{ color: '#EF4444', fontSize: 13 }}>{error}</p>
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                  Email address
                </label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@college.edu" required
                  style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, padding: '11px 14px', color: '#fff', fontSize: 14, outline: 'none', transition: 'border-color 0.2s', fontFamily: 'Inter, sans-serif' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.4)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              <button
                type="submit" disabled={loading}
                style={{ width: '100%', padding: '13px', background: loading ? 'rgba(0,212,255,0.5)' : 'var(--cyan)', border: 'none', borderRadius: 8, color: '#0A0E1A', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {loading ? (
                  <><div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#0A0E1A', animation: 'spin 0.7s linear infinite' }}/>Sending...</>
                ) : 'Send Reset Link'}
              </button>
              <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
                Remember your password?{' '}
                <Link to="/login" style={{ color: 'var(--cyan)', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
              </p>
            </form>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to="/" style={{ color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to home
          </Link>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
