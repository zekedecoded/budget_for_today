import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

interface ScratchPanelProps {
  amount: number
  phase: 'idle' | 'scratching' | 'done'
  onScratch: () => void
  children?: ReactNode
}

function randBudget(): number {
  return 50 + Math.floor(Math.random() * 11) * 10
}

export function ScratchPanel({ amount, phase, onScratch, children }: ScratchPanelProps) {
  const [spinning, setSpinning] = useState(false)
  const displayRef = useRef<HTMLSpanElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const reducedMotion = useRef(
    typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false
  )

  const clear = useCallback(() => {
    timers.current.forEach(t => clearTimeout(t))
    timers.current = []
  }, [])

  useEffect(() => clear, [clear])

  const handleTap = useCallback(() => {
    if (phase !== 'idle' || spinning) return
    setSpinning(true)

    if (reducedMotion.current) {
      if (displayRef.current) displayRef.current.textContent = '\u20B1' + amount
      const t = setTimeout(() => {
        setSpinning(false)
        clear()
        onScratch()
      }, 200)
      timers.current.push(t)
      return
    }

    const delays = [60, 90, 130, 200]
    let acc = 0

    for (const d of delays) {
      acc += d
      const t = setTimeout(() => {
        if (displayRef.current) displayRef.current.textContent = '\u20B1' + randBudget()
      }, acc)
      timers.current.push(t)
    }

    const settleDelay = acc + 180
    const t1 = setTimeout(() => {
      if (displayRef.current) displayRef.current.textContent = '\u20B1' + amount
    }, settleDelay)
    timers.current.push(t1)

    const doneDelay = settleDelay + 350
    const t2 = setTimeout(() => {
      setSpinning(false)
      clear()
      onScratch()
    }, doneDelay)
    timers.current.push(t2)
  }, [phase, spinning, amount, onScratch, clear])

  return (
    <div className="relative w-full">
      <div className={`transition-all duration-[350ms] ease-out ${phase === 'done' ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        {children}
      </div>

      <div className={`absolute inset-0 z-10 transition-opacity duration-[300ms] ease-in ${phase === 'done' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="h-full w-full rounded-xl border border-white/10 bg-gradient-to-b from-[#0A1832] to-[#1A2D4A] overflow-hidden">
          <button
            type="button"
            onClick={handleTap}
            disabled={phase !== 'idle' || spinning}
            className="flex flex-col items-center justify-center h-full w-full disabled:cursor-default"
          >
            {spinning ? (
              <>
                <span ref={labelRef} className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40 mb-1">
                  Today&apos;s Trainers Budget
                </span>
                <span
                  ref={displayRef}
                  className="text-[48px] leading-none tracking-tight text-[var(--pokemon-yellow)]"
                  style={{ fontFamily: 'var(--font-amount)' }}
                >
                  {'\u20B1'}{amount}
                </span>
              </>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/60">
                TAP TO REVEAL
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
