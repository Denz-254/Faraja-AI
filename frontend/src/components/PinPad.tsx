import { useState } from 'react'

type PinPadProps = {
  onComplete: (pin: string) => void
  disabled?: boolean
}

export function PinPad({ onComplete, disabled = false }: PinPadProps) {
  const [pin, setPin] = useState('')

  function press(digit: string) {
    if (disabled) return
    const next = (pin + digit).slice(0, 4)
    setPin(next)
    if (next.length === 4) {
      onComplete(next)
      setPin('')
    }
  }

  function backspace() {
    if (disabled) return
    setPin((current) => current.slice(0, -1))
  }

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫']

  return (
    <div className="mx-auto w-full max-w-xs">
      <div className="mb-6 flex justify-center gap-3" aria-label={`${pin.length} of 4 digits entered`}>
        {[0, 1, 2, 3].map((index) => (
          <span
            key={index}
            className={`h-3.5 w-3.5 rounded-full transition-all duration-200 ${
              index < pin.length ? 'scale-110 bg-amber' : 'bg-mist'
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {digits.map((digit, index) => {
          if (digit === '') return <span key={`empty-${index}`} />
          if (digit === '⌫') {
            return (
              <button
                key="back"
                type="button"
                onClick={backspace}
                disabled={disabled}
                className="rounded-2xl bg-cream px-4 py-4 text-xl font-semibold text-earth-soft shadow-[0_1px_0_rgba(107,79,60,0.08)] ring-1 ring-mist transition hover:bg-sand disabled:opacity-50"
                aria-label="Delete last digit"
              >
                ⌫
              </button>
            )
          }
          return (
            <button
              key={digit}
              type="button"
              onClick={() => press(digit)}
              disabled={disabled}
              className="rounded-2xl bg-surface/90 px-4 py-4 text-2xl font-bold text-earth shadow-[0_1px_0_rgba(107,79,60,0.08)] ring-1 ring-mist transition hover:-translate-y-0.5 hover:bg-cream active:translate-y-0 disabled:opacity-50"
            >
              {digit}
            </button>
          )
        })}
      </div>
    </div>
  )
}
