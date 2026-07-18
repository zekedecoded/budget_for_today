-- Run this in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- Safe to run more than once.

-- ── profiles ──────────────────────────────────────────────────────────────

-- Everyone can read profiles (the board shows each user's name)
drop policy if exists "profiles_public_read" on public.profiles;
create policy "profiles_public_read" on public.profiles
  for select using (true);

-- Users can create/update their own profile
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- ── daily_limits ──────────────────────────────────────────────────────────

-- Everyone can read the board
drop policy if exists "daily_limits_public_read" on public.daily_limits;
create policy "daily_limits_public_read" on public.daily_limits
  for select using (true);

-- Users can post their own daily limit
drop policy if exists "daily_limits_insert_own" on public.daily_limits;
create policy "daily_limits_insert_own" on public.daily_limits
  for insert with check (auth.uid() = user_id);

-- ── auto-create a profile whenever an account is created ─────────────────
-- (the client-side insert fails when email confirmation is required,
--  because there is no session yet at signup time)

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for accounts that already exist
insert into public.profiles (id, username, display_name)
select u.id, split_part(u.email, '@', 1), split_part(u.email, '@', 1)
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);

-- ── realtime: let the board update live when someone scratches ───────────

do $$
begin
  alter publication supabase_realtime add table public.daily_limits;
exception
  when duplicate_object then null;
end;
$$;
