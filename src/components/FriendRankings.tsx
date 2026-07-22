import { useCallback, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCrown, faTrophy, faArrowRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../context/AuthContext'
import { getAvatarUrl } from '../lib/avatar'
import {
  fetchAllUserEntries, fetchAllProfiles, getCurrentWeekRange,
  computeWeeklyLeastSpentRankings, computeAllTimeLeastSpentRankings,
  computeMostSavedRankings, computeStreakRankings, computeBiggestSplurgeRankings,
} from '../lib/stats'
import type { FriendRankEntry } from '../types'

type RankingCategory = 'weekly_least' | 'alltime_least' | 'most_saved' | 'streak' | 'splurge'

const CATEGORIES: { key: RankingCategory; label: string; icon: any }[] = [
  { key: 'weekly_least', label: 'Least Spent (Week)', icon: faTrophy },
  { key: 'alltime_least', label: 'Least Spent (All-Time)', icon: faTrophy },
  { key: 'most_saved', label: 'Most Saved', icon: faCrown },
  { key: 'streak', label: 'Best Streak', icon: faArrowRight },
  { key: 'splurge', label: 'Biggest Splurge', icon: faArrowLeft },
]

export function Rankings() {
  const { user } = useAuth()
  const [category, setCategory] = useState<RankingCategory>('weekly_least')
  const [rankings, setRankings] = useState<FriendRankEntry[]>([])
  const [loading, setLoading] = useState(true)

  const computeRankings = useCallback(async () => {
    if (!user) return
    setLoading(true)

    const range = getCurrentWeekRange()
    const weekStart = category === 'alltime_least' || category === 'most_saved' || category === 'streak' || category === 'splurge'
      ? undefined : range.start
    const weekEnd = category === 'alltime_least' || category === 'most_saved' || category === 'streak' || category === 'splurge'
      ? undefined : range.end

    const [entriesMap, profilesMap] = await Promise.all([
      fetchAllUserEntries(weekStart, weekEnd),
      fetchAllProfiles(),
    ])

    let result: FriendRankEntry[] = []
    switch (category) {
      case 'weekly_least':
        result = computeWeeklyLeastSpentRankings(entriesMap, profilesMap)
        break
      case 'alltime_least':
        result = computeAllTimeLeastSpentRankings(entriesMap, profilesMap)
        break
      case 'most_saved':
        result = computeMostSavedRankings(entriesMap, profilesMap)
        break
      case 'streak':
        result = computeStreakRankings(entriesMap, profilesMap)
        break
      case 'splurge':
        result = computeBiggestSplurgeRankings(entriesMap, profilesMap)
        break
    }

    setRankings(result)
    setLoading(false)
  }, [user, category])

  useEffect(() => { computeRankings() }, [computeRankings])

  const labelSuffix = (entry: FriendRankEntry): string => {
    switch (category) {
      case 'weekly_least':
      case 'alltime_least':
        return `P${entry.value.toFixed(2)}`
      case 'most_saved':
        return `P${entry.value.toFixed(2)}`
      case 'streak':
        return `${entry.value} day${entry.value === 1 ? '' : 's'}`
      case 'splurge':
        return `P${entry.value.toFixed(2)}`
    }
  }

  if (!user) return null

  return (
    <div className="game-card-solid mt-4">
      <div className="flex items-center gap-2 mb-3">
        <FontAwesomeIcon icon={faTrophy} className="text-[var(--pokemon-yellow)] text-sm" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-white/90">Rankings</h2>
      </div>

      <div className="flex gap-1 flex-wrap mb-4">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setCategory(cat.key)}
            className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg border transition-all ${
              category === cat.key
                ? 'border-[var(--pokemon-yellow)] bg-[var(--pokemon-yellow)]/10 text-[var(--pokemon-yellow)]'
                : 'border-white/10 text-white/40 hover:text-white/60 hover:border-white/20'
            }`}
          >
            <FontAwesomeIcon icon={cat.icon} className="mr-1" />
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-6"><span className="pokeball-loader" /></div>
      ) : rankings.length === 0 ? (
        <p className="text-center text-[10px] text-white/30 py-4">No data yet. Start tracking your spending!</p>
      ) : (
        <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1">
          {rankings.map(entry => {
            const isMe = entry.userId === user?.id
            return (
              <div
                key={entry.userId}
                className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 ${
                  isMe ? 'border-[var(--pokemon-yellow)]/30 bg-[var(--pokemon-yellow)]/[0.04]' : 'border-white/5 bg-white/[0.02]'
                }`}
              >
                <span className={`flex items-center justify-center w-6 h-6 rounded-lg text-[10px] font-bold flex-shrink-0 ${
                  entry.rank === 1 ? 'rank-1' : entry.rank === 2 ? 'rank-2' : entry.rank === 3 ? 'rank-3' : 'text-white/30 bg-white/5'
                }`}>
                  {entry.rank === 1 ? <FontAwesomeIcon icon={faCrown} /> : entry.rank}
                </span>
                {entry.avatar ? (
                  <img src={getAvatarUrl(entry.avatar)} alt="" className="h-6 w-6 rounded-full border border-white/10 object-cover flex-shrink-0" />
                ) : (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-[8px] text-white/20 flex-shrink-0">?</span>
                )}
                <span className="flex-1 text-[11px] font-bold text-white/70 truncate">
                  {entry.displayName || entry.username}
                  {isMe && <span className="text-[8px] text-[var(--pokemon-yellow)]/60 ml-1">(you)</span>}
                </span>
                <span className="text-[11px] font-bold text-white/80 font-mono tabular-nums">
                  {labelSuffix(entry)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
