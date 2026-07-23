import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

type AppShellProps = {
  children: React.ReactNode
  showNav?: boolean
}

export function AppShell({ children, showNav = true }: AppShellProps) {
  const { session, logout } = useAuth()

  return (
    <div className="bg-atmosphere min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-5 pb-10 pt-6 sm:px-8">
        <header className="mb-8 flex items-center justify-between gap-4">
          <Link to={session ? '/home' : '/'} className="group">
            <p className="font-display text-3xl font-bold tracking-tight text-sea-deep transition group-hover:text-sea sm:text-4xl">
              Faraja
            </p>
          </Link>
          {showNav && session && (
            <nav className="flex items-center gap-2 text-sm font-semibold sm:gap-3 sm:text-base">
              <Link className="rounded-xl px-3 py-2 text-ink-soft transition hover:bg-white/60 hover:text-ink" to="/home">
                Home
              </Link>
              <Link className="rounded-xl px-3 py-2 text-ink-soft transition hover:bg-white/60 hover:text-ink" to="/log">
                Check in
              </Link>
              <Link className="rounded-xl px-3 py-2 text-ink-soft transition hover:bg-white/60 hover:text-ink" to="/history">
                History
              </Link>
              <button
                type="button"
                onClick={logout}
                className="rounded-xl px-3 py-2 text-ink-soft transition hover:bg-white/60 hover:text-ink"
              >
                Sign out
              </button>
            </nav>
          )}
        </header>
        <main className="flex flex-1 flex-col">{children}</main>
      </div>
    </div>
  )
}
