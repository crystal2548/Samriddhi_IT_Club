// ─── App Info ───────────────────────────────────────────────
export const APP_NAME = 'Samriddhi IT Club'
export const APP_TAGLINE = 'Code. Innovate. Connect.'
export const APP_YEAR = 2024

// ─── Roles ──────────────────────────────────────────────────
export const ROLES = {
  GENERAL:   'general',
  EXECUTIVE: 'executive',
  OC:        'oc',
}

// ─── OC Positions ───────────────────────────────────────────
export const OC_POSITIONS = {
  PRESIDENT:         'president',
  VICE_PRESIDENT:    'vice_president',
  SECRETARY:         'secretary',
  TREASURER:         'treasurer',
  EVENT_COORDINATOR: 'event_coordinator',
  TECHNICAL_LEAD:    'technical_lead',
  MEDIA_DESIGN:      'media_design',
  GRAPHICS_DESIGNER: 'graphics_designer',
  VIDEO_EDITOR:      'video_editor',
}

// ─── Event Types ─────────────────────────────────────────────
export const EVENT_TYPES = [
  { value: 'all',       label: 'All' },
  { value: 'hackathon', label: 'Hackathon' },
  { value: 'workshop',  label: 'Workshop' },
  { value: 'seminar',   label: 'Seminar' },
  { value: 'bootcamp',  label: 'Bootcamp' },
  { value: 'social',    label: 'Social' },
]

// ─── Event Status ────────────────────────────────────────────
export const EVENT_STATUS = {
  UPCOMING:  'upcoming',
  ONGOING:   'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
}

// ─── Blog Categories ─────────────────────────────────────────
export const BLOG_CATEGORIES = [
  { value: 'all',         label: 'All' },
  { value: 'development', label: 'Development' },
  { value: 'ai-ml',       label: 'AI / ML' },
  { value: 'career',      label: 'Career' },
  { value: 'club-news',   label: 'Club News' },
]

// ─── Resource Tracks ─────────────────────────────────────────
export const RESOURCE_TRACKS = [
  { value: 'all',     label: 'All' },
  { value: 'webdev',  label: 'Web Dev' },
  { value: 'ai-ml',   label: 'AI / ML' },
  { value: 'dsa',     label: 'DSA' },
  { value: 'cybersec',label: 'Cybersec' },
  { value: 'design',  label: 'Design' },
]

// ─── Resource Types ──────────────────────────────────────────
export const RESOURCE_TYPES = [
  { value: 'all',   label: 'All' },
  { value: 'link',  label: 'Link' },
  { value: 'pdf',   label: 'PDF' },
  { value: 'video', label: 'Video' },
  { value: 'repo',  label: 'Repo' },
  { value: 'doc',   label: 'Doc' },
]

// ─── Opportunity Types ───────────────────────────────────────
export const OPPORTUNITY_TYPES = [
  { value: 'all',         label: 'All' },
  { value: 'hackathon',   label: 'Hackathon' },
  { value: 'internship',  label: 'Internship' },
  { value: 'scholarship', label: 'Scholarship' },
  { value: 'competition', label: 'Competition' },
]

// ─── Project Filters ─────────────────────────────────────────
export const PROJECT_FILTERS = [
  { value: 'all',        label: 'All' },
  { value: 'web',        label: 'Web' },
  { value: 'ai',         label: 'AI' },
  { value: 'mobile',     label: 'Mobile' },
  { value: 'blockchain', label: 'Blockchain' },
  { value: 'open-source',label: 'Open Source' },
]

// ─── Announcement Audiences ──────────────────────────────────
export const AUDIENCES = {
  ALL:       'all',
  GENERAL:   'general',
  EXECUTIVE: 'executive',
  OC:        'oc',
}

// ─── Recruitment Cycle Types ─────────────────────────────────
export const CYCLE_TYPES = {
  OC:        'oc',
  EXECUTIVE: 'executive',
  GENERAL:   'general',
}

// ─── Sponsor Tiers ───────────────────────────────────────────
export const SPONSOR_TIERS = [
  { value: 'gold',    label: 'Gold' },
  { value: 'silver',  label: 'Silver' },
  { value: 'bronze',  label: 'Bronze' },
  { value: 'partner', label: 'Partner' },
]

// ─── Nav Links ───────────────────────────────────────────────
export const NAV_LINKS = [
  { label: 'Home',          path: '/' },
  { label: 'About',         path: '/about' },
  { label: 'Events',        path: '/events' },
  { label: 'Projects',      path: '/projects' },
  { label: 'Blog',          path: '/blog' },
  { label: 'Resources',     path: '/resources' },
  { label: 'Gallery',       path: '/gallery' },
  { label: 'Team',          path: '/team' },
]

// ─── Member Sidebar Links ────────────────────────────────────
export const MEMBER_NAV = [
  {
    section: 'Main',
    links: [
      { label: 'Dashboard',       path: '/dashboard',            icon: 'grid' },
      { label: 'My Profile',      path: '/dashboard/profile',   icon: 'user' },
      { label: 'My Events',       path: '/dashboard/my-events', icon: 'calendar' },
    ]
  },
  {
    section: 'Club',
    links: [
      { label: 'Notices',         path: '/dashboard/notices',   icon: 'bell' },
      { label: 'Members',         path: '/dashboard/members',   icon: 'users' },
    ]
  },
  {
    section: 'Executive',
    executiveOnly: true,
    links: [
      { label: 'Write Blog',      path: '/dashboard/blog/write',     icon: 'edit' },
      { label: 'Opportunities',   path: '/dashboard/opportunities',  icon: 'briefcase' },
      { label: 'Projects',        path: '/dashboard/projects',       icon: 'code' },
      { label: 'Gallery',         path: '/dashboard/gallery',        icon: 'image' },
    ]
  },
]

// ─── OC Sidebar Links ────────────────────────────────────────
export const OC_NAV = [
  {
    section: 'Overview',
    links: [
      { label: 'Dashboard',     path: '/oc/dashboard',    icon: 'grid' },
      { label: 'Analytics',     path: '/oc/analytics',    icon: 'bar-chart' },
    ]
  },
  {
    section: 'Members',
    links: [
      { label: 'All Members',   path: '/oc/members',      icon: 'users' },
      { label: 'Applications',  path: '/oc/applications', icon: 'file-text', badge: 'applications' },
      { label: 'Recruitment',   path: '/oc/recruitment',  icon: 'user-plus' },
    ]
  },
  {
    section: 'Content',
    links: [
      { label: 'Events',        path: '/oc/events',       icon: 'calendar' },
      { label: 'Blog Posts',    path: '/oc/blog',         icon: 'book-open' },
      { label: 'Projects',      path: '/oc/projects',     icon: 'code' },
      { label: 'Opportunities', path: '/oc/opportunities',icon: 'briefcase' },
      { label: 'Resources',     path: '/oc/resources',    icon: 'folder' },
    ]
  },
  {
    section: 'System',
    links: [
      { label: 'Announcements', path: '/oc/announcements',icon: 'bell' },
      { label: 'Sponsors',      path: '/oc/sponsors',     icon: 'star' },
      { label: 'Permissions',   path: '/oc/permissions',  icon: 'shield', badge: 'permissions' },
      { label: 'Site Settings', path: '/oc/settings',     icon: 'settings' },
    ]
  },
]