import { useMemo, useState } from 'react'
import { Plus, Search, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useDisclosure } from '@/components/ui/use-disclosure'
import { exportToCsv } from '@/lib/csv'
import { toast } from '@/components/ui/toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PageHeader } from '@/features/shell'
import { cn } from '@/lib/utils'
import { formatInr } from '@/lib/format'
import {
  OEM_SEGMENTS,
  useCrmStore,
  type Customer,
  type Priority,
  type VendorStatus,
} from '@/data'
import { CustomerFormDrawer } from './CustomerFormDrawer'
import { CustomerDetailDrawer } from './CustomerDetailDrawer'

const priorityTone: Record<Priority, string> = {
  A: 'border-pass/40 bg-pass-soft/50 text-pass',
  B: 'border-warn/40 bg-warn-soft/50 text-warn',
  C: 'border-border bg-muted text-muted-foreground',
}

const vendorTone: Record<VendorStatus, 'pass' | 'warn' | 'default' | 'block'> = {
  Approved: 'pass',
  'In Progress': 'warn',
  'Not Started': 'default',
  Rejected: 'block',
}

export default function CustomersPage() {
  const customers = useCrmStore((s) => s.customers)
  const [query, setQuery] = useState('')
  const [segment, setSegment] = useState('All')
  const form = useDisclosure<Customer>()
  const detail = useDisclosure<Customer>()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return customers.filter((c) => {
      const matchesQuery =
        !q ||
        c.companyName.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.accountOwner.toLowerCase().includes(q)
      return matchesQuery && (segment === 'All' || c.segment === segment)
    })
  }, [customers, query, segment])

  function downloadCsv() {
    exportToCsv(
      `kryon-customers-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Company', 'Segment', 'City', 'GSTIN', 'Priority', 'Tier', 'Owner', 'Vendor Status', 'Vendor Code', 'Annual Potential', 'Revenue Range', 'Lead Source'],
      filtered.map((c) => [
        c.companyName, c.segment, c.city, c.gstin, c.priority, c.tier, c.accountOwner,
        c.vendorStatus, c.vendorCode ?? '', c.annualPotential, c.revenueRange ?? '', c.leadSource,
      ]),
    )
    toast(`Exported ${filtered.length} customers`)
  }

  return (
    <div>
      <PageHeader
        eyebrow="Masters"
        title="Customer Master"
        description="Central company profile per OEM customer — classification, vendor status, and annual potential."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={downloadCsv}>
              <Download className="size-4" />
              Download CSV
            </Button>
            <Button onClick={() => form.show()}>
              <Plus className="size-4" />
              New Customer
            </Button>
          </div>
        }
      />

      <div className="space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search company, city, owner…"
              className="pl-9"
            />
          </div>
          <select
            value={segment}
            onChange={(e) => setSegment(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 font-mono text-xs uppercase tracking-wide outline-none focus-visible:border-ring"
          >
            <option value="All">All segments</option>
            {OEM_SEGMENTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <span className="ml-auto font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
            {filtered.length} of {customers.length}
          </span>
        </div>

        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Segment</TableHead>
                <TableHead>City</TableHead>
                <TableHead className="text-center">Priority</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead className="text-right">Annual Potential</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id} className="cursor-pointer" onClick={() => detail.show(c)}>
                  <TableCell className="font-medium">{c.companyName}</TableCell>
                  <TableCell className="text-muted-foreground">{c.segment}</TableCell>
                  <TableCell className="text-muted-foreground">{c.city}</TableCell>
                  <TableCell className="text-center">
                    <span className={cn('inline-grid size-6 place-items-center rounded-md border font-mono text-[11px] font-semibold', priorityTone[c.priority])}>
                      {c.priority}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{c.tier}</TableCell>
                  <TableCell className="text-muted-foreground">{c.accountOwner}</TableCell>
                  <TableCell><Badge tone={vendorTone[c.vendorStatus]}>{c.vendorStatus}</Badge></TableCell>
                  <TableCell className="text-right font-mono text-sm tabular-nums">{formatInr(c.annualPotential)}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                    No customers match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {form.mounted && (
        <CustomerFormDrawer key="new" open={form.open} onClose={form.close} />
      )}
      {detail.mounted && detail.data && (
        <CustomerDetailDrawer
          key={detail.data.id}
          customer={detail.data}
          open={detail.open}
          onClose={detail.close}
        />
      )}
    </div>
  )
}
