import { useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Field } from '@/components/ui/field'
import { Drawer } from '@/components/ui/drawer'
import { toast } from '@/components/ui/toast'
import { todayIso } from '@/lib/format'
import {
  SALES_TEAM,
  useCrmStore,
  type ActionItem,
  type Confidence,
  type Sentiment,
  type VisitPurpose,
  type VisitType,
} from '@/data'

interface Props {
  open: boolean
  onClose: () => void
}

const TYPES: VisitType[] = ['In-Person', 'Virtual', 'Phone']
const PURPOSES: VisitPurpose[] = [
  'Discovery',
  'Follow-up',
  'Sample Review',
  'Negotiation',
  'Plant Audit',
  'Relationship',
  'Other',
]
const SENTIMENTS: Sentiment[] = ['Very Positive', 'Positive', 'Neutral', 'Negative', 'Very Negative']

export function VisitFormDrawer({ open, onClose }: Props) {
  const customers = useCrmStore((s) => s.customers)
  const deals = useCrmStore((s) => s.deals)
  const contacts = useCrmStore((s) => s.contacts)
  const addVisit = useCrmStore((s) => s.addVisit)

  const [form, setForm] = useState({
    customerId: customers[0]?.id ?? '',
    dealId: '',
    date: todayIso().slice(0, 10),
    visitTime: '',
    type: 'In-Person' as VisitType,
    purpose: 'Discovery' as VisitPurpose,
    ourAttendees: [SALES_TEAM[0]] as string[],
    customerAttendees: [] as string[],
    summary: '',
    keyDecisions: '',
    actionItems: [] as ActionItem[],
    sentiment: 'Neutral' as Sentiment,
    confidence: 50 as Confidence,
    competitor: '',
    nextVisitDate: '',
  })

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }
  function toggle(list: 'ourAttendees' | 'customerAttendees', value: string) {
    setForm((f) => ({
      ...f,
      [list]: f[list].includes(value)
        ? f[list].filter((v) => v !== value)
        : [...f[list], value],
    }))
  }

  // Action items helpers
  function addActionItem() {
    set('actionItems', [...form.actionItems, { task: '', owner: SALES_TEAM[0], deadline: '' }])
  }
  function updateActionItem(i: number, patch: Partial<ActionItem>) {
    set(
      'actionItems',
      form.actionItems.map((item, idx) => (idx === i ? { ...item, ...patch } : item)),
    )
  }
  function removeActionItem(i: number) {
    set(
      'actionItems',
      form.actionItems.filter((_, idx) => idx !== i),
    )
  }

  const customerDeals = useMemo(
    () => deals.filter((d) => d.customerId === form.customerId),
    [deals, form.customerId],
  )
  const customerContacts = useMemo(
    () => contacts.filter((c) => c.customerId === form.customerId),
    [contacts, form.customerId],
  )

  function handleSave() {
    if (!form.summary.trim()) {
      toast('Discussion summary is required', 'warn')
      return
    }
    addVisit({
      ...form,
      date: new Date(form.date).toISOString(),
      visitTime: form.visitTime || undefined,
      dealId: form.dealId || undefined,
      nextVisitDate: form.nextVisitDate ? new Date(form.nextVisitDate).toISOString() : undefined,
      competitor: form.competitor || undefined,
      actionItems: form.actionItems.filter((a) => a.task.trim()),
    })
    toast('Visit logged')
    onClose()
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Log a Visit"
      subtitle="Structured record of a customer interaction"
      width="xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save visit</Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Customer" required>
            <Select value={form.customerId} onChange={(e) => set('customerId', e.target.value)}>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Linked Deal">
            <Select value={form.dealId} onChange={(e) => set('dealId', e.target.value)}>
              <option value="">— none —</option>
              {customerDeals.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.stage} · {d.id}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Date">
            <Input
              type="date"
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
            />
          </Field>
          <Field label="Time" hint="HH:MM — optional">
            <Input
              type="time"
              value={form.visitTime}
              onChange={(e) => set('visitTime', e.target.value)}
            />
          </Field>
          <Field label="Visit Type">
            <Select value={form.type} onChange={(e) => set('type', e.target.value as VisitType)}>
              {TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </Select>
          </Field>
          <Field label="Purpose">
            <Select
              value={form.purpose}
              onChange={(e) => set('purpose', e.target.value as VisitPurpose)}
            >
              {PURPOSES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </Select>
          </Field>
          <Field label="Competitor Discussed">
            <Input
              value={form.competitor}
              onChange={(e) => set('competitor', e.target.value)}
            />
          </Field>
        </div>

        <Field label="Our Attendees">
          <div className="flex flex-wrap gap-2">
            {SALES_TEAM.map((m) => (
              <Chip
                key={m}
                active={form.ourAttendees.includes(m)}
                onClick={() => toggle('ourAttendees', m)}
              >
                {m}
              </Chip>
            ))}
          </div>
        </Field>

        <Field label="Customer Attendees">
          {customerContacts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No contacts on file for this customer.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {customerContacts.map((c) => (
                <Chip
                  key={c.id}
                  active={form.customerAttendees.includes(c.name)}
                  onClick={() => toggle('customerAttendees', c.name)}
                >
                  {c.name}
                </Chip>
              ))}
            </div>
          )}
        </Field>

        <Field label="Discussion Summary" required>
          <Textarea
            value={form.summary}
            onChange={(e) => set('summary', e.target.value)}
            className="min-h-28"
          />
        </Field>
        <Field label="Key Decisions">
          <Textarea
            value={form.keyDecisions}
            onChange={(e) => set('keyDecisions', e.target.value)}
          />
        </Field>

        {/* Action Items */}
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
              Action Items
            </h3>
            <Button variant="outline" size="sm" onClick={addActionItem}>
              <Plus className="size-3.5" /> Add
            </Button>
          </div>
          <div className="grid gap-2">
            {form.actionItems.map((item, i) => (
              <div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-12">
                <div className="sm:col-span-5">
                  <Input
                    value={item.task}
                    onChange={(e) => updateActionItem(i, { task: e.target.value })}
                    placeholder="Task description"
                  />
                </div>
                <div className="sm:col-span-3">
                  <Select
                    value={item.owner}
                    onChange={(e) => updateActionItem(i, { owner: e.target.value })}
                  >
                    {SALES_TEAM.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </Select>
                </div>
                <div className="sm:col-span-3">
                  <Input
                    type="date"
                    value={item.deadline ?? ''}
                    onChange={(e) => updateActionItem(i, { deadline: e.target.value })}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeActionItem(i)}
                  className="grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-destructive sm:col-span-1"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
            {form.actionItems.length === 0 && (
              <p className="text-sm text-muted-foreground">No action items yet.</p>
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Customer Sentiment">
            <Select
              value={form.sentiment}
              onChange={(e) => set('sentiment', e.target.value as Sentiment)}
            >
              {SENTIMENTS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </Field>
          <Field label="Confidence Updated">
            <Select
              value={String(form.confidence)}
              onChange={(e) => set('confidence', Number(e.target.value) as Confidence)}
            >
              {[0, 25, 50, 75, 100].map((c) => (
                <option key={c} value={c}>
                  {c === 0 ? 'Not confident' : `${c}%`}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Next Visit Date">
            <Input
              type="date"
              value={form.nextVisitDate}
              onChange={(e) => set('nextVisitDate', e.target.value)}
            />
          </Field>
        </div>
      </div>
    </Drawer>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-sm transition-colors ${
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border hover:bg-muted'
      }`}
    >
      {children}
    </button>
  )
}
