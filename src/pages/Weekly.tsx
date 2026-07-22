import { useNavigate } from 'react-router-dom'
import { PixelIcon } from '../components/PixelIcon'
import { WeeklyReveal } from '../components/WeeklyReveal'
import { isTodayMonday } from '../lib/stats'

export function Weekly() {
  const navigate = useNavigate()

  if (!isTodayMonday()) {
    return (
      <div className="page-container pt-12">
        <div className="text-center max-w-sm mx-auto">
          <PixelIcon name="calendar" size={40} className="text-faint mb-4" />
          <h2 className="page-title text-center">Weekly Wrap</h2>
          <p className="font-pixel text-[16px] text-muted mt-3">
            Come back on Monday to see your weekly wrap!
          </p>
          <p className="font-pixel text-[12px] text-faint mt-1">
            The previous week's summary appears every Monday.
          </p>
          <button type="button" onClick={() => navigate('/')} className="pixel-btn pixel-btn-ghost pixel-btn-sm mt-6">
            <PixelIcon name="arrow-left" size={12} /> Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container pt-6">
      <WeeklyReveal onClose={() => navigate('/')} />
    </div>
  )
}
