import { useMemo } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'
import { PageHeader } from '@/features/shell'
import { formatInr, daysSince } from '@/lib/format'
import { COLD_LEAD_DAYS } from '@/lib/business'
import { OEM_SEGMENTS, SALES_TEAM, OPEN_STAGES, useCrmStore } from '@/data'

function Bar({ label, value, max, right, tone }: { label: string; value: number; max: number; right: string; tone?: 'pass' | 'warn' | 'block' }) {
  const barClass = tone === 'pass' ? 'bg-pass' : tone === 'warn' ? 'bg-warn' : tone === 'block' ? 'bg-block' : 'bg-primary'
  return (
    <div className="flex items-center gap-3">
      <div className="w-40 shrink-0 truncate text-sm">{label}</div>
      <div className="h-6 flex-1 overflow-hidden rounded-md bg-muted">
        <div className={`h-full rounded-md ${barClass}`} style={{ width: `${max ? Math.max((value / max) * 100, 3) : 0}%` }} />
      </div>
      <div className="w-24 shrink-0 text-right font-mono text-[11px] text-muted-foreground tabular-nums">{right}</div>
    </div>
  )
}

function Panel({ title, children, hint }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-serif text-lg font-semibold">{title}</h2>
      {hint && <p className="mb-3 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">{hint}</p>}
      <div className="mt-3 space-y-2.5">{children}</div>
    </div>
  )
}

export default function ReportsPage() {
  const deals = useCrmStore((s) => s.deals)

  const data = useMemo(() => {
    const value = (q: number, p: number) => q * p
    const open = deals.filter((d) => !d.stage.startsWith('Closed'))
    const weighted = open.reduce((sum, d) => sum + value(d.quantity, d.quotedPrice) * (d.confidence / 100), 0)

    const byStage = OPEN_STAGES.map((stage) => {
      const ds = deals.filter((d) => d.stage === stage)
      return { stage, count: ds.length, value: ds.reduce((s, d) => s + value(d.quantity, d.quotedPrice), 0) }
    })

    const bySegment = OEM_SEGMENTS.map((seg) => {
      const ds = deals.filter((d) => d.segment === seg)
      return { seg, count: ds.length, value: ds.reduce((s, d) => s + value(d.quantity, d.quotedPrice), 0) }
    }).filter((x) => x.count > 0)

    const byRep = SALES_TEAM.map((rep) => {
      const ds = deals.filter((d) => d.owner === rep)
      const won = ds.filter((d) => d.stage === 'Closed Won').length
      return { rep, count: ds.length, won, value: ds.reduce((s, d) => s + value(d.quantity, d.quotedPrice), 0) }
    }).filter((x) => x.count > 0)

    const won = deals.filter((d) => d.stage === 'Closed Won').length
    const lost = deals.filter((d) => d.stage === 'Closed Lost').length
    const po = deals.filter((d) => d.stage === 'PO Received' || d.stage === 'Closed Won').length
    const conversion = deals.length ? (po / deals.length) * 100 : 0

    // ── Deal Cycle Time: avg days from createdAt to lastActivityAt for Closed Won
    const wonDeals = deals.filter((d) => d.stage === 'Closed Won')
    const avgCycleDays = wonDeals.length
      ? wonDeals.reduce((s, d) => {
          const ms = new Date(d.lastActivityAt).getTime() - new Date(d.createdAt).getTime()
          return s + ms / 86_400_000
        }, 0) / wonDeals.length
      : 0

    // ── Days-in-Stage: avg days since last activity per stage (proxy)
    const daysInStage = OPEN_STAGES.map((stage) => {
      const ds = deals.filter((d) => d.stage === stage)
      const avg = ds.length ? ds.reduce((s, d) => s + daysSince(d.lastActivityAt), 0) / ds.length : 0
      return { stage, count: ds.length, avgDays: Math.round(avg) }
    }).filter((x) => x.count > 0)

    // ── Stuck Deals Aging
    const stuckBuckets = [
      { label: `${COLD_LEAD_DAYS}–30d`, min: COLD_LEAD_DAYS, max: 30 },
      { label: '31–60d', min: 31, max: 60 },
      { label: '61–90d', min: 61, max: 90 },
      { label: '> 90d', min: 91, max: Infinity },
    ]
    const stuckAging = stuckBuckets.map((b) => ({
      label: b.label,
      count: open.filter((d) => {
        const days = daysSince(d.lastActivityAt)
        return days >= b.min && days <= b.max
      }).length,
    }))

    // ── Competitor Win-Rate (from lost deals with lostReason = 'Competition', or from market intel)
    const lostToCompetition = deals
      .filter((d) => d.stage === 'Closed Lost' && d.lostReason === 'Competition')
      .length
    const lostReasons = deals
      .filter((d) => d.stage === 'Closed Lost' && d.lostReason)
      .reduce<Record<string, number>>((acc, d) => {
        const reason = d.lostReason!
        acc[reason] = (acc[reason] ?? 0) + 1
        return acc
      }, {})
    const byLostReason = Object.entries(lostReasons)
      .sort((a, b) => b[1] - a[1])
      .map(([reason, count]) => ({ reason, count }))

    return {
      weighted, byStage, bySegment, byRep, won, lost, conversion,
      avgCycleDays, daysInStage, stuckAging, lostToCompetition, byLostReason,
    }
  }, [deals])

  const stageMax = Math.max(...data.byStage.map((s) => s.value), 1)
  const segMax = Math.max(...data.bySegment.map((s) => s.value), 1)
  const repMax = Math.max(...data.byRep.map((r) => r.value), 1)
  const daysMax = Math.max(...data.daysInStage.map((s) => s.avgDays), 1)
  const stuckMax = Math.max(...data.stuckAging.map((s) => s.count), 1)
  const lostMax = Math.max(...data.byLostReason.map((r) => r.count), 1)

  return (
    <div>
      <PageHeader
        eyebrow="Intelligence"
        title="Reports & Analytics"
        description="Pipeline, forecast, and performance — computed live from your deals."
        actions={
          <Button variant="outline" onClick={() => toast('MIS Excel export comes with the backend', 'info')}>
            <Download className="size-4" />
            Export MIS
          </Button>
        }
      />
      <div className="space-y-6 p-6">
        {/* Summary stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Stat label="Weighted Revenue Forecast" value={formatInr(data.weighted)} />
          <Stat label="Conversion Rate" value={`${data.conversion.toFixed(0)}%`} />
          <Stat label="Win / Loss" value={`${data.won} / ${data.lost}`} />
          <Stat label="Avg Deal Cycle" value={`${data.avgCycleDays.toFixed(0)}d`} hint="Won deals only" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Stage Conversion */}
          <Panel title="Stage Conversion Funnel">
            {data.byStage.map((s) => (
              <Bar key={s.stage} label={s.stage} value={s.value} max={stageMax} right={`${s.count} · ${formatInr(s.value)}`} />
            ))}
          </Panel>

          {/* Segment-wise */}
          <Panel title="Segment-wise Split">
            {data.bySegment.map((s) => (
              <Bar key={s.seg} label={s.seg} value={s.value} max={segMax} right={`${s.count} · ${formatInr(s.value)}`} />
            ))}
          </Panel>

          {/* Sales Rep Performance */}
          <Panel title="Sales Rep Performance">
            {data.byRep.map((s) => (
              <Bar key={s.rep} label={`${s.rep} (${s.won} won)`} value={s.value} max={repMax} right={`${s.count} · ${formatInr(s.value)}`} />
            ))}
          </Panel>

          {/* Days in Stage */}
          <Panel title="Avg Days in Stage" hint="Proxy: days since last activity per stage">
            {data.daysInStage.map((s) => {
              const tone = s.avgDays > 60 ? 'block' : s.avgDays > 30 ? 'warn' : 'pass'
              return (
                <Bar key={s.stage} label={s.stage} value={s.avgDays} max={daysMax} right={`${s.avgDays}d · ${s.count} deals`} tone={tone} />
              )
            })}
            {data.daysInStage.length === 0 && <p className="text-sm text-muted-foreground">No open deals.</p>}
          </Panel>

          {/* Stuck Deals Aging */}
          <Panel title="Stuck Deals Aging" hint={`No activity > ${COLD_LEAD_DAYS} days`}>
            {data.stuckAging.map((b) => (
              <Bar key={b.label} label={b.label} value={b.count} max={stuckMax} right={`${b.count} deals`} tone={b.count > 0 ? 'warn' : 'pass'} />
            ))}
            {data.stuckAging.every((b) => b.count === 0) && (
              <p className="text-sm text-pass">No stuck deals 🎉</p>
            )}
          </Panel>

          {/* Win / Loss by Reason */}
          <Panel title="Loss Reason Analysis" hint={`${data.lostToCompetition} deals lost to competition`}>
            {data.byLostReason.length > 0 ? (
              data.byLostReason.map((r) => (
                <Bar key={r.reason} label={r.reason} value={r.count} max={lostMax} right={`${r.count} deals`} tone={r.reason === 'Competition' ? 'block' : 'warn'} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No closed-lost deals yet.</p>
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{label}</div>
      <div className="mt-2 font-serif text-3xl font-semibold tracking-tight">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  )
}
