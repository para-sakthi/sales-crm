import { AlertTriangle } from 'lucide-react'
import { useCrmStore, customerName } from '@/data'
import { daysSince } from '@/lib/format'
import { COLD_LEAD_DAYS } from '@/lib/business'

export function StuckDealsCard() {
  const deals = useCrmStore((s) => s.deals)
  const stuck = deals
    .filter((d) => !d.stage.startsWith('Closed') && daysSince(d.lastActivityAt) >= COLD_LEAD_DAYS)
    .map((d) => ({ id: d.id, customer: customerName(d.customerId), stage: d.stage, owner: d.owner, idleDays: daysSince(d.lastActivityAt) }))
    .sort((a, b) => b.idleDays - a.idleDays)

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <AlertTriangle className="size-4 text-warn" />
        <h2 className="font-serif text-lg font-semibold">Stuck Deals</h2>
        <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">no activity &gt; {COLD_LEAD_DAYS}d</span>
      </div>
      <div className="grid gap-1">
        {stuck.map((deal) => (
          <div key={deal.id} className="flex items-center justify-between gap-3 rounded-md px-2 py-2 hover:bg-muted">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{deal.customer}</div>
              <div className="font-mono text-[11px] text-muted-foreground">{deal.stage} · {deal.owner}</div>
            </div>
            <span className="shrink-0 rounded-md border border-warn/40 bg-warn-soft/40 px-2 py-1 font-mono text-[11px] font-semibold text-warn tabular-nums">
              {deal.idleDays}d
            </span>
          </div>
        ))}
        {stuck.length === 0 && <p className="px-2 py-4 text-sm text-muted-foreground">No stuck deals — nice.</p>}
      </div>
    </div>
  )
}
