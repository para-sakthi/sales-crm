import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide whitespace-nowrap',
  {
    variants: {
      tone: {
        default: 'border-border bg-muted text-muted-foreground',
        ink: 'border-primary bg-primary text-primary-foreground',
        pass: 'border-pass/40 bg-pass-soft/50 text-pass',
        warn: 'border-warn/40 bg-warn-soft/50 text-warn',
        block: 'border-block/40 bg-block-soft/50 text-block',
        outline: 'border-border bg-transparent text-foreground',
      },
    },
    defaultVariants: { tone: 'default' },
  },
)

export function Badge({
  className,
  tone,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />
}
