import { useSearchParams } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { FarajaMark } from '../components/FarajaMark'
import { useFarajaVoice } from '../hooks/useFarajaVoice'
import type { Mood, VoiceMode } from '../api/client'

function phaseLabel(phase: string) {
  switch (phase) {
    case 'connecting':
      return 'Connecting to Faraja…'
    case 'listening':
      return 'Faraja is listening'
    case 'speaking':
      return 'Faraja is speaking'
    case 'ended':
      return 'Conversation ended'
    default:
      return 'Ready when you are'
  }
}

export function TalkPage() {
  const [params] = useSearchParams()
  const mode = (params.get('mode') as VoiceMode | null) ?? 'proactive'
  const mood = (params.get('mood') as Mood | null) ?? undefined
  const comfort = params.get('comfort') ?? undefined

  const { status, phase, error, transcript, active, start, stop } = useFarajaVoice({
    mode,
    mood: mood ?? undefined,
    comfortText: comfort ?? undefined,
  })

  const configured = status?.configured ?? false

  return (
    <AppShell>
      <section className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <div className={`relative ${active ? 'animate-soft-pulse' : ''}`}>
              <FarajaMark variant="symbol" tone="amber" className="h-20 w-20 sm:h-24 sm:w-24" />
            </div>
          </div>
          <h1 className="font-display text-4xl font-semibold text-earth">Talk with Faraja</h1>
          <p className="mt-2 text-lg text-earth-soft">
            {mode === 'proactive'
              ? 'Faraja will greet you first and check in.'
              : 'A gentle voice conversation — speak naturally.'}
          </p>
          <p className="mt-3 text-sm font-semibold uppercase tracking-[0.14em] text-amber-deep">
            {phaseLabel(phase)}
          </p>
        </div>

        {status && !configured && (
          <div className="rounded-3xl bg-sand/80 px-5 py-4 text-earth" role="status">
            <p className="font-semibold">Voice is almost ready</p>
            <p className="mt-2 text-earth-soft">
              Add your ElevenLabs API key and Agent ID to <code className="text-earth">backend/.env</code>,
              then enable <strong>first_message</strong> and <strong>prompt</strong> overrides on the agent
              (Security tab). Restart the API after saving.
            </p>
          </div>
        )}

        {error && (
          <p className="rounded-2xl bg-alert/15 px-4 py-3 text-earth" role="alert">
            {error}
          </p>
        )}

        <div className="flex flex-col items-center gap-4">
          {!active ? (
            <button
              type="button"
              onClick={() => void start()}
              disabled={status !== null && !configured}
              className="h-28 w-28 rounded-full bg-earth text-lg font-bold text-cream shadow-lg shadow-earth/25 transition hover:scale-105 hover:bg-earth/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Start
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void stop()}
              className="h-28 w-28 rounded-full bg-amber text-lg font-bold text-earth shadow-lg shadow-amber/30 transition hover:scale-105"
            >
              End
            </button>
          )}
          <p className="max-w-sm text-center text-sm text-earth-soft">
            Allow microphone access when prompted. Faraja speaks first on check-ins.
          </p>
        </div>

        <div className="min-h-40 flex-1 border-t border-mist pt-6">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-amber-deep">
            Conversation
          </p>
          {transcript.length === 0 ? (
            <p className="text-earth-soft">Your words with Faraja will appear here.</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {transcript.map((line) => (
                <li key={line.id}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-earth-soft">
                    {line.role === 'agent' ? 'Faraja' : line.role === 'user' ? 'You' : 'System'}
                  </p>
                  <p className="mt-1 text-lg leading-relaxed text-earth">{line.text}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </AppShell>
  )
}
