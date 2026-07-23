type FarajaMarkProps = {
  className?: string
  variant?: 'symbol' | 'lockup' | 'wordmark'
  tone?: 'amber' | 'cream' | 'earth' | 'mono'
}

const tones = {
  amber: '#D4A373',
  cream: '#FFF8F0',
  earth: '#6B4F3C',
  mono: '#1a1a1a',
}

/** Concept 2 — Heart & Voice mark */
export function FarajaMark({
  className = '',
  variant = 'lockup',
  tone = 'amber',
}: FarajaMarkProps) {
  const fill = tones[tone]

  const symbol = (
    <svg
      viewBox="0 0 64 64"
      className={variant === 'lockup' ? 'h-14 w-14 sm:h-16 sm:w-16' : className || 'h-10 w-10'}
      aria-hidden={variant !== 'symbol'}
      role={variant === 'symbol' ? 'img' : undefined}
    >
      {variant === 'symbol' && <title>Faraja</title>}
      {/* Heart outline */}
      <path
        d="M32 54.5C32 54.5 8 39.2 8 23.8 8 15.6 14.2 10 21.5 10c4.6 0 8.2 2.4 10.5 5.8C34.3 12.4 37.9 10 42.5 10 49.8 10 56 15.6 56 23.8 56 39.2 32 54.5 32 54.5Z"
        fill="none"
        stroke={fill}
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      {/* Voice bars */}
      <rect x="22" y="28" width="3.2" height="10" rx="1.6" fill={fill} />
      <rect x="28.4" y="22" width="3.2" height="22" rx="1.6" fill={fill} />
      <rect x="34.8" y="25" width="3.2" height="16" rx="1.6" fill={fill} />
      <rect x="41.2" y="29" width="3.2" height="8" rx="1.6" fill={fill} />
    </svg>
  )

  if (variant === 'symbol') {
    return <span className={className}>{symbol}</span>
  }

  if (variant === 'wordmark') {
    return (
      <span
        className={`font-display text-3xl font-semibold tracking-tight sm:text-4xl ${className}`}
        style={{ color: fill }}
      >
        Faraja
      </span>
    )
  }

  return (
    <span className={`inline-flex flex-col items-center gap-2 ${className}`}>
      {symbol}
      <span className="font-display text-3xl font-semibold tracking-tight sm:text-4xl" style={{ color: fill === tones.amber ? tones.earth : fill }}>
        Faraja
      </span>
    </span>
  )
}
