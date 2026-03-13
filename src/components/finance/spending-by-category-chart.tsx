import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Category, Transaction } from '@/types/finance'

interface SpendingByCategoryChartProps {
  transactions: Transaction[]
  categories: Category[]
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function barColorClass(percentage: number, hasLimit: boolean) {
  if (!hasLimit) return 'bg-primary/70'
  if (percentage >= 100) return 'bg-rose-500'
  if (percentage >= 80) return 'bg-amber-400'
  return 'bg-emerald-500'
}

export function SpendingByCategoryChart({
  transactions,
  categories,
}: SpendingByCategoryChartProps) {
  const data = useMemo(() => {
    const spending: Record<string, number> = {}

    for (const t of transactions) {
      if (t.type === 'expense') {
        spending[t.category] = (spending[t.category] ?? 0) + t.amount
      }
    }

    const limitByName = new Map(
      categories.filter((c) => c.limit != null).map((c) => [c.name, c.limit!]),
    )

    const rows = Object.entries(spending)
      .map(([cat, amount]) => {
        const limit = limitByName.get(cat)
        const percentage = limit ? (amount / limit) * 100 : 0
        return { category: cat, amount, limit, percentage }
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8)

    const maxBar = Math.max(
      ...rows.map((r) => Math.max(r.amount, r.limit ?? 0)),
      1,
    )

    return rows.map((r) => ({
      ...r,
      barWidth: (r.amount / maxBar) * 100,
      limitLineLeft: r.limit ? Math.min((r.limit / maxBar) * 100, 100) : null,
    }))
  }, [transactions, categories])

  if (data.length === 0) return null

  return (
    <Card className='glass animate-fade-up rounded-2xl bg-white/[0.02] [animation-delay:160ms]'>
      <CardHeader>
        <CardTitle>Gastos por categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-3'>
          {data.map(
            ({
              category,
              amount,
              limit,
              percentage,
              barWidth,
              limitLineLeft,
            }) => (
              <div key={category} className='space-y-1'>
                <div className='flex items-center justify-between gap-2 text-sm'>
                  <span className='min-w-0 truncate text-muted-foreground'>
                    {category}
                  </span>
                  <span className='shrink-0 font-medium tabular-nums'>
                    {formatCurrency(amount)}
                    {limit != null ? (
                      <span className='ml-1 text-xs text-muted-foreground'>
                        / {formatCurrency(limit)}
                      </span>
                    ) : null}
                  </span>
                </div>
                <div className='relative h-2 w-full overflow-hidden rounded-full bg-white/10'>
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      barColorClass(percentage, limit != null),
                    )}
                    style={{ width: `${barWidth}%` }}
                  />
                  {limitLineLeft != null ? (
                    <div
                      className='absolute top-0 h-full w-px bg-white/50'
                      style={{ left: `${limitLineLeft}%` }}
                    />
                  ) : null}
                </div>
                {limit != null && percentage >= 80 ? (
                  <p
                    className={cn(
                      'text-xs',
                      percentage >= 100 ? 'text-rose-400' : 'text-amber-400',
                    )}
                  >
                    {percentage >= 100
                      ? `${Math.round(percentage - 100)}% acima do limite`
                      : `${Math.round(percentage)}% do limite`}
                  </p>
                ) : null}
              </div>
            ),
          )}
        </div>
      </CardContent>
    </Card>
  )
}
