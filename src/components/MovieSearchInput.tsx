
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, X } from "lucide-react";

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

// Mock movie data - in a real app, this would come from an API like TMDB
const mockMovieData: MovieSearchResult[] = [
  { title: "The Matrix", year: 1999, genre: ["Sci-Fi", "Action"], type: "movie" },
  { title: "Inception", year: 2010, genre: ["Sci-Fi", "Thriller"], type: "movie" },
  { title: "Breaking Bad", year: 2008, genre: ["Crime", "Drama"], type: "series" },
  { title: "Game of Thrones", year: 2011, genre: ["Fantasy", "Drama"], type: "series" },
  { title: "The Dark Knight", year: 2008, genre: ["Action", "Crime"], type: "movie" },
  { title: "Stranger Things", year: 2016, genre: ["Sci-Fi", "Horror", "Drama"], type: "series" },
  { title: "Avengers: Endgame", year: 2019, genre: ["Action", "Adventure"], type: "movie" },
  { title: "The Office", year: 2005, genre: ["Comedy"], type: "series" },
  { title: "Pulp Fiction", year: 1994, genre: ["Crime", "Drama"], type: "movie" },
  { title: "Friends", year: 1994, genre: ["Comedy", "Romance"], type: "series" },
];

const MovieSearchInput = ({ value, onChange, onMovieSelect, placeholder = "Search for movies/series..." }: MovieSearchInputProps) => {
  const [open, setOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<MovieSearchResult[]>([]);

  useEffect(() => {
    if (value.length > 2) {
      // Filter mock data based on search query
      const filtered = mockMovieData.filter(movie =>
        movie.title.toLowerCase().includes(value.toLowerCase())
      );
      setSearchResults(filtered.slice(0, 5)); // Limit to 5 results
    } else {
      setSearchResults([]);
    }
  }, [value]);

  const handleSelect = (movie: MovieSearchResult) => {
    onChange(movie.title);
    setOpen(false);
    if (onMovieSelect) {
      onMovieSelect(movie);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="bg-background/50 border-border/60"
            onFocus={() => setOpen(true)}
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-card/95 backdrop-blur-lg border-border/40" align="start">
        <Command>
          <CommandList>
            {searchResults.length === 0 && value.length > 2 && (
              <CommandEmpty>No movies/series found.</CommandEmpty>
            )}
            {searchResults.length > 0 && (
              <CommandGroup>
                {searchResults.map((movie, index) => (
                  <CommandItem
                    key={index}
                    onSelect={() => handleSelect(movie)}
                    className="cursor-pointer"
                  >
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
