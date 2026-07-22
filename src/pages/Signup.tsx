import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PixelIcon } from '../components/PixelIcon'
import { supabase } from '../lib/supabase'
import { USERNAME_RE, USERNAME_RULES, usernameToEmail } from '../lib/usernameAuth'

export function Signup() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    const name = username.trim()
    if (name.includes('@')) {
      const suggestion = name.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20)
      if (USERNAME_RE.test(suggestion)) {
        setUsername(suggestion)
        setError('No email needed! Just use a username. Try "' + suggestion + '"? Hit Sign Up again.')
      } else {
        setError('No email needed! ' + USERNAME_RULES)
      }
      return
    }
    if (!USERNAME_RE.test(name)) { setError(USERNAME_RULES); return }
    setLoading(true)
    const { error: authError } = await supabase.auth.signUp({ email: usernameToEmail(name), password, options: { data: { username: name } } })
    if (authError) {
      setError(authError.message.toLowerCase().includes('already registered') ? 'That username is already taken.' : authError.message)
      setLoading(false)
      return
    }
    setLoading(false)
    navigate('/')
  }

  return (
    <div className="page-container pt-16">
      <div className="w-full max-w-sm mx-auto">
        <div className="mb-8 text-center">
          <h1 className="page-title text-center">Budget for Today</h1>
          <p className="font-pixel text-[14px] text-muted mt-2">
            Create an account to join the challenge
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

          <form onSubmit={handleSignup}>
            <div className="mb-4">
              <label className="pixel-label">Username</label>
              <input type="text" required minLength={3} autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. ezekiel" className="pixel-input" />
              <p className="mt-1 font-pixel text-[12px] text-faint">3-20 characters, letters, numbers, or underscores only.</p>
            </div>

            <div className="mb-6">
              <label className="pixel-label">Password</label>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="pixel-input" />
            </div>

            <button type="submit" disabled={loading} className="pixel-btn pixel-btn-accent w-full mb-4">
              <PixelIcon name="user-plus" size={14} />
              {loading ? 'Creating...' : 'Sign Up'}
            </button>
          </form>

          <p className="text-center font-pixel text-[14px] text-muted">
              Already have an account?{' '}
            <Link to="/login" className="font-bold no-underline" style={{ color: 'var(--amber)' }}>
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
