import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Field } from '@/components/ui/field'
import { Drawer } from '@/components/ui/drawer'
import { toast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'
import { formatInr } from '@/lib/format'
import { estimatedAnnualValue, priceAdvantagePct } from '@/lib/business'
import {
  DEAL_STAGES,
  LOST_REASONS,
  OEM_SEGMENTS,
  SALES_TEAM,
  useCrmStore,
  type Confidence,
  type Deal,
  type DealStage,
  type LostReason,
  type OemSegment,
} from '@/data'

interface Props {
  open: boolean
  onClose: () => void
  deal?: Deal
  defaultCustomerId?: string
}

const CONFIDENCE: Confidence[] = [0, 25, 50, 75, 100]

export function DealFormDrawer({ open, onClose, deal, defaultCustomerId }: Props) {
  const customers = useCrmStore((s) => s.customers)
  const contacts = useCrmStore((s) => s.contacts)
  const products = useCrmStore((s) => s.products)
  const addDeal = useCrmStore((s) => s.addDeal)
  const updateDeal = useCrmStore((s) => s.updateDeal)

  const [form, setForm] = useState(() => {
    if (deal) return { ...deal }
    const c = customers.find((x) => x.id === defaultCustomerId) ?? customers[0]
    const p = products[0]
    return {
      customerId: c?.id ?? '',
      contactId: '',
      segment: c?.segment ?? 'Room AC',
      productId: p?.id ?? '',
      quantity: 1000,
      currentSupplier: '',
      currentSupplierPrice: 0,
      quotedPrice: p?.sellingPrice ?? 0,
      confidence: 50 as Confidence,
      stage: 'Lead - Hot' as DealStage,
      owner: SALES_TEAM[0],
      nextAction: '',
      nextActionDate: '',
      lostReason: undefined as LostReason | undefined,
    }
  })

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const customerContacts = useMemo(
    () => contacts.filter((c) => c.customerId === form.customerId),
    [contacts, form.customerId],
  )

  const annualValue = estimatedAnnualValue(Number(form.quantity), Number(form.quotedPrice))
  const advantage = priceAdvantagePct(Number(form.currentSupplierPrice), Number(form.quotedPrice))

  function onCustomerChange(id: string) {
    const c = customers.find((x) => x.id === id)
    setForm((f) => ({ ...f, customerId: id, segment: c?.segment ?? f.segment, contactId: '' }))
  }
  function onProductChange(id: string) {
    const p = products.find((x) => x.id === id)
    setForm((f) => ({ ...f, productId: id, quotedPrice: p?.sellingPrice ?? f.quotedPrice }))
  }

  function handleSave() {
    if (!form.customerId || !form.productId) {
      toast('Customer and product are required', 'warn')
      return
    }
    if (form.stage === 'Closed Lost' && !form.lostReason) {
      toast('Select a lost reason', 'warn')
      return
    }
    const payload = {
      ...form,
      quantity: Number(form.quantity),
      currentSupplierPrice: Number(form.currentSupplierPrice) || undefined,
      quotedPrice: Number(form.quotedPrice),
      contactId: form.contactId || undefined,
    }
    if (deal) {
      updateDeal(deal.id, payload)
      toast('Deal updated')
    } else {
      addDeal(payload)
      toast('Deal created')
    }
    onClose()
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={deal ? 'Edit Deal' : 'New Deal'}
      subtitle="Opportunity in the Lead → PO pipeline"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>{deal ? 'Save' : 'Create deal'}</Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Customer" required>
            <Select value={form.customerId} onChange={(e) => onCustomerChange(e.target.value)}>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.companyName}</option>)}
            </Select>
          </Field>
          <Field label="Linked Contact">
            <Select value={form.contactId ?? ''} onChange={(e) => set('contactId', e.target.value)}>
              <option value="">— none —</option>
              {customerContacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </Field>
          <Field label="OEM Segment" hint="Defaults from customer — editable">
            <Select value={form.segment} onChange={(e) => set('segment', e.target.value as OemSegment)}>
              {OEM_SEGMENTS.map((s) => <option key={s}>{s}</option>)}
            </Select>
          </Field>
          <Field label="Product / SKU" required>
            <Select value={form.productId} onChange={(e) => onProductChange(e.target.value)}>
              {products.map((p) => <option key={p.id} value={p.id}>{p.modelName} ({p.sku})</option>)}
            </Select>
          </Field>
          <Field label="Annual Quantity">
            <Input type="number" min={0} value={form.quantity} onChange={(e) => set('quantity', Number(e.target.value))} />
          </Field>
          <Field label="Our Quoted Price (₹)">
            <Input type="number" min={0} value={form.quotedPrice} onChange={(e) => set('quotedPrice', Number(e.target.value))} />
          </Field>
          <Field label="Current Supplier">
            <Input value={form.currentSupplier ?? ''} onChange={(e) => set('currentSupplier', e.target.value)} />
          </Field>
          <Field label="Their Price (₹)">
            <Input type="number" min={0} value={form.currentSupplierPrice ?? 0} onChange={(e) => set('currentSupplierPrice', Number(e.target.value))} />
          </Field>
        </div>

        {/* Live auto-calculations */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <div className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">Est. Annual Value</div>
            <div className="mt-1 font-serif text-xl font-semibold">{formatInr(annualValue)}</div>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <div className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">Price Advantage</div>
            <div className={cn('mt-1 font-serif text-xl font-semibold', advantage >= 0 ? 'text-pass' : 'text-block')}>
              {advantage ? `${advantage.toFixed(1)}%` : '—'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Confidence">
            <Select value={String(form.confidence)} onChange={(e) => set('confidence', Number(e.target.value) as Confidence)}>
              {CONFIDENCE.map((c) => <option key={c} value={c}>{c === 0 ? 'Not confident' : `${c}%`}</option>)}
            </Select>
          </Field>
          <Field label="Stage">
            <Select value={form.stage} onChange={(e) => set('stage', e.target.value as DealStage)}>
              {DEAL_STAGES.map((s) => <option key={s}>{s}</option>)}
            </Select>
          </Field>
          {form.stage === 'Closed Lost' && (
            <Field label="Lost Reason" required hint="Why was this deal lost?">
              <Select value={form.lostReason ?? ''} onChange={(e) => set('lostReason', (e.target.value || undefined) as LostReason | undefined)}>
                <option value="">— select —</option>
                {LOST_REASONS.map((r) => <option key={r}>{r}</option>)}
              </Select>
            </Field>
          )}
          <Field label="Deal Owner">
            <Select value={form.owner} onChange={(e) => set('owner', e.target.value)}>
              {SALES_TEAM.map((o) => <option key={o}>{o}</option>)}
            </Select>
          </Field>
          <Field label="Next Action Date">
            <Input type="date" value={form.nextActionDate ?? ''} onChange={(e) => set('nextActionDate', e.target.value)} />
          </Field>
          <Field label="Next Action" className="sm:col-span-2">
            <Input value={form.nextAction ?? ''} onChange={(e) => set('nextAction', e.target.value)} />
          </Field>
        </div>
      </div>
    </Drawer>
  )
}
