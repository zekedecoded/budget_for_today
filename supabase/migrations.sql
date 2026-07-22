-- Run in Supabase SQL Editor

-- Add purchases column to daily_limits
alter table public.daily_limits add column if not exists purchases jsonb default '[]'::jsonb;

-- Ensure one entry per user per date
delete from public.daily_limits a using public.daily_limits b
  where a.id < b.id and a.user_id = b.user_id and a.date = b.date;
alter table public.daily_limits add constraint daily_limits_user_date_unique unique (user_id, date);

-- Friendships table
create table if not exists public.friendships (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  friend_id uuid references public.profiles(id) not null,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz default now(),
  unique(user_id, friend_id)
);

alter table public.friendships enable row level security;

drop policy if exists "friendships_select_own" on public.friendships;
create policy "friendships_select_own" on public.friendships
  for select using (auth.uid() = user_id or auth.uid() = friend_id);

drop policy if exists "friendships_insert_own" on public.friendships;
create policy "friendships_insert_own" on public.friendships
  for insert with check (auth.uid() = user_id);

drop policy if exists "friendships_update_own" on public.friendships;
create policy "friendships_update_own" on public.friendships
  for update using (auth.uid() = friend_id and status = 'pending');

-- Allow users to update their own daily_limits (for purchases)
drop policy if exists "daily_limits_update_own" on public.daily_limits;
create policy "daily_limits_update_own" on public.daily_limits
  for update using (auth.uid() = user_id);

-- Add friendships to realtime
do $$
begin
  alter publication supabase_realtime add table public.friendships;
exception
  when duplicate_object then null;
end;
$$;

-- Index for faster friend queries
create index if not exists friendships_user_id_idx on public.friendships (user_id);
create index if not exists friendships_friend_id_idx on public.friendships (friend_id);
create index if not exists daily_limits_user_id_date_idx on public.daily_limits (user_id, date);
