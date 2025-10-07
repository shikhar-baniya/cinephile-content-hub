import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { searchMoviesAndShows, formatMovieData, formatTVData, fetchTVShowDetails } from "@/services/movieService";

interface MovieSearchResult {
    title: string;
    year: number;
    genre: string[];
    poster?: string;
    type: "movie" | "series";
    id?: number;
    rating?: number;
    seasons?: { season_number: number; name: string; poster_path?: string; vote_average?: number }[];
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
    const dropdownRef = useRef<HTMLDivElement>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout>();

    const searchContent = useCallback(async (searchValue: string) => {
        if (searchValue.length < 3) {
            setSearchResults([]);
            setOpen(false);
            return;
        }

        setIsLoading(true);
        try {
            const { movies, shows } = await searchMoviesAndShows(searchValue);

            const formattedMovies = movies.slice(0, 3).map(movie => {
                const movieData = formatMovieData(movie);
                return {
                    title: movie.title,
                    year: movie.release_date ? new Date(movie.release_date).getFullYear() : new Date().getFullYear(),
                    genre: movieData.genres,
                    poster: movieData.poster || undefined,
                    rating: movieData.rating,
                    type: "movie" as const,
                    id: movie.id
                };
            });

            const formattedShows = shows.slice(0, 3).map(show => {
                const showData = formatTVData(show);
                return {
                    title: show.name,
                    year: show.first_air_date ? new Date(show.first_air_date).getFullYear() : new Date().getFullYear(),
                    genre: showData.genres,
                    poster: showData.poster || undefined,
                    rating: showData.rating,
                    type: "series" as const,
                    id: show.id
                };
            });

            const results = [...formattedMovies, ...formattedShows];
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
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            searchContent(value);
        }, 300);

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [value, searchContent]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        onChange(newValue);
    };

    const handleSelect = async (movie: MovieSearchResult) => {
        setOpen(false);
        setSearchResults([]);

        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }, 100);

        if (onMovieSelect) {
            if (movie.type === "series" && movie.id) {
                try {
                    const details = await fetchTVShowDetails(movie.id);

                    if (!details) {
                        console.error('No details received from API');
                        onChange(movie.title);
                        onMovieSelect(movie);
                        return;
                    }

                    const seasons = details?.seasons?.map((s: any) => ({
                        season_number: s.season_number,
                        name: s.name || `Season ${s.season_number}`,
                        poster_path: s.poster_path,
                        vote_average: s.vote_average
                    })) || [];

                    const movieWithSeasons = { ...movie, seasons };
                    onChange(movie.title);
                    onMovieSelect(movieWithSeasons);
                } catch (error) {
                    console.error('Error fetching TV show details:', error);
                    onChange(movie.title);
                    onMovieSelect(movie);
                }
            } else {
                onChange(movie.title);
                onMovieSelect(movie);
            }
        }
    };

    const handleInputFocus = () => {
        if (value.length >= 3 && searchResults.length > 0) {
            setOpen(true);
        }
    };

    return (
        <div className="relative w-full">
            <div className="relative">
                <Input
                    ref={inputRef}
                    value={value}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    placeholder={placeholder}
                    className="bg-background/50 border-border/60"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>

            {open && (
                <div
                    ref={dropdownRef}
                    className="absolute z-50 w-full mt-2 bg-card/95 backdrop-blur-lg border border-border/40 rounded-lg shadow-lg"
                    style={{
                        maxHeight: '300px',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        WebkitOverflowScrolling: 'touch',
                        msOverflowStyle: 'auto',
                        scrollbarWidth: 'thin'
                    }}
                >
                    {isLoading && (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                            Searching...
                        </div>
                    )}

                    {!isLoading && searchResults.length === 0 && value.length >= 3 && (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                            No movies/series found.
                        </div>
                    )}

                    {!isLoading && searchResults.length > 0 && (
                        <div className="py-2">
                            {searchResults.map((movie, index) => (
                                <div
                                    key={`${movie.title}-${index}`}
                                    onClick={() => handleSelect(movie)}
                                    className="cursor-pointer p-3 hover:bg-accent/50 transition-colors"
                                    style={{ touchAction: 'manipulation' }}
                                >
                                    <div className="flex items-center gap-3 w-full">
                                        {movie.poster && (
                                            <img
                                                src={movie.poster}
                                                alt={movie.title}
                                                className="w-10 h-15 object-cover rounded flex-shrink-0"
                                            />
                                        )}
                                        <div className="flex flex-col gap-1 min-w-0 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-medium truncate">{movie.title}</span>
                                                <span className="text-sm text-muted-foreground flex-shrink-0">({movie.year})</span>
                                                <Badge variant="outline" className="text-xs flex-shrink-0">
                                                    {movie.type}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-1 flex-wrap">
                                                {movie.genre.slice(0, 2).map((g) => (
                                                    <Badge key={g} variant="secondary" className="text-xs">
                                                        {g}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MovieSearchInput;
