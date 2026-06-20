import { Plus } from 'lucide-react'
import { useDisclosure } from '@/components/ui/use-disclosure'
import { Button } from '@/components/ui/button'
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
import { formatInrFull, formatDate } from '@/lib/format'
import { realizedMarginPct } from '@/lib/business'
import { useCrmStore, customerName, productName, type QuoteStatus } from '@/data'
import { QuoteFormDrawer } from './QuoteFormDrawer'

const statusTone: Record<QuoteStatus, 'pass' | 'warn' | 'block' | 'default'> = {
  Approved: 'pass',
  'Pending Approval': 'warn',
  Draft: 'default',
  Rejected: 'block',
}

export default function QuotesPage() {
  const quotes = useCrmStore((s) => s.quotes)
  const panel = useDisclosure()

  return (
    <div>
      <PageHeader
        eyebrow="Commercial"
        title="Quotations"
        description="BOM-driven pricing — the Quote Decision Intelligence Engine."
        actions={
          <Button onClick={() => panel.show()}>
            <Plus className="size-4" />
            New Quote
          </Button>
        }
      />
      <div className="p-6">
        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quote</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Margin</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="font-mono text-xs font-medium">{q.id}</TableCell>
                  <TableCell className="font-medium">{customerName(q.customerId)}</TableCell>
                  <TableCell className="text-muted-foreground">{productName(q.productId)}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{q.quantity.toLocaleString('en-IN')}</TableCell>
                  <TableCell className="text-right font-mono text-sm tabular-nums">{formatInrFull(q.finalPrice)}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{realizedMarginPct(q.bom, q.finalPrice).toFixed(1)}%</TableCell>
                  <TableCell><Badge tone={statusTone[q.status]}>{q.status}</Badge></TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{formatDate(q.createdAt)}</TableCell>
                </TableRow>
              ))}
              {quotes.length === 0 && (
                <TableRow><TableCell colSpan={8} className="py-10 text-center text-muted-foreground">No quotes yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {panel.mounted && <QuoteFormDrawer open={panel.open} onClose={panel.close} />}
    </div>
  )
}
