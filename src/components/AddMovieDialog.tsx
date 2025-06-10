
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Movie } from "./MovieCard";

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
      <DialogContent className="sm:max-w-[425px] bg-card/95 backdrop-blur-lg border-border/40">
        <DialogHeader>
          <DialogTitle className="gradient-text">Add New Movie</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter movie title"
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
            <Label htmlFor="poster">Poster URL (optional)</Label>
            <Input
              id="poster"
              value={formData.poster}
              onChange={(e) => setFormData({ ...formData, poster: e.target.value })}
              placeholder="https://example.com/poster.jpg"
              className="bg-background/50 border-border/60"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
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
              Add Movie
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMovieDialog;
