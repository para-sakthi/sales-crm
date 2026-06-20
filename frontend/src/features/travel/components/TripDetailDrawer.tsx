import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Field } from '@/components/ui/field'
import { Drawer } from '@/components/ui/drawer'
import { toast } from '@/components/ui/toast'
import { formatInrFull, formatDate, todayIso } from '@/lib/format'
import { useCrmStore, customerName, type Trip, type TripExpense } from '@/data'

interface Props {
  trip: Trip
  open: boolean
  onClose: () => void
}

const CATEGORIES: TripExpense['category'][] = ['Transport', 'Hotel', 'Food', 'DA', 'Local', 'Other']
const PAYMENT_MODES: TripExpense['paymentMode'][] = ['Company Card', 'Personal', 'From Advance', 'UPI / Online']

export function TripDetailDrawer({ trip, open, onClose }: Props) {
  const updateTrip = useCrmStore((s) => s.updateTrip)
  const deals = useCrmStore((s) => s.deals)

  // Expense entry state
  const [cat, setCat] = useState<TripExpense['category']>('Transport')
  const [amount, setAmount] = useState(0)
  const [expDate, setExpDate] = useState(todayIso().slice(0, 10))
  const [paymentMode, setPaymentMode] = useState<TripExpense['paymentMode']>('From Advance')
  const [expNote, setExpNote] = useState('')

  // Post-trip report state
  const [postTripOutcome, setPostTripOutcome] = useState(trip.postTripOutcome ?? '')
  const [followUpActions, setFollowUpActions] = useState(trip.followUpActions ?? '')
  const [tripStatus, setTripStatus] = useState(trip.status)

  const spent = trip.expenses.reduce((sum, e) => sum + e.amount, 0)
  const visits = trip.plannedDealIds.length
  const costPerVisit = visits ? spent / visits : 0

  function addExpense() {
    if (!amount) return
    const exp: TripExpense = {
      category: cat,
      amount: Number(amount),
      date: expDate || undefined,
      paymentMode,
      note: expNote || undefined,
    }
    updateTrip(trip.id, { expenses: [...trip.expenses, exp] })
    setAmount(0)
    setExpNote('')
    toast('Expense added')
  }

  function savePostTrip() {
    updateTrip(trip.id, {
      postTripOutcome: postTripOutcome || undefined,
      followUpActions: followUpActions || undefined,
      status: tripStatus,
    })
    toast('Post-trip report saved')
    onClose()
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={trip.name}
      subtitle={`${trip.mode} · ${trip.employees.join(', ')}`}
      width="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={savePostTrip}>Save Report</Button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={trip.status === 'Completed' ? 'pass' : 'warn'}>{trip.status}</Badge>
          <Badge tone="outline">{formatDate(trip.startDate)} → {formatDate(trip.endDate)}</Badge>
          {trip.approvalStatus && (
            <Badge tone={trip.approvalStatus === 'Approved' ? 'pass' : trip.approvalStatus === 'Rejected' ? 'block' : 'default'}>
              {trip.approvalStatus}
            </Badge>
          )}
          {trip.approvedBy && <Badge tone="outline">By: {trip.approvedBy}</Badge>}
        </div>

        {trip.objective && (
          <div className="rounded-lg border border-border bg-muted/20 px-3 py-2.5 text-sm">
            <span className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">Objective — </span>
            {trip.objective}
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <Kpi label="Budget" value={formatInrFull(trip.budget)} />
          <Kpi label="Spent" value={formatInrFull(spent)} tone={spent > trip.budget ? 'block' : 'pass'} />
          <Kpi label="Cost / Visit" value={formatInrFull(costPerVisit)} />
        </div>

        {/* Planned Visits */}
        <section>
          <h3 className="mb-2 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">Planned Visits ({visits})</h3>
          <div className="grid gap-1.5">
            {trip.plannedDealIds.map((id) => {
              const d = deals.find((x) => x.id === id)
              return (
                <div key={id} className="rounded-lg border border-border px-3 py-2 text-sm">
                  {d ? `${customerName(d.customerId)} · ${d.stage}` : id}
                </div>
              )
            })}
            {visits === 0 && <p className="text-sm text-muted-foreground">No visits linked.</p>}
          </div>
        </section>

        {/* Expenses */}
        <section>
          <h3 className="mb-2 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
            Expenses ({trip.expenses.length}) · Total {formatInrFull(spent)}
          </h3>
          <div className="mb-3 grid gap-1.5">
            {trip.expenses.map((e, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                <div>
                  <span className="font-medium">{e.category}</span>
                  {e.paymentMode && <span className="ml-2 text-xs text-muted-foreground">· {e.paymentMode}</span>}
                  {e.date && <span className="ml-2 text-xs text-muted-foreground">· {formatDate(e.date)}</span>}
                  {e.note && <span className="ml-2 text-xs text-muted-foreground">· {e.note}</span>}
                </div>
                <span className="font-mono tabular-nums">{formatInrFull(e.amount)}</span>
              </div>
            ))}
          </div>

          {/* Add expense form */}
          <div className="rounded-lg border border-dashed border-border p-3">
            <h4 className="mb-2 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">Add Expense</h4>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Field label="Category">
                <Select value={cat} onChange={(e) => setCat(e.target.value as TripExpense['category'])}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </Select>
              </Field>
              <Field label="Amount (₹)">
                <Input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} placeholder="0" />
              </Field>
              <Field label="Date">
                <Input type="date" value={expDate} onChange={(e) => setExpDate(e.target.value)} />
              </Field>
              <Field label="Payment Mode">
                <Select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value as TripExpense['paymentMode'])}>
                  {PAYMENT_MODES.map((m) => <option key={m}>{m}</option>)}
                </Select>
              </Field>
              <Field label="Note" className="sm:col-span-3">
                <Input value={expNote} onChange={(e) => setExpNote(e.target.value)} placeholder="e.g. Train to Pune, Dinner with Voltas team" />
              </Field>
              <div className="flex items-end">
                <Button onClick={addExpense} className="w-full"><Plus className="size-4" /> Add</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Post-trip report */}
        <section>
          <h3 className="mb-2 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">Post-Trip Report</h3>
          <div className="grid gap-3">
            <Field label="Trip Status">
              <Select value={tripStatus} onChange={(e) => setTripStatus(e.target.value as Trip['status'])}>
                <option value="Planned">Planned</option>
                <option value="Approved">Approved</option>
                <option value="Completed">Completed</option>
              </Select>
            </Field>
            <Field label="Outcome Summary" hint="What was achieved on this trip?">
              <Textarea
                value={postTripOutcome}
                onChange={(e) => setPostTripOutcome(e.target.value)}
                placeholder="Describe key outcomes, demos done, deals discussed, decisions made..."
              />
            </Field>
            <Field label="Follow-up Actions" hint="What needs to happen after this trip?">
              <Textarea
                value={followUpActions}
                onChange={(e) => setFollowUpActions(e.target.value)}
                placeholder="e.g. Send sample to Voltas by 15-Jul, share revised quote to Thermax, schedule next call..."
              />
            </Field>
          </div>
        </section>
      </div>
    </Drawer>
  )
}

function Kpi({ label, value, tone }: { label: string; value: string; tone?: 'pass' | 'block' }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <div className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`mt-1 font-serif text-base font-semibold ${tone === 'pass' ? 'text-pass' : tone === 'block' ? 'text-block' : ''}`}>{value}</div>
    </div>
  )
}
