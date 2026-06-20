import { useState } from 'react'
import { RotateCcw, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Field } from '@/components/ui/field'
import { Drawer } from '@/components/ui/drawer'
import { toast } from '@/components/ui/toast'
import { formatDate } from '@/lib/format'
import {
  useCrmStore,
  customerName,
  productName,
  type Sample,
  type SampleStatus,
  type Severity,
  type TestResult,
} from '@/data'

interface Props {
  sample: Sample
  open: boolean
  onClose: () => void
}

const STATUSES: SampleStatus[] = ['Not Started', 'In Progress', 'Passed', 'Failed', 'Rework']
const RESULTS: TestResult[] = ['Approved', 'Rejected', 'Conditional']
const TEST_TYPES = ['Reliability', 'Performance', 'Safety', 'EMI/EMC', 'Other']

export function SampleDetailDrawer({ sample, open, onClose }: Props) {
  const updateSample = useCrmStore((s) => s.updateSample)
  const reworkSample = useCrmStore((s) => s.reworkSample)
  const [draft, setDraft] = useState(sample)

  function set<K extends keyof Sample>(key: K, value: Sample[K]) {
    setDraft((d) => ({ ...d, [key]: value }))
  }
  function toggleTestType(t: string) {
    setDraft((d) => ({
      ...d,
      testTypes: d.testTypes.includes(t) ? d.testTypes.filter((x) => x !== t) : [...d.testTypes, t],
    }))
  }
  function addIssue() {
    set('issues', [...draft.issues, { description: '', severity: 'Medium' }])
  }
  function updateIssue(i: number, patch: Partial<{ description: string; severity: Severity }>) {
    set('issues', draft.issues.map((iss, idx) => (idx === i ? { ...iss, ...patch } : iss)))
  }
  function removeIssue(i: number) {
    set('issues', draft.issues.filter((_, idx) => idx !== i))
  }

  function save() {
    updateSample(sample.id, draft)
    toast('Test feedback saved')
    onClose()
  }
  function triggerRework() {
    const next = reworkSample(sample.id)
    if (next) toast(`Rework raised — ${next.id} (v${next.version})`, 'warn')
    onClose()
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={sample.id}
      subtitle={`${customerName(sample.customerId)} · ${productName(sample.productId)}`}
      width="xl"
      footer={
        <>
          <Button variant="outline" onClick={triggerRework}>
            <RotateCcw className="size-4" />
            Raise Rework
          </Button>
          <Button onClick={save}>Save feedback</Button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="outline">v{sample.version}</Badge>
          <Badge>Qty {sample.quantitySent}</Badge>
          <Badge tone="outline">Dispatched {formatDate(sample.dispatchDate)}</Badge>
          {sample.tracking && <Badge tone="outline">{sample.courier} · {sample.tracking}</Badge>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Test Status">
            <Select value={draft.status} onChange={(e) => set('status', e.target.value as SampleStatus)}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </Select>
          </Field>
          <Field label="Final Result">
            <Select value={draft.finalResult ?? ''} onChange={(e) => set('finalResult', (e.target.value || undefined) as TestResult | undefined)}>
              <option value="">— pending —</option>
              {RESULTS.map((r) => <option key={r}>{r}</option>)}
            </Select>
          </Field>
          <Field label="Test Start Date">
            <input
              type="date"
              value={draft.testStartDate ?? ''}
              onChange={(e) => set('testStartDate', e.target.value || undefined)}
              className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none"
            />
          </Field>
          <Field label="Expected Completion Date">
            <input
              type="date"
              value={draft.expectedCompletionDate ?? ''}
              onChange={(e) => set('expectedCompletionDate', e.target.value || undefined)}
              className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none"
            />
          </Field>
          <label className="flex items-center gap-2 sm:col-span-2">
            <input type="checkbox" checked={draft.delivered} onChange={(e) => set('delivered', e.target.checked)} className="size-4 accent-[var(--ink)]" />
            <span className="text-sm font-medium">Delivery confirmed</span>
          </label>
        </div>

        <Field label="Test Types">
          <div className="flex flex-wrap gap-2">
            {TEST_TYPES.map((t) => (
              <button key={t} type="button" onClick={() => toggleTestType(t)}
                className={`rounded-full border px-3 py-1 text-sm ${draft.testTypes.includes(t) ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-muted'}`}>
                {t}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Test Result Summary">
          <Textarea value={draft.resultSummary ?? ''} onChange={(e) => set('resultSummary', e.target.value)} />
        </Field>
        <Field label="Customer Feedback (verbatim)">
          <Textarea value={draft.customerFeedback ?? ''} onChange={(e) => set('customerFeedback', e.target.value)} />
        </Field>

        {/* Rework fields — shown when status is Rework */}
        {(draft.status === 'Rework' || draft.reworkDescription) && (
          <div className="grid grid-cols-1 gap-4 rounded-lg border border-warn/40 bg-warn-soft/20 p-3 sm:grid-cols-2">
            <Field label="Rework Description" className="sm:col-span-2">
              <Textarea
                value={draft.reworkDescription ?? ''}
                onChange={(e) => set('reworkDescription', e.target.value || undefined)}
                placeholder="Describe what needs to be reworked"
              />
            </Field>
            <Field label="Resubmission Date">
              <input
                type="date"
                value={draft.resubmissionDate ?? ''}
                onChange={(e) => set('resubmissionDate', e.target.value || undefined)}
                className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none"
              />
            </Field>
          </div>
        )}

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">Issues</h3>
            <Button variant="outline" size="sm" onClick={addIssue}><Plus className="size-3.5" /> Add</Button>
          </div>
          <div className="grid gap-2">
            {draft.issues.map((iss, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input value={iss.description} onChange={(e) => updateIssue(i, { description: e.target.value })} placeholder="Issue description" />
                <div className="w-32 shrink-0">
                  <Select value={iss.severity} onChange={(e) => updateIssue(i, { severity: e.target.value as Severity })}>
                    {(['High', 'Medium', 'Low'] as Severity[]).map((s) => <option key={s}>{s}</option>)}
                  </Select>
                </div>
                <button type="button" onClick={() => removeIssue(i)} className="grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-block">
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
            {draft.issues.length === 0 && <p className="text-sm text-muted-foreground">No issues recorded.</p>}
          </div>
        </section>
      </div>
    </Drawer>
  )
}
