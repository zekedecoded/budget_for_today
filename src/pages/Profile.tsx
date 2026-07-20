import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faFloppyDisk } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../context/AuthContext'
import { AVATAR_COUNT, getAvatarUrl } from '../lib/avatar'

export function Profile() {
  const { user, profile, updateProfile } = useAuth()
  const navigate = useNavigate()
  const [selected, setSelected] = useState(0)
  const [displayName, setDisplayName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { if (profile?.avatar) setSelected(profile.avatar) }, [profile?.avatar])
  useEffect(() => { setDisplayName(profile?.display_name ?? '') }, [profile?.display_name])

  if (!user) { navigate('/login'); return null }

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
    <div className="flex min-h-full items-start justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="pokeball pokeball-lg mx-auto mb-3 pokeball-pulse" aria-hidden="true" />
          <h1 className="text-2xl font-bold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-display)' }}>
            Trainer Profile
          </h1>
          <p className="mt-2 text-xs text-white/40">
            Customize your trainer identity
          </p>
        </div>

        <div className="game-card-solid">
          <div className="mb-6 flex justify-center">
            <div className="flex items-center gap-4">
              <img src={getAvatarUrl(selected || 1)} alt="Selected avatar" className="h-20 w-20 rounded-full border-[3px] border-[var(--pokemon-yellow)] object-cover shadow-lg shadow-yellow-500/20" />
              <div>
                <p className="text-sm font-bold text-white">{displayName || profile?.username || 'Trainer'}</p>
                <p className="text-[10px] text-white/40">Avatar #{selected || 1}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="game-label">Display Name</label>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder={profile?.username || 'Your display name'} maxLength={30} className="game-input" />
            <p className="mt-1 text-[10px] text-white/30">Shown on the leaderboard. Leave blank to use your username.</p>
          </div>

          <div className="mb-4">
            <p className="game-label mb-3">Choose Your Trainer Icon</p>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: AVATAR_COUNT }, (_, i) => i + 1).map((num) => (
              <button key={num} type="button" onClick={() => setSelected(num)} className={'avatar-option ' + (selected === num ? 'selected' : '')}>
                <img src={getAvatarUrl(num)} alt={'Avatar ' + num} className="h-12 w-12 rounded-lg object-cover" />
              </button>
            ))}
          </div>

          <button type="button" onClick={handleSave} disabled={saving || !dirty} className="game-btn game-btn-yellow w-full mt-6">
            <FontAwesomeIcon icon={saved ? faCheck : faFloppyDisk} />
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}