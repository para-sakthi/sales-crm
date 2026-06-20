import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Field } from '@/components/ui/field'
import { Drawer } from '@/components/ui/drawer'
import { toast } from '@/components/ui/toast'
import { isValidGstin } from '@/lib/business'
import {
  INDIAN_STATES,
  LEAD_SOURCES,
  OEM_SEGMENTS,
  REVENUE_RANGES,
  SALES_TEAM,
  useCrmStore,
  type Customer,
  type CustomerTier,
  type OemSegment,
  type Priority,
  type RevenueRange,
  type VendorStatus,
} from '@/data'

const PRIORITY_LABELS: Record<Priority, string> = {
  A: 'A (Strategic)',
  B: 'B (High)',
  C: 'C (Regular)',
}

interface Props {
  open: boolean
  onClose: () => void
  /** When set, the drawer edits this customer; otherwise it creates one. */
  customer?: Customer
}

type FormState = Omit<Customer, 'id' | 'createdAt' | 'tags'> & { tags: string }

const empty: FormState = {
  companyName: '', segment: 'Room AC', leadSource: 'Trade Expo', city: '',
  billingState: 'Maharashtra', shippingState: 'Maharashtra', gstin: '', website: '',
  priority: 'B', tier: 'Tier 2', accountOwner: SALES_TEAM[0], vendorStatus: 'Not Started',
  vendorCode: '', annualPotential: 0, plantLocations: '', tags: '', notes: '',
  revenueRange: '< 100 Cr', productionCapacity: 0, registeredAddress: '', factoryAddress: '',
  regSubmittedDate: '', expectedApprovalDate: '', vendorRemarks: '',
}

export function CustomerFormDrawer({ open, onClose, customer }: Props) {
  const addCustomer = useCrmStore((s) => s.addCustomer)
  const updateCustomer = useCrmStore((s) => s.updateCustomer)
  const [form, setForm] = useState<FormState>(
    customer ? { ...customer, tags: customer.tags?.join(', ') ?? '' } : empty,
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!form.companyName.trim()) e.companyName = 'Company name is required'
    if (!form.city.trim()) e.city = 'City is required'
    if (form.gstin && !isValidGstin(form.gstin)) e.gstin = 'Invalid GSTIN format'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSave() {
    if (!validate()) return
    const payload = {
      ...form,
      gstin: form.gstin.trim().toUpperCase(),
      annualPotential: Number(form.annualPotential) || 0,
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    }
    if (customer) {
      updateCustomer(customer.id, payload)
      toast('Customer updated')
    } else {
      addCustomer(payload)
      toast('Customer created')
    }
    onClose()
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={customer ? 'Edit Customer' : 'New Customer'}
      subtitle="OEM company profile, classification & vendor registration"
      width="xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{customer ? 'Save changes' : 'Create customer'}</Button>
        </>
      }
    >
      <div className="space-y-6">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Company Name" required error={errors.companyName} className="sm:col-span-2">
            <Input value={form.companyName} onChange={(e) => set('companyName', e.target.value)} />
          </Field>
          <Field label="OEM Segment">
            <Select value={form.segment} onChange={(e) => set('segment', e.target.value as OemSegment)}>
              {OEM_SEGMENTS.map((s) => <option key={s}>{s}</option>)}
            </Select>
          </Field>
          <Field label="Lead Source">
            <Select value={form.leadSource} onChange={(e) => set('leadSource', e.target.value)}>
              {LEAD_SOURCES.map((s) => <option key={s}>{s}</option>)}
            </Select>
          </Field>
          <Field label="City" required error={errors.city}>
            <Input value={form.city} onChange={(e) => set('city', e.target.value)} />
          </Field>
          <Field label="Website">
            <Input value={form.website ?? ''} onChange={(e) => set('website', e.target.value)} placeholder="example.com" />
          </Field>
          <Field label="Annual Revenue Range">
            <Select value={form.revenueRange ?? ''} onChange={(e) => set('revenueRange', e.target.value as RevenueRange)}>
              {REVENUE_RANGES.map((r) => <option key={r}>{r}</option>)}
            </Select>
          </Field>
          <Field label="Production Capacity (units/yr)">
            <Input type="number" min={0} value={form.productionCapacity ?? 0} onChange={(e) => set('productionCapacity', Number(e.target.value))} />
          </Field>
          <Field label="Registered Office Address" className="sm:col-span-2">
            <Textarea value={form.registeredAddress ?? ''} onChange={(e) => set('registeredAddress', e.target.value)} className="min-h-16" />
          </Field>
          <Field label="Factory / Plant Address" className="sm:col-span-2">
            <Textarea value={form.factoryAddress ?? ''} onChange={(e) => set('factoryAddress', e.target.value)} className="min-h-16" />
          </Field>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="GSTIN" hint="15-char format — used for GST state detection" error={errors.gstin}>
            <Input value={form.gstin} onChange={(e) => set('gstin', e.target.value.toUpperCase())} placeholder="27AAACV1234A1Z5" />
          </Field>
          <Field label="Plant Locations">
            <Input value={form.plantLocations ?? ''} onChange={(e) => set('plantLocations', e.target.value)} />
          </Field>
          <Field label="Billing State">
            <Select value={form.billingState} onChange={(e) => set('billingState', e.target.value)}>
              {INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}
            </Select>
          </Field>
          <Field label="Shipping State" hint="Different from billing → IGST on PFI">
            <Select value={form.shippingState} onChange={(e) => set('shippingState', e.target.value)}>
              {INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}
            </Select>
          </Field>
        </section>

        <section>
          <h3 className="mb-3 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            Classification
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Priority">
              <Select value={form.priority} onChange={(e) => set('priority', e.target.value as Priority)}>
                {(['A', 'B', 'C'] as Priority[]).map((p) => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
              </Select>
            </Field>
            <Field label="Customer Tier">
              <Select value={form.tier} onChange={(e) => set('tier', e.target.value as CustomerTier)}>
                {(['Tier 1', 'Tier 2', 'Tier 3'] as CustomerTier[]).map((t) => <option key={t}>{t}</option>)}
              </Select>
            </Field>
            <Field label="Account Owner">
              <Select value={form.accountOwner} onChange={(e) => set('accountOwner', e.target.value)}>
                {SALES_TEAM.map((o) => <option key={o}>{o}</option>)}
              </Select>
            </Field>
            <Field label="Annual Potential (₹)">
              <Input type="number" min={0} value={form.annualPotential} onChange={(e) => set('annualPotential', Number(e.target.value))} />
            </Field>
            <Field label="Tags" hint="Comma separated" className="sm:col-span-2">
              <Input value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="Strategic, High Volume" />
            </Field>
          </div>
        </section>

        <section>
          <h3 className="mb-3 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            Vendor Registration
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Vendor Status">
              <Select value={form.vendorStatus} onChange={(e) => set('vendorStatus', e.target.value as VendorStatus)}>
                {(['Not Started', 'In Progress', 'Approved', 'Rejected'] as VendorStatus[]).map((v) => <option key={v}>{v}</option>)}
              </Select>
            </Field>
            <Field label="Vendor Code" hint="Assigned on approval">
              <Input value={form.vendorCode ?? ''} onChange={(e) => set('vendorCode', e.target.value)} />
            </Field>
            <Field label="Registration Submitted Date">
              <Input type="date" value={form.regSubmittedDate ?? ''} onChange={(e) => set('regSubmittedDate', e.target.value)} />
            </Field>
            <Field label="Expected Approval Date">
              <Input type="date" value={form.expectedApprovalDate ?? ''} onChange={(e) => set('expectedApprovalDate', e.target.value)} />
            </Field>
            <Field label="Registration Documents" hint="Enter file name(s) — upload wires in with backend">
              <Input
                value={form.registrationDocsFileName ?? ''}
                onChange={(e) => set('registrationDocsFileName', e.target.value)}
                placeholder="VendorForm.pdf, GSTIN_cert.pdf"
              />
            </Field>
            <Field label="Registration Remarks" className="sm:col-span-2">
              <Textarea value={form.vendorRemarks ?? ''} onChange={(e) => set('vendorRemarks', e.target.value)} className="min-h-16" />
            </Field>
          </div>
        </section>

        <Field label="Notes">
          <Textarea value={form.notes ?? ''} onChange={(e) => set('notes', e.target.value)} />
        </Field>
      </div>
    </Drawer>
  )
}
