// Supabase auth accounts need an email address, but users only ever see
// usernames. We build a synthetic email from the username behind the scenes.
const USERNAME_EMAIL_DOMAIN = 'users.budget-for-today.app'

export const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/

export const USERNAME_RULES =
  'Username must be 3-20 characters: letters, numbers, and underscores only.'

export function usernameToEmail(username: string): string {
  return `${username.trim().toLowerCase()}@${USERNAME_EMAIL_DOMAIN}`
}

// Accepts a username or, for older accounts, a full email address.
export function loginIdentifierToEmail(identifier: string): string {
  const trimmed = identifier.trim()
  return trimmed.includes('@') ? trimmed : usernameToEmail(trimmed)
}
