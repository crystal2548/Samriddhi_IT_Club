import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'

const SiteContext = createContext({})

export function SiteProvider({ children }) {
  const [settings, setSettings] = useState({
    club_name: 'Samriddhi IT Club',
    tagline: 'Code. Innovate. Connect.',
    logo_url: '',
    hero_cta_text: 'Join the Club',
    contact_email: '',
    instagram_url: '',
    linkedin_url: '',
    github_org_url: '',
    maintenance_mode: false
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('site_settings').select('*').eq('id', 1).single().then(({ data, error }) => {
      if (!error && data) {
        setSettings(data)
      } else if (error) {
        console.error('Error fetching site settings:', error)
      }
      setLoading(false)
    })
  }, [])

  return (
    <SiteContext.Provider value={{ settings, loading }}>
      {children}
    </SiteContext.Provider>
  )
}

export const useSiteSettings = () => useContext(SiteContext)
