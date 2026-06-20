import { useState } from 'react'
import { Snowflake } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'
import { formatInr, daysSince } from '@/lib/format'
import { isColdCandidate } from '@/lib/business'
import { OPEN_STAGES, useCrmStore, customerName, productName, type Deal, type DealStage } from '@/data'

interface Props {
  deals: Deal[]
  onSelect: (deal: Deal) => void
}

export function PipelineBoard({ deals, onSelect }: Props) {
  const moveDealStage = useCrmStore((s) => s.moveDealStage)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverStage, setDragOverStage] = useState<DealStage | null>(null)

  function handleDrop(stage: DealStage) {
    const id = draggingId
    setDragOverStage(null)
    setDraggingId(null)
    if (!id) return
    const deal = deals.find((d) => d.id === id)
    if (!deal || deal.stage === stage) return
    moveDealStage(id, stage)
    toast(`${customerName(deal.customerId)} moved to ${stage}`)
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {OPEN_STAGES.map((stage) => {
        const inStage = deals.filter((d) => d.stage === stage)
        const value = inStage.reduce((sum, d) => sum + d.quantity * d.quotedPrice, 0)
        const isOver = dragOverStage === stage
        return (
          <div key={stage} className="flex w-72 shrink-0 flex-col">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-sm font-semibold">{stage}</span>
              <span className="font-mono text-[11px] text-muted-foreground">{inStage.length}</span>
            </div>
            <div className="mb-2 px-1 font-mono text-[11px] text-muted-foreground">{formatInr(value)}</div>
            <div
              onDragOver={(e) => {
                if (!draggingId) return
                e.preventDefault()
                e.dataTransfer.dropEffect = 'move'
                if (dragOverStage !== stage) setDragOverStage(stage)
              }}
              onDragLeave={(e) => {
                // Only clear when leaving the column entirely, not its children.
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverStage((s) => (s === stage ? null : s))
              }}
              onDrop={() => handleDrop(stage)}
              className={cn(
                'flex flex-1 flex-col gap-2 rounded-xl p-2 transition-colors',
                isOver ? 'bg-primary/10 ring-2 ring-primary/40' : 'bg-muted/40',
              )}
            >
              {inStage.map((deal) => {
                const cold = isColdCandidate(deal.stage, deal.lastActivityAt)
                return (
                  <button
                    key={deal.id}
                    type="button"
                    draggable
                    onDragStart={(e) => {
                      setDraggingId(deal.id)
                      e.dataTransfer.effectAllowed = 'move'
                      e.dataTransfer.setData('text/plain', deal.id)
                    }}
                    onDragEnd={() => {
                      setDraggingId(null)
                      setDragOverStage(null)
                    }}
                    onClick={() => onSelect(deal)}
                    className={cn(
                      'cursor-grab rounded-lg border bg-card p-3 text-left transition-all hover:border-primary active:cursor-grabbing',
                      cold ? 'border-block/40' : 'border-border',
                      draggingId === deal.id && 'opacity-40',
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-semibold leading-tight">{customerName(deal.customerId)}</span>
                      {cold && <Snowflake className="size-3.5 shrink-0 text-block" />}
                    </div>
                    <div className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
                      {productName(deal.productId)}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold tabular-nums">
                        {formatInr(deal.quantity * deal.quotedPrice)}
                      </span>
                      <Badge tone="outline">{deal.confidence}%</Badge>
                    </div>
                    <div className="mt-1.5 font-mono text-[10px] text-muted-foreground">
                      {deal.owner} · {daysSince(deal.lastActivityAt)}d idle
                    </div>
                  </button>
                )
              })}
              {inStage.length === 0 && (
                <div className="py-6 text-center font-mono text-[11px] text-muted-foreground">
                  {isOver ? 'drop here' : 'empty'}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
