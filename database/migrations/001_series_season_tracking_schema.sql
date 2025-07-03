-- Migration: Series Season Tracking Architecture
-- This creates the new tables for granular series/season/episode tracking
-- Run this in your Supabase SQL Editor

-- Create series_seasons table
CREATE TABLE IF NOT EXISTS public.series_seasons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    series_id UUID REFERENCES public.movies(id) ON DELETE CASCADE,
    season_number INTEGER NOT NULL,
    season_name VARCHAR(100), -- e.g., "Season 1", "Final Season", "Book 1"
    episode_count INTEGER DEFAULT 0,
    episodes_watched INTEGER DEFAULT 0,
    status VARCHAR(50) CHECK (status IN ('not-started', 'watching', 'completed', 'dropped', 'want-to-watch')) DEFAULT 'not-started',
    watch_date DATE, -- Date when season was completed
    started_date DATE, -- Date when first episode was watched
    rating DECIMAL(3,1) CHECK (rating >= 0 AND rating <= 10),
    notes TEXT,
    tmdb_season_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    
    -- Ensure unique season per series
    UNIQUE(series_id, season_number)
);

-- Create series_episodes table for detailed episode tracking
CREATE TABLE IF NOT EXISTS public.series_episodes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    season_id UUID REFERENCES public.series_seasons(id) ON DELETE CASCADE,
    episode_number INTEGER NOT NULL,
    episode_name VARCHAR(255),
    watched BOOLEAN DEFAULT FALSE,
    watch_date DATE,
    rating DECIMAL(3,1) CHECK (rating >= 0 AND rating <= 10),
    notes TEXT,
    duration_minutes INTEGER,
    tmdb_episode_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    
    -- Ensure unique episode per season
    UNIQUE(season_id, episode_number)
);

-- Add new columns to movies table for enhanced series tracking
DO $$ 
BEGIN
    -- Add latest_season_watched column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='movies' AND column_name='latest_season_watched') THEN
        ALTER TABLE public.movies ADD COLUMN latest_season_watched INTEGER DEFAULT NULL;
    END IF;
    
    -- Add total_seasons_available column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='movies' AND column_name='total_seasons_available') THEN
        ALTER TABLE public.movies ADD COLUMN total_seasons_available INTEGER DEFAULT NULL;
    END IF;
    
    -- Add overall_rating column if it doesn't exist (separate from individual season ratings)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='movies' AND column_name='overall_rating') THEN
        ALTER TABLE public.movies ADD COLUMN overall_rating DECIMAL(3,1) CHECK (overall_rating >= 0 AND overall_rating <= 10);
    END IF;
    
    -- Add overall_notes column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='movies' AND column_name='overall_notes') THEN
        ALTER TABLE public.movies ADD COLUMN overall_notes TEXT;
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_series_seasons_series_id ON public.series_seasons(series_id);
CREATE INDEX IF NOT EXISTS idx_series_seasons_status ON public.series_seasons(status);
CREATE INDEX IF NOT EXISTS idx_series_seasons_watch_date ON public.series_seasons(watch_date);
CREATE INDEX IF NOT EXISTS idx_series_seasons_season_number ON public.series_seasons(season_number);

CREATE INDEX IF NOT EXISTS idx_series_episodes_season_id ON public.series_episodes(season_id);
CREATE INDEX IF NOT EXISTS idx_series_episodes_watched ON public.series_episodes(watched);
CREATE INDEX IF NOT EXISTS idx_series_episodes_watch_date ON public.series_episodes(watch_date);
CREATE INDEX IF NOT EXISTS idx_series_episodes_episode_number ON public.series_episodes(episode_number);

CREATE INDEX IF NOT EXISTS idx_movies_latest_season ON public.movies(latest_season_watched);
CREATE INDEX IF NOT EXISTS idx_movies_total_seasons ON public.movies(total_seasons_available);

-- Enable Row Level Security for new tables
ALTER TABLE public.series_seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series_episodes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for series_seasons
CREATE POLICY "Users can only see their own series seasons" ON public.series_seasons
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.movies 
            WHERE movies.id = series_seasons.series_id 
            AND movies.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can only insert their own series seasons" ON public.series_seasons
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.movies 
            WHERE movies.id = series_seasons.series_id 
            AND movies.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can only update their own series seasons" ON public.series_seasons
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.movies 
            WHERE movies.id = series_seasons.series_id 
            AND movies.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can only delete their own series seasons" ON public.series_seasons
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.movies 
            WHERE movies.id = series_seasons.series_id 
            AND movies.user_id = auth.uid()
        )
    );

-- Create RLS policies for series_episodes
CREATE POLICY "Users can only see their own series episodes" ON public.series_episodes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.series_seasons ss
            JOIN public.movies m ON m.id = ss.series_id
            WHERE ss.id = series_episodes.season_id 
            AND m.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can only insert their own series episodes" ON public.series_episodes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.series_seasons ss
            JOIN public.movies m ON m.id = ss.series_id
            WHERE ss.id = series_episodes.season_id 
            AND m.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can only update their own series episodes" ON public.series_episodes
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.series_seasons ss
            JOIN public.movies m ON m.id = ss.series_id
            WHERE ss.id = series_episodes.season_id 
            AND m.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can only delete their own series episodes" ON public.series_episodes
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.series_seasons ss
            JOIN public.movies m ON m.id = ss.series_id
            WHERE ss.id = series_episodes.season_id 
            AND m.user_id = auth.uid()
        )
    );

-- Create triggers to automatically update updated_at timestamp
CREATE TRIGGER update_series_seasons_updated_at
    BEFORE UPDATE ON public.series_seasons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_series_episodes_updated_at
    BEFORE UPDATE ON public.series_episodes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically update episodes_watched count when episodes are marked as watched
CREATE OR REPLACE FUNCTION update_season_episode_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update episodes_watched count in series_seasons
    UPDATE public.series_seasons 
    SET episodes_watched = (
        SELECT COUNT(*) 
        FROM public.series_episodes 
        WHERE season_id = COALESCE(NEW.season_id, OLD.season_id) 
        AND watched = true
    ),
    -- Auto-update season status based on progress
    status = CASE 
        WHEN (SELECT COUNT(*) FROM public.series_episodes WHERE season_id = COALESCE(NEW.season_id, OLD.season_id) AND watched = true) = 0 THEN 'not-started'
        WHEN (SELECT COUNT(*) FROM public.series_episodes WHERE season_id = COALESCE(NEW.season_id, OLD.season_id) AND watched = true) = 
             (SELECT COUNT(*) FROM public.series_episodes WHERE season_id = COALESCE(NEW.season_id, OLD.season_id)) THEN 'completed'
        ELSE 'watching'
    END,
    -- Set watch_date when season is completed
    watch_date = CASE 
        WHEN (SELECT COUNT(*) FROM public.series_episodes WHERE season_id = COALESCE(NEW.season_id, OLD.season_id) AND watched = true) = 
             (SELECT COUNT(*) FROM public.series_episodes WHERE season_id = COALESCE(NEW.season_id, OLD.season_id)) 
        THEN COALESCE(NEW.watch_date, CURRENT_DATE)
        ELSE watch_date
    END,
    -- Set started_date when first episode is watched
    started_date = CASE 
        WHEN started_date IS NULL AND (SELECT COUNT(*) FROM public.series_episodes WHERE season_id = COALESCE(NEW.season_id, OLD.season_id) AND watched = true) > 0 
        THEN COALESCE(NEW.watch_date, CURRENT_DATE)
        ELSE started_date
    END
    WHERE id = COALESCE(NEW.season_id, OLD.season_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create trigger for episode watch updates
CREATE TRIGGER update_season_on_episode_watch
    AFTER INSERT OR UPDATE OR DELETE ON public.series_episodes
    FOR EACH ROW
    EXECUTE FUNCTION update_season_episode_count();

-- Function to update series-level information when seasons are updated
CREATE OR REPLACE FUNCTION update_series_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- Update latest_season_watched and overall status in movies table
    UPDATE public.movies 
    SET 
        latest_season_watched = (
            SELECT MAX(season_number) 
            FROM public.series_seasons 
            WHERE series_id = COALESCE(NEW.series_id, OLD.series_id) 
            AND status = 'completed'
        ),
        -- Update series status based on season progress
        status = CASE 
            WHEN (SELECT COUNT(*) FROM public.series_seasons WHERE series_id = COALESCE(NEW.series_id, OLD.series_id) AND status = 'completed') = 0 THEN 'want-to-watch'
            WHEN (SELECT COUNT(*) FROM public.series_seasons WHERE series_id = COALESCE(NEW.series_id, OLD.series_id) AND status IN ('completed', 'watching')) > 0 
                 AND (SELECT COUNT(*) FROM public.series_seasons WHERE series_id = COALESCE(NEW.series_id, OLD.series_id) AND status != 'completed') > 0 THEN 'watching'
            WHEN (SELECT COUNT(*) FROM public.series_seasons WHERE series_id = COALESCE(NEW.series_id, OLD.series_id) AND status != 'completed') = 0 THEN 'watched'
            ELSE status
        END,
        -- Update watch_date to latest completed season date
        watch_date = (
            SELECT MAX(watch_date) 
            FROM public.series_seasons 
            WHERE series_id = COALESCE(NEW.series_id, OLD.series_id) 
            AND status = 'completed'
            AND watch_date IS NOT NULL
        )
    WHERE id = COALESCE(NEW.series_id, OLD.series_id) 
    AND category = 'Series';
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create trigger for series progress updates
CREATE TRIGGER update_series_on_season_change
    AFTER INSERT OR UPDATE OR DELETE ON public.series_seasons
    FOR EACH ROW
    EXECUTE FUNCTION update_series_progress();

-- Add helpful comments
COMMENT ON TABLE public.series_seasons IS 'Tracks individual seasons of TV series with detailed progress and ratings';
COMMENT ON TABLE public.series_episodes IS 'Tracks individual episodes within seasons for granular viewing progress';
COMMENT ON COLUMN public.movies.latest_season_watched IS 'Highest season number that has been completed';
COMMENT ON COLUMN public.movies.total_seasons_available IS 'Total number of seasons available (from TMDB data)';
COMMENT ON COLUMN public.movies.overall_rating IS 'Overall rating for the entire series (separate from individual season ratings)';
COMMENT ON COLUMN public.movies.overall_notes IS 'Overall notes for the entire series';

-- Show created tables structure
SELECT 'series_seasons' as table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'series_seasons' 
UNION ALL
SELECT 'series_episodes' as table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'series_episodes'
ORDER BY table_name, ordinal_position;
