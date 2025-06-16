import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search } from "lucide-react";
import { searchMoviesAndShows, formatMovieData, formatTVData } from "@/services/movieService";

interface MovieSearchResult {
  title: string;
  year: number;
  genre: string[];
  poster?: string;
  type: "movie" | "series";
}

interface MovieSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onMovieSelect?: (movie: MovieSearchResult) => void;
  placeholder?: string;
}

const MovieSearchInput = ({ value, onChange, onMovieSelect, placeholder = "Search for movies/series..." }: MovieSearchInputProps) => {
  const [open, setOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<MovieSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  const searchContent = useCallback(async (searchValue: string) => {
    if (searchValue.length < 3) {
      setSearchResults([]);
      setOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      console.log('Searching for:', searchValue);
      const { movies, shows } = await searchMoviesAndShows(searchValue);
      
      // Format and combine results
      const formattedMovies = movies.slice(0, 3).map(movie => ({
        title: movie.title,
        year: movie.release_date ? new Date(movie.release_date).getFullYear() : new Date().getFullYear(),
        genre: [formatMovieData(movie).genre],
        poster: formatMovieData(movie).poster || undefined,
        type: "movie" as const
      }));

      const formattedShows = shows.slice(0, 3).map(show => ({
        title: show.name,
        year: show.first_air_date ? new Date(show.first_air_date).getFullYear() : new Date().getFullYear(),
        genre: [formatTVData(show).genre],
        poster: formatTVData(show).poster || undefined,
        type: "series" as const
      }));

      const results = [...formattedMovies, ...formattedShows];
      console.log('Search results:', results);
      setSearchResults(results);
      
      if (results.length > 0) {
        setOpen(true);
      }
    } catch (error) {
      console.error('Error searching movies:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      searchContent(value);
    }, 300);

    // Cleanup function
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [value, searchContent]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  const handleSelect = (movie: MovieSearchResult) => {
    onChange(movie.title);
    setOpen(false);
    
    // Keep focus on input after selection
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
    
    if (onMovieSelect) {
      onMovieSelect(movie);
    }
  };

  const handleInputFocus = () => {
    if (value.length >= 3 && searchResults.length > 0) {
      setOpen(true);
    }
  };

  const handleInputBlur = () => {
    // Delay closing to allow for item selection
    setTimeout(() => {
      setOpen(false);
    }, 200);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            ref={inputRef}
            value={value}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            className="bg-background/50 border-border/60"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-full p-0 bg-card/95 backdrop-blur-lg border-border/40 z-50" 
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command>
          <CommandList>
            {isLoading && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Searching...
              </div>
            )}
            {!isLoading && searchResults.length === 0 && value.length >= 3 && (
              <CommandEmpty>No movies/series found.</CommandEmpty>
            )}
            {!isLoading && searchResults.length > 0 && (
              <CommandGroup>
                {searchResults.map((movie, index) => (
                  <CommandItem
                    key={`${movie.title}-${index}`}
                    onSelect={() => handleSelect(movie)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {movie.poster && (
                        <img 
                          src={movie.poster} 
                          alt={movie.title}
                          className="w-10 h-15 object-cover rounded"
                        />
                      )}
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{movie.title}</span>
                          <span className="text-sm text-muted-foreground">({movie.year})</span>
                          <Badge variant="outline" className="text-xs">
                            {movie.type}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          {movie.genre.slice(0, 2).map((g) => (
                            <Badge key={g} variant="secondary" className="text-xs">
                              {g}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default MovieSearchInput;
