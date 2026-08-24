-- Wavelength Supabase Schema
-- Copy and paste this into the Supabase SQL Editor and click 'Run'

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  channel_name TEXT,
  handle TEXT,
  bio TEXT,
  avatar_url TEXT,
  avatar_color TEXT DEFAULT '#6366f1',
  niche TEXT,
  target_audience TEXT,
  tone TEXT,
  youtube_channel_id TEXT,
  upload_goal TEXT,
  social_links TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Create Key-Value (App State) Table
CREATE TABLE IF NOT EXISTS public.kv (
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (user_id, key)
);

-- 3. Create helpful indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_kv_user_id ON public.kv(user_id);

-- 4. Enable Row Level Security (RLS) & Allow Server Access
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kv ENABLE ROW LEVEL SECURITY;

-- Allow all operations for Service Role & Anon key through backend
CREATE POLICY "Allow all access to users for backend" ON public.users
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to kv for backend" ON public.kv
  FOR ALL
  USING (true)
  WITH CHECK (true);
