
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Movie } from "./MovieCard";
import { movieService } from "@/services/databaseService";
import { useToast } from "@/components/ui/use-toast";
import MovieSearchInput from "./MovieSearchInput";
import MultiSelectGenre from "./MultiSelectGenre";

interface MovieSearchResult {
  title: string;
  year: number;
  genre: string[];
  poster?: string;
  type: "movie" | "series";
}

interface AddMovieDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddMovie: () => void;
}

const AddMovieDialog = ({ open, onOpenChange, onAddMovie }: AddMovieDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    genre: [] as string[],
    category: "Movie" as Movie['category'],
    releaseYear: new Date().getFullYear(),
    platform: "",
    rating: 5,
    status: "want-to-watch" as Movie['status'],
    poster: "",
    notes: "",
    season: ""
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setFormData({
        title: "",
        genre: [],
        category: "Movie",
        releaseYear: new Date().getFullYear(),
        platform: "",
        rating: 5,
        status: "want-to-watch",
        poster: "",
        notes: "",
        season: ""
      });
    }
  }, [open]);

  const handleMovieSelect = (movie: MovieSearchResult) => {
    setFormData(prev => ({
      ...prev,
      title: movie.title,
      genre: movie.genre,
      releaseYear: movie.year,
      category: movie.type === "movie" ? "Movie" : "Series",
      poster: movie.poster || ""
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    
    if (!formData.title.trim() || formData.genre.length === 0 || !formData.platform) {
      console.log('Form validation failed:', { title: formData.title, genre: formData.genre, platform: formData.platform });
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Title, Genre, Platform)",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const movieWithTimestamp = {
        ...formData,
        genre: formData.genre.join(", "), // Convert array to comma-separated string
        createdAt: new Date().toISOString()
      };
      
      await movieService.addMovie(movieWithTimestamp);
      
      toast({
        title: "Success",
        description: "Movie added to your collection!",
      });
      
      onAddMovie();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error adding movie:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add movie. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <MovieSearchInput
              value={formData.title}
              onChange={(value) => setFormData({ ...formData, title: value })}
              onMovieSelect={handleMovieSelect}
              placeholder="Search for movies/series on TMDB..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value as Movie['category'] })}>
                <SelectTrigger className="bg-background/50 border-border/60">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-card/95 backdrop-blur-lg border-border/40">
                  <SelectItem value="Movie">Movie</SelectItem>
                  <SelectItem value="Series">Series</SelectItem>
                  <SelectItem value="Short-Film">Short Film</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.category === "Series" && (
              <div className="space-y-2">
                <Label htmlFor="season">Season</Label>
                <Input
                  id="season"
                  value={formData.season}
                  onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                  placeholder="e.g., Season 1, S1"
                  className="bg-background/50 border-border/60"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="genre">Genres *</Label>
            <MultiSelectGenre
              selectedGenres={formData.genre}
              onGenreChange={(genres) => setFormData({ ...formData, genre: genres })}
              availableGenres={genres}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              placeholder="Enter poster image URL"
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add to Collection"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMovieDialog;
