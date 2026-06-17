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
  tagline: "Building Tomorrow's Tech Leaders.",
  logo_url: 'https://res.cloudinary.com/dkjxvacsm/image/upload/v1774494475/cuas20xiq6lkpb2eukvx.jpg',
  hero_cta_text: 'Join Us',
  contact_email: 'samriddhiitclub@gmail.com',
  instagram_url: '',
  linkedin_url: '',
  github_org_url: '',
  maintenance_mode: false,
  about_description: "A premier community of developers, designers, and tech entrepreneurs dedicated to shaping Nepal's digital future through collaboration, innovation, and excellenc.",
  about_story: "Born from a shared passion for technology, we began as a small group of students who believed that the best way to learn was to build together. Today, we are a thriving community of active members who collectively drive innovation through real-world projects, industry-level hackathons, curated workshops, and meaningful networking event.",
  stat_members:  '100+',
  stat_events:   '15+',
  stat_alumni:   '600+',
  stat_partners: '12+',
}

export interface SiteContextType {
  settings: SiteSettings;
  loading: boolean;
  refetch: () => Promise<void>;
}

const getInitialSettings = (): SiteSettings => {
  try {
    const cached = localStorage.getItem('samriddhi_site_settings')
    if (cached) {
      return { ...DEFAULTS, ...JSON.parse(cached) }
    }
  } catch (e) {
    console.error('Failed to parse cached site settings', e)
  }
  return DEFAULTS
}

const defaultContext: SiteContextType = {
  settings: DEFAULTS,
  loading: true,
  refetch: async () => {},
}

const SiteContext = createContext<SiteContextType>(defaultContext)

export function SiteProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(getInitialSettings)
  const [loading, setLoading] = useState(true)

  const fetchSettings = useCallback(async () => {
    const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).single()
    if (!error && data) {
      const newSettings = { ...DEFAULTS, ...data }
      setSettings(newSettings)
      try {
        localStorage.setItem('samriddhi_site_settings', JSON.stringify(newSettings))
      } catch (e) {
        console.error('Failed to cache site settings', e)
      }
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
