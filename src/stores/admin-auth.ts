import { create } from 'zustand'
import type { AdminUser } from '@/types'

interface AdminAuthState {
  admin: AdminUser | null
  token: string | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  verify: () => Promise<boolean>
  signOut: () => void
}

const ADMIN_KEY = 'voicechat_admin_session'

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  admin: null,
  token: null,
  loading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ loading: true, error: null })
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const res = await fetch(`${supabaseUrl}/functions/v1/admin-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ action: 'login', email, password }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'فشل تسجيل الدخول')
      }

      const data = await res.json()
      const session = { admin: data.admin, token: data.token }
      localStorage.setItem(ADMIN_KEY, JSON.stringify(session))
      set({ admin: data.admin, token: data.token, loading: false })
    } catch (err: any) {
      set({ loading: false, error: err.message || 'فشل تسجيل الدخول' })
      throw err
    }
  },

  verify: async () => {
    const stored = localStorage.getItem(ADMIN_KEY)
    if (!stored) return false

    try {
      const session = JSON.parse(stored)
      if (!session.token || !session.admin) return false

      set({ admin: session.admin, token: session.token })
      return true
    } catch {
      return false
    }
  },

  signOut: () => {
    localStorage.removeItem(ADMIN_KEY)
    set({ admin: null, token: null })
  },
}))
