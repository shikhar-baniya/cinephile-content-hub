
import { Button } from "@/components/ui/button";

interface GenreFilterBarProps {
  genres: string[];
  selectedGenre: string;
  onGenreSelect: (genre: string) => void;
}

const GenreFilterBar = ({ genres, selectedGenre, onGenreSelect }: GenreFilterBarProps) => {
  const allGenres = ["All", ...genres];

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide mb-6">
      {allGenres.map((genre) => (
        <Button
          key={genre}
          variant={selectedGenre === genre ? "default" : "outline"}
          size="sm"
          onClick={() => onGenreSelect(genre)}
          className={`whitespace-nowrap flex-shrink-0 ${
            selectedGenre === genre
              ? "bg-gradient-to-r from-primary via-purple-500 to-pink-500 text-white border-none"
              : "bg-card/50 border-border/60 text-muted-foreground hover:text-white"
          }`}
        >
          {genre}
        </Button>
      ))}
    </div>
  );
};

export default GenreFilterBar;
