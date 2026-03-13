import { useMemo } from 'react'
import { Activity, PiggyBank, TrendingDown, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { PeriodFilter } from '@/components/finance/finance-filters'
import type { Transaction } from '@/types/finance'

interface FinancialInsightsProps {
  transactions: Transaction[]
  period: PeriodFilter
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function periodDays(period: PeriodFilter) {
  return period === '7d'
    ? 7
    : period === '14d'
      ? 14
      : period === '30d'
        ? 30
        : 60
}

export function FinancialInsights({
  transactions,
  period,
}: FinancialInsightsProps) {
  const stats = useMemo(() => {
    const days = periodDays(period)
    const expenses = transactions.filter((t) => t.type === 'expense')
    const incomes = transactions.filter((t) => t.type === 'income')

    const totalExpense = expenses.reduce((s, t) => s + t.amount, 0)
    const totalIncome = incomes.reduce((s, t) => s + t.amount, 0)
    const avgDailyExpense = days > 0 ? totalExpense / days : 0

    const maxExpense =
      expenses.length > 0
        ? expenses.reduce((max, t) => (t.amount > max.amount ? t : max))
        : null

    const savingsRate =
      totalIncome > 0
        ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100)
        : null

    return {
      txCount: transactions.length,
      avgDailyExpense,
      maxExpense,
      savingsRate,
    }
  }, [transactions, period])

  const items = [
    {
      label: 'Lancamentos',
      value: String(stats.txCount),
      sub: 'no periodo',
      icon: Activity,
      accent: 'text-cyan-400',
      valueClass: '',
    },
    {
      label: 'Gasto medio/dia',
      value: formatCurrency(stats.avgDailyExpense),
      sub: `em ${periodDays(period)} dias`,
      icon: TrendingDown,
      accent: 'text-amber-400',
      valueClass: 'text-base',
    },
    {
      label: 'Maior gasto',
      value: stats.maxExpense ? formatCurrency(stats.maxExpense.amount) : '—',
      sub: stats.maxExpense
        ? stats.maxExpense.description.length > 22
          ? `${stats.maxExpense.description.slice(0, 22)}…`
          : stats.maxExpense.description
        : 'nenhum',
      icon: Zap,
      accent: 'text-rose-400',
      valueClass: 'text-base',
    },
    {
      label: 'Taxa de economia',
      value:
        stats.savingsRate != null ? `${Math.max(0, stats.savingsRate)}%` : '—',
      sub:
        stats.savingsRate == null
          ? 'sem receita'
          : stats.savingsRate < 0
            ? 'acima da renda'
            : 'da renda poupada',
      icon: PiggyBank,
      accent:
        stats.savingsRate == null
          ? 'text-muted-foreground'
          : stats.savingsRate >= 20
            ? 'text-emerald-400'
            : 'text-amber-400',
      valueClass: cn(
        stats.savingsRate != null && stats.savingsRate < 0 && 'text-rose-400',
      ),
    },
  ]

  return (
    <Card className='glass animate-fade-up rounded-2xl bg-white/[0.02] [animation-delay:80ms]'>
      <CardHeader className='pb-2'>
        <CardTitle className='text-base'>Resumo do periodo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
          {items.map(
            ({ label, value, sub, icon: Icon, accent, valueClass }) => (
              <div
                key={label}
                className='flex flex-col gap-0.5 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5'
              >
                <div className='mb-1 flex items-center justify-between'>
                  <span className='text-xs text-muted-foreground'>{label}</span>
                  <Icon className={cn('h-3.5 w-3.5', accent)} />
                </div>
                <span
                  className={cn(
                    'text-lg font-semibold tabular-nums leading-tight',
                    valueClass,
                  )}
                >
                  {value}
                </span>
                <span className='truncate text-xs text-muted-foreground'>
                  {sub}
                </span>
              </div>
            ),
          )}
        </div>
      </CardContent>
    </Card>
  )
}
