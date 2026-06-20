import { create } from 'zustand'
import type { Role } from '@/api/auth'
import { DEMO_TOKEN, DEMO_PROFILE } from './demo'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  role: Role | null
  setTokens: (accessToken: string, refreshToken: string, role: Role) => void
  clear: () => void
}

const STORAGE_KEY = 'auth'

function loadFromStorage(): Pick<AuthState, 'accessToken' | 'refreshToken' | 'role'> {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    // No saved session — auto-enter demo mode so the app opens at the dashboard.
    // The user can still sign out to reach the login page.
    return { accessToken: DEMO_TOKEN, refreshToken: DEMO_TOKEN, role: DEMO_PROFILE.role }
  }
  try {
    return JSON.parse(raw) as Pick<AuthState, 'accessToken' | 'refreshToken' | 'role'>
  } catch {
    return { accessToken: DEMO_TOKEN, refreshToken: DEMO_TOKEN, role: DEMO_PROFILE.role }
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  ...loadFromStorage(),
  setTokens: (accessToken, refreshToken, role) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ accessToken, refreshToken, role }),
    )
    set({ accessToken, refreshToken, role })
  },
  clear: () => {
    localStorage.removeItem(STORAGE_KEY)
    set({ accessToken: null, refreshToken: null, role: null })
  },
}))
