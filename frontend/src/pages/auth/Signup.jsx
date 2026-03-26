import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../utils/supabase'
import { useAuth } from '../../context/AuthContext'

export default function Signup() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // If there's no session, they shouldn't be here (unless they are a regular user, but we only use this for invited users now)
  useEffect(() => {
    if (!authLoading && !user) {
      // Small delay to allow session to settle after clicking email link
      const timer = setTimeout(() => {
        if (!user) navigate('/login')
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [user, authLoading, navigate])

  const handleCompleteSignup = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      return setError('Password must be at least 6 characters.')
    }
    if (password !== confirmPassword) {
      return setError('Passwords do not match.')
    }

    setLoading(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) {
        setError(updateError.message)
        setLoading(false)
        return
      }

      setSuccess(true)
      // Sign out after setting password so they can log in normally
      await supabase.auth.signOut()
      
      setTimeout(() => {
        navigate('/login')
      }, 3000)

    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  if (authLoading) return <div style={{ color: '#fff', textAlign: 'center', paddingTop: 100 }}>Loading...</div>

  if (success) {
    return (
      <div style={ContainerStyle}>
        <div style={CardStyle}>
          <div style={SuccessIconStyle}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h1 style={TitleStyle}>Account Ready!</h1>
          <p style={DescStyle}>Your password has been set successfully. We are redirecting you to the login page...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={ContainerStyle}>
      <div style={CardStyle}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={TitleStyle}>Complete Registration</h1>
          <p style={DescStyle}>Welcome to the club! Set your password to complete your account setup.</p>
          <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(0,212,255,0.06)', borderRadius: 8, border: '1px solid rgba(0,212,255,0.2)' }}>
            <p style={{ color: 'var(--cyan)', fontSize: 12, fontWeight: 600 }}>{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleCompleteSignup} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {error && <div style={ErrorStyle}>{error}</div>}
          
          <div>
            <label style={LabelStyle}>New Password</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••" 
              style={InputStyle}
              onFocus={e => e.target.style.borderColor='rgba(0,212,255,0.4)'}
              onBlur={e => e.target.style.borderColor='var(--border)'}
            />
          </div>

          <div>
            <label style={LabelStyle}>Confirm New Password</label>
            <input 
              type="password" 
              required 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              placeholder="••••••••" 
              style={InputStyle}
              onFocus={e => e.target.style.borderColor='rgba(0,212,255,0.4)'}
              onBlur={e => e.target.style.borderColor='var(--border)'}
            />
          </div>

          <button type="submit" disabled={loading} style={ButtonStyle}>
            {loading ? 'Completing...' : 'Finish Sign Up'}
          </button>
        </form>
      </div>
    </div>
  )
}

const ContainerStyle = { minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }
const CardStyle = { width: '100%', maxWidth: 440, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '36px 32px' }
const TitleStyle = { fontFamily: 'Barlow Condensed, sans-serif', fontSize: 32, fontWeight: 900, color: '#fff', textTransform: 'uppercase', marginBottom: 8, textAlign: 'center' }
const DescStyle = { color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', lineHeight: 1.6 }
const LabelStyle = { display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }
const InputStyle = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, padding: '11px 14px', color: '#fff', fontSize: 14, outline: 'none', transition: 'border-color 0.2s', fontFamily: 'Inter, sans-serif' }
const ButtonStyle = { width: '100%', padding: '13px', background: 'var(--cyan)', border: 'none', borderRadius: 8, color: '#0A0E1A', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer', marginTop: 10 }
const ErrorStyle = { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '12px 14px', color: '#EF4444', fontSize: 13, lineHeight: 1.5 }
const SuccessIconStyle = { width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }
