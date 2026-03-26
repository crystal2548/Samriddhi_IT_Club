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
    if (!form.cycle_id) return setError('Please select a recruitment cycle')
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

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-primary)' }}>
        <div className="max-w-md w-full p-10 rounded-2xl text-center" style={{ background: 'var(--bg-card)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 32, fontWeight: 800, color: '#fff', textTransform: 'uppercase', marginBottom: 12 }}>Application Sent!</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 32 }}>
            Thank you for applying to {settings.club_name}. Our team will review your application and get back to you via email soon.
          </p>
          <Link to="/" className="btn-primary" style={{ display: 'inline-block', width: '100%', padding: '12px 0', textDecoration: 'none' }}>Back to Home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-primary)', padding: '80px 24px' }}>
      <div className="max-w-2xl w-full p-8 rounded-2xl shadow-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        
        <div style={{ marginBottom: 32 }}>
          <p style={{ color: 'var(--cyan)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Join the Movement</p>
          <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 36, fontWeight: 900, color: '#fff', textTransform: 'uppercase', lineHeight: 1 }}>BECOME A MEMBER</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 8 }}>Fill out the form below to join {settings.club_name}.</p>
        </div>

        {loading ? <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>Loading active drives...</div> : 
         cycles.length === 0 ? (
           <div style={{ textAlign: 'center', padding: '40px 0' }}>
             <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>There are no active recruitment drives at the moment.</p>
             <Link to="/" className="btn-outline">Back to Home</Link>
           </div>
         ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <Field label="Full Name" required value={form.full_name} onChange={v => setForm(p=>({...p, full_name: v}))} placeholder="John Doe" />
              <Field label="Email Address" required type="email" value={form.email} onChange={v => setForm(p=>({...p, email: v}))} placeholder="john@example.com" />
              <Field label="Phone Number" required value={form.phone} onChange={v => setForm(p=>({...p, phone: v}))} placeholder="+977 98..." />
              <div>
                <label style={LS}>College Year</label>
                <select required value={form.college_year} onChange={e => setForm(p=>({...p, college_year: e.target.value}))} style={IS}>
                  <option value="">Select Year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <label style={LS}>Applying For</label>
                <select required value={form.cycle_id} onChange={e => setForm(p=>({...p, cycle_id: e.target.value}))} style={IS}>
                  {cycles.map(c => (
                    <option key={c.id} value={c.id}>{c.title} ({c.type})</option>
                  ))}
                </select>
              </div>
              <Field label="Specific Position / Interest" value={form.position_applying} onChange={v => setForm(p=>({...p, position_applying: v}))} placeholder="e.g. Frontend Developer, Graphics..." />
            </div>

            <Textarea label="Tell us about your skills" required rows={3} value={form.skills} onChange={v => setForm(p=>({...p, skills: v}))} placeholder="Languages, frameworks, tools you are familiar with..." />
            
            <Textarea label="Why do you want to join?" required rows={3} value={form.why_join} onChange={v => setForm(p=>({...p, why_join: v}))} placeholder="Your goals and how you can contribute to the club..." />

            {error && <div style={{ color: '#EF4444', fontSize: 13, background: 'rgba(239,68,68,0.1)', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
              <Link to="/login" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>Already have an account? <span style={{ color: 'var(--cyan)' }}>Login</span></Link>
              <button type="submit" disabled={saving} className="btn-primary" style={{ padding: '12px 32px', fontSize: 14 }}>
                {saving ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
         )
        }
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder = '', required = false }) {
  return (
    <div>
      <label style={LS}>{label} {required && '*'}</label>
      <input type={type} required={required} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={IS} 
        onFocus={e => e.target.style.borderColor='rgba(0,212,255,0.4)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
    </div>
  )
}

function Textarea({ label, value, onChange, placeholder = '', rows = 4, required = false }) {
  return (
    <div>
      <label style={LS}>{label} {required && '*'}</label>
      <textarea required={required} rows={rows} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} 
        style={{ ...IS, resize: 'vertical', lineHeight: 1.6 }} onFocus={e => e.target.style.borderColor='rgba(0,212,255,0.4)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
    </div>
  )
}

const LS = { display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }
const IS = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif', transition: 'border-color 0.2s' }
