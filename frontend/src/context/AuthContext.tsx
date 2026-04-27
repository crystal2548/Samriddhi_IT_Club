import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { Session, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase } from '../utils/supabase'
import type { User, UserRole } from '../types/index'

export interface AuthContextType {
  user: Session['user'] | null;
  profile: User | null;
  loading: boolean;
  role: UserRole | null;
  isOC: boolean;
  isExecutive: boolean;
  isMember: boolean;
}

const defaultAuthContext: AuthContextType = {
  user: null,
  profile: null,
  loading: true,
  role: null,
  isOC: false,
  isExecutive: false,
  isMember: false,
}

const AuthContext = createContext<AuthContextType>(defaultAuthContext)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Session['user'] | null>(null)
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    // Listen for auth changes — let Supabase SDK infer callback types
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null)
        if (session?.user) fetchProfile(session.user.id)
        else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data ? (data as User) : null)
    setLoading(false)
  }

  const value: AuthContextType = {
    user,
    profile,
    loading,
    role: profile?.role ?? null,
    isOC: profile?.role === 'oc',
    isExecutive: profile?.role === 'executive' || profile?.role === 'oc',
    isMember: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
