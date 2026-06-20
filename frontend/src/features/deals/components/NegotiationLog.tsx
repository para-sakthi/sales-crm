import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Field } from '@/components/ui/field'
import { toast } from '@/components/ui/toast'
import { formatInrFull, todayIso } from '@/lib/format'
import { SALES_TEAM, useCrmStore, type Deal, type NegotiationOutcome } from '@/data'

const OUTCOMES: NegotiationOutcome[] = ['Ongoing', 'Agreed', 'Deadlocked', 'Escalated']
const outcomeTone: Record<NegotiationOutcome, 'pass' | 'warn' | 'block' | 'default'> = {
  Agreed: 'pass',
  Ongoing: 'warn',
  Escalated: 'warn',
  Deadlocked: 'block',
}

export function NegotiationLog({ deal }: { deal: Deal }) {
  const addNegotiationRound = useCrmStore((s) => s.addNegotiationRound)
  const [ourPrice, setOurPrice] = useState(deal.quotedPrice)
  const [counterPrice, setCounterPrice] = useState(0)
  const [concessionsOffered, setConcessionsOffered] = useState('')
  const [concessionsReceived, setConcessionsReceived] = useState('')
  const [outcome, setOutcome] = useState<NegotiationOutcome>('Ongoing')
  const [escalatedTo, setEscalatedTo] = useState('')
  const [finalAgreedPrice, setFinalAgreedPrice] = useState<number | ''>('')
  const [finalAgreedPaymentTerms, setFinalAgreedPaymentTerms] = useState('')

  function add() {
    if (!ourPrice || !counterPrice) {
      toast('Enter both prices', 'warn')
      return
    }
    addNegotiationRound(deal.id, {
      date: todayIso(),
      ourPrice: Number(ourPrice),
      counterPrice: Number(counterPrice),
      concessionsOffered: concessionsOffered || undefined,
      concessionsReceived: concessionsReceived || undefined,
      outcome,
      escalatedTo: escalatedTo || undefined,
      finalAgreedPrice: finalAgreedPrice !== '' ? Number(finalAgreedPrice) : undefined,
      finalAgreedPaymentTerms: finalAgreedPaymentTerms || undefined,
    })
    setCounterPrice(0)
    setConcessionsOffered('')
    setConcessionsReceived('')
    setEscalatedTo('')
    setFinalAgreedPrice('')
    setFinalAgreedPaymentTerms('')
    toast('Negotiation round logged')
  }

  return (
    <section>
      <h3 className="mb-2 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
        Negotiation Log ({deal.negotiations.length})
      </h3>

      {deal.negotiations.length > 0 && (
        <div className="mb-3 overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="p-2 text-left">Rd</th>
                <th className="p-2 text-right">Our</th>
                <th className="p-2 text-right">Counter</th>
                <th className="p-2 text-right">Gap</th>
                <th className="p-2 text-left">Outcome</th>
                <th className="p-2 text-left">Escalated To</th>
                <th className="p-2 text-right">Agreed Price</th>
              </tr>
            </thead>
            <tbody>
              {deal.negotiations.map((r) => {
                const gap = r.ourPrice - r.counterPrice
                const gapPct = r.ourPrice ? (gap / r.ourPrice) * 100 : 0
                return (
                  <tr key={r.id} className="border-t border-border align-top">
                    <td className="p-2 font-mono text-xs">#{r.round}</td>
                    <td className="p-2 text-right font-mono text-xs">{formatInrFull(r.ourPrice)}</td>
                    <td className="p-2 text-right font-mono text-xs">{formatInrFull(r.counterPrice)}</td>
                    <td className="p-2 text-right font-mono text-xs">
                      {formatInrFull(gap)}{' '}
                      <span className="text-muted-foreground">({gapPct.toFixed(1)}%)</span>
                    </td>
                    <td className="p-2">
                      <Badge tone={outcomeTone[r.outcome]}>{r.outcome}</Badge>
                    </td>
                    <td className="p-2 text-xs text-muted-foreground">{r.escalatedTo ?? '—'}</td>
                    <td className="p-2 text-right font-mono text-xs">
                      {r.finalAgreedPrice ? (
                        <span className="text-pass font-semibold">{formatInrFull(r.finalAgreedPrice)}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {/* Concessions summary */}
          {deal.negotiations.some((r) => r.concessionsOffered || r.concessionsReceived) && (
            <div className="border-t border-border bg-muted/20 px-3 py-2 text-xs text-muted-foreground space-y-0.5">
              {deal.negotiations.map((r) =>
                r.concessionsOffered || r.concessionsReceived ? (
                  <div key={r.id}>
                    <span className="font-semibold">Rd#{r.round}</span>
                    {r.concessionsOffered && <span> — Offered: {r.concessionsOffered}</span>}
                    {r.concessionsReceived && <span> — Received: {r.concessionsReceived}</span>}
                    {r.finalAgreedPaymentTerms && <span> — Terms: {r.finalAgreedPaymentTerms}</span>}
                  </div>
                ) : null,
              )}
            </div>
          )}
        </div>
      )}

      <div className="rounded-lg border border-dashed border-border p-3">
        <h4 className="mb-2 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">Log New Round</h4>
        <div className="mb-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Field label="Our Price">
            <Input type="number" min={0} value={ourPrice} onChange={(e) => setOurPrice(Number(e.target.value))} />
          </Field>
          <Field label="Counter">
            <Input type="number" min={0} value={counterPrice} onChange={(e) => setCounterPrice(Number(e.target.value))} />
          </Field>
          <Field label="Concessions Offered">
            <Input value={concessionsOffered} onChange={(e) => setConcessionsOffered(e.target.value)} placeholder="e.g. free freight" />
          </Field>
          <Field label="Concessions Received">
            <Input value={concessionsReceived} onChange={(e) => setConcessionsReceived(e.target.value)} placeholder="e.g. volume commitment" />
          </Field>
          <Field label="Outcome">
            <Select value={outcome} onChange={(e) => setOutcome(e.target.value as NegotiationOutcome)}>
              {OUTCOMES.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </Select>
          </Field>
          <Field label="Escalated To">
            <Select value={escalatedTo} onChange={(e) => setEscalatedTo(e.target.value)}>
              <option value="">— none —</option>
              {SALES_TEAM.map((s) => (
                <option key={s}>{s}</option>
              ))}
              <option value="VP Sales">VP Sales</option>
              <option value="CEO">CEO</option>
            </Select>
          </Field>
          <Field label="Final Agreed Price (₹)" hint="If round is concluded">
            <Input
              type="number"
              min={0}
              value={finalAgreedPrice}
              onChange={(e) => setFinalAgreedPrice(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Leave blank if ongoing"
            />
          </Field>
          <Field label="Agreed Payment Terms" hint="If agreed">
            <Input
              value={finalAgreedPaymentTerms}
              onChange={(e) => setFinalAgreedPaymentTerms(e.target.value)}
              placeholder="e.g. Net 45"
            />
          </Field>
        </div>
        <div className="flex justify-end">
          <Button size="sm" onClick={add}>
            <Plus className="size-3.5" /> Add round
          </Button>
        </div>
      </div>
    </section>
  )
}
