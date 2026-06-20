import { NavLink } from 'react-router-dom'
import { RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCrmStore } from '@/data'
import { toast } from '@/components/ui/toast'
import { NAV_GROUPS, isVisibleTo, type CrmRole } from '../nav'

export function Sidebar({ role }: Readonly<{ role: CrmRole }>) {
  const resetDemo = useCrmStore((s) => s.resetDemo)

  function handleReset() {
    resetDemo()
    toast('Demo data reset to seed')
  }

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-5">
        <div className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground font-serif text-lg font-semibold leading-none">
          K
        </div>
        <div className="leading-tight">
          <div className="font-serif text-base font-semibold tracking-tight">Kryon</div>
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            CRM
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_GROUPS.map((group) => {
          const items = group.items.filter((item) => isVisibleTo(item, role))
          if (items.length === 0) return null
          return (
            <div key={group.label} className="mb-5">
              <div className="mb-1.5 px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                {group.label}
              </div>
              <div className="grid gap-0.5">
                {items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center gap-2.5 rounded-md px-2 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                      )
                    }
                  >
                    <item.icon className="size-4 shrink-0" />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.status === 'soon' && (
                      <span className="rounded-full border border-warn/40 px-1.5 py-px font-mono text-[8.5px] uppercase tracking-wide text-warn">
                        Soon
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <button
          type="button"
          onClick={handleReset}
          className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 font-mono text-[11px] uppercase tracking-wide text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
        >
          <RotateCcw className="size-3.5" />
          Reset demo data
        </button>
      </div>
    </aside>
  )
}
