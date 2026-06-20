import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Field } from '@/components/ui/field'
import { Drawer } from '@/components/ui/drawer'
import { toast } from '@/components/ui/toast'
import {
  READINESS_CATEGORIES,
  READINESS_STATUSES,
  SALES_TEAM,
  useCrmStore,
  customerName,
  productName,
  type ReadinessStatus,
} from '@/data'

interface Props {
  open: boolean
  onClose: () => void
  defaultDealId?: string
}

const OWNERS = [...SALES_TEAM, 'Production', 'Ops', 'Purchase', 'R&D', 'Quality']

export function ReadinessItemDrawer({ open, onClose, defaultDealId }: Props) {
  const deals = useCrmStore((s) => s.deals)
  const addReadinessItem = useCrmStore((s) => s.addReadinessItem)

  const openDeals = deals.filter((d) => d.stage !== 'Closed Lost')

  const [form, setForm] = useState({
    dealId: defaultDealId ?? openDeals[0]?.id ?? '',
    category: READINESS_CATEGORIES[0],
    detail: '',
    status: 'Not Started' as ReadinessStatus,
    owner: '',
    targetDate: '',
  })

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleSave() {
    if (!form.dealId) {
      toast('Select a deal', 'warn')
      return
    }
    addReadinessItem({
      dealId: form.dealId,
      category: form.category,
      detail: form.detail || undefined,
      status: form.status,
      owner: form.owner || undefined,
      targetDate: form.targetDate ? new Date(form.targetDate).toISOString() : undefined,
    })
    toast('Readiness item added')
    onClose()
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Add Readiness Item"
      subtitle="Track internal preparedness to fulfil a deal"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Add item</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Deal" required className="sm:col-span-2">
          <Select value={form.dealId} onChange={(e) => set('dealId', e.target.value)}>
            {openDeals.map((d) => (
              <option key={d.id} value={d.id}>{customerName(d.customerId)} · {productName(d.productId)} · {d.stage}</option>
            ))}
          </Select>
        </Field>
        <Field label="Category">
          <Select value={form.category} onChange={(e) => set('category', e.target.value)}>
            {READINESS_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </Select>
        </Field>
        <Field label="Status">
          <Select value={form.status} onChange={(e) => set('status', e.target.value as ReadinessStatus)}>
            {READINESS_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </Select>
        </Field>
        <Field label="Owner">
          <Select value={form.owner} onChange={(e) => set('owner', e.target.value)}>
            <option value="">— unassigned —</option>
            {OWNERS.map((o) => <option key={o}>{o}</option>)}
          </Select>
        </Field>
        <Field label="Target Date">
          <Input type="date" value={form.targetDate} onChange={(e) => set('targetDate', e.target.value)} />
        </Field>
        <Field label="Detail" className="sm:col-span-2">
          <Input value={form.detail} onChange={(e) => set('detail', e.target.value)} placeholder="e.g. Fixture for PCB assembly" />
        </Field>
      </div>
    </Drawer>
  )
}
