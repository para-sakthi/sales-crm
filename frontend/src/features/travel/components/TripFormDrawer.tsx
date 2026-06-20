import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Field } from '@/components/ui/field'
import { Drawer } from '@/components/ui/drawer'
import { toast } from '@/components/ui/toast'
import { todayIso } from '@/lib/format'
import { SALES_TEAM, TRIP_APPROVAL_STATUSES, useCrmStore, customerName, type Trip, type TripApprovalStatus } from '@/data'

interface Props {
  open: boolean
  onClose: () => void
}

export function TripFormDrawer({ open, onClose }: Props) {
  const deals = useCrmStore((s) => s.deals)
  const addTrip = useCrmStore((s) => s.addTrip)

  const [form, setForm] = useState({
    destination: '',
    type: 'Single City' as Trip['type'],
    startDate: todayIso().slice(0, 10),
    endDate: todayIso().slice(0, 10),
    mode: 'Flight' as Trip['mode'],
    employees: [SALES_TEAM[0]] as string[],
    budget: 30000,
    advance: 0,
    objective: '',
    approvalStatus: 'Pending' as TripApprovalStatus,
    approvedBy: '',
    plannedDealIds: [] as string[],
  })

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }
  function toggleDeal(id: string) {
    setForm((f) => ({
      ...f,
      plannedDealIds: f.plannedDealIds.includes(id) ? f.plannedDealIds.filter((d) => d !== id) : [...f.plannedDealIds, id],
    }))
  }

  function handleSave() {
    if (!form.destination.trim()) {
      toast('Destination is required', 'warn')
      return
    }
    const niceDates = `${new Date(form.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}–${new Date(form.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}`
    addTrip({
      name: `${form.destination} · ${niceDates}`,
      type: form.type,
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      destination: form.destination,
      mode: form.mode,
      employees: form.employees,
      budget: Number(form.budget),
      advance: Number(form.advance) || undefined,
      objective: form.objective || undefined,
      approvalStatus: form.approvalStatus,
      approvedBy: form.approvedBy || undefined,
      status: 'Planned',
      plannedDealIds: form.plannedDealIds,
      expenses: [],
    })
    toast('Trip planned')
    onClose()
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Plan a Trip"
      subtitle="Travel plan with linked deals & budget"
      width="xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Create trip</Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Destination"><Input value={form.destination} onChange={(e) => set('destination', e.target.value)} /></Field>
          <Field label="Type">
            <Select value={form.type} onChange={(e) => set('type', e.target.value as Trip['type'])}>
              <option>Single City</option><option>Multi City</option>
            </Select>
          </Field>
          <Field label="Start Date"><Input type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} /></Field>
          <Field label="End Date"><Input type="date" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} /></Field>
          <Field label="Travel Mode">
            <Select value={form.mode} onChange={(e) => set('mode', e.target.value as Trip['mode'])}>
              <option>Flight</option><option>Train</option><option>Car</option><option>Bus</option>
            </Select>
          </Field>
          <Field label="Budget (₹)"><Input type="number" value={form.budget} onChange={(e) => set('budget', Number(e.target.value))} /></Field>
          <Field label="Advance Request (₹)"><Input type="number" value={form.advance} onChange={(e) => set('advance', Number(e.target.value))} /></Field>
          <Field label="Approval Status">
            <Select value={form.approvalStatus} onChange={(e) => set('approvalStatus', e.target.value as TripApprovalStatus)}>
              {TRIP_APPROVAL_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </Select>
          </Field>
          <Field label="Approved By">
            <Select value={form.approvedBy} onChange={(e) => set('approvedBy', e.target.value)}>
              <option value="">— none —</option>
              <option value="Sales Manager">Sales Manager</option>
              <option value="VP Sales">VP Sales</option>
              <option value="CEO">CEO</option>
            </Select>
          </Field>
        </div>

        <Field label="Trip Objective">
          <Textarea value={form.objective} onChange={(e) => set('objective', e.target.value)} placeholder="Key goals for this trip, e.g. demo at Voltas plant, close Thermax deal" />
        </Field>

        <Field label="Traveling Employees">
          <div className="flex flex-wrap gap-2">
            {SALES_TEAM.map((m) => (
              <button key={m} type="button"
                onClick={() => set('employees', form.employees.includes(m) ? form.employees.filter((e) => e !== m) : [...form.employees, m])}
                className={`rounded-full border px-3 py-1 text-sm ${form.employees.includes(m) ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-muted'}`}>
                {m}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Planned Visits (deals)">
          <div className="grid gap-1.5">
            {deals.slice(0, 8).map((d) => (
              <label key={d.id} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
                <input type="checkbox" checked={form.plannedDealIds.includes(d.id)} onChange={() => toggleDeal(d.id)} className="size-4 accent-[var(--ink)]" />
                <span className="text-sm">{customerName(d.customerId)} · {d.stage}</span>
              </label>
            ))}
          </div>
        </Field>
      </div>
    </Drawer>
  )
}
