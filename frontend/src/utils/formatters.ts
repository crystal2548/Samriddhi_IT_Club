// ─── formatters.ts ───────────────────────────────────────────

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

export function formatDateShort(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric'
  })
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export function formatTime(timeStr: string | null | undefined): string {
  if (!timeStr) return ''
  return new Date(timeStr).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit'
  })
}

export function formatRelative(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  const diff = new Date(dateStr).getTime() - new Date().getTime()
  const days = Math.round(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days === -1) return 'Yesterday'
  if (days > 0) return `in ${days} days`
  return `${Math.abs(days)} days ago`
}

export function deadlineColor(dateStr: string | null | undefined): 'red' | 'amber' | 'green' | 'gray' {
  if (!dateStr) return 'gray'
  const diff = new Date(dateStr).getTime() - new Date().getTime()
  const days = Math.round(diff / (1000 * 60 * 60 * 24))
  if (days < 0)  return 'gray'
  if (days <= 3) return 'red'
  if (days <= 7) return 'amber'
  return 'green'
}

export function deadlineLabel(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Open'
  const diff = new Date(dateStr).getTime() - new Date().getTime()
  const days = Math.round(diff / (1000 * 60 * 60 * 24))
  if (days < 0)  return 'Closed'
  if (days === 0) return 'Last day!'
  if (days === 1) return '1 day left'
  if (days <= 7) return `${days} days left`
  return 'Open'
}

export function toSlug(str: string): string {
  if (!str) return ''
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function fromSlug(slug: string): string {
  if (!slug) return ''
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
