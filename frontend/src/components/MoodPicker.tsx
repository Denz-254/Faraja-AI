import type { Mood } from '../api/client'

const MOODS: { id: Mood; label: string; hint: string; face: 'happy' | 'neutral' | 'sad' }[] = [
  { id: 'happy', label: 'Happy', hint: 'Feeling good', face: 'happy' },
  { id: 'neutral', label: 'Okay', hint: 'Just alright', face: 'neutral' },
  { id: 'sad', label: 'Sad', hint: 'Need comfort', face: 'sad' },
]

function FaceIcon({ face, active }: { face: 'happy' | 'neutral' | 'sad'; active: boolean }) {
  const stroke = active ? '#ffffff' : '#145a50'
  const mouth =
    face === 'happy'
      ? 'M18 28c2.5 3.5 7.5 3.5 10 0'
      : face === 'sad'
        ? 'M18 31c2.5-3 7.5-3 10 0'
        : 'M18 30h10'

  return (
    <svg viewBox="0 0 48 48" className="mx-auto mb-3 h-14 w-14" aria-hidden>
      <circle cx="24" cy="24" r="18" fill="none" stroke={stroke} strokeWidth="2.5" />
      <circle cx="17" cy="20" r="2.2" fill={stroke} />
      <circle cx="31" cy="20" r="2.2" fill={stroke} />
      <path d={mouth} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

type MoodPickerProps = {
  value: Mood | null
  onChange: (mood: Mood) => void
  disabled?: boolean
}

export function MoodPicker({ value, onChange, disabled = false }: MoodPickerProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="How are you feeling?">
      {MOODS.map((mood) => {
        const selected = value === mood.id
        return (
          <button
            key={mood.id}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(mood.id)}
            className={`rounded-3xl px-4 py-6 text-center transition duration-200 ${
              selected
                ? 'scale-[1.02] bg-sea text-white shadow-lg shadow-sea/25'
                : 'bg-white/80 text-ink hover:-translate-y-1 hover:bg-white'
            } disabled:opacity-50`}
          >
            <FaceIcon face={mood.face} active={selected} />
            <span className="block font-display text-xl font-semibold">{mood.label}</span>
            <span className={`mt-1 block text-sm ${selected ? 'text-white/85' : 'text-ink-soft'}`}>
              {mood.hint}
            </span>
          </button>
        )
      })}
    </div>
  )
}
