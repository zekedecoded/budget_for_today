export const AVATAR_COUNT = 10

const STORAGE_KEY = 'daily_spending_avatar'

export function getAvatarUrl(index: number): string {
  return `/avatars/avatar-${index}.png`
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
