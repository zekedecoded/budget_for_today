import type { ReactNode } from 'react'

interface ScratchPanelProps {
  amount: number
  phase: 'idle' | 'scratching' | 'done'
  onScratch: () => void
  children?: ReactNode
}

const COVER_DURATION = 600

export function ScratchPanel({ amount, phase, onScratch, children }: ScratchPanelProps) {
  const revealed = phase !== 'idle'

  return (
    <div className="relative w-full rounded-xl border border-white/10 overflow-hidden" style={{ minHeight: '112px' }}>
      {/* Layer 1: Revealed content — visible when done, hidden during scratch */}
      <div
        className={`transition-all duration-[400ms] ease-out ${
          phase === 'done' ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        {children}
      </div>

      {/* Layer 2: Scratch cover button — hidden when done */}
      <div
        className={`absolute inset-0 z-10 transition-all duration-[350ms] ease-in ${
          phase === 'done' ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <button
          type="button"
          onClick={onScratch}
          disabled={revealed}
          aria-label={phase === 'idle' ? "Scratch to reveal today's spending challenge" : "Today's spending challenge: \u20B1" + amount}
          className="block h-[112px] w-full bg-[#1A2D4A] shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pokemon-yellow)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A1832] disabled:cursor-default"
        >
          {/* Amount visible underneath covers */}
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40 mb-1">Today&apos;s Budget</span>
            <span className="text-[48px] leading-none tracking-tight text-white" style={{ fontFamily: 'var(--font-amount)' }}>
              {'\u20B1'}{amount}
            </span>
          </span>

          {/* Cover layers */}
          <span aria-hidden="true" className="absolute inset-0 flex flex-col pointer-events-none">
            {/* Top half — slides up */}
            <span
              className={`relative h-1/2 overflow-hidden bg-gradient-to-b from-[#1A2D4A] to-[#2E4A7A] border-b border-white/10 transition-all duration-[${COVER_DURATION}ms] ease-out ${revealed ? '-translate-y-full' : 'translate-y-0'}`}
              style={{ transitionDuration: COVER_DURATION + 'ms' }}
            >
              <span className={`absolute inset-0 flex items-end justify-center pb-4 transition-opacity duration-200 ${revealed ? 'opacity-0' : 'opacity-100'}`}>
                <span className="text-[28px] font-bold tracking-tight text-white/90" style={{ fontFamily: 'var(--font-amount)' }}>
                  ???
                </span>
              </span>
            </span>

            {/* Center Poké Ball button — shrinks away */}
            <span
              className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-[${COVER_DURATION}ms] ease-out ${revealed ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
              style={{ transitionDuration: COVER_DURATION + 'ms' }}
            >
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-b from-[#FF1C1C] to-[#CC0000] border-[3px] border-[#222] shadow-lg shadow-red-900/40">
                <span className="w-3.5 h-3.5 rounded-full bg-white border-[2.5px] border-[#222]" />
              </span>
            </span>

            {/* Bottom half — slides down */}
            <span
              className={`relative h-1/2 overflow-hidden bg-gradient-to-t from-[#1A2D4A] to-[#2E4A7A] border-t border-white/10 transition-all duration-[${COVER_DURATION}ms] ease-out ${revealed ? 'translate-y-full' : 'translate-y-0'}`}
              style={{ transitionDuration: COVER_DURATION + 'ms' }}
            >
              <span className={`absolute inset-0 flex items-start justify-center pt-4 transition-opacity duration-200 ${revealed ? 'opacity-0' : 'opacity-100'}`}>
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/60 scratch-label">
                  SCRATCH TO REVEAL
                </span>
              </span>
            </span>
          </span>
        </button>
      </div>
    </div>
  )
}
