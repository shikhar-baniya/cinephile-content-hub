-- Test Script: Verify Series Season Tracking Migration
-- Run this script to test the migration with sample data
-- This creates test data and verifies all functionality works correctly

-- Create test user and sample data for testing
DO $$
DECLARE
    test_user_id UUID;
    test_series_id UUID;
    test_season_id UUID;
    test_episode_id UUID;
BEGIN
    -- Note: In production, you'll use real auth.uid(), this is just for testing
    -- You may need to replace this with an actual user ID from your auth.users table
    
    RAISE NOTICE 'Testing Series Season Tracking Migration...';
    
    -- Check if tables exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'series_seasons') THEN
        RAISE EXCEPTION 'series_seasons table not found! Run migration scripts first.';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'series_episodes') THEN
        RAISE EXCEPTION 'series_episodes table not found! Run migration scripts first.';
    END IF;
    
    RAISE NOTICE '✅ All required tables exist';
    
    -- Test 1: Create a test series
    INSERT INTO public.movies (
        user_id,
        title,
        genre,
        category,
        release_year,
        platform,
        rating,
        status,
        poster,
        notes,
        tmdb_id
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', -- Test user ID
        'Test Series - Breaking Bad',
        'Drama, Crime',
        'Series',
        2008,
        'Netflix',
        9.5,
        'watching',
        'https://example.com/poster.jpg',
        'Test series for migration',
        1396
    ) RETURNING id INTO test_series_id;
    
    RAISE NOTICE '✅ Test series created with ID: %', test_series_id;
    
    -- Test 2: Create seasons for the test series
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
        notes
    ) VALUES 
        (test_series_id, 1, 'Season 1', 7, 7, 'completed', '2024-01-15', '2024-01-10', 9.0, 'Amazing first season'),
        (test_series_id, 2, 'Season 2', 13, 5, 'watching', NULL, '2024-01-16', NULL, 'Currently watching'),
        (test_series_id, 3, 'Season 3', 13, 0, 'want-to-watch', NULL, NULL, NULL, 'Haven''t started yet')
    RETURNING id INTO test_season_id;
    
    RAISE NOTICE '✅ Test seasons created';
    
    -- Test 3: Create episodes for Season 1 (completed)
    WITH season1 AS (
        SELECT id FROM public.series_seasons 
        WHERE series_id = test_series_id AND season_number = 1
    )
    INSERT INTO public.series_episodes (
        season_id,
        episode_number,
        episode_name,
        watched,
        watch_date,
        rating
    ) 
    SELECT 
        season1.id,
        generate_series(1, 7),
        'Episode ' || generate_series(1, 7),
        true,
        '2024-01-' || (9 + generate_series(1, 7)),
        8.5 + (random() * 1.5)
    FROM season1;
    
    -- Test 4: Create some episodes for Season 2 (partially watched)
    WITH season2 AS (
        SELECT id FROM public.series_seasons 
        WHERE series_id = test_series_id AND season_number = 2
    )
    INSERT INTO public.series_episodes (
        season_id,
        episode_number,
        episode_name,
        watched,
        watch_date,
        rating
    ) 
    SELECT 
        season2.id,
        generate_series(1, 13),
        'Episode ' || generate_series(1, 13),
        CASE WHEN generate_series(1, 13) <= 5 THEN true ELSE false END,
        CASE WHEN generate_series(1, 13) <= 5 THEN '2024-01-' || (15 + generate_series(1, 13)) ELSE NULL END,
        CASE WHEN generate_series(1, 13) <= 5 THEN 8.0 + (random() * 2.0) ELSE NULL END
    FROM season2;
    
    RAISE NOTICE '✅ Test episodes created';
    
    -- Test 5: Verify triggers are working correctly
    -- The triggers should have automatically updated the season and series status
    
    -- Wait a moment for triggers to process
    PERFORM pg_sleep(0.1);
    
    RAISE NOTICE 'Testing trigger functionality...';
    
END $$;

-- Verification Queries
RAISE NOTICE 'Running verification queries...';

-- Test Query 1: Check series-level aggregation
SELECT 
    '1. Series Level Data' as test_name,
    m.title,
    m.status as series_status,
    m.latest_season_watched,
    m.watch_date as series_watch_date,
    m.overall_rating
FROM public.movies m
WHERE m.title = 'Test Series - Breaking Bad';

-- Test Query 2: Check season-level data
SELECT 
    '2. Season Level Data' as test_name,
    ss.season_number,
    ss.season_name,
    ss.status as season_status,
    ss.episodes_watched,
    ss.episode_count,
    ss.watch_date as season_watch_date,
    ss.rating as season_rating
FROM public.series_seasons ss
JOIN public.movies m ON m.id = ss.series_id
WHERE m.title = 'Test Series - Breaking Bad'
ORDER BY ss.season_number;

-- Test Query 3: Check episode-level data
SELECT 
    '3. Episode Level Data' as test_name,
    ss.season_number,
    se.episode_number,
    se.episode_name,
    se.watched,
    se.watch_date,
    se.rating
FROM public.series_episodes se
JOIN public.series_seasons ss ON ss.id = se.season_id
JOIN public.movies m ON m.id = ss.series_id
WHERE m.title = 'Test Series - Breaking Bad'
ORDER BY ss.season_number, se.episode_number;

-- Test Query 4: Check the new view
SELECT 
    '4. Series with Seasons View' as test_name,
    title,
    series_status,
    total_seasons_tracked,
    completed_seasons,
    watching_seasons,
    want_to_watch_seasons,
    total_episodes_watched,
    total_episodes_available,
    latest_season_completion_date,
    average_season_rating
FROM public.series_with_seasons
WHERE title = 'Test Series - Breaking Bad';

-- Test Query 5: Test trigger functionality by updating an episode
DO $$
DECLARE
    episode_id UUID;
BEGIN
    -- Mark an unwatched episode as watched to test triggers
    SELECT se.id INTO episode_id
    FROM public.series_episodes se
    JOIN public.series_seasons ss ON ss.id = se.season_id
    JOIN public.movies m ON m.id = ss.series_id
    WHERE m.title = 'Test Series - Breaking Bad' 
    AND ss.season_number = 2 
    AND se.watched = false
    LIMIT 1;
    
    IF episode_id IS NOT NULL THEN
        UPDATE public.series_episodes 
        SET watched = true, watch_date = CURRENT_DATE
        WHERE id = episode_id;
        
        RAISE NOTICE '✅ Trigger test: Marked episode as watched';
    END IF;
END $$;

-- Test Query 6: Verify trigger updated season data
SELECT 
    '5. Trigger Test Results' as test_name,
    ss.season_number,
    ss.episodes_watched,
    ss.status,
    COUNT(se.id) FILTER (WHERE se.watched = true) as actual_watched_episodes
FROM public.series_seasons ss
JOIN public.series_episodes se ON se.season_id = ss.id
JOIN public.movies m ON m.id = ss.series_id
WHERE m.title = 'Test Series - Breaking Bad'
GROUP BY ss.season_number, ss.episodes_watched, ss.status
ORDER BY ss.season_number;

-- Performance Test: Check query performance with indexes
EXPLAIN (ANALYZE, BUFFERS) 
SELECT 
    m.title,
    ss.season_number,
    COUNT(se.id) as total_episodes,
    COUNT(CASE WHEN se.watched THEN 1 END) as watched_episodes
FROM public.movies m
JOIN public.series_seasons ss ON m.id = ss.series_id
JOIN public.series_episodes se ON ss.id = se.season_id
WHERE m.category = 'Series'
GROUP BY m.title, ss.season_number;

-- Cleanup test data (optional - uncomment to clean up)
-- DELETE FROM public.movies WHERE title = 'Test Series - Breaking Bad';

DO $$
BEGIN
    RAISE NOTICE '🎉 MIGRATION TEST COMPLETED!';
    RAISE NOTICE 'If all queries returned expected results, the migration is working correctly.';
    RAISE NOTICE 'Check the query results above to verify:';
    RAISE NOTICE '- Series status and dates are properly updated';
    RAISE NOTICE '- Season progress is tracked correctly';
    RAISE NOTICE '- Episode watching updates season/series automatically';
    RAISE NOTICE '- Views and triggers are functioning properly';
    RAISE NOTICE '';
    RAISE NOTICE 'To clean up test data, run:';
    RAISE NOTICE 'DELETE FROM public.movies WHERE title = ''Test Series - Breaking Bad'';';
END $$;
