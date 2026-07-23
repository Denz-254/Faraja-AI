import { useEffect, useState } from 'react'
import { getHistory, type HistoryItem } from '../api/client'
import { AppShell } from '../components/AppShell'
import { useAuth } from '../hooks/useAuth'

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function HistoryPage() {
  const { session } = useAuth()
  const [items, setItems] = useState<HistoryItem[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) return
    getHistory(session.token)
      .then(setItems)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [session])

  return (
    <AppShell>
      <section className="flex flex-1 flex-col gap-6">
        <div>
          <h1 className="font-display text-4xl font-bold text-sea-deep">History</h1>
          <p className="mt-2 text-lg text-ink-soft">Your past check-ins, newest first.</p>
        </div>

        {loading && <p className="text-ink-soft">Loading…</p>}
        {error && (
          <p className="rounded-2xl bg-blush/30 px-4 py-3 text-ink" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && items.length === 0 && (
          <p className="rounded-3xl bg-white/70 px-5 py-8 text-center text-lg text-ink-soft">
            No check-ins yet. When you share how you feel, they will show up here.
          </p>
        )}

        <ul className="flex flex-col gap-4">
          {items.map((item, index) => (
            <li
              key={`${item.date}-${index}`}
              className="rounded-3xl bg-white/75 px-5 py-5 shadow-sm"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold capitalize text-sea">{item.mood}</p>
                <p className="text-sm text-ink-soft">{formatDate(item.date)}</p>
              </div>
              <p className="mt-3 text-lg leading-relaxed text-ink">{item.response}</p>
              {item.text && (
                <p className="mt-3 border-t border-mist pt-3 text-ink-soft">&ldquo;{item.text}&rdquo;</p>
              )}
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  )
}
