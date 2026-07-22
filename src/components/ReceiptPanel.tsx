import { useCallback, useEffect, useRef, useState } from 'react'
import { PixelIcon } from './PixelIcon'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { todayKey, spentFromPurchases } from '../lib/stats'
import type { Purchase, DailyLimit } from '../types'

let purchaseCounter = 0
function genPurchaseId(): string {
  purchaseCounter++
  return `p_${Date.now()}_${purchaseCounter}`
}

export function ReceiptPanel() {
  const { user } = useAuth()
  const [entry, setEntry] = useState<DailyLimit | null>(null)
  const [loading, setLoading] = useState(true)
  const [itemName, setItemName] = useState('')
  const [itemAmount, setItemAmount] = useState('')
  const [saving, setSaving] = useState(false)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const amountInputRef = useRef<HTMLInputElement>(null)
  const listEndRef = useRef<HTMLDivElement>(null)
  const purchasesRef = useRef<Purchase[]>([])

  const fetchToday = useCallback(async () => {
    if (!user) { setEntry(null); setLoading(false); return }
    setLoading(true)
    const { data } = await supabase
      .from('daily_limits')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', todayKey())
      .maybeSingle()
    if (data) setEntry(data)
    else setEntry(null)
    setLoading(false)
  }, [user])

  useEffect(() => { fetchToday() }, [fetchToday])

  useEffect(() => {
    if (!user) return
    const channel = supabase
      .channel('receipt_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_limits',
          filter: `user_id=eq.${user.id}`,
        },
        () => { fetchToday() },
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user, fetchToday])

  const purchases: Purchase[] = Array.isArray(entry?.purchases) ? entry.purchases : []
  purchasesRef.current = purchases
  const spent = spentFromPurchases(purchases)
  const budget = entry?.amount ?? 0
  const diff = budget - spent

  const updatePurchases = useCallback(async (newPurchases: Purchase[]) => {
    if (!user || !entry) return
    setSaving(true)
    await supabase
      .from('daily_limits')
      .update({ purchases: newPurchases })
      .eq('id', entry.id)
    setEntry(prev => prev ? { ...prev, purchases: newPurchases } : prev)
    setSaving(false)
  }, [user, entry])

  const handleAdd = useCallback(() => {
    const name = nameInputRef.current?.value.trim() ?? ''
    const amount = parseFloat(amountInputRef.current?.value ?? '')
    if (!name || isNaN(amount) || amount <= 0) return
    const newPurchase: Purchase = { id: genPurchaseId(), name, amount }
    const newPurchases = [...purchasesRef.current, newPurchase]
    updatePurchases(newPurchases)
    setItemName('')
    setItemAmount('')
    nameInputRef.current?.focus()
    setTimeout(() => listEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }, [updatePurchases])

  const handleRemove = useCallback((id: string) => {
    const newPurchases = purchasesRef.current.filter(p => p.id !== id)
    updatePurchases(newPurchases)
  }, [updatePurchases])

  if (!user) return null

  return (
    <div className="pixel-panel mt-4">
      <div className="flex items-center gap-2 mb-4">
        <PixelIcon name="receipt" size={16} className="text-amber" />
        <h2 className="font-pixel text-[16px] text-primary uppercase tracking-wider">
          Expense List
        </h2>
        <span className="ml-auto font-pixel text-[12px] text-faint">{todayKey()}</span>
        {saving && <span className="font-pixel text-[12px] text-faint">...</span>}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <span className="font-pixel text-[16px] text-faint">Loading...</span>
        </div>
      ) : !entry ? (
        <div className="text-center py-6">
          <p className="font-pixel text-[14px] text-muted">Open your daily budget first</p>
          <p className="font-pixel text-[12px] text-faint mt-1">Then you can log your expenses</p>
        </div>
      ) : (
        <>
          <div className="pixel-inner">
            <div className="text-center py-2" style={{ borderBottom: '2px dashed var(--pixel-border-light)' }}>
              <p className="font-pixel text-[12px] text-faint uppercase tracking-wider">
                EXPENSE LIST
              </p>
            </div>

            <div className="min-h-[60px]">
              {purchases.length === 0 ? (
                <p className="font-pixel text-[13px] text-faint text-center py-4">No items yet</p>
              ) : (
                purchases.map((p, idx) => (
                  <div
                    key={p.id}
                    className="entry-row animate-slide-in"
                    style={{ animationDelay: `${idx * 0.04}s` }}
                  >
                    <span className="flex-1 font-body text-[12px] text-primary truncate">{p.name}</span>
                    <span className="font-pixel text-[15px] text-primary">
                      P{p.amount.toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemove(p.id)}
                      className="text-faint hover:text-danger transition-colors opacity-0 hover:opacity-100"
                      aria-label="Remove item"
                    >
                      <PixelIcon name="trash" size={12} />
                    </button>
                  </div>
                ))
              )}
              <div ref={listEndRef} />
            </div>

            <div style={{ borderTop: '2px dashed var(--pixel-border-light)' }}>
              <div className="flex items-center justify-between px-3 py-1.5">
                <span className="font-pixel text-[13px] text-muted uppercase tracking-wider">Budget</span>
                <span className="font-pixel text-[16px] text-primary">P{budget.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-1.5">
                <span className="font-pixel text-[13px] text-muted uppercase tracking-wider">Spent</span>
                <span className="font-pixel text-[16px] text-primary">P{spent.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-1.5" style={{ borderTop: '2px solid var(--pixel-border-light)' }}>
                <span className="font-pixel text-[14px] text-primary uppercase tracking-wider">Remaining</span>
                <span
                  className="font-pixel text-[18px]"
                  style={{ color: diff >= 0 ? 'var(--moss-light)' : 'var(--overspend-light)' }}
                >
                  {diff >= 0 ? '' : '-'}P{Math.abs(diff).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <form
            className="mt-3 space-y-2"
            onSubmit={e => { e.preventDefault(); handleAdd() }}
          >
            <input
              ref={nameInputRef}
              type="text"
              value={itemName}
              onChange={e => setItemName(e.target.value)}
              placeholder="What did you buy?"
              maxLength={50}
              className="pixel-input text-[12px]"
            />
            <div className="flex gap-2">
              <input
                ref={amountInputRef}
                type="number"
                value={itemAmount}
                onChange={e => setItemAmount(e.target.value)}
                placeholder="How much?"
                min="0"
                step="0.01"
                className="pixel-input flex-1 text-[12px]"
              />
              <button
                type="submit"
                disabled={!itemName.trim() || !itemAmount || saving}
                className="pixel-btn pixel-btn-primary pixel-btn-sm flex-shrink-0"
              >
                <PixelIcon name="plus" size={12} />
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  )
}
