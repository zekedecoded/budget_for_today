import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserPlus } from '@fortawesome/free-solid-svg-icons'
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
        setError('No email needed � you sign up with just a username. How about "' + suggestion + '"? Press Sign Up again to use it.')
      } else {
        setError('No email needed � you sign up with just a username. ' + USERNAME_RULES)
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
    <div className="flex min-h-full items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="pokeball pokeball-lg mx-auto mb-3 pokeball-pulse" aria-hidden="true" />
          <h1 className="text-2xl font-bold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-display)' }}>
            Begin Your Adventure!
          </h1>
          <p className="mt-2 text-xs text-white/40">
            Create a trainer account to join the challenge
          </p>
        </div>

        <div className="auth-card">
          {error && (
            <div className="mb-4 rounded-lg bg-red-900/30 border border-red-500/30 px-3 py-2 text-xs font-semibold text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup}>
            <div className="mb-4">
              <label className="game-label">Username</label>
              <input type="text" required minLength={3} autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. ezekiel" className="game-input" />
              <p className="mt-1 text-[10px] text-white/30">No email needed � 3-20 letters, numbers, or underscores.</p>
            </div>

            <div className="mb-6">
              <label className="game-label">Password</label>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="game-input" />
            </div>

            <button type="submit" disabled={loading} className="game-btn game-btn-yellow w-full mb-4">
              <FontAwesomeIcon icon={faUserPlus} />
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p className="text-center text-xs text-white/40">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[var(--pokemon-yellow)] no-underline hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}