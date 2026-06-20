import { useState } from 'react'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Field } from '@/components/ui/field'
import { Drawer } from '@/components/ui/drawer'
import { toast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'
import { formatInrFull } from '@/lib/format'
import { matchPoToPfi, hasAnyMismatch } from '@/lib/business'
import {
  PO_ORDER_TYPES,
  useCrmStore,
  customerName,
  productName,
  type PoLineItem,
  type PoOrderType,
} from '@/data'

interface Props {
  open: boolean
  onClose: () => void
}

export function PoCaptureDrawer({ open, onClose }: Props) {
  const pfis = useCrmStore((s) => s.pfis)
  const addPurchaseOrder = useCrmStore((s) => s.addPurchaseOrder)

  const [pfiId, setPfiId] = useState(pfis[0]?.id ?? '')
  const pfi = pfis.find((p) => p.id === pfiId)

  const [poNumber, setPoNumber] = useState('')
  const [poDate, setPoDate] = useState('')
  const [poType, setPoType] = useState<PoOrderType>('Mass Production')
  const [customerReference, setCustomerReference] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [ackSent, setAckSent] = useState(false)
  const [ackDate, setAckDate] = useState('')
  const [fileName, setFileName] = useState('')
  const [lines, setLines] = useState<PoLineItem[]>(() =>
    (pfis[0]?.lineItems ?? []).map((l) => ({
      description: productName(l.productId),
      quantity: l.quantity,
      unitPrice: l.unitPrice,
    })),
  )
  const [notes, setNotes] = useState('')

  function onPfiChange(id: string) {
    setPfiId(id)
    const p = pfis.find((x) => x.id === id)
    setLines((p?.lineItems ?? []).map((l) => ({
      description: productName(l.productId),
      quantity: l.quantity,
      unitPrice: l.unitPrice,
    })))
  }

  function updateLine(i: number, patch: Partial<PoLineItem>) {
    setLines(lines.map((l, idx) => (idx === i ? { ...l, ...patch } : l)))
  }

  const matches = pfi ? matchPoToPfi(lines, pfi.lineItems) : []
  const anyMismatch = hasAnyMismatch(matches)

  function handleSave() {
    if (!pfi) {
      toast('Select a PFI to match against', 'warn')
      return
    }
    if (!fileName.trim()) {
      toast('Enter the PO file name', 'warn')
      return
    }
    if (anyMismatch && !notes.trim()) {
      toast('Mismatch notes are required', 'warn')
      return
    }
    addPurchaseOrder({
      customerId: pfi.customerId,
      pfiId: pfi.id,
      poNumber: poNumber || undefined,
      poDate: poDate ? new Date(poDate).toISOString() : undefined,
      poType,
      customerReference: customerReference || undefined,
      deliveryAddress: deliveryAddress || undefined,
      ackSent,
      ackDate: ackSent && ackDate ? new Date(ackDate).toISOString() : undefined,
      fileName,
      lineItems: lines,
      status: anyMismatch ? 'Mismatch Flagged' : 'Validated',
      mismatchNotes: anyMismatch ? notes : undefined,
    })
    toast(anyMismatch ? 'PO captured — mismatches flagged' : 'PO captured & validated')
    onClose()
  }

  if (pfis.length === 0) {
    return (
      <Drawer open={open} onClose={onClose} title="Capture PO" subtitle="Customer purchase order">
        <p className="text-sm text-muted-foreground">No PFIs available to match against. Generate a PFI first.</p>
      </Drawer>
    )
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Capture Purchase Order"
      subtitle="Auto-compared against the linked PFI"
      width="xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Capture PO</Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* PFI + File */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Match against PFI">
            <Select value={pfiId} onChange={(e) => onPfiChange(e.target.value)}>
              {pfis.map((p) => <option key={p.id} value={p.id}>{p.id} · {customerName(p.customerId)}</option>)}
            </Select>
          </Field>
          <Field label="PO File" hint="Scan upload comes with the backend">
            <Input value={fileName} onChange={(e) => setFileName(e.target.value)} placeholder="Voltas_PO_7781.pdf" />
          </Field>
        </div>

        {/* PO Header fields */}
        <section>
          <h3 className="mb-3 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">PO Details</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="PO Number" required>
              <Input value={poNumber} onChange={(e) => setPoNumber(e.target.value)} placeholder="PO/2024/00781" />
            </Field>
            <Field label="PO Date">
              <Input type="date" value={poDate} onChange={(e) => setPoDate(e.target.value)} />
            </Field>
            <Field label="PO Type">
              <Select value={poType} onChange={(e) => setPoType(e.target.value as PoOrderType)}>
                {PO_ORDER_TYPES.map((t) => <option key={t}>{t}</option>)}
              </Select>
            </Field>
            <Field label="Customer Reference / Indent #">
              <Input value={customerReference} onChange={(e) => setCustomerReference(e.target.value)} placeholder="ENQ/2024/0123" />
            </Field>
            <Field label="Delivery Address" className="sm:col-span-2">
              <Input value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="Site address if different from billing address" />
            </Field>
          </div>
        </section>

        {/* Acknowledgment */}
        <section>
          <h3 className="mb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">PO Acknowledgment</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
              <input type="checkbox" checked={ackSent} onChange={(e) => setAckSent(e.target.checked)} className="size-4 accent-[var(--ink)]" />
              <span className="text-sm font-medium">PO Acknowledgment Sent</span>
            </label>
            <Field label="Acknowledgment Date">
              <Input type="date" value={ackDate} onChange={(e) => setAckDate(e.target.value)} disabled={!ackSent} />
            </Field>
          </div>
        </section>

        <section>
          <h3 className="mb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            PO Line Items vs PFI
          </h3>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="p-2 text-left">Item</th>
                  <th className="p-2 text-right">PO Qty</th>
                  <th className="p-2 text-right">PFI Qty</th>
                  <th className="p-2 text-right">PO Rate</th>
                  <th className="p-2 text-right">PFI Rate</th>
                  <th className="p-2 text-center">Match</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((l, i) => {
                  const ref = pfi?.lineItems[i]
                  const m = matches[i]
                  return (
                    <tr key={i} className="border-t border-border">
                      <td className="p-2">
                        <Input value={l.description} onChange={(e) => updateLine(i, { description: e.target.value })} className="h-7" />
                      </td>
                      <td className="p-2">
                        <Input type="number" value={l.quantity} onChange={(e) => updateLine(i, { quantity: Number(e.target.value) })}
                          className={cn('h-7 text-right', m?.qtyMismatch && 'border-block text-block')} />
                      </td>
                      <td className="p-2 text-right font-mono text-xs text-muted-foreground">{ref?.quantity.toLocaleString('en-IN') ?? '—'}</td>
                      <td className="p-2">
                        <Input type="number" value={l.unitPrice} onChange={(e) => updateLine(i, { unitPrice: Number(e.target.value) })}
                          className={cn('h-7 text-right', m?.priceMismatch && 'border-block text-block')} />
                      </td>
                      <td className="p-2 text-right font-mono text-xs text-muted-foreground">{ref ? formatInrFull(ref.unitPrice) : '—'}</td>
                      <td className="p-2 text-center">
                        {m && !m.qtyMismatch && !m.priceMismatch
                          ? <CheckCircle2 className="mx-auto size-4 text-pass" />
                          : <AlertTriangle className="mx-auto size-4 text-block" />}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {anyMismatch && (
          <Field label="Mismatch Notes" required hint="Required when any line does not match the PFI">
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
        )}
      </div>
    </Drawer>
  )
}
