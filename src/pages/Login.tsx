import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PixelIcon } from '../components/PixelIcon'
import { supabase } from '../lib/supabase'
import { loginIdentifierToEmail } from '../lib/usernameAuth'

export function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: authError } = await supabase.auth.signInWithPassword({ email: loginIdentifierToEmail(username), password })
    setLoading(false)
    if (authError) {
      setError(authError.message.toLowerCase().includes('invalid login credentials') ? 'Wrong username or password.' : authError.message)
      return
    }
    navigate('/')
  }

  return (
    <div className="page-container pt-16">
      <div className="w-full max-w-sm mx-auto">
        <div className="mb-8 text-center">
          <h1 className="page-title text-center">Budget for Today</h1>
          <p className="font-pixel text-[14px] text-muted mt-2">
            Login to continue the challenge
          </p>
        </div>

        <div className="auth-card">
          {error && (
            <div
              className="mb-4 px-3 py-2 font-pixel text-[13px]"
              style={{ color: 'var(--overspend-light)', background: 'rgba(196,91,74,0.1)', border: '2px solid var(--overspend-dim)' }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="pixel-label">Username</label>
              <input type="text" required autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} className="pixel-input" />
            </div>

            <div className="mb-6">
              <label className="pixel-label">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="pixel-input" />
            </div>

            <button type="submit" disabled={loading} className="pixel-btn pixel-btn-primary w-full mb-4">
              <PixelIcon name="login" size={14} />
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-center font-pixel text-[14px] text-muted">
            Don't have an account?{' '}
            <Link to="/signup" className="font-bold no-underline" style={{ color: 'var(--amber)' }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
