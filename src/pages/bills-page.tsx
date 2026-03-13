import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertCircle, CheckCircle2, Clock, Plus } from 'lucide-react'
import { BillForm } from '@/components/finance/bill-form'
import { BillsTable } from '@/components/finance/bills-table'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DropdownSelect } from '@/components/ui/dropdown-select'
import { Modal } from '@/components/ui/modal'
import { useAuth } from '@/contexts/auth-context'
import {
  useBills,
  useCreateBill,
  useDeleteBill,
  useMarkBillAsPaid,
  useUpdateBillRecurrence,
} from '@/hooks/use-bills'
import { useCategories, useCreateCategory } from '@/hooks/use-categories'
import {
  DEFAULT_TRANSACTION_CATEGORIES,
  type Bill,
  type BillRecurrence,
  type BillStatus,
  type NewBillInput,
} from '@/types/finance'

type StatusFilter = 'all' | BillStatus
type RecurrenceFilter = 'all' | BillRecurrence

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function todayLocalString() {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseLocalDate(dateString: string) {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function formatLocalDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addMonthsKeepingMonthEnd(date: Date, monthCount: number) {
  const next = new Date(date)
  const day = next.getDate()

  next.setDate(1)
  next.setMonth(next.getMonth() + monthCount)

  const lastDayOfMonth = new Date(
    next.getFullYear(),
    next.getMonth() + 1,
    0,
  ).getDate()

  next.setDate(Math.min(day, lastDayOfMonth))

  return next
}

function getNextDueDate(dueDate: string, recurrence: BillRecurrence) {
  const current = parseLocalDate(dueDate)

  if (recurrence === 'weekly') {
    current.setDate(current.getDate() + 7)
    return formatLocalDate(current)
  }

  if (recurrence === 'monthly') {
    return formatLocalDate(addMonthsKeepingMonthEnd(current, 1))
  }

  if (recurrence === 'yearly') {
    return formatLocalDate(addMonthsKeepingMonthEnd(current, 12))
  }

  return dueDate
}

/** Derive display status from bill: if backend says pending but dueDate < today → overdue */
function resolveStatus(bill: Bill): BillStatus {
  if (bill.status === 'paid') return 'paid'
  const today = todayLocalString()
  return bill.dueDate < today ? 'overdue' : 'pending'
}

const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Pendentes' },
  { value: 'overdue', label: 'Vencidas' },
  { value: 'paid', label: 'Pagas' },
]

const RECURRENCE_FILTER_OPTIONS: { value: RecurrenceFilter; label: string }[] =
  [
    { value: 'all', label: 'Todas' },
    { value: 'none', label: 'Unica' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensal' },
    { value: 'yearly', label: 'Anual' },
  ]

export function BillsPage() {
  const { user } = useAuth()
  const billsQuery = useBills(user?.uid)
  const categoriesQuery = useCategories(user?.uid)
  const createBillMutation = useCreateBill(user?.uid)
  const createRecurringBillMutation = useCreateBill(user?.uid)
  const markPaidMutation = useMarkBillAsPaid(user?.uid)
  const updateRecurrenceMutation = useUpdateBillRecurrence(user?.uid)
  const deleteBillMutation = useDeleteBill(user?.uid)
  const createCategoryMutation = useCreateCategory(user?.uid)

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [recurrenceFilter, setRecurrenceFilter] =
    useState<RecurrenceFilter>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isFabOpen, setIsFabOpen] = useState(false)
  const [markingPaidId, setMarkingPaidId] = useState<string | null>(null)
  const [editingRecurrenceId, setEditingRecurrenceId] = useState<string | null>(
    null,
  )
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const fabContainerRef = useRef<HTMLDivElement | null>(null)
  const payingBillIdsRef = useRef<Set<string>>(new Set())
  const generatedRecurringBillIdsRef = useRef<Set<string>>(new Set())

  const categories = useMemo(
    () => categoriesQuery.data ?? [],
    [categoriesQuery.data],
  )

  const categoryOptions = useMemo(() => {
    if (categories.length === 0) return [...DEFAULT_TRANSACTION_CATEGORIES]
    return categories.map((item) => item.name)
  }, [categories])

  const allBills = useMemo(() => billsQuery.data ?? [], [billsQuery.data])

  const billsWithStatus = useMemo<Bill[]>(
    () => allBills.map((b) => ({ ...b, status: resolveStatus(b) })),
    [allBills],
  )

  const filteredBills = useMemo(() => {
    return billsWithStatus.filter((bill) => {
      const statusMatches =
        statusFilter === 'all' || bill.status === statusFilter
      const recurrenceMatches =
        recurrenceFilter === 'all' ||
        (bill.recurrence ?? 'none') === recurrenceFilter

      return statusMatches && recurrenceMatches
    })
  }, [billsWithStatus, recurrenceFilter, statusFilter])

  const recurringBills = useMemo(
    () =>
      filteredBills.filter((bill) => (bill.recurrence ?? 'none') !== 'none'),
    [filteredBills],
  )

  const oneTimeBills = useMemo(
    () =>
      filteredBills.filter((bill) => (bill.recurrence ?? 'none') === 'none'),
    [filteredBills],
  )

  const summary = useMemo(() => {
    const today = todayLocalString()
    const thisMonth = today.slice(0, 7)

    const totalPending = billsWithStatus
      .filter((b) => b.status === 'pending')
      .reduce((s, b) => s + b.amount, 0)

    const totalOverdue = billsWithStatus
      .filter((b) => b.status === 'overdue')
      .reduce((s, b) => s + b.amount, 0)

    const totalPaidThisMonth = billsWithStatus
      .filter(
        (b) =>
          b.status === 'paid' && b.paidAt && b.paidAt.startsWith(thisMonth),
      )
      .reduce((s, b) => s + b.amount, 0)

    return { totalPending, totalOverdue, totalPaidThisMonth }
  }, [billsWithStatus])

  useEffect(() => {
    if (!isFabOpen) return

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
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

  async function handleCreateBill(input: NewBillInput) {
    await createBillMutation.mutateAsync(input)
    setIsModalOpen(false)
  }

  async function handleMarkAsPaid(billId: string) {
    if (payingBillIdsRef.current.has(billId)) {
      return
    }

    payingBillIdsRef.current.add(billId)
    setMarkingPaidId(billId)

    try {
      const currentBill = allBills.find((bill) => bill.id === billId)

      if (!currentBill || currentBill.status === 'paid') {
        return
      }

      await markPaidMutation.mutateAsync(billId)

      if (
        currentBill &&
        currentBill.recurrence &&
        currentBill.recurrence !== 'none' &&
        !generatedRecurringBillIdsRef.current.has(billId)
      ) {
        generatedRecurringBillIdsRef.current.add(billId)

        try {
          await createRecurringBillMutation.mutateAsync({
            description: currentBill.description,
            amount: currentBill.amount,
            dueDate: getNextDueDate(
              currentBill.dueDate,
              currentBill.recurrence,
            ),
            category: currentBill.category,
            recurrence: currentBill.recurrence,
          })
        } catch (error) {
          generatedRecurringBillIdsRef.current.delete(billId)
          throw error
        }
      }
    } finally {
      payingBillIdsRef.current.delete(billId)
      setMarkingPaidId(null)
    }
  }

  async function handleChangeRecurrence(
    billId: string,
    recurrence: BillRecurrence,
  ) {
    setEditingRecurrenceId(billId)

    try {
      await updateRecurrenceMutation.mutateAsync({ billId, recurrence })
    } finally {
      setEditingRecurrenceId(null)
    }
  }

  async function handleDelete(billId: string) {
    setDeletingId(billId)
    try {
      await deleteBillMutation.mutateAsync(billId)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <AppShell>
      <section className='space-y-5'>
        {/* Summary cards */}
        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
          <Card
            className='metric-gradient animate-fade-up rounded-2xl border-white/10 bg-white/[0.03]'
            style={{ animationDelay: '0ms' }}
          >
            <CardHeader className='flex flex-row items-center justify-between pb-1'>
              <CardTitle className='text-sm text-muted-foreground'>
                Pendentes
              </CardTitle>
              <Clock className='h-4 w-4 text-amber-400' />
            </CardHeader>
            <CardContent>
              <p className='text-2xl font-semibold tracking-tight'>
                {formatCurrency(summary.totalPending)}
              </p>
            </CardContent>
          </Card>

          <Card
            className='metric-gradient animate-fade-up rounded-2xl border-white/10 bg-white/[0.03]'
            style={{ animationDelay: '80ms' }}
          >
            <CardHeader className='flex flex-row items-center justify-between pb-1'>
              <CardTitle className='text-sm text-muted-foreground'>
                Vencidas
              </CardTitle>
              <AlertCircle className='h-4 w-4 text-rose-400' />
            </CardHeader>
            <CardContent>
              <p className='text-2xl font-semibold tracking-tight text-rose-300'>
                {formatCurrency(summary.totalOverdue)}
              </p>
            </CardContent>
          </Card>

          <Card
            className='metric-gradient animate-fade-up rounded-2xl border-white/10 bg-white/[0.03]'
            style={{ animationDelay: '160ms' }}
          >
            <CardHeader className='flex flex-row items-center justify-between pb-1'>
              <CardTitle className='text-sm text-muted-foreground'>
                Pagas este mes
              </CardTitle>
              <CheckCircle2 className='h-4 w-4 text-emerald-400' />
            </CardHeader>
            <CardContent>
              <p className='text-2xl font-semibold tracking-tight text-emerald-300'>
                {formatCurrency(summary.totalPaidThisMonth)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Status filter */}
        <div className='glass animate-fade-up rounded-2xl px-4 py-3 [animation-delay:60ms]'>
          <div className='flex flex-nowrap items-end gap-3 overflow-x-auto overflow-hidden'>
            <label className='min-w-0 flex-1 space-y-2'>
              <span className='block text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground'>
                Status
              </span>
              <DropdownSelect
                value={statusFilter}
                onValueChange={setStatusFilter}
                options={STATUS_FILTER_OPTIONS}
                triggerClassName='h-10 rounded-xl'
              />
            </label>

            <label className='min-w-0 flex-1 space-y-2'>
              <span className='block text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground'>
                Recorrência
              </span>
              <DropdownSelect
                value={recurrenceFilter}
                onValueChange={setRecurrenceFilter}
                options={RECURRENCE_FILTER_OPTIONS}
                triggerClassName='h-10 rounded-xl'
              />
            </label>
          </div>
        </div>

        {/* Bills table */}
        {filteredBills.length === 0 ? (
          <BillsTable
            bills={[]}
            title='Contas a pagar'
            emptyMessage='Nenhuma conta encontrada para os filtros atuais.'
            markingPaidId={markingPaidId}
            editingRecurrenceId={editingRecurrenceId}
            deletingId={deletingId}
            onMarkAsPaid={handleMarkAsPaid}
            onChangeRecurrence={handleChangeRecurrence}
            onDelete={handleDelete}
          />
        ) : (
          <div className='space-y-4'>
            {recurringBills.length > 0 ? (
              <BillsTable
                bills={recurringBills}
                title='Contas recorrentes'
                emptyMessage='Nenhuma conta recorrente encontrada.'
                markingPaidId={markingPaidId}
                editingRecurrenceId={editingRecurrenceId}
                deletingId={deletingId}
                onMarkAsPaid={handleMarkAsPaid}
                onChangeRecurrence={handleChangeRecurrence}
                onDelete={handleDelete}
              />
            ) : null}

            {oneTimeBills.length > 0 ? (
              <BillsTable
                bills={oneTimeBills}
                title='Contas avulsas'
                emptyMessage='Nenhuma conta avulsa encontrada.'
                markingPaidId={markingPaidId}
                editingRecurrenceId={editingRecurrenceId}
                deletingId={deletingId}
                onMarkAsPaid={handleMarkAsPaid}
                onChangeRecurrence={handleChangeRecurrence}
                onDelete={handleDelete}
              />
            ) : null}
          </div>
        )}

        {billsQuery.isLoading ? (
          <p className='text-sm text-muted-foreground'>Carregando contas...</p>
        ) : null}

        {createBillMutation.error ? (
          <p className='text-sm text-rose-300'>
            {createBillMutation.error instanceof Error
              ? createBillMutation.error.message
              : 'Nao foi possivel salvar a conta.'}
          </p>
        ) : null}

        {createRecurringBillMutation.error ? (
          <p className='text-sm text-rose-300'>
            {createRecurringBillMutation.error instanceof Error
              ? createRecurringBillMutation.error.message
              : 'Nao foi possivel gerar a proxima recorrencia.'}
          </p>
        ) : null}

        {updateRecurrenceMutation.error ? (
          <p className='text-sm text-rose-300'>
            {updateRecurrenceMutation.error instanceof Error
              ? updateRecurrenceMutation.error.message
              : 'Nao foi possivel atualizar a recorrencia.'}
          </p>
        ) : null}
      </section>

      {/* FAB */}
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
              onClick={() => {
                setIsFabOpen(false)
                setIsModalOpen(true)
              }}
            >
              Nova Conta a Pagar
            </Button>
          </div>
        ) : null}

        <Button
          type='button'
          size='icon'
          className='h-14 w-14 rounded-full bg-primary text-zinc-900 shadow-[0_16px_40px_rgba(0,0,0,0.35)] hover:bg-primary/90'
          onClick={() => setIsFabOpen((c) => !c)}
          aria-label='Abrir acoes rapidas'
        >
          <Plus
            className={`h-6 w-6 transition ${isFabOpen ? 'rotate-45' : ''}`}
          />
        </Button>
      </div>

      {/* Modal */}
      <Modal
        open={isModalOpen}
        title='Nova conta a pagar'
        description='Registre uma conta com data de vencimento.'
        onClose={() => setIsModalOpen(false)}
      >
        <BillForm
          categories={categoryOptions}
          loading={createBillMutation.isPending}
          onSubmit={handleCreateBill}
          onCreateCategory={async (name) => {
            await createCategoryMutation.mutateAsync({ name })
          }}
        />
      </Modal>
    </AppShell>
  )
}
