import { useState } from 'react'
import { supabase } from '../../utils/supabase'
import emailjs from '@emailjs/browser'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: 'General Inquiry', message: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      // 1. Save to Supabase
      const { error: dbError } = await supabase
        .from('contact_messages')
        .insert({
          full_name: form.name,
          email: form.email,
          subject: form.subject,
          message: form.message,
        })

      if (dbError) throw dbError

      // 2. Send via EmailJS
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          from_name: form.name,
          from_email: form.email,
          subject: form.subject,
          message: form.message,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )

      setSuccess(true)
      setForm({ name: '', email: '', subject: 'General Inquiry', message: '' })
    } catch (err) {
      console.error('Submit error:', err)
      setError(err.message || 'Something went wrong. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const SOCIALS = [
    { name: 'Instagram', icon: '📸', url: '#', color: '#E1306C' },
    { name: 'LinkedIn', icon: '🔗', url: '#', color: '#0077B5' },
    { name: 'Facebook', icon: '👥', url: '#', color: '#1877F2' },
    { name: 'GitHub', icon: '💻', url: '#', color: '#fff' },
  ]

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: 80, paddingBottom: 100 }}>
      <div className="container mx-auto px-6">
        
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <p style={{ color: 'var(--cyan)', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 12 }}>Get in Touch</p>
          <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 'clamp(40px, 8vw, 64px)', fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>Contact Us</h1>
          <div style={{ width: 80, height: 4, background: 'linear-gradient(90deg, var(--cyan), var(--pink))', borderRadius: 2, margin: '20px auto 0' }}/>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '5fr 7fr', gap: 60, alignItems: 'start' }}>
          
          {/* Left: Contact Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: 32 }}>
              <h3 style={{ color: '#fff', fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Connect With Us</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <ContactItem icon="📧" label="Email" value="samriddhi.it.club@gmail.com" />
                <ContactItem icon="📍" label="Location" value="Samriddhi College, Bhaktapur, Nepal" />
                <ContactItem icon="📞" label="Phone" value="+977 98XXXXXXX" />
              </div>

              <div style={{ marginTop: 40, paddingTop: 32, borderTop: '1px solid var(--border)' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', mb: 16 }}>Follow US On</p>
                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  {SOCIALS.map(s => (
                    <a key={s.name} href={s.url} style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, textDecoration: 'none', transition: 'all 0.2s' }}
                       onMouseEnter={e => { e.currentTarget.style.borderColor = s.color; e.currentTarget.style.transform = 'translateY(-3px)' }}
                       onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}>
                      {s.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid var(--border)', height: 260, background: 'rgba(0,0,0,0.2)', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, opacity: 0.3, background: 'url(https://img.freepik.com/free-vector/world-map-geometric-style_23-2147501901.jpg) center/cover' }}/>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
                <span style={{ fontSize: 24 }}>🏢</span>
                <p style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>Visit Our Campus</p>
                <button style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--cyan)', borderRadius: 8, color: 'var(--cyan)', fontSize: 12, fontWeight: 600 }}>Open in Google Maps</button>
              </div>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 24, padding: 40, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
            {success ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', border: '1px solid #10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 32 }}>✓</div>
                <h2 style={{ color: '#fff', fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Message Sent!</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 24 }}>We've received your inquiry and will get back to you within 24-48 hours.</p>
                <button onClick={() => setSuccess(false)} style={{ background: 'var(--cyan)', border: 'none', borderRadius: 10, padding: '12px 32px', color: '#0A0E1A', fontWeight: 700, cursor: 'pointer' }}>Send Another Message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <h3 style={{ color: '#fff', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Send us a Message</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>Have a question or inquiry? Just fill out the form below.</p>
                </div>

                <div style={{ gridColumn: 'span 1' }}>
                  <label style={LS}>Full Name</label>
                  <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="John Doe" style={IS} />
                </div>
                <div style={{ gridColumn: 'span 1' }}>
                  <label style={LS}>Email Address</label>
                  <input required type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="john@example.com" style={IS} />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={LS}>Subject</label>
                  <select value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} style={SS}>
                    <option>General Inquiry</option>
                    <option>Event Sponsorship</option>
                    <option>Technical Support</option>
                  </select>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={LS}>Your Message</label>
                  <textarea required rows={5} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="Tell us what's on your mind..." style={TS} />
                </div>

                {error && <div style={{ gridColumn: 'span 2', color: '#EF4444', fontSize: 13, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', padding: '10px', borderRadius: 8 }}>{error}</div>}

                <div style={{ gridColumn: 'span 2', marginTop: 10 }}>
                  <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: 'var(--cyan)', border: 'none', borderRadius: 10, color: '#0A0E1A', fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', cursor: loading ? 'wait' : 'pointer', transition: 'all 0.2s', opacity: loading ? 0.7 : 1 }}>
                    {loading ? 'Sending...' : 'Send Message Now'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ContactItem({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{icon}</div>
      <div>
        <p style={{ color: 'var(--text-muted)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{label}</p>
        <p style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>{value}</p>
      </div>
    </div>
  )
}

const LS = { display: 'block', color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }
const IS = { width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', color: '#fff', fontSize: 14, outline: 'none', transition: 'border-color 0.2s' }
const SS = { ...IS, cursor: 'pointer' }
const TS = { ...IS, resize: 'vertical', fontFamily: 'Inter, sans-serif' }