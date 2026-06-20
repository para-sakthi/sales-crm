import { useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { useDisclosure } from '@/components/ui/use-disclosure'
import { formatInrFull } from '@/lib/format'
import { useCrmStore, type Product } from '@/data'
import { ProductFormDrawer } from './ProductFormDrawer'

export default function ProductsPage() {
  const products = useCrmStore((s) => s.products)
  const [query, setQuery] = useState('')
  const form = useDisclosure<Product>()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return products
    return products.filter(
      (p) => p.sku.toLowerCase().includes(q) || p.modelName.toLowerCase().includes(q),
    )
  }, [products, query])

  return (
    <div>
      <PageHeader
        eyebrow="Masters"
        title="Product Master — Kryon SKUs"
        description="Kryon's own BLDC motor-controller catalogue."
        actions={
          <Button onClick={() => form.show()}>
            <Plus className="size-4" />
            New Product
          </Button>
        }
      />
      <div className="space-y-4 p-6">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search SKU or model…" className="pl-9" />
        </div>

        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">V / W</TableHead>
                <TableHead className="text-center">Poles</TableHead>
                <TableHead>Sensor</TableHead>
                <TableHead>HSN</TableHead>
                <TableHead className="text-right">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id} className="cursor-pointer" onClick={() => form.show(p)}>
                  <TableCell className="font-mono text-xs font-medium">{p.sku}</TableCell>
                  <TableCell className="font-medium">{p.modelName}</TableCell>
                  <TableCell><Badge tone="outline">{p.motorType}</Badge></TableCell>
                  <TableCell className="text-right font-mono text-xs tabular-nums">{p.voltage}V / {p.wattage}W</TableCell>
                  <TableCell className="text-center font-mono text-xs">{p.poles}</TableCell>
                  <TableCell className="text-muted-foreground">{p.sensorType}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{p.hsnCode}</TableCell>
                  <TableCell className="text-right font-mono text-sm tabular-nums">{formatInrFull(p.sellingPrice)}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">No products found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {form.mounted && (
        <ProductFormDrawer key={form.data?.id ?? 'new'} open={form.open} onClose={form.close} product={form.data} />
      )}
    </div>
  )
}
