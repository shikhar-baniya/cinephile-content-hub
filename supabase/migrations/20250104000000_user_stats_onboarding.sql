-- Create user_stats table to track watched content counts for onboarding
CREATE TABLE IF NOT EXISTS public.user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  movies_watched_count INTEGER DEFAULT 0 NOT NULL,
  series_watched_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own stats" 
  ON public.user_stats 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats" 
  ON public.user_stats 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" 
  ON public.user_stats 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Function to update user stats when movies are added/updated
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update user_stats
  INSERT INTO public.user_stats (user_id, movies_watched_count, series_watched_count, updated_at)
  VALUES (
    NEW.user_id,
    (SELECT COUNT(*) FROM public.movies WHERE user_id = NEW.user_id AND status = 'watched' AND category = 'Movie'),
    (SELECT COUNT(*) FROM public.movies WHERE user_id = NEW.user_id AND status = 'watched' AND category = 'Series'),
    now()
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    movies_watched_count = (SELECT COUNT(*) FROM public.movies WHERE user_id = NEW.user_id AND status = 'watched' AND category = 'Movie'),
    series_watched_count = (SELECT COUNT(*) FROM public.movies WHERE user_id = NEW.user_id AND status = 'watched' AND category = 'Series'),
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on movies table
DROP TRIGGER IF EXISTS trigger_update_user_stats ON public.movies;
CREATE TRIGGER trigger_update_user_stats
  AFTER INSERT OR UPDATE OF status, category
  ON public.movies
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats();

-- Populate existing user stats for current users
INSERT INTO public.user_stats (user_id, movies_watched_count, series_watched_count)
SELECT 
  user_id,
  COUNT(*) FILTER (WHERE status = 'watched' AND category = 'Movie') as movies_watched_count,
  COUNT(*) FILTER (WHERE status = 'watched' AND category = 'Series') as series_watched_count
FROM public.movies
GROUP BY user_id
ON CONFLICT (user_id) DO NOTHING;
