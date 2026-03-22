export default function Signup() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-md w-full p-8 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Sign Up</h2>
        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
          Join Samriddhi IT Club today.
        </p>
        <button
          onClick={() => window.history.back()}
          className="w-full py-2.5 rounded-lg font-medium transition-colors"
          style={{ background: 'var(--cyan)', color: 'var(--bg-primary)' }}
        >
          Go Back
        </button>
      </div>
    </div>
  )
}
