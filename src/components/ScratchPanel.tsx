import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { PixelIcon } from './PixelIcon'

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
      if (displayRef.current) displayRef.current.textContent = 'P' + amount
      const t = setTimeout(() => { setSpinning(false); clear(); onScratch() }, 200)
      timers.current.push(t)
      return
    }

    const delays = [60, 90, 130, 200]
    let acc = 0
    for (const d of delays) {
      acc += d
      const t = setTimeout(() => {
        if (displayRef.current) displayRef.current.textContent = 'P' + randBudget()
      }, acc)
      timers.current.push(t)
    }
    const settleDelay = acc + 180
    const t1 = setTimeout(() => {
      if (displayRef.current) displayRef.current.textContent = 'P' + amount
    }, settleDelay)
    timers.current.push(t1)
    const doneDelay = settleDelay + 350
    const t2 = setTimeout(() => { setSpinning(false); clear(); onScratch() }, doneDelay)
    timers.current.push(t2)
  }, [phase, spinning, amount, onScratch, clear])

  return (
    <div className="relative w-full">
      <div className={`transition-all duration-[350ms] ease-out ${phase === 'done' ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        {children}
      </div>
      <div className={`scratch-overlay transition-opacity duration-[300ms] ease-in ${phase === 'done' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <button type="button" onClick={handleTap} disabled={phase !== 'idle' || spinning} className="w-full h-full">
          {spinning ? (
            <>
              <span className="font-pixel text-[14px] text-muted uppercase tracking-wider mb-1">
                Today's Budget
              </span>
              <span ref={displayRef} className="amount-display md font-pixel">
                P{amount}
              </span>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <PixelIcon name="coin" size={32} className="text-muted" />
              <span className="font-pixel text-[14px] text-faint uppercase tracking-widest">
                TAP TO REVEAL
              </span>
            </div>
          )}
        </button>
      </div>
    </div>
  )
}
