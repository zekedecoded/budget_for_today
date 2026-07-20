import { Link, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRightFromBracket, faTicket, faUser } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../context/AuthContext'
import { getAvatarUrl } from '../lib/avatar'

export function Navbar() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <nav className="flex items-center justify-between border-b border-[var(--ink)]/10 bg-[var(--paper)]/80 px-4 py-3 backdrop-blur-sm">
      <Link
        to="/"
        className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--ink)] no-underline"
        style={{ fontFamily: 'var(--font-body)' }}
      >
        <FontAwesomeIcon icon={faTicket} className="text-[var(--gold)]" />
        Budget for Today
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link
              to="/profile"
              className="flex items-center gap-2 no-underline"
            >
              {profile?.avatar ? (
                <img
                  src={getAvatarUrl(profile.avatar)}
                  alt="Avatar"
                  className="h-7 w-7 rounded-full border-2 border-[var(--gold)] object-cover"
                />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--ink)]/10 text-xs text-[var(--ink)]/50">
                  <FontAwesomeIcon icon={faUser} />
                </span>
              )}
              <span
                className="text-xs font-semibold text-[var(--ink)]/70"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {profile?.display_name || profile?.username || user.email?.split('@')[0]}
              </span>
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[var(--ink)]/60 transition-colors hover:text-[var(--ink)]"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              <FontAwesomeIcon icon={faRightFromBracket} />
              Logout
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[var(--ink)]/60 transition-colors hover:text-[var(--ink)] no-underline"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="rounded-full border border-[var(--gold)] bg-[var(--gold)] px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white no-underline transition-opacity hover:opacity-90"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
