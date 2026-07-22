import { useEffect, useState } from 'react'
import { PixelIcon } from './PixelIcon'
import { useAuth } from '../context/AuthContext'
import { fetchDayEntries, computeAllStats } from '../lib/stats'
import type { ComputedStats } from '../types'

function TallyMarks({ count }: { count: number }) {
  if (count === 0) return <span className="text-faint font-pixel text-[14px]">&mdash;</span>
  const groups: React.ReactElement[] = []
  let remaining = count
  let groupIndex = 0
  while (remaining > 0) {
    const groupSize = Math.min(remaining, 5)
    const marks: React.ReactElement[] = []
    for (let i = 0; i < groupSize; i++) {
      marks.push(
        <span key={i} className="tally-mark" style={{ animationDelay: `${groupIndex * 5 + i * 0.08}s` }}>
          /
        </span>
      )
    }
    if (groupSize === 5) {
      groups.push(
        <span key={groupIndex} className="tally-group relative">
          {marks}
          <span className="tally-mark absolute" style={{ left: 0, top: '-3px', animationDelay: `${groupIndex * 5 + 4 * 0.08}s`, transform: 'rotate(-10deg)' }}>
            \
          </span>
        </span>
      )
    } else {
      groups.push(<span key={groupIndex} className="tally-group">{marks}</span>)
    }
    remaining -= groupSize
    groupIndex++
  }
  return <>{groups}</>
}

export function DebtSavingsDisplay() {
  const { user } = useAuth()
  const [stats, setStats] = useState<ComputedStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setStats(null); setLoading(false); return }
    setLoading(true)
    fetchDayEntries(user.id).then(entries => {
      setStats(computeAllStats(entries))
      setLoading(false)
    })
  }, [user])

  if (!user || loading) return null
  if (!stats) return null

  const isSavings = stats.netBalance >= 0

  return (
    <div className="pixel-panel mt-4">
      <div className="flex items-center gap-2 mb-3">
        <PixelIcon
          name={isSavings ? 'piggy' : 'warning'}
          size={16}
          className={isSavings ? 'text-success' : 'text-danger'}
        />
        <h2 className="font-pixel text-[16px] text-primary uppercase tracking-wider">
          {isSavings ? 'Savings' : 'Overspent'}
        </h2>
      </div>

      <div className="flex items-center justify-center py-3">
        <div className="text-center">
          <div
            className="amount-display lg"
            style={{ color: isSavings ? 'var(--moss-light)' : 'var(--overspend-light)' }}
          >
            P{isSavings ? stats.savings : stats.debt}.00
          </div>
          <p
            className="font-pixel text-[12px] uppercase tracking-wider mt-1"
            style={{ color: isSavings ? 'var(--moss)' : 'var(--overspend)', opacity: 0.8 }}
          >
            {isSavings ? 'Total Saved' : 'Total Overspent'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="pixel-inner" style={{ padding: '10px' }}>
          <p className="font-pixel text-[12px] text-muted uppercase tracking-wider mb-1">Streak</p>
          <div className="flex items-center gap-1" style={{ minHeight: '28px' }}>
            {stats.streak > 0 ? (
              <TallyMarks count={stats.streak} />
            ) : (
              <span className="text-faint font-pixel text-[14px]">None yet</span>
            )}
          </div>
          <p className="font-pixel text-[11px] text-faint mt-1">days under budget</p>
        </div>
        <div className="pixel-inner" style={{ padding: '10px' }}>
          <p className="font-pixel text-[12px] text-muted uppercase tracking-wider mb-1">All-Time Spent</p>
          <p className="font-pixel text-[18px] text-primary">
            P{stats.totalSpentAllTime.toFixed(2)}
          </p>
          <p className="font-pixel text-[11px] text-faint mt-1">lifetime total</p>
        </div>
      </div>
    </div>
  )
}
