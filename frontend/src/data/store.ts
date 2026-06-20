import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nextDocNumber } from '@/lib/business'
import { todayIso } from '@/lib/format'
import { buildSeed, type CrmData } from './seed'
import type {
  Contact,
  Customer,
  Deal,
  DocumentRecord,
  MarketIntel,
  OrderExecution,
  Pfi,
  Product,
  PurchaseOrder,
  Quote,
  ReadinessItem,
  Sample,
  Trip,
  Visit,
} from './types'

function uid(prefix: string): string {
  const rand = (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)).slice(0, 8)
  return `${prefix}-${rand}`
}

interface CrmStore extends CrmData {
  // Customers
  addCustomer: (c: Omit<Customer, 'id' | 'createdAt'>) => Customer
  updateCustomer: (id: string, patch: Partial<Customer>) => void
  // Contacts
  addContact: (c: Omit<Contact, 'id'>) => Contact
  updateContact: (id: string, patch: Partial<Contact>) => void
  deleteContact: (id: string) => void
  // Products
  addProduct: (p: Omit<Product, 'id' | 'createdAt'>) => Product
  updateProduct: (id: string, patch: Partial<Product>) => void
  // Deals
  addDeal: (d: Omit<Deal, 'id' | 'createdAt' | 'lastActivityAt' | 'log' | 'negotiations'>) => Deal
  updateDeal: (id: string, patch: Partial<Deal>) => void
  deleteDeal: (id: string) => void
  addNegotiationRound: (dealId: string, round: Omit<Deal['negotiations'][number], 'id' | 'round'>) => void
  moveDealStage: (id: string, stage: Deal['stage']) => void
  addDealLog: (id: string, kind: Deal['log'][number]['kind'], text: string) => void
  // Visits
  addVisit: (v: Omit<Visit, 'id'>) => Visit
  // Documents
  addDocument: (d: Omit<DocumentRecord, 'id' | 'createdAt'>) => DocumentRecord
  updateDocument: (id: string, patch: Partial<DocumentRecord>) => void
  // Samples
  addSample: (s: Omit<Sample, 'id' | 'createdAt'>) => Sample
  updateSample: (id: string, patch: Partial<Sample>) => void
  reworkSample: (id: string) => Sample | undefined
  // Quotes
  addQuote: (q: Omit<Quote, 'id' | 'createdAt'>) => Quote
  updateQuote: (id: string, patch: Partial<Quote>) => void
  // PFI
  addPfi: (p: Omit<Pfi, 'id' | 'createdAt'>) => Pfi
  updatePfi: (id: string, patch: Partial<Pfi>) => void
  // PO
  addPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'createdAt'>) => PurchaseOrder
  updatePurchaseOrder: (id: string, patch: Partial<PurchaseOrder>) => void
  // Market intel
  addMarketIntel: (m: Omit<MarketIntel, 'id' | 'createdAt'>) => MarketIntel
  // Trips
  addTrip: (t: Omit<Trip, 'id' | 'createdAt'>) => Trip
  updateTrip: (id: string, patch: Partial<Trip>) => void
  // Order execution
  addOrderExecution: (o: Omit<OrderExecution, 'id' | 'createdAt'>) => OrderExecution
  updateOrderExecution: (id: string, patch: Partial<OrderExecution>) => void
  // Readiness items
  addReadinessItem: (r: Omit<ReadinessItem, 'id' | 'createdAt'>) => ReadinessItem
  updateReadinessItem: (id: string, patch: Partial<ReadinessItem>) => void
  deleteReadinessItem: (id: string) => void
  // Demo control
  resetDemo: () => void
}

export const useCrmStore = create<CrmStore>()(
  persist(
    (set, get) => ({
      ...buildSeed(),

      addCustomer: (c) => {
        const created: Customer = { ...c, id: uid('cus'), createdAt: todayIso() }
        set((s) => ({ customers: [created, ...s.customers] }))
        return created
      },
      updateCustomer: (id, patch) =>
        set((s) => ({
          customers: s.customers.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),

      addContact: (c) => {
        const created: Contact = { ...c, id: uid('con') }
        set((s) => ({ contacts: [created, ...s.contacts] }))
        return created
      },
      updateContact: (id, patch) =>
        set((s) => ({
          contacts: s.contacts.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      deleteContact: (id) =>
        set((s) => ({ contacts: s.contacts.filter((c) => c.id !== id) })),

      addProduct: (p) => {
        const created: Product = { ...p, id: uid('prd'), createdAt: todayIso() }
        set((s) => ({ products: [created, ...s.products] }))
        return created
      },
      updateProduct: (id, patch) =>
        set((s) => ({
          products: s.products.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),

      addDeal: (d) => {
        const created: Deal = {
          ...d,
          id: uid('deal'),
          createdAt: todayIso(),
          lastActivityAt: todayIso(),
          negotiations: [],
          log: [{ id: uid('lg'), date: todayIso(), kind: 'system', text: 'Deal created' }],
        }
        set((s) => ({ deals: [created, ...s.deals] }))
        return created
      },
      updateDeal: (id, patch) =>
        set((s) => ({
          deals: s.deals.map((d) => (d.id === id ? { ...d, ...patch } : d)),
        })),
      deleteDeal: (id) => set((s) => ({ deals: s.deals.filter((d) => d.id !== id) })),
      addNegotiationRound: (dealId, round) =>
        set((s) => ({
          deals: s.deals.map((d) =>
            d.id === dealId
              ? {
                  ...d,
                  lastActivityAt: todayIso(),
                  negotiations: [
                    ...d.negotiations,
                    { ...round, id: uid('ng'), round: d.negotiations.length + 1 },
                  ],
                }
              : d,
          ),
        })),
      moveDealStage: (id, stage) =>
        set((s) => ({
          deals: s.deals.map((d) =>
            d.id === id
              ? {
                  ...d,
                  stage,
                  lastActivityAt: todayIso(),
                  log: [
                    { id: uid('lg'), date: todayIso(), kind: 'stage', text: `Moved to ${stage}` },
                    ...d.log,
                  ],
                }
              : d,
          ),
        })),
      addDealLog: (id, kind, text) =>
        set((s) => ({
          deals: s.deals.map((d) =>
            d.id === id
              ? {
                  ...d,
                  lastActivityAt: todayIso(),
                  log: [{ id: uid('lg'), date: todayIso(), kind, text }, ...d.log],
                }
              : d,
          ),
        })),

      addVisit: (v) => {
        const created: Visit = { ...v, id: uid('vis') }
        set((s) => ({ visits: [created, ...s.visits] }))
        if (v.dealId) {
          get().addDealLog(v.dealId, 'visit', `${v.type} — ${v.purpose}`)
        }
        return created
      },

      addDocument: (d) => {
        const created: DocumentRecord = { ...d, id: uid('doc'), createdAt: todayIso() }
        set((s) => ({ documents: [created, ...s.documents] }))
        return created
      },
      updateDocument: (id, patch) =>
        set((s) => ({
          documents: s.documents.map((d) => (d.id === id ? { ...d, ...patch } : d)),
        })),

      addSample: (sample) => {
        const id = nextDocNumber('SAM', get().samples.map((x) => x.id))
        const created: Sample = { ...sample, id, createdAt: todayIso() }
        set((s) => ({ samples: [created, ...s.samples] }))
        return created
      },
      updateSample: (id, patch) =>
        set((s) => ({
          samples: s.samples.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        })),
      reworkSample: (id) => {
        const original = get().samples.find((x) => x.id === id)
        if (!original) return undefined
        const newId = nextDocNumber('SAM', get().samples.map((x) => x.id))
        const created: Sample = {
          ...original,
          id: newId,
          version: original.version + 1,
          status: 'Not Started',
          delivered: false,
          resultSummary: undefined,
          customerFeedback: undefined,
          issues: [],
          finalResult: undefined,
          dispatchDate: todayIso(),
          createdAt: todayIso(),
        }
        set((s) => ({
          samples: [
            created,
            ...s.samples.map((x) => (x.id === id ? { ...x, status: 'Failed' as const } : x)),
          ],
        }))
        return created
      },

      addQuote: (q) => {
        const id = nextDocNumber('QOT', get().quotes.map((x) => x.id))
        const created: Quote = { ...q, id, createdAt: todayIso() }
        set((s) => ({ quotes: [created, ...s.quotes] }))
        return created
      },
      updateQuote: (id, patch) =>
        set((s) => ({
          quotes: s.quotes.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        })),

      addPfi: (p) => {
        const id = nextDocNumber('PFI', get().pfis.map((x) => x.id))
        const created: Pfi = { ...p, id, createdAt: todayIso() }
        set((s) => ({ pfis: [created, ...s.pfis] }))
        return created
      },
      updatePfi: (id, patch) =>
        set((s) => ({
          pfis: s.pfis.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        })),

      addPurchaseOrder: (po) => {
        const created: PurchaseOrder = { ...po, id: uid('PO'), createdAt: todayIso() }
        set((s) => ({ purchaseOrders: [created, ...s.purchaseOrders] }))
        return created
      },
      updatePurchaseOrder: (id, patch) =>
        set((s) => ({
          purchaseOrders: s.purchaseOrders.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        })),

      addMarketIntel: (m) => {
        const created: MarketIntel = { ...m, id: uid('mi'), createdAt: todayIso() }
        set((s) => ({ marketIntel: [created, ...s.marketIntel] }))
        return created
      },

      addTrip: (t) => {
        const created: Trip = { ...t, id: uid('trip'), createdAt: todayIso() }
        set((s) => ({ trips: [created, ...s.trips] }))
        return created
      },
      updateTrip: (id, patch) =>
        set((s) => ({
          trips: s.trips.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        })),

      addOrderExecution: (o) => {
        const created: OrderExecution = { ...o, id: uid('oe'), createdAt: todayIso() }
        set((s) => ({ orderExecutions: [created, ...s.orderExecutions] }))
        return created
      },
      updateOrderExecution: (id, patch) =>
        set((s) => ({
          orderExecutions: s.orderExecutions.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        })),

      addReadinessItem: (r) => {
        const created: ReadinessItem = { ...r, id: uid('rd'), createdAt: todayIso() }
        set((s) => ({ readinessItems: [created, ...s.readinessItems] }))
        return created
      },
      updateReadinessItem: (id, patch) =>
        set((s) => ({
          readinessItems: s.readinessItems.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        })),
      deleteReadinessItem: (id) =>
        set((s) => ({ readinessItems: s.readinessItems.filter((x) => x.id !== id) })),

      resetDemo: () => set({ ...buildSeed() }),
    }),
    { name: 'kryon-crm-data', version: 2 },
  ),
)

// ── Convenience lookups (non-hook helpers) ──────────────────────────────
export function customerName(id: string): string {
  return useCrmStore.getState().customers.find((c) => c.id === id)?.companyName ?? '—'
}
export function productName(id: string): string {
  const p = useCrmStore.getState().products.find((x) => x.id === id)
  return p ? `${p.modelName} (${p.sku})` : '—'
}
