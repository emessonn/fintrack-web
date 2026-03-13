import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Transaction } from '@/types/finance'

interface TransactionsTableProps {
  transactions: Transaction[]
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  return (
    <Card className='glass animate-fade-up rounded-2xl bg-white/[0.02] [animation-delay:120ms]'>
      <CardHeader>
        <CardTitle>Entradas e saidas</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className='rounded-xl border border-dashed border-white/15 bg-black/20 p-6 text-center text-sm text-muted-foreground'>
            Ainda nao existem lancamentos. Adicione sua primeira entrada ou
            saida.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descricao</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className='text-right'>Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className='font-medium'>
                    {transaction.description}
                  </TableCell>
                  <TableCell className='text-muted-foreground'>
                    {transaction.category}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant='outline'
                      className={
                        transaction.type === 'income'
                          ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300'
                          : 'border-rose-400/40 bg-rose-500/10 text-rose-300'
                      }
                    >
                      {transaction.type === 'income' ? 'Entrada' : 'Saida'}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-muted-foreground'>
                    {formatDate(transaction.createdAt)}
                  </TableCell>
                  <TableCell
                    className={`text-right font-semibold ${
                      transaction.type === 'income'
                        ? 'text-emerald-300'
                        : 'text-rose-300'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}{' '}
                    {formatCurrency(transaction.amount)}
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
