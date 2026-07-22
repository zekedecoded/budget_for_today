import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PixelIcon } from '../components/PixelIcon'
import { PixelAvatar } from '../components/PixelAvatar'
import { useAuth } from '../context/AuthContext'

export function Profile() {
  const { user, profile, updateProfile } = useAuth()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { setDisplayName(profile?.display_name ?? '') }, [profile?.display_name])

  if (!user) { navigate('/login'); return null }

  const nameDirty = displayName !== (profile?.display_name ?? '')

  const handleSave = async () => {
    setSaving(true)
    const updates: Record<string, unknown> = {}
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
              <div style={{ border: '3px solid var(--amber)', borderRadius: '50%', overflow: 'hidden', lineHeight: 0 }}>
                <PixelAvatar userId={user.id} size={64} />
              </div>
              <div>
                <p className="font-pixel text-[16px] text-primary">{displayName || profile?.username || 'You'}</p>
                <p className="font-pixel text-[12px] text-muted">Your avatar</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="pixel-label">Display Name</label>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder={profile?.username || 'Your display name'} maxLength={30} className="pixel-input" />
            <p className="mt-1 font-pixel text-[12px] text-faint">Shown on the leaderboard. You can leave it blank.</p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !nameDirty}
            className="pixel-btn pixel-btn-accent w-full mt-2"
          >
            <PixelIcon name={saved ? 'check' : 'save'} size={14} />
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
