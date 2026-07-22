import { Link, useLocation } from 'react-router-dom'
import { PixelIcon } from './PixelIcon'
import { isTodayMonday } from '../lib/stats'
import { useAuth } from '../context/AuthContext'

const TABS: { path: string; label: string; icon: 'home' | 'receipt' | 'trophy' | 'calendar' | 'user'; mondayOnly?: boolean }[] = [
  { path: '/', label: 'Home', icon: 'home' },
  { path: '/receipt', label: 'Expenses', icon: 'receipt' },
  { path: '/friends', label: 'Rankings', icon: 'trophy' },
  { path: '/weekly', label: 'Week', icon: 'calendar', mondayOnly: true },
  { path: '/profile', label: 'Profile', icon: 'user' },
]

export function BottomNav() {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return null

  const visibleTabs = TABS.filter(t => !t.mondayOnly || isTodayMonday())

  return (
    <nav className="bottom-nav safe-area-bottom">
      <div className="mx-auto flex max-w-lg items-stretch">
        {visibleTabs.map(tab => {
          const isActive = tab.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(tab.path)
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 min-w-0 no-underline transition-colors ${
                isActive ? 'text-amber' : 'text-muted'
              }`}
            >
              <PixelIcon name={tab.icon} size={18} />
              <span className="font-pixel text-[11px] uppercase tracking-wider leading-tight">
                {tab.label}
              </span>
              {isActive && (
                <span
                  className="h-[2px] w-6 mt-0.5"
                  style={{ background: 'var(--amber)' }}
                />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
