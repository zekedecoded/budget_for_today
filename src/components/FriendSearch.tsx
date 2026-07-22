import { useCallback, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserPlus, faUserCheck, faClock, faSearch, faUserGroup } from '@fortawesome/free-solid-svg-icons'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { getAvatarUrl } from '../lib/avatar'
import type { Profile, Friendship } from '../types'

interface FriendWithStatus {
  profile: Profile
  status: 'pending' | 'accepted' | 'none'
  direction: 'sent' | 'received' | null
}

export function FriendSearch() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<Profile[]>([])
  const [friends, setFriends] = useState<FriendWithStatus[]>([])
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)

  const fetchFriends = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data: sent } = await supabase
      .from('friendships')
      .select('*, profiles!friendships_friend_id_fkey(id, username, display_name, avatar)')
      .eq('user_id', user.id)
    const { data: received } = await supabase
      .from('friendships')
      .select('*, profiles!friendships_user_id_fkey(id, username, display_name, avatar)')
      .eq('friend_id', user.id)

    const map = new Map<string, FriendWithStatus>()
    for (const f of (sent || []) as (Friendship & { profiles: Profile })[]) {
      const p = f.profiles
      if (p) map.set(p.id, { profile: p, status: f.status as 'pending' | 'accepted', direction: 'sent' })
    }
    for (const f of (received || []) as (Friendship & { profiles: Profile })[]) {
      const p = f.profiles
      if (p) {
        const existing = map.get(p.id)
        if (existing) {
          existing.status = f.status as 'pending' | 'accepted'
        } else {
          map.set(p.id, { profile: p, status: f.status as 'pending' | 'accepted', direction: 'received' })
        }
      }
    }
    setFriends([...map.values()])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchFriends() }, [fetchFriends])

  const handleSearch = useCallback(async () => {
    const q = search.trim()
    if (!q || q.length < 2) return
    setSearching(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', user?.id)
      .ilike('username', `%${q}%`)
      .limit(10)
    setResults((data || []) as Profile[])
    setSearching(false)
  }, [search, user])

  const sendRequest = useCallback(async (friendId: string) => {
    if (!user) return
    await supabase.from('friendships').insert({ user_id: user.id, friend_id: friendId, status: 'pending' })
    fetchFriends()
    setResults([])
    setSearch('')
  }, [user, fetchFriends])

  const acceptRequest = useCallback(async (friendId: string) => {
    if (!user) return
    await supabase.from('friendships').update({ status: 'accepted' }).eq('user_id', friendId).eq('friend_id', user.id)
    fetchFriends()
  }, [user, fetchFriends])

  if (!user) return null

  const acceptedFriends = friends.filter(f => f.status === 'accepted')
  const pendingFriends = friends.filter(f => f.status === 'pending')

  return (
    <div className="game-card-solid">
      <div className="flex items-center gap-2 mb-4">
        <FontAwesomeIcon icon={faUserGroup} className="text-[var(--pokemon-yellow)] text-sm" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-white/90">Friends</h2>
        <span className="status-pill ml-auto">{acceptedFriends.length}</span>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="Search by username..."
          maxLength={20}
          className="game-input flex-1 min-w-0 text-[11px]"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={search.trim().length < 2 || searching}
          className="game-btn game-btn-primary game-btn-sm flex-shrink-0"
        >
          <FontAwesomeIcon icon={faSearch} />
        </button>
      </div>

      {results.length > 0 && (
        <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.03] p-2">
          <p className="text-[9px] font-bold uppercase tracking-wider text-white/30 px-2 mb-1">Search Results</p>
          {results.map(p => (
            <div key={p.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.03]">
              {p.avatar ? (
                <img src={getAvatarUrl(p.avatar)} alt="" className="h-7 w-7 rounded-full border border-white/10 object-cover flex-shrink-0" />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-[10px] text-white/20 flex-shrink-0">?</span>
              )}
              <span className="flex-1 text-[12px] font-bold text-white/70 truncate">{p.display_name || p.username}</span>
              <button
                type="button"
                onClick={() => sendRequest(p.id)}
                className="game-btn game-btn-yellow game-btn-sm"
              >
                <FontAwesomeIcon icon={faUserPlus} /> Add
              </button>
            </div>
          ))}
        </div>
      )}

      {pendingFriends.length > 0 && (
        <div className="mb-4">
          <p className="text-[9px] font-bold uppercase tracking-wider text-white/30 mb-2 flex items-center gap-1">
            <FontAwesomeIcon icon={faClock} /> Pending Requests
          </p>
          <div className="space-y-1">
            {pendingFriends.map(f => (
              <div key={f.profile.id} className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2">
                {f.profile.avatar ? (
                  <img src={getAvatarUrl(f.profile.avatar)} alt="" className="h-7 w-7 rounded-full border border-white/10 object-cover flex-shrink-0" />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-[10px] text-white/20 flex-shrink-0">?</span>
                )}
                <span className="flex-1 text-[12px] font-bold text-white/70 truncate">{f.profile.display_name || f.profile.username}</span>
                {f.direction === 'received' ? (
                  <button type="button" onClick={() => acceptRequest(f.profile.id)} className="game-btn game-btn-primary game-btn-sm">
                    <FontAwesomeIcon icon={faUserCheck} /> Accept
                  </button>
                ) : (
                  <span className="text-[9px] text-white/30 italic">Awaiting response...</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-4"><span className="pokeball-loader" /></div>
      ) : acceptedFriends.length > 0 ? (
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-white/30 mb-2">Accepted Friends</p>
          <div className="space-y-1 max-h-[200px] overflow-y-auto">
            {acceptedFriends.map(f => (
              <div key={f.profile.id} className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2">
                {f.profile.avatar ? (
                  <img src={getAvatarUrl(f.profile.avatar)} alt="" className="h-7 w-7 rounded-full border border-white/10 object-cover flex-shrink-0" />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-[10px] text-white/20 flex-shrink-0">?</span>
                )}
                <span className="flex-1 text-[12px] font-bold text-white/70 truncate">{f.profile.display_name || f.profile.username}</span>
                <FontAwesomeIcon icon={faUserCheck} className="text-green-400/60 text-[10px]" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-center text-[10px] text-white/30 py-4">Search for friends by username to get started!</p>
      )}
    </div>
  )
}
