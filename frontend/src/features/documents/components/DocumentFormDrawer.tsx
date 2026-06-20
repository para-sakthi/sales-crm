import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Field } from '@/components/ui/field'
import { Drawer } from '@/components/ui/drawer'
import { toast } from '@/components/ui/toast'
import {
  useCrmStore,
  type DocDirection,
  type DocStatus,
  type DocType,
} from '@/data'

interface Props {
  open: boolean
  onClose: () => void
}

const TYPES: DocType[] = [
  'NDA (Mutual)', 'NDA (One-way)', 'Technical Spec Sheet', 'Product Datasheet',
  'Vendor Registration Form', 'BIS Certificate', 'Test Report', 'Brochure/Catalog', 'Other',
]
const DIRECTIONS: DocDirection[] = ['Sent', 'Received']
const STATUSES: DocStatus[] = ['Draft', 'Sent', 'Signed', 'Expired']

export function DocumentFormDrawer({ open, onClose }: Props) {
  const customers = useCrmStore((s) => s.customers)
  const deals = useCrmStore((s) => s.deals)
  const addDocument = useCrmStore((s) => s.addDocument)

  const [form, setForm] = useState({
    customerId: customers[0]?.id ?? '',
    dealId: '',
    type: 'NDA (Mutual)' as DocType,
    direction: 'Sent' as DocDirection,
    sentReceivedDate: '',
    status: 'Draft' as DocStatus,
    version: 1,
    validityDate: '',
    signedCopy: false,
    fileName: '',
    remarks: '',
  })

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const customerDeals = useMemo(() => deals.filter((d) => d.customerId === form.customerId), [deals, form.customerId])

  function handleSave() {
    if (!form.fileName.trim()) {
      toast('File name is required', 'warn')
      return
    }
    addDocument({
      ...form,
      dealId: form.dealId || undefined,
      validityDate: form.validityDate ? new Date(form.validityDate).toISOString() : undefined,
    })
    toast('Document recorded')
    onClose()
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Record Document"
      subtitle="NDA & document exchange tracking"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Customer">
          <Select value={form.customerId} onChange={(e) => set('customerId', e.target.value)}>
            {customers.map((c) => <option key={c.id} value={c.id}>{c.companyName}</option>)}
          </Select>
        </Field>
        <Field label="Linked Deal">
          <Select value={form.dealId} onChange={(e) => set('dealId', e.target.value)}>
            <option value="">— none —</option>
            {customerDeals.map((d) => <option key={d.id} value={d.id}>{d.stage} · {d.id}</option>)}
          </Select>
        </Field>
        <Field label="Document Type">
          <Select value={form.type} onChange={(e) => set('type', e.target.value as DocType)}>
            {TYPES.map((t) => <option key={t}>{t}</option>)}
          </Select>
        </Field>
        <Field label="Direction">
          <Select value={form.direction} onChange={(e) => set('direction', e.target.value as DocDirection)}>
            {DIRECTIONS.map((d) => <option key={d}>{d}</option>)}
          </Select>
        </Field>
        <Field label="Status">
          <Select value={form.status} onChange={(e) => set('status', e.target.value as DocStatus)}>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </Select>
        </Field>
        <Field label="Version">
          <Input type="number" min={1} value={form.version} onChange={(e) => set('version', Number(e.target.value))} />
        </Field>
        <Field label="Validity Date">
          <Input type="date" value={form.validityDate} onChange={(e) => set('validityDate', e.target.value)} />
        </Field>
        <Field label="Date Sent / Received">
          <Input
            type="date"
            value={form.sentReceivedDate ?? ''}
            onChange={(e) => set('sentReceivedDate', e.target.value)}
          />
        </Field>
        <Field label="File" hint="Upload wiring comes with the backend">
          <Input value={form.fileName} onChange={(e) => set('fileName', e.target.value)} placeholder="Voltas_NDA.pdf" />
        </Field>
        <Field label="Remarks" className="sm:col-span-2">
          <Input
            value={form.remarks ?? ''}
            onChange={(e) => set('remarks', e.target.value)}
            placeholder="Any notes about this document"
          />
        </Field>
        <label className="flex items-center gap-2 sm:col-span-2">
          <input type="checkbox" checked={form.signedCopy} onChange={(e) => set('signedCopy', e.target.checked)} className="size-4 accent-[var(--ink)]" />
          <span className="text-sm font-medium">Signed copy on file</span>
        </label>
      </div>
    </Drawer>
  )
}
