-- Database optimization migration

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_movies_user_id_status ON public.movies (user_id, status);
CREATE INDEX IF NOT EXISTS idx_movies_user_id_genre ON public.movies (user_id, genre);
CREATE INDEX IF NOT EXISTS idx_movies_user_id_category ON public.movies (user_id, category);
CREATE INDEX IF NOT EXISTS idx_movies_user_id_platform ON public.movies (user_id, platform);
CREATE INDEX IF NOT EXISTS idx_movies_user_id_created_at ON public.movies (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_movies_user_id_updated_at ON public.movies (user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_movies_user_id_release_year ON public.movies (user_id, release_year DESC);
CREATE INDEX IF NOT EXISTS idx_movies_user_id_rating ON public.movies (user_id, rating DESC);

-- Add full-text search index for title and notes
CREATE INDEX IF NOT EXISTS idx_movies_search ON public.movies 
USING gin(to_tsvector('english', title || ' ' || COALESCE(notes, '')));

-- Add composite indexes for common filter combinations
CREATE INDEX IF NOT EXISTS idx_movies_user_status_category ON public.movies (user_id, status, category);
CREATE INDEX IF NOT EXISTS idx_movies_user_genre_status ON public.movies (user_id, genre, status);

-- Add updated_at trigger for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_movies_updated_at ON public.movies;
CREATE TRIGGER update_movies_updated_at
    BEFORE UPDATE ON public.movies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add function for analytics data
CREATE OR REPLACE FUNCTION get_user_analytics(user_uuid UUID, time_range TEXT DEFAULT 'month')
RETURNS JSON AS $$
DECLARE
    result JSON;
    start_date TIMESTAMP;
BEGIN
    -- Calculate start date based on time range
    CASE time_range
        WHEN 'week' THEN start_date := NOW() - INTERVAL '7 days';
        WHEN 'month' THEN start_date := NOW() - INTERVAL '30 days';
        WHEN 'year' THEN start_date := NOW() - INTERVAL '365 days';
        ELSE start_date := NOW() - INTERVAL '30 days';
    END CASE;

    SELECT json_build_object(
        'total_movies', COUNT(*),
        'watched_movies', COUNT(*) FILTER (WHERE status = 'watched'),
        'watching_movies', COUNT(*) FILTER (WHERE status = 'watching'),
        'want_to_watch_movies', COUNT(*) FILTER (WHERE status = 'want-to-watch'),
        'average_rating', ROUND(AVG(rating) FILTER (WHERE status = 'watched'), 2),
        'movies_by_category', json_object_agg(category, category_count),
        'movies_by_genre', json_object_agg(genre, genre_count),
        'recent_activity', (
            SELECT json_agg(json_build_object(
                'date', DATE(created_at),
                'count', daily_count
            ) ORDER BY date DESC)
            FROM (
                SELECT DATE(created_at) as date, COUNT(*) as daily_count
                FROM public.movies
                WHERE user_id = user_uuid AND created_at >= start_date
                GROUP BY DATE(created_at)
                ORDER BY date DESC
                LIMIT 30
            ) daily_stats
        )
    ) INTO result
    FROM public.movies
    LEFT JOIN (
        SELECT category, COUNT(*) as category_count
        FROM public.movies
        WHERE user_id = user_uuid
        GROUP BY category
    ) cat_stats ON true
    LEFT JOIN (
        SELECT genre, COUNT(*) as genre_count
        FROM public.movies
        WHERE user_id = user_uuid
        GROUP BY genre
    ) genre_stats ON true
    WHERE user_id = user_uuid;

    RETURN COALESCE(result, '{}'::JSON);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function for duplicate detection
CREATE OR REPLACE FUNCTION check_duplicate_movie(
    user_uuid UUID,
    movie_title TEXT,
    movie_release_year INTEGER
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.movies
        WHERE user_id = user_uuid
        AND LOWER(title) = LOWER(movie_title)
        AND release_year = movie_release_year
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function for bulk operations
CREATE OR REPLACE FUNCTION bulk_update_movies(
    user_uuid UUID,
    movie_ids UUID[],
    updates JSON
) RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER := 0;
    movie_id UUID;
BEGIN
    FOREACH movie_id IN ARRAY movie_ids
    LOOP
        UPDATE public.movies
        SET
            status = COALESCE((updates->>'status')::TEXT, status),
            genre = COALESCE(updates->>'genre', genre),
            category = COALESCE(updates->>'category', category),
            platform = COALESCE(updates->>'platform', platform),
            rating = COALESCE((updates->>'rating')::INTEGER, rating),
            notes = COALESCE(updates->>'notes', notes),
            updated_at = NOW()
        WHERE id = movie_id AND user_id = user_uuid;
        
        IF FOUND THEN
            updated_count := updated_count + 1;
        END IF;
    END LOOP;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add materialized view for genre statistics (refreshed periodically)
CREATE MATERIALIZED VIEW IF NOT EXISTS genre_statistics AS
SELECT
    genre,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE status = 'watched') as watched_count,
    ROUND(AVG(rating) FILTER (WHERE status = 'watched'), 2) as avg_rating,
    MIN(release_year) as earliest_year,
    MAX(release_year) as latest_year
FROM public.movies
GROUP BY genre;

-- Create unique index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_genre_statistics_genre ON genre_statistics (genre);

-- Function to refresh genre statistics
CREATE OR REPLACE FUNCTION refresh_genre_statistics()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY genre_statistics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies for new functions
CREATE POLICY "Users can access their own analytics" ON public.movies
    FOR SELECT USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON genre_statistics TO authenticated;