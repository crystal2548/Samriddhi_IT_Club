import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '../utils/supabase'
import { User, UserRole } from '../types/index'

export interface AuthContextType {
  user: any | null; // Supabase auth user
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
  const [user, setUser] = useState<any | null>(null)
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
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
    if (data) {
      setProfile(data as User)
    } else {
      setProfile(null)
    }
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
