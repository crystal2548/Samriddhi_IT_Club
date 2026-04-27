// ─── Auth / Role ─────────────────────────────────────────────────────────────
export type UserRole = 'public' | 'member' | 'executive' | 'oc' | 'general';

// ─── Profiles (maps to `profiles` table) ─────────────────────────────────────
export interface User {
  id: string;
  role: UserRole;
  email: string;
  full_name?: string;
  photo_url?: string;
  oc_position?: string;
  college_year?: string | number;
  is_active?: boolean;
  member_id?: string;
  phone?: string;
  bio?: string;
  github_url?: string;
  linkedin_url?: string;
  skills?: string[];
}

// ─── Events ──────────────────────────────────────────────────────────────────
export interface AppEvent {
  id?: string;
  title: string;
  type: string;
  description?: string;
  banner_url?: string;
  event_date: string;
  location?: string;
  registration_deadline?: string;
  max_participants?: string | number | null;
  status: string;
  is_featured: boolean;
  external_link?: string;
  created_by?: string;
}

// ─── Projects ─────────────────────────────────────────────────────────────────
export interface AppProject {
  id?: string;
  title: string;
  description?: string;
  banner_url?: string;
  tech_stack: string | string[];
  github_url?: string;
  demo_url?: string;
  is_featured: boolean;
  category?: string;
  added_by?: string;
  created_at?: string;
}

// ─── Blog Posts ───────────────────────────────────────────────────────────────
export interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  content?: string;
  cover_image_url?: string;
  category: string;
  tags?: string[];
  status: 'draft' | 'published' | 'archived';
  is_featured?: boolean;
  author_id?: string;
  published_at?: string;
  created_at?: string;
  read_time_mins?: number;
  profiles?: Partial<User>;
}

// ─── Announcements / Notices ─────────────────────────────────────────────────
export interface Announcement {
  id?: string;
  title: string;
  body: string;
  audience: 'all' | 'general' | 'executive' | 'oc';
  is_pinned?: boolean;
  created_at?: string;
  created_by?: string;
}

// ─── Opportunities ────────────────────────────────────────────────────────────
export interface Opportunity {
  id?: string;
  title: string;
  type: string;
  link: string;
  deadline?: string;
  is_active?: boolean;
  posted_by?: string;
  created_at?: string;
}

// ─── Resources ────────────────────────────────────────────────────────────────
export interface Resource {
  id?: string;
  title: string;
  url: string;
  type: string;
  track?: string;
  created_at?: string;
  added_by?: string;
}

// ─── Gallery Images ───────────────────────────────────────────────────────────
export interface GalleryImage {
  id?: string;
  image_url: string;
  caption?: string;
  uploaded_by?: string;
  created_at?: string;
  profiles?: Partial<User>;
}

// ─── Sponsors ─────────────────────────────────────────────────────────────────
export interface Sponsor {
  id?: string;
  name: string;
  logo_url?: string;
  website_url?: string;
  tier: 'gold' | 'silver' | 'bronze' | 'partner';
  contact_email?: string;
  amount?: string;
  is_active?: boolean;
}

// ─── Recruitment Cycle ────────────────────────────────────────────────────────
export interface RecruitmentCycle {
  id?: string;
  title: string;
  type: string;
  status: 'open' | 'closed' | 'reviewing' | 'done';
  description?: string;
  closes_at?: string;
  created_at?: string;
}

// ─── Applications ─────────────────────────────────────────────────────────────
export interface Application {
  id?: string;
  email: string;
  full_name: string;
  phone?: string;
  college_year?: string | number;
  position_applying?: string;
  skills?: string[];
  why_join?: string;
  status: 'pending' | 'shortlisted' | 'approved' | 'rejected';
  invited_at?: string;
  created_at?: string;
}

// ─── Permission Requests ──────────────────────────────────────────────────────
export interface PermissionRequest {
  id?: string;
  requester_id: string;
  permission_requested: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  profiles?: Partial<User>;
}

// ─── Event Registrations ──────────────────────────────────────────────────────
export interface EventRegistration {
  id?: string;
  event_id: string;
  user_id: string;
  registered_at?: string;
  events?: Partial<AppEvent>;
}

// ─── Messages (Contact Form) ──────────────────────────────────────────────────
export interface ContactMessage {
  id?: string;
  full_name: string;
  email: string;
  subject: string;
  message: string;
  is_read?: boolean;
  created_at?: string;
}

// ─── Nav / Sidebar helpers ────────────────────────────────────────────────────
export interface NavLink {
  label: string;
  path: string;
  icon?: string;
  badge?: string;
}

export interface NavSection {
  section: string;
  executiveOnly?: boolean;
  links: NavLink[];
}
