import { useQuery } from '@tanstack/react-query'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getUsers, type UserProfile } from '@/api/auth'
import { useAuthStore } from '@/features/auth'
import { PageHeader } from '@/features/shell'

export default function UsersAdminPage() {
  const accessToken = useAuthStore((s) => s.accessToken)
  const { data: users = [], isLoading } = useQuery<UserProfile[]>({
    queryKey: ['admin', 'users'],
    queryFn: () => getUsers(accessToken as string),
    enabled: Boolean(accessToken),
  })

  return (
    <div>
      <PageHeader
        eyebrow="Administration"
        title="Users & Roles"
        description="Platform accounts and their access level. Full role management arrives with Phase 6."
      />
      <div className="p-6">
        <div className="rounded-xl border border-border bg-card">
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
                  <TableCell className="font-medium">
                    {user.firstName} {user.lastName ?? ''}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <span className="rounded-md bg-secondary px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wide">
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    {user.isActive ? (
                      <span className="font-mono text-xs text-pass">Active</span>
                    ) : (
                      <span className="font-mono text-xs text-muted-foreground">Inactive</span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
