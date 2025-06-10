
import { Film, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddMovie: () => void;
}

const Header = ({ searchQuery, onSearchChange, onAddMovie }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 glass-effect">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Film className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold gradient-text">CineTracker</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search movies and series..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 bg-background/50 border-border/60 focus:border-primary/50"
              />
            </div>
            <Button onClick={onAddMovie} className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Movie
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
