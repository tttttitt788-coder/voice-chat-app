import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'

interface AuthState {
  profile: Profile | null
  loading: boolean
  error: string | null
  init: () => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, username: string) => Promise<void>
  signInAsGuest: () => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const GUEST_KEY = 'voicechat_guest_profile'

export const useAuthStore = create<AuthState>((set, get) => ({
  profile: null,
  loading: true,
  error: null,

  init: async () => {
    set({ loading: true, error: null })
    try {
      const guestData = localStorage.getItem(GUEST_KEY)
      if (guestData) {
        const guestProfile = JSON.parse(guestData) as Profile
        set({ profile: guestProfile, loading: false })
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle()

        if (data && !error) {
          set({ profile: data as Profile, loading: false })
          return
        }
      }

      set({ profile: null, loading: false })
    } catch (err) {
      set({ profile: null, loading: false, error: 'فشل تحميل الجلسة' })
    }
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle()

      if (profileError) throw profileError
      set({ profile: profile as Profile, loading: false })
    } catch (err: any) {
      set({ loading: false, error: err.message || 'فشل تسجيل الدخول' })
      throw err
    }
  },

  signUp: async (email: string, password: string, username: string) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({ id: data.user.id, username, coins: 100, level: 1 })

        if (profileError) throw profileError

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle()

        set({ profile: profile as Profile, loading: false })
      }
    } catch (err: any) {
      set({ loading: false, error: err.message || 'فشل إنشاء الحساب' })
      throw err
    }
  },

  signInAsGuest: async () => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase.rpc('create_guest_user')
      if (error) throw error

      const guestProfile = data as Profile
      localStorage.setItem(GUEST_KEY, JSON.stringify(guestProfile))
      set({ profile: guestProfile, loading: false })
    } catch (err: any) {
      set({ loading: false, error: err.message || 'فشل الدخول كضيف' })
      throw err
    }
  },

  signOut: async () => {
    localStorage.removeItem(GUEST_KEY)
    await supabase.auth.signOut()
    set({ profile: null })
  },

  refreshProfile: async () => {
    const current = get().profile
    if (!current) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', current.id)
        .maybeSingle()

      if (!error && data) {
        set({ profile: data as Profile })
        if (data.is_guest) {
          localStorage.setItem(GUEST_KEY, JSON.stringify(data))
        }
      }
    } catch {}
  },
}))
