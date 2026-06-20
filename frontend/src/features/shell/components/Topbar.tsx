import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { logout, type UserProfile } from '@/api/auth'
import { useAuthStore } from '@/features/auth'
import type { CrmRole } from '../nav'

interface TopbarProps {
  profile: UserProfile | null
  role: CrmRole
}

export function Topbar({ profile, role }: TopbarProps) {
  const { accessToken, refreshToken, clear } = useAuthStore()
  const navigate = useNavigate()

  async function handleLogout() {
    if (accessToken && refreshToken) {
      await logout(accessToken, refreshToken).catch(() => {})
    }
    clear()
    navigate('/login')
  }

  const initials = profile
    ? `${profile.firstName?.[0] ?? ''}${profile.lastName?.[0] ?? ''}`.toUpperCase() || 'U'
    : 'U'

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-5">
      <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        Quote Decision Intelligence Platform
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <div className="text-sm font-semibold leading-tight">
            {profile ? `${profile.firstName} ${profile.lastName ?? ''}`.trim() : 'Loading…'}
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
            {role}
          </div>
        </div>
        <div className="grid size-9 place-items-center rounded-full bg-primary font-mono text-xs font-semibold text-primary-foreground">
          {initials}
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Log out">
          <LogOut className="size-4" />
        </Button>
      </div>
    </header>
  )
}
