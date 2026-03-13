import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, LogOut, Receipt, Wallet2 } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logoutUser } = useAuth()

  return (
    <main className='mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8'>
      <header className='glass mb-4 animate-fade-up rounded-2xl px-4 py-3 sm:px-5'>
        <div className='flex items-center justify-between gap-4'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary'>
              <Wallet2 className='h-5 w-5' />
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>FinTrack</p>
              <h1 className='text-lg font-semibold tracking-tight'>
                Controle financeiro
              </h1>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant='ghost' className='h-10 rounded-xl px-2'>
                <Avatar size='sm'>
                  <AvatarImage
                    src={user?.avatarUrl}
                    alt={user?.name || 'Usuario'}
                  />
                  <AvatarFallback>
                    {initials(user?.name || 'Usuario')}
                  </AvatarFallback>
                </Avatar>
                <span className='hidden text-sm text-foreground sm:inline'>
                  {user?.name}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-56'>
              <div className='px-2 py-1.5'>
                <p className='text-sm font-medium leading-none'>{user?.name}</p>
                <p className='mt-1 text-xs text-muted-foreground'>
                  {user?.email}
                </p>
              </div>
              <DropdownMenuItem variant='destructive' onClick={logoutUser}>
                <LogOut className='h-4 w-4' />
                Sair da conta
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <nav className='glass mb-6 animate-fade-up rounded-2xl px-4 py-2 [animation-delay:40ms]'>
        <div className='flex gap-1'>
          <NavLink
            to='/dashboard'
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
              }`
            }
          >
            <LayoutDashboard className='h-4 w-4' />
            Dashboard
          </NavLink>
          <NavLink
            to='/bills'
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
              }`
            }
          >
            <Receipt className='h-4 w-4' />
            Contas a Pagar
          </NavLink>
        </div>
      </nav>

      {children}
    </main>
  )
}
