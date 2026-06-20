import type { ReactNode } from 'react'

interface PageHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border bg-background px-6 py-7 md:px-8">
      <div>
        {eyebrow && (
          <div className="mb-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            {eyebrow}
          </div>
        )}
        <h1 className="font-serif text-[clamp(1.6rem,3vw,2.1rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
