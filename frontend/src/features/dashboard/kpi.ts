export interface Kpi {
  key: string
  label: string
  value: string
  hint?: string
  delta?: { value: string; direction: 'up' | 'down' | 'flat' }
  tone?: 'default' | 'pass' | 'warn' | 'block'
}
