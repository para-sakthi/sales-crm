import { useCallback, useRef, useState } from 'react'

/** Keep in sync with the Drawer's transition duration. */
const EXIT_MS = 300

/**
 * Drives an animated panel: `mounted` controls presence (so the exit
 * animation can play before unmount), `open` controls the visible/slid-in
 * state. Optionally carries a payload `data` (the row being edited/viewed).
 *
 *   const form = useDisclosure<Customer>()
 *   form.show(customer)            // open for edit
 *   form.show()                    // open blank
 *   {form.mounted && <FormDrawer open={form.open} data={form.data} onClose={form.close} />}
 */
export function useDisclosure<T = undefined>() {
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<T | undefined>(undefined)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = useCallback((payload?: T) => {
    if (timer.current) clearTimeout(timer.current)
    setData(payload)
    setMounted(true)
    // Next frame: flip to open so the transition runs from the closed state.
    requestAnimationFrame(() => setOpen(true))
  }, [])

  const close = useCallback(() => {
    setOpen(false)
    timer.current = setTimeout(() => setMounted(false), EXIT_MS)
  }, [])

  return { mounted, open, data, show, close }
}
