import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Kpi } from '../kpi'

const toneStripe: Record<NonNullable<Kpi['tone']>, string> = {
  default: 'bg-primary',
  pass: 'bg-pass',
  warn: 'bg-warn',
  block: 'bg-block',
}

export function KpiCard({ kpi }: { kpi: Kpi }) {
  const tone = kpi.tone ?? 'default'
  const DeltaIcon =
    kpi.delta?.direction === 'down'
      ? ArrowDownRight
      : kpi.delta?.direction === 'flat'
        ? Minus
        : ArrowUpRight

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5">
      <span className={cn('absolute inset-y-0 left-0 w-1', toneStripe[tone])} />
      <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        {kpi.label}
      </div>
      <div className="mt-2 font-serif text-3xl font-semibold tracking-tight tabular-nums">
        {kpi.value}
      </div>
      <div className="mt-2 flex items-center gap-2">
        {kpi.delta && (
          <span
            className={cn(
              'inline-flex items-center gap-1 font-mono text-[11px] font-medium',
              kpi.delta.direction === 'down' ? 'text-block' : 'text-pass',
            )}
          >
            <DeltaIcon className="size-3" />
            {kpi.delta.value}
          </span>
        )}
        {kpi.hint && (
          <span className="font-mono text-[11px] text-muted-foreground">{kpi.hint}</span>
        )}
      </div>
    </div>
  )
}
