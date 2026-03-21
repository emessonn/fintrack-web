import { useEffect, useRef } from 'react'
import { Download, Printer, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PeriodFilter } from '@/components/finance/finance-filters'
import type { Transaction } from '@/types/finance'

const PERIOD_LABELS: Record<PeriodFilter, string> = {
  '7d': 'Últimos 7 dias',
  '14d': 'Últimos 14 dias',
  '30d': 'Últimos 30 dias',
  '60d': 'Últimos 60 dias',
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

interface ReportModalProps {
  transactions: Transaction[]
  period: PeriodFilter
  onClose: () => void
}

export function ReportModal({ transactions, period, onClose }: ReportModalProps) {
  const reportRef = useRef<HTMLDivElement>(null)

  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const expense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = income - expense

  const spendingByCategory = transactions
    .filter((t) => t.type === 'expense')
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + t.amount
      return acc
    }, {})

  const sortedCategories = Object.entries(spendingByCategory).sort(
    ([, a], [, b]) => b - a,
  )

  const generatedAt = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'long',
  }).format(new Date())

  function handleExportCSV() {
    const header = 'Descrição,Categoria,Tipo,Data,Valor (R$)\n'
    const rows = transactions.map((t) =>
      [
        `"${t.description}"`,
        `"${t.category}"`,
        t.type === 'income' ? 'Entrada' : 'Saída',
        formatDate(t.createdAt),
        (t.type === 'income' ? t.amount : -t.amount).toFixed(2).replace('.', ','),
      ].join(','),
    )
    const csv = header + rows.join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `relatorio-${period}-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  function handlePrint() {
    window.print()
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .report-print, .report-print * { visibility: visible; }
          .report-print {
            position: fixed;
            inset: 0;
            overflow: auto;
            background: white;
            color: #18181b;
            padding: 2rem;
          }
          .report-print-hide { display: none !important; }
        }
      `}</style>

      <div className='fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4'>
        <button
          type='button'
          aria-label='Fechar relatório'
          className='fixed inset-0 bg-black/70 backdrop-blur-[2px]'
          onClick={onClose}
        />

        <div
          ref={reportRef}
          className='report-print relative z-10 my-4 w-full max-w-3xl rounded-2xl border border-white/10 bg-zinc-950/98 shadow-2xl'
        >
          {/* Header */}
          <div className='flex items-start justify-between gap-3 border-b border-white/10 p-5'>
            <div>
              <h2 className='text-xl font-semibold tracking-tight'>
                Relatório Financeiro
              </h2>
              <p className='text-sm text-muted-foreground'>
                {PERIOD_LABELS[period]} · Gerado em {generatedAt}
              </p>
            </div>
            <div className='report-print-hide flex items-center gap-2'>
              <Button variant='outline' size='sm' onClick={handleExportCSV}>
                <Download className='mr-1.5 h-4 w-4' />
                CSV
              </Button>
              <Button variant='outline' size='sm' onClick={handlePrint}>
                <Printer className='mr-1.5 h-4 w-4' />
                Imprimir
              </Button>
              <button
                type='button'
                onClick={onClose}
                className='rounded-md p-1.5 text-muted-foreground transition hover:bg-white/10 hover:text-foreground'
                aria-label='Fechar'
              >
                <X className='h-4 w-4' />
              </button>
            </div>
          </div>

          <div className='space-y-6 p-5'>
            {/* Summary cards */}
            <div className='grid grid-cols-3 gap-3'>
              <div className='rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4'>
                <p className='text-xs text-muted-foreground'>Total Entradas</p>
                <p className='mt-1 text-lg font-semibold text-emerald-300'>
                  {formatCurrency(income)}
                </p>
              </div>
              <div className='rounded-xl border border-rose-400/20 bg-rose-500/10 p-4'>
                <p className='text-xs text-muted-foreground'>Total Saídas</p>
                <p className='mt-1 text-lg font-semibold text-rose-300'>
                  {formatCurrency(expense)}
                </p>
              </div>
              <div
                className={`rounded-xl border p-4 ${
                  balance >= 0
                    ? 'border-blue-400/20 bg-blue-500/10'
                    : 'border-rose-400/20 bg-rose-500/10'
                }`}
              >
                <p className='text-xs text-muted-foreground'>Saldo</p>
                <p
                  className={`mt-1 text-lg font-semibold ${
                    balance >= 0 ? 'text-blue-300' : 'text-rose-300'
                  }`}
                >
                  {formatCurrency(balance)}
                </p>
              </div>
            </div>

            {/* Spending by category */}
            {sortedCategories.length > 0 && (
              <div>
                <h3 className='mb-3 text-sm font-medium text-muted-foreground'>
                  Gastos por Categoria
                </h3>
                <div className='space-y-2'>
                  {sortedCategories.map(([cat, amount]) => {
                    const pct = expense > 0 ? (amount / expense) * 100 : 0
                    return (
                      <div key={cat}>
                        <div className='mb-1 flex items-center justify-between text-sm'>
                          <span>{cat}</span>
                          <span className='font-medium text-rose-300'>
                            {formatCurrency(amount)}
                            <span className='ml-1.5 text-xs text-muted-foreground'>
                              {pct.toFixed(1)}%
                            </span>
                          </span>
                        </div>
                        <div className='h-1.5 w-full overflow-hidden rounded-full bg-white/10'>
                          <div
                            className='h-full rounded-full bg-rose-400/60'
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Transactions list */}
            <div>
              <h3 className='mb-3 text-sm font-medium text-muted-foreground'>
                Lançamentos ({transactions.length})
              </h3>

              {transactions.length === 0 ? (
                <p className='text-sm text-muted-foreground'>
                  Nenhum lançamento no período selecionado.
                </p>
              ) : (
                <div className='overflow-x-auto rounded-xl border border-white/10'>
                  <table className='w-full text-sm'>
                    <thead>
                      <tr className='border-b border-white/10'>
                        <th className='p-3 text-left font-medium text-muted-foreground'>
                          Descrição
                        </th>
                        <th className='p-3 text-left font-medium text-muted-foreground'>
                          Categoria
                        </th>
                        <th className='p-3 text-left font-medium text-muted-foreground'>
                          Data
                        </th>
                        <th className='p-3 text-right font-medium text-muted-foreground'>
                          Valor
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((t, i) => (
                        <tr
                          key={t.id}
                          className={`border-b border-white/5 last:border-0 ${
                            i % 2 !== 0 ? 'bg-white/[0.02]' : ''
                          }`}
                        >
                          <td className='p-3'>{t.description}</td>
                          <td className='p-3 text-muted-foreground'>
                            {t.category}
                          </td>
                          <td className='p-3 text-muted-foreground'>
                            {formatDate(t.createdAt)}
                          </td>
                          <td
                            className={`p-3 text-right font-medium ${
                              t.type === 'income'
                                ? 'text-emerald-300'
                                : 'text-rose-300'
                            }`}
                          >
                            {t.type === 'income' ? '+' : '-'}{' '}
                            {formatCurrency(t.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
