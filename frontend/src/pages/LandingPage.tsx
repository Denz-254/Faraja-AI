import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, register } from '../api/client'
import { FarajaMark } from '../components/FarajaMark'
import { PinPad } from '../components/PinPad'
import { useAuth } from '../hooks/useAuth'

type Mode = 'welcome' | 'login' | 'register'

function HeroMark() {
  return (
    <div className="relative mx-auto flex h-48 w-48 items-center justify-center sm:h-56 sm:w-56">
      <div
        className="animate-soft-pulse absolute inset-0 rounded-full bg-amber/25 blur-2xl"
        aria-hidden
      />
      <svg viewBox="0 0 120 120" className="relative h-full w-full drop-shadow-sm" aria-hidden>
        <path
          d="M60 102C60 102 16 74 16 44.5 16 29.2 27.5 18 41 18c8.6 0 15.3 4.4 19 10.6C63.7 22.4 70.4 18 79 18 92.5 18 104 29.2 104 44.5 104 74 60 102 60 102Z"
          fill="none"
          stroke="#D4A373"
          strokeWidth="4.5"
          strokeLinejoin="round"
        />
        <g className="origin-center" style={{ transformBox: 'fill-box' }}>
          <rect className="voice-bar" x="42" y="52" width="5" height="18" rx="2.5" fill="#D4A373" />
          <rect className="voice-bar" x="52" y="40" width="5" height="42" rx="2.5" fill="#D4A373" />
          <rect className="voice-bar" x="62" y="46" width="5" height="30" rx="2.5" fill="#D4A373" />
          <rect className="voice-bar" x="72" y="54" width="5" height="14" rx="2.5" fill="#D4A373" />
        </g>
      </svg>
    </div>
  )
}

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
      <div className="bg-atmosphere relative min-h-screen overflow-hidden">
        <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-5 py-8 sm:px-8 sm:py-10">
          <section className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="animate-fade-up">
              <HeroMark />
            </div>

            <h1 className="animate-fade-up-delay font-display mt-6 text-5xl font-semibold tracking-tight text-earth sm:text-6xl md:text-7xl">
              Faraja
            </h1>

            <p className="animate-fade-up-delay mt-3 max-w-md text-balance text-lg leading-relaxed text-earth-soft sm:text-xl">
              Comfort in every voice. A gentle companion for check-ins, care, and connection.
            </p>

            <div className="animate-fade-up-delay-2 mt-10 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="rounded-2xl bg-earth px-8 py-4 text-lg font-bold text-cream transition hover:bg-earth/90"
              >
                Enter with PIN
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className="rounded-2xl border border-amber/50 bg-cream/60 px-8 py-4 text-lg font-bold text-earth transition hover:border-amber hover:bg-sand"
              >
                Create a PIN
              </button>
            </div>

            <p className="animate-fade-up-delay-2 mt-8 text-sm text-earth-soft">
              In Swahili, <span className="font-semibold text-earth">Faraja</span> means comfort.
            </p>
          </section>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-atmosphere min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-8 sm:px-8">
        <button
          type="button"
          onClick={() => {
            setError('')
            setMode('welcome')
          }}
          className="mb-8 inline-flex w-fit items-center gap-2 text-earth-soft transition hover:text-earth"
        >
          <FarajaMark variant="symbol" tone="amber" className="h-8 w-8" />
          <span className="font-display text-xl font-semibold text-earth">Faraja</span>
        </button>

        <section className="flex flex-1 flex-col justify-center pb-10">
          <h1 className="font-display text-3xl font-semibold text-earth sm:text-4xl">
            {mode === 'register' ? 'Choose a 4-digit PIN' : 'Enter your PIN'}
          </h1>
          <p className="mt-2 text-earth-soft">
            {mode === 'register'
              ? 'Pick something easy to remember. You will use it to sign in.'
              : 'Welcome back. Enter the PIN you created.'}
          </p>

          <div className="mt-10">
            <PinPad onComplete={handlePin} disabled={loading} />
          </div>

          {loading && <p className="mt-4 text-center text-earth-soft">One moment…</p>}
          {error && (
            <p className="mt-4 rounded-2xl bg-alert/15 px-4 py-3 text-center text-earth" role="alert">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={() => {
              setError('')
              setMode(mode === 'login' ? 'register' : 'login')
            }}
            className="mt-8 text-center font-semibold text-amber-deep underline-offset-4 hover:underline"
          >
            {mode === 'login' ? 'Need a new PIN?' : 'Already have a PIN?'}
          </button>
        </section>
      </div>
    </div>
  )
}
