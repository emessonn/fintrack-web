import { CheckCheck, PencilLine, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DropdownSelect } from '@/components/ui/dropdown-select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Bill, BillRecurrence, BillStatus } from '@/types/finance'

interface BillsTableProps {
  title?: string
  emptyMessage?: string
  bills: Bill[]
  markingPaidId?: string | null
  editingRecurrenceId?: string | null
  deletingId?: string | null
  onMarkAsPaid: (billId: string) => void
  onChangeRecurrence: (billId: string, recurrence: BillRecurrence) => void
  onDelete: (billId: string) => void
}

const RECURRENCE_OPTIONS: Array<{
  value: BillRecurrence
  label: string
}> = [
  { value: 'none', label: 'Unica' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensal' },
  { value: 'yearly', label: 'Anual' },
]

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr
    .split('-')
    .map((item) =>
      item.includes('T') ? Number(item.split('T')[0]) : Number(item),
    )
  console.log('parsed date', { year, month, day })
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(year, month - 1, day))
}

const STATUS_LABEL: Record<BillStatus, string> = {
  pending: 'Pendente',
  overdue: 'Vencida',
  paid: 'Paga',
}

const STATUS_CLASS: Record<BillStatus, string> = {
  pending: 'border-amber-400/40 bg-amber-500/10 text-amber-300',
  overdue: 'border-rose-400/40 bg-rose-500/10 text-rose-300',
  paid: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300',
}

function recurrenceLabel(recurrence: Bill['recurrence']) {
  if (recurrence === 'weekly') return 'Semanal'
  if (recurrence === 'monthly') return 'Mensal'
  if (recurrence === 'yearly') return 'Anual'
  return 'Unica'
}

function recurrenceClass(recurrence: Bill['recurrence']) {
  if (recurrence === 'weekly') {
    return 'border-sky-400/40 bg-sky-500/10 text-sky-300'
  }

  if (recurrence === 'monthly') {
    return 'border-fuchsia-400/40 bg-fuchsia-500/10 text-fuchsia-300'
  }

  if (recurrence === 'yearly') {
    return 'border-cyan-400/40 bg-cyan-500/10 text-cyan-300'
  }

  return 'border-white/15 bg-white/5 text-muted-foreground'
}

export function BillsTable({
  title = 'Contas a pagar',
  emptyMessage = 'Nenhuma conta cadastrada. Adicione sua primeira conta a pagar.',
  bills,
  markingPaidId,
  editingRecurrenceId,
  deletingId,
  onMarkAsPaid,
  onChangeRecurrence,
  onDelete,
}: BillsTableProps) {
  return (
    <Card className='glass animate-fade-up rounded-2xl bg-white/[0.02] [animation-delay:120ms]'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {bills.length === 0 ? (
          <div className='rounded-xl border border-dashed border-white/15 bg-black/20 p-6 text-center text-sm text-muted-foreground'>
            {emptyMessage}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descricao</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Recorrencia</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className='text-right'>Valor</TableHead>
                <TableHead className='text-right'>Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bills.map((bill) => (
                <TableRow key={bill.id}>
                  <TableCell className='font-medium'>
                    {bill.description}
                  </TableCell>
                  <TableCell className='text-muted-foreground'>
                    {bill.category}
                  </TableCell>
                  <TableCell className='text-muted-foreground'>
                    {formatDate(bill.dueDate)}
                  </TableCell>
                  <TableCell className='text-muted-foreground'>
                    <div className='space-y-2'>
                      <Badge
                        variant='outline'
                        className={recurrenceClass(bill.recurrence)}
                      >
                        {recurrenceLabel(bill.recurrence)}
                      </Badge>

                      <div className='relative'>
                        <DropdownSelect
                          value={bill.recurrence ?? 'none'}
                          onValueChange={(value) =>
                            onChangeRecurrence(bill.id, value)
                          }
                          options={RECURRENCE_OPTIONS}
                          disabled={editingRecurrenceId === bill.id}
                          triggerClassName='h-8 min-w-28 rounded-lg px-2 pr-2 text-xs'
                          contentClassName='min-w-28'
                        />
                        <PencilLine className='pointer-events-none absolute right-2 top-2 h-3.5 w-3.5 text-muted-foreground' />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant='outline'
                      className={STATUS_CLASS[bill.status]}
                    >
                      {STATUS_LABEL[bill.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-right font-medium'>
                    {formatCurrency(bill.amount)}
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='flex items-center justify-end gap-1'>
                      {bill.status !== 'paid' && (
                        <Button
                          type='button'
                          size='icon'
                          variant='ghost'
                          disabled={markingPaidId === bill.id}
                          onClick={() => onMarkAsPaid(bill.id)}
                          className='h-8 w-8 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300'
                          title='Marcar como paga'
                        >
                          <CheckCheck className='h-4 w-4' />
                        </Button>
                      )}
                      <Button
                        type='button'
                        size='icon'
                        variant='ghost'
                        disabled={deletingId === bill.id}
                        onClick={() => onDelete(bill.id)}
                        className='h-8 w-8 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300'
                        title='Excluir conta'
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
