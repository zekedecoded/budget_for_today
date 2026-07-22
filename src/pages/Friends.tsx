import { PixelIcon } from '../components/PixelIcon'
import { DailyLimitsBoard } from '../components/DailyLimitsBoard'
import { Rankings } from '../components/FriendRankings'

export function Friends() {
  return (
    <div className="page-container pt-6">
      <div className="page-header">
        <PixelIcon name="trophy" size={20} className="text-amber mb-1" />
        <h1 className="page-title">Rankings</h1>
        <p className="page-subtitle">See where you stand on the board</p>
      </div>

      <div>
        <DailyLimitsBoard />
      </div>

      <div>
        <Rankings />
      </div>
    </div>
  )
}
