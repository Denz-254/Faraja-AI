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
        <div className="animate-fade-up">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-amber-deep">
            Daily comfort
          </p>
          <h1 className="font-display mt-2 text-4xl font-semibold text-earth sm:text-5xl">
            Hello
          </h1>
          <p className="mt-3 max-w-lg text-lg text-earth-soft">
            How are you feeling today? A short check-in is enough — Faraja is here to listen.
          </p>
        </div>

        {error && (
          <p className="rounded-2xl bg-alert/15 px-4 py-3 text-earth" role="alert">
            {error}
          </p>
        )}

        {today?.has_checkin ? (
          <div className="animate-fade-up-delay border-t border-mist pt-6">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-amber-deep">
              Today&apos;s note
            </p>
            <p className="font-display mt-3 text-2xl leading-snug text-earth sm:text-3xl">
              {today.ai_response}
            </p>
            <p className="mt-4 text-earth-soft">
              Mood: <span className="font-semibold capitalize text-earth">{today.mood}</span>
            </p>
            <Link
              to="/history"
              className="mt-6 inline-block font-semibold text-amber-deep underline-offset-4 hover:underline"
            >
              See your history
            </Link>
          </div>
        ) : (
          <div className="animate-fade-up-delay flex flex-col gap-3 sm:flex-row">
            <Link
              to="/log"
              className="rounded-2xl bg-earth px-8 py-4 text-center text-lg font-bold text-cream transition hover:bg-earth/90"
            >
              Check in now
            </Link>
            <Link
              to="/history"
              className="rounded-2xl border border-amber/40 bg-cream/50 px-8 py-4 text-center text-lg font-bold text-earth transition hover:bg-sand"
            >
              View history
            </Link>
          </div>
        )}
      </section>
    </AppShell>
  )
}
