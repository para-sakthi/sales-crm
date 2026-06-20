import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Field } from '@/components/ui/field'
import { Badge } from '@/components/ui/badge'
import { Drawer } from '@/components/ui/drawer'
import { toast } from '@/components/ui/toast'
import { formatInrFull, amountInWords } from '@/lib/format'
import { computePfiTotals } from '@/lib/business'
import {
  DELIVERY_TERMS,
  GST_RATES,
  PAYMENT_TERMS,
  PFI_TYPES,
  UOM_OPTIONS,
  useCrmStore,
  customerName,
  type GstRate,
  type PfiLineItem,
  type PfiType,
  type UnitOfMeasure,
} from '@/data'

interface Props {
  open: boolean
  onClose: () => void
}

export function PfiGenerateDrawer({ open, onClose }: Props) {
  const quotes = useCrmStore((s) => s.quotes)
  const customers = useCrmStore((s) => s.customers)
  const products = useCrmStore((s) => s.products)
  const addPfi = useCrmStore((s) => s.addPfi)

  const approvedQuotes = useMemo(() => quotes.filter((q) => q.status === 'Approved'), [quotes])
  const [quoteId, setQuoteId] = useState(approvedQuotes[0]?.id ?? '')

  // New header fields
  const [pfiType, setPfiType] = useState<PfiType>('Trial Order')
  const [pfiValidityDays, setPfiValidityDays] = useState(30)
  const [pfiPaymentTerms, setPfiPaymentTerms] = useState<string>(PAYMENT_TERMS[0])
  const [pfiDeliveryTerms, setPfiDeliveryTerms] = useState<string>(DELIVERY_TERMS[0])
  const [deliveryTimeline, setDeliveryTimeline] = useState('')
  const [customerReference, setCustomerReference] = useState('')
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [freightCharges, setFreightCharges] = useState(0)
  const [packingCharges, setPackingCharges] = useState(0)

  const quote = quotes.find((q) => q.id === quoteId)
  const customer = customers.find((c) => c.id === quote?.customerId)
  const sameState = customer ? customer.billingState === customer.shippingState : true

  const [line, setLine] = useState<PfiLineItem>(() => {
    const p = products.find((x) => x.id === approvedQuotes[0]?.productId)
    return {
      productId: approvedQuotes[0]?.productId ?? '',
      hsnCode: p?.hsnCode ?? '',
      quantity: approvedQuotes[0]?.quantity ?? 0,
      uom: 'Pcs',
      unitPrice: approvedQuotes[0]?.finalPrice ?? 0,
      discountPct: 0,
      gstRate: 18,
      deliverySchedule: '',
    }
  })

  function onQuoteChange(id: string) {
    setQuoteId(id)
    const q = quotes.find((x) => x.id === id)
    const p = products.find((x) => x.id === q?.productId)
    if (q) {
      setLine({
        productId: q.productId,
        hsnCode: p?.hsnCode ?? '',
        quantity: q.quantity,
        uom: 'Pcs',
        unitPrice: q.finalPrice,
        discountPct: 0,
        gstRate: 18,
        deliverySchedule: '',
      })
    }
  }

  const totals = computePfiTotals([line], sameState)
  const grandWithCharges = totals.grandTotal + freightCharges + packingCharges

  function handleGenerate() {
    if (!quote) {
      toast('Select an approved quote', 'warn')
      return
    }
    addPfi({
      quoteId: quote.id,
      customerId: quote.customerId,
      pfiType,
      pfiValidityDays,
      pfiPaymentTerms,
      pfiDeliveryTerms,
      deliveryTimeline: deliveryTimeline || undefined,
      customerReference: customerReference || undefined,
      specialInstructions: specialInstructions || undefined,
      lineItems: [line],
      freightCharges: freightCharges || undefined,
      packingCharges: packingCharges || undefined,
      status: 'Pending Rep',
      approvals: { rep: false, commercial: false, management: false },
    })
    toast('PFI generated — routed for approval')
    onClose()
  }

  if (approvedQuotes.length === 0) {
    return (
      <Drawer open={open} onClose={onClose} title="Generate PFI" subtitle="Proforma invoice from an approved quote">
        <p className="text-sm text-muted-foreground">
          No approved quotes available. Approve a quotation first.
        </p>
      </Drawer>
    )
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Generate PFI"
      subtitle="Header auto-populated from the agreed quotation"
      width="xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleGenerate}>Generate PFI</Button>
        </>
      }
    >
      <div className="space-y-6">
        <Field label="Source Quote (approved)">
          <Select value={quoteId} onChange={(e) => onQuoteChange(e.target.value)}>
            {approvedQuotes.map((q) => (
              <option key={q.id} value={q.id}>{q.id} · {customerName(q.customerId)}</option>
            ))}
          </Select>
        </Field>

        <div className="flex items-center gap-2">
          <Badge tone="outline">{customer?.companyName}</Badge>
          <Badge tone={sameState ? 'pass' : 'warn'}>
            {sameState ? 'Intra-state → CGST + SGST' : 'Inter-state → IGST'}
          </Badge>
        </div>

        {/* PFI Header fields */}
        <section>
          <h3 className="mb-3 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">PFI Details</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="PFI Type">
              <Select value={pfiType} onChange={(e) => setPfiType(e.target.value as PfiType)}>
                {PFI_TYPES.map((t) => <option key={t}>{t}</option>)}
              </Select>
            </Field>
            <Field label="PFI Validity (days)">
              <Input type="number" min={1} value={pfiValidityDays} onChange={(e) => setPfiValidityDays(Number(e.target.value))} />
            </Field>
            <Field label="Payment Terms">
              <Select value={pfiPaymentTerms} onChange={(e) => setPfiPaymentTerms(e.target.value as string)}>
                {PAYMENT_TERMS.map((t) => <option key={t}>{t}</option>)}
              </Select>
            </Field>
            <Field label="Delivery Terms">
              <Select value={pfiDeliveryTerms} onChange={(e) => setPfiDeliveryTerms(e.target.value as string)}>
                {DELIVERY_TERMS.map((t) => <option key={t}>{t}</option>)}
              </Select>
            </Field>
            <Field label="Delivery Timeline" hint="e.g. 4-6 weeks from PO">
              <Input value={deliveryTimeline} onChange={(e) => setDeliveryTimeline(e.target.value)} placeholder="4–6 weeks from PO date" />
            </Field>
            <Field label="Customer Reference / Indent #">
              <Input value={customerReference} onChange={(e) => setCustomerReference(e.target.value)} placeholder="ENQ/2024/0123" />
            </Field>
            <Field label="Special Instructions" className="sm:col-span-2">
              <Textarea value={specialInstructions} onChange={(e) => setSpecialInstructions(e.target.value)} placeholder="Any packaging, testing or marking requirements..." />
            </Field>
          </div>
        </section>

        {/* Line item */}
        <section>
          <h3 className="mb-3 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Line Item</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Field label="HSN Code">
              <Input value={line.hsnCode} onChange={(e) => setLine({ ...line, hsnCode: e.target.value })} />
            </Field>
            <Field label="Quantity">
              <Input type="number" value={line.quantity} onChange={(e) => setLine({ ...line, quantity: Number(e.target.value) })} />
            </Field>
            <Field label="UOM">
              <Select value={line.uom ?? 'Pcs'} onChange={(e) => setLine({ ...line, uom: e.target.value as UnitOfMeasure })}>
                {UOM_OPTIONS.map((u) => <option key={u}>{u}</option>)}
              </Select>
            </Field>
            <Field label="Unit Price">
              <Input type="number" value={line.unitPrice} onChange={(e) => setLine({ ...line, unitPrice: Number(e.target.value) })} />
            </Field>
            <Field label="Discount %">
              <Input type="number" value={line.discountPct} onChange={(e) => setLine({ ...line, discountPct: Number(e.target.value) })} />
            </Field>
            <Field label="GST Rate">
              <Select value={String(line.gstRate)} onChange={(e) => setLine({ ...line, gstRate: Number(e.target.value) as GstRate })}>
                {GST_RATES.map((r) => <option key={r} value={r}>{r}%</option>)}
              </Select>
            </Field>
            <Field label="Delivery Schedule" hint="Per-line ETA" className="sm:col-span-3">
              <Input
                value={line.deliverySchedule ?? ''}
                onChange={(e) => setLine({ ...line, deliverySchedule: e.target.value })}
                placeholder="e.g. 2000 pcs in Week 4, balance in Week 8"
              />
            </Field>
          </div>
        </section>

        {/* Additional charges */}
        <section>
          <h3 className="mb-3 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Additional Charges</h3>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Freight Charges (₹)">
              <Input type="number" min={0} value={freightCharges} onChange={(e) => setFreightCharges(Number(e.target.value))} />
            </Field>
            <Field label="Packing & Forwarding (₹)">
              <Input type="number" min={0} value={packingCharges} onChange={(e) => setPackingCharges(Number(e.target.value))} />
            </Field>
          </div>
        </section>

        {/* Totals */}
        <section className="rounded-xl border border-border p-4">
          <Row label="Taxable Value" value={formatInrFull(totals.taxable)} />
          {sameState ? (
            <>
              <Row label={`CGST (${line.gstRate / 2}%)`} value={formatInrFull(totals.cgst)} />
              <Row label={`SGST (${line.gstRate / 2}%)`} value={formatInrFull(totals.sgst)} />
            </>
          ) : (
            <Row label={`IGST (${line.gstRate}%)`} value={formatInrFull(totals.igst)} />
          )}
          {freightCharges > 0 && <Row label="Freight" value={formatInrFull(freightCharges)} />}
          {packingCharges > 0 && <Row label="Packing & Forwarding" value={formatInrFull(packingCharges)} />}
          <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
            <span className="font-semibold">Grand Total</span>
            <span className="font-serif text-xl font-semibold">{formatInrFull(grandWithCharges)}</span>
          </div>
          <p className="mt-2 font-mono text-[11px] italic text-muted-foreground">{amountInWords(grandWithCharges)}</p>
        </section>
      </div>
    </Drawer>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono tabular-nums">{value}</span>
    </div>
  )
}
