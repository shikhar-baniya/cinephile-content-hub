import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Movie } from "./MovieCard";
import { movieService } from "@/services/databaseService.api";
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
      poster: movie.poster || "",
      category: movie.type === "series" ? "Series" : "Movie"
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Movie title is required",
        variant: "destructive",
      });
      return;
    }

    if (formData.genre.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one genre",
        variant: "destructive",
      });
      return;
    }

    if (!formData.platform.trim()) {
      toast({
        title: "Error",
        description: "Platform is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const movieData: Omit<Movie, 'id'> = {
        title: formData.title.trim(),
        genre: formData.genre.join(", "),
        category: formData.category,
        releaseYear: formData.releaseYear,
        platform: formData.platform.trim(),
        rating: formData.rating,
        status: formData.status,
        poster: formData.poster,
        notes: formData.notes.trim() || undefined,
      };

      await movieService.addMovie(movieData);
      
      toast({
        title: "Success",
        description: `${formData.category} added successfully!`,
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

  const handleGenreChange = (genres: string[]) => {
    setFormData(prev => ({ ...prev, genre: genres }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New {formData.category}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search Movies/Series</Label>
            <MovieSearchInput onMovieSelect={handleMovieSelect} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter title..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Genre *</Label>
            <MultiSelectGenre 
              selectedGenres={formData.genre}
              onGenreChange={handleGenreChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value: Movie['category']) => 
                  setFormData(prev => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Movie">Movie</SelectItem>
                  <SelectItem value="Series">Series</SelectItem>
                  <SelectItem value="Short-Film">Short Film</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Release Year</Label>
              <Input
                id="year"
                type="number"
                value={formData.releaseYear}
                onChange={(e) => setFormData(prev => ({ ...prev, releaseYear: parseInt(e.target.value) || new Date().getFullYear() }))}
                min="1900"
                max={new Date().getFullYear() + 5}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="platform">Platform *</Label>
            <Input
              id="platform"
              value={formData.platform}
              onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value }))}
              placeholder="Netflix, Amazon Prime, etc."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rating">Rating (1-10)</Label>
              <Input
                id="rating"
                type="number"
                value={formData.rating}
                onChange={(e) => setFormData(prev => ({ ...prev, rating: parseFloat(e.target.value) || 5 }))}
                min="1"
                max="10"
                step="0.1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: Movie['status']) => 
                  setFormData(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="want-to-watch">Want to Watch</SelectItem>
                  <SelectItem value="watching">Currently Watching</SelectItem>
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
              onChange={(e) => setFormData(prev => ({ ...prev, poster: e.target.value }))}
              placeholder="https://..."
              type="url"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add your notes..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Adding..." : `Add ${formData.category}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMovieDialog;