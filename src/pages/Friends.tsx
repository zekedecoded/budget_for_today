import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrophy } from '@fortawesome/free-solid-svg-icons'
import { DailyLimitsBoard } from '../components/DailyLimitsBoard'
import { Rankings } from '../components/FriendRankings'

export function Friends() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="flex flex-col items-center mb-6">
        <FontAwesomeIcon icon={faTrophy} className="text-2xl text-[var(--pokemon-yellow)] mb-2" />
        <h1 className="daily-drop-title text-lg">Leaderboard</h1>
        <p className="daily-drop-subtitle">See how you rank against all trainers</p>
      </div>

      <div className="w-full max-w-lg mx-auto">
        <DailyLimitsBoard />
      </div>

      <div className="w-full max-w-lg mx-auto">
        <Rankings />
      </div>
    </div>
  )
}
