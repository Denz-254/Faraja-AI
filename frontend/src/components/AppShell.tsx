import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { FarajaMark } from './FarajaMark'

type AppShellProps = {
  children: React.ReactNode
  showNav?: boolean
}

export function AppShell({ children, showNav = true }: AppShellProps) {
  const { session, logout } = useAuth()

  return (
    <div className="bg-atmosphere relative min-h-screen overflow-x-hidden">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-5 pb-12 pt-6 sm:px-8">
        <header className="mb-10 flex items-center justify-between gap-4">
          <Link
            to={session ? '/home' : '/'}
            className="group inline-flex items-center gap-3 transition"
            aria-label="Faraja home"
          >
            <FarajaMark variant="symbol" tone="amber" className="h-9 w-9 transition group-hover:scale-105 sm:h-10 sm:w-10" />
            <span className="font-display text-2xl font-semibold tracking-tight text-earth sm:text-3xl">
              Faraja
            </span>
          </Link>
          {showNav && session && (
            <nav className="flex flex-wrap items-center justify-end gap-1 text-sm font-semibold sm:gap-2 sm:text-base">
              <Link
                className="rounded-xl px-3 py-2 text-earth-soft transition hover:bg-sand/80 hover:text-earth"
                to="/home"
              >
                Home
              </Link>
              <Link
                className="rounded-xl px-3 py-2 text-earth-soft transition hover:bg-sand/80 hover:text-earth"
                to="/log"
              >
                Check in
              </Link>
              <Link
                className="rounded-xl px-3 py-2 text-earth-soft transition hover:bg-sand/80 hover:text-earth"
                to="/talk?mode=proactive"
              >
                Talk
              </Link>
              <Link
                className="rounded-xl px-3 py-2 text-earth-soft transition hover:bg-sand/80 hover:text-earth"
                to="/history"
              >
                History
              </Link>
              <button
                type="button"
                onClick={logout}
                className="rounded-xl px-3 py-2 text-earth-soft transition hover:bg-sand/80 hover:text-earth"
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
