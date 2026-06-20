import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Field } from '@/components/ui/field'
import { Drawer } from '@/components/ui/drawer'
import { toast } from '@/components/ui/toast'
import { todayIso } from '@/lib/format'
import { nextDocNumber } from '@/lib/business'
import { useCrmStore } from '@/data'

interface Props {
  open: boolean
  onClose: () => void
}

export function SampleFormDrawer({ open, onClose }: Props) {
  const customers = useCrmStore((s) => s.customers)
  const deals = useCrmStore((s) => s.deals)
  const products = useCrmStore((s) => s.products)
  const samples = useCrmStore((s) => s.samples)
  const addSample = useCrmStore((s) => s.addSample)

  const [form, setForm] = useState({
    customerId: customers[0]?.id ?? '',
    dealId: '',
    productId: products[0]?.id ?? '',
    quantitySent: 10,
    dispatchDate: todayIso().slice(0, 10),
    deliveryConfirmedDate: '',
    courier: '',
    tracking: '',
    rndCoordinator: '',
  })

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const customerDeals = useMemo(() => deals.filter((d) => d.customerId === form.customerId), [deals, form.customerId])
  const nextId = nextDocNumber('SAM', samples.map((s) => s.id))

  function handleSave() {
    if (!form.dealId) {
      toast('Link the sample to a deal', 'warn')
      return
    }
    addSample({
      customerId: form.customerId,
      dealId: form.dealId,
      productId: form.productId,
      quantitySent: Number(form.quantitySent),
      dispatchDate: new Date(form.dispatchDate).toISOString(),
      courier: form.courier || undefined,
      tracking: form.tracking || undefined,
      delivered: false,
      status: 'Not Started',
      testTypes: [],
      issues: [],
      rndCoordinator: form.rndCoordinator || undefined,
      version: 1,
    })
    toast(`Sample ${nextId} created`)
    onClose()
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="New Sample Submission"
      subtitle={`Auto ID: ${nextId}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Create sample</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Customer">
          <Select value={form.customerId} onChange={(e) => set('customerId', e.target.value)}>
            {customers.map((c) => <option key={c.id} value={c.id}>{c.companyName}</option>)}
          </Select>
        </Field>
        <Field label="Linked Deal" required>
          <Select value={form.dealId} onChange={(e) => set('dealId', e.target.value)}>
            <option value="">— select —</option>
            {customerDeals.map((d) => <option key={d.id} value={d.id}>{d.stage} · {d.id}</option>)}
          </Select>
        </Field>
        <Field label="Product / SKU">
          <Select value={form.productId} onChange={(e) => set('productId', e.target.value)}>
            {products.map((p) => <option key={p.id} value={p.id}>{p.modelName} ({p.sku})</option>)}
          </Select>
        </Field>
        <Field label="Quantity Sent">
          <Input type="number" min={0} value={form.quantitySent} onChange={(e) => set('quantitySent', Number(e.target.value))} />
        </Field>
        <Field label="Dispatch Date">
          <Input type="date" value={form.dispatchDate} onChange={(e) => set('dispatchDate', e.target.value)} />
        </Field>
        <Field label="Delivery Confirmed Date" hint="Fill when customer acknowledges receipt">
          <Input type="date" value={form.deliveryConfirmedDate ?? ''} onChange={(e) => set('deliveryConfirmedDate', e.target.value)} />
        </Field>
        <Field label="R&D Coordinator">
          <Input value={form.rndCoordinator} onChange={(e) => set('rndCoordinator', e.target.value)} />
        </Field>
        <Field label="Courier">
          <Input value={form.courier} onChange={(e) => set('courier', e.target.value)} />
        </Field>
        <Field label="Tracking #">
          <Input value={form.tracking} onChange={(e) => set('tracking', e.target.value)} />
        </Field>
      </div>
    </Drawer>
  )
}
