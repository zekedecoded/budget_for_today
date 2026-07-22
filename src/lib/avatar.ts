export const AVATAR_COUNT = 6

const AVATAR_FILES = [
  'fox.jpg',
  'pig.png',
  'dog.png',
  'cat.png',
  'frog.png',
  'panda.png',
]

const STORAGE_KEY = 'daily_spending_avatar'

export function getAvatarUrl(index: number): string {
  return `/icons/${AVATAR_FILES[index - 1] ?? AVATAR_FILES[0]}`
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
