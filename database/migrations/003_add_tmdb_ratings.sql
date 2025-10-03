-- Migration: Add TMDB rating columns to series_seasons and series_episodes
-- This adds columns to store TMDB ratings separate from user ratings

-- Add tmdb_rating column to series_seasons
ALTER TABLE public.series_seasons
  ADD COLUMN IF NOT EXISTS tmdb_rating DECIMAL(3,1) CHECK (tmdb_rating >= 0 AND tmdb_rating <= 10);

-- Add tmdb_rating column to series_episodes
ALTER TABLE public.series_episodes
  ADD COLUMN IF NOT EXISTS tmdb_rating DECIMAL(3,1) CHECK (tmdb_rating >= 0 AND tmdb_rating <= 10);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_series_seasons_tmdb_rating ON public.series_seasons(tmdb_rating);
CREATE INDEX IF NOT EXISTS idx_series_episodes_tmdb_rating ON public.series_episodes(tmdb_rating);

-- Add helpful comments
COMMENT ON COLUMN public.series_seasons.tmdb_rating IS 'TMDB rating for this season (0-10 scale)';
COMMENT ON COLUMN public.series_episodes.tmdb_rating IS 'TMDB rating for this episode (0-10 scale)';
