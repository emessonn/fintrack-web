import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NumberInput } from '@/components/ui/number-input'
import { cn } from '@/lib/utils'
import type { Category } from '@/types/finance'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

interface CategoryManagerProps {
  categories: Category[]
  creating?: boolean
  deleting?: boolean
  updatingLimitId?: string | null
  spendingByCategory?: Record<string, number>
  onAddCategory: (input: { name: string; limit?: number }) => Promise<void>
  onDeleteCategory: (categoryId: string) => Promise<void>
  onUpdateLimit?: (categoryId: string, limit: number | null) => Promise<void>
}

export function CategoryManager({
  categories,
  creating,
  deleting,
  updatingLimitId,
  spendingByCategory,
  onAddCategory,
  onDeleteCategory,
  onUpdateLimit,
}: CategoryManagerProps) {
  const [newCategory, setNewCategory] = useState('')
  const [newLimit, setNewLimit] = useState<number | undefined>(undefined)
  const [pendingLimits, setPendingLimits] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)

  function getLimitStr(category: Category) {
    const pending = pendingLimits[category.id]
    if (pending !== undefined) return pending
    return category.limit != null ? String(category.limit) : ''
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    try {
      await onAddCategory({ name: newCategory.trim(), limit: newLimit })
      setNewCategory('')
      setNewLimit(undefined)
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : 'Não foi possível cadastrar a categoria.',
      )
    }
  }

  async function handleDelete(categoryId: string) {
    setError(null)

    try {
      await onDeleteCategory(categoryId)
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Não foi possível remover a categoria.',
      )
    }
  }

  async function handleLimitCommit(category: Category) {
    if (!onUpdateLimit) return

    const raw = pendingLimits[category.id]
    if (raw === undefined) return

    const trimmed = raw.trim()
    const parsed = trimmed === '' ? null : parseFloat(trimmed)
    if (parsed !== null && isNaN(parsed)) return

    const current = category.limit ?? null
    const next = parsed != null && parsed > 0 ? parsed : null

    if (next === current) {
      setPendingLimits((prev) => {
        const { [category.id]: _, ...rest } = prev
        return rest
      })
      return
    }

    setError(null)

    try {
      await onUpdateLimit(category.id, next)
      setPendingLimits((prev) => {
        const { [category.id]: _, ...rest } = prev
        return rest
      })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível atualizar o limite.',
      )
    }
  }

  return (
    <Card className='glass animate-fade-up rounded-2xl bg-white/[0.02] [animation-delay:140ms]'>
      <CardHeader>
        <CardTitle>Categorias</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <form className='space-y-3' onSubmit={handleCreate}>
          <div className='space-y-2'>
            <Label htmlFor='new-category'>Nova categoria</Label>
            <Input
              id='new-category'
              placeholder='Ex: Investimentos'
              value={newCategory}
              onChange={(event) => setNewCategory(event.target.value)}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='new-category-limit'>Limite mensal (opcional)</Label>
            <NumberInput
              id='new-category-limit'
              placeholder='R$ 0,00'
              prefix='R$ '
              value={newLimit}
              onValueChange={(v) => setNewLimit(v ?? undefined)}
              thousandSeparator='.'
              decimalSeparator=','
              decimalScale={2}
              fixedDecimalScale
              min={0}
            />
          </div>

          <Button
            type='submit'
            disabled={Boolean(creating) || !newCategory.trim()}
          >
            {creating ? 'Salvando...' : 'Adicionar'}
          </Button>
        </form>

        {categories.length === 0 ? (
          <p className='text-sm text-muted-foreground'>
            Nenhuma categoria cadastrada.
          </p>
        ) : (
          <ul className='space-y-2'>
            {categories.map((category) => {
              const spent = spendingByCategory?.[category.name] ?? null
              const percentage =
                category.limit != null && spent != null
                  ? (spent / category.limit) * 100
                  : null

              return (
                <li
                  key={category.id}
                  className='flex flex-col gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2'
                >
                  <div className='flex items-center gap-2'>
                    <span className='min-w-0 flex-1 truncate text-sm'>
                      {category.name}
                    </span>

                    {category.limit != null && spent != null ? (
                      <span
                        className={cn(
                          'shrink-0 text-xs tabular-nums',
                          percentage! >= 100
                            ? 'text-rose-400'
                            : percentage! >= 80
                              ? 'text-amber-400'
                              : 'text-muted-foreground',
                        )}
                      >
                        {formatCurrency(spent)} /{' '}
                        {formatCurrency(category.limit)}
                      </span>
                    ) : null}

                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      disabled={Boolean(deleting)}
                      onClick={() => void handleDelete(category.id)}
                      className='h-8 w-8 shrink-0 text-rose-300 hover:bg-rose-500/10 hover:text-rose-200'
                      aria-label={`Remover categoria ${category.name}`}
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>

                  {category.limit != null && percentage != null ? (
                    <div className='h-1.5 w-full overflow-hidden rounded-full bg-white/10'>
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          percentage >= 100
                            ? 'bg-rose-500'
                            : percentage >= 80
                              ? 'bg-amber-400'
                              : 'bg-emerald-500',
                        )}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  ) : null}

                  {onUpdateLimit ? (
                    <div className='flex items-center gap-2'>
                      <Label
                        htmlFor={`limit-${category.id}`}
                        className='shrink-0 text-xs text-muted-foreground'
                      >
                        Limite:
                      </Label>
                      <Input
                        id={`limit-${category.id}`}
                        type='number'
                        min='0'
                        step='1'
                        placeholder='Sem limite'
                        value={getLimitStr(category)}
                        onChange={(e) =>
                          setPendingLimits((prev) => ({
                            ...prev,
                            [category.id]: e.target.value,
                          }))
                        }
                        onBlur={() => void handleLimitCommit(category)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') e.currentTarget.blur()
                        }}
                        disabled={updatingLimitId === category.id}
                        className='h-7 text-xs'
                      />
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ul>
        )}

        {error ? <p className='text-sm text-rose-300'>{error}</p> : null}
      </CardContent>
    </Card>
  )
}
