import type { TransactionCategory } from '@/types/finance'
import { DropdownSelect } from '@/components/ui/dropdown-select'

export type PeriodFilter = '7d' | '14d' | '30d' | '60d'

interface FinanceFiltersProps {
  period: PeriodFilter
  categories: TransactionCategory[]
  category: TransactionCategory | 'all'
  onPeriodChange: (period: PeriodFilter) => void
  onCategoryChange: (category: TransactionCategory | 'all') => void
}

const PERIOD_OPTIONS: Array<{ value: PeriodFilter; label: string }> = [
  { value: '7d', label: '7 dias' },
  { value: '14d', label: '14 dias' },
  { value: '30d', label: '30 dias' },
  { value: '60d', label: '60 dias' },
]

export function FinanceFilters({
  period,
  categories,
  category,
  onPeriodChange,
  onCategoryChange,
}: FinanceFiltersProps) {
  return (
    <section className='glass animate-fade-up rounded-2xl p-3 [animation-delay:80ms]'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex gap-2 overflow-x-auto pb-1'>
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option.value}
              type='button'
              onClick={() => onPeriodChange(option.value)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                period === option.value
                  ? 'bg-primary text-zinc-900'
                  : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className='p-0'>
          <DropdownSelect
            value={category}
            onValueChange={onCategoryChange}
            options={[
              { value: 'all', label: 'Todas as categorias' },
              ...categories.map((item) => ({ value: item, label: item })),
            ]}
            triggerClassName='h-9 rounded-lg bg-white/5'
          />
        </div>
      </div>
    </section>
  )
}
