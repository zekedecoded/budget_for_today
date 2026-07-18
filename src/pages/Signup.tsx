import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserPlus, faTicket } from '@fortawesome/free-solid-svg-icons'
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
    if (!USERNAME_RE.test(name)) {
      setError(USERNAME_RULES)
      return
    }

    setLoading(true)

    const { error: authError } = await supabase.auth.signUp({
      email: usernameToEmail(name),
      password,
      options: { data: { username: name } },
    })

    if (authError) {
      setError(
        authError.message.toLowerCase().includes('already registered')
          ? 'That username is already taken.'
          : authError.message,
      )
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
          <FontAwesomeIcon
            icon={faTicket}
            className="mb-2 text-3xl text-[var(--gold)]"
          />
          <h1
            className="text-xl font-bold uppercase tracking-wider text-[var(--ink)]"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Create Account
          </h1>
          <p
            className="mt-1 text-xs text-[var(--ink)]/50"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Join and share your daily budget
          </p>
        </div>

        <form
          onSubmit={handleSignup}
          className="rounded-2xl border border-[var(--ink)]/10 bg-[var(--ticket)] p-6 shadow-sm"
        >
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label
              className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[var(--ink)]/60"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Username
            </label>
            <input
              type="text"
              required
              minLength={3}
              maxLength={20}
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. ezekiel"
              className="w-full rounded-lg border border-[var(--ink)]/20 bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none transition-colors placeholder:text-[var(--ink)]/30 focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)]"
              style={{ fontFamily: 'var(--font-body)' }}
            />
          </div>

          <div className="mb-6">
            <label
              className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[var(--ink)]/60"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[var(--ink)]/20 bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none transition-colors focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)]"
              style={{ fontFamily: 'var(--font-body)' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--gold)] px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            <FontAwesomeIcon icon={faUserPlus} />
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>

          <p
            className="mt-4 text-center text-xs text-[var(--ink)]/50"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-[var(--gold)] no-underline hover:underline"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
