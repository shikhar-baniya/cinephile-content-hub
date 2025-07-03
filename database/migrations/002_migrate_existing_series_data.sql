-- Migration: Convert Existing Series Data to New Season Tracking Format
-- This script migrates existing series entries to the new season-based tracking system
-- Run this AFTER running 001_series_season_tracking_schema.sql

-- First, let's backup the current series data before migration
CREATE TABLE IF NOT EXISTS public.movies_backup_pre_season_migration AS 
SELECT * FROM public.movies WHERE category = 'Series';

-- Function to safely extract season number from season string
CREATE OR REPLACE FUNCTION extract_season_number(season_text VARCHAR)
RETURNS INTEGER AS $$
BEGIN
    -- Handle various season formats: "Season 1", "S1", "1", "Season One", etc.
    RETURN CASE 
        WHEN season_text IS NULL THEN 1
        WHEN season_text ~ '^[0-9]+$' THEN season_text::INTEGER
        WHEN season_text ~* '^season\s+([0-9]+)' THEN (regexp_match(season_text, '^season\s+([0-9]+)', 'i'))[1]::INTEGER
        WHEN season_text ~* '^s([0-9]+)' THEN (regexp_match(season_text, '^s([0-9]+)', 'i'))[1]::INTEGER
        WHEN season_text ~* 'one|first|1st' THEN 1
        WHEN season_text ~* 'two|second|2nd' THEN 2
        WHEN season_text ~* 'three|third|3rd' THEN 3
        WHEN season_text ~* 'four|fourth|4th' THEN 4
        WHEN season_text ~* 'five|fifth|5th' THEN 5
        ELSE 1 -- Default to season 1 if we can't parse
    END;
EXCEPTION
    WHEN OTHERS THEN
        RETURN 1; -- Default to season 1 on any error
END;
$$ LANGUAGE plpgsql;

-- Step 1: Migrate series data to new structure
DO $$
DECLARE
    series_record RECORD;
    season_num INTEGER;
    new_season_id UUID;
BEGIN
    -- Loop through all existing series
    FOR series_record IN 
        SELECT * FROM public.movies WHERE category = 'Series'
    LOOP
        -- Extract season number from existing season field
        season_num := extract_season_number(series_record.season);
        
        -- Update the movies record with new fields
        UPDATE public.movies 
        SET 
            latest_season_watched = CASE 
                WHEN series_record.status = 'watched' THEN season_num 
                ELSE NULL 
            END,
            total_seasons_available = season_num, -- We'll update this later with TMDB data
            overall_rating = series_record.rating,
            overall_notes = series_record.notes
        WHERE id = series_record.id;
        
        -- Create season record for this series
        INSERT INTO public.series_seasons (
            series_id,
            season_number,
            season_name,
            episode_count,
            episodes_watched,
            status,
            watch_date,
            started_date,
            rating,
            notes,
            tmdb_season_id
        ) VALUES (
            series_record.id,
            season_num,
            COALESCE(series_record.season, 'Season ' || season_num),
            0, -- We'll populate this later with TMDB data
            0, -- Will be updated based on status
            CASE 
                WHEN series_record.status = 'watched' THEN 'completed'
                WHEN series_record.status = 'watching' THEN 'watching'
                WHEN series_record.status = 'want-to-watch' THEN 'want-to-watch'
                ELSE 'not-started'
            END,
            CASE 
                WHEN series_record.status = 'watched' THEN series_record.watch_date
                ELSE NULL
            END,
            CASE 
                WHEN series_record.status IN ('watching', 'watched') THEN COALESCE(series_record.watch_date, series_record.created_at::DATE)
                ELSE NULL
            END,
            series_record.rating,
            series_record.notes,
            NULL -- Will be populated when we fetch TMDB data
        ) RETURNING id INTO new_season_id;
        
        -- If the season is marked as completed, create dummy episodes to maintain data integrity
        IF series_record.status = 'watched' THEN
            -- Create a placeholder episode (we'll replace with real episodes later via TMDB)
            INSERT INTO public.series_episodes (
                season_id,
                episode_number,
                episode_name,
                watched,
                watch_date
            ) VALUES (
                new_season_id,
                1,
                'Episode 1', -- Placeholder name
                true,
                series_record.watch_date
            );
        END IF;
        
        RAISE NOTICE 'Migrated series: % (Season %)', series_record.title, season_num;
    END LOOP;
    
    RAISE NOTICE 'Migration completed. Migrated % series records.', 
        (SELECT COUNT(*) FROM public.movies WHERE category = 'Series');
END $$;

-- Step 2: Clean up old season column data (optional - keep for now for rollback purposes)
-- We'll keep the old season column for now in case we need to rollback
-- ALTER TABLE public.movies DROP COLUMN season;

-- Step 3: Update statistics
DO $$
BEGIN
    RAISE NOTICE 'Migration Statistics:';
    RAISE NOTICE 'Total series in movies table: %', (SELECT COUNT(*) FROM public.movies WHERE category = 'Series');
    RAISE NOTICE 'Total season records created: %', (SELECT COUNT(*) FROM public.series_seasons);
    RAISE NOTICE 'Total episode records created: %', (SELECT COUNT(*) FROM public.series_episodes);
    RAISE NOTICE 'Series with watch dates preserved: %', (SELECT COUNT(*) FROM public.series_seasons WHERE watch_date IS NOT NULL);
END $$;

-- Step 4: Verification queries to ensure data integrity
-- Check for any series without corresponding season records
SELECT 
    m.id,
    m.title,
    m.season as original_season,
    COUNT(ss.id) as season_count
FROM public.movies m
LEFT JOIN public.series_seasons ss ON m.id = ss.series_id
WHERE m.category = 'Series'
GROUP BY m.id, m.title, m.season
HAVING COUNT(ss.id) = 0;

-- Check for data consistency
SELECT 
    'Data Consistency Check' as check_type,
    'Series without seasons' as issue,
    COUNT(*) as count
FROM public.movies m
LEFT JOIN public.series_seasons ss ON m.id = ss.series_id
WHERE m.category = 'Series' AND ss.id IS NULL

UNION ALL

SELECT 
    'Data Consistency Check',
    'Seasons without series',
    COUNT(*)
FROM public.series_seasons ss
LEFT JOIN public.movies m ON m.id = ss.series_id
WHERE m.id IS NULL

UNION ALL

SELECT 
    'Data Consistency Check',
    'Episodes without seasons',
    COUNT(*)
FROM public.series_episodes se
LEFT JOIN public.series_seasons ss ON ss.id = se.season_id
WHERE ss.id IS NULL;

-- Create a view for easy access to series with season information
CREATE OR REPLACE VIEW public.series_with_seasons AS
SELECT 
    m.id as series_id,
    m.title,
    m.genre,
    m.release_year,
    m.platform,
    m.status as series_status,
    m.poster,
    m.overall_rating,
    m.overall_notes,
    m.latest_season_watched,
    m.total_seasons_available,
    m.tmdb_id,
    m.created_at,
    m.updated_at,
    m.user_id,
    
    -- Season aggregated data
    COUNT(ss.id) as total_seasons_tracked,
    COUNT(CASE WHEN ss.status = 'completed' THEN 1 END) as completed_seasons,
    COUNT(CASE WHEN ss.status = 'watching' THEN 1 END) as watching_seasons,
    COUNT(CASE WHEN ss.status = 'want-to-watch' THEN 1 END) as want_to_watch_seasons,
    SUM(ss.episodes_watched) as total_episodes_watched,
    SUM(ss.episode_count) as total_episodes_available,
    MAX(ss.watch_date) as latest_season_completion_date,
    AVG(ss.rating) FILTER (WHERE ss.rating IS NOT NULL) as average_season_rating
    
FROM public.movies m
LEFT JOIN public.series_seasons ss ON m.id = ss.series_id
WHERE m.category = 'Series'
GROUP BY m.id, m.title, m.genre, m.release_year, m.platform, m.status, 
         m.poster, m.overall_rating, m.overall_notes, m.latest_season_watched, 
         m.total_seasons_available, m.tmdb_id, m.created_at, m.updated_at, m.user_id;

-- Grant appropriate permissions on the view
GRANT SELECT ON public.series_with_seasons TO authenticated;

-- Drop the temporary function
DROP FUNCTION IF EXISTS extract_season_number(VARCHAR);

-- Final success message
DO $$
BEGIN
    RAISE NOTICE '✅ Series data migration completed successfully!';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Run the backend service to populate episode data from TMDB';
    RAISE NOTICE '2. Test the new season tracking functionality';
    RAISE NOTICE '3. Update the frontend to use the new API endpoints';
    RAISE NOTICE 'Backup table created: movies_backup_pre_season_migration';
END $$;
