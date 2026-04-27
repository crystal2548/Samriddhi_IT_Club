export type UserRole = 'public' | 'member' | 'executive' | 'oc';

export interface User {
  id: string;
  role: UserRole;
  email: string;
  full_name?: string;
  photo_url?: string;
  oc_position?: string;
  college_year?: string | number;
  is_active?: boolean;
}

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
