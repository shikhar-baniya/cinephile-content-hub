-- Rollback Script: Revert Series Season Tracking Migration
-- Use this script if you need to rollback the series season tracking migration
-- WARNING: This will delete all season and episode data!

-- First, let's verify we have a backup
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'movies_backup_pre_season_migration') THEN
        RAISE EXCEPTION 'Backup table movies_backup_pre_season_migration not found! Cannot proceed with rollback.';
    END IF;
    
    RAISE NOTICE 'Backup table found. Proceeding with rollback...';
END $$;

-- Step 1: Disable triggers to prevent cascading updates during rollback
ALTER TABLE public.series_episodes DISABLE TRIGGER update_season_on_episode_watch;
ALTER TABLE public.series_seasons DISABLE TRIGGER update_series_on_season_change;
ALTER TABLE public.series_seasons DISABLE TRIGGER update_series_seasons_updated_at;
ALTER TABLE public.series_episodes DISABLE TRIGGER update_series_episodes_updated_at;

-- Step 2: Restore original data from backup for series entries
UPDATE public.movies 
SET 
    rating = backup.rating,
    notes = backup.notes,
    watch_date = backup.watch_date,
    status = backup.status,
    season = backup.season
FROM public.movies_backup_pre_season_migration backup
WHERE movies.id = backup.id 
AND movies.category = 'Series';

-- Step 3: Remove the new columns we added
DO $$
BEGIN
    -- Remove new columns if they exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='movies' AND column_name='latest_season_watched') THEN
        ALTER TABLE public.movies DROP COLUMN latest_season_watched;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='movies' AND column_name='total_seasons_available') THEN
        ALTER TABLE public.movies DROP COLUMN total_seasons_available;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='movies' AND column_name='overall_rating') THEN
        ALTER TABLE public.movies DROP COLUMN overall_rating;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='movies' AND column_name='overall_notes') THEN
        ALTER TABLE public.movies DROP COLUMN overall_notes;
    END IF;
END $$;

-- Step 4: Drop the view
DROP VIEW IF EXISTS public.series_with_seasons;

-- Step 5: Drop the new tables (this will cascade delete all season and episode data)
DROP TABLE IF EXISTS public.series_episodes CASCADE;
DROP TABLE IF EXISTS public.series_seasons CASCADE;

-- Step 6: Drop the custom functions
DROP FUNCTION IF EXISTS update_season_episode_count() CASCADE;
DROP FUNCTION IF EXISTS update_series_progress() CASCADE;

-- Step 7: Verification - check that series data is restored
DO $$
DECLARE
    original_count INTEGER;
    restored_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO original_count FROM public.movies_backup_pre_season_migration;
    SELECT COUNT(*) INTO restored_count FROM public.movies WHERE category = 'Series';
    
    RAISE NOTICE 'Rollback Statistics:';
    RAISE NOTICE 'Original series count: %', original_count;
    RAISE NOTICE 'Restored series count: %', restored_count;
    
    IF original_count = restored_count THEN
        RAISE NOTICE '✅ Rollback completed successfully! All series data restored.';
    ELSE
        RAISE WARNING '⚠️  Series count mismatch. Please verify data manually.';
    END IF;
END $$;

-- Step 8: Optional - Keep backup table for safety or drop it
-- Uncomment the next line to remove the backup table
-- DROP TABLE IF EXISTS public.movies_backup_pre_season_migration;

-- Final verification query
SELECT 
    'Rollback Verification' as check_type,
    COUNT(*) as series_count,
    COUNT(CASE WHEN season IS NOT NULL THEN 1 END) as series_with_season_data,
    COUNT(CASE WHEN watch_date IS NOT NULL THEN 1 END) as series_with_watch_dates
FROM public.movies 
WHERE category = 'Series';

RAISE NOTICE '⚠️  ROLLBACK COMPLETED';
RAISE NOTICE 'The following has been reverted:';
RAISE NOTICE '- All season and episode tracking data has been deleted';
RAISE NOTICE '- Series records restored to original state';
RAISE NOTICE '- New database columns removed';
RAISE NOTICE '- Custom functions and triggers removed';
RAISE NOTICE 'Backup table "movies_backup_pre_season_migration" is still available for reference';
