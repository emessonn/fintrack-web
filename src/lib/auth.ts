import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type Unsubscribe,
  type User,
} from 'firebase/auth'
import { auth, googleProvider, isFirebaseConfigured } from '@/lib/firebase'

export interface AuthenticatedUser {
  uid: string
  name: string
  email: string
  avatarUrl: string
}

function mapFirebaseUser(user: User): AuthenticatedUser {
  return {
    uid: user.uid,
    name: user.displayName || 'Usuario',
    email: user.email || '',
    avatarUrl: user.photoURL || '',
  }
}

export function listenAuthState(
  callback: (user: AuthenticatedUser | null) => void,
): Unsubscribe {
  if (!isFirebaseConfigured || !auth) {
    callback(null)
    return () => {
      return undefined
    }
  }

  return onAuthStateChanged(auth, (user) => {
    callback(user ? mapFirebaseUser(user) : null)
  })
}

export async function signInWithGoogle(): Promise<AuthenticatedUser> {
  if (!isFirebaseConfigured || !auth || !googleProvider) {
    throw new Error(
      'Firebase não configurado. Preencha as variáveis VITE_FIREBASE_* para usar login Google.',
    )
  }

  const result = await signInWithPopup(auth, googleProvider)
  return mapFirebaseUser(result.user)
}

export async function logout(): Promise<void> {
  if (!auth) {
    return
  }

  await signOut(auth)
}
