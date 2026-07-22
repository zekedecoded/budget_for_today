import { Link, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../context/AuthContext'

export function Navbar() {
  const { user, signOut } = useAuth()
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
          <button type="button" onClick={handleSignOut} className="nav-icon-btn">
            <FontAwesomeIcon icon={faRightFromBracket} />
            <span className="hidden sm:inline">Logout</span>
          </button>
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
