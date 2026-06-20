/** Indian-format currency, compacting to Lakh / Crore where sensible. */
export function formatInr(value: number, opts?: { compact?: boolean }): string {
  if (opts?.compact ?? true) {
    if (Math.abs(value) >= 1_00_00_000) return `₹${(value / 1_00_00_000).toFixed(2)} Cr`
    if (Math.abs(value) >= 1_00_000) return `₹${(value / 1_00_000).toFixed(1)} L`
  }
  return `₹${Math.round(value).toLocaleString('en-IN')}`
}

export function formatInrFull(value: number): string {
  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}

export function formatDate(iso?: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function daysSince(iso: string): number {
  const ms = Date.now() - new Date(iso).getTime()
  return Math.floor(ms / (1000 * 60 * 60 * 24))
}

export function todayIso(): string {
  return new Date().toISOString()
}

/** Convert a number to Indian-English words (for PFI grand totals). */
export function amountInWords(amount: number): string {
  const rupees = Math.floor(amount)
  if (rupees === 0) return 'Zero Rupees Only'

  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen',
  ]
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

  const twoDigits = (n: number): string => {
    if (n < 20) return ones[n]
    return `${tens[Math.floor(n / 10)]}${n % 10 ? ' ' + ones[n % 10] : ''}`
  }
  const threeDigits = (n: number): string => {
    const h = Math.floor(n / 100)
    const r = n % 100
    return `${h ? ones[h] + ' Hundred' + (r ? ' ' : '') : ''}${r ? twoDigits(r) : ''}`
  }

  let words = ''
  const crore = Math.floor(rupees / 1_00_00_000)
  const lakh = Math.floor((rupees % 1_00_00_000) / 1_00_000)
  const thousand = Math.floor((rupees % 1_00_000) / 1000)
  const hundred = rupees % 1000

  if (crore) words += `${twoDigits(crore)} Crore `
  if (lakh) words += `${twoDigits(lakh)} Lakh `
  if (thousand) words += `${twoDigits(thousand)} Thousand `
  if (hundred) words += threeDigits(hundred)

  return `${words.trim()} Rupees Only`
}
