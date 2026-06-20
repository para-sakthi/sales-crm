import { Plus, MapPin, Video, Phone } from 'lucide-react'
import { useDisclosure } from '@/components/ui/use-disclosure'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/features/shell'
import { formatDate } from '@/lib/format'
import { useCrmStore, customerName, type Sentiment, type VisitType } from '@/data'
import { VisitFormDrawer } from './VisitFormDrawer'

const typeIcon: Record<VisitType, typeof MapPin> = {
  'In-Person': MapPin,
  Virtual: Video,
  Phone,
}

const sentimentTone: Record<Sentiment, 'pass' | 'warn' | 'block' | 'default'> = {
  'Very Positive': 'pass',
  Positive: 'pass',
  Neutral: 'default',
  Negative: 'warn',
  'Very Negative': 'block',
}

export default function VisitsPage() {
  const visits = useCrmStore((s) => s.visits)
  const panel = useDisclosure()

  const sorted = [...visits].sort((a, b) => +new Date(b.date) - +new Date(a.date))

  return (
    <div>
      <PageHeader
        eyebrow="Pipeline"
        title="Visit & Meeting Log"
        description="Chronological record of every customer interaction."
        actions={
          <Button onClick={() => panel.show()}>
            <Plus className="size-4" />
            Log Visit
          </Button>
        }
      />
      <div className="space-y-3 p-6">
        {sorted.map((v) => {
          const Icon = typeIcon[v.type]
          return (
            <div key={v.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Icon className="size-4 text-muted-foreground" />
                <span className="font-semibold">{customerName(v.customerId)}</span>
                <Badge tone="outline">{v.purpose}</Badge>
                <Badge tone={sentimentTone[v.sentiment]}>{v.sentiment}</Badge>
                {v.competitor && <Badge tone="warn">vs {v.competitor}</Badge>}
                <span className="ml-auto font-mono text-[11px] text-muted-foreground">{formatDate(v.date)}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{v.summary}</p>
              {v.keyDecisions && (
                <p className="mt-2 text-sm"><span className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">Decisions: </span>{v.keyDecisions}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-muted-foreground">
                <span>Ours: {v.ourAttendees.join(', ') || '—'}</span>
                {v.customerAttendees.length > 0 && <span>Customer: {v.customerAttendees.join(', ')}</span>}
                {v.nextVisitDate && <span>Next: {formatDate(v.nextVisitDate)}</span>}
              </div>
            </div>
          )
        })}
        {sorted.length === 0 && (
          <div className="rounded-xl border border-dashed border-border py-12 text-center text-muted-foreground">
            No visits logged yet.
          </div>
        )}
      </div>

      {panel.mounted && <VisitFormDrawer open={panel.open} onClose={panel.close} />}
    </div>
  )
}
