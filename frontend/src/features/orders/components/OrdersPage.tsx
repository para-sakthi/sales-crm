import { Plus, Truck } from 'lucide-react'
import { useDisclosure } from '@/components/ui/use-disclosure'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PageHeader } from '@/features/shell'
import { KpiCard } from '@/features/dashboard'
import { formatInr, formatDate } from '@/lib/format'
import { useCrmStore, customerName, type DispatchStatus, type ExecPaymentStatus, type OrderExecution } from '@/data'
import { OrderExecutionDrawer } from './OrderExecutionDrawer'

const dispatchTone: Record<DispatchStatus, 'pass' | 'warn' | 'default'> = {
  Delivered: 'pass',
  Dispatched: 'pass',
  'In Production': 'warn',
  Pending: 'default',
}
const payTone: Record<ExecPaymentStatus, 'pass' | 'warn' | 'block'> = {
  Paid: 'pass',
  'Partially Paid': 'warn',
  Unpaid: 'block',
}

export default function OrdersPage() {
  const orders = useCrmStore((s) => s.orderExecutions)
  const panel = useDisclosure<OrderExecution>()

  const invoiced = orders.reduce((s, o) => s + (o.invoiceAmount ?? 0), 0)
  const collected = orders.reduce((s, o) => s + (o.amountReceived ?? 0), 0)
  const outstanding = Math.max(0, invoiced - collected)
  const inExecution = orders.filter((o) => o.dispatchStatus !== 'Delivered').length

  return (
    <div>
      <PageHeader
        eyebrow="Fulfilment"
        title="Order Execution"
        description="Post-win execution — production, dispatch, invoicing and payment collection."
        actions={
          <Button onClick={() => panel.show()}>
            <Plus className="size-4" />
            New Order
          </Button>
        }
      />
      <div className="space-y-6 p-6">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard kpi={{ key: 'invoiced', label: 'Total Invoiced', value: formatInr(invoiced) }} />
          <KpiCard kpi={{ key: 'collected', label: 'Collected', value: formatInr(collected), tone: 'pass' }} />
          <KpiCard kpi={{ key: 'outstanding', label: 'Outstanding', value: formatInr(outstanding), tone: outstanding > 0 ? 'warn' : 'default' }} />
          <KpiCard kpi={{ key: 'in-exec', label: 'Orders In Execution', value: String(inExecution), hint: `${orders.length} total` }} />
        </section>

        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>PO</TableHead>
                <TableHead>Dispatch</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Outstanding</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => {
                const out = Math.max(0, (o.invoiceAmount ?? 0) - (o.amountReceived ?? 0))
                return (
                  <TableRow key={o.id} className="cursor-pointer" onClick={() => panel.show(o)}>
                    <TableCell className="font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        <Truck className="size-3.5 text-muted-foreground" />
                        {customerName(o.customerId)}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{o.poId ?? '—'}</TableCell>
                    <TableCell><Badge tone={dispatchTone[o.dispatchStatus]}>{o.dispatchStatus}</Badge></TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {o.dispatchedQty != null ? `${o.dispatchedQty.toLocaleString('en-IN')}` : '—'}
                      {o.orderedQty != null && <span className="text-muted-foreground"> / {o.orderedQty.toLocaleString('en-IN')}</span>}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {o.invoiceNumber ?? '—'}
                      {o.invoiceDate && <span className="block text-[10px]">{formatDate(o.invoiceDate)}</span>}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">{o.invoiceAmount != null ? formatInr(o.invoiceAmount) : '—'}</TableCell>
                    <TableCell><Badge tone={payTone[o.paymentStatus]}>{o.paymentStatus}</Badge></TableCell>
                    <TableCell className={`text-right font-mono text-xs font-semibold ${out > 0 ? 'text-warn' : 'text-pass'}`}>{formatInr(out)}</TableCell>
                  </TableRow>
                )
              })}
              {orders.length === 0 && (
                <TableRow><TableCell colSpan={8} className="py-10 text-center text-muted-foreground">No orders in execution yet. Win a deal, then create an order.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {panel.mounted && <OrderExecutionDrawer open={panel.open} order={panel.data} onClose={panel.close} />}
    </div>
  )
}
