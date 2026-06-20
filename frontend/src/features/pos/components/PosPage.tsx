import { Plus, FileCheck2 } from 'lucide-react'
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
import { formatDate } from '@/lib/format'
import { useCrmStore, customerName, type PoStatus } from '@/data'
import { PoCaptureDrawer } from './PoCaptureDrawer'

const statusTone: Record<PoStatus, 'pass' | 'warn' | 'block' | 'default'> = {
  Validated: 'pass',
  'Accepted with Deviation': 'warn',
  'Mismatch Flagged': 'block',
  Rejected: 'block',
  Pending: 'default',
}

export default function PosPage() {
  const purchaseOrders = useCrmStore((s) => s.purchaseOrders)
  const updatePurchaseOrder = useCrmStore((s) => s.updatePurchaseOrder)
  const panel = useDisclosure()

  return (
    <div>
      <PageHeader
        eyebrow="Commercial"
        title="Purchase Orders"
        description="Capture customer POs and reconcile them line-by-line against the PFI."
        actions={
          <Button onClick={() => panel.show()}>
            <Plus className="size-4" />
            Capture PO
          </Button>
        }
      />
      <div className="p-6">
        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>PFI</TableHead>
                <TableHead className="text-center">Lines</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Captured</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseOrders.map((po) => (
                <TableRow key={po.id}>
                  <TableCell className="font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      <FileCheck2 className="size-3.5 text-muted-foreground" />
                      {po.fileName}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{customerName(po.customerId)}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{po.pfiId}</TableCell>
                  <TableCell className="text-center font-mono text-xs">{po.lineItems.length}</TableCell>
                  <TableCell>
                    <select
                      value={po.status}
                      onChange={(e) => updatePurchaseOrder(po.id, { status: e.target.value as PoStatus })}
                      className="cursor-pointer rounded-md border border-input bg-transparent px-1.5 py-0.5 text-xs outline-none"
                    >
                      {(['Pending', 'Validated', 'Mismatch Flagged', 'Accepted with Deviation', 'Rejected'] as PoStatus[]).map((s) => <option key={s}>{s}</option>)}
                    </select>
                    <Badge tone={statusTone[po.status]} className="ml-2 hidden lg:inline-flex">{po.status}</Badge>
                  </TableCell>
                  <TableCell className="max-w-48 truncate text-xs text-muted-foreground">{po.mismatchNotes || '—'}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{formatDate(po.createdAt)}</TableCell>
                </TableRow>
              ))}
              {purchaseOrders.length === 0 && (
                <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">No purchase orders yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {panel.mounted && <PoCaptureDrawer open={panel.open} onClose={panel.close} />}
    </div>
  )
}
