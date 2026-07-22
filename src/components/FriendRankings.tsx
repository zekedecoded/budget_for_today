import { useCallback, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCrown, faTrophy, faArrowRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { getAvatarUrl } from '../lib/avatar'
import {
  fetchDayEntries, fetchFriendEntries, getCurrentWeekRange,
  computeWeeklyLeastSpentRankings, computeAllTimeLeastSpentRankings,
  computeMostSavedRankings, computeStreakRankings, computeBiggestSplurgeRankings,
} from '../lib/stats'
import type { FriendRankEntry, Profile } from '../types'

type RankingCategory = 'weekly_least' | 'alltime_least' | 'most_saved' | 'streak' | 'splurge'

const CATEGORIES: { key: RankingCategory; label: string; icon: any }[] = [
  { key: 'weekly_least', label: 'Least Spent (Week)', icon: faTrophy },
  { key: 'alltime_least', label: 'Least Spent (All-Time)', icon: faTrophy },
  { key: 'most_saved', label: 'Most Saved', icon: faCrown },
  { key: 'streak', label: 'Best Streak', icon: faArrowRight },
  { key: 'splurge', label: 'Biggest Splurge', icon: faArrowLeft },
]

export function FriendRankings() {
  const { user, profile } = useAuth()
  const [category, setCategory] = useState<RankingCategory>('weekly_least')
  const [rankings, setRankings] = useState<FriendRankEntry[]>([])
  const [loading, setLoading] = useState(true)

  const computeRankings = useCallback(async () => {
    if (!user) return
    setLoading(true)

    const range = getCurrentWeekRange()
    const entries = await fetchDayEntries(user.id)
    const friendProfiles = await fetchAcceptedFriends(user.id)
    const friendIds = friendProfiles.map(f => f.id)

    const weekStart = category === 'alltime_least' || category === 'most_saved' || category === 'streak' || category === 'splurge'
      ? undefined : range.start
    const weekEnd = category === 'alltime_least' || category === 'most_saved' || category === 'streak' || category === 'splurge'
      ? undefined : range.end

    const friendEntriesMap = await fetchFriendEntries(
      friendIds,
      weekStart,
      weekEnd,
    )

    const friendProfileMap = new Map<string, { username: string; display_name: string | null; avatar: number | null }>()
    for (const fp of friendProfiles) {
      friendProfileMap.set(fp.id, { username: fp.username, display_name: fp.display_name, avatar: fp.avatar })
    }

    const userDisplay = {
      id: user.id,
      username: profile?.username || '',
      displayName: profile?.display_name || null,
      avatar: profile?.avatar || null,
    }

    let result: FriendRankEntry[] = []
    switch (category) {
      case 'weekly_least':
        result = computeWeeklyLeastSpentRankings(entries, friendEntriesMap, userDisplay, friendProfileMap)
        break
      case 'alltime_least':
        result = computeAllTimeLeastSpentRankings(entries, friendEntriesMap, userDisplay, friendProfileMap)
        break
      case 'most_saved':
        result = computeMostSavedRankings(entries, friendEntriesMap, userDisplay, friendProfileMap)
        break
      case 'streak':
        result = computeStreakRankings(entries, friendEntriesMap, userDisplay, friendProfileMap)
        break
      case 'splurge':
        result = computeBiggestSplurgeRankings(entries, friendEntriesMap, userDisplay, friendProfileMap)
        break
    }

    setRankings(result)
    setLoading(false)
  }, [user, profile, category])

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
        <h2 className="text-sm font-bold uppercase tracking-wider text-white/90">Friend Rankings</h2>
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
        <p className="text-center text-[10px] text-white/30 py-4">No friends to rank yet. Add some friends first!</p>
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

async function fetchAcceptedFriends(userId: string): Promise<Profile[]> {
  const { data: friendships } = await supabase
    .from('friendships')
    .select('friend_id')
    .eq('user_id', userId)
    .eq('status', 'accepted')
  const { data: reverse } = await supabase
    .from('friendships')
    .select('user_id')
    .eq('friend_id', userId)
    .eq('status', 'accepted')
  const friendIds = new Set<string>()
  for (const f of friendships || []) friendIds.add(f.friend_id)
  for (const f of reverse || []) friendIds.add(f.user_id)
  if (friendIds.size === 0) return []
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .in('id', [...friendIds])
  return (profiles || []) as Profile[]
}
