import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useDisclosure } from '@/components/ui/use-disclosure'
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
import { computePfiTotals } from '@/lib/business'
import { useCrmStore, customerName, type Pfi } from '@/data'
import { PfiGenerateDrawer } from './PfiGenerateDrawer'
import { PfiDetailDrawer } from './PfiDetailDrawer'

export default function PfiPage() {
  const pfis = useCrmStore((s) => s.pfis)
  const customers = useCrmStore((s) => s.customers)
  const gen = useDisclosure()
  const detail = useDisclosure<Pfi>()
  const live = detail.data ? pfis.find((p) => p.id === detail.data!.id) : undefined

  function grandTotal(pfi: Pfi): number {
    const c = customers.find((x) => x.id === pfi.customerId)
    const sameState = c ? c.billingState === c.shippingState : true
    return computePfiTotals(pfi.lineItems, sameState).grandTotal
  }
  function approvalCount(pfi: Pfi): number {
    return Object.values(pfi.approvals).filter(Boolean).length
  }

  return (
    <div>
      <PageHeader
        eyebrow="Commercial"
        title="Proforma Invoice (PFI)"
        description="Generate PFIs with automatic GST and a 3-step approval chain."
        actions={
          <Button onClick={() => gen.show()}>
            <Plus className="size-4" />
            Generate PFI
          </Button>
        }
      />
      <div className="p-6">
        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PFI</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>From Quote</TableHead>
                <TableHead className="text-right">Grand Total</TableHead>
                <TableHead className="text-center">Approvals</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pfis.map((p) => (
                <TableRow key={p.id} className="cursor-pointer" onClick={() => detail.show(p)}>
                  <TableCell className="font-mono text-xs font-medium">{p.id}</TableCell>
                  <TableCell className="font-medium">{customerName(p.customerId)}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{p.quoteId}</TableCell>
                  <TableCell className="text-right font-mono text-sm tabular-nums">{formatInrFull(grandTotal(p))}</TableCell>
                  <TableCell className="text-center font-mono text-xs">{approvalCount(p)}/3</TableCell>
                  <TableCell><Badge tone={p.status === 'Approved' ? 'pass' : 'warn'}>{p.status}</Badge></TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{formatDate(p.createdAt)}</TableCell>
                </TableRow>
              ))}
              {pfis.length === 0 && (
                <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">No PFIs yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {gen.mounted && <PfiGenerateDrawer open={gen.open} onClose={gen.close} />}
      {detail.mounted && live && <PfiDetailDrawer key={live.id} pfi={live} open={detail.open} onClose={detail.close} />}
    </div>
  )
}
