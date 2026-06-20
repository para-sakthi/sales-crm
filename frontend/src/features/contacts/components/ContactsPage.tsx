import { useMemo, useState } from 'react'
import { Plus, Search, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PageHeader } from '@/features/shell'
import { useDisclosure } from '@/components/ui/use-disclosure'
import { useCrmStore, customerName, type Contact } from '@/data'
import { ContactFormDrawer } from './ContactFormDrawer'

export default function ContactsPage() {
  const contacts = useCrmStore((s) => s.contacts)
  const [query, setQuery] = useState('')
  const form = useDisclosure<Contact>()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return contacts
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        customerName(c.customerId).toLowerCase().includes(q),
    )
  }, [contacts, query])

  return (
    <div>
      <PageHeader
        eyebrow="Masters"
        title="Contact Directory"
        description="People inside each OEM's buying group, with their role in the decision."
        actions={
          <Button onClick={() => form.show()}>
            <Plus className="size-4" />
            New Contact
          </Button>
        }
      />
      <div className="space-y-4 p-6">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, email, company…" className="pl-9" />
        </div>

        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Buying Role</TableHead>
                <TableHead>Contact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id} className="cursor-pointer" onClick={() => form.show(c)}>
                  <TableCell className="font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      {c.isPrimary && <Star className="size-3.5 fill-warn text-warn" />}
                      {c.name}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{customerName(c.customerId)}</TableCell>
                  <TableCell className="text-muted-foreground">{c.designation}</TableCell>
                  <TableCell><Badge tone="outline">{c.department}</Badge></TableCell>
                  <TableCell><Badge>{c.buyingRole}</Badge></TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{c.email}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">No contacts found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {form.mounted && (
        <ContactFormDrawer key={form.data?.id ?? 'new'} open={form.open} onClose={form.close} contact={form.data} />
      )}
    </div>
  )
}
