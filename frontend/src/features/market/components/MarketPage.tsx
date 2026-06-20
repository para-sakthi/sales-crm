import { Plus } from 'lucide-react'
import { useDisclosure } from '@/components/ui/use-disclosure'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/features/shell'
import { cn } from '@/lib/utils'
import { formatInr, formatInrFull } from '@/lib/format'
import { priceAdvantagePct, estimatedAnnualValue } from '@/lib/business'
import { useCrmStore, customerName } from '@/data'
import { MarketIntelDrawer } from './MarketIntelDrawer'

export default function MarketPage() {
  const intel = useCrmStore((s) => s.marketIntel)
  const panel = useDisclosure()

  return (
    <div>
      <PageHeader
        eyebrow="Intelligence"
        title="Market Intelligence"
        description="Competitive landscape & opportunity sizing captured during customer visits."
        actions={
          <Button onClick={() => panel.show()}>
            <Plus className="size-4" />
            Capture Intel
          </Button>
        }
      />
      <div className="grid grid-cols-1 gap-4 p-6 lg:grid-cols-2">
        {intel.map((m) => {
          const adv = priceAdvantagePct(m.competitorPrice, m.ourPrice)
          const potential = estimatedAnnualValue(m.annualVolume, m.ourPrice)
          return (
            <div key={m.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-semibold">{customerName(m.customerId)}</h3>
                <Badge tone="warn">vs {m.competitor}</Badge>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <Metric label="Their Price" value={formatInrFull(m.competitorPrice)} />
                <Metric label="Our Price" value={formatInrFull(m.ourPrice)} />
                <Metric label="Advantage" value={`${adv.toFixed(1)}%`} tone={adv >= 0 ? 'pass' : 'block'} />
              </div>
              <div className="mt-3 rounded-lg bg-primary px-4 py-2 text-primary-foreground">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-wide">Annual Revenue Potential</span>
                  <span className="font-serif text-lg font-semibold">{formatInr(potential)}</span>
                </div>
              </div>
              {(m.techNotes || m.qualityNotes || m.sourcingNotes) && (
                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  {m.sourcingNotes && <p><b className="text-foreground">Sourcing:</b> {m.sourcingNotes}</p>}
                  {m.techNotes && <p><b className="text-foreground">Tech:</b> {m.techNotes}</p>}
                  {m.qualityNotes && <p><b className="text-foreground">Quality:</b> {m.qualityNotes}</p>}
                </div>
              )}

              {/* Key signals captured in the tiered form */}
              {(m.lookingForAlt || m.localizationPush || m.vendorApprovalMonths != null) && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {m.lookingForAlt && <Badge tone={m.lookingForAlt.startsWith('Yes') ? 'pass' : 'default'}>Alt supplier: {m.lookingForAlt}</Badge>}
                  {m.localizationPush && <Badge tone={m.localizationPush.startsWith('Yes') ? 'pass' : 'default'}>Localization: {m.localizationPush}</Badge>}
                  {m.vendorApprovalMonths != null && <Badge tone="default">Approval: {m.vendorApprovalMonths} mo</Badge>}
                </div>
              )}

              {m.competitors && m.competitors.length > 0 && (
                <div className="mt-3 border-t border-border pt-3">
                  <div className="mb-1.5 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">Competitive Landscape</div>
                  <div className="space-y-1">
                    {m.competitors.map((c) => (
                      <div key={c.id} className="flex items-center justify-between text-sm">
                        <span className="font-medium">{c.name}</span>
                        <span className="font-mono text-xs text-muted-foreground">
                          {c.price != null ? formatInrFull(c.price) : '—'}
                          {c.qualityRating != null ? ` · Q${c.qualityRating}/10` : ''}
                          {c.keyWeakness ? ` · ${c.keyWeakness}` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
        {intel.length === 0 && (
          <div className="rounded-xl border border-dashed border-border py-12 text-center text-muted-foreground lg:col-span-2">
            No market intelligence captured yet.
          </div>
        )}
      </div>

      {panel.mounted && <MarketIntelDrawer open={panel.open} onClose={panel.close} />}
    </div>
  )
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: 'pass' | 'block' }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={cn('mt-0.5 font-semibold', tone === 'pass' ? 'text-pass' : tone === 'block' ? 'text-block' : '')}>{value}</div>
    </div>
  )
}
