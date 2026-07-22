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

export async function fetchAllUserEntries(
  startDate?: string,
  endDate?: string,
): Promise<Map<string, DayEntry[]>> {
  let query = supabase
    .from('daily_limits')
    .select('*')
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

export async function fetchAllProfiles(): Promise<Map<string, { username: string; display_name: string | null; avatar: number | null }>> {
  const { data } = await supabase.from('profiles').select('id, username, display_name, avatar')
  const map = new Map<string, { username: string; display_name: string | null; avatar: number | null }>()
  for (const p of data || []) {
    map.set(p.id, { username: p.username, display_name: p.display_name, avatar: p.avatar })
  }
  return map
}

function toRankings(
  entriesMap: Map<string, DayEntry[]>,
  profilesMap: Map<string, { username: string; display_name: string | null; avatar: number | null }>,
  computeValue: (entries: DayEntry[]) => number,
  sortAsc: boolean,
): FriendRankEntry[] {
  const all: FriendRankEntry[] = []
  for (const [userId, entries] of entriesMap) {
    const profile = profilesMap.get(userId)
    if (!profile) continue
    all.push({
      userId,
      username: profile.username,
      displayName: profile.display_name,
      avatar: profile.avatar,
      value: computeValue(entries),
      rank: 0,
    })
  }
  all.sort((a, b) => sortAsc ? a.value - b.value : b.value - a.value)
  all.forEach((entry, i) => { entry.rank = i + 1 })
  return all
}

function weekRangeFilter(entries: DayEntry[], range: WeekRange): DayEntry[] {
  return entries.filter(e => e.date >= range.start && e.date <= range.end)
}

export function computeWeeklyLeastSpentRankings(
  entriesMap: Map<string, DayEntry[]>,
  profilesMap: Map<string, { username: string; display_name: string | null; avatar: number | null }>,
): FriendRankEntry[] {
  const range = getCurrentWeekRange()
  const filtered = new Map<string, DayEntry[]>()
  for (const [uid, entries] of entriesMap) {
    const weekEntries = weekRangeFilter(entries, range)
    if (weekEntries.length > 0) filtered.set(uid, weekEntries)
  }
  return toRankings(filtered, profilesMap, es => es.reduce((s, e) => s + spentFromPurchases(e.purchases), 0), true)
}

export function computeAllTimeLeastSpentRankings(
  entriesMap: Map<string, DayEntry[]>,
  profilesMap: Map<string, { username: string; display_name: string | null; avatar: number | null }>,
): FriendRankEntry[] {
  return toRankings(entriesMap, profilesMap, es => es.reduce((s, e) => s + spentFromPurchases(e.purchases), 0), true)
}

export function computeMostSavedRankings(
  entriesMap: Map<string, DayEntry[]>,
  profilesMap: Map<string, { username: string; display_name: string | null; avatar: number | null }>,
): FriendRankEntry[] {
  return toRankings(entriesMap, profilesMap, computeNetBalance, false)
}

export function computeStreakRankings(
  entriesMap: Map<string, DayEntry[]>,
  profilesMap: Map<string, { username: string; display_name: string | null; avatar: number | null }>,
): FriendRankEntry[] {
  return toRankings(entriesMap, profilesMap, computeStreak, false)
}

export function computeBiggestSplurgeRankings(
  entriesMap: Map<string, DayEntry[]>,
  profilesMap: Map<string, { username: string; display_name: string | null; avatar: number | null }>,
): FriendRankEntry[] {
  return toRankings(entriesMap, profilesMap, es => {
    const s = computeBiggestSplurge(es)
    return s?.amount ?? 0
  }, false)
}
