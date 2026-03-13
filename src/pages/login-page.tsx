import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, WalletCards } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { isFirebaseConfigured } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function LoginPage() {
  const { user, loginWithGoogle, error } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate, user])

  async function handleGoogleLogin() {
    setSubmitting(true)

    try {
      await loginWithGoogle()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className='mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 sm:px-6'>
      <section className='grid w-full items-center gap-6 lg:grid-cols-2'>
        <div className='animate-fade-up space-y-5'>
          <p className='inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-primary'>
            FinTrack
          </p>
          <h1 className='max-w-lg text-4xl font-semibold leading-tight tracking-tight sm:text-5xl'>
            Seu dinheiro organizado em um dashboard moderno e intuitivo.
          </h1>
          <p className='max-w-xl text-muted-foreground'>
            Registre entradas e saidas em segundos, acompanhe o saldo em tempo
            real e mantenha o foco no que importa.
          </p>

          <div className='grid gap-3 sm:grid-cols-2'>
            <div className='glass rounded-xl p-3'>
              <WalletCards className='mb-2 h-4 w-4 text-primary' />
              <p className='text-sm font-medium'>Lançamentos rápidos</p>
              <p className='text-xs text-muted-foreground'>
                Cadastro simples para entradas e saídas.
              </p>
            </div>
            <div className='glass rounded-xl p-3'>
              <ShieldCheck className='mb-2 h-4 w-4 text-cyan-300' />
              <p className='text-sm font-medium'>Dashboard</p>
              <p className='text-xs text-muted-foreground'>
                Dados dos lançamentos organizados.
              </p>
            </div>
          </div>
        </div>

        <Card className='glass animate-fade-up rounded-2xl bg-white/[0.03] [animation-delay:120ms]'>
          <CardHeader>
            <CardTitle className='text-2xl tracking-tight'>
              Entrar na sua conta
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <Button
              className='h-11 w-full'
              onClick={handleGoogleLogin}
              disabled={submitting}
            >
              <img
                src='/google.svg'
                alt='Google icon'
                className='mr-2 h-4 w-4'
              />
              {submitting ? 'Conectando...' : 'Continuar com Google'}
            </Button>

            {!isFirebaseConfigured ? (
              <div className='rounded-lg border border-amber-300/25 bg-amber-400/10 p-3 text-sm text-amber-100'>
                Configure o arquivo .env com as variaveis VITE_FIREBASE_* para
                habilitar a autenticacao Google.
              </div>
            ) : null}

            {error ? (
              <div className='rounded-lg border border-rose-300/25 bg-rose-500/10 p-3 text-sm text-rose-100'>
                {error}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
