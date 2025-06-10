
import { Film, Star, Calendar, TrendingUp } from "lucide-react";
import { Movie } from "./MovieCard";

interface StatsCardsProps {
  movies: Movie[];
}

const StatsCards = ({ movies }: StatsCardsProps) => {
  const watchedMovies = movies.filter(m => m.status === "watched");
  const averageRating = watchedMovies.length > 0 
    ? (watchedMovies.reduce((acc, movie) => acc + movie.rating, 0) / watchedMovies.length).toFixed(1)
    : "0";
  
  const currentYear = new Date().getFullYear();
  const thisYearMovies = watchedMovies.filter(m => m.releaseYear === currentYear);
  
  const topGenre = movies.reduce((acc, movie) => {
    acc[movie.genre] = (acc[movie.genre] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const mostWatchedGenre = Object.entries(topGenre).sort(([,a], [,b]) => b - a)[0];

  const stats = [
    {
      title: "Total Movies",
      value: movies.length.toString(),
      icon: Film,
      description: `${watchedMovies.length} watched`,
      color: "text-blue-400"
    },
    {
      title: "Average Rating",
      value: averageRating,
      icon: Star,
      description: "out of 10",
      color: "text-yellow-400"
    },
    {
      title: "This Year",
      value: thisYearMovies.length.toString(),
      icon: Calendar,
      description: `${currentYear} releases`,
      color: "text-green-400"
    },
    {
      title: "Top Genre",
      value: mostWatchedGenre?.[0] || "None",
      icon: TrendingUp,
      description: `${mostWatchedGenre?.[1] || 0} movies`,
      color: "text-purple-400"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <div key={stat.title} className="floating-card rounded-xl p-4 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
          <div className="flex items-center justify-between mb-2">
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.title}</div>
            <div className="text-xs text-muted-foreground">{stat.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
