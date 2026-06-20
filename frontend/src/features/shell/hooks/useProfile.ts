import { useQuery } from '@tanstack/react-query'
import { getMe, type UserProfile } from '@/api/auth'
import { useAuthStore, DEMO_PROFILE, isDemoToken } from '@/features/auth'

export function useProfile() {
  const accessToken = useAuthStore((s) => s.accessToken)
  const demo = isDemoToken(accessToken)

  return useQuery<UserProfile>({
    queryKey: ['profile', demo],
    // Demo mode returns a mock profile with no network call.
    queryFn: () => (demo ? Promise.resolve(DEMO_PROFILE) : getMe(accessToken as string)),
    enabled: Boolean(accessToken),
    staleTime: 5 * 60 * 1000,
  })
}
