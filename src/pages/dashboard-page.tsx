import { useEffect, useMemo, useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { CategoryAlerts } from '@/components/finance/category-alerts'
import { CategoryManager } from '@/components/finance/category-manager'
import { AppShell } from '@/components/layout/app-shell'
import {
  FinanceFilters,
  type PeriodFilter,
} from '@/components/finance/finance-filters'
import { FinancialInsights } from '@/components/finance/financial-insights'
import { IncomeExpenseChart } from '@/components/finance/income-expense-chart'
import { SpendingByCategoryChart } from '@/components/finance/spending-by-category-chart'
import { SummaryCards } from '@/components/finance/summary-cards'
import { TransactionForm } from '@/components/finance/transaction-form'
import { TransactionsTable } from '@/components/finance/transactions-table'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { useAuth } from '@/contexts/auth-context'
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategoryLimit,
} from '@/hooks/use-categories'
import { useCreateTransaction, useTransactions } from '@/hooks/use-transactions'
import {
  DEFAULT_TRANSACTION_CATEGORIES,
  type NewTransactionInput,
  type TransactionCategory,
} from '@/types/finance'

function getPeriodStart(period: PeriodFilter, now: Date) {
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)

  if (period === '7d') {
    start.setDate(start.getDate() - 6)
    return start
  }

  if (period === '14d') {
    start.setDate(start.getDate() - 13)
    return start
  }

  if (period === '30d') {
    start.setDate(start.getDate() - 29)
    return start
  }

  if (period === '60d') {
    start.setDate(start.getDate() - 59)
    return start
  }

  return null
}

export function DashboardPage() {
  const { user } = useAuth()
  const transactionsQuery = useTransactions(user?.uid)
  const categoriesQuery = useCategories(user?.uid)
  const createTransactionMutation = useCreateTransaction(user?.uid)
  const createCategoryMutation = useCreateCategory(user?.uid)
  const deleteCategoryMutation = useDeleteCategory(user?.uid)
  const updateCategoryLimitMutation = useUpdateCategoryLimit(user?.uid)
  const [period, setPeriod] = useState<PeriodFilter>('7d')
  const [category, setCategory] = useState<TransactionCategory | 'all'>('all')
  const [isFabOpen, setIsFabOpen] = useState(false)
  const [activeModal, setActiveModal] = useState<
    'transaction' | 'category' | null
  >(null)
  const [updatingLimitId, setUpdatingLimitId] = useState<string | null>(null)
  const fabContainerRef = useRef<HTMLDivElement | null>(null)

  const categories = useMemo(
    () => categoriesQuery.data ?? [],
    [categoriesQuery.data],
  )

  const categoryOptions = useMemo(() => {
    if (categories.length === 0) {
      return [...DEFAULT_TRANSACTION_CATEGORIES]
    }

    return categories.map((item) => item.name)
  }, [categories])

  const selectedCategory =
    category !== 'all' && !categoryOptions.includes(category) ? 'all' : category

  const transactions = useMemo(
    () => transactionsQuery.data ?? [],
    [transactionsQuery.data],
  )

  const filteredTransactions = useMemo(() => {
    const now = new Date()
    const periodStart = getPeriodStart(period, now)

    return transactions.filter((transaction) => {
      const categoryMatches =
        selectedCategory === 'all' || transaction.category === selectedCategory

      if (!categoryMatches) {
        return false
      }

      if (!periodStart) {
        return true
      }

      const createdAt = new Date(transaction.createdAt)

      return createdAt >= periodStart && createdAt <= now
    })
  }, [period, selectedCategory, transactions])

  const summary = useMemo(() => {
    return filteredTransactions.reduce(
      (acc, transaction) => {
        if (transaction.type === 'income') {
          acc.income += transaction.amount
        } else {
          acc.expense += transaction.amount
        }

        acc.balance = acc.income - acc.expense
        return acc
      },
      { income: 0, expense: 0, balance: 0 },
    )
  }, [filteredTransactions])

  const spendingByCategory = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce<Record<string, number>>((acc, t) => {
        acc[t.category] = (acc[t.category] ?? 0) + t.amount
        return acc
      }, {})
  }, [filteredTransactions])

  async function handleCreateTransaction(input: NewTransactionInput) {
    await createTransactionMutation.mutateAsync(input)
    setActiveModal(null)
  }

  async function handleUpdateCategoryLimit(
    categoryId: string,
    limit: number | null,
  ) {
    setUpdatingLimitId(categoryId)
    try {
      await updateCategoryLimitMutation.mutateAsync({ categoryId, limit })
    } finally {
      setUpdatingLimitId(null)
    }
  }

  function openTransactionModal() {
    setIsFabOpen(false)
    setActiveModal('transaction')
  }

  function openCategoryModal() {
    setIsFabOpen(false)
    setActiveModal('category')
  }

  function closeModal() {
    setActiveModal(null)
  }

  useEffect(() => {
    if (!isFabOpen) {
      return
    }

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target

      if (!(target instanceof Node)) {
        return
      }

      if (!fabContainerRef.current?.contains(target)) {
        setIsFabOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
    }
  }, [isFabOpen])

  return (
    <AppShell>
      <section className='space-y-5'>
        <SummaryCards
          income={summary.income}
          expense={summary.expense}
          balance={summary.balance}
        />

        <FinanceFilters
          period={period}
          categories={categoryOptions}
          category={selectedCategory}
          onPeriodChange={setPeriod}
          onCategoryChange={setCategory}
        />

        <CategoryAlerts
          categories={categories}
          spendingByCategory={spendingByCategory}
        />

        <FinancialInsights
          transactions={filteredTransactions}
          period={period}
        />

        <IncomeExpenseChart
          transactions={filteredTransactions}
          period={period}
        />

        <SpendingByCategoryChart
          transactions={filteredTransactions}
          categories={categories}
        />

        <TransactionsTable transactions={filteredTransactions} />

        {createTransactionMutation.error ? (
          <p className='text-sm text-rose-300'>
            {createTransactionMutation.error instanceof Error
              ? createTransactionMutation.error.message
              : 'Nao foi possivel salvar a transacao.'}
          </p>
        ) : null}

        {transactionsQuery.isLoading ? (
          <p className='text-sm text-muted-foreground'>
            Carregando lancamentos...
          </p>
        ) : null}

        {categoriesQuery.isLoading ? (
          <p className='text-sm text-muted-foreground'>
            Carregando categorias...
          </p>
        ) : null}
      </section>

      <div
        ref={fabContainerRef}
        className='fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2'
      >
        {isFabOpen ? (
          <div className='glass w-56 space-y-2 rounded-2xl border border-white/15 p-2'>
            <Button
              type='button'
              variant='outline'
              className='w-full justify-start'
              onClick={openTransactionModal}
            >
              Novo Lancamento
            </Button>
            <Button
              type='button'
              variant='outline'
              className='w-full justify-start'
              onClick={openCategoryModal}
            >
              Criar Categoria
            </Button>
          </div>
        ) : null}

        <Button
          type='button'
          size='icon'
          className='h-14 w-14 rounded-full bg-primary text-zinc-900 shadow-[0_16px_40px_rgba(0,0,0,0.35)] hover:bg-primary/90'
          onClick={() => setIsFabOpen((current) => !current)}
          aria-label='Abrir acoes rapidas'
        >
          <Plus
            className={`h-6 w-6 transition ${isFabOpen ? 'rotate-45' : ''}`}
          />
        </Button>
      </div>

      <Modal
        open={activeModal === 'transaction'}
        title='Novo lancamento'
        description='Registre uma nova entrada ou saida.'
        onClose={closeModal}
      >
        <TransactionForm
          categories={categoryOptions}
          loading={createTransactionMutation.isPending}
          onSubmit={handleCreateTransaction}
          onCreateCategory={async (name) => {
            await createCategoryMutation.mutateAsync({ name })
          }}
        />
      </Modal>

      <Modal
        open={activeModal === 'category'}
        title='Categorias'
        description='Crie e organize suas categorias personalizadas.'
        onClose={closeModal}
      >
        <CategoryManager
          categories={categories}
          creating={createCategoryMutation.isPending}
          deleting={deleteCategoryMutation.isPending}
          updatingLimitId={updatingLimitId}
          spendingByCategory={spendingByCategory}
          onAddCategory={async (input) => {
            await createCategoryMutation.mutateAsync(input)
          }}
          onDeleteCategory={async (categoryId) => {
            await deleteCategoryMutation.mutateAsync(categoryId)
          }}
          onUpdateLimit={handleUpdateCategoryLimit}
        />
      </Modal>
    </AppShell>
  )
}
