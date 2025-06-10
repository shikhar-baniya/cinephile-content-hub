
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2 } from "lucide-react";
import { Movie } from "./MovieCard";
import { searchMoviesAndShows, formatMovieData, formatTVData, TMDbMovie, TMDbTVShow } from "@/services/movieService";

interface AddMovieDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddMovie: (movie: Omit<Movie, 'id'>) => void;
}

const AddMovieDialog = ({ open, onOpenChange, onAddMovie }: AddMovieDialogProps) => {
  const [formData, setFormData] = useState({
    title: "",
    genre: "",
    releaseYear: new Date().getFullYear(),
    platform: "",
    rating: 5,
    status: "want-to-watch" as Movie['status'],
    poster: "",
    notes: ""
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{movies: TMDbMovie[], shows: TMDbTVShow[]}>({ movies: [], shows: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-search when user types
  useEffect(() => {
    if (searchQuery.length > 2) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      searchTimeoutRef.current = setTimeout(async () => {
        setIsSearching(true);
        const results = await searchMoviesAndShows(searchQuery);
        setSearchResults(results);
        setIsSearching(false);
        setShowResults(true);
      }, 500);
    } else {
      setShowResults(false);
      setSearchResults({ movies: [], shows: [] });
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleSelectMovie = (movie: TMDbMovie) => {
    const movieData = formatMovieData(movie);
    setFormData({
      ...formData,
      ...movieData
    });
    setSearchQuery(movie.title);
    setShowResults(false);
  };

  const handleSelectShow = (show: TMDbTVShow) => {
    const showData = formatTVData(show);
    setFormData({
      ...formData,
      ...showData
    });
    setSearchQuery(show.name);
    setShowResults(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.genre || !formData.platform) return;
    
    onAddMovie(formData);
    setFormData({
      title: "",
      genre: "",
      releaseYear: new Date().getFullYear(),
      platform: "",
      rating: 5,
      status: "want-to-watch",
      poster: "",
      notes: ""
    });
    setSearchQuery("");
    setShowResults(false);
    onOpenChange(false);
  };

  const genres = [
    "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary",
    "Drama", "Family", "Fantasy", "Horror", "Mystery", "Romance",
    "Sci-Fi", "Thriller", "War", "Western"
  ];

  const platforms = [
    "Netflix", "Prime Video", "Disney+", "HBO Max", "Hulu", "Apple TV+",
    "Paramount+", "Peacock", "Cinema", "DVD/Blu-ray", "Other"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-lg border-border/40 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="gradient-text">Add New Movie/Series</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Search Box */}
          <div className="space-y-2">
            <Label htmlFor="search">Search Movie/Series</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for movies or TV shows..."
                className="pl-10 bg-background/50 border-border/60"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Search Results */}
          {showResults && (searchResults.movies.length > 0 || searchResults.shows.length > 0) && (
            <div className="max-h-48 overflow-y-auto space-y-2 border border-border/60 rounded-lg p-3 bg-background/30">
              <Label className="text-sm font-medium">Search Results</Label>
              
              {searchResults.movies.slice(0, 3).map((movie) => (
                <div
                  key={`movie-${movie.id}`}
                  className="flex items-center gap-3 p-2 rounded-lg bg-card/50 hover:bg-card/70 cursor-pointer transition-colors"
                  onClick={() => handleSelectMovie(movie)}
                >
                  {movie.poster_path && (
                    <img
                      src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                      alt={movie.title}
                      className="w-12 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{movie.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {movie.release_date ? new Date(movie.release_date).getFullYear() : ''} • Movie
                    </p>
                    <Badge variant="outline" className="text-xs mt-1">
                      ★ {movie.vote_average.toFixed(1)}
                    </Badge>
                  </div>
                </div>
              ))}

              {searchResults.shows.slice(0, 3).map((show) => (
                <div
                  key={`show-${show.id}`}
                  className="flex items-center gap-3 p-2 rounded-lg bg-card/50 hover:bg-card/70 cursor-pointer transition-colors"
                  onClick={() => handleSelectShow(show)}
                >
                  {show.poster_path && (
                    <img
                      src={`https://image.tmdb.org/t/p/w92${show.poster_path}`}
                      alt={show.name}
                      className="w-12 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{show.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {show.first_air_date ? new Date(show.first_air_date).getFullYear() : ''} • TV Series
                    </p>
                    <Badge variant="outline" className="text-xs mt-1">
                      ★ {show.vote_average.toFixed(1)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Manual Form Fields */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter movie/series title"
              className="bg-background/50 border-border/60"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="genre">Genre *</Label>
              <Select value={formData.genre} onValueChange={(value) => setFormData({ ...formData, genre: value })}>
                <SelectTrigger className="bg-background/50 border-border/60">
                  <SelectValue placeholder="Select genre" />
                </SelectTrigger>
                <SelectContent className="bg-card/95 backdrop-blur-lg border-border/40">
                  {genres.map((genre) => (
                    <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Release Year</Label>
              <Input
                id="year"
                type="number"
                value={formData.releaseYear}
                onChange={(e) => setFormData({ ...formData, releaseYear: parseInt(e.target.value) })}
                className="bg-background/50 border-border/60"
                min="1900"
                max={new Date().getFullYear() + 5}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="platform">Platform *</Label>
            <Select value={formData.platform} onValueChange={(value) => setFormData({ ...formData, platform: value })}>
              <SelectTrigger className="bg-background/50 border-border/60">
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent className="bg-card/95 backdrop-blur-lg border-border/40">
                {platforms.map((platform) => (
                  <SelectItem key={platform} value={platform}>{platform}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rating">Rating (1-10)</Label>
              <Input
                id="rating"
                type="number"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                className="bg-background/50 border-border/60"
                min="1"
                max="10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as Movie['status'] })}>
                <SelectTrigger className="bg-background/50 border-border/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card/95 backdrop-blur-lg border-border/40">
                  <SelectItem value="want-to-watch">Want to Watch</SelectItem>
                  <SelectItem value="watching">Watching</SelectItem>
                  <SelectItem value="watched">Watched</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="poster">Poster URL</Label>
            <Input
              id="poster"
              value={formData.poster}
              onChange={(e) => setFormData({ ...formData, poster: e.target.value })}
              placeholder="Auto-filled from search or enter manually"
              className="bg-background/50 border-border/60"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes/Review</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Your thoughts, review, or notes..."
              className="bg-background/50 border-border/60 resize-none"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Add to Collection
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMovieDialog;
