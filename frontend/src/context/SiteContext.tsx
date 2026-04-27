import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { supabase } from '../utils/supabase'

export interface SiteSettings {
  club_name: string;
  tagline: string;
  logo_url: string;
  hero_cta_text: string;
  contact_email: string;
  instagram_url: string;
  linkedin_url: string;
  github_org_url: string;
  maintenance_mode: boolean;
  about_description: string;
  about_story: string;
  stat_members: string;
  stat_events: string;
  stat_alumni: string;
  stat_partners: string;
  [key: string]: any;
}

const DEFAULTS: SiteSettings = {
  club_name: 'Samriddhi IT Club',
  tagline: 'Code. Innovate. Connect.',
  logo_url: '',
  hero_cta_text: 'Join the Club',
  contact_email: '',
  instagram_url: '',
  linkedin_url: '',
  github_org_url: '',
  maintenance_mode: false,
  about_description: "A premier community of developers, designers, and tech entrepreneurs dedicated to shaping Nepal's digital future through collaboration, innovation, and excellence.",
  about_story: "Born from a shared passion for technology, we began as a small group of students who believed that the best way to learn was to build together. Today, we are a thriving community of active members who collectively drive innovation through real-world projects, industry-level hackathons, curated workshops, and meaningful networking events. We don't just write code — we create the future.",
  stat_members:  '120+',
  stat_events:   '30+',
  stat_alumni:   '500+',
  stat_partners: '12+',
}

export interface SiteContextType {
  settings: SiteSettings;
  loading: boolean;
  refetch: () => Promise<void>;
}

const defaultContext: SiteContextType = {
  settings: DEFAULTS,
  loading: true,
  refetch: async () => {},
}

const SiteContext = createContext<SiteContextType>(defaultContext)

export function SiteProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULTS)
  const [loading, setLoading] = useState(true)

  const fetchSettings = useCallback(async () => {
    const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).single()
    if (!error && data) {
      setSettings({ ...DEFAULTS, ...data })
    } else if (error) {
      console.error('Error fetching site settings:', error)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchSettings() }, [fetchSettings])

  return (
    <SiteContext.Provider value={{ settings, loading, refetch: fetchSettings }}>
      {children}
    </SiteContext.Provider>
  )
}

export const useSiteSettings = () => useContext(SiteContext)
