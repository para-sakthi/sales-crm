import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  Building2,
  Contact,
  Package,
  GitBranch,
  CalendarClock,
  FileSignature,
  FlaskConical,
  Calculator,
  ReceiptText,
  FileCheck2,
  Truck,
  ClipboardCheck,
  Radar,
  Plane,
  BarChart3,
  Users,
} from 'lucide-react'

/**
 * The eight functional roles from the requirements doc. The backend currently
 * only models ADMIN / USER, so {@link mapAuthRole} bridges the two until the
 * full role model lands. Nav visibility is driven by these CRM roles.
 */
export type CrmRole =
  | 'Sales Rep'
  | 'Sales Manager'
  | 'Commercial Manager'
  | 'VP / Director'
  | 'R&D'
  | 'Quality'
  | 'Finance'
  | 'Admin'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  /** Stage badge so the team knows what is wired vs. planned. */
  status?: 'live' | 'soon'
  /** When set, item is only shown to these roles. Omitted = everyone. */
  roles?: CrmRole[]
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, status: 'live' }],
  },
  {
    label: 'Masters',
    items: [
      { label: 'Customers', to: '/customers', icon: Building2, status: 'live' },
      { label: 'Contacts', to: '/contacts', icon: Contact, status: 'live' },
      { label: 'Products', to: '/products', icon: Package, status: 'live' },
    ],
  },
  {
    label: 'Pipeline',
    items: [
      { label: 'Deals', to: '/deals', icon: GitBranch, status: 'live' },
      { label: 'Visits & Meetings', to: '/visits', icon: CalendarClock, status: 'live' },
    ],
  },
  {
    label: 'Activity',
    items: [
      { label: 'Documents & NDA', to: '/documents', icon: FileSignature, status: 'live' },
      {
        label: 'Samples & Testing',
        to: '/samples',
        icon: FlaskConical,
        status: 'live',
        roles: ['Sales Rep', 'Sales Manager', 'R&D', 'Quality', 'Admin'],
      },
    ],
  },
  {
    label: 'Commercial',
    items: [
      { label: 'Quotations', to: '/quotes', icon: Calculator, status: 'live' },
      { label: 'PFI', to: '/pfi', icon: ReceiptText, status: 'live' },
      {
        label: 'Purchase Orders',
        to: '/pos',
        icon: FileCheck2,
        status: 'live',
        roles: ['Sales Manager', 'Commercial Manager', 'Finance', 'Admin'],
      },
      {
        label: 'Order Execution',
        to: '/orders',
        icon: Truck,
        status: 'live',
        roles: ['Sales Manager', 'Commercial Manager', 'Finance', 'Admin'],
      },
    ],
  },
  {
    label: 'Operations',
    items: [
      {
        label: 'Readiness Tracker',
        to: '/readiness',
        icon: ClipboardCheck,
        status: 'live',
        roles: ['Sales Manager', 'Commercial Manager', 'Quality', 'R&D', 'Admin'],
      },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { label: 'Market Intelligence', to: '/market', icon: Radar, status: 'live' },
      { label: 'Travel Planner', to: '/travel', icon: Plane, status: 'live' },
      { label: 'Reports', to: '/reports', icon: BarChart3, status: 'live' },
    ],
  },
  {
    label: 'Administration',
    items: [
      {
        label: 'Users & Roles',
        to: '/admin/users',
        icon: Users,
        status: 'live',
        roles: ['Admin'],
      },
    ],
  },
]

/** Bridge the backend's ADMIN/USER to a CRM role until full RBAC exists. */
export function mapAuthRole(role: 'ADMIN' | 'USER' | null): CrmRole {
  return role === 'ADMIN' ? 'Admin' : 'Sales Rep'
}

export function isVisibleTo(item: NavItem, role: CrmRole): boolean {
  return !item.roles || item.roles.includes(role)
}
