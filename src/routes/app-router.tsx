import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/contexts/auth-context'
import { BillsPage } from '@/pages/bills-page'
import { DashboardPage } from '@/pages/dashboard-page'
import { LoginPage } from '@/pages/login-page'

function ProtectedRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <main className='flex min-h-screen items-center justify-center'>
        <div className='glass rounded-xl px-5 py-3 text-sm text-muted-foreground'>
          Carregando seus dados...
        </div>
      </main>
    )
  }

  if (!user) {
    return <Navigate to='/login' replace />
  }

  return <Outlet />
}

export function AppRouter() {
  return (
    <Routes>
      <Route path='/login' element={<LoginPage />} />

      <Route element={<ProtectedRoutes />}>
        <Route path='/' element={<Navigate to='/dashboard' replace />} />
        <Route path='/dashboard' element={<DashboardPage />} />
        <Route path='/bills' element={<BillsPage />} />
      </Route>

      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  )
}
