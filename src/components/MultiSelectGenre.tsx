
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MultiSelectGenreProps {
  selectedGenres: string[];
  onGenreChange: (genres: string[]) => void;
  availableGenres: string[];
}

const MultiSelectGenre = ({ selectedGenres, onGenreChange, availableGenres }: MultiSelectGenreProps) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      onGenreChange(selectedGenres.filter(g => g !== genre));
    } else {
      onGenreChange([...selectedGenres, genre]);
    }
  };

  const removeGenre = (genre: string) => {
    onGenreChange(selectedGenres.filter(g => g !== genre));
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-background/50 border-border/60"
          >
            {selectedGenres.length === 0 
              ? "Select genres..." 
              : `${selectedGenres.length} genre${selectedGenres.length > 1 ? 's' : ''} selected`
            }
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 bg-card/95 backdrop-blur-lg border-border/40">
          <Command>
            <CommandInput placeholder="Search genres..." />
            <CommandList>
              <CommandEmpty>No genres found.</CommandEmpty>
              <CommandGroup>
                {availableGenres.map((genre) => (
                  <CommandItem
                    key={genre}
                    onSelect={() => handleSelect(genre)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedGenres.includes(genre) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {genre}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {selectedGenres.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedGenres.map((genre) => (
            <Badge key={genre} variant="secondary" className="text-sm">
              {genre}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0 text-muted-foreground hover:text-foreground"
                onClick={() => removeGenre(genre)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelectGenre;
