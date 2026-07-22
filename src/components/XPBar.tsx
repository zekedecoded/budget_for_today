import { useMemo } from 'react'

interface XPBarProps {
  spent: number
  budget: number
}

const SEGMENT_COUNT = 10

export function XPBar({ spent, budget }: XPBarProps) {
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0
  const isOverspent = spent > budget
  const fillPct = Math.min(pct, 100)

  const tickPositions = useMemo(() => {
    const ticks: number[] = []
    for (let i = 1; i < SEGMENT_COUNT; i++) {
      ticks.push((i / SEGMENT_COUNT) * 100)
    }
    return ticks
  }, [])

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="font-pixel text-[13px] text-muted uppercase tracking-wider">
          {isOverspent ? 'Over Budget!' : 'Spent'}
        </span>
        <span className="font-pixel text-[14px]" style={{ color: isOverspent ? 'var(--overspend-light)' : 'var(--amber)' }}>
          P{spent.toFixed(0)} / P{budget}
        </span>
      </div>
      <div className="xp-bar-track">
        <div
          className={`xp-bar-fill ${pct >= 100 ? 'glowing' : ''}`}
          style={{ width: `${fillPct}%` }}
        />
        <div className="xp-bar-segments">
          {Array.from({ length: SEGMENT_COUNT }, (_, i) => (
            <div key={i} className="xp-bar-segment" />
          ))}
        </div>
        <div className="xp-bar-ticks">
          {tickPositions.map((pos, i) => (
            <div
              key={i}
              className="xp-bar-tick"
              style={{ left: `${pos}%` }}
            />
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="font-pixel text-[11px] text-faint">
          {pct >= 100 ? 'LEVEL COMPLETE' : `${Math.round(pct)}%`}
        </span>
        {isOverspent && (
          <span className="font-pixel text-[11px] text-danger">
            -P{(spent - budget).toFixed(0)} over
          </span>
        )}
      </div>
    </div>
  )
}
