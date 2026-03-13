import { useMemo } from 'react'
import { AlertTriangle, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Category } from '@/types/finance'

interface CategoryAlertsProps {
  categories: Category[]
  spendingByCategory: Record<string, number>
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function CategoryAlerts({
  categories,
  spendingByCategory,
}: CategoryAlertsProps) {
  const alerts = useMemo(() => {
    return categories
      .filter((c) => c.limit != null && c.limit > 0)
      .map((c) => {
        const spending = spendingByCategory[c.name] ?? 0
        const percentage = (spending / c.limit!) * 100
        return { category: c, spending, percentage }
      })
      .filter((a) => a.percentage >= 70)
      .sort((a, b) => b.percentage - a.percentage)
  }, [categories, spendingByCategory])

  if (alerts.length === 0) return null

  return (
    <Card className='glass animate-fade-up rounded-2xl bg-white/[0.02] [animation-delay:100ms]'>
      <CardHeader className='pb-2'>
        <CardTitle className='flex items-center gap-2 text-base'>
          <AlertTriangle className='h-4 w-4 text-amber-400' />
          Alertas de gastos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className='space-y-2'>
          {alerts.map(({ category, spending, percentage }) => (
            <li
              key={category.id}
              className={cn(
                'flex items-center justify-between rounded-lg border px-3 py-2 text-sm',
                percentage >= 100
                  ? 'border-rose-500/30 bg-rose-500/10'
                  : 'border-amber-500/30 bg-amber-500/10',
              )}
            >
              <span className='flex items-center gap-2'>
                <TrendingUp
                  className={cn(
                    'h-3.5 w-3.5',
                    percentage >= 100 ? 'text-rose-400' : 'text-amber-400',
                  )}
                />
                <span>{category.name}</span>
              </span>
              <span
                className={cn(
                  'tabular-nums font-medium',
                  percentage >= 100 ? 'text-rose-300' : 'text-amber-300',
                )}
              >
                {formatCurrency(spending)} / {formatCurrency(category.limit!)}
                <span className='ml-2 text-xs opacity-70'>
                  {Math.round(percentage)}%
                </span>
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
