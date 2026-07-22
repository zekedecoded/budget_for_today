import { useEffect, useState } from 'react'
import { PixelIcon } from './PixelIcon'
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
    <div className="pixel-panel mt-4">
      <div className="flex items-center gap-2 mb-4">
        <PixelIcon name="trophy" size={16} className="text-amber" />
        <h2 className="font-pixel text-[16px] text-primary uppercase tracking-wider">
          Today's Board
        </h2>
        <span className="ml-auto font-pixel text-[12px] text-faint">{limits.length}</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <span className="font-pixel text-[16px] text-faint">Loading...</span>
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-8">
          <p className="font-pixel text-[14px] text-muted">No one has opened their budget yet.</p>
          <p className="font-pixel text-[12px] text-faint mt-1">You go first!</p>
        </div>
      ) : (
        <div>
          {sorted.map((l, i) => {
            const rank = i + 1
            const isTop3 = rank <= 3
            return (
              <div
                key={l.id}
                className={`ranking-row ${isTop3 ? 'top' + rank : ''}`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {isTop3 ? (
                    <span className={`rank-badge ${rank === 1 ? 'gold' : rank === 2 ? 'silver' : 'bronze'}`}>
                      {rank === 1 ? <PixelIcon name="crown" size={14} /> : rank}
                    </span>
                  ) : (
                    <span className="rank-badge text-faint">{rank}</span>
                  )}
                  {l.profiles?.avatar ? (
                    <img
                      src={getAvatarUrl(l.profiles.avatar)}
                      alt=""
                      className="h-6 w-6 object-cover flex-shrink-0"
                      style={{ border: '2px solid var(--pixel-border-light)', imageRendering: 'auto' }}
                    />
                  ) : (
                    <span
                      className="flex h-6 w-6 items-center justify-center text-faint flex-shrink-0"
                      style={{ border: '2px solid var(--pixel-border-light)', background: 'rgba(0,0,0,0.1)' }}
                    >
                      <PixelIcon name="user" size={10} />
                    </span>
                  )}
                  <span className="font-pixel text-[14px] text-primary truncate">{displayName(l)}</span>
                </div>
                <span className="font-pixel text-[16px] text-muted flex-shrink-0 ml-2">
                  P{l.amount}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
