import { useMemo } from 'react'

interface ScratchPanelProps {
  amount: number
  phase: 'idle' | 'scratching' | 'done'
  onScratch: () => void
}

const STRIP_COUNT = 7
const STAGGER_MS = 70

export function ScratchPanel({ amount, phase, onScratch }: ScratchPanelProps) {
  const revealed = phase !== 'idle'
  const strips = useMemo(
    () =>
      Array.from({ length: STRIP_COUNT }, (_, i) => ({
        rotate: (i % 2 === 0 ? -1 : 1) * (8 + ((i * 37) % 10)),
        delay: i * STAGGER_MS,
      })),
    [],
  )

  return (
    <button
      type="button"
      onClick={onScratch}
      disabled={revealed}
      aria-label={
        phase === 'idle'
          ? "Scratch to reveal today's spending challenge"
          : `Today's spending challenge: ₱${amount}`
      }
      className="relative block h-[104px] w-full overflow-hidden rounded-xl bg-[var(--ink)] shadow-[inset_0_2px_6px_rgba(0,0,0,0.4)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:cursor-default"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <span
          className="text-[54px] leading-none tracking-tight"
          style={{ fontFamily: 'var(--font-amount)', color: 'var(--gold)' }}
        >
          ₱{amount}
        </span>
      </span>

      {!revealed || phase === 'scratching' ? (
        <span aria-hidden="true" className="absolute inset-0 flex">
          {strips.map((strip, i) => (
            <span
              key={i}
              className={`foil-strip h-full flex-1 ${revealed ? 'foil-strip-gone' : ''}`}
              style={
                {
                  '--strip-r': `${strip.rotate}deg`,
                  transitionDelay: revealed ? `${strip.delay}ms` : '0ms',
                } as React.CSSProperties
              }
            />
          ))}
        </span>
      ) : null}

      {phase === 'idle' && (
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center gap-2 text-[13px] font-bold uppercase tracking-[0.2em]"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--ink)' }}
        >
          Scratch Here
        </span>
      )}
    </button>
  )
}
