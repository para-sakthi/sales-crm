import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DrawerProps {
  /** Visible/slid-in state. The component stays mounted while exiting. */
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  /** Sticky footer (typically action buttons). */
  footer?: ReactNode
  width?: 'md' | 'lg' | 'xl'
  children: ReactNode
}

const widths = { md: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-4xl' }

/**
 * Right-side slide-over panel used for create/edit forms. Animation is driven
 * by the `open` prop — pair it with {@link useDisclosure} so the exit
 * transition can finish before the panel unmounts.
 */
export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  footer,
  width = 'lg',
  children,
}: DrawerProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close"
        className={cn(
          'absolute inset-0 bg-ink/30 backdrop-blur-[1px] transition-opacity duration-300 ease-out',
          open ? 'opacity-100' : 'opacity-0',
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          'relative flex h-full w-full flex-col bg-background shadow-2xl transition-transform duration-300 ease-out will-change-transform',
          widths[width],
          open ? 'translate-x-0' : 'translate-x-full',
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
          <div>
            <h2 className="font-serif text-xl font-semibold tracking-tight">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/40 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
