import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore, isDemoToken } from '@/features/auth'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { useProfile } from '../hooks/useProfile'
import { mapAuthRole } from '../nav'

/**
 * Authenticated application chrome: sidebar + topbar + routed content.
 * Used as a layout route — child routes render into <Outlet />.
 */
export default function AppLayout() {
  const { accessToken, role, clear } = useAuthStore()
  const navigate = useNavigate()
  const { data: profile, isError } = useProfile()

  // A failed /me (expired token) drops the user back to login.
  useEffect(() => {
    if (!accessToken || isError) {
      clear()
      navigate('/login', { replace: true })
    }
  }, [accessToken, isError, clear, navigate])

  const crmRole = mapAuthRole(role)
  const demo = isDemoToken(accessToken)

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      <Sidebar role={crmRole} />
      <div className="flex min-w-0 flex-1 flex-col">
        {demo && (
          <div className="flex items-center gap-2.5 bg-ink px-6 py-2 font-mono text-[11px] tracking-[0.04em] text-white">
            <span className="size-1.5 animate-pulse rounded-full bg-pass" />
            <b className="font-semibold text-white">DEMO MODE</b>
            <span className="text-white/55">sample data · no backend · changes persist locally</span>
          </div>
        )}
        <Topbar profile={profile ?? null} role={crmRole} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1280px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
