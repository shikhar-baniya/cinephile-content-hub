
-- Create movies table to store user's movie collection
CREATE TABLE public.movies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  genre TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Movie', 'Series', 'Short-Film')),
  release_year INTEGER NOT NULL,
  platform TEXT NOT NULL,
  rating DECIMAL(3,1) NOT NULL CHECK (rating >= 0 AND rating <= 10),
  status TEXT NOT NULL CHECK (status IN ('watched', 'watching', 'want-to-watch')),
  poster TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure users can only see their own movies
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to SELECT their own movies
CREATE POLICY "Users can view their own movies" 
  ON public.movies 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to INSERT their own movies
CREATE POLICY "Users can create their own movies" 
  ON public.movies 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to UPDATE their own movies
CREATE POLICY "Users can update their own movies" 
  ON public.movies 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy that allows users to DELETE their own movies
CREATE POLICY "Users can delete their own movies" 
  ON public.movies 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create unique constraint to prevent duplicate movies for the same user
CREATE UNIQUE INDEX unique_user_movie ON public.movies (user_id, title, release_year);
