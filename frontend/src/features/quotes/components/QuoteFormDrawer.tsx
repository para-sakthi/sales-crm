import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Field } from '@/components/ui/field'
import { Badge } from '@/components/ui/badge'
import { Drawer } from '@/components/ui/drawer'
import { toast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'
import { formatInrFull } from '@/lib/format'
import {
  totalBom,
  targetSellingPrice,
  realizedMarginPct,
  discountPct,
  approvalTier,
  priceAdvantagePct,
} from '@/lib/business'
import {
  DELIVERY_TERMS,
  PAYMENT_TERMS,
  useCrmStore,
  type BomBuildUp,
  type DeliveryTerms,
  type PaymentTerms,
} from '@/data'
import { MarketBand } from './MarketBand'

interface Props {
  open: boolean
  onClose: () => void
}

const tierTone = {
  'Auto-approved': 'pass',
  'Sales Manager': 'warn',
  'VP / Director': 'warn',
  CEO: 'block',
} as const

export function QuoteFormDrawer({ open, onClose }: Props) {
  const customers = useCrmStore((s) => s.customers)
  const deals = useCrmStore((s) => s.deals)
  const products = useCrmStore((s) => s.products)
  const addQuote = useCrmStore((s) => s.addQuote)

  const firstProduct = products[0]
  const [form, setForm] = useState({
    customerId: customers[0]?.id ?? '',
    dealId: '',
    productId: firstProduct?.id ?? '',
    quantity: 10000,
    moq: 0,
    bom: { rawMaterial: 410, conversion: 95, consumables: 22, packaging: 18, freight: 15 } as BomBuildUp,
    targetMargin: 25,
    finalPrice: firstProduct?.sellingPrice ?? 720,
    marketLow: 690,
    marketHigh: 810,
    customerCurrentPrice: 780,
    validityDays: 30,
    paymentTerms: 'Net 30' as PaymentTerms,
    deliveryTerms: 'Ex-Works' as DeliveryTerms,
  })

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }
  function setBom<K extends keyof BomBuildUp>(key: K, value: number) {
    setForm((f) => ({ ...f, bom: { ...f.bom, [key]: value } }))
  }

  const customerDeals = useMemo(() => deals.filter((d) => d.customerId === form.customerId), [deals, form.customerId])
  const listPrice = products.find((p) => p.id === form.productId)?.sellingPrice ?? form.finalPrice

  const bomTotal = totalBom(form.bom)
  const targetPrice = targetSellingPrice(form.bom, form.targetMargin)
  const realized = realizedMarginPct(form.bom, form.finalPrice)
  const disc = discountPct(listPrice, form.finalPrice)
  const tier = approvalTier(disc)
  const advantage = priceAdvantagePct(form.customerCurrentPrice, form.finalPrice)

  function applyTarget() {
    set('finalPrice', Math.round(targetPrice))
  }

  function handleSave() {
    addQuote({
      customerId: form.customerId,
      dealId: form.dealId || undefined,
      productId: form.productId,
      quantity: Number(form.quantity),
      moq: Number(form.moq) || undefined,
      bom: form.bom,
      targetMargin: Number(form.targetMargin),
      finalPrice: Number(form.finalPrice),
      marketLow: Number(form.marketLow),
      marketHigh: Number(form.marketHigh),
      customerCurrentPrice: Number(form.customerCurrentPrice) || undefined,
      validityDays: Number(form.validityDays),
      paymentTerms: form.paymentTerms,
      deliveryTerms: form.deliveryTerms,
      status: tier === 'Auto-approved' ? 'Approved' : 'Pending Approval',
    })
    toast(tier === 'Auto-approved' ? 'Quote created & auto-approved' : `Quote created — routed to ${tier}`)
    onClose()
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="New Quotation"
      subtitle="BOM-driven pricing with margin & approval routing"
      width="xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Create quote</Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Context */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Customer">
            <Select value={form.customerId} onChange={(e) => set('customerId', e.target.value)}>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.companyName}</option>)}
            </Select>
          </Field>
          <Field label="Product">
            <Select value={form.productId} onChange={(e) => set('productId', e.target.value)}>
              {products.map((p) => <option key={p.id} value={p.id}>{p.modelName}</option>)}
            </Select>
          </Field>
          <Field label="Quantity">
            <Input type="number" min={0} value={form.quantity} onChange={(e) => set('quantity', Number(e.target.value))} />
          </Field>
          <Field label="MOQ (Min. Order Qty)" hint="0 = no minimum">
            <Input type="number" min={0} value={form.moq} onChange={(e) => set('moq', Number(e.target.value))} />
          </Field>
          <Field label="Linked Deal" className="sm:col-span-3">
            <Select value={form.dealId} onChange={(e) => set('dealId', e.target.value)}>
              <option value="">— none —</option>
              {customerDeals.map((d) => <option key={d.id} value={d.id}>{d.stage} · {d.id}</option>)}
            </Select>
          </Field>
        </div>

        {/* BOM build-up */}
        <section>
          <h3 className="mb-3 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">BOM Build-up (₹ / unit)</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {(['rawMaterial', 'conversion', 'consumables', 'packaging', 'freight'] as (keyof BomBuildUp)[]).map((k) => (
              <Field key={k} label={k.replace(/([A-Z])/g, ' $1')}>
                <Input type="number" min={0} value={form.bom[k]} onChange={(e) => setBom(k, Number(e.target.value))} />
              </Field>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between rounded-lg bg-primary px-4 py-2.5 text-primary-foreground">
            <span className="font-mono text-[11px] uppercase tracking-wide">Total BOM Cost</span>
            <span className="font-serif text-lg font-semibold">{formatInrFull(bomTotal)}</span>
          </div>
        </section>

        {/* Margin → price */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Target Margin %">
            <Input type="number" min={0} value={form.targetMargin} onChange={(e) => set('targetMargin', Number(e.target.value))} />
          </Field>
          <Field label="Target Selling Price" hint="BOM ÷ (1 − margin)">
            <div className="flex h-8 items-center justify-between rounded-lg border border-input px-2.5">
              <span className="font-mono text-sm font-semibold">{formatInrFull(targetPrice)}</span>
              <button type="button" onClick={applyTarget} className="font-mono text-[10px] uppercase text-muted-foreground hover:text-foreground">use →</button>
            </div>
          </Field>
          <Field label="Final Quoted Price" required>
            <Input type="number" min={0} value={form.finalPrice} onChange={(e) => set('finalPrice', Number(e.target.value))} />
          </Field>
        </section>

        {/* Realized margin + approval routing */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Stat label="Realized Margin" value={`${realized.toFixed(1)}%`} tone={realized >= form.targetMargin ? 'pass' : 'warn'} />
          <Stat label={`Discount vs ₹${listPrice}`} value={`${disc.toFixed(1)}%`} tone={disc > 25 ? 'block' : disc > 10 ? 'warn' : 'pass'} />
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <div className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">Approval Routing</div>
            <Badge tone={tierTone[tier]} className="mt-1.5">{tier}</Badge>
          </div>
        </div>

        {/* Market positioning */}
        <section>
          <h3 className="mb-3 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Market Positioning</h3>
          <div className="mb-3 grid grid-cols-3 gap-3">
            <Field label="Market Low"><Input type="number" min={0} value={form.marketLow} onChange={(e) => set('marketLow', Number(e.target.value))} /></Field>
            <Field label="Market High"><Input type="number" min={0} value={form.marketHigh} onChange={(e) => set('marketHigh', Number(e.target.value))} /></Field>
            <Field label="Customer's Current"><Input type="number" min={0} value={form.customerCurrentPrice} onChange={(e) => set('customerCurrentPrice', Number(e.target.value))} /></Field>
          </div>
          <MarketBand low={form.marketLow} high={form.marketHigh} price={form.finalPrice} competitorPrice={form.customerCurrentPrice} />
          <div className="mt-2 text-right font-mono text-[11px]">
            <span className="text-muted-foreground">Price advantage: </span>
            <span className={cn('font-semibold', advantage >= 0 ? 'text-pass' : 'text-block')}>{advantage.toFixed(1)}%</span>
          </div>
        </section>

        {/* Terms */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Payment Terms">
            <Select value={form.paymentTerms} onChange={(e) => set('paymentTerms', e.target.value as PaymentTerms)}>
              {PAYMENT_TERMS.map((t) => <option key={t}>{t}</option>)}
            </Select>
          </Field>
          <Field label="Delivery Terms">
            <Select value={form.deliveryTerms} onChange={(e) => set('deliveryTerms', e.target.value as DeliveryTerms)}>
              {DELIVERY_TERMS.map((t) => <option key={t}>{t}</option>)}
            </Select>
          </Field>
          <Field label="Validity (days)">
            <Input type="number" min={0} value={form.validityDays} onChange={(e) => set('validityDays', Number(e.target.value))} />
          </Field>
        </section>
      </div>
    </Drawer>
  )
}

function Stat({ label, value, tone }: { label: string; value: string; tone: 'pass' | 'warn' | 'block' }) {
  const cls = { pass: 'text-pass', warn: 'text-warn', block: 'text-block' }[tone]
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <div className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={cn('mt-1 font-serif text-lg font-semibold', cls)}>{value}</div>
    </div>
  )
}
