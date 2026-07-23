import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

const STORAGE_KEY = 'faraja.session'

export type Session = {
  userId: string
  token: string
}

type AuthContextValue = {
  session: Session | null
  ready: boolean
  setSession: (session: Session | null) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setSessionState(JSON.parse(raw) as Session)
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    } finally {
      setReady(true)
    }
  }, [])

  function setSession(next: Session | null) {
    setSessionState(next)
    if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    else localStorage.removeItem(STORAGE_KEY)
  }

  function logout() {
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ session, ready, setSession, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
