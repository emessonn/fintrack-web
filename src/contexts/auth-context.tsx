import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  listenAuthState,
  logout,
  signInWithGoogle,
  type AuthenticatedUser,
} from '@/lib/auth'

interface AuthContextValue {
  user: AuthenticatedUser | null
  loading: boolean
  error: string | null
  loginWithGoogle: () => Promise<void>
  logoutUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = listenAuthState((currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const loginWithGoogle = useCallback(async () => {
    setError(null)

    try {
      const loggedUser = await signInWithGoogle()
      setUser(loggedUser)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Falha ao autenticar com Google.'
      setError(message)
      throw err
    }
  }, [])

  const logoutUser = useCallback(async () => {
    await logout()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, error, loginWithGoogle, logoutUser }),
    [error, loading, loginWithGoogle, logoutUser, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth precisa ser usado dentro de AuthProvider.')
  }

  return context
}
