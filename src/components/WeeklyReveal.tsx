import { useCallback, useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowLeft, faArrowRight, faXmark, faCrown,
  faTrophy, faFire, faPiggyBank, faTriangleExclamation,
  faMedal, faDownload, faCheck, faStar,
} from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../context/AuthContext'
import { getAvatarUrl } from '../lib/avatar'
import {
  fetchDayEntries, fetchAllUserEntries, fetchAllProfiles, getPreviousWeekRange,
  computeWeekStats, computeAllStats, computeStreak, computeBiggestSplurge,
  computeWeeklyLeastSpentRankings, computeNetBalance,
  diffFromEntry, spentFromPurchases,
} from '../lib/stats'
import type { WeekStats, FriendRankEntry, Profile } from '../types'

interface SlideProps {
  weekStats: WeekStats
  allStats: ReturnType<typeof computeAllStats>
  friendRankings: FriendRankEntry[]
  userRank: number
  superlative: string
  profile: Profile | null
  onNext: () => void
  onPrev: () => void
  isFirst: boolean
  isLast: boolean
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function CoverSlide({ weekStats, profile, onNext }: SlideProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center animate-slide-up">
      <span className="pokeball pokeball-lg mb-6 pokeball-pulse" aria-hidden="true" />
      <h2 className="text-lg font-bold uppercase tracking-wider text-white/80 mb-2" style={{ fontFamily: 'var(--font-display)' }}>
        Weekly Wrap
      </h2>
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40 mb-6">
        {formatDateShort(weekStats.range.start)} — {formatDateShort(weekStats.range.end)}
      </p>
      <div className="text-5xl font-bold text-[var(--pokemon-yellow)]" style={{ fontFamily: 'var(--font-amount)' }}>
        P{weekStats.totalSpent.toFixed(2)}
      </div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-white/40 mt-2">Total Spent This Week</p>
      {profile?.username && (
        <p className="text-[10px] text-white/30 mt-8">Hey {profile.display_name || profile.username}!</p>
      )}
      <button type="button" onClick={onNext} className="game-btn game-btn-yellow mt-10 animate-pulse-glow">
        Let's Go!
      </button>
    </div>
  )
}

function DayByDaySlide({ weekStats, onNext, onPrev }: SlideProps) {
  const sorted = [...weekStats.dayEntries].sort((a, b) => a.date.localeCompare(b.date))
  return (
    <div className="px-4 py-6 animate-slide-up">
      <div className="flex items-center gap-2 mb-4">
        <FontAwesomeIcon icon={faCheck} className="text-green-400 text-sm" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-white/80">Day by Day</h2>
      </div>
      <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
        {sorted.map(entry => {
          const spent = spentFromPurchases(entry.purchases)
          const diff = diffFromEntry(entry)
          return (
            <div key={entry.date} className="receipt-paper rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">{formatDateShort(entry.date)}</span>
                <span className={`text-[10px] font-bold ${diff >= 0 ? 'text-green-400/70' : 'text-red-400/70'}`}>
                  {diff >= 0 ? 'UNDER' : 'OVER'}
                </span>
              </div>
              <div className="text-center mb-1">
                <span className="text-lg font-bold text-white/80" style={{ fontFamily: 'var(--font-amount)' }}>
                  P{spent.toFixed(2)}
                </span>
                <span className="text-[9px] text-white/30 ml-2">/ P{entry.budget.toFixed(2)}</span>
              </div>
              {entry.purchases.length > 0 && (
                <div className="flex flex-wrap gap-1 justify-center">
                  {entry.purchases.map(p => (
                    <span key={p.id} className="text-[8px] px-1.5 py-0.5 rounded bg-white/[0.05] text-white/40">
                      {p.name} P{p.amount.toFixed(2)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="flex justify-between mt-4">
        <button type="button" onClick={onPrev} className="game-btn game-btn-ghost game-btn-sm"><FontAwesomeIcon icon={faArrowLeft} /> Back</button>
        <button type="button" onClick={onNext} className="game-btn game-btn-yellow game-btn-sm">Next <FontAwesomeIcon icon={faArrowRight} /></button>
      </div>
    </div>
  )
}

function WeekResultSlide({ weekStats, onNext, onPrev }: SlideProps) {
  const isPositive = weekStats.netBalance >= 0
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center animate-slide-up">
      <FontAwesomeIcon
        icon={isPositive ? faPiggyBank : faTriangleExclamation}
        className={`text-4xl mb-4 ${isPositive ? 'text-green-400' : 'text-red-400'}`}
      />
      <h2 className="text-sm font-bold uppercase tracking-wider text-white/60 mb-2">
        Week Result
      </h2>
      <div className={`text-5xl font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`} style={{ fontFamily: 'var(--font-amount)' }}>
        {isPositive ? '+' : ''}P{weekStats.netBalance.toFixed(2)}
      </div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-white/40 mt-2">
        {isPositive ? 'Net Savings' : 'Net Debt'}
      </p>
      <p className="text-[10px] text-white/30 mt-1">
        Budget: P{weekStats.totalBudget.toFixed(2)} · Spent: P{weekStats.totalSpent.toFixed(2)}
      </p>
      <div className="flex justify-between mt-4 w-full max-w-[200px]">
        <button type="button" onClick={onPrev} className="game-btn game-btn-ghost game-btn-sm"><FontAwesomeIcon icon={faArrowLeft} /> Back</button>
        <button type="button" onClick={onNext} className="game-btn game-btn-yellow game-btn-sm">Next <FontAwesomeIcon icon={faArrowRight} /></button>
      </div>
    </div>
  )
}

function FriendRankSlide({ friendRankings, userRank, onNext, onPrev }: SlideProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center animate-slide-up">
      <FontAwesomeIcon icon={faMedal} className="text-4xl text-[var(--pokemon-yellow)] mb-4" />
      <h2 className="text-sm font-bold uppercase tracking-wider text-white/60 mb-1">Your Weekly Rank</h2>
      <p className="text-[10px] text-white/30 mb-6">Least spent among friends</p>
      <div className="text-6xl font-bold text-[var(--pokemon-yellow)]" style={{ fontFamily: 'var(--font-amount)' }}>
        #{userRank}
      </div>
      {friendRankings.length > 0 && (
        <p className="text-[11px] text-white/40 mt-2">
          of {friendRankings.length} {friendRankings.length === 1 ? 'friend' : 'friends'}
        </p>
      )}
      <div className="flex justify-between mt-10 w-full max-w-[200px]">
        <button type="button" onClick={onPrev} className="game-btn game-btn-ghost game-btn-sm"><FontAwesomeIcon icon={faArrowLeft} /> Back</button>
        <button type="button" onClick={onNext} className="game-btn game-btn-yellow game-btn-sm">Next <FontAwesomeIcon icon={faArrowRight} /></button>
      </div>
    </div>
  )
}

function SuperlativeSlide({ superlative, onNext, onPrev }: SlideProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center animate-slide-up">
      <FontAwesomeIcon icon={faFire} className="text-4xl text-orange-400 mb-4" />
      <h2 className="text-sm font-bold uppercase tracking-wider text-white/60 mb-1">Week Superlative</h2>
      <p className="text-[10px] text-white/30 mb-6">Your standout stat</p>
      <p className="text-base font-bold text-white/80 max-w-[280px] leading-relaxed">{superlative}</p>
      <div className="flex justify-between mt-10 w-full max-w-[200px]">
        <button type="button" onClick={onPrev} className="game-btn game-btn-ghost game-btn-sm"><FontAwesomeIcon icon={faArrowLeft} /> Back</button>
        <button type="button" onClick={onNext} className="game-btn game-btn-yellow game-btn-sm">Next <FontAwesomeIcon icon={faArrowRight} /></button>
      </div>
    </div>
  )
}

function FriendLeaderboardSlide({ friendRankings, onNext, onPrev }: SlideProps) {
  const topEntries = [...friendRankings].sort((a, b) => a.rank - b.rank)
  return (
    <div className="px-4 py-6 animate-slide-up">
      <div className="flex items-center gap-2 mb-4">
        <FontAwesomeIcon icon={faTrophy} className="text-[var(--pokemon-yellow)] text-sm" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-white/80">Friend Leaderboard</h2>
      </div>
      <div className="space-y-1.5 max-h-[55vh] overflow-y-auto pr-1">
        {topEntries.map(entry => {
          const isMe = entry.rank === 0
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
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-[8px] text-white/20 flex-shrink-0">
                  ?
                </span>
              )}
              <span className="flex-1 text-[11px] font-bold text-white/70 truncate">
                {entry.displayName || entry.username}
                {isMe && <span className="text-[8px] text-[var(--pokemon-yellow)]/60 ml-1">(you)</span>}
              </span>
              <span className="text-[12px] font-bold text-white/80 font-mono tabular-nums">
                P{entry.value.toFixed(2)}
              </span>
            </div>
          )
        })}
      </div>
      <div className="flex justify-between mt-4">
        <button type="button" onClick={onPrev} className="game-btn game-btn-ghost game-btn-sm"><FontAwesomeIcon icon={faArrowLeft} /> Back</button>
        <button type="button" onClick={onNext} className="game-btn game-btn-yellow game-btn-sm">Next <FontAwesomeIcon icon={faArrowRight} /></button>
      </div>
    </div>
  )
}

function ClosingSlide({ weekStats, profile, onPrev, onNext }: SlideProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [downloaded, setDownloaded] = useState(false)

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `weekly-wrap-${weekStats.range.start}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    setDownloaded(true)
    setTimeout(() => setDownloaded(false), 2000)
  }, [weekStats])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = 400
    canvas.height = 560
    ctx.fillStyle = '#0A1832'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#FFDE00'
    ctx.font = 'bold 28px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('WEEKLY WRAP', canvas.width / 2, 60)
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.font = '12px monospace'
    ctx.fillText(`${formatDateShort(weekStats.range.start)} — ${formatDateShort(weekStats.range.end)}`, canvas.width / 2, 85)
    ctx.fillStyle = '#FFDE00'
    ctx.font = 'bold 40px monospace'
    ctx.fillText(`P${weekStats.totalSpent.toFixed(2)}`, canvas.width / 2, 145)
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.font = '10px monospace'
    ctx.fillText('TOTAL SPENT', canvas.width / 2, 162)
    const isPositive = weekStats.netBalance >= 0
    ctx.fillStyle = isPositive ? '#4ADE80' : '#F87171'
    ctx.font = 'bold 24px monospace'
    ctx.fillText(`${isPositive ? '+' : ''}P${weekStats.netBalance.toFixed(2)}`, canvas.width / 2, 205)
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.font = '9px monospace'
    ctx.fillText(isPositive ? 'NET SAVINGS' : 'NET DEBT', canvas.width / 2, 220)
    ctx.fillStyle = 'rgba(255,255,255,0.2)'
    ctx.font = '8px monospace'
    ctx.fillText('Budget for Today', canvas.width / 2, canvas.height - 20)
  }, [weekStats])

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center animate-slide-up">
      <FontAwesomeIcon icon={faStar} className="text-3xl text-[var(--pokemon-yellow)] mb-4" />
      <h2 className="text-sm font-bold uppercase tracking-wider text-white/70 mb-2">That's a Wrap!</h2>
      <p className="text-[10px] text-white/30 mb-6">See you next week, {profile?.display_name || profile?.username || 'Trainer'}!</p>
      <canvas ref={canvasRef} className="rounded-xl border border-white/10 w-full max-w-[300px] h-auto" style={{ aspectRatio: '400/560' }} />
      <button type="button" onClick={handleDownload} className="game-btn game-btn-yellow mt-4">
        <FontAwesomeIcon icon={faDownload} />
        {downloaded ? 'Downloaded!' : 'Download Card'}
      </button>
      <div className="flex justify-between mt-4 w-full max-w-[200px]">
        <button type="button" onClick={onPrev} className="game-btn game-btn-ghost game-btn-sm"><FontAwesomeIcon icon={faArrowLeft} /> Back</button>
        <button type="button" onClick={onNext} className="game-btn game-btn-primary game-btn-sm"><FontAwesomeIcon icon={faCheck} /> Done</button>
      </div>
    </div>
  )
}

const SLIDE_COMPONENTS = [
  CoverSlide,
  DayByDaySlide,
  WeekResultSlide,
  FriendRankSlide,
  SuperlativeSlide,
  FriendLeaderboardSlide,
  ClosingSlide,
]

interface WeeklyRevealProps {
  onClose: () => void
}

export function WeeklyReveal({ onClose }: WeeklyRevealProps) {
  const { user, profile } = useAuth()
  const [slideIndex, setSlideIndex] = useState(0)
  const [weekStats, setWeekStats] = useState<WeekStats | null>(null)
  const [allStats, setAllStats] = useState<ReturnType<typeof computeAllStats> | null>(null)
  const [friendRankings, setFriendRankings] = useState<FriendRankEntry[]>([])
  const [userRank, setUserRank] = useState(0)
  const [superlative, setSuperlative] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const range = getPreviousWeekRange()
    Promise.all([
      fetchDayEntries(user.id),
      fetchAllUserEntries(range.start, range.end),
      fetchAllProfiles(),
    ]).then(async ([entries, allEntriesMap, allProfilesMap]) => {
      const ws = computeWeekStats(entries, range)
      const as = computeAllStats(entries)
      setWeekStats(ws)
      setAllStats(as)

      const rankings = computeWeeklyLeastSpentRankings(allEntriesMap, allProfilesMap)
      setFriendRankings(rankings)
      const myRank = rankings.find(r => r.userId === user.id)
      setUserRank(myRank?.rank ?? 0)

      const splurge = computeBiggestSplurge(entries)
      const streak = computeStreak(entries)
      const netBal = computeNetBalance(entries)
      let sup = ''
      if (splurge && splurge.amount > 0) {
        sup = `Biggest splurge: P${splurge.amount.toFixed(2)} on ${formatDateShort(splurge.date)}`
      } else if (streak > 0) {
        sup = `${streak}-day streak of staying under budget!`
      } else if (netBal > 0) {
        sup = `Net saver with P${netBal.toFixed(2)} in savings!`
      } else {
        sup = 'Keep going, every day is a new challenge!'
      }
      setSuperlative(sup)

      setLoading(false)
    })
  }, [user, profile])

  const handleNext = useCallback(() => {
    if (slideIndex < SLIDE_COMPONENTS.length - 1) setSlideIndex(i => i + 1)
    else onClose()
  }, [slideIndex, onClose])

  const handlePrev = useCallback(() => {
    if (slideIndex > 0) setSlideIndex(i => i - 1)
  }, [slideIndex])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="pokeball-loader" />
      </div>
    )
  }

  if (!weekStats || !allStats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <span className="pokeball pokeball-lg mx-auto mb-4 opacity-30" />
        <p className="text-sm text-white/50">No data yet</p>
        <p className="text-[10px] text-white/30 mt-1">Start tracking your daily spending!</p>
        <button type="button" onClick={onClose} className="game-btn game-btn-ghost game-btn-sm mt-6">
          <FontAwesomeIcon icon={faArrowLeft} /> Back
        </button>
      </div>
    )
  }

  const SlideComponent = SLIDE_COMPONENTS[slideIndex]
  const slideProps: SlideProps = {
    weekStats,
    allStats,
    friendRankings,
    userRank,
    superlative,
    profile,
    onNext: handleNext,
    onPrev: handlePrev,
    isFirst: slideIndex === 0,
    isLast: slideIndex === SLIDE_COMPONENTS.length - 1,
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex gap-1">
          {SLIDE_COMPONENTS.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === slideIndex ? 'w-6 bg-[var(--pokemon-yellow)]' : 'w-1.5 bg-white/20'
              }`}
            />
          ))}
        </div>
        <button type="button" onClick={onClose} className="nav-icon-btn text-xs">
          <FontAwesomeIcon icon={faXmark} /> Close
        </button>
      </div>
      <SlideComponent {...slideProps} />
    </div>
  )
}


