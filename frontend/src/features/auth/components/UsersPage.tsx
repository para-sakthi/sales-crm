import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getUsers, logout, type UserProfile } from '@/api/auth'
import { useAuthStore } from '../store'

export function UsersPage() {
  const { accessToken, refreshToken, clear } = useAuthStore()
  const navigate = useNavigate()
  const [users, setUsers] = useState<UserProfile[]>([])

  useEffect(() => {
    if (!accessToken) {
      navigate('/login')
      return
    }
    getUsers(accessToken).then(setUsers).catch(() => {
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

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Users</h1>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    {user.firstName} {user.lastName ?? ''}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span className="rounded bg-secondary px-2 py-0.5 text-xs font-medium">
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    {user.isActive ? (
                      <span className="text-green-600">Active</span>
                    ) : (
                      <span className="text-muted-foreground">Inactive</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
