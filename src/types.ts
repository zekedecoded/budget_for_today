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
  created_at: string
  updated_at: string
  profiles?: Pick<Profile, 'username' | 'display_name' | 'avatar'> | null
}
