import { Link, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRightFromBracket, faUser, faCalendarWeek, faTrophy } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../context/AuthContext'
import { getAvatarUrl } from '../lib/avatar'
import { isTodayMonday } from '../lib/stats'

export function Navbar() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <nav className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-[#0A1832]/80 backdrop-blur-sm relative z-10">
      <Link to="/" className="flex items-center gap-2 no-underline">
        <span className="pokeball pokeball-sm" aria-hidden="true" />
        <span className="text-xs font-bold uppercase tracking-wider text-white/90" style={{ fontFamily: 'var(--font-display)' }}>
          Budget for Today
        </span>
      </Link>

      <div className="flex items-center gap-1">
        {user ? (
          <>
            {isTodayMonday() && (
              <Link to="/weekly" className="nav-icon-btn" title="Weekly Wrap">
                <FontAwesomeIcon icon={faCalendarWeek} />
                <span className="hidden sm:inline text-[10px]">Week</span>
              </Link>
            )}
            <Link to="/friends" className="nav-icon-btn" title="Rankings">
              <FontAwesomeIcon icon={faTrophy} />
              <span className="hidden sm:inline text-[10px]">Rankings</span>
            </Link>
            <Link to="/profile" className="flex items-center gap-2 nav-icon-btn">
              {profile?.avatar ? (
                <img src={getAvatarUrl(profile.avatar)} alt="Avatar" className="h-6 w-6 rounded-full border border-white/20 object-cover" />
              ) : (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-[10px] text-white/40">
                  <FontAwesomeIcon icon={faUser} />
                </span>
              )}
              <span className="hidden sm:inline text-xs font-semibold text-white/70 max-w-[80px] truncate">
                {profile?.display_name || profile?.username || 'Trainer'}
              </span>
            </Link>
            <button type="button" onClick={handleSignOut} className="nav-icon-btn">
              <FontAwesomeIcon icon={faRightFromBracket} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </>
        ) : (
          <div className="flex items-center gap-1.5">
            <Link to="/login" className="game-btn game-btn-ghost game-btn-sm">
              Login
            </Link>
            <Link to="/signup" className="game-btn game-btn-yellow game-btn-sm">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}