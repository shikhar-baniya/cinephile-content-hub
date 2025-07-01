-- Debug queries to check watch_date data
-- Run these in your Supabase SQL Editor to diagnose the issue

-- 1. Check if watch_date column exists and has data
SELECT 
  title,
  status,
  created_at,
  updated_at,
  watch_date,
  CASE 
    WHEN watch_date IS NULL THEN 'NULL'
    ELSE watch_date::text
  END as watch_date_display
FROM public.movies 
WHERE status = 'watched'
ORDER BY created_at DESC
LIMIT 10;

-- 2. Count movies by status and watch_date presence
SELECT 
  status,
  COUNT(*) as total,
  COUNT(watch_date) as with_watch_date,
  COUNT(*) - COUNT(watch_date) as missing_watch_date
FROM public.movies 
GROUP BY status;

-- 3. Check watch_date distribution by year
SELECT 
  EXTRACT(YEAR FROM watch_date) as year,
  COUNT(*) as count
FROM public.movies 
WHERE status = 'watched' AND watch_date IS NOT NULL
GROUP BY EXTRACT(YEAR FROM watch_date)
ORDER BY year DESC;

-- 4. Check if the migration was applied
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'movies' AND column_name IN ('watch_date', 'tmdb_id', 'season');