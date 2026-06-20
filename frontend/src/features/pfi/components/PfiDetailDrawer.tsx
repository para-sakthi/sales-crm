import { useState } from 'react'
import { CheckCircle2, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Field } from '@/components/ui/field'
import { Drawer } from '@/components/ui/drawer'
import { toast } from '@/components/ui/toast'
import { formatInrFull, amountInWords } from '@/lib/format'
import { computePfiTotals } from '@/lib/business'
import { useCrmStore, productName, type Pfi } from '@/data'

interface Props {
  pfi: Pfi
  open: boolean
  onClose: () => void
}

const STEPS = [
  { key: 'rep', label: 'Sales Rep', status: 'Pending Rep' },
  { key: 'commercial', label: 'Commercial Manager', status: 'Pending Commercial' },
  { key: 'management', label: 'Management', status: 'Pending Management' },
] as const

export function PfiDetailDrawer({ pfi, open, onClose }: Props) {
  const customers = useCrmStore((s) => s.customers)
  const updatePfi = useCrmStore((s) => s.updatePfi)

  const customer = customers.find((c) => c.id === pfi.customerId)
  const sameState = customer ? customer.billingState === customer.shippingState : true
  const totals = computePfiTotals(pfi.lineItems, sameState)

  const [rejectionReason, setRejectionReason] = useState(pfi.rejectionReason ?? '')
  const [sentToCustomer, setSentToCustomer] = useState(pfi.sentToCustomer ?? false)
  const [sentDate, setSentDate] = useState(pfi.sentDate?.slice(0, 10) ?? '')
  const [customerAck, setCustomerAck] = useState<'Yes' | 'No' | 'Pending'>(pfi.customerAck ?? 'Pending')

  function approveStep(key: 'rep' | 'commercial' | 'management') {
    const approvals = { ...pfi.approvals, [key]: true }
    let status = pfi.status
    if (key === 'rep') status = 'Pending Commercial'
    if (key === 'commercial') status = 'Pending Management'
    if (key === 'management') status = 'Approved'
    updatePfi(pfi.id, { approvals, status })
    toast(key === 'management' ? 'PFI fully approved' : 'Approval recorded')
  }

  function rejectPfi() {
    if (!rejectionReason.trim()) { toast('Enter a rejection reason', 'warn'); return }
    updatePfi(pfi.id, { status: 'Rejected', rejectionReason })
    toast('PFI rejected', 'warn')
  }

  function saveSentTracking() {
    updatePfi(pfi.id, {
      sentToCustomer,
      sentDate: sentDate ? new Date(sentDate).toISOString() : undefined,
      customerAck,
    })
    toast('Sent tracking updated')
  }

  // The next step that can be actioned.
  const nextStepIndex = STEPS.findIndex((s) => !pfi.approvals[s.key])

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={pfi.id}
      subtitle={`${customer?.companyName ?? ''} · from ${pfi.quoteId}`}
      width="xl"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Badge tone={pfi.status === 'Approved' ? 'pass' : 'warn'}>{pfi.status}</Badge>
          <Badge tone={sameState ? 'pass' : 'warn'}>{sameState ? 'CGST + SGST' : 'IGST'}</Badge>
        </div>

        {/* Approval chain */}
        <section>
          <h3 className="mb-3 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">3-Step Approval</h3>
          <div className="grid gap-2">
            {STEPS.map((step, i) => {
              const done = pfi.approvals[step.key]
              const actionable = i === nextStepIndex
              return (
                <div key={step.key} className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    {done ? <CheckCircle2 className="size-4 text-pass" /> : <Circle className="size-4 text-muted-foreground" />}
                    <span className="text-sm font-medium">{step.label}</span>
                  </div>
                  {done ? (
                    <Badge tone="pass">Approved</Badge>
                  ) : actionable ? (
                    <Button size="sm" onClick={() => approveStep(step.key)}>Approve</Button>
                  ) : (
                    <span className="font-mono text-[11px] text-muted-foreground">waiting</span>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* Line items */}
        <section>
          <h3 className="mb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Line Items</h3>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="p-2 text-left">Item</th>
                  <th className="p-2 text-left">HSN</th>
                  <th className="p-2 text-right">Qty</th>
                  <th className="p-2 text-right">Rate</th>
                  <th className="p-2 text-right">GST</th>
                </tr>
              </thead>
              <tbody>
                {pfi.lineItems.map((l, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="p-2">{productName(l.productId)}</td>
                    <td className="p-2 font-mono text-xs">{l.hsnCode}</td>
                    <td className="p-2 text-right font-mono">{l.quantity.toLocaleString('en-IN')}</td>
                    <td className="p-2 text-right font-mono">{formatInrFull(l.unitPrice)}</td>
                    <td className="p-2 text-right font-mono">{l.gstRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Rejection */}
        {pfi.status !== 'Approved' && (
          <section>
            <h3 className="mb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Rejection</h3>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Reason for rejection"
                />
              </div>
              <Button variant="outline" onClick={rejectPfi} className="shrink-0 text-block">
                Reject PFI
              </Button>
            </div>
            {pfi.rejectionReason && (
              <p className="mt-1.5 text-xs text-block">Rejected: {pfi.rejectionReason}</p>
            )}
          </section>
        )}

        {/* Sent to Customer Tracking */}
        <section>
          <h3 className="mb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Customer Tracking</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
              <input
                type="checkbox"
                checked={sentToCustomer}
                onChange={(e) => setSentToCustomer(e.target.checked)}
                className="size-4 accent-[var(--ink)]"
              />
              <span className="text-sm font-medium">PFI Sent to Customer</span>
            </label>
            <Field label="Sent Date">
              <Input type="date" value={sentDate} onChange={(e) => setSentDate(e.target.value)} />
            </Field>
            <Field label="Customer Acknowledgment">
              <Select value={customerAck} onChange={(e) => setCustomerAck(e.target.value as 'Yes' | 'No' | 'Pending')}>
                <option>Pending</option>
                <option>Yes</option>
                <option>No</option>
              </Select>
            </Field>
          </div>
          <div className="mt-2 flex justify-end">
            <Button variant="outline" size="sm" onClick={saveSentTracking}>Save Tracking</Button>
          </div>
        </section>

        {/* Totals */}
        <section className="rounded-xl border border-border p-4">
          <Row label="Taxable Value" value={formatInrFull(totals.taxable)} />
          {sameState ? (
            <>
              <Row label="CGST" value={formatInrFull(totals.cgst)} />
              <Row label="SGST" value={formatInrFull(totals.sgst)} />
            </>
          ) : (
            <Row label="IGST" value={formatInrFull(totals.igst)} />
          )}
          <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
            <span className="font-semibold">Grand Total</span>
            <span className="font-serif text-xl font-semibold">{formatInrFull(totals.grandTotal)}</span>
          </div>
          <p className="mt-2 font-mono text-[11px] italic text-muted-foreground">{amountInWords(totals.grandTotal)}</p>
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
