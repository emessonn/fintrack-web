import { useEffect, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  title: string
  description?: string
  children: ReactNode
  onClose: () => void
}

export function Modal({
  open,
  title,
  description,
  children,
  onClose,
}: ModalProps) {
  useEffect(() => {
    if (!open) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  return (
    <div
      aria-hidden={!open}
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4 transition duration-200',
        open ? 'opacity-100' : 'pointer-events-none opacity-0',
      )}
    >
      <button
        type='button'
        aria-label='Fechar modal'
        tabIndex={open ? 0 : -1}
        className='absolute inset-0 bg-black/70 backdrop-blur-[2px]'
        onClick={onClose}
      />

      <section
        role='dialog'
        aria-modal='true'
        aria-label={title}
        className={cn(
          'relative z-10 w-full max-w-xl rounded-2xl border border-white/10 bg-zinc-950/95 p-4 shadow-2xl transition duration-200 sm:p-5',
          open ? 'scale-100 translate-y-0' : 'translate-y-3 scale-95',
        )}
      >
        <header className='mb-4 flex items-start justify-between gap-3'>
          <div>
            <h2 className='text-lg font-semibold tracking-tight'>{title}</h2>
            {description ? (
              <p className='text-sm text-muted-foreground'>{description}</p>
            ) : null}
          </div>

          <button
            type='button'
            onClick={onClose}
            className='rounded-md px-2 py-1 text-sm text-muted-foreground transition hover:bg-white/10 hover:text-foreground'
          >
            Fechar
          </button>
        </header>

        <div>{children}</div>
      </section>
    </div>
  )
}
