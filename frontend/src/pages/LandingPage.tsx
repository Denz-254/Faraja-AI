import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login, register } from '../api/client'
import { AppShell } from '../components/AppShell'
import { PinPad } from '../components/PinPad'
import { useAuth } from '../hooks/useAuth'

type Mode = 'welcome' | 'login' | 'register'

export function LandingPage() {
  const { setSession } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('welcome')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handlePin(pin: string) {
    setError('')
    setLoading(true)
    try {
      if (mode === 'register') {
        await register(pin)
        const session = await login(pin)
        setSession({ userId: session.user_id, token: session.session_token })
      } else {
        const session = await login(pin)
        setSession({ userId: session.user_id, token: session.session_token })
      }
      navigate('/home')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (mode === 'welcome') {
    return (
      <AppShell showNav={false}>
        <section className="flex flex-1 flex-col justify-center gap-8 py-6">
          <div className="animate-[fadeUp_0.7s_ease-out]">
            <p className="font-display text-5xl font-bold leading-tight text-sea-deep sm:text-6xl">
              Faraja
            </p>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-ink-soft sm:text-xl">
              A gentle place to check in, share how you feel, and receive a little comfort.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row animate-[fadeUp_0.9s_ease-out]">
            <button
              type="button"
              onClick={() => setMode('login')}
              className="rounded-2xl bg-sea px-8 py-4 text-lg font-bold text-white shadow-lg shadow-sea/20 transition hover:bg-sea-deep"
            >
              Enter with PIN
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className="rounded-2xl bg-white/80 px-8 py-4 text-lg font-bold text-sea-deep transition hover:bg-white"
            >
              Create a PIN
            </button>
          </div>

          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-64 opacity-40 sm:h-80"
            aria-hidden
            style={{
              background:
                'radial-gradient(ellipse at bottom, rgba(31,122,108,0.25), transparent 70%)',
            }}
          />
        </section>
        <style>{`
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </AppShell>
    )
  }

  return (
    <AppShell showNav={false}>
      <section className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-4">
        <h1 className="font-display text-3xl font-bold text-sea-deep sm:text-4xl">
          {mode === 'register' ? 'Choose a 4-digit PIN' : 'Enter your PIN'}
        </h1>
        <p className="mt-2 text-ink-soft">
          {mode === 'register'
            ? 'Pick something easy to remember. You will use it to sign in.'
            : 'Welcome back. Enter the PIN you created.'}
        </p>

        <div className="mt-8">
          <PinPad onComplete={handlePin} disabled={loading} />
        </div>

        {loading && <p className="mt-4 text-center text-ink-soft">One moment…</p>}
        {error && (
          <p className="mt-4 rounded-2xl bg-blush/30 px-4 py-3 text-center text-ink" role="alert">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={() => {
            setError('')
            setMode(mode === 'login' ? 'register' : 'login')
          }}
          className="mt-6 text-center font-semibold text-sea underline-offset-4 hover:underline"
        >
          {mode === 'login' ? 'Need a new PIN?' : 'Already have a PIN?'}
        </button>

        <Link to="/" onClick={() => setMode('welcome')} className="mt-3 text-center text-ink-soft hover:text-ink">
          Back
        </Link>
      </section>
    </AppShell>
  )
}
