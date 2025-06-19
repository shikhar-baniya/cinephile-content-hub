
import { Button } from "@/components/ui/button";

interface GenreFilterBarProps {
  genres: string[];
  selectedGenre: string;
  onGenreSelect: (genre: string) => void;
}

const GenreFilterBar = ({ genres, selectedGenre, onGenreSelect }: GenreFilterBarProps) => {
  const allGenres = ["All", ...genres];

  const handleGenreClick = (genre: string) => {
    try {
      onGenreSelect(genre);
    } catch (error) {
      console.error("Error selecting genre:", error);
    }
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide mb-6">
      {allGenres.map((genre) => (
        <Button
          key={genre}
          variant={selectedGenre === genre ? "default" : "outline"}
          size="sm"
          onClick={() => handleGenreClick(genre)}
          className={`whitespace-nowrap flex-shrink-0 transition-all duration-200 ${
            selectedGenre === genre
              ? "bg-gradient-to-r from-primary via-purple-500 to-pink-500 text-white border-none shadow-lg"
              : "bg-card/50 border-border/60 text-muted-foreground hover:text-white hover:bg-gradient-to-r hover:from-primary/20 hover:via-purple-500/20 hover:to-pink-500/20"
          }`}
        >
          {genre}
        </Button>
      ))}
    </div>
  );
};

export default GenreFilterBar;
