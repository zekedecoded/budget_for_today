import { Link, useNavigate } from 'react-router-dom'
import { PixelIcon } from './PixelIcon'
import { useAuth } from '../context/AuthContext'

export function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <nav
      className="relative z-10 flex items-center justify-between px-4 py-2"
      style={{ background: 'var(--forest-deep)', borderBottom: '3px solid var(--pixel-border)' }}
    >
      <Link to="/" className="flex items-center gap-2 no-underline">
        <PixelIcon name="coin" size={20} className="text-amber" />
        <span className="font-pixel text-pixel-lg text-amber" style={{ textShadow: '1px 1px 0 var(--pixel-border)' }}>
          Budget for Today
        </span>
      </Link>
      <div className="flex items-center gap-1">
        {user ? (
          <button type="button" onClick={handleSignOut} className="nav-tab">
            <PixelIcon name="logout" size={14} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="pixel-btn pixel-btn-ghost pixel-btn-sm no-underline">
              <PixelIcon name="login" size={12} /> Login
            </Link>
            <Link to="/signup" className="pixel-btn pixel-btn-primary pixel-btn-sm no-underline">
              <PixelIcon name="user-plus" size={12} /> Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
