import { useCallback, useEffect, useState, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStamp, faPrint, faArrowRotateRight } from '@fortawesome/free-solid-svg-icons'
import { BarcodeStripe } from './BarcodeStripe'

function formatReceiptDate(d: Date): string {
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
  return `${days[d.getDay()]} · ${months[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')} ${d.getFullYear()}`
}
function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function budgetForDate(d: Date): number {
  const key = dateKey(d)
  let hash = 2166136261
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  const buckets = 11 // 50,60,...,150
  const idx = (hash >>> 0) % buckets
  return 50 + idx * 10
}
function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
type Phase = 'idle' | 'printing' | 'done'

export function BudgetReceipt() {
  const [now] = useState(() => new Date())
  const amount = budgetForDate(now)
  const fullText = `₱${amount}`
  const [phase, setPhase] = useState<Phase>('idle')
  const [printed, setPrinted] = useState('')
  const timers = useRef<number[]>([])

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }, [])
  useEffect(() => clearTimers, [clearTimers])

  const reveal = useCallback(() => {
    if (phase === 'printing') return
    clearTimers()
    setPhase('printing')
    if (prefersReducedMotion()) {
      setPrinted(fullText)
      setPhase('done')
      return
    }
    setPrinted('')
    const chars = fullText.split('')
    chars.forEach((_, i) => {
      const t = window.setTimeout(() => {
        setPrinted(fullText.slice(0, i + 1))
        if (i === chars.length - 1) setPhase('done')
      }, 140 * (i + 1))
      timers.current.push(t)
    })
  }, [phase, fullText, clearTimers])

  const showCaret = phase === 'printing'
  const pesoPrinted = printed.length >= 1
  const digitsPrinted = printed.slice(1)

  return (
    <main className="flex min-h-full w-full items-center justify-center px-4 py-8">
      <section className="w-full max-w-[340px]" aria-label="Today's budget challenge receipt">
        <div className="receipt-edge receipt-edge-top" aria-hidden="true" />
        <div className="paper-grain bg-[var(--paper)] px-6 pb-7 pt-6 shadow-[0_18px_40px_-24px_rgba(35,32,25,0.55)]">
          <header className="text-center">
            <h1 className="text-[15px] font-bold uppercase tracking-[0.22em]" style={{ fontFamily: 'var(--font-body)' }}>
              Budget&nbsp;for&nbsp;Today
            </h1>
            <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-[var(--ink)]/70" style={{ fontFamily: 'var(--font-body)' }}>
              {formatReceiptDate(now)}
            </p>
          </header>

          <Divider />

          <p className="text-center text-[11px] uppercase tracking-[0.2em] text-[var(--ink)]/60" style={{ fontFamily: 'var(--font-body)' }}>
            Today&apos;s Spending Challenge
          </p>

          <div aria-live="polite" aria-atomic="true" className="flex min-h-[76px] items-baseline justify-center gap-1 py-4">
            {phase === 'idle' ? (
              <span
                className="text-[56px] font-bold leading-none tracking-tight text-[var(--ink)]/25"
                style={{ fontFamily: 'var(--font-body)' }}
                aria-hidden="true"
              >
                ₱— —
              </span>
            ) : (
              <>
                <span
                  className="text-[38px] font-bold leading-none"
                  style={{ fontFamily: 'var(--font-body)', color: 'var(--peso)' }}
                >
                  {pesoPrinted ? '₱' : ''}
                </span>
                <span
                  className="text-[56px] font-bold leading-none tracking-tight tabular-nums"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--peso)', fontVariationSettings: "'wght' 900" }}
                >
                  {digitsPrinted}
                  {showCaret && (
                    <span className="print-caret ml-0.5 inline-block" style={{ fontFamily: 'var(--font-body)' }} aria-hidden="true">
                      ▌
                    </span>
                  )}
                </span>
              </>
            )}
          </div>

          <Divider />

          <button
            type="button"
            onClick={reveal}
            disabled={phase === 'printing'}
            className="w-full border-2 border-[var(--ink)] bg-[var(--ink)] px-4 py-3 text-[13px] font-bold uppercase tracking-[0.18em] text-[var(--paper)] transition-colors hover:bg-transparent hover:text-[var(--ink)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--stamp)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--paper)] disabled:cursor-not-allowed disabled:opacity-60"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            <span className="inline-flex items-center justify-center gap-2">
              <FontAwesomeIcon icon={phase === 'done' ? faArrowRotateRight : faPrint} aria-hidden="true" />
              {phase === 'done' ? "Reprint Today's Budget" : "Reveal Today's Budget"}
            </span>
          </button>

          <p
            className="mt-4 flex items-center justify-center gap-2 text-center text-[10px] uppercase tracking-[0.3em]"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--stamp)' }}
          >
            <FontAwesomeIcon icon={faStamp} className="-rotate-6" aria-hidden="true" />
            New challenge daily
            <FontAwesomeIcon icon={faStamp} className="rotate-6" aria-hidden="true" />
          </p>

          <div className="mt-5">
            <BarcodeStripe seed={dateKey(now)} />
          </div>

          <p className="mt-3 text-center text-[10px] uppercase tracking-[0.16em] text-[var(--ink)]/70" style={{ fontFamily: 'var(--font-body)' }}>
            MIN ₱50 · MAX ₱150 · ONE PER DAY
          </p>
        </div>
        <div className="receipt-edge receipt-edge-bottom" aria-hidden="true" />
      </section>
    </main>
  )
}

function Divider() {
  return <div className="my-4 border-t border-dashed border-[var(--ink)]/40" aria-hidden="true" />
}
