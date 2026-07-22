import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPiggyBank, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../context/AuthContext'
import { fetchDayEntries, computeAllStats } from '../lib/stats'
import type { ComputedStats } from '../types'

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
    <div className="game-card-solid mt-4">
      <div className="flex items-center gap-2 mb-3">
        <FontAwesomeIcon
          icon={isSavings ? faPiggyBank : faTriangleExclamation}
          className={`text-sm ${isSavings ? 'text-green-400' : 'text-red-400'}`}
        />
        <h2 className="text-sm font-bold uppercase tracking-wider text-white/90" style={{ fontFamily: 'var(--font-body)' }}>
          {isSavings ? 'Savings' : 'Debt'}
        </h2>
      </div>

      <div className="flex items-center justify-center py-4">
        <div className="text-center">
          <div className={`text-4xl font-bold ${isSavings ? 'text-green-400' : 'text-red-400'}`} style={{ fontFamily: 'var(--font-amount)' }}>
            P{(isSavings ? stats.savings : stats.debt).toFixed(2)}
          </div>
          <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${isSavings ? 'text-green-400/60' : 'text-red-400/60'}`}>
            {isSavings ? 'Total Savings' : 'Total Debt'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="rounded-lg bg-white/[0.03] border border-white/5 p-2">
          <p className="text-[18px] font-bold text-white/80" style={{ fontFamily: 'var(--font-amount)' }}>
            {stats.streak}
          </p>
          <p className="text-[8px] font-bold uppercase tracking-wider text-white/30">Day Streak</p>
        </div>
        <div className="rounded-lg bg-white/[0.03] border border-white/5 p-2">
          <p className="text-[18px] font-bold text-white/80" style={{ fontFamily: 'var(--font-amount)' }}>
            P{stats.totalSpentAllTime.toFixed(2)}
          </p>
          <p className="text-[8px] font-bold uppercase tracking-wider text-white/30">All-Time Spent</p>
        </div>
      </div>
    </div>
  )
}
