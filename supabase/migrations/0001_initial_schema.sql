-- Nick AI v1 — Initial schema
-- Run this in Supabase SQL Editor

-- ============================================================
-- 1. PROFILES
-- ============================================================
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_initial text,
  taste_fingerprint text[] default '{}',
  dietary_flags jsonb default '{"vegetarian": false, "gluten_free": false}'::jsonb,
  allergens text[] default '{}',
  kitchen_tools text[] default '{}',
  onboarding_complete boolean default false,
  notif_prefs jsonb default '{"suggestions": true, "reminders": true, "system": true}'::jsonb,
  meals_count integer default 0,
  joined_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

create policy "Users can delete own profile"
  on public.profiles for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 2. RECIPES (read-only library for authenticated users)
-- ============================================================
create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  hero_image_url text,
  time_minutes integer,
  kcal integer,
  base_servings integer default 2,
  difficulty text check (difficulty in ('easy', 'medium', 'hard')),
  cuisine text,
  tags text[] default '{}',
  categories text[] default '{}',
  ingredients jsonb default '[]'::jsonb,
  steps jsonb default '[]'::jsonb,
  notes text,
  created_at timestamptz default now()
);

alter table public.recipes enable row level security;

create policy "Authenticated users can read recipes"
  on public.recipes for select
  to authenticated
  using (true);

-- ============================================================
-- 3. CHAT MESSAGES
-- ============================================================
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  recipe_card_ids uuid[],
  created_at timestamptz default now()
);

alter table public.chat_messages enable row level security;

create policy "Users can read own messages"
  on public.chat_messages for select
  using (auth.uid() = user_id);

create policy "Users can insert own messages"
  on public.chat_messages for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own messages"
  on public.chat_messages for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 4. COOK SESSIONS
-- ============================================================
create table public.cook_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  started_at timestamptz default now(),
  completed_at timestamptz,
  current_step integer default 0,
  rating integer check (rating >= 1 and rating <= 5),
  notes text
);

alter table public.cook_sessions enable row level security;

create policy "Users can read own sessions"
  on public.cook_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own sessions"
  on public.cook_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own sessions"
  on public.cook_sessions for update
  using (auth.uid() = user_id);

create policy "Users can delete own sessions"
  on public.cook_sessions for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 5. FRIDGE SCANS
-- ============================================================
create table public.fridge_scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scanned_at timestamptz default now(),
  ingredients jsonb default '[]'::jsonb,
  source_image_path text
);

alter table public.fridge_scans enable row level security;

create policy "Users can read own scans"
  on public.fridge_scans for select
  using (auth.uid() = user_id);

create policy "Users can insert own scans"
  on public.fridge_scans for insert
  with check (auth.uid() = user_id);

create policy "Users can update own scans"
  on public.fridge_scans for update
  using (auth.uid() = user_id);

create policy "Users can delete own scans"
  on public.fridge_scans for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 6. SHOPPING LIST ITEMS
-- ============================================================
create table public.shopping_list_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_recipe_id uuid references public.recipes(id) on delete set null,
  name text not null,
  quantity text,
  unit text,
  category text default 'other' check (category in ('produce', 'pantry', 'protein', 'dairy', 'other')),
  checked boolean default false,
  added_at timestamptz default now()
);

alter table public.shopping_list_items enable row level security;

create policy "Users can read own list"
  on public.shopping_list_items for select
  using (auth.uid() = user_id);

create policy "Users can insert own items"
  on public.shopping_list_items for insert
  with check (auth.uid() = user_id);

create policy "Users can update own items"
  on public.shopping_list_items for update
  using (auth.uid() = user_id);

create policy "Users can delete own items"
  on public.shopping_list_items for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 7. NOTIFICATIONS
-- ============================================================
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('suggestion', 'reminder', 'system')),
  title text not null,
  body text,
  read boolean default false,
  scheduled_for timestamptz,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;

create policy "Users can read own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can insert own notifications"
  on public.notifications for insert
  with check (auth.uid() = user_id);

create policy "Users can update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

create policy "Users can delete own notifications"
  on public.notifications for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 8. SAVED RECIPES (composite PK)
-- ============================================================
create table public.saved_recipes (
  user_id uuid not null references auth.users(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  saved_at timestamptz default now(),
  primary key (user_id, recipe_id)
);

alter table public.saved_recipes enable row level security;

create policy "Users can read own saves"
  on public.saved_recipes for select
  using (auth.uid() = user_id);

create policy "Users can insert own saves"
  on public.saved_recipes for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own saves"
  on public.saved_recipes for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 9. AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (user_id, display_name, avatar_initial)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    upper(left(coalesce(new.raw_user_meta_data ->> 'display_name', new.email), 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
