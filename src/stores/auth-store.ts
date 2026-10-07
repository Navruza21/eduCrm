import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TokenPair, User } from '@/api/types'

export type Session = TokenPair & { user: User }

type AuthState = {
  session: Session | null
  setSession: (session: Session) => void
  setTokens: (access: string, refresh: string) => void
  setUser: (user: User) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => set({ session }),
      setTokens: (access, refresh) =>
        set((state) => ({ session: state.session && { ...state.session, access, refresh } })),
      setUser: (user) => set((state) => ({ session: state.session && { ...state.session, user } })),
      clearSession: () => set({ session: null }),
    }),
    {
      name: 'edu-crm-session',
      partialize: (state) => ({ session: state.session }),
      // v0 was the mock session ({token, user: {fullName, email…}}) — log those users out.
      version: 1,
      migrate: () => ({ session: null }),
    },
  ),
)
