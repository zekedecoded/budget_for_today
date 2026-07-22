export interface Profile {
  id: string
  username: string
  display_name: string | null
  avatar: number | null
  created_at: string
}

export interface DailyLimit {
  id: string
  user_id: string
  amount: number
  date: string
  note: string | null
  purchases: Purchase[]
  created_at: string
  updated_at: string
  profiles?: Pick<Profile, 'username' | 'display_name' | 'avatar'> | null
}

export interface Purchase {
  id: string
  name: string
  amount: number
}

export interface DayEntry {
  userId: string
  date: string
  budget: number
  purchases: Purchase[]
}

export interface Friendship {
  id: string
  user_id: string
  friend_id: string
  status: 'pending' | 'accepted'
  created_at: string
  profiles?: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar'> | null
}

export interface WeekRange {
  start: string
  end: string
}

export interface WeekStats {
  range: WeekRange
  totalBudget: number
  totalSpent: number
  netBalance: number
  dayEntries: DayEntry[]
}

export interface FriendRankEntry {
  userId: string
  username: string
  displayName: string | null
  avatar: number | null
  value: number
  rank: number
}

export interface ComputedStats {
  netBalance: number
  savings: number
  debt: number
  streak: number
  biggestSplurge: { date: string; amount: number } | null
  totalSpentAllTime: number
  totalBudgetAllTime: number
}
