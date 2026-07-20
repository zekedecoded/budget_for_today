import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faFloppyDisk, faPenToSquare } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../context/AuthContext'
import { AVATAR_COUNT, getAvatarUrl } from '../lib/avatar'

export function Profile() {
  const { user, profile, updateProfile } = useAuth()
  const navigate = useNavigate()
  const [selected, setSelected] = useState(0)
  const [displayName, setDisplayName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (profile?.avatar) setSelected(profile.avatar)
  }, [profile?.avatar])

  useEffect(() => {
    setDisplayName(profile?.display_name ?? '')
  }, [profile?.display_name])

  if (!user) {
    navigate('/login')
    return null
  }

  const avatarDirty = selected !== (profile?.avatar ?? 0)
  const nameDirty = displayName !== (profile?.display_name ?? '')
  const dirty = avatarDirty || nameDirty

  const handleSave = async () => {
    setSaving(true)
    const updates: Record<string, unknown> = {}
    if (avatarDirty) updates.avatar = selected
    if (nameDirty) updates.display_name = displayName || null
    await updateProfile(updates)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <FontAwesomeIcon
            icon={faPenToSquare}
            className="mb-2 text-3xl text-[var(--gold)]"
          />
          <h1
            className="text-xl font-bold uppercase tracking-wider text-[var(--ink)]"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Edit Profile
          </h1>
          <p
            className="mt-1 text-xs text-[var(--ink)]/50"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Update your display name and avatar
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--gold)]/20 bg-white/60 p-6 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.2)] backdrop-blur-xl">
          <div className="mb-6 flex justify-center">
            <div className="flex items-center gap-4">
              <img
                src={getAvatarUrl(selected || 1)}
                alt="Selected avatar"
                className="h-20 w-20 rounded-full border-4 border-[var(--gold)] object-cover shadow-md"
              />
              <div>
                <p
                  className="text-sm font-bold text-[var(--ink)]"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {displayName || profile?.username || 'User'}
                </p>
                <p
                  className="text-[11px] text-[var(--ink)]/50"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  Avatar #{selected || 1}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label
              className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[var(--ink)]/60"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={profile?.username || 'Your display name'}
              maxLength={30}
              className="w-full rounded-lg border border-[var(--ink)]/20 bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none transition-colors focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)]"
              style={{ fontFamily: 'var(--font-body)' }}
            />
            <p
              className="mt-1 text-[10px] text-[var(--ink)]/40"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Shown on the leaderboard. Leave blank to use your username.
            </p>
          </div>

          <div className="mb-1">
            <p
              className="mb-3 text-[11px] font-bold uppercase tracking-wide text-[var(--ink)]/60"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Avatar
            </p>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: AVATAR_COUNT }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setSelected(num)}
                className={`relative flex items-center justify-center rounded-xl border-2 p-1 transition-all ${
                  selected === num
                    ? 'border-[var(--gold)] shadow-md'
                    : 'border-transparent hover:border-[var(--ink)]/20'
                }`}
              >
                <img
                  src={getAvatarUrl(num)}
                  alt={`Avatar ${num}`}
                  className="h-12 w-12 rounded-lg object-cover"
                />
                {selected === num && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--gold)] text-[10px] text-white shadow">
                    <FontAwesomeIcon icon={faCheck} />
                  </span>
                )}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !dirty}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--gold)] px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            <FontAwesomeIcon icon={saved ? faCheck : faFloppyDisk} />
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
