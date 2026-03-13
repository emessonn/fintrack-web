import { ArrowDownCircle, ArrowUpCircle, Landmark } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface SummaryCardsProps {
  income: number
  expense: number
  balance: number
  usdRate?: number
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function SummaryCards({ income, expense, balance }: SummaryCardsProps) {
  const cards = [
    {
      title: 'Entradas',
      value: formatCurrency(income),
      icon: ArrowUpCircle,
      accent: 'text-emerald-400',
    },
    {
      title: 'Saidas',
      value: formatCurrency(expense),
      icon: ArrowDownCircle,
      accent: 'text-rose-400',
    },
    {
      title: 'Saldo',
      value: formatCurrency(balance),
      icon: Landmark,
      accent: balance >= 0 ? 'text-cyan-300' : 'text-amber-300',
    },
  ]

  return (
    <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
      {cards.map((card, index) => {
        const Icon = card.icon

        return (
          <Card
            key={card.title}
            className='metric-gradient animate-fade-up rounded-2xl border-white/10 bg-white/[0.03]'
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <CardHeader className='flex flex-row items-center justify-between pb-1'>
              <CardTitle className='text-sm text-muted-foreground'>
                {card.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${card.accent}`} />
            </CardHeader>
            <CardContent>
              <p className='text-2xl font-semibold tracking-tight'>
                {card.value}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </section>
  )
}
