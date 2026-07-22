import { useCallback, useEffect, useRef, useState } from 'react'
import { PixelIcon } from './PixelIcon'
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
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
      <h2 className="page-title" style={{ fontSize: '32px' }}>Weekly Wrap</h2>
      <p className="font-pixel text-[13px] text-muted uppercase tracking-wider mb-6">
        {formatDateShort(weekStats.range.start)} &mdash; {formatDateShort(weekStats.range.end)}
      </p>
      <div className="amount-display lg text-amber">
        P{weekStats.totalSpent.toFixed(2)}
      </div>
      <p className="font-pixel text-[14px] text-muted uppercase tracking-wider mt-2">
        Total Spent This Week
      </p>
      {profile?.username && (
        <p className="font-pixel text-[13px] text-muted mt-8">
          Hey {profile.display_name || profile.username}!
        </p>
      )}
      <button type="button" onClick={onNext} className="pixel-btn pixel-btn-accent mt-10">
        Let's go!
      </button>
    </div>
  )
}

function DayByDaySlide({ weekStats, onNext, onPrev }: SlideProps) {
  const sorted = [...weekStats.dayEntries].sort((a, b) => a.date.localeCompare(b.date))
  return (
    <div className="px-4 py-6">
      <div className="flex items-center gap-2 mb-4">
        <PixelIcon name="check" size={16} className="text-success" />
        <h2 className="font-pixel text-[16px] text-primary uppercase tracking-wider">Day by Day</h2>
      </div>
      <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
        {sorted.map(entry => {
          const spent = spentFromPurchases(entry.purchases)
          const diff = diffFromEntry(entry)
          return (
            <div key={entry.date} className="pixel-inner" style={{ padding: '12px' }}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-pixel text-[13px] text-muted uppercase tracking-wider">
                  {formatDateShort(entry.date)}
                </span>
                <span
                  className="font-pixel text-[12px] uppercase"
                  style={{ color: diff >= 0 ? 'var(--moss)' : 'var(--overspend)' }}
                >
                  {diff >= 0 ? 'ON TRACK' : 'OVER'}
                </span>
              </div>
              <div className="text-center mb-1">
                <span className="font-pixel text-[18px] text-primary">
                  P{spent.toFixed(2)}
                </span>
                <span className="font-pixel text-[12px] text-faint ml-2">
                  / P{entry.budget.toFixed(2)}
                </span>
              </div>
              {entry.purchases.length > 0 && (
                <div className="flex flex-wrap gap-1 justify-center">
                  {entry.purchases.map(p => (
                    <span
                      key={p.id}
                      className="font-pixel text-[11px] px-1.5 py-0.5"
                      style={{ border: '1px solid var(--pixel-border-light)' }}
                    >
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
        <button type="button" onClick={onPrev} className="pixel-btn pixel-btn-ghost pixel-btn-sm">
          <PixelIcon name="arrow-left" size={12} /> Back
        </button>
        <button type="button" onClick={onNext} className="pixel-btn pixel-btn-accent pixel-btn-sm">
          Next <PixelIcon name="arrow-right" size={12} />
        </button>
      </div>
    </div>
  )
}

function WeekResultSlide({ weekStats, onNext, onPrev }: SlideProps) {
  const isPositive = weekStats.netBalance >= 0
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
      <PixelIcon
        name={isPositive ? 'piggy' : 'warning'}
        size={40}
        className={isPositive ? 'text-success' : 'text-danger'}
      />
      <h2 className="font-pixel text-[14px] text-muted uppercase tracking-wider mb-2">
        Weekly Result
      </h2>
      <div
        className="amount-display lg"
        style={{ color: isPositive ? 'var(--moss-light)' : 'var(--overspend-light)' }}
      >
        {isPositive ? '+' : ''}P{weekStats.netBalance.toFixed(2)}
      </div>
      <p className="font-pixel text-[14px] text-muted uppercase tracking-wider mt-2">
        {isPositive ? 'Saved' : 'Overspent'}
      </p>
      <p className="font-pixel text-[12px] text-faint mt-1">
        Budget: P{weekStats.totalBudget.toFixed(2)} &middot; Spent: P{weekStats.totalSpent.toFixed(2)}
      </p>
      <div className="flex justify-between mt-4 w-full max-w-[200px]">
        <button type="button" onClick={onPrev} className="pixel-btn pixel-btn-ghost pixel-btn-sm">
          <PixelIcon name="arrow-left" size={12} /> Back
        </button>
        <button type="button" onClick={onNext} className="pixel-btn pixel-btn-accent pixel-btn-sm">
          Next <PixelIcon name="arrow-right" size={12} />
        </button>
      </div>
    </div>
  )
}

function FriendRankSlide({ friendRankings, userRank, onNext, onPrev }: SlideProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
      <PixelIcon name="medal" size={40} className="text-amber" />
      <h2 className="font-pixel text-[14px] text-muted uppercase tracking-wider mb-1">
        Your Rank This Week
      </h2>
      <p className="font-pixel text-[12px] text-faint mb-6">Lowest spender wins</p>
      <div className="amount-display lg text-amber">
        #{userRank}
      </div>
      {friendRankings.length > 0 && (
        <p className="font-pixel text-[14px] text-muted mt-2">
          out of {friendRankings.length} {friendRankings.length === 1 ? 'friend' : 'friends'}
        </p>
      )}
      <div className="flex justify-between mt-10 w-full max-w-[200px]">
        <button type="button" onClick={onPrev} className="pixel-btn pixel-btn-ghost pixel-btn-sm">
          <PixelIcon name="arrow-left" size={12} /> Back
        </button>
        <button type="button" onClick={onNext} className="pixel-btn pixel-btn-accent pixel-btn-sm">
          Next <PixelIcon name="arrow-right" size={12} />
        </button>
      </div>
    </div>
  )
}

function SuperlativeSlide({ superlative, onNext, onPrev }: SlideProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
      <PixelIcon name="fire" size={40} className="text-danger" />
      <h2 className="font-pixel text-[14px] text-muted uppercase tracking-wider mb-1">
        Week Highlight
      </h2>
      <p className="font-pixel text-[12px] text-faint mb-6">Your standout stat</p>
      <p className="font-pixel text-[18px] text-primary max-w-[280px] leading-relaxed">
        {superlative}
      </p>
      <div className="flex justify-between mt-10 w-full max-w-[200px]">
        <button type="button" onClick={onPrev} className="pixel-btn pixel-btn-ghost pixel-btn-sm">
          <PixelIcon name="arrow-left" size={12} /> Back
        </button>
        <button type="button" onClick={onNext} className="pixel-btn pixel-btn-accent pixel-btn-sm">
          Next <PixelIcon name="arrow-right" size={12} />
        </button>
      </div>
    </div>
  )
}

function FriendLeaderboardSlide({ friendRankings, onNext, onPrev }: SlideProps) {
  const topEntries = [...friendRankings].sort((a, b) => a.rank - b.rank)
  return (
    <div className="px-4 py-6">
      <div className="flex items-center gap-2 mb-4">
        <PixelIcon name="trophy" size={16} className="text-amber" />
        <h2 className="font-pixel text-[16px] text-primary uppercase tracking-wider">Leaderboard</h2>
      </div>
      <div className="max-h-[55vh] overflow-y-auto pr-1">
        {topEntries.map(entry => {
          const isMe = entry.rank === 0
          return (
            <div
              key={entry.userId}
              className={`ranking-row ${isMe ? 'highlight' : ''}`}
            >
              <span className={`rank-badge ${entry.rank === 1 ? 'gold' : entry.rank === 2 ? 'silver' : entry.rank === 3 ? 'bronze' : 'text-faint'}`}>
                {entry.rank === 1 ? <PixelIcon name="crown" size={12} /> : entry.rank}
              </span>
              {entry.avatar ? (
                <img
                  src={getAvatarUrl(entry.avatar)}
                  alt=""
                  className="h-6 w-6 object-cover flex-shrink-0"
                  style={{ border: '2px solid var(--pixel-border-light)', imageRendering: 'auto' }}
                />
              ) : (
                <span
                  className="flex h-6 w-6 items-center justify-center text-faint flex-shrink-0"
                  style={{ border: '2px solid var(--pixel-border-light)', background: 'rgba(0,0,0,0.1)' }}
                >
                  ?
                </span>
              )}
              <span className="flex-1 font-pixel text-[14px] text-primary truncate">
                {entry.displayName || entry.username}
                {isMe && <span className="font-pixel text-[11px] text-faint ml-1">(you)</span>}
              </span>
              <span className="font-pixel text-[15px] text-muted">
                P{entry.value.toFixed(2)}
              </span>
            </div>
          )
        })}
      </div>
      <div className="flex justify-between mt-4">
        <button type="button" onClick={onPrev} className="pixel-btn pixel-btn-ghost pixel-btn-sm">
          <PixelIcon name="arrow-left" size={12} /> Back
        </button>
        <button type="button" onClick={onNext} className="pixel-btn pixel-btn-accent pixel-btn-sm">
          Next <PixelIcon name="arrow-right" size={12} />
        </button>
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
    ctx.fillStyle = '#111D13'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#D4A843'
    ctx.font = 'bold 24px "Courier New", monospace'
    ctx.textAlign = 'center'
    ctx.fillText('WEEKLY WRAP', canvas.width / 2, 60)
    ctx.fillStyle = 'rgba(232, 220, 200, 0.5)'
    ctx.font = '11px "Courier New", monospace'
    ctx.fillText(`${formatDateShort(weekStats.range.start)} — ${formatDateShort(weekStats.range.end)}`, canvas.width / 2, 85)
    ctx.fillStyle = '#D4A843'
    ctx.font = 'bold 36px "Courier New", monospace'
    ctx.fillText(`P${weekStats.totalSpent.toFixed(2)}`, canvas.width / 2, 145)
    ctx.fillStyle = 'rgba(232, 220, 200, 0.4)'
    ctx.font = '10px "Courier New", monospace'
    ctx.fillText('TOTAL SPENT', canvas.width / 2, 162)
    const isPositive = weekStats.netBalance >= 0
    ctx.fillStyle = isPositive ? '#5B8C5A' : '#C45B4A'
    ctx.font = 'bold 22px "Courier New", monospace'
    ctx.fillText(`${isPositive ? '+' : ''}P${weekStats.netBalance.toFixed(2)}`, canvas.width / 2, 205)
    ctx.fillStyle = 'rgba(232, 220, 200, 0.4)'
    ctx.font = '9px "Courier New", monospace'
    ctx.fillText(isPositive ? 'NET SAVINGS' : 'NET DEBT', canvas.width / 2, 220)
    ctx.fillStyle = 'rgba(232, 220, 200, 0.2)'
    ctx.font = '8px "Courier New", monospace'
    ctx.fillText('Budget for Today', canvas.width / 2, canvas.height - 20)
  }, [weekStats])

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
      <PixelIcon name="star" size={32} className="text-amber" />
      <h2 className="font-pixel text-[14px] text-muted uppercase tracking-wider mb-2">Done!</h2>
      <p className="font-pixel text-[12px] text-faint mb-6">
        See you next week, {profile?.display_name || profile?.username || 'Friend'}!
      </p>
      <canvas
        ref={canvasRef}
        className="w-full max-w-[280px] h-auto"
        style={{ aspectRatio: '400/560', border: '3px solid var(--pixel-border)', imageRendering: 'pixelated' }}
      />
      <button type="button" onClick={handleDownload} className="pixel-btn pixel-btn-accent mt-4">
        <PixelIcon name="download" size={12} />
        {downloaded ? 'Downloaded!' : 'Download'}
      </button>
      <div className="flex justify-between mt-4 w-full max-w-[200px]">
        <button type="button" onClick={onPrev} className="pixel-btn pixel-btn-ghost pixel-btn-sm">
          <PixelIcon name="arrow-left" size={12} /> Back
        </button>
        <button type="button" onClick={onNext} className="pixel-btn pixel-btn-primary pixel-btn-sm">
          <PixelIcon name="check" size={12} /> Done
        </button>
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
        sup = `${streak} day${streak === 1 ? '' : 's'} under budget in a row!`
      } else if (netBal > 0) {
        sup = `You saved P${netBal.toFixed(2)} total!`
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
        <span className="font-pixel text-[16px] text-faint">Loading...</span>
      </div>
    )
  }

  if (!weekStats || !allStats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <p className="font-pixel text-[16px] text-muted">No data yet</p>
        <p className="font-pixel text-[12px] text-faint mt-1">Start tracking your expenses!</p>
        <button type="button" onClick={onClose} className="pixel-btn pixel-btn-ghost pixel-btn-sm mt-6">
          <PixelIcon name="arrow-left" size={12} /> Back
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
              className={`progress-dot ${i === slideIndex ? 'active' : ''}`}
            />
          ))}
        </div>
        <button type="button" onClick={onClose} className="nav-tab text-[13px]">
          <PixelIcon name="close" size={12} /> Close
        </button>
      </div>
      <SlideComponent {...slideProps} />
    </div>
  )
}
