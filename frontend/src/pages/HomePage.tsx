import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTodayCheckin, type TodayCheckin } from '../api/client'
import { AppShell } from '../components/AppShell'
import { useAuth } from '../hooks/useAuth'

export function HomePage() {
  const { session } = useAuth()
  const [today, setToday] = useState<TodayCheckin | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!session) return
    getTodayCheckin(session.token)
      .then(setToday)
      .catch((err: Error) => setError(err.message))
  }, [session])

  return (
    <AppShell>
      <section className="flex flex-1 flex-col justify-center gap-8">
        <div>
          <h1 className="font-display text-4xl font-bold text-sea-deep sm:text-5xl">Hello</h1>
          <p className="mt-3 max-w-lg text-lg text-ink-soft">
            How are you feeling today? A short check-in is enough.
          </p>
        </div>

        {error && (
          <p className="rounded-2xl bg-blush/30 px-4 py-3 text-ink" role="alert">
            {error}
          </p>
        )}

        {today?.has_checkin ? (
          <div className="rounded-3xl bg-white/75 p-6 shadow-sm animate-[fadeIn_0.5s_ease-out]">
            <p className="text-sm font-semibold uppercase tracking-wide text-sea">Today&apos;s note</p>
            <p className="mt-3 font-display text-2xl leading-snug text-ink">
              {today.ai_response}
            </p>
            <p className="mt-4 text-ink-soft">
              Mood: <span className="font-semibold capitalize text-ink">{today.mood}</span>
            </p>
            <Link
              to="/history"
              className="mt-6 inline-block font-semibold text-sea underline-offset-4 hover:underline"
            >
              See your history
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              to="/log"
              className="rounded-2xl bg-sea px-8 py-4 text-center text-lg font-bold text-white shadow-lg shadow-sea/20 transition hover:bg-sea-deep"
            >
              Check in now
            </Link>
            <Link
              to="/history"
              className="rounded-2xl bg-white/80 px-8 py-4 text-center text-lg font-bold text-sea-deep transition hover:bg-white"
            >
              View history
            </Link>
          </div>
        )}
      </section>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </AppShell>
  )
}
