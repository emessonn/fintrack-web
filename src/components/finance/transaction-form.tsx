import { useEffect, useMemo, useRef, useState } from 'react'
import {
  DEFAULT_TRANSACTION_CATEGORY,
  type NewTransactionInput,
  type TransactionCategory,
  type TransactionType,
} from '@/types/finance'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NumberInput } from '../ui/number-input'

interface TransactionFormProps {
  categories: TransactionCategory[]
  loading?: boolean
  onSubmit: (input: NewTransactionInput) => Promise<void>
  onCreateCategory?: (name: string) => Promise<void>
}

export function TransactionForm({
  categories,
  loading,
  onSubmit,
  onCreateCategory,
}: TransactionFormProps) {
  const availableCategories = useMemo(
    () => (categories.length > 0 ? categories : [DEFAULT_TRANSACTION_CATEGORY]),
    [categories],
  )

  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState<number | undefined>(undefined)
  const [type, setType] = useState<TransactionType>('income')
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

  // Sync categoryInput when category changes externally (e.g. on reset)
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
      setError('Informe uma descricao para o lancamento.')
      return
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError('Informe um valor numerico maior que zero.')
      return
    }

    const selectedCategory = availableCategories.includes(category)
      ? category
      : availableCategories[0]

    await onSubmit({
      description,
      amount: parsedAmount,
      type,
      category: selectedCategory,
    })

    setDescription('')
    setAmount(undefined)
    setType('income')
    const resetCat = availableCategories[0]
    setCategory(resetCat)
    setCategoryInput(resetCat)
  }

  return (
    <Card className='glass animate-fade-up rounded-2xl bg-white/[0.02]'>
      <CardHeader>
        <CardTitle>Novo lançamento</CardTitle>
      </CardHeader>
      <CardContent>
        <form className='space-y-4' onSubmit={handleSubmit}>
          <div className='space-y-2'>
            <Label htmlFor='description'>Descricao</Label>
            <Input
              id='description'
              placeholder='Ex: Salario, aluguel, assinatura...'
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='amount'>Valor</Label>
            <NumberInput
              id='amount'
              placeholder='R$ 0,00'
              prefix='R$ '
              value={amount}
              onValueChange={(value) => setAmount(value ?? undefined)}
              thousandSeparator='.'
              decimalSeparator=','
              decimalScale={2}
              fixedDecimalScale
              min={0}
            />
          </div>

          <div className='relative space-y-2' ref={categoryRef}>
            <Label htmlFor='category-input'>Categoria</Label>
            <Input
              id='category-input'
              autoComplete='off'
              value={categoryInput}
              onChange={(e) => {
                setCategoryInput(e.target.value)
                setShowCategoryDropdown(true)
              }}
              onFocus={() => setShowCategoryDropdown(true)}
              onBlur={() =>
                setTimeout(() => setShowCategoryDropdown(false), 150)
              }
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

          <div className='grid grid-cols-2 gap-2'>
            <Button
              type='button'
              variant={type === 'income' ? 'default' : 'outline'}
              onClick={() => setType('income')}
              className={
                type === 'income'
                  ? 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400'
                  : ''
              }
            >
              Entrada
            </Button>
            <Button
              type='button'
              variant={type === 'expense' ? 'default' : 'outline'}
              onClick={() => setType('expense')}
              className={
                type === 'expense'
                  ? 'bg-rose-500 text-white hover:bg-rose-400'
                  : ''
              }
            >
              Saida
            </Button>
          </div>

          {error ? <p className='text-sm text-rose-300'>{error}</p> : null}

          <Button
            type='submit'
            disabled={Boolean(loading)}
            className='w-full bg-primary text-zinc-900 hover:bg-primary/90 py-6'
          >
            {loading ? 'Salvando...' : 'Salvar Lançamento'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
