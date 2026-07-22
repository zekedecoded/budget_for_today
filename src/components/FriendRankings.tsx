import { useCallback, useEffect, useState } from 'react'
import { PixelIcon } from './PixelIcon'
import { PixelAvatar } from './PixelAvatar'
import { useAuth } from '../context/AuthContext'
import {
  fetchAllUserEntries, fetchAllProfiles, getCurrentWeekRange,
  computeWeeklyLeastSpentRankings, computeAllTimeLeastSpentRankings,
  computeMostSavedRankings, computeStreakRankings, computeBiggestSplurgeRankings,
} from '../lib/stats'
import type { FriendRankEntry } from '../types'

type RankingCategory = 'weekly_least' | 'alltime_least' | 'most_saved' | 'streak' | 'splurge'

const CATEGORIES: { key: RankingCategory; label: string; icon: 'trophy' | 'crown' | 'arrow-right' | 'arrow-left' }[] = [
  { key: 'weekly_least', label: 'Least Spent (Week)', icon: 'trophy' },
  { key: 'alltime_least', label: 'Least Spent (All-Time)', icon: 'trophy' },
  { key: 'most_saved', label: 'Most Saved', icon: 'crown' },
  { key: 'streak', label: 'Best Streak', icon: 'arrow-right' },
  { key: 'splurge', label: 'Biggest Splurge', icon: 'arrow-left' },
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
    <div className="pixel-panel mt-4">
      <div className="flex items-center gap-2 mb-3">
        <PixelIcon name="trophy" size={16} className="text-amber" />
        <h2 className="font-pixel text-[16px] text-primary uppercase tracking-wider">Rankings</h2>
      </div>

      <div className="flex gap-1 flex-wrap mb-4">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setCategory(cat.key)}
            className={`category-tag ${category === cat.key ? 'active' : ''}`}
          >
            <PixelIcon name={cat.icon} size={10} className="mr-1" />
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <span className="font-pixel text-[16px] text-faint">Loading...</span>
        </div>
      ) : rankings.length === 0 ? (
        <p className="text-center font-pixel text-[13px] text-faint py-4">
          No data yet. Start tracking!
        </p>
      ) : (
        <div className="max-h-[400px] overflow-y-auto pr-1">
          {rankings.map(entry => {
            const isMe = entry.userId === user?.id
            return (
              <div
                key={entry.userId}
                className={`ranking-row ${isMe ? 'highlight' : ''}`}
              >
                <span className={`rank-badge ${entry.rank === 1 ? 'gold' : entry.rank === 2 ? 'silver' : entry.rank === 3 ? 'bronze' : 'text-faint'}`}>
                  {entry.rank === 1 ? <PixelIcon name="crown" size={12} /> : entry.rank}
                </span>
                {entry.avatar ? (
                  <PixelAvatar userId={entry.userId} size={24} />
                ) : (
                  <span
                    className="flex h-6 w-6 items-center justify-center text-faint flex-shrink-0"
                    style={{ border: '2px solid var(--pixel-border-light)', background: 'rgba(0,0,0,0.1)' }}
                  >
                    ?
                  </span>
                )}
                <span className="flex-1 font-pixel text-[14px] text-primary truncate">
                  {entry.displayName || entry.username}
                  {isMe && <span className="font-pixel text-[11px] text-faint ml-1">(you)</span>}
                </span>
                <span className="font-pixel text-[15px] text-muted">
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
