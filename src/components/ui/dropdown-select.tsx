import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface DropdownSelectOption<T extends string> {
  value: T
  label: string
}

interface DropdownSelectProps<T extends string> {
  value: T
  onValueChange: (value: T) => void
  options: Array<DropdownSelectOption<T>>
  placeholder?: string
  disabled?: boolean
  className?: string
  triggerClassName?: string
  contentClassName?: string
}

export function DropdownSelect<T extends string>({
  value,
  onValueChange,
  options,
  placeholder,
  disabled,
  className,
  triggerClassName,
  contentClassName,
}: DropdownSelectProps<T>) {
  const selectedOption = options.find((option) => option.value === value)

  return (
    <div className={cn('w-full', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger disabled={disabled} className='w-full'>
          <Button
            type='button'
            variant='outline'
            className={cn(
              'w-full justify-between border-white/10 bg-black/20 text-sm text-foreground hover:bg-black/30',
              triggerClassName,
            )}
            disabled={disabled}
          >
            <span className='truncate'>
              {selectedOption?.label ?? placeholder ?? 'Selecionar'}
            </span>
            <ChevronDown className='h-4 w-4 text-muted-foreground' />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className={cn('min-w-[var(--anchor-width)]', contentClassName)}
        >
          <DropdownMenuRadioGroup
            value={value}
            onValueChange={(nextValue) => onValueChange(nextValue as T)}
          >
            {options.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
