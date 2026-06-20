import { OPEN_STAGES, useCrmStore } from '@/data'
import { formatInr } from '@/lib/format'

export function PipelineFunnel() {
  const deals = useCrmStore((s) => s.deals)
  const stages = OPEN_STAGES.map((stage) => {
    const inStage = deals.filter((d) => d.stage === stage)
    return {
      stage,
      count: inStage.length,
      value: inStage.reduce((sum, d) => sum + d.quantity * d.quotedPrice, 0),
    }
  })
  const max = Math.max(...stages.map((s) => s.count), 1)

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-serif text-lg font-semibold">Pipeline by Stage</h2>
        <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">Active deals</span>
      </div>
      <div className="grid gap-2.5">
        {stages.map((stage) => (
          <div key={stage.stage} className="flex items-center gap-3">
            <div className="w-44 shrink-0 truncate text-sm font-medium">{stage.stage}</div>
            <div className="relative h-7 flex-1 overflow-hidden rounded-md bg-muted">
              <div
                className="flex h-full items-center rounded-md bg-primary px-2 transition-all"
                style={{ width: `${Math.max((stage.count / max) * 100, 6)}%` }}
              >
                <span className="font-mono text-[11px] font-semibold text-primary-foreground tabular-nums">{stage.count}</span>
              </div>
            </div>
            <div className="w-20 shrink-0 text-right font-mono text-[11px] text-muted-foreground tabular-nums">
              {formatInr(stage.value)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
