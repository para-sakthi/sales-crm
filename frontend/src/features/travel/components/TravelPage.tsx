import { Plus, MapPin, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useDisclosure } from '@/components/ui/use-disclosure'
import { PageHeader } from '@/features/shell'
import { formatInr, formatInrFull, formatDate } from '@/lib/format'
import { useCrmStore, type Trip } from '@/data'
import { TripFormDrawer } from './TripFormDrawer'
import { TripDetailDrawer } from './TripDetailDrawer'

export default function TravelPage() {
  const trips = useCrmStore((s) => s.trips)
  const form = useDisclosure()
  const detail = useDisclosure<Trip>()
  const live = detail.data ? trips.find((t) => t.id === detail.data!.id) : undefined

  return (
    <div>
      <PageHeader
        eyebrow="Intelligence"
        title="Travel Planner"
        description="Plan trips, log expenses, and measure visit efficiency."
        actions={
          <Button onClick={() => form.show()}>
            <Plus className="size-4" />
            Plan Trip
          </Button>
        }
      />
      <div className="grid grid-cols-1 gap-4 p-6 lg:grid-cols-2">
        {trips.map((t) => {
          const spent = t.expenses.reduce((sum, e) => sum + e.amount, 0)
          const costPerVisit = t.plannedDealIds.length ? spent / t.plannedDealIds.length : 0
          return (
            <button key={t.id} type="button" onClick={() => detail.show(t)} className="rounded-xl border border-border bg-card p-5 text-left transition-colors hover:border-primary">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-serif text-lg font-semibold">{t.name}</h3>
                  <div className="mt-1 flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><MapPin className="size-3" />{t.destination}</span>
                    <span className="inline-flex items-center gap-1"><Users className="size-3" />{t.employees.length}</span>
                    <span>{formatDate(t.startDate)}</span>
                  </div>
                </div>
                <Badge tone={t.status === 'Completed' ? 'pass' : 'warn'}>{t.status}</Badge>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-3">
                <Mini label="Budget" value={formatInr(t.budget)} />
                <Mini label="Spent" value={formatInr(spent)} />
                <Mini label="Cost/Visit" value={formatInrFull(costPerVisit)} />
              </div>
            </button>
          )
        })}
        {trips.length === 0 && (
          <div className="rounded-xl border border-dashed border-border py-12 text-center text-muted-foreground lg:col-span-2">
            No trips planned yet.
          </div>
        )}
      </div>

      {form.mounted && <TripFormDrawer open={form.open} onClose={form.close} />}
      {detail.mounted && live && <TripDetailDrawer key={live.id} trip={live} open={detail.open} onClose={detail.close} />}
    </div>
  )
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-mono text-sm font-semibold tabular-nums">{value}</div>
    </div>
  )
}
