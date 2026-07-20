import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRightToBracket } from '@fortawesome/free-solid-svg-icons'
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
    <div className="flex min-h-full items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="pokeball pokeball-lg mx-auto mb-3 pokeball-pulse" aria-hidden="true" />
          <h1 className="text-2xl font-bold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-display)' }}>
            Welcome Back, Trainer!
          </h1>
          <p className="mt-2 text-xs text-white/40">
            Login to claim your daily drop
          </p>
        </div>

        <div className="auth-card">
          {error && (
            <div className="mb-4 rounded-lg bg-red-900/30 border border-red-500/30 px-3 py-2 text-xs font-semibold text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="game-label">Username</label>
              <input type="text" required autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} className="game-input" />
            </div>

            <div className="mb-6">
              <label className="game-label">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="game-input" />
            </div>

            <button type="submit" disabled={loading} className="game-btn game-btn-primary w-full mb-4">
              <FontAwesomeIcon icon={faRightToBracket} />
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-xs text-white/40">
            No account yet?{' '}
            <Link to="/signup" className="font-bold text-[var(--pokemon-yellow)] no-underline hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}