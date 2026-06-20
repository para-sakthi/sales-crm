import { useMemo } from 'react'
import { Plus, Trash2, ClipboardCheck } from 'lucide-react'
import { useDisclosure } from '@/components/ui/use-disclosure'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/features/shell'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/format'
import {
  READINESS_STATUSES,
  useCrmStore,
  customerName,
  productName,
  type ReadinessItem,
  type ReadinessStatus,
} from '@/data'
import { ReadinessItemDrawer } from './ReadinessItemDrawer'

const statusText: Record<ReadinessStatus, string> = {
  Ready: 'text-pass',
  'In Progress': 'text-warn',
  Blocked: 'text-block',
  'Not Started': 'text-foreground',
  'N/A': 'text-muted-foreground',
}

/** % ready = ready items / items that count (exclude N/A). */
function readinessPct(items: ReadinessItem[]): number {
  const counted = items.filter((i) => i.status !== 'N/A')
  if (counted.length === 0) return 0
  return Math.round((counted.filter((i) => i.status === 'Ready').length / counted.length) * 100)
}

export default function ReadinessPage() {
  const items = useCrmStore((s) => s.readinessItems)
  const deals = useCrmStore((s) => s.deals)
  const updateReadinessItem = useCrmStore((s) => s.updateReadinessItem)
  const deleteReadinessItem = useCrmStore((s) => s.deleteReadinessItem)
  const panel = useDisclosure()

  // Group items by deal, only for deals that still exist and aren't lost.
  const groups = useMemo(() => {
    const byDeal = new Map<string, ReadinessItem[]>()
    for (const it of items) {
      const arr = byDeal.get(it.dealId) ?? []
      arr.push(it)
      byDeal.set(it.dealId, arr)
    }
    return [...byDeal.entries()]
      .map(([dealId, list]) => ({ deal: deals.find((d) => d.id === dealId), list }))
      .filter((g) => g.deal && g.deal.stage !== 'Closed Lost')
  }, [items, deals])

  const blockedCount = items.filter((i) => i.status === 'Blocked').length

  return (
    <div>
      <PageHeader
        eyebrow="Operations"
        title="Internal Readiness Tracker"
        description="Cross-functional readiness to deliver each deal — vendor approval, tooling, capacity, quality docs."
        actions={
          <Button onClick={() => panel.show()}>
            <Plus className="size-4" />
            Add Item
          </Button>
        }
      />
      <div className="space-y-5 p-6">
        {blockedCount > 0 && (
          <div className="rounded-lg border border-block/40 bg-block-soft/40 px-4 py-2.5 text-sm text-block">
            {blockedCount} readiness item{blockedCount > 1 ? 's are' : ' is'} <b>blocked</b> across active deals.
          </div>
        )}

        {groups.length === 0 && (
          <div className="rounded-xl border border-dashed border-border py-12 text-center text-muted-foreground">
            No readiness items yet. Add one to start tracking fulfilment preparedness.
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {groups.map(({ deal, list }) => {
            if (!deal) return null
            const pct = readinessPct(list)
            return (
              <div key={deal.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-lg font-semibold">{customerName(deal.customerId)}</h3>
                    <p className="text-sm text-muted-foreground">{productName(deal.productId)} · {deal.stage}</p>
                  </div>
                  <div className="text-right">
                    <div className={cn('font-serif text-2xl font-semibold', pct === 100 ? 'text-pass' : pct >= 50 ? 'text-warn' : 'text-block')}>{pct}%</div>
                    <div className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">Ready</div>
                  </div>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div className={cn('h-full rounded-full transition-all', pct === 100 ? 'bg-pass' : pct >= 50 ? 'bg-warn' : 'bg-block')} style={{ width: `${pct}%` }} />
                </div>

                <div className="mt-4 space-y-2">
                  {list.map((it) => {
                    const overdue = it.targetDate && it.status !== 'Ready' && it.status !== 'N/A' && new Date(it.targetDate) < new Date()
                    return (
                      <div key={it.id} className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-medium">{it.category}</span>
                            {overdue && <Badge tone="block">Overdue</Badge>}
                          </div>
                          <div className="truncate text-xs text-muted-foreground">
                            {it.detail || '—'}
                            {it.owner && <span> · {it.owner}</span>}
                            {it.targetDate && <span> · due {formatDate(it.targetDate)}</span>}
                          </div>
                        </div>
                        <select
                          value={it.status}
                          onChange={(e) => updateReadinessItem(it.id, { status: e.target.value as ReadinessStatus })}
                          className={cn('cursor-pointer rounded-md border border-input bg-transparent px-1.5 py-0.5 text-xs font-medium outline-none', statusText[it.status])}
                        >
                          {READINESS_STATUSES.map((s) => <option key={s}>{s}</option>)}
                        </select>
                        <button type="button" onClick={() => deleteReadinessItem(it.id)} className="text-muted-foreground hover:text-block" aria-label="Remove item">
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-3 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                  <ClipboardCheck className="size-3.5" />
                  {list.filter((i) => i.status === 'Ready').length}/{list.filter((i) => i.status !== 'N/A').length} ready
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {panel.mounted && <ReadinessItemDrawer open={panel.open} onClose={panel.close} />}
    </div>
  )
}
