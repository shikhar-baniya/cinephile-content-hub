-- Migration to add enhancement features
-- Run this in your Supabase SQL Editor

-- Add new columns to movies table
DO $$ 
BEGIN
    -- Add tmdb_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='movies' AND column_name='tmdb_id') THEN
        ALTER TABLE public.movies ADD COLUMN tmdb_id INTEGER;
    END IF;
    
    -- Add watch_date column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='movies' AND column_name='watch_date') THEN
        ALTER TABLE public.movies ADD COLUMN watch_date DATE;
    END IF;
    
    -- Add season column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='movies' AND column_name='season') THEN
        ALTER TABLE public.movies ADD COLUMN season VARCHAR(50);
    END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_movies_tmdb_id ON public.movies(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_movies_watch_date ON public.movies(watch_date);
CREATE INDEX IF NOT EXISTS idx_movies_season ON public.movies(season);
CREATE INDEX IF NOT EXISTS idx_movies_rating ON public.movies(rating);
CREATE INDEX IF NOT EXISTS idx_movies_release_year ON public.movies(release_year);

-- Add comments to document the columns
COMMENT ON COLUMN public.movies.tmdb_id IS 'The Movie Database (TMDB) ID for fetching additional data and seasons';
COMMENT ON COLUMN public.movies.watch_date IS 'Date when the movie/series was watched (only for watched status)';
COMMENT ON COLUMN public.movies.season IS 'Season information for TV series (e.g., "Season 1", "S1", "1")';

-- Create or update movies table if it doesn't exist (for new installations)
CREATE TABLE IF NOT EXISTS public.movies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    genre VARCHAR(255),
    category VARCHAR(50) CHECK (category IN ('Movie', 'Series', 'Short-Film')),
    release_year INTEGER,
    platform VARCHAR(100),
    rating DECIMAL(3,1) CHECK (rating >= 0 AND rating <= 10),
    status VARCHAR(50) CHECK (status IN ('watched', 'watching', 'want-to-watch')),
    poster TEXT,
    notes TEXT,
    season VARCHAR(50),
    tmdb_id INTEGER,
    watch_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Ensure Row Level Security is enabled
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies if they don't exist
DO $$
BEGIN
    -- Drop existing policies if they exist (to recreate them)
    DROP POLICY IF EXISTS "Users can only see their own movies" ON public.movies;
    DROP POLICY IF EXISTS "Users can only insert their own movies" ON public.movies;
    DROP POLICY IF EXISTS "Users can only update their own movies" ON public.movies;
    DROP POLICY IF EXISTS "Users can only delete their own movies" ON public.movies;
    
    -- Create new policies
    CREATE POLICY "Users can only see their own movies" ON public.movies
        FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can only insert their own movies" ON public.movies
        FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can only update their own movies" ON public.movies
        FOR UPDATE USING (auth.uid() = user_id);

    CREATE POLICY "Users can only delete their own movies" ON public.movies
        FOR DELETE USING (auth.uid() = user_id);
END $$;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_movies_updated_at ON public.movies;
CREATE TRIGGER update_movies_updated_at
    BEFORE UPDATE ON public.movies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add constraint to ensure watch_date is only set for watched movies (optional)
-- Uncomment the following if you want to enforce this constraint
-- ALTER TABLE public.movies ADD CONSTRAINT check_watch_date_for_watched 
--     CHECK (status != 'watched' OR watch_date IS NOT NULL);

-- Sample data update (uncomment if you want to set watch_date for existing watched movies)
-- UPDATE public.movies 
-- SET watch_date = CURRENT_DATE 
-- WHERE status = 'watched' AND watch_date IS NULL;

-- Show table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'movies' 
ORDER BY ordinal_position;