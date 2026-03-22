// ─── formatDate.js ───────────────────────────────────────────

// "Mar 15, 2025"
export function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

// "Mar 15"
export function formatDateShort(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric'
  })
}

// "Mar 15, 2025 • 09:00 AM"
export function formatDateTime(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

// "2 days ago" / "in 3 days"
export function formatRelative(dateStr) {
  if (!dateStr) return ''
  const diff = new Date(dateStr) - new Date()
  const days = Math.round(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days === -1) return 'Yesterday'
  if (days > 0) return `in ${days} days`
  return `${Math.abs(days)} days ago`
}

// deadline urgency — returns 'red' | 'amber' | 'green'
export function deadlineColor(dateStr) {
  if (!dateStr) return 'gray'
  const diff = new Date(dateStr) - new Date()
  const days = Math.round(diff / (1000 * 60 * 60 * 24))
  if (days < 0)  return 'gray'
  if (days <= 3) return 'red'
  if (days <= 7) return 'amber'
  return 'green'
}

// deadline label — "3 days left" | "Closed" | "Open"
export function deadlineLabel(dateStr) {
  if (!dateStr) return 'Open'
  const diff = new Date(dateStr) - new Date()
  const days = Math.round(diff / (1000 * 60 * 60 * 24))
  if (days < 0)  return 'Closed'
  if (days === 0) return 'Last day!'
  if (days === 1) return '1 day left'
  if (days <= 7) return `${days} days left`
  return 'Open'
}


// ─── formatSlug.js ───────────────────────────────────────────

// "Hello World! 2025" → "hello-world-2025"
export function toSlug(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// "hello-world-2025" → "Hello World 2025"
export function fromSlug(slug) {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}