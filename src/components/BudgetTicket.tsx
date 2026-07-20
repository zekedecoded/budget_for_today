import { useCallback, useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar, faBolt, faFire, faGem, faArrowRotateRight } from '@fortawesome/free-solid-svg-icons'
import { ScratchPanel } from './ScratchPanel'
import { ConfettiBurst } from './ConfettiBurst'
import { BarcodeStripe } from './BarcodeStripe'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { getAvatarUrl } from '../lib/avatar'

function formatTicketDate(d: Date): string {
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  return days[d.getDay()] + ' \u00B7 ' + months[d.getMonth()] + ' ' + String(d.getDate()).padStart(2, '0') + ' ' + d.getFullYear()
}

function shortDate(d: Date): string {
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  return months[d.getMonth()] + ' ' + String(d.getDate()).padStart(2, '0')
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

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function getRarity(amount: number): { label: string; icon: any; tier: string } {
  if (amount <= 70) return { label: 'STANDARD', icon: faStar, tier: 'standard' }
  if (amount <= 110) return { label: 'GREAT', icon: faBolt, tier: 'great' }
  if (amount <= 140) return { label: 'ULTRA', icon: faFire, tier: 'ultra' }
  return { label: 'LEGENDARY', icon: faGem, tier: 'legendary' }
}

const REVEAL_DURATION_MS = 600

export function BudgetTicket() {
  const { user, profile } = useAuth()
  const [now] = useState(() => new Date())
  const [savedAmount, setSavedAmount] = useState<number | null>(null)
  const [phase, setPhase] = useState<'idle' | 'scratching' | 'done'>('idle')
  const timer = useRef<number | null>(null)
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

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current) }, [])

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
    if (prefersReducedMotion()) { setPhase('done'); return }
    setPhase('scratching')
    timer.current = window.setTimeout(() => setPhase('done'), REVEAL_DURATION_MS)
  }, [phase, postLimit])

  const scratchAgain = useCallback(() => { setPhase('idle') }, [])

  return (
    <section className="relative" aria-label="Today's budget challenge ticket">
      <div className={'game-card holo-surface ' + (phase === 'done' ? 'rarity-' + rarity.tier : '')}>
        {phase === 'scratching' && <div className="charge-glow" />}
        {phase === 'scratching' && <div className="reveal-flash" />}

        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="pokeball pokeball-sm" aria-hidden="true" />
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
            DAILY DROP #{ticketNumber.split('-')[1]}
          </span>
        </div>

        <div className="ticket-perf mb-3" />

        <p className="text-center text-[9px] font-bold uppercase tracking-[0.16em] text-white/40 mb-3">
          {formatTicketDate(now)}
        </p>

        <div className="relative">
          <ScratchPanel amount={amount} phase={phase} onScratch={scratch}>
            <div className={'revealed-card ' + (rarity.tier === 'legendary' ? 'legendary' : '')}>
              <div className={'rarity-badge ' + rarity.tier}>
                <FontAwesomeIcon icon={rarity.icon} className="mr-1" />
                {rarity.label}
              </div>

              <div className="mt-3 revealed-amount">
                <span className="amount-currency">{'\u20B1'}</span>
                <span className="amount-value">{amount}</span>
              </div>

              <p className="amount-label">Today&apos;s Budget</p>
              <p className="amount-date">{shortDate(now)}</p>

              {user && profile?.avatar && (
                <div className="trainer-mini">
                  <img src={getAvatarUrl(profile.avatar)} alt="" className="trainer-mini-avatar" />
                  <span>{profile?.display_name || profile?.username || 'Trainer'}</span>
                </div>
              )}

              {rarity.tier === 'legendary' && (
                <div className="mt-3 flex justify-center gap-1">
                  <span className="text-[var(--pokemon-gold)] text-xs">{'\u2605'}</span>
                  <span className="text-[8px] font-bold uppercase tracking-wider text-[var(--pokemon-gold)]/60">LEGENDARY DROP</span>
                  <span className="text-[var(--pokemon-gold)] text-xs">{'\u2605'}</span>
                </div>
              )}

              {rarity.tier === 'ultra' && (
                <p className="mt-2 text-[8px] font-bold uppercase tracking-wider text-[var(--pokemon-yellow)]/40">
                  Ultra Rare
                </p>
              )}
            </div>
          </ScratchPanel>

          {phase === 'idle' && (
            <p className="text-center text-[9px] uppercase tracking-[0.2em] text-white/30 mt-2">
              Tap to reveal your daily drop
            </p>
          )}
          {phase === 'scratching' && (
            <p className="text-center text-[9px] uppercase tracking-[0.2em] text-[var(--pokemon-yellow)]/60 mt-2 animate-pulse">
              Revealing...
            </p>
          )}
        </div>

        {phase === 'done' && (
          <div className="mt-3 flex justify-center">
            <button type="button" onClick={scratchAgain} className="game-btn game-btn-ghost game-btn-sm">
              <FontAwesomeIcon icon={faArrowRotateRight} />
              Scratch again
            </button>
          </div>
        )}

        <div className="ticket-perf my-3" />

        <div className="mt-2">
          <BarcodeStripe seed={dateKey(now)} />
        </div>

        <p className="text-center text-[8px] font-bold uppercase tracking-[0.12em] text-white/20 mt-2">
          {'\u20B1'}50-{'\u20B1'}150 Daily Challenge
        </p>

        {phase === 'done' && <ConfettiBurst />}
      </div>

      <audio ref={audioRef} src="/sounds/reveal.mp3" preload="none" />
    </section>
  )
}