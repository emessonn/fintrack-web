import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { PeriodFilter } from '@/components/finance/finance-filters'
import type { Transaction } from '@/types/finance'

interface EvolutionChartProps {
  transactions: Transaction[]
  period: PeriodFilter
}

function toLocalDayKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getDaysForPeriod(period: PeriodFilter) {
  const count =
    period === '7d' ? 7 : period === '14d' ? 14 : period === '30d' ? 30 : 60
  const days: string[] = []

  for (let index = count - 1; index >= 0; index -= 1) {
    const date = new Date()
    date.setDate(date.getDate() - index)
    days.push(toLocalDayKey(date))
  }

  return days
}

function getTickDays(days: string[], maxLabels: number) {
  if (days.length <= maxLabels) {
    return days
  }

  const ticks = [days[0]]
  const interval = (days.length - 1) / (maxLabels - 1)

  for (let index = 1; index < maxLabels - 1; index += 1) {
    const dayIndex = Math.round(interval * index)
    const day = days[dayIndex]

    if (day && day !== ticks[ticks.length - 1]) {
      ticks.push(day)
    }
  }

  const lastDay = days[days.length - 1]

  if (ticks[ticks.length - 1] !== lastDay) {
    ticks.push(lastDay)
  }

  return ticks
}

function formatLabel(dateIso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(`${dateIso}T00:00:00`))
}

export function EvolutionChart({ transactions, period }: EvolutionChartProps) {
  const days = getDaysForPeriod(period)
  const tickDays = getTickDays(days, period === '7d' ? 7 : 8)

  const dailyTotals = transactions.reduce<Record<string, number>>(
    (acc, transaction) => {
      const dayKey = toLocalDayKey(new Date(transaction.createdAt))
      const signedAmount =
        transaction.type === 'income' ? transaction.amount : -transaction.amount

      acc[dayKey] = (acc[dayKey] ?? 0) + signedAmount

      return acc
    },
    {},
  )

  const cumulative = days.reduce<number[]>((acc, dayKey, index) => {
    const dayTotal = dailyTotals[dayKey] ?? 0

    const previous = index > 0 ? acc[index - 1] : 0
    acc.push(previous + dayTotal)
    return acc
  }, [])

  const min = Math.min(...cumulative, 0)
  const max = Math.max(...cumulative, 1)
  const range = max - min || 1

  const points = cumulative
    .map((value, index) => {
      const x = (index / (cumulative.length - 1 || 1)) * 100
      const y = 100 - ((value - min) / range) * 100
      return `${x},${y}`
    })
    .join(' ')

  return (
    <Card className='glass animate-fade-up rounded-2xl bg-white/[0.02] [animation-delay:140ms]'>
      <CardHeader>
        <CardTitle>
          Evolucao do saldo (
          {period === '7d'
            ? '7 dias'
            : period === '14d'
              ? '14 dias'
              : period === '30d'
                ? '30 dias'
                : '60 dias'}
          )
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='h-40 w-full rounded-xl border border-white/10 bg-black/15 p-3'>
          <svg
            viewBox='0 0 100 100'
            preserveAspectRatio='none'
            className='h-full w-full'
          >
            <defs>
              <linearGradient id='balanceGradient' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='0%' stopColor='rgba(19,255,196,0.35)' />
                <stop offset='100%' stopColor='rgba(19,255,196,0.04)' />
              </linearGradient>
            </defs>
            <polyline
              fill='none'
              stroke='rgba(125, 255, 222, 0.95)'
              strokeWidth='1.8'
              points={points}
            />
            <polygon
              fill='url(#balanceGradient)'
              points={`0,100 ${points} 100,100`}
            />
          </svg>
        </div>

        <div className='mt-2 flex w-full items-center justify-between gap-2 overflow-hidden text-[11px] text-muted-foreground'>
          {tickDays.map((day, index) => (
            <span
              key={`${day}-${index}`}
              className={`min-w-0 flex-1 truncate whitespace-nowrap ${
                index === 0
                  ? 'text-left'
                  : index === tickDays.length - 1
                    ? 'text-right'
                    : 'text-center'
              }`}
            >
              {formatLabel(day)}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
