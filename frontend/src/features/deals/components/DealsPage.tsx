import { useState } from 'react'
import { Plus, LayoutGrid, List } from 'lucide-react'
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
import { useDisclosure } from '@/components/ui/use-disclosure'
import { cn } from '@/lib/utils'
import { formatInr, daysSince } from '@/lib/format'
import { isColdCandidate } from '@/lib/business'
import { useCrmStore, customerName, productName, type Deal } from '@/data'
import { PipelineBoard } from './PipelineBoard'
import { DealFormDrawer } from './DealFormDrawer'
import { DealDetailDrawer } from './DealDetailDrawer'

export default function DealsPage() {
  const deals = useCrmStore((s) => s.deals)
  const [view, setView] = useState<'board' | 'list'>('board')
  const form = useDisclosure<Deal>()
  const detail = useDisclosure<Deal>()

  // Keep the open detail in sync with the latest store state.
  const liveDetail = detail.data ? deals.find((d) => d.id === detail.data!.id) : undefined

  return (
    <div>
      <PageHeader
        eyebrow="Pipeline"
        title="Deal Pipeline"
        description="Every opportunity across the 11-stage Lead → PO journey."
        actions={
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-border p-0.5">
              <button type="button" onClick={() => setView('board')} className={cn('grid size-7 place-items-center rounded-md', view === 'board' && 'bg-primary text-primary-foreground')}>
                <LayoutGrid className="size-4" />
              </button>
              <button type="button" onClick={() => setView('list')} className={cn('grid size-7 place-items-center rounded-md', view === 'list' && 'bg-primary text-primary-foreground')}>
                <List className="size-4" />
              </button>
            </div>
            <Button onClick={() => form.show()}>
              <Plus className="size-4" />
              New Deal
            </Button>
          </div>
        }
      />

      <div className="p-6">
        {view === 'board' ? (
          <PipelineBoard deals={deals} onSelect={detail.show} />
        ) : (
          <div className="rounded-xl border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead className="text-center">Conf.</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-right">Idle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deals.map((d) => {
                  const cold = isColdCandidate(d.stage, d.lastActivityAt)
                  return (
                    <TableRow key={d.id} className="cursor-pointer" onClick={() => detail.show(d)}>
                      <TableCell className="font-medium">{customerName(d.customerId)}</TableCell>
                      <TableCell className="text-muted-foreground">{productName(d.productId)}</TableCell>
                      <TableCell><Badge tone={cold ? 'block' : 'outline'}>{d.stage}</Badge></TableCell>
                      <TableCell className="text-muted-foreground">{d.owner}</TableCell>
                      <TableCell className="text-center font-mono text-xs">{d.confidence}%</TableCell>
                      <TableCell className="text-right font-mono text-sm tabular-nums">{formatInr(d.quantity * d.quotedPrice)}</TableCell>
                      <TableCell className={cn('text-right font-mono text-xs', cold && 'font-semibold text-block')}>{daysSince(d.lastActivityAt)}d</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {form.mounted && <DealFormDrawer key={form.data?.id ?? 'new'} open={form.open} onClose={form.close} deal={form.data} />}
      {detail.mounted && liveDetail && (
        <DealDetailDrawer
          key={liveDetail.id}
          deal={liveDetail}
          open={detail.open}
          onClose={detail.close}
        />
      )}
    </div>
  )
}
