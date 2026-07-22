import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PixelIcon } from '../components/PixelIcon'
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
    <div className="page-container pt-8">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-8 text-center">
          <h1 className="page-title text-center">Profile</h1>
          <p className="font-pixel text-[14px] text-muted mt-2">
            Customize your character
          </p>
        </div>

        <div className="pixel-panel">
          <div className="mb-6 flex justify-center">
            <div className="flex items-center gap-4">
              <img
                src={getAvatarUrl(selected || 1)}
                alt="Selected avatar"
                className="h-16 w-16 object-cover"
                style={{ border: '3px solid var(--amber)', imageRendering: 'auto' }}
              />
              <div>
                <p className="font-pixel text-[16px] text-primary">{displayName || profile?.username || 'You'}</p>
                <p className="font-pixel text-[12px] text-muted">Avatar #{selected || 1}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="pixel-label">Display Name</label>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder={profile?.username || 'Your display name'} maxLength={30} className="pixel-input" />
            <p className="mt-1 font-pixel text-[12px] text-faint">Shown on the leaderboard. You can leave it blank.</p>
          </div>

          <div className="mb-4">
            <p className="pixel-label mb-3">Choose an Avatar</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: AVATAR_COUNT }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setSelected(num)}
                className="cursor-pointer p-0.5 transition-all"
                style={{
                  border: selected === num ? '3px solid var(--amber)' : '3px solid transparent',
                  background: 'none',
                }}
              >
                <img
                  src={getAvatarUrl(num)}
                  alt={'Avatar ' + num}
                  className="h-full w-full object-cover"
                  style={{ imageRendering: 'auto' }}
                />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !dirty}
            className="pixel-btn pixel-btn-accent w-full mt-6"
          >
            <PixelIcon name={saved ? 'check' : 'save'} size={14} />
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
