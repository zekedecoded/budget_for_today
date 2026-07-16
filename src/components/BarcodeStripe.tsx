import { useMemo } from 'react'
interface BarcodeStripeProps { seed: string }
export function BarcodeStripe({ seed }: BarcodeStripeProps) {
  const bars = useMemo(() => {
    const widths = [1, 1, 2, 3, 1, 2, 1, 3, 2, 1]
    let hash = 0
    for (let i = 0; i < seed.length; i++) {
      hash = (hash * 31 + seed.charCodeAt(i)) % 100000
    }
    const out: number[] = []
    for (let i = 0; i < 44; i++) {
      hash = (hash * 1103515245 + 12345) % 2147483648
      out.push(widths[hash % widths.length])
    }
    return out
  }, [seed])
  return (
    <div className="flex h-10 items-stretch justify-center gap-[2px]" aria-hidden="true">
      {bars.map((w, i) => (
        <span
          key={i}
          className="block h-full"
          style={{ width: `${w * 2}px`, backgroundColor: i % 2 === 0 ? 'var(--ink)' : 'transparent' }}
        />
      ))}
    </div>
  )
}
