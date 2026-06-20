import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Field } from '@/components/ui/field'
import { Drawer } from '@/components/ui/drawer'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/toast'
import { formatInr } from '@/lib/format'
import {
  DISPATCH_STATUSES,
  EXEC_PAYMENT_STATUSES,
  useCrmStore,
  customerName,
  type DispatchStatus,
  type ExecPaymentStatus,
  type OrderExecution,
} from '@/data'

interface Props {
  open: boolean
  onClose: () => void
  order?: OrderExecution
}

export function OrderExecutionDrawer({ open, onClose, order }: Props) {
  const deals = useCrmStore((s) => s.deals)
  const products = useCrmStore((s) => s.products)
  const purchaseOrders = useCrmStore((s) => s.purchaseOrders)
  const orderExecutions = useCrmStore((s) => s.orderExecutions)
  const addOrderExecution = useCrmStore((s) => s.addOrderExecution)
  const updateOrderExecution = useCrmStore((s) => s.updateOrderExecution)

  // Deals eligible for execution: won or PO received, without an order yet.
  const eligibleDeals = useMemo(() => {
    const taken = new Set(orderExecutions.filter((o) => o.id !== order?.id).map((o) => o.dealId))
    return deals.filter(
      (d) => (d.stage === 'PO Received' || d.stage === 'Closed Won') && !taken.has(d.id),
    )
  }, [deals, orderExecutions, order])

  const firstDeal = eligibleDeals[0]
  const [form, setForm] = useState<Omit<OrderExecution, 'id' | 'createdAt'>>(() => {
    if (order) return { ...order }
    const d = firstDeal
    return {
      dealId: d?.id ?? '',
      customerId: d?.customerId ?? '',
      poId: purchaseOrders.find((p) => p.customerId === d?.customerId)?.id,
      productionNotified: false,
      dispatchStatus: 'Pending',
      orderedQty: d?.quantity,
      dispatchedQty: undefined,
      paymentStatus: 'Unpaid',
      invoiceAmount: d ? d.quantity * d.quotedPrice : undefined,
    }
  })

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }
  function setNum<K extends keyof typeof form>(key: K, raw: string) {
    setForm((f) => ({ ...f, [key]: (raw === '' ? undefined : Number(raw)) as (typeof form)[K] }))
  }

  function onDealChange(id: string) {
    const d = deals.find((x) => x.id === id)
    setForm((f) => ({
      ...f,
      dealId: id,
      customerId: d?.customerId ?? f.customerId,
      poId: purchaseOrders.find((p) => p.customerId === d?.customerId)?.id,
      orderedQty: d?.quantity,
      invoiceAmount: d ? d.quantity * d.quotedPrice : f.invoiceAmount,
    }))
  }

  const outstanding = (form.invoiceAmount ?? 0) - (form.amountReceived ?? 0)

  function handleSave() {
    if (!form.dealId) {
      toast('Select an order (deal) to execute', 'warn')
      return
    }
    if (order) {
      updateOrderExecution(order.id, form)
      toast('Order execution updated')
    } else {
      addOrderExecution(form)
      toast('Order execution created')
    }
    onClose()
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={order ? 'Order Execution' : 'New Order Execution'}
      subtitle="Dispatch, invoice & payment tracking for a won order"
      width="xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>{order ? 'Save' : 'Create'}</Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Order context */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {order ? (
            <Field label="Customer">
              <div className="flex h-8 items-center font-medium">{customerName(order.customerId)}</div>
            </Field>
          ) : (
            <Field label="Order (Won / PO-received deal)" required>
              <Select value={form.dealId} onChange={(e) => onDealChange(e.target.value)}>
                {eligibleDeals.length === 0 && <option value="">— no eligible deals —</option>}
                {eligibleDeals.map((d) => (
                  <option key={d.id} value={d.id}>{customerName(d.customerId)} · {productLabel(products, d.productId)}</option>
                ))}
              </Select>
            </Field>
          )}
          <Field label="Linked PO">
            <Select value={form.poId ?? ''} onChange={(e) => set('poId', e.target.value || undefined)}>
              <option value="">— none —</option>
              {purchaseOrders.map((p) => <option key={p.id} value={p.id}>{p.id}</option>)}
            </Select>
          </Field>
        </div>

        <label className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-3 text-sm">
          <input type="checkbox" checked={form.productionNotified} onChange={(e) => set('productionNotified', e.target.checked)} />
          <span>Production planning notified</span>
          {form.productionNotified && <Badge tone="pass" className="ml-auto">Notified</Badge>}
        </label>

        {/* Dispatch */}
        <Section title="Dispatch">
          <Field label="Dispatch Status">
            <Select value={form.dispatchStatus} onChange={(e) => set('dispatchStatus', e.target.value as DispatchStatus)}>
              {DISPATCH_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </Select>
          </Field>
          <Field label="Ordered Qty">
            <Input type="number" min={0} value={form.orderedQty ?? ''} onChange={(e) => setNum('orderedQty', e.target.value)} />
          </Field>
          <Field label="Dispatched Qty">
            <Input type="number" min={0} value={form.dispatchedQty ?? ''} onChange={(e) => setNum('dispatchedQty', e.target.value)} />
          </Field>
          <Field label="Dispatch Date">
            <Input type="date" value={dateInput(form.dispatchDate)} onChange={(e) => set('dispatchDate', isoOrUndef(e.target.value))} />
          </Field>
          <Field label="Delivered Date">
            <Input type="date" value={dateInput(form.deliveredDate)} onChange={(e) => set('deliveredDate', isoOrUndef(e.target.value))} />
          </Field>
          <Field label="Courier">
            <Input value={form.courier ?? ''} onChange={(e) => set('courier', e.target.value)} />
          </Field>
          <Field label="Tracking #">
            <Input value={form.tracking ?? ''} onChange={(e) => set('tracking', e.target.value)} />
          </Field>
        </Section>

        {/* Invoice */}
        <Section title="Invoice">
          <Field label="Invoice Number">
            <Input value={form.invoiceNumber ?? ''} onChange={(e) => set('invoiceNumber', e.target.value)} />
          </Field>
          <Field label="Invoice Date">
            <Input type="date" value={dateInput(form.invoiceDate)} onChange={(e) => set('invoiceDate', isoOrUndef(e.target.value))} />
          </Field>
          <Field label="Invoice Amount (₹)">
            <Input type="number" min={0} value={form.invoiceAmount ?? ''} onChange={(e) => setNum('invoiceAmount', e.target.value)} />
          </Field>
        </Section>

        {/* Payment */}
        <Section title="Payment">
          <Field label="Payment Status">
            <Select value={form.paymentStatus} onChange={(e) => set('paymentStatus', e.target.value as ExecPaymentStatus)}>
              {EXEC_PAYMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </Select>
          </Field>
          <Field label="Amount Received (₹)">
            <Input type="number" min={0} value={form.amountReceived ?? ''} onChange={(e) => setNum('amountReceived', e.target.value)} />
          </Field>
          <Field label="Payment Due Date">
            <Input type="date" value={dateInput(form.paymentDueDate)} onChange={(e) => set('paymentDueDate', isoOrUndef(e.target.value))} />
          </Field>
        </Section>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <div className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">Invoiced</div>
            <div className="mt-1 font-serif text-lg font-semibold">{formatInr(form.invoiceAmount ?? 0)}</div>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <div className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">Outstanding</div>
            <div className={`mt-1 font-serif text-lg font-semibold ${outstanding > 0 ? 'text-warn' : 'text-pass'}`}>{formatInr(Math.max(0, outstanding))}</div>
          </div>
        </div>

        <Field label="Notes">
          <Textarea value={form.notes ?? ''} onChange={(e) => set('notes', e.target.value)} />
        </Field>
      </div>
    </Drawer>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{title}</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">{children}</div>
    </section>
  )
}

function productLabel(products: { id: string; modelName: string }[], id: string): string {
  return products.find((p) => p.id === id)?.modelName ?? 'Order'
}
function dateInput(iso?: string): string {
  return iso ? iso.slice(0, 10) : ''
}
function isoOrUndef(v: string): string | undefined {
  return v ? new Date(v).toISOString() : undefined
}
