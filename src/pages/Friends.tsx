import { Rankings } from '../components/FriendRankings'

export function Friends() {
  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="flex flex-col items-center mb-6">
        <span className="pokeball pokeball-lg mb-3 pokeball-pulse" aria-hidden="true" />
        <h1 className="daily-drop-title text-lg">Leaderboard</h1>
        <p className="daily-drop-subtitle">See how you rank against all trainers</p>
      </div>
      <Rankings />
    </div>
  )
}
