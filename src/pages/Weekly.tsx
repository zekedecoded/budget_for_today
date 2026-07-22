import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarWeek, faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { WeeklyReveal } from '../components/WeeklyReveal'
import { isTodayMonday } from '../lib/stats'

export function Weekly() {
  const navigate = useNavigate()

  if (!isTodayMonday()) {
    return (
      <div className="flex min-h-full items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <span className="pokeball pokeball-lg mx-auto mb-4 opacity-30" aria-hidden="true" />
          <FontAwesomeIcon icon={faCalendarWeek} className="text-3xl text-white/20 mb-4" />
          <h2 className="text-lg font-bold uppercase tracking-wider text-white/50" style={{ fontFamily: 'var(--font-display)' }}>
            Weekly Wrap
          </h2>
          <p className="text-sm text-white/40 mt-3">Come back on Monday to see your weekly wrap!</p>
          <p className="text-[10px] text-white/20 mt-1">Wrapped reveals every Monday for the previous week.</p>
          <button type="button" onClick={() => navigate('/')} className="game-btn game-btn-ghost game-btn-sm mt-6">
            <FontAwesomeIcon icon={faArrowLeft} /> Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <WeeklyReveal onClose={() => navigate('/')} />
    </div>
  )
}
