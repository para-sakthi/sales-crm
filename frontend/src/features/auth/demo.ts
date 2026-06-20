import type { UserProfile } from '@/api/auth'

/**
 * Dev-only "demo mode". Lets the app be browsed against mock data without a
 * running backend or seeded database. The sentinel token short-circuits the
 * profile fetch (see useProfile) so no network call is made.
 *
 * Remove the demo button from LoginPage once real auth is wired end-to-end.
 */
export const DEMO_TOKEN = 'demo-access-token'

export const DEMO_PROFILE: UserProfile = {
  id: 'demo-admin',
  email: 'demo@kryon.local',
  firstName: 'Demo',
  lastName: 'Admin',
  role: 'ADMIN',
  isActive: true,
  createdAt: new Date().toISOString(),
}

export function isDemoToken(token: string | null): boolean {
  return token === DEMO_TOKEN
}
