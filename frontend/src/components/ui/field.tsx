import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface FieldProps {
  label: string
  htmlFor?: string
  hint?: string
  error?: string
  required?: boolean
  className?: string
  children: ReactNode
}

/** Mono uppercase label + control + hint/error, matching the prototype. */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  className,
  children,
}: FieldProps) {
  return (
    <div className={cn('grid gap-1.5', className)}>
      <label
        htmlFor={htmlFor}
        className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground"
      >
        {label}
        {required && <span className="text-block"> *</span>}
      </label>
      {children}
      {error ? (
        <span className="font-mono text-[11px] text-block">{error}</span>
      ) : (
        hint && <span className="font-mono text-[11px] text-muted-foreground">{hint}</span>
      )}
    </div>
  )
}
