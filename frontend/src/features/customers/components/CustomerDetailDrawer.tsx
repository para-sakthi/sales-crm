import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Drawer } from '@/components/ui/drawer'
import { useDisclosure } from '@/components/ui/use-disclosure'
import { toast } from '@/components/ui/toast'
import { formatInr, formatDate } from '@/lib/format'
import { productName, useCrmStore, type Contact, type Customer, type Deal } from '@/data'
import { ContactFormDrawer } from '@/features/contacts'
import { DealFormDrawer } from '@/features/deals'
import { CustomerFormDrawer } from './CustomerFormDrawer'

interface Props {
  customer: Customer
  open: boolean
  onClose: () => void
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5">
      <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-right text-sm font-medium">{value}</span>
    </div>
  )
}

function SectionHead({ title, count, onAdd }: { title: string; count: number; onAdd: () => void }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <h3 className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
        {title} ({count})
      </h3>
      <Button variant="outline" size="sm" onClick={onAdd}>
        <Plus className="size-3.5" /> Add
      </Button>
    </div>
  )
}

export function CustomerDetailDrawer({ customer: initial, open, onClose }: Props) {
  // Re-read from the store so edits made here reflect immediately.
  const customer = useCrmStore((s) => s.customers).find((c) => c.id === initial.id) ?? initial
  // Select the raw arrays (stable refs) and derive in render — filtering inside
  // the selector would return a new array each call and loop useSyncExternalStore.
  const contacts = useCrmStore((s) => s.contacts).filter((c) => c.customerId === customer.id)
  const deals = useCrmStore((s) => s.deals).filter((d) => d.customerId === customer.id)
  const deleteContact = useCrmStore((s) => s.deleteContact)
  const deleteDeal = useCrmStore((s) => s.deleteDeal)

  const editPanel = useDisclosure<Customer>()
  const contactPanel = useDisclosure<Contact>()
  const dealPanel = useDisclosure<Deal>()

  function removeContact(c: Contact) {
    if (window.confirm(`Remove contact "${c.name}"?`)) {
      deleteContact(c.id)
      toast('Contact removed')
    }
  }
  function removeDeal(d: Deal) {
    if (window.confirm(`Remove this ${d.stage} deal?`)) {
      deleteDeal(d.id)
      toast('Deal removed')
    }
  }

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        title={customer.companyName}
        subtitle={`${customer.segment} · ${customer.city}`}
        footer={
          <Button onClick={() => editPanel.show(customer)}>
            <Pencil className="size-4" />
            Edit
          </Button>
        }
      >
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Badge tone="ink">Priority {customer.priority}</Badge>
            <Badge>{customer.tier}</Badge>
            <Badge tone={customer.vendorStatus === 'Approved' ? 'pass' : 'warn'}>
              Vendor: {customer.vendorStatus}
            </Badge>
            {customer.billingState !== customer.shippingState && <Badge tone="warn">Inter-state</Badge>}
          </div>

          <section className="rounded-xl border border-border p-4">
            <Row label="Account Owner" value={customer.accountOwner} />
            <Row label="Annual Potential" value={formatInr(customer.annualPotential)} />
            {customer.revenueRange && <Row label="Revenue Range" value={customer.revenueRange} />}
            {!!customer.productionCapacity && <Row label="Production Capacity" value={`${customer.productionCapacity.toLocaleString('en-IN')} /yr`} />}
            <Row label="GSTIN" value={<span className="font-mono">{customer.gstin || '—'}</span>} />
            <Row label="Lead Source" value={customer.leadSource} />
            <Row label="Billing State" value={customer.billingState} />
            <Row label="Shipping State" value={customer.shippingState} />
            <Row label="Plant Locations" value={customer.plantLocations || '—'} />
            {customer.vendorCode && <Row label="Vendor Code" value={customer.vendorCode} />}
            <Row label="Added" value={formatDate(customer.createdAt)} />
          </section>

          {customer.tags && customer.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {customer.tags.map((t) => <Badge key={t} tone="outline">{t}</Badge>)}
            </div>
          )}

          {customer.notes && (
            <section>
              <h3 className="mb-1.5 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">Notes</h3>
              <p className="text-sm text-muted-foreground">{customer.notes}</p>
            </section>
          )}

          <section>
            <SectionHead title="Contacts" count={contacts.length} onAdd={() => contactPanel.show()} />
            {contacts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No contacts yet.</p>
            ) : (
              <div className="grid gap-1.5">
                {contacts.map((c) => (
                  <div key={c.id} className="group flex items-center gap-2 rounded-lg border border-border px-3 py-2">
                    <button type="button" onClick={() => contactPanel.show(c)} className="min-w-0 flex-1 text-left">
                      <div className="text-sm font-medium">
                        {c.name} {c.isPrimary && <Badge tone="pass" className="ml-1">Primary</Badge>}
                      </div>
                      <div className="font-mono text-[11px] text-muted-foreground">{c.designation} · {c.department}</div>
                    </button>
                    <Badge tone="outline">{c.buyingRole}</Badge>
                    <button type="button" onClick={() => removeContact(c)} aria-label="Remove contact"
                      className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-block">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <SectionHead title="Deals" count={deals.length} onAdd={() => dealPanel.show()} />
            {deals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No deals yet.</p>
            ) : (
              <div className="grid gap-1.5">
                {deals.map((d) => (
                  <div key={d.id} className="group flex items-center gap-2 rounded-lg border border-border px-3 py-2">
                    <button type="button" onClick={() => dealPanel.show(d)} className="min-w-0 flex-1 text-left">
                      <div className="text-sm font-medium">{d.stage}</div>
                      <div className="font-mono text-[11px] text-muted-foreground">{productName(d.productId)}</div>
                    </button>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {d.quantity.toLocaleString('en-IN')} u · {formatInr(d.quantity * d.quotedPrice)}
                    </span>
                    <button type="button" onClick={() => removeDeal(d)} aria-label="Remove deal"
                      className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-block">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </Drawer>

      {editPanel.mounted && (
        <CustomerFormDrawer
          key={editPanel.data?.id}
          open={editPanel.open}
          onClose={editPanel.close}
          customer={editPanel.data}
        />
      )}
      {contactPanel.mounted && (
        <ContactFormDrawer
          key={contactPanel.data?.id ?? 'new'}
          open={contactPanel.open}
          onClose={contactPanel.close}
          contact={contactPanel.data}
          defaultCustomerId={customer.id}
        />
      )}
      {dealPanel.mounted && (
        <DealFormDrawer
          key={dealPanel.data?.id ?? 'new'}
          open={dealPanel.open}
          onClose={dealPanel.close}
          deal={dealPanel.data}
          defaultCustomerId={customer.id}
        />
      )}
    </>
  )
}
