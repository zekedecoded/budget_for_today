import type { DayEntry, Purchase, WeekRange, WeekStats, ComputedStats, FriendRankEntry } from '../types'
import { supabase } from './supabase'

export const WEEK_START_DAY = 1 // Monday
export const WEEK_END_DAY = 5 // Friday

export function formatDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayKey(): string {
  return formatDate(new Date())
}

export function isTodayMonday(): boolean {
  return new Date().getDay() === 1
}

export function getCurrentWeekRange(): WeekRange {
  const now = new Date()
  const day = now.getDay()
  const diffToMonday = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diffToMonday)
  const friday = new Date(monday)
  friday.setDate(monday.getDate() + 4)
  return { start: formatDate(monday), end: formatDate(friday) }
}

export function getPreviousWeekRange(): WeekRange {
  const current = getCurrentWeekRange()
  const start = new Date(current.start + 'T00:00:00')
  start.setDate(start.getDate() - 7)
  const end = new Date(current.end + 'T00:00:00')
  end.setDate(end.getDate() - 7)
  return { start: formatDate(start), end: formatDate(end) }
}

export function spentFromPurchases(purchases: Purchase[]): number {
  return purchases.reduce((sum, p) => sum + p.amount, 0)
}

export function diffFromEntry(entry: DayEntry): number {
  return entry.budget - spentFromPurchases(entry.purchases)
}

export function computeNetBalance(entries: DayEntry[]): number {
  return entries.reduce((sum, e) => sum + diffFromEntry(e), 0)
}

export function computeSavings(entries: DayEntry[]): number {
  const bal = computeNetBalance(entries)
  return bal >= 0 ? bal : 0
}

export function computeDebt(entries: DayEntry[]): number {
  const bal = computeNetBalance(entries)
  return bal < 0 ? Math.abs(bal) : 0
}

export function computeStreak(entries: DayEntry[]): number {
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date))
  let streak = 0
  for (const entry of sorted) {
    if (diffFromEntry(entry) >= 0) streak++
    else break
  }
  return streak
}

export function computeBiggestSplurge(entries: DayEntry[]): { date: string; amount: number } | null {
  let max: { date: string; amount: number } | null = null
  for (const entry of entries) {
    const spent = spentFromPurchases(entry.purchases)
    if (spent > 0 && (!max || spent > max.amount)) {
      max = { date: entry.date, amount: spent }
    }
  }
  return max
}

export function computeWeekStats(entries: DayEntry[], range: WeekRange): WeekStats {
  const weekEntries = entries.filter(e => e.date >= range.start && e.date <= range.end)
  const totalBudget = weekEntries.reduce((s, e) => s + e.budget, 0)
  const totalSpent = weekEntries.reduce((s, e) => s + spentFromPurchases(e.purchases), 0)
  return {
    range,
    totalBudget,
    totalSpent,
    netBalance: totalBudget - totalSpent,
    dayEntries: weekEntries,
  }
}

export function computeAllStats(entries: DayEntry[]): ComputedStats {
  const netBalance = computeNetBalance(entries)
  return {
    netBalance,
    savings: netBalance >= 0 ? netBalance : 0,
    debt: netBalance < 0 ? Math.abs(netBalance) : 0,
    streak: computeStreak(entries),
    biggestSplurge: computeBiggestSplurge(entries),
    totalSpentAllTime: entries.reduce((s, e) => s + spentFromPurchases(e.purchases), 0),
    totalBudgetAllTime: entries.reduce((s, e) => s + e.budget, 0),
  }
}

export function computeVariance(entries: DayEntry[]): number {
  const withSpending = entries.filter(e => spentFromPurchases(e.purchases) > 0)
  if (withSpending.length < 2) return 0
  const spends = withSpending.map(e => spentFromPurchases(e.purchases))
  const mean = spends.reduce((s, v) => s + v, 0) / spends.length
  const variance = spends.reduce((s, v) => s + (v - mean) ** 2, 0) / spends.length
  return variance
}

export async function fetchDayEntries(userId: string, startDate?: string, endDate?: string): Promise<DayEntry[]> {
  let query = supabase
    .from('daily_limits')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true })
  if (startDate) query = query.gte('date', startDate)
  if (endDate) query = query.lte('date', endDate)
  const { data } = await query
  return (data || []).map(d => ({
    userId: d.user_id,
    date: d.date,
    budget: d.amount,
    purchases: (Array.isArray(d.purchases) ? d.purchases : []) as Purchase[],
  }))
}

export async function fetchFriendEntries(
  friendIds: string[],
  startDate?: string,
  endDate?: string,
): Promise<Map<string, DayEntry[]>> {
  if (friendIds.length === 0) return new Map()
  let query = supabase
    .from('daily_limits')
    .select('*')
    .in('user_id', friendIds)
    .order('date', { ascending: true })
  if (startDate) query = query.gte('date', startDate)
  if (endDate) query = query.lte('date', endDate)
  const { data } = await query
  const map = new Map<string, DayEntry[]>()
  for (const d of data || []) {
    const entry: DayEntry = {
      userId: d.user_id,
      date: d.date,
      budget: d.amount,
      purchases: (Array.isArray(d.purchases) ? d.purchases : []) as Purchase[],
    }
    const existing = map.get(d.user_id) || []
    existing.push(entry)
    map.set(d.user_id, existing)
  }
  return map
}

export function computeWeeklyLeastSpentRankings(
  userEntries: DayEntry[],
  friendEntriesMap: Map<string, DayEntry[]>,
  userDisplay: { id: string; username: string; displayName: string | null; avatar: number | null },
  friendProfiles: Map<string, { username: string; display_name: string | null; avatar: number | null }>,
): FriendRankEntry[] {
  const range = getCurrentWeekRange()
  const all: FriendRankEntry[] = []

  const userWeekEntries = userEntries.filter(e => e.date >= range.start && e.date <= range.end)
  const userWeekSpent = userWeekEntries.reduce((s, e) => s + spentFromPurchases(e.purchases), 0)
  all.push({
    userId: userDisplay.id,
    username: userDisplay.username,
    displayName: userDisplay.displayName,
    avatar: userDisplay.avatar,
    value: userWeekSpent,
    rank: 0,
  })

  for (const [friendId, entries] of friendEntriesMap) {
    const profile = friendProfiles.get(friendId)
    if (!profile) continue
    const weekEntries = entries.filter(e => e.date >= range.start && e.date <= range.end)
    const weekSpent = weekEntries.reduce((s, e) => s + spentFromPurchases(e.purchases), 0)
    all.push({
      userId: friendId,
      username: profile.username,
      displayName: profile.display_name,
      avatar: profile.avatar,
      value: weekSpent,
      rank: 0,
    })
  }

  all.sort((a, b) => a.value - b.value)
  all.forEach((entry, i) => { entry.rank = i + 1 })
  return all
}

export function computeAllTimeLeastSpentRankings(
  userEntries: DayEntry[],
  friendEntriesMap: Map<string, DayEntry[]>,
  userDisplay: { id: string; username: string; displayName: string | null; avatar: number | null },
  friendProfiles: Map<string, { username: string; display_name: string | null; avatar: number | null }>,
): FriendRankEntry[] {
  const all: FriendRankEntry[] = []

  const userTotalSpent = userEntries.reduce((s, e) => s + spentFromPurchases(e.purchases), 0)
  all.push({
    userId: userDisplay.id,
    username: userDisplay.username,
    displayName: userDisplay.displayName,
    avatar: userDisplay.avatar,
    value: userTotalSpent,
    rank: 0,
  })

  for (const [friendId, entries] of friendEntriesMap) {
    const profile = friendProfiles.get(friendId)
    if (!profile) continue
    const totalSpent = entries.reduce((s, e) => s + spentFromPurchases(e.purchases), 0)
    all.push({
      userId: friendId,
      username: profile.username,
      displayName: profile.display_name,
      avatar: profile.avatar,
      value: totalSpent,
      rank: 0,
    })
  }

  all.sort((a, b) => a.value - b.value)
  all.forEach((entry, i) => { entry.rank = i + 1 })
  return all
}

export function computeMostSavedRankings(
  userEntries: DayEntry[],
  friendEntriesMap: Map<string, DayEntry[]>,
  userDisplay: { id: string; username: string; displayName: string | null; avatar: number | null },
  friendProfiles: Map<string, { username: string; display_name: string | null; avatar: number | null }>,
): FriendRankEntry[] {
  const all: FriendRankEntry[] = []

  all.push({
    userId: userDisplay.id,
    username: userDisplay.username,
    displayName: userDisplay.displayName,
    avatar: userDisplay.avatar,
    value: computeNetBalance(userEntries),
    rank: 0,
  })

  for (const [friendId, entries] of friendEntriesMap) {
    const profile = friendProfiles.get(friendId)
    if (!profile) continue
    all.push({
      userId: friendId,
      username: profile.username,
      displayName: profile.display_name,
      avatar: profile.avatar,
      value: computeNetBalance(entries),
      rank: 0,
    })
  }

  all.sort((a, b) => b.value - a.value)
  all.forEach((entry, i) => { entry.rank = i + 1 })
  return all
}

export function computeStreakRankings(
  userEntries: DayEntry[],
  friendEntriesMap: Map<string, DayEntry[]>,
  userDisplay: { id: string; username: string; displayName: string | null; avatar: number | null },
  friendProfiles: Map<string, { username: string; display_name: string | null; avatar: number | null }>,
): FriendRankEntry[] {
  const all: FriendRankEntry[] = []

  all.push({
    userId: userDisplay.id,
    username: userDisplay.username,
    displayName: userDisplay.displayName,
    avatar: userDisplay.avatar,
    value: computeStreak(userEntries),
    rank: 0,
  })

  for (const [friendId, entries] of friendEntriesMap) {
    const profile = friendProfiles.get(friendId)
    if (!profile) continue
    all.push({
      userId: friendId,
      username: profile.username,
      displayName: profile.display_name,
      avatar: profile.avatar,
      value: computeStreak(entries),
      rank: 0,
    })
  }

  all.sort((a, b) => b.value - a.value)
  all.forEach((entry, i) => { entry.rank = i + 1 })
  return all
}

export function computeBiggestSplurgeRankings(
  userEntries: DayEntry[],
  friendEntriesMap: Map<string, DayEntry[]>,
  userDisplay: { id: string; username: string; displayName: string | null; avatar: number | null },
  friendProfiles: Map<string, { username: string; display_name: string | null; avatar: number | null }>,
): FriendRankEntry[] {
  const all: FriendRankEntry[] = []

  const userSplurge = computeBiggestSplurge(userEntries)
  all.push({
    userId: userDisplay.id,
    username: userDisplay.username,
    displayName: userDisplay.displayName,
    avatar: userDisplay.avatar,
    value: userSplurge?.amount ?? 0,
    rank: 0,
  })

  for (const [friendId, entries] of friendEntriesMap) {
    const profile = friendProfiles.get(friendId)
    if (!profile) continue
    const splurge = computeBiggestSplurge(entries)
    all.push({
      userId: friendId,
      username: profile.username,
      displayName: profile.display_name,
      avatar: profile.avatar,
      value: splurge?.amount ?? 0,
      rank: 0,
    })
  }

  all.sort((a, b) => b.value - a.value)
  all.forEach((entry, i) => { entry.rank = i + 1 })
  return all
}
