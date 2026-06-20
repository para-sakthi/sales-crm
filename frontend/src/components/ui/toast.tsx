import { create } from 'zustand'
import { CheckCircle2, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastTone = 'success' | 'info' | 'warn'
interface Toast {
  id: number
  message: string
  tone: ToastTone
}

interface ToastStore {
  toasts: Toast[]
  push: (message: string, tone?: ToastTone) => void
  dismiss: (id: number) => void
}

let counter = 0

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (message, tone = 'success') => {
    const id = ++counter
    set((s) => ({ toasts: [...s.toasts, { id, message, tone }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3200)
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

/** Imperative helper: `toast('Saved')`, `toast('Heads up', 'warn')`. */
export function toast(message: string, tone?: ToastTone) {
  useToastStore.getState().push(message, tone)
}

const icons = { success: CheckCircle2, info: Info, warn: AlertTriangle }
const tones: Record<ToastTone, string> = {
  success: 'text-pass',
  info: 'text-foreground',
  warn: 'text-warn',
}

export function Toaster() {
  const { toasts, dismiss } = useToastStore()
  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2">
      {toasts.map((t) => {
        const Icon = icons[t.tone]
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => dismiss(t.id)}
            className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-4 py-3 text-sm shadow-lg"
          >
            <Icon className={cn('size-4 shrink-0', tones[t.tone])} />
            <span className="font-medium">{t.message}</span>
          </button>
        )
      })}
    </div>
  )
}
