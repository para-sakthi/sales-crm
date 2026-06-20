import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getMe, logout, type UserProfile } from '@/api/auth'
import { useAuthStore } from '../store'

export function WelcomePage() {
  const { accessToken, refreshToken, clear } = useAuthStore()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    if (!accessToken) {
      navigate('/login')
      return
    }
    getMe(accessToken).then(setProfile).catch(() => {
      clear()
      navigate('/login')
    })
  }, [accessToken, navigate, clear])

  async function handleLogout() {
    if (accessToken && refreshToken) {
      await logout(accessToken, refreshToken).catch(() => {})
    }
    clear()
    navigate('/login')
  }

  if (!profile) return null

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            Welcome, {profile.firstName}!
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="text-muted-foreground">
            You are logged in as <span className="font-medium">{profile.email}</span>
          </p>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
