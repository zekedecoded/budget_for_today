import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons'
import { supabase } from '../lib/supabase'
import { getAvatarUrl } from '../lib/avatar'
import type { DailyLimit } from '../types'

function todayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
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
    if (error) console.error('Failed to load today\'s budgets:', error.message)
    if (data) setLimits(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchLimits()

    const channel = supabase
      .channel('daily_limits_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'daily_limits', filter: `date=eq.${todayKey()}` },
        () => { fetchLimits() }
      )
      .subscribe()

    return () => { supabase?.removeChannel(channel) }
  }, [])

  const displayName = (l: DailyLimit) =>
    l.profiles?.display_name || l.profiles?.username || 'Anonymous'

  return (
    <div className="rounded-2xl border border-[var(--gold)]/20 bg-white/60 p-5 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.2)] backdrop-blur-xl">
      <h2
        className="mb-4 text-sm font-bold uppercase tracking-wider text-[var(--ink)]"
        style={{ fontFamily: 'var(--font-body)' }}
      >
        Today&apos;s Budgets
      </h2>

      {loading ? (
        <p
          className="text-xs text-[var(--ink)]/50"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          Loading...
        </p>
      ) : limits.length === 0 ? (
        <p
          className="text-xs text-[var(--ink)]/50"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          No tickets scratched yet today.
        </p>
      ) : (
        <ul className="space-y-2">
          {limits.map((l) => (
            <li
              key={l.id}
              className="flex items-center justify-between rounded-lg border border-[var(--ink)]/5 bg-[var(--paper)] px-3 py-2"
            >
              <div className="flex items-center gap-2.5">
                {l.profiles?.avatar ? (
                  <img
                    src={getAvatarUrl(l.profiles.avatar)}
                    alt=""
                    className="h-7 w-7 rounded-full border border-[var(--gold)]/40 object-cover"
                  />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--ink)]/5 text-[10px] text-[var(--ink)]/30">
                    <FontAwesomeIcon icon={faUser} />
                  </span>
                )}
                <span
                  className="text-sm font-bold text-[var(--ink)]"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {displayName(l)}
                </span>
                {l.note && (
                  <p
                    className="mt-0.5 text-[11px] text-[var(--ink)]/50"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {l.note}
                  </p>
                )}
              </div>
              <span
                className="text-lg font-bold text-[var(--gold)]"
                style={{ fontFamily: 'var(--font-amount)' }}
              >
                ₱{l.amount}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
