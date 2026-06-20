import type {
  ApprovalTier,
  BomBuildUp,
  GstRate,
  PfiLineItem,
  PoLineItem,
} from '@/data/types'
import { daysSince } from './format'

// ── Rule #8: GSTIN validation ──────────────────────────────────────────
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/

export function isValidGstin(value: string): boolean {
  return GSTIN_REGEX.test(value.trim().toUpperCase())
}

export function gstinStateCode(value: string): string | null {
  return isValidGstin(value) ? value.trim().slice(0, 2) : null
}

// ── Rule #1: Cold-lead auto-flag (no activity for 14+ days) ─────────────
export const COLD_LEAD_DAYS = 14

export function isColdCandidate(stage: string, lastActivityAt: string): boolean {
  return stage === 'Lead - Hot' && daysSince(lastActivityAt) >= COLD_LEAD_DAYS
}

// ── Rule #6: Price advantage % ──────────────────────────────────────────
// (customer_current_price - our_quoted_price) / customer_current_price * 100
export function priceAdvantagePct(customerPrice: number, ourPrice: number): number {
  if (!customerPrice) return 0
  return ((customerPrice - ourPrice) / customerPrice) * 100
}

// ── Rule #7: Estimated annual value = qty * our price ───────────────────
export function estimatedAnnualValue(quantity: number, unitPrice: number): number {
  return quantity * unitPrice
}

// ── Rule #2: GST calc (CGST+SGST same state, else IGST) ─────────────────
export interface GstBreakup {
  taxable: number
  cgst: number
  sgst: number
  igst: number
  total: number
}

export function computeGst(
  taxableAmount: number,
  rate: GstRate,
  sameState: boolean,
): GstBreakup {
  const tax = (taxableAmount * rate) / 100
  if (sameState) {
    const half = tax / 2
    return { taxable: taxableAmount, cgst: half, sgst: half, igst: 0, total: taxableAmount + tax }
  }
  return { taxable: taxableAmount, cgst: 0, sgst: 0, igst: tax, total: taxableAmount + tax }
}

export function lineTaxable(line: PfiLineItem): number {
  return line.quantity * line.unitPrice * (1 - line.discountPct / 100)
}

export interface PfiTotals extends GstBreakup {
  grandTotal: number
}

export function computePfiTotals(lines: PfiLineItem[], sameState: boolean): PfiTotals {
  let taxable = 0
  let cgst = 0
  let sgst = 0
  let igst = 0
  for (const line of lines) {
    const t = lineTaxable(line)
    const g = computeGst(t, line.gstRate, sameState)
    taxable += t
    cgst += g.cgst
    sgst += g.sgst
    igst += g.igst
  }
  const grandTotal = taxable + cgst + sgst + igst
  return { taxable, cgst, sgst, igst, total: grandTotal, grandTotal }
}

// ── Rule #3: Discount approval routing ──────────────────────────────────
export function discountPct(listPrice: number, quotedPrice: number): number {
  if (!listPrice) return 0
  return ((listPrice - quotedPrice) / listPrice) * 100
}

export function approvalTier(discount: number): ApprovalTier {
  if (discount <= 10) return 'Auto-approved'
  if (discount <= 15) return 'Sales Manager'
  if (discount <= 25) return 'VP / Director'
  return 'CEO'
}

// ── BOM pricing (Quote engine, mirrors the prototype) ───────────────────
export function totalBom(bom: BomBuildUp): number {
  return bom.rawMaterial + bom.conversion + bom.consumables + bom.packaging + bom.freight
}

/** target_selling_price = BOM / (1 - margin%) */
export function targetSellingPrice(bom: BomBuildUp, marginPct: number): number {
  const m = Math.min(Math.max(marginPct, 0), 99) / 100
  return totalBom(bom) / (1 - m)
}

export function realizedMarginPct(bom: BomBuildUp, sellingPrice: number): number {
  if (!sellingPrice) return 0
  return ((sellingPrice - totalBom(bom)) / sellingPrice) * 100
}

/** Where the price sits inside the market band, clamped 0–100%. */
export function marketPositionPct(price: number, low: number, high: number): number {
  if (high <= low) return 50
  return Math.min(Math.max(((price - low) / (high - low)) * 100, 0), 100)
}

// ── Rule #4: Auto-numbering ─────────────────────────────────────────────
export function nextDocNumber(prefix: string, existingIds: string[]): string {
  const year = new Date().getFullYear()
  const yearPrefix = `${prefix}-${year}-`
  const max = existingIds
    .filter((id) => id.startsWith(yearPrefix))
    .map((id) => parseInt(id.slice(yearPrefix.length), 10))
    .reduce((acc, n) => (Number.isFinite(n) && n > acc ? n : acc), 0)
  return `${yearPrefix}${String(max + 1).padStart(4, '0')}`
}

// ── Rule #5: PO vs PFI line matching ────────────────────────────────────
export interface PoMatchResult {
  index: number
  qtyMismatch: boolean
  priceMismatch: boolean
}

export function matchPoToPfi(po: PoLineItem[], pfi: PfiLineItem[]): PoMatchResult[] {
  return po.map((line, index) => {
    const ref = pfi[index]
    return {
      index,
      qtyMismatch: !ref || ref.quantity !== line.quantity,
      priceMismatch: !ref || Math.abs(ref.unitPrice - line.unitPrice) > 0.01,
    }
  })
}

export function hasAnyMismatch(results: PoMatchResult[]): boolean {
  return results.some((r) => r.qtyMismatch || r.priceMismatch)
}
