import { useState, type ReactNode } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Field } from '@/components/ui/field'
import { Drawer } from '@/components/ui/drawer'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'
import { formatInr } from '@/lib/format'
import { priceAdvantagePct, estimatedAnnualValue } from '@/lib/business'
import {
  CONTRACT_TYPES,
  FAILURE_MODES,
  INCOMING_INSPECTION,
  IOT_FEATURES,
  LOCALIZATION_PUSH,
  LOOKING_FOR_ALT,
  MARKET_MOTOR_TYPES,
  MARKET_SENSOR_TYPES,
  NEW_MODEL_LAUNCH,
  SUPPLIER_ORIGINS,
  SUPPLIER_PAYMENT_TERMS,
  TECHNOLOGY_SHIFTS,
  THIRD_PARTY_LAB,
  useCrmStore,
  type CompetitorEntry,
  type MarketIntel,
} from '@/data'

interface Props {
  open: boolean
  onClose: () => void
  defaultCustomerId?: string
}

type FormState = Omit<MarketIntel, 'id' | 'createdAt'>

function rid(): string {
  return (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)).slice(0, 8)
}

export function MarketIntelDrawer({ open, onClose, defaultCustomerId }: Props) {
  const customers = useCrmStore((s) => s.customers)
  const products = useCrmStore((s) => s.products)
  const addMarketIntel = useCrmStore((s) => s.addMarketIntel)

  const [form, setForm] = useState<FormState>({
    customerId: defaultCustomerId ?? customers[0]?.id ?? '',
    competitor: '',
    competitorPrice: 0,
    ourPrice: 0,
    annualVolume: 0,
    competitors: [],
  })

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }
  // Numeric setter that treats blank as undefined (so optional fields stay clean).
  function setNum<K extends keyof FormState>(key: K, raw: string) {
    setForm((f) => ({ ...f, [key]: (raw === '' ? undefined : Number(raw)) as FormState[K] }))
  }

  const competitors = form.competitors ?? []
  function addCompetitor() {
    set('competitors', [...competitors, { id: rid(), name: '' }])
  }
  function updateCompetitor(id: string, patch: Partial<CompetitorEntry>) {
    set('competitors', competitors.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }
  function removeCompetitor(id: string) {
    set('competitors', competitors.filter((c) => c.id !== id))
  }

  const advantage = priceAdvantagePct(form.competitorPrice, form.ourPrice)
  const revenuePotential = estimatedAnnualValue(form.annualVolume, form.ourPrice)
  const costFlag = (form.costReductionTargetPct ?? 0) > 30
  const warrantyFlag = (form.fieldFailureRatePct ?? 0) > 2

  function handleSave() {
    if (!form.customerId) {
      toast('Select a customer', 'warn')
      return
    }
    if (!form.competitor.trim()) {
      toast('Primary competitor name is required', 'warn')
      return
    }
    addMarketIntel({
      ...form,
      competitors: competitors.filter((c) => c.name.trim()),
    })
    toast('Market intelligence captured')
    onClose()
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Capture Market Intelligence"
      subtitle="Tiered capture from Purchase, R&D & Quality heads during a customer visit"
      width="xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save intel</Button>
        </>
      }
    >
      <div className="space-y-7">
        {/* Context */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Customer" required>
            <Select value={form.customerId} onChange={(e) => set('customerId', e.target.value)}>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.companyName}</option>)}
            </Select>
          </Field>
          <Field label="Primary Competitor" required>
            <Input value={form.competitor} onChange={(e) => set('competitor', e.target.value)} />
          </Field>
        </div>

        {/* ── Supplier & Sourcing ── */}
        <Section title="Supplier & Sourcing" source="Purchase Head">
          <Tier label="Must Capture">
            <Txt label="Current Supplier — Primary" value={form.primarySupplier} onChange={(v) => set('primarySupplier', v)} />
            <Sel label="Supplier Origin Country" value={form.supplierOrigin} options={SUPPLIER_ORIGINS} onChange={(v) => set('supplierOrigin', v as FormState['supplierOrigin'])} />
            <Num label="Approved Suppliers" hint="0–10" value={form.approvedSuppliers} onChange={(v) => setNum('approvedSuppliers', v)} />
            <Num label="Current Purchase Price (₹/unit)" value={form.currentPurchasePrice} onChange={(v) => setNum('currentPurchasePrice', v)} />
            <Num label="Annual Purchase Volume (pcs)" value={form.annualVolume} onChange={(v) => set('annualVolume', Number(v) || 0)} />
            <Num label="Monthly Off-take (pcs)" value={form.monthlyOfftake} onChange={(v) => setNum('monthlyOfftake', v)} />
            <Num label="Import Share (%)" hint="0–100" value={form.importSharePct} onChange={(v) => setNum('importSharePct', v)} />
          </Tier>
          <Tier label="Try to Get">
            <Num label="Landed Cost incl. Duties (₹)" value={form.landedCost} onChange={(v) => setNum('landedCost', v)} />
            <Num label="Lead Time (days)" hint="1–365" value={form.supplierLeadTimeDays} onChange={(v) => setNum('supplierLeadTimeDays', v)} />
            <Sel label="Payment Terms w/ Supplier" value={form.supplierPaymentTerms} options={SUPPLIER_PAYMENT_TERMS} onChange={(v) => set('supplierPaymentTerms', v as FormState['supplierPaymentTerms'])} />
            <Num label="Target Price Expectation (₹)" value={form.targetPrice} onChange={(v) => setNum('targetPrice', v)} />
            <Num label="Cost Reduction Target (%)" hint={costFlag ? '⚠ aggressive (>30%)' : undefined} value={form.costReductionTargetPct} onChange={(v) => setNum('costReductionTargetPct', v)} />
          </Tier>
          <Tier label="If Available">
            <Txt label="Current Supplier — Secondary" value={form.secondarySupplier} onChange={(v) => set('secondarySupplier', v)} />
            <Sel label="Contract Type" value={form.contractType} options={CONTRACT_TYPES} onChange={(v) => set('contractType', v as FormState['contractType'])} />
          </Tier>
          <Field label="Sourcing Notes" className="mt-1">
            <Textarea value={form.sourcingNotes ?? ''} onChange={(e) => set('sourcingNotes', e.target.value)} />
          </Field>
        </Section>

        {/* ── Technical Specs ── */}
        <Section title="Technical Specs" source="R&D Head">
          <Tier label="Must Capture">
            <Sel label="Motor/Controller Type Used" value={form.currentMotorType} options={MARKET_MOTOR_TYPES} onChange={(v) => set('currentMotorType', v as FormState['currentMotorType'])} />
            <Num label="Voltage (V)" hint="3–450" value={form.voltage} onChange={(v) => setNum('voltage', v)} />
            <Num label="Wattage (W)" hint="5–2000" value={form.wattage} onChange={(v) => setNum('wattage', v)} />
            <Num label="Number of Poles" value={form.poles} onChange={(v) => setNum('poles', v)} />
            <Sel label="Sensor Type" value={form.sensorType} options={MARKET_SENSOR_TYPES} onChange={(v) => set('sensorType', v || undefined)} />
            <Txt label="Efficiency Target" hint="e.g. BEE 5-star, IE3" value={form.efficiencyTarget} onChange={(v) => set('efficiencyTarget', v)} />
            <Num label="Noise Level Req. (dB)" hint="20–80" value={form.noiseLevelDb} onChange={(v) => setNum('noiseLevelDb', v)} />
          </Tier>
          <Tier label="If Available">
            <Sel label="Technology Shift Planned" value={form.technologyShift} options={TECHNOLOGY_SHIFTS} onChange={(v) => set('technologyShift', v as FormState['technologyShift'])} />
            <Sel label="New Model Launch Planned" value={form.newModelLaunch} options={NEW_MODEL_LAUNCH} onChange={(v) => set('newModelLaunch', v as FormState['newModelLaunch'])} />
            <Sel label="IoT / Smart Features" value={form.iotFeatures} options={IOT_FEATURES} onChange={(v) => set('iotFeatures', v as FormState['iotFeatures'])} />
            <Txt label="Operating Temp Range (°C)" hint="e.g. -10 to +60" value={form.operatingTempRange} onChange={(v) => set('operatingTempRange', v)} />
          </Tier>
          <Field label="Tech / R&D Notes" className="mt-1">
            <Textarea value={form.techNotes ?? ''} onChange={(e) => set('techNotes', e.target.value)} />
          </Field>
        </Section>

        {/* ── Quality Parameters ── */}
        <Section title="Quality Parameters" source="Quality Head">
          <Tier label="Must Capture">
            <Num label="Supplier Rejection Rate (PPM)" value={form.rejectionPpm} onChange={(v) => setNum('rejectionPpm', v)} />
            <Sel label="Top Failure Mode" value={form.topFailureMode} options={FAILURE_MODES} onChange={(v) => set('topFailureMode', v as FormState['topFailureMode'])} />
            <Num label="Testing Duration (weeks)" hint="1–52" value={form.testingDurationWeeks} onChange={(v) => setNum('testingDurationWeeks', v)} />
            <Txt label="Key Test Standard(s)" hint="e.g. IS 302, IEC 60034" value={form.testStandards} onChange={(v) => set('testStandards', v)} />
            <Num label="Reliability Test Hours" hint="100–10,000" value={form.reliabilityTestHours} onChange={(v) => setNum('reliabilityTestHours', v)} />
            <Num label="Field Failure / Warranty (%)" hint={warrantyFlag ? '⚠ high (>2%)' : undefined} value={form.fieldFailureRatePct} onChange={(v) => setNum('fieldFailureRatePct', v)} />
            <Sel label="Incoming Inspection Method" value={form.incomingInspection} options={INCOMING_INSPECTION} onChange={(v) => set('incomingInspection', v as FormState['incomingInspection'])} />
            <Txt label="Certifications Required" hint="e.g. BIS, ISO 9001" value={form.certificationsRequired} onChange={(v) => set('certificationsRequired', v)} />
            <Sel label="Third-party Lab Testing" value={form.thirdPartyLab} options={THIRD_PARTY_LAB} onChange={(v) => set('thirdPartyLab', v as FormState['thirdPartyLab'])} />
          </Tier>
          <Field label="Quality Notes" className="mt-1">
            <Textarea value={form.qualityNotes ?? ''} onChange={(e) => set('qualityNotes', e.target.value)} />
          </Field>
        </Section>

        {/* ── Competitive Landscape ── */}
        <Section title="Competitive Landscape" source="Per Competitor">
          <div className="space-y-3">
            {competitors.map((c) => (
              <div key={c.id} className="rounded-lg border border-border bg-muted/20 p-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
                  <Field label="Competitor" className="sm:col-span-3">
                    <Input value={c.name} onChange={(e) => updateCompetitor(c.id, { name: e.target.value })} />
                  </Field>
                  <Field label="Price (₹)" className="sm:col-span-2">
                    <Input type="number" min={0} value={c.price ?? ''} onChange={(e) => updateCompetitor(c.id, { price: e.target.value === '' ? undefined : Number(e.target.value) })} />
                  </Field>
                  <Field label="Quality 1–10" className="sm:col-span-2">
                    <Input type="number" min={1} max={10} value={c.qualityRating ?? ''} onChange={(e) => updateCompetitor(c.id, { qualityRating: e.target.value === '' ? undefined : Number(e.target.value) })} />
                  </Field>
                  <Field label="Lead Time (d)" className="sm:col-span-2">
                    <Input type="number" min={0} value={c.leadTimeDays ?? ''} onChange={(e) => updateCompetitor(c.id, { leadTimeDays: e.target.value === '' ? undefined : Number(e.target.value) })} />
                  </Field>
                  <Field label="Key Weakness" className="sm:col-span-3">
                    <Input value={c.keyWeakness ?? ''} onChange={(e) => updateCompetitor(c.id, { keyWeakness: e.target.value })} />
                  </Field>
                </div>
                <button type="button" onClick={() => removeCompetitor(c.id)} className="mt-2 inline-flex items-center gap-1 font-mono text-[10px] uppercase text-block hover:underline">
                  <Trash2 className="size-3" /> Remove
                </button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addCompetitor}>
              <Plus className="size-4" /> Add competitor
            </Button>
          </div>
        </Section>

        {/* ── Opportunity Sizing ── */}
        <Section title="Opportunity Sizing" source="Internal + Auto-calculated">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Kryon Matching SKU">
              <Select value={form.matchingSkuId ?? ''} onChange={(e) => set('matchingSkuId', e.target.value || undefined)}>
                <option value="">— none —</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.modelName} ({p.sku})</option>)}
              </Select>
            </Field>
            <Num label="Our Quoted / Target Price (₹)" value={form.ourPrice} onChange={(v) => set('ourPrice', Number(v) || 0)} />
            <Num label="Competitor / Current Price (₹)" value={form.competitorPrice} onChange={(v) => set('competitorPrice', Number(v) || 0)} />
            <Num label="Vendor Approval Timeline (months)" hint="1–24" value={form.vendorApprovalMonths} onChange={(v) => setNum('vendorApprovalMonths', v)} />
            <Sel label="Actively Looking for Alt Supplier" value={form.lookingForAlt} options={LOOKING_FOR_ALT} onChange={(v) => set('lookingForAlt', v as FormState['lookingForAlt'])} />
            <Sel label="Localization Push from Mgmt" value={form.localizationPush} options={LOCALIZATION_PUSH} onChange={(v) => set('localizationPush', v as FormState['localizationPush'])} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <div className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">Price Advantage vs Current</div>
              <div className={cn('mt-1 font-serif text-xl font-semibold', advantage >= 0 ? 'text-pass' : 'text-block')}>
                {advantage ? `${advantage.toFixed(1)}%` : '—'}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <div className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">Est. Annual Revenue Potential</div>
              <div className="mt-1 font-serif text-xl font-semibold">{formatInr(revenuePotential)}</div>
            </div>
          </div>
        </Section>
      </div>
    </Drawer>
  )
}

// ── Section / Tier scaffolding ─────────────────────────────────────────
function Section({ title, source, children }: { title: string; source: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-serif text-base font-semibold">{title}</h3>
        <Badge tone="default">Source: {source}</Badge>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function Tier({ label, children }: { label: string; children: ReactNode }) {
  const tone = label === 'Must Capture' ? 'text-block' : label === 'Try to Get' ? 'text-warn' : 'text-muted-foreground'
  return (
    <div>
      <div className={cn('mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em]', tone)}>{label}</div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">{children}</div>
    </div>
  )
}

// ── Field helpers ──────────────────────────────────────────────────────
function Txt({ label, hint, value, onChange }: { label: string; hint?: string; value?: string; onChange: (v: string) => void }) {
  return (
    <Field label={label} hint={hint}>
      <Input value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
    </Field>
  )
}

function Num({ label, hint, value, onChange }: { label: string; hint?: string; value?: number; onChange: (v: string) => void }) {
  return (
    <Field label={label} hint={hint}>
      <Input type="number" min={0} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
    </Field>
  )
}

function Sel({ label, value, options, onChange }: { label: string; value?: string; options: readonly string[]; onChange: (v: string) => void }) {
  return (
    <Field label={label}>
      <Select value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
        <option value="">— select —</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </Select>
    </Field>
  )
}
