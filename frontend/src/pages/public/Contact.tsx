import { useState } from 'react'
import { supabase } from '../../utils/supabase'
import emailjs from '@emailjs/browser'

// ─── Shared label / input / select / textarea styles ──────────────────────
const LS: React.CSSProperties = {
  display: 'block',
  color: 'rgba(255,255,255,0.4)',
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: 8,
}
const IS: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10,
  padding: '12px 16px',
  color: '#fff',
  fontSize: 14,
  outline: 'none',
  transition: 'border-color 0.2s',
  fontFamily: "'Inter', -apple-system, sans-serif",
}
const SS: React.CSSProperties = { ...IS, cursor: 'pointer' }
const TS: React.CSSProperties = { ...IS, resize: 'vertical' }

// ─── ContactItem ──────────────────────────────────────────────────────────
function ContactItem({ icon, label, value, color = '#00D4FF' }: { icon: React.ReactNode; label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12, flexShrink: 0,
        background: `${color}08`, border: `1px solid ${color}15`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>
      <div>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>{label}</p>
        <p style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{value}</p>
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: 'General Inquiry', message: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error: dbError } = await supabase
        .from('contact_messages')
        .insert({
          full_name: form.name,
          email: form.email,
          subject: form.subject,
          message: form.message,
        })
      if (dbError) throw dbError

      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        { from_name: form.name, from_email: form.email, subject: form.subject, message: form.message },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
      )

      setSuccess(true)
      setForm({ name: '', email: '', subject: 'General Inquiry', message: '' })
    } catch (err: any) {
      console.error('Submit error:', err)
      setError(err.message || 'Something went wrong. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const SOCIALS = [
    { name: 'Instagram', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>, url: '#', color: '#E1306C' },
    { name: 'LinkedIn',  icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>, url: '#', color: '#0077B5' },
    { name: 'Facebook',  icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>, url: '#', color: '#1877F2' },
    { name: 'GitHub',    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>, url: '#', color: '#fff'    },
  ]

  return (
    <div style={{
      background: 'var(--bg-primary, #0A0E1A)',
      minHeight: '100vh',
      paddingTop: 80,
      paddingBottom: 100,
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>

      {/* ── Page-wide centring wrapper ─────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', width: '100%', boxSizing: 'border-box' }}>

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <p style={{ color: 'var(--cyan, #00D4FF)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 12 }}>
            Get in Touch
          </p>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(40px, 8vw, 64px)', fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0 }}>
            Contact Us
          </h1>
          <div style={{ width: 80, height: 3, background: 'linear-gradient(90deg, var(--cyan, #00D4FF), var(--pink, #FF2D9B))', borderRadius: 2, margin: '16px auto 20px' }} />
          <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 15, lineHeight: 1.7, maxWidth: 480, margin: '0 auto' }}>
            Have a question or want to collaborate? We'd love to hear from you.
          </p>
        </div>

        {/* ── Two-column layout ──────────────────────────────────────────
            On mobile: single column (via CSS media query injected below)
            On desktop: left sidebar + wider form              ─────────── */}
        <style>{`
          @media (max-width: 768px) {
            .contact-grid { grid-template-columns: 1fr !important; }
          }
          input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.2); }
          input:focus, textarea:focus, select:focus { border-color: rgba(0,212,255,0.4) !important; }
          select option { background: #0D1829; color: #fff; }
        `}</style>

        <div
          className="contact-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 380px) minmax(0, 1fr)',
            gap: 32,
            alignItems: 'start',
          }}
        >

          {/* ── LEFT: Info cards ──────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Connect With Us */}
            <div style={{ background: 'var(--bg-card, #0D1829)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 32 }}>
              <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginTop: 0, marginBottom: 24 }}>Connect With Us</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <ContactItem 
                  icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>} 
                  label="Email" 
                  value="samriddhi.it.club@gmail.com" 
                />
                <ContactItem 
                  icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF2D9B" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>} 
                  label="Location" 
                  value="Samriddhi College, Bhaktapur, Nepal" 
                  color="#FF2D9B"
                />
                <ContactItem 
                  icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.81 12.81 0 0 0 .62 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.62A2 2 0 0 1 22 19.23z"/></svg>} 
                  label="Phone" 
                  value="+977 98XXXXXXX" 
                  color="#A78BFA"
                />
              </div>

              <div style={{ marginTop: 32, paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>
                  Follow Us On
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  {SOCIALS.map(s => (
                    <a
                      key={s.name}
                      href={s.url}
                      title={s.name}
                      style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, textDecoration: 'none',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = s.color
                        e.currentTarget.style.transform = 'translateY(-3px)'
                        e.currentTarget.style.background = `${s.color}15`
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                      }}
                    >
                      {s.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Location Card */}
            <div style={{ background: 'var(--bg-card, #0D1829)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 4, height: 20, background: 'linear-gradient(to bottom, #00D4FF, #FF2D9B)', borderRadius: 2, flexShrink: 0 }} />
                <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 700, margin: 0 }}>Our Location</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Address row */}
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div>
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3, marginTop: 0 }}>Address</p>
                    <p style={{ color: '#fff', fontSize: 14, fontWeight: 500, lineHeight: 1.5, margin: 0 }}>Samriddhi College, Bhaktapur, Nepal</p>
                  </div>
                </div>

                {/* Hours row */}
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: 'rgba(255,45,155,0.06)', border: '1px solid rgba(255,45,155,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF2D9B" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8"  y1="2" x2="8"  y2="6"/>
                      <line x1="3"  y1="10" x2="21" y2="10"/>
                    </svg>
                  </div>
                  <div>
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3, marginTop: 0 }}>Office Hours</p>
                    <p style={{ color: '#fff', fontSize: 14, fontWeight: 500, margin: 0 }}>Sun – Fri, 10:00 AM – 4:00 PM</p>
                  </div>
                </div>
              </div>

              <a
                href="https://www.google.com/maps/search/Samriddhi+College+Bhaktapur"
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '12px', borderRadius: 12,
                  background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.15)',
                  color: '#00D4FF', fontSize: 13, fontWeight: 600, textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,212,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(0,212,255,0.35)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,212,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(0,212,255,0.15)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                Open in Google Maps
              </a>
            </div>
          </div>

          {/* ── RIGHT: Contact Form ────────────────────────────────────── */}
          <div style={{
            background: 'var(--bg-card, #0D1829)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 24,
            padding: 'clamp(24px, 4vw, 40px)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          }}>
            {success ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'rgba(16,185,129,0.1)', border: '1px solid #10B981',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 24px', fontSize: 28, color: '#10B981',
                }}>
                  ✓
                </div>
                <h2 style={{ color: '#fff', fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Message Sent!</h2>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, marginBottom: 24 }}>
                  We've received your inquiry and will get back to you within 24–48 hours.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  style={{ background: '#00D4FF', border: 'none', borderRadius: 10, padding: '12px 32px', color: '#0A0E1A', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h3 style={{ color: '#fff', fontSize: 20, fontWeight: 700, marginTop: 0, marginBottom: 6 }}>Send us a Message</h3>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 28 }}>Have a question or inquiry? Just fill out the form below.</p>

                {/* Name + Email row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }} className="form-two-col">
                  <style>{`@media (max-width: 540px) { .form-two-col { grid-template-columns: 1fr !important; } }`}</style>
                  <div>
                    <label style={LS}>Full Name</label>
                    <input
                      required
                      value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="John Doe"
                      style={IS}
                    />
                  </div>
                  <div>
                    <label style={LS}>Email Address</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                      placeholder="john@example.com"
                      style={IS}
                    />
                  </div>
                </div>

                {/* Subject */}
                <div style={{ marginBottom: 20 }}>
                  <label style={LS}>Subject</label>
                  <select
                    value={form.subject}
                    onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                    style={SS}
                  >
                    <option>General Inquiry</option>
                    <option>Event Sponsorship</option>
                    <option>Technical Support</option>
                  </select>
                </div>

                {/* Message */}
                <div style={{ marginBottom: 20 }}>
                  <label style={LS}>Your Message</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    placeholder="Tell us what's on your mind..."
                    style={TS}
                  />
                </div>

                {/* Error */}
                {error && (
                  <div style={{ color: '#EF4444', fontSize: 13, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', padding: '10px 14px', borderRadius: 8, marginBottom: 16 }}>
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: '#00D4FF',
                    border: 'none',
                    borderRadius: 10,
                    color: '#0A0E1A',
                    fontSize: 14,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: loading ? 'wait' : 'pointer',
                    transition: 'all 0.2s',
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? 'Sending…' : 'Send Message Now'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}