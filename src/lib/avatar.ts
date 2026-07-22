export const AVATAR_COUNT = 6

const AVATAR_FILES = [
  'avatar-1.png',
  'avatar-2.png',
  'avatar-3.png',
  'avatar-4.png',
  'avatar-5.png',
  'avatar-6.jpg',
]

const STORAGE_KEY = 'daily_spending_avatar'

export function getAvatarUrl(index: number): string {
  return `/avatars/${AVATAR_FILES[index - 1] ?? AVATAR_FILES[0]}`
}

export function getStoredAvatar(): number | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const n = Number(raw)
      if (n >= 1 && n <= AVATAR_COUNT) return n
    }
  } catch {}
  return null
}

export function setStoredAvatar(index: number): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(index))
  } catch {}
}

export function clearStoredAvatar(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {}
}
