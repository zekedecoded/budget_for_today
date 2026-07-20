import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types'
import { getStoredAvatar, setStoredAvatar, clearStoredAvatar } from '../lib/avatar'

interface AuthContextValue {
  user: User | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function mergeAvatarFromStorage(serverProfile: Profile | null): Profile | null {
  if (!serverProfile) return null
  const stored = getStoredAvatar()
  if (stored !== null && stored !== serverProfile.avatar) {
    return { ...serverProfile, avatar: stored }
  }
  return serverProfile
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId: string) => {
    if (!supabase) return
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(mergeAvatarFromStorage(data))
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) fetchProfile(u.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) fetchProfile(u.id)
      else {
        setProfile(null)
        clearStoredAvatar()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    clearStoredAvatar()
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return
    if (updates.avatar !== undefined && updates.avatar !== null) {
      setStoredAvatar(updates.avatar)
    }
    setProfile(prev => prev ? { ...prev, ...updates } : prev)
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
    if (error) {
      console.error('Failed to sync profile to server:', error.message)
    }
  }

  const refreshProfile = async () => {
    if (user) fetchProfile(user.id)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, updateProfile, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
