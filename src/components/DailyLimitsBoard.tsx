import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
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
    const { data } = await supabase
      .from('daily_limits')
      .select('*, profiles(username, display_name)')
      .eq('date', todayKey())
      .order('created_at', { ascending: false })
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

    return () => { supabase.removeChannel(channel) }
  }, [])

  const displayName = (l: DailyLimit) =>
    l.profiles?.display_name || l.profiles?.username || 'Anonymous'

  return (
    <div className="rounded-2xl border border-[var(--ink)]/10 bg-[var(--ticket)] p-5 shadow-sm">
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
          No budgets set today yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {limits.map((l) => (
            <li
              key={l.id}
              className="flex items-center justify-between rounded-lg border border-[var(--ink)]/5 bg-[var(--paper)] px-3 py-2"
            >
              <div>
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
