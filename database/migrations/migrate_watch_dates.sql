-- Migration to populate watch_date from updated_at for existing data
-- Run this in your Supabase SQL Editor

-- Option 1: Update all "watched" movies with null watch_date using updated_at
UPDATE public.movies 
SET watch_date = updated_at::date
WHERE status = 'watched' 
  AND watch_date IS NULL;

-- Option 2: More conservative - use created_at if updated_at seems too recent
-- (Uncomment if you prefer this approach)
/*
UPDATE public.movies 
SET watch_date = CASE 
  -- If updated recently (within last 7 days), probably use created_at instead
  WHEN updated_at > NOW() - INTERVAL '7 days' THEN created_at::date
  ELSE updated_at::date
END
WHERE status = 'watched' 
  AND watch_date IS NULL;
*/

-- Option 3: Interactive query to see what would be updated first
-- (Run this first to preview changes)
SELECT 
  id,
  title,
  status,
  created_at,
  updated_at,
  watch_date,
  -- Preview what the new watch_date would be
  CASE 
    WHEN status = 'watched' AND watch_date IS NULL THEN updated_at::date
    ELSE watch_date
  END as new_watch_date
FROM public.movies 
WHERE status = 'watched' AND watch_date IS NULL
ORDER BY updated_at DESC;

-- Check results after migration
SELECT 
  status,
  COUNT(*) as count,
  COUNT(watch_date) as with_watch_date,
  COUNT(*) - COUNT(watch_date) as missing_watch_date
FROM public.movies 
GROUP BY status
ORDER BY status;