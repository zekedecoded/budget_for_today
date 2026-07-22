import { Link, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHouse, faReceipt, faTrophy, faCalendarWeek, faUser } from '@fortawesome/free-solid-svg-icons'
import { isTodayMonday } from '../lib/stats'
import { useAuth } from '../context/AuthContext'

const TABS: { path: string; label: string; icon: any; mondayOnly?: boolean }[] = [
  { path: '/', label: 'Home', icon: faHouse },
  { path: '/receipt', label: 'Receipt', icon: faReceipt },
  { path: '/friends', label: 'Rankings', icon: faTrophy },
  { path: '/weekly', label: 'Week', icon: faCalendarWeek, mondayOnly: true },
  { path: '/profile', label: 'Profile', icon: faUser },
]

export function BottomNav() {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) return null

  const visibleTabs = TABS.filter(t => !t.mondayOnly || isTodayMonday())

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-white/10 bg-[#0A1832]/95 backdrop-blur-md safe-area-bottom">
      <div className="flex items-stretch max-w-lg mx-auto">
        {visibleTabs.map(tab => {
          const isActive = tab.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(tab.path)
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 py-1.5 transition-colors ${
                isActive ? 'text-[var(--pokemon-yellow)]' : 'text-white/40 hover:text-white/60'
              }`}
            >
              <FontAwesomeIcon icon={tab.icon} className="text-lg" />
              <span className="text-[9px] font-bold uppercase tracking-wider leading-tight">{tab.label}</span>
              {isActive && <span className="h-0.5 w-4 rounded-full bg-[var(--pokemon-yellow)]" />}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
