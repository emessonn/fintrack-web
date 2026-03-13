import { useEffect, useMemo, useRef, useState } from 'react'
import {
  type BillRecurrence,
  DEFAULT_TRANSACTION_CATEGORY,
  type NewBillInput,
  type TransactionCategory,
} from '@/types/finance'
import { Button } from '@/components/ui/button'
import { DropdownSelect } from '@/components/ui/dropdown-select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NumberInput } from '@/components/ui/number-input'

interface BillFormProps {
  categories: TransactionCategory[]
  loading?: boolean
  onSubmit: (input: NewBillInput) => Promise<void>
  onCreateCategory?: (name: string) => Promise<void>
}

const RECURRENCE_OPTIONS: Array<{
  value: BillRecurrence
  label: string
}> = [
  { value: 'none', label: 'Não recorrente' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensal' },
  { value: 'yearly', label: 'Anual' },
]

function todayISO() {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function BillForm({
  categories,
  loading,
  onSubmit,
  onCreateCategory,
}: BillFormProps) {
  const availableCategories = useMemo(
    () => (categories.length > 0 ? categories : [DEFAULT_TRANSACTION_CATEGORY]),
    [categories],
  )

  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState<number | undefined>(undefined)
  const [dueDate, setDueDate] = useState(todayISO())
  const [recurrence, setRecurrence] = useState<BillRecurrence>('none')
  const [category, setCategory] = useState<TransactionCategory>(
    availableCategories[0],
  )
  const [error, setError] = useState<string | null>(null)

  const [categoryInput, setCategoryInput] = useState(availableCategories[0])
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)
  const categoryRef = useRef<HTMLDivElement>(null)

  const filteredCategories = useMemo(() => {
    const q = categoryInput.trim().toLowerCase()
    if (!q) return availableCategories
    return availableCategories.filter((c) => c.toLowerCase().includes(q))
  }, [availableCategories, categoryInput])

  const canCreate = useMemo(() => {
    const q = categoryInput.trim()
    return (
      Boolean(onCreateCategory) &&
      q.length > 0 &&
      !availableCategories.some((c) => c.toLowerCase() === q.toLowerCase())
    )
  }, [availableCategories, categoryInput, onCreateCategory])

  useEffect(() => {
    setCategoryInput(category)
  }, [category])

  function selectCategory(name: string) {
    setCategory(name)
    setCategoryInput(name)
    setShowCategoryDropdown(false)
  }

  async function handleCreateCategoryInline() {
    if (!onCreateCategory || !canCreate) return
    const name = categoryInput.trim()
    setIsCreatingCategory(true)
    try {
      await onCreateCategory(name)
      selectCategory(name)
    } finally {
      setIsCreatingCategory(false)
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const parsedAmount = Number(amount)

    if (!description.trim()) {
      setError('Informe uma descricao para a conta.')
      return
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError('Informe um valor maior que zero.')
      return
    }

    if (!dueDate) {
      setError('Informe a data de vencimento.')
      return
    }

    const selectedCategory = availableCategories.includes(category)
      ? category
      : availableCategories[0]

    await onSubmit({
      description,
      amount: parsedAmount,
      dueDate,
      category: selectedCategory,
      recurrence,
    })

    setDescription('')
    setAmount(undefined)
    setDueDate(todayISO())
    setRecurrence('none')
    const resetCat = availableCategories[0]
    setCategory(resetCat)
    setCategoryInput(resetCat)
  }

  return (
    <form className='space-y-4' onSubmit={handleSubmit}>
      <div className='space-y-2'>
        <Label htmlFor='bill-description'>Descricao</Label>
        <Input
          id='bill-description'
          placeholder='Ex: Aluguel, internet, energia...'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='bill-amount'>Valor</Label>
        <NumberInput
          id='bill-amount'
          placeholder='R$ 0,00'
          prefix='R$ '
          value={amount}
          onValueChange={(value) => setAmount(value ?? undefined)}
          thousandSeparator='.'
          decimalSeparator=','
          decimalScale={2}
          fixedDecimalScale
        />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='bill-due-date'>Vencimento</Label>
        <Input
          id='bill-due-date'
          type='date'
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className='[color-scheme:dark]'
        />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='bill-recurrence'>Recorrencia</Label>
        <DropdownSelect
          value={recurrence}
          onValueChange={setRecurrence}
          options={RECURRENCE_OPTIONS}
          triggerClassName='h-9 rounded-lg bg-transparent'
        />
      </div>

      <div className='relative space-y-2' ref={categoryRef}>
        <Label htmlFor='bill-category-input'>Categoria</Label>
        <Input
          id='bill-category-input'
          autoComplete='off'
          value={categoryInput}
          onChange={(e) => {
            setCategoryInput(e.target.value)
            setShowCategoryDropdown(true)
          }}
          onFocus={() => setShowCategoryDropdown(true)}
          onBlur={() => setTimeout(() => setShowCategoryDropdown(false), 150)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              if (filteredCategories.length > 0 && !canCreate) {
                selectCategory(filteredCategories[0])
              } else if (canCreate) {
                void handleCreateCategoryInline()
              }
            } else if (e.key === 'Escape') {
              setShowCategoryDropdown(false)
            }
          }}
          placeholder='Selecione ou crie uma categoria'
        />
        {showCategoryDropdown &&
          (filteredCategories.length > 0 || canCreate) && (
            <ul className='absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-input bg-zinc-900 py-1 shadow-lg'>
              {filteredCategories.map((item) => (
                <li
                  key={item}
                  onMouseDown={() => selectCategory(item)}
                  className={`cursor-pointer px-3 py-1.5 text-sm transition-colors hover:bg-zinc-700 ${
                    item === category ? 'text-primary' : 'text-zinc-100'
                  }`}
                >
                  {item}
                </li>
              ))}
              {canCreate && (
                <li
                  onMouseDown={() => void handleCreateCategoryInline()}
                  className='cursor-pointer border-t border-zinc-700 px-3 py-1.5 text-sm text-primary transition-colors hover:bg-zinc-700'
                >
                  {isCreatingCategory
                    ? 'Criando...'
                    : `Criar "${categoryInput.trim()}"`}
                </li>
              )}
            </ul>
          )}
      </div>

      {error ? <p className='text-sm text-rose-300'>{error}</p> : null}

      <Button
        type='submit'
        disabled={Boolean(loading)}
        className='w-full bg-primary text-zinc-900 hover:bg-primary/90'
      >
        {loading ? 'Salvando...' : 'Salvar conta'}
      </Button>
    </form>
  )
}
