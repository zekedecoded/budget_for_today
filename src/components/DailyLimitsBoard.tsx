import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrophy, faUser, faCrown } from '@fortawesome/free-solid-svg-icons'
import { supabase } from '../lib/supabase'
import { getAvatarUrl } from '../lib/avatar'
import type { DailyLimit } from '../types'

function todayKey(): string {
  const d = new Date()
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

export function DailyLimitsBoard() {
  const [limits, setLimits] = useState<DailyLimit[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLimits = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('daily_limits')
      .select('*, profiles(username, display_name, avatar)')
      .eq('date', todayKey())
      .order('created_at', { ascending: false })
    if (error) console.error('Failed to load budgets:', error.message)
    if (data) setLimits(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchLimits()
    const channel = supabase
      .channel('daily_limits_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_limits', filter: 'date=eq.' + todayKey() }, () => { fetchLimits() })
      .subscribe()
    return () => { supabase?.removeChannel(channel) }
  }, [])

  const displayName = (l: DailyLimit) => l.profiles?.display_name || l.profiles?.username || 'Anonymous'

  const sorted = [...limits].sort((a, b) => b.amount - a.amount)

  return (
    <div className="game-card-solid">
      <div className="flex items-center gap-2 mb-5">
        <FontAwesomeIcon icon={faTrophy} className="text-[var(--pokemon-yellow)] text-sm" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-white/90" style={{ fontFamily: 'var(--font-body)' }}>
          Today&apos;s Trainers
        </h2>
        <span className="status-pill ml-auto">{limits.length}</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <span className="pokeball-loader" />
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-8">
          <span className="pokeball mx-auto mb-3 opacity-30" aria-hidden="true" />
          <p className="text-xs text-white/40">No trainers have scratched yet today.</p>
          <p className="text-[10px] text-white/20 mt-1">Be the first to claim your daily drop!</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {sorted.map((l, i) => {
            const rank = i + 1
            const isTop3 = rank <= 3
            return (
              <li key={l.id} className={'leaderboard-row flex items-center justify-between rounded-xl border border-white/5 px-3 py-2.5 ' + (isTop3 ? 'bg-white/[0.03]' : 'bg-white/[0.02]')}>
                <div className="flex items-center gap-2.5 min-w-0">
                  {isTop3 ? (
                    <span className={'rank-badge rank-' + rank}>
                      {rank === 1 ? <FontAwesomeIcon icon={faCrown} className="text-xs" /> : rank}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold text-white/30 bg-white/5 flex-shrink-0">
                      {rank}
                    </span>
                  )}
                  {l.profiles?.avatar ? (
                    <img src={getAvatarUrl(l.profiles.avatar)} alt="" className="h-7 w-7 rounded-full border border-white/10 object-cover flex-shrink-0" />
                  ) : (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-[10px] text-white/20 flex-shrink-0">
                      <FontAwesomeIcon icon={faUser} />
                    </span>
                  )}
                  <span className="text-sm font-bold text-white/80 truncate">{displayName(l)}</span>
                </div>
                <span className="text-lg font-bold text-[var(--pokemon-yellow)] flex-shrink-0 ml-2" style={{ fontFamily: 'var(--font-amount)' }}>
                  {'\u20B1'}{l.amount}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}