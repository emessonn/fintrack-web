import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { PeriodFilter } from '@/components/finance/finance-filters'
import type { Transaction } from '@/types/finance'

interface IncomeExpenseChartProps {
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
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    days.push(toLocalDayKey(date))
  }
  return days
}

function getTickDays(days: string[], maxLabels: number) {
  if (days.length <= maxLabels) return days
  const ticks = [days[0]]
  const interval = (days.length - 1) / (maxLabels - 1)
  for (let i = 1; i < maxLabels - 1; i++) {
    const idx = Math.round(interval * i)
    const d = days[idx]
    if (d && d !== ticks[ticks.length - 1]) ticks.push(d)
  }
  const last = days[days.length - 1]
  if (ticks[ticks.length - 1] !== last) ticks.push(last)
  return ticks
}

function formatLabel(dateIso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(`${dateIso}T00:00:00`))
}

const CHART_H = 180
const CHART_W = 1000

export function IncomeExpenseChart({
  transactions,
  period,
}: IncomeExpenseChartProps) {
  const days = getDaysForPeriod(period)
  const maxTickLabels = period === '7d' ? 7 : 8
  const tickDays = getTickDays(days, maxTickLabels)

  const { dailyData, maxValue, negCount } = useMemo(() => {
    const incomeMap: Record<string, number> = {}
    const expenseMap: Record<string, number> = {}

    for (const t of transactions) {
      const key = toLocalDayKey(new Date(t.createdAt))
      if (t.type === 'income') {
        incomeMap[key] = (incomeMap[key] ?? 0) + t.amount
      } else {
        expenseMap[key] = (expenseMap[key] ?? 0) + t.amount
      }
    }

    const data = days.map((day) => ({
      day,
      income: incomeMap[day] ?? 0,
      expense: expenseMap[day] ?? 0,
    }))

    const maxVal = Math.max(...data.flatMap((d) => [d.income, d.expense]), 1)
    const neg = data.filter(
      (d) => d.expense > d.income && (d.income > 0 || d.expense > 0),
    ).length

    return { dailyData: data, maxValue: maxVal, negCount: neg }
  }, [transactions, days])

  const n = days.length
  const groupW = CHART_W / n
  const barW = groupW * 0.42
  const gap = groupW * 0.04

  const gridYs = [0, 0.25, 0.5, 0.75, 1].map((pct) => CHART_H - pct * CHART_H)

  const hasData = transactions.length > 0

  return (
    <Card className='glass animate-fade-up rounded-2xl bg-white/[0.02] [animation-delay:140ms]'>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle>Entradas vs Saidas</CardTitle>
          <div className='flex items-center gap-4 text-xs text-muted-foreground'>
            <span className='flex items-center gap-1.5'>
              <span className='h-2 w-3 rounded-sm bg-emerald-500/80' />
              Entradas
            </span>
            <span className='flex items-center gap-1.5'>
              <span className='h-2 w-3 rounded-sm bg-rose-500/80' />
              Saidas
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='h-44 w-full rounded-xl border border-white/10 bg-black/15 p-2'>
          {!hasData ? (
            <div className='flex h-full items-center justify-center'>
              <span className='text-sm text-muted-foreground'>
                Nenhum lancamento no periodo
              </span>
            </div>
          ) : (
            <svg
              viewBox={`0 0 ${CHART_W} ${CHART_H}`}
              preserveAspectRatio='none'
              className='h-full w-full'
            >
              {gridYs.map((y, i) => (
                <line
                  key={i}
                  x1={0}
                  y1={y}
                  x2={CHART_W}
                  y2={y}
                  stroke='rgba(255,255,255,0.06)'
                  strokeWidth={1}
                />
              ))}

              {dailyData.map(({ day, income, expense }, i) => {
                const groupX = i * groupW + groupW * 0.06
                const incomeH = (income / maxValue) * CHART_H
                const expenseH = (expense / maxValue) * CHART_H

                return (
                  <g key={day}>
                    {income > 0 && (
                      <rect
                        x={groupX}
                        y={CHART_H - incomeH}
                        width={barW}
                        height={incomeH}
                        fill='rgba(52,211,153,0.75)'
                        rx={1}
                      />
                    )}
                    {expense > 0 && (
                      <rect
                        x={groupX + barW + gap}
                        y={CHART_H - expenseH}
                        width={barW}
                        height={expenseH}
                        fill='rgba(251,113,133,0.75)'
                        rx={1}
                      />
                    )}
                  </g>
                )
              })}
            </svg>
          )}
        </div>

        <div className='mt-2 flex w-full items-center justify-between gap-1 overflow-hidden text-[11px] text-muted-foreground'>
          {tickDays.map((day, i) => (
            <span
              key={day}
              className={`min-w-0 flex-1 truncate whitespace-nowrap ${
                i === 0
                  ? 'text-left'
                  : i === tickDays.length - 1
                    ? 'text-right'
                    : 'text-center'
              }`}
            >
              {formatLabel(day)}
            </span>
          ))}
        </div>

        {negCount > 0 ? (
          <p className='mt-2 text-xs text-amber-400/80'>
            {negCount} {negCount === 1 ? 'dia com' : 'dias com'} saidas maiores
            que entradas
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
