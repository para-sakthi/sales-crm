import { useMemo } from 'react'
import { PageHeader } from '@/features/shell'
import { formatInr, daysSince } from '@/lib/format'
import { COLD_LEAD_DAYS } from '@/lib/business'
import { useCrmStore, productName } from '@/data'
import { KpiCard } from './KpiCard'
import { PipelineFunnel } from './PipelineFunnel'
import { StuckDealsCard } from './StuckDealsCard'
import type { Kpi } from '../kpi'

function isThisMonth(isoDate: string): boolean {
  const d = new Date(isoDate)
  const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
}

export default function DashboardPage() {
  const deals = useCrmStore((s) => s.deals)
  const pfis = useCrmStore((s) => s.pfis)
  const purchaseOrders = useCrmStore((s) => s.purchaseOrders)

  const kpis = useMemo<Kpi[]>(() => {
    const open = deals.filter((d) => !d.stage.startsWith('Closed'))
    const leads = deals.filter((d) => d.stage === 'Lead - Hot' || d.stage === 'Lead - Cold')
    const leadsThisMonth = leads.filter((d) => isThisMonth(d.createdAt)).length
    const pipelineValue = open.reduce((sum, d) => sum + d.quantity * d.quotedPrice, 0)
    const weighted = open.reduce((sum, d) => sum + d.quantity * d.quotedPrice * (d.confidence / 100), 0)
    const poStage = deals.filter((d) => d.stage === 'PO Received')
    const won = deals.filter((d) => d.stage === 'Closed Won')
    const po = poStage.length + won.length
    const conversion = deals.length ? (po / deals.length) * 100 : 0
    const stuck = open.filter((d) => daysSince(d.lastActivityAt) >= COLD_LEAD_DAYS).length
    const value = (d: (typeof deals)[number]) => d.quantity * d.quotedPrice

    const activeOrders = poStage.length
    const revenueCollected = won.reduce((s, d) => s + value(d), 0)
    const revenuePending = poStage.reduce((s, d) => s + value(d), 0)
    const avgDays = open.length
      ? open.reduce((s, d) => s + daysSince(d.lastActivityAt), 0) / open.length
      : 0

    const posThisMonth = purchaseOrders.filter((p) => isThisMonth(p.createdAt)).length

    return [
      { key: 'active-leads', label: 'Total Active Leads', value: String(open.length), hint: `${leads.length} at lead stage` },
      { key: 'leads-this-month', label: 'Leads This Month', value: String(leadsThisMonth), hint: 'New leads created this month', tone: leadsThisMonth > 0 ? 'pass' : 'default' },
      { key: 'pipeline-value', label: 'Pipeline Value', value: formatInr(pipelineValue), hint: `Weighted ${formatInr(weighted)}` },
      { key: 'conversion', label: 'Conversion Rate', value: `${conversion.toFixed(0)}%`, hint: 'Lead → PO' },
      { key: 'avg-days', label: 'Avg Days / Stage', value: avgDays.toFixed(1), hint: 'Across open deals' },
      { key: 'active-orders', label: 'Active Orders', value: String(activeOrders), tone: 'pass', hint: 'PO received, in execution' },
      { key: 'revenue-collected', label: 'Revenue (Won)', value: formatInr(revenueCollected), tone: 'pass' },
      { key: 'revenue-pending', label: 'Revenue Pending', value: formatInr(revenuePending), tone: 'warn', hint: 'Booked, awaiting close' },
      { key: 'po-count', label: 'POs Captured', value: String(purchaseOrders.length), hint: `${pfis.length} PFIs raised` },
      { key: 'pos-this-month', label: 'POs This Month', value: String(posThisMonth), tone: posThisMonth > 0 ? 'pass' : 'default', hint: 'Purchase orders received this month' },
      { key: 'pfi-pending', label: 'PFIs Pending Approval', value: String(pfis.filter((p) => p.status !== 'Approved').length), tone: 'warn' },
      { key: 'stuck', label: 'Stuck Deals', value: String(stuck), hint: `No activity > ${COLD_LEAD_DAYS}d`, tone: stuck > 0 ? 'warn' : 'default' },
      { key: 'won', label: 'Closed Won', value: String(won.length), tone: 'pass' },
      { key: 'total-deals', label: 'Total Deals', value: String(deals.length) },
    ]
  }, [deals, pfis, purchaseOrders])

  // Product-wise KPI: count open deals and weighted pipeline per product
  const productKpis = useMemo(() => {
    const open = deals.filter((d) => !d.stage.startsWith('Closed'))
    const map = new Map<string, { deals: number; pipeline: number; weighted: number }>()
    for (const d of open) {
      const prev = map.get(d.productId) ?? { deals: 0, pipeline: 0, weighted: 0 }
      const val = d.quantity * d.quotedPrice
      map.set(d.productId, {
        deals: prev.deals + 1,
        pipeline: prev.pipeline + val,
        weighted: prev.weighted + val * (d.confidence / 100),
      })
    }
    return [...map.entries()]
      .sort((a, b) => b[1].pipeline - a[1].pipeline)
      .slice(0, 6)
      .map(([pid, stats]) => ({ pid, name: productName(pid), ...stats }))
  }, [deals])

  const maxPipeline = productKpis[0]?.pipeline ?? 1

  return (
    <div>
      <PageHeader
        eyebrow="Overview"
        title="Sales Command Center"
        description="Live snapshot of the Kryon B2B pipeline — leads, conversion, and commercial health."
      />
      <div className="space-y-6 p-6">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => <KpiCard key={kpi.key} kpi={kpi} />)}
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2"><PipelineFunnel /></div>
          <StuckDealsCard />
        </section>

        {/* Product-wise pipeline */}
        {productKpis.length > 0 && (
          <section>
            <h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              Product-Wise Pipeline (top {productKpis.length})
            </h2>
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="p-3 text-left">Product</th>
                    <th className="p-3 text-right">Deals</th>
                    <th className="p-3 text-right">Pipeline</th>
                    <th className="p-3 text-right">Weighted</th>
                    <th className="p-3 text-left w-32">Share</th>
                  </tr>
                </thead>
                <tbody>
                  {productKpis.map((p) => (
                    <tr key={p.pid} className="border-t border-border">
                      <td className="p-3 font-medium">{p.name}</td>
                      <td className="p-3 text-right font-mono text-xs">{p.deals}</td>
                      <td className="p-3 text-right font-mono text-xs">{formatInr(p.pipeline)}</td>
                      <td className="p-3 text-right font-mono text-xs text-muted-foreground">{formatInr(p.weighted)}</td>
                      <td className="p-3">
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-primary"
                            style={{ width: `${(p.pipeline / maxPipeline) * 100}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
