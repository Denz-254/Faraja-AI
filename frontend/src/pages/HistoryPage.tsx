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
          <h1 className="font-display text-4xl font-semibold text-earth">History</h1>
          <p className="mt-2 text-lg text-earth-soft">Your past check-ins, newest first.</p>
        </div>

        {loading && <p className="text-earth-soft">Loading…</p>}
        {error && (
          <p className="rounded-2xl bg-alert/15 px-4 py-3 text-earth" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && items.length === 0 && (
          <p className="border-t border-mist pt-8 text-center text-lg text-earth-soft">
            No check-ins yet. When you share how you feel, they will show up here.
          </p>
        )}

        <ul className="flex flex-col gap-0 divide-y divide-mist">
          {items.map((item, index) => (
            <li key={`${item.date}-${index}`} className="py-5 first:pt-0">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold capitalize text-amber-deep">{item.mood}</p>
                <p className="text-sm text-earth-soft">{formatDate(item.date)}</p>
              </div>
              <p className="mt-2 text-lg leading-relaxed text-earth">{item.response}</p>
              {item.text && (
                <p className="mt-3 text-earth-soft">&ldquo;{item.text}&rdquo;</p>
              )}
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  )
}
