import { useCallback, useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTrashCan, faReceipt } from '@fortawesome/free-solid-svg-icons'
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
    <div className="game-card-solid mt-4">
      <div className="flex items-center gap-2 mb-4">
        <FontAwesomeIcon icon={faReceipt} className="text-[var(--pokemon-yellow)] text-sm" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-white/90" style={{ fontFamily: 'var(--font-body)' }}>
          Today's Receipt
        </h2>
        {saving && <span className="pokeball-loader ml-auto" style={{ width: 18, height: 18 }} />}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <span className="pokeball-loader" />
        </div>
      ) : !entry ? (
        <div className="text-center py-6">
          <span className="pokeball mx-auto mb-3 opacity-30" aria-hidden="true" />
          <p className="text-xs text-white/40">Scratch your daily drop first</p>
          <p className="text-[10px] text-white/20 mt-1">Then log your purchases here</p>
        </div>
      ) : (
        <>
          <div className="receipt-paper rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="text-center border-b border-dashed border-white/10 pb-2 mb-2">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
                DAILY SPENDING RECEIPT
              </p>
              <p className="text-[8px] text-white/20 mt-0.5">
                {todayKey()}
              </p>
            </div>

            <div className="space-y-1 min-h-[60px]">
              {purchases.length === 0 ? (
                <p className="text-[10px] text-white/20 text-center py-4 italic">No purchases logged yet</p>
              ) : (
                purchases.map(p => (
                  <div key={p.id} className="receipt-item flex items-center gap-2 py-1 px-1 rounded hover:bg-white/[0.03] group">
                    <span className="flex-1 text-[11px] font-medium text-white/70 truncate">{p.name}</span>
                    <span className="text-[11px] font-bold text-white/80 font-mono tabular-nums">P{p.amount.toFixed(2)}</span>
                    <button
                      type="button"
                      onClick={() => handleRemove(p.id)}
                      className="text-white/10 hover:text-red-400 transition-colors text-[10px] opacity-0 group-hover:opacity-100"
                      aria-label="Remove item"
                    >
                      <FontAwesomeIcon icon={faTrashCan} />
                    </button>
                  </div>
                ))
              )}
              <div ref={listEndRef} />
            </div>

            <div className="border-t border-dashed border-white/10 mt-2 pt-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">Budget</span>
                <span className="text-[12px] font-bold text-white/60 font-mono tabular-nums">P{budget.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">Spent</span>
                <span className="text-[12px] font-bold text-white/80 font-mono tabular-nums">P{spent.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between px-1 pt-1 border-t border-white/10 mt-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/60">Remaining</span>
                <span className={`text-[14px] font-bold font-mono tabular-nums ${diff >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {diff >= 0 ? '+' : ''}P{diff.toFixed(2)}
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
              placeholder="Item name"
              maxLength={50}
              className="game-input w-full text-[11px]"
            />
            <div className="flex gap-2">
              <input
                ref={amountInputRef}
                type="number"
                value={itemAmount}
                onChange={e => setItemAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="game-input flex-1 text-[11px] text-right"
              />
              <button
                type="submit"
                disabled={!itemName.trim() || !itemAmount || saving}
                className="game-btn game-btn-yellow game-btn-sm flex-shrink-0"
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  )
}
