import { useState } from 'react'
import { Pencil, Snowflake } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Drawer } from '@/components/ui/drawer'
import { useDisclosure } from '@/components/ui/use-disclosure'
import { toast } from '@/components/ui/toast'
import { formatInr, formatDate, daysSince } from '@/lib/format'
import {
  estimatedAnnualValue,
  priceAdvantagePct,
  isColdCandidate,
  COLD_LEAD_DAYS,
} from '@/lib/business'
import {
  DEAL_STAGES,
  useCrmStore,
  customerName,
  productName,
  type Deal,
} from '@/data'
import { DealFormDrawer } from './DealFormDrawer'
import { NegotiationLog } from './NegotiationLog'

interface Props {
  deal: Deal
  open: boolean
  onClose: () => void
}

export function DealDetailDrawer({ deal, open, onClose }: Props) {
  const moveDealStage = useCrmStore((s) => s.moveDealStage)
  const addDealLog = useCrmStore((s) => s.addDealLog)
  const [note, setNote] = useState('')
  const editPanel = useDisclosure<Deal>()

  const cold = isColdCandidate(deal.stage, deal.lastActivityAt)
  const idle = daysSince(deal.lastActivityAt)
  const annual = estimatedAnnualValue(deal.quantity, deal.quotedPrice)
  const adv = priceAdvantagePct(deal.currentSupplierPrice ?? 0, deal.quotedPrice)

  function logNote() {
    if (!note.trim()) return
    addDealLog(deal.id, 'note', note.trim())
    setNote('')
    toast('Activity logged')
  }

  return (
    <>
    <Drawer
      open={open}
      onClose={onClose}
      title={customerName(deal.customerId)}
      subtitle={productName(deal.productId)}
      width="xl"
      footer={
        <Button onClick={() => editPanel.show(deal)}>
          <Pencil className="size-4" />
          Edit deal
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="ink">{deal.stage}</Badge>
          <Badge tone="outline">{deal.confidence === 0 ? 'Not confident' : `${deal.confidence}%`}</Badge>
          <Badge>Owner: {deal.owner}</Badge>
          {deal.stage === 'Closed Lost' && deal.lostReason && (
            <Badge tone="block">Lost: {deal.lostReason}</Badge>
          )}
          {cold && (
            <Badge tone="block">
              <Snowflake className="size-3" /> Cold candidate · {idle}d idle
            </Badge>
          )}
        </div>

        {cold && (
          <div className="rounded-lg border border-block/30 bg-block-soft/40 px-4 py-3 text-sm text-block">
            No activity for {idle} days (≥ {COLD_LEAD_DAYS}d threshold). The scheduled job will
            auto-flag this Hot lead to <strong>Lead - Cold</strong>.
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <Stat label="Annual Value" value={formatInr(annual)} />
          <Stat label="Price Advantage" value={adv ? `${adv.toFixed(1)}%` : '—'} tone={adv >= 0 ? 'pass' : 'block'} />
          <Stat label="Quantity" value={deal.quantity.toLocaleString('en-IN')} />
        </div>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Our Price" value={formatInr(deal.quotedPrice, { compact: false })} />
          <Field label="Competitor" value={`${deal.currentSupplier ?? '—'}${deal.currentSupplierPrice ? ` @ ${formatInr(deal.currentSupplierPrice, { compact: false })}` : ''}`} />
          <Field label="Next Action" value={deal.nextAction || '—'} />
          <Field label="Next Action Date" value={formatDate(deal.nextActionDate)} />
        </section>

        <section>
          <h3 className="mb-2 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">Move Stage</h3>
          <Select value={deal.stage} onChange={(e) => { moveDealStage(deal.id, e.target.value as Deal['stage']); toast(`Moved to ${e.target.value}`) }}>
            {DEAL_STAGES.map((s) => <option key={s}>{s}</option>)}
          </Select>
        </section>

        <NegotiationLog deal={deal} />

        <section>
          <h3 className="mb-2 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">Log Activity</h3>
          <div className="flex gap-2">
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note, call or email…" onKeyDown={(e) => e.key === 'Enter' && logNote()} />
            <Button onClick={logNote}>Log</Button>
          </div>
        </section>

        <section>
          <h3 className="mb-3 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">Activity Timeline</h3>
          <div className="relative space-y-3 border-l border-border pl-5">
            {deal.log.map((entry) => (
              <div key={entry.id} className="relative">
                <span className="absolute -left-[26px] top-1 size-2.5 rounded-full border-2 border-background bg-primary" />
                <div className="flex items-center gap-2">
                  <Badge tone="outline">{entry.kind}</Badge>
                  <span className="font-mono text-[11px] text-muted-foreground">{formatDate(entry.date)}</span>
                </div>
                <p className="mt-1 text-sm">{entry.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Drawer>
    {editPanel.mounted && (
      <DealFormDrawer
        key={editPanel.data?.id}
        open={editPanel.open}
        onClose={editPanel.close}
        deal={editPanel.data}
      />
    )}
    </>
  )
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'pass' | 'block' }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <div className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`mt-1 font-serif text-lg font-semibold ${tone === 'pass' ? 'text-pass' : tone === 'block' ? 'text-block' : ''}`}>
        {value}
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-medium">{value}</div>
    </div>
  )
}
