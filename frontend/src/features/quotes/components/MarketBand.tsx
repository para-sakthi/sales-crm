import { marketPositionPct } from '@/lib/business'
import { formatInrFull } from '@/lib/format'

interface Props {
  low: number
  high: number
  price: number
  competitorPrice?: number
}

/** Visual band showing where our price sits within the market low–high range. */
export function MarketBand({ low, high, price, competitorPrice }: Props) {
  const pos = marketPositionPct(price, low, high)
  const compPos = competitorPrice ? marketPositionPct(competitorPrice, low, high) : null

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4">
      <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
        <span>Market Low {formatInrFull(low)}</span>
        <span>Market High {formatInrFull(high)}</span>
      </div>
      <div className="relative h-2 rounded-full bg-gradient-to-r from-pass/40 via-warn/40 to-block/40">
        {compPos !== null && (
          <div className="absolute -top-1 size-4 -translate-x-1/2" style={{ left: `${compPos}%` }} title="Competitor">
            <div className="mx-auto h-4 w-0.5 bg-muted-foreground" />
          </div>
        )}
        <div className="absolute -top-1.5 size-5 -translate-x-1/2" style={{ left: `${pos}%` }} title="Our price">
          <div className="mx-auto size-5 rounded-full border-2 border-background bg-primary shadow" />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="font-mono text-[11px] text-muted-foreground">
          {competitorPrice ? `Competitor ${formatInrFull(competitorPrice)}` : ''}
        </span>
        <span className="font-mono text-[11px] font-semibold">Our price {formatInrFull(price)}</span>
      </div>
    </div>
  )
}
