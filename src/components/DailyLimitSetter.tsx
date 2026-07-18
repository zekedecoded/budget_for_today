import { useState, useEffect, type FormEvent } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFloppyDisk } from '@fortawesome/free-solid-svg-icons'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { DailyLimit } from '../types'

function todayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function DailyLimitSetter({ onSaved }: { onSaved?: () => void }) {
  const { user } = useAuth()
  const [limit, setLimit] = useState<DailyLimit | null>(null)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase
      .from('daily_limits')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', todayKey())
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setLimit(data)
          setAmount(String(data.amount))
          setNote(data.note ?? '')
        }
      })
  }, [user])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user || !amount) return
    setSaving(true)

    const parsed = Number(amount)
    if (Number.isNaN(parsed) || parsed <= 0) {
      setSaving(false)
      return
    }

    const payload = {
      user_id: user.id,
      amount: parsed,
      date: todayKey(),
      note: note.trim() || null,
    }

    if (limit) {
      await supabase.from('daily_limits').update(payload).eq('id', limit.id)
    } else {
      await supabase.from('daily_limits').insert(payload)
    }

    setSaving(false)
    onSaved?.()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[var(--ink)]/10 bg-[var(--ticket)] p-5 shadow-sm"
    >
      <h2
        className="mb-3 text-sm font-bold uppercase tracking-wider text-[var(--ink)]"
        style={{ fontFamily: 'var(--font-body)' }}
      >
        {limit ? 'Update Your Limit' : 'Set Your Daily Limit'}
      </h2>

      <div className="mb-3">
        <label
          className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[var(--ink)]/60"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          Amount (₱)
        </label>
        <input
          type="number"
          min="1"
          step="1"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded-lg border border-[var(--ink)]/20 bg-white px-3 py-2 text-sm font-bold text-[var(--ink)] outline-none transition-colors focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)]"
          style={{ fontFamily: 'var(--font-body)' }}
        />
      </div>

      <div className="mb-4">
        <label
          className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[var(--ink)]/60"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          Note (optional)
        </label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Groceries, no eating out"
          className="w-full rounded-lg border border-[var(--ink)]/20 bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none transition-colors placeholder:text-[var(--ink)]/30 focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)]"
          style={{ fontFamily: 'var(--font-body)' }}
        />
      </div>

      <button
        type="submit"
        disabled={saving || !amount}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--gold)] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ fontFamily: 'var(--font-body)' }}
      >
        <FontAwesomeIcon icon={faFloppyDisk} />
        {saving ? 'Saving...' : limit ? 'Update Limit' : 'Save Limit'}
      </button>
    </form>
  )
}
