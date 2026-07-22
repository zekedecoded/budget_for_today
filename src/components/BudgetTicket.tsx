import { useCallback, useEffect, useRef, useState } from 'react'
import { PixelIcon } from './PixelIcon'
import { PixelAvatar } from './PixelAvatar'
import { ScratchPanel } from './ScratchPanel'
import { ConfettiBurst } from './ConfettiBurst'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

function formatTicketDate(d: Date): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  return days[d.getDay()] + ', ' + months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear()
}

function shortDate(d: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return months[d.getMonth()] + ' ' + d.getDate()
}

function dateKey(d: Date): string {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

function dayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0)
  return Math.floor((d.getTime() - start.getTime()) / 86400000)
}

function budgetForSeed(seed: string): number {
  let hash = 2166136261
  for (let i = 0; i < seed.length; i++) { hash ^= seed.charCodeAt(i); hash = Math.imul(hash, 16777619) }
  return 50 + ((hash >>> 0) % 11) * 10
}

type RarityTier = 'standard' | 'great' | 'ultra' | 'legendary'

function getRarity(amount: number): { label: string; icon: 'star' | 'bolt' | 'fire' | 'gem'; tier: RarityTier } {
  if (amount <= 70) return { label: 'STANDARD', icon: 'star', tier: 'standard' }
  if (amount <= 110) return { label: 'GREAT', icon: 'bolt', tier: 'great' }
  if (amount <= 140) return { label: 'ULTRA', icon: 'fire', tier: 'ultra' }
  return { label: 'LEGENDARY', icon: 'gem', tier: 'legendary' }
}

export function BudgetTicket() {
  const { user, profile } = useAuth()
  const [now] = useState(() => new Date())
  const [savedAmount, setSavedAmount] = useState<number | null>(null)
  const [phase, setPhase] = useState<'idle' | 'scratching' | 'done'>('idle')
  const posting = useRef(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const assignedAmount = user ? budgetForSeed(user.id + ':' + dateKey(now)) : budgetForSeed(dateKey(now))
  const amount = savedAmount ?? assignedAmount
  const rarity = getRarity(amount)
  const ticketNumber = String(now.getFullYear()) + '-' + String(dayOfYear(now)).padStart(3, '0')

  useEffect(() => {
    if (!user) { setSavedAmount(null); return }
    supabase.from('daily_limits').select('amount').eq('user_id', user.id).eq('date', dateKey(now)).maybeSingle().then(({ data }) => {
      if (data) setSavedAmount(data.amount)
    })
  }, [user, now])

  const postLimit = useCallback(async () => {
    if (!user || savedAmount !== null || posting.current) return
    posting.current = true
    const { data } = await supabase.from('daily_limits').select('amount').eq('user_id', user.id).eq('date', dateKey(now)).maybeSingle()
    if (data) { setSavedAmount(data.amount) } else {
      const { error } = await supabase.from('daily_limits').insert({ user_id: user.id, amount: assignedAmount, date: dateKey(now) })
      if (error) { console.error('Failed to post daily limit:', error.message) } else { setSavedAmount(assignedAmount) }
    }
    posting.current = false
  }, [user, savedAmount, assignedAmount, now])

  const scratch = useCallback(() => {
    if (phase !== 'idle') return
    audioRef.current?.play().catch(() => {})
    postLimit()
    setPhase('done')
  }, [phase, postLimit])

  const scratchAgain = useCallback(() => { setPhase('idle') }, [])

  return (
    <section className="relative" aria-label="Today's budget challenge ticket">
      <div className="pixel-panel" style={{ paddingTop: '24px' }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <PixelIcon name="coin" size={14} className="text-amber" />
          <span className="font-pixel text-[13px] text-muted uppercase tracking-wider">
            Entry #{ticketNumber.split('-')[1]}
          </span>
        </div>
        <hr className="pixel-divider" />
        <p className="text-center font-pixel text-[13px] text-faint uppercase tracking-wider mb-4">
          {formatTicketDate(now)}
        </p>
        <div className="relative">
          <ScratchPanel amount={amount} phase={phase} onScratch={scratch}>
            <div className="text-center" style={{ padding: '12px 0' }}>
              <div className="mb-2 flex items-center justify-center gap-1.5">
                <PixelIcon name={rarity.icon} size={14} className="text-amber" />
                <span className="font-pixel text-[14px] text-amber uppercase tracking-wider">
                  {rarity.label}
                </span>
              </div>
              <div className="amount-display lg">
                <span className="amount-currency">P</span>
                <span>{amount}</span>
              </div>
              <p className="font-pixel text-[14px] text-muted uppercase tracking-wider mt-2">
                Today's Budget
              </p>
              <p className="font-pixel text-[12px] text-faint mt-1">
                {shortDate(now)}
              </p>
              {user && profile?.avatar && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 pixel-inner">
                  <PixelAvatar userId={user.id} size={20} />
                  <span className="font-pixel text-[13px] text-muted">
                    {profile?.display_name || profile?.username || 'You'}
                  </span>
                </div>
              )}
            </div>
          </ScratchPanel>
          {phase === 'idle' && (
            <p className="text-center font-pixel text-[12px] text-faint uppercase tracking-wider mt-2">
              Tap to reveal
            </p>
          )}
          {phase === 'scratching' && (
            <p className="text-center font-pixel text-[12px] text-amber uppercase tracking-wider mt-2">
              Revealing...
            </p>
          )}
        </div>
        {phase === 'done' && (
          <div className="mt-3 flex justify-center">
            <button type="button" onClick={scratchAgain} className="pixel-btn pixel-btn-ghost pixel-btn-sm">
              <PixelIcon name="redo" size={12} /> Try Again
            </button>
          </div>
        )}
        <hr className="pixel-divider" />
        <p className="text-center font-pixel text-[11px] text-faint uppercase tracking-wider mt-1">
          P50-P150 Daily Challenge
        </p>
        {phase === 'done' && <ConfettiBurst />}
      </div>
      <audio ref={audioRef} src="/sounds/reveal.mp3" preload="none" />
    </section>
  )
}
