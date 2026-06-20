import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Field } from '@/components/ui/field'
import { Drawer } from '@/components/ui/drawer'
import { toast } from '@/components/ui/toast'
import {
  BUYING_ROLES,
  DEPARTMENTS,
  useCrmStore,
  type BuyingRole,
  type Contact,
  type Department,
} from '@/data'

interface Props {
  open: boolean
  onClose: () => void
  contact?: Contact
  defaultCustomerId?: string
}

type FormState = Omit<Contact, 'id'>

export function ContactFormDrawer({ open, onClose, contact, defaultCustomerId }: Props) {
  const customers = useCrmStore((s) => s.customers)
  const addContact = useCrmStore((s) => s.addContact)
  const updateContact = useCrmStore((s) => s.updateContact)

  const [form, setForm] = useState<FormState>(
    contact ?? {
      customerId: defaultCustomerId ?? customers[0]?.id ?? '',
      name: '',
      designation: '',
      department: 'Purchase',
      mobile: '',
      email: '',
      officeLandline: '',
      buyingRole: 'Influencer',
      reportsTo: '',
      isPrimary: false,
      linkedin: '',
      birthday: '',
      anniversary: '',
      notes: '',
    },
  )
  const [error, setError] = useState('')

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleSave() {
    if (!form.name.trim() || !form.customerId) {
      setError('Name and customer are required')
      return
    }
    if (contact) {
      updateContact(contact.id, form)
      toast('Contact updated')
    } else {
      addContact(form)
      toast('Contact added')
    }
    onClose()
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={contact ? 'Edit Contact' : 'New Contact'}
      subtitle="Contact within an OEM customer's buying group"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{contact ? 'Save' : 'Add contact'}</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Customer" required className="sm:col-span-2">
          <Select value={form.customerId} onChange={(e) => set('customerId', e.target.value)}>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.companyName}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Name" required error={error}>
          <Input value={form.name} onChange={(e) => set('name', e.target.value)} />
        </Field>
        <Field label="Designation">
          <Input value={form.designation} onChange={(e) => set('designation', e.target.value)} />
        </Field>

        <Field label="Department">
          <Select
            value={form.department}
            onChange={(e) => set('department', e.target.value as Department)}
          >
            {DEPARTMENTS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </Select>
        </Field>
        <Field label="Role in Buying Decision">
          <Select
            value={form.buyingRole}
            onChange={(e) => set('buyingRole', e.target.value as BuyingRole)}
          >
            {BUYING_ROLES.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </Select>
        </Field>

        <Field label="Mobile">
          <Input value={form.mobile} onChange={(e) => set('mobile', e.target.value)} />
        </Field>
        <Field label="Office / Landline" hint="Optional">
          <Input
            value={form.officeLandline ?? ''}
            onChange={(e) => set('officeLandline', e.target.value)}
            placeholder="+91-22-12345678"
          />
        </Field>

        <Field label="Email">
          <Input
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
          />
        </Field>
        <Field label="Reports To" hint="Manager / superior name">
          <Input
            value={form.reportsTo ?? ''}
            onChange={(e) => set('reportsTo', e.target.value)}
            placeholder="e.g. VP Purchase"
          />
        </Field>

        <Field label="LinkedIn">
          <Input value={form.linkedin ?? ''} onChange={(e) => set('linkedin', e.target.value)} />
        </Field>
        <Field label="Birthday" hint="For relationship building">
          <Input
            type="date"
            value={form.birthday ?? ''}
            onChange={(e) => set('birthday', e.target.value)}
          />
        </Field>

        <Field label="Anniversary" hint="Work or wedding — optional">
          <Input
            type="date"
            value={form.anniversary ?? ''}
            onChange={(e) => set('anniversary', e.target.value)}
          />
        </Field>

        <label className="flex items-center gap-2 sm:col-span-2">
          <input
            type="checkbox"
            checked={form.isPrimary}
            onChange={(e) => set('isPrimary', e.target.checked)}
            className="size-4 accent-[var(--ink)]"
          />
          <span className="text-sm font-medium">Primary contact for this customer</span>
        </label>

        <Field label="Notes about this person" className="sm:col-span-2">
          <Textarea value={form.notes ?? ''} onChange={(e) => set('notes', e.target.value)} />
        </Field>
      </div>
    </Drawer>
  )
}
