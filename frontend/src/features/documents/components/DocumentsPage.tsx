import { Plus, FileText, CheckCircle2 } from 'lucide-react'
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
import { formatDate } from '@/lib/format'
import { useCrmStore, customerName, type DocStatus } from '@/data'
import { DocumentFormDrawer } from './DocumentFormDrawer'

const statusTone: Record<DocStatus, 'pass' | 'warn' | 'default' | 'block'> = {
  Signed: 'pass',
  Sent: 'warn',
  Draft: 'default',
  Expired: 'block',
}

export default function DocumentsPage() {
  const documents = useCrmStore((s) => s.documents)
  const updateDocument = useCrmStore((s) => s.updateDocument)
  const panel = useDisclosure()

  return (
    <div>
      <PageHeader
        eyebrow="Activity"
        title="Documents & NDA Exchange"
        description="Track every document sent and received, with signature status."
        actions={
          <Button onClick={() => panel.show()}>
            <Plus className="size-4" />
            Record Document
          </Button>
        }
      />
      <div className="p-6">
        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Direction</TableHead>
                <TableHead className="text-center">Ver</TableHead>
                <TableHead>Validity</TableHead>
                <TableHead>Signed</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      <FileText className="size-3.5 text-muted-foreground" />
                      {d.fileName}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{customerName(d.customerId)}</TableCell>
                  <TableCell><Badge tone="outline">{d.type}</Badge></TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{d.direction}</TableCell>
                  <TableCell className="text-center font-mono text-xs">v{d.version}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{formatDate(d.validityDate)}</TableCell>
                  <TableCell>{d.signedCopy ? <CheckCircle2 className="size-4 text-pass" /> : <span className="text-muted-foreground">—</span>}</TableCell>
                  <TableCell>
                    <select
                      value={d.status}
                      onChange={(e) => updateDocument(d.id, { status: e.target.value as DocStatus })}
                      className="cursor-pointer rounded-md border-0 bg-transparent p-0 text-xs outline-none"
                    >
                      {(['Draft', 'Sent', 'Signed', 'Expired'] as DocStatus[]).map((s) => <option key={s}>{s}</option>)}
                    </select>
                    <Badge tone={statusTone[d.status]} className="ml-1 hidden sm:inline-flex">{d.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {documents.length === 0 && (
                <TableRow><TableCell colSpan={8} className="py-10 text-center text-muted-foreground">No documents yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {panel.mounted && <DocumentFormDrawer open={panel.open} onClose={panel.close} />}
    </div>
  )
}
