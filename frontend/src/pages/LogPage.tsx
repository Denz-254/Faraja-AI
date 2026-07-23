import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createCheckin, type Mood } from '../api/client'
import { AppShell } from '../components/AppShell'
import { MoodPicker } from '../components/MoodPicker'
import { useAuth } from '../hooks/useAuth'

export function LogPage() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [mood, setMood] = useState<Mood | null>(null)
  const [text, setText] = useState('')
  const [response, setResponse] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit() {
    if (!session || !mood) return
    setLoading(true)
    setError('')
    try {
      const result = await createCheckin(session.token, mood, text.trim() || undefined)
      setResponse(result.ai_response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save check-in')
    } finally {
      setLoading(false)
    }
  }

  if (response) {
    return (
      <AppShell>
        <section className="mx-auto flex max-w-xl flex-1 flex-col justify-center gap-6">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-amber-deep">
            A note for you
          </p>
          <h1 className="animate-fade-up font-display text-3xl font-semibold leading-snug text-earth sm:text-4xl">
            {response}
          </h1>
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="mt-4 w-fit rounded-2xl bg-earth px-8 py-4 text-lg font-bold text-cream transition hover:bg-earth/90"
          >
            Back home
          </button>
        </section>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 py-2">
        <div>
          <h1 className="font-display text-4xl font-semibold text-earth">How are you?</h1>
          <p className="mt-2 text-lg text-earth-soft">Pick a mood. A short note is optional.</p>
        </div>

        <MoodPicker value={mood} onChange={setMood} disabled={loading} />

        <label className="block">
          <span className="mb-2 block font-semibold text-earth-soft">Anything on your mind?</span>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={4}
            maxLength={2000}
            disabled={loading}
            placeholder="Optional — write a few words"
            className="w-full resize-none rounded-3xl border-0 bg-surface/90 px-5 py-4 text-lg text-earth shadow-[0_1px_0_rgba(107,79,60,0.06)] outline-none ring-1 ring-mist placeholder:text-earth-soft/60 focus:ring-2 focus:ring-amber/50"
          />
        </label>

        {error && (
          <p className="rounded-2xl bg-alert/15 px-4 py-3 text-earth" role="alert">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={!mood || loading}
          className="rounded-2xl bg-earth px-8 py-4 text-lg font-bold text-cream transition hover:bg-earth/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Saving…' : 'Send check-in'}
        </button>
      </section>
    </AppShell>
  )
}
