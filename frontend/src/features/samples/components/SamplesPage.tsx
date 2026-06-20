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
import { formatDate } from '@/lib/format'
import { useCrmStore, customerName, productName, type Sample, type SampleStatus } from '@/data'
import { SampleFormDrawer } from './SampleFormDrawer'
import { SampleDetailDrawer } from './SampleDetailDrawer'

const statusTone: Record<SampleStatus, 'pass' | 'warn' | 'block' | 'default'> = {
  Passed: 'pass',
  'In Progress': 'warn',
  Rework: 'warn',
  Failed: 'block',
  'Not Started': 'default',
}

export default function SamplesPage() {
  const samples = useCrmStore((s) => s.samples)
  const form = useDisclosure()
  const detail = useDisclosure<Sample>()
  const live = detail.data ? samples.find((s) => s.id === detail.data!.id) : undefined

  return (
    <div>
      <PageHeader
        eyebrow="Activity"
        title="Samples & Testing"
        description="Sample dispatch, test feedback, and the failed-test → rework loop."
        actions={
          <Button onClick={() => form.show()}>
            <Plus className="size-4" />
            New Sample
          </Button>
        }
      />
      <div className="p-6">
        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sample ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-center">Qty</TableHead>
                <TableHead className="text-center">Ver</TableHead>
                <TableHead>Dispatched</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {samples.map((s) => (
                <TableRow key={s.id} className="cursor-pointer" onClick={() => detail.show(s)}>
                  <TableCell className="font-mono text-xs font-medium">{s.id}</TableCell>
                  <TableCell className="font-medium">{customerName(s.customerId)}</TableCell>
                  <TableCell className="text-muted-foreground">{productName(s.productId)}</TableCell>
                  <TableCell className="text-center font-mono text-xs">{s.quantitySent}</TableCell>
                  <TableCell className="text-center font-mono text-xs">v{s.version}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{formatDate(s.dispatchDate)}</TableCell>
                  <TableCell><Badge tone={statusTone[s.status]}>{s.status}</Badge></TableCell>
                  <TableCell>{s.finalResult ? <Badge tone={s.finalResult === 'Approved' ? 'pass' : s.finalResult === 'Rejected' ? 'block' : 'warn'}>{s.finalResult}</Badge> : <span className="text-muted-foreground">—</span>}</TableCell>
                </TableRow>
              ))}
              {samples.length === 0 && (
                <TableRow><TableCell colSpan={8} className="py-10 text-center text-muted-foreground">No samples yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {form.mounted && <SampleFormDrawer open={form.open} onClose={form.close} />}
      {detail.mounted && live && <SampleDetailDrawer key={live.id} sample={live} open={detail.open} onClose={detail.close} />}
    </div>
  )
}
