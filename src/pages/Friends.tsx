import { FriendSearch } from '../components/FriendSearch'
import { FriendRankings } from '../components/FriendRankings'

export function Friends() {
  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="flex flex-col items-center mb-6">
        <span className="pokeball pokeball-lg mb-3 pokeball-pulse" aria-hidden="true" />
        <h1 className="daily-drop-title text-lg">Friends & Ranks</h1>
        <p className="daily-drop-subtitle">Add friends and compare your spending</p>
      </div>
      <FriendSearch />
      <FriendRankings />
    </div>
  )
}
