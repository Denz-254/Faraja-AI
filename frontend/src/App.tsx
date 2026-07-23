import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { HistoryPage } from './pages/HistoryPage'
import { HomePage } from './pages/HomePage'
import { LandingPage } from './pages/LandingPage'
import { LogPage } from './pages/LogPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, ready } = useAuth()
  if (!ready) {
    return (
      <div className="bg-atmosphere flex min-h-screen items-center justify-center text-ink-soft">
        Loading…
      </div>
    )
  }
  if (!session) return <Navigate to="/" replace />
  return children
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { session, ready } = useAuth()
  if (!ready) {
    return (
      <div className="bg-atmosphere flex min-h-screen items-center justify-center text-ink-soft">
        Loading…
      </div>
    )
  }
  if (session) return <Navigate to="/home" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicOnly>
            <LandingPage />
          </PublicOnly>
        }
      />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/log"
        element={
          <ProtectedRoute>
            <LogPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <HistoryPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
