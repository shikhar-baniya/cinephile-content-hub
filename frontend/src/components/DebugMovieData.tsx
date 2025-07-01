import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Movie } from "./MovieCard";
import { movieService } from "@/services/databaseService.api";

/**
 * Debug component to check what data we're receiving from backend
 */
const DebugMovieData = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const movieData = await movieService.getMovies();
        setMovies(movieData);
        
        // Also make a raw API call to see what the backend is sending
        const response = await fetch('http://localhost:3001/api/movies', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const raw = await response.json();
        setRawData(raw);
        
        console.log('🔍 Raw API Response:', raw);
        console.log('🔍 Processed Movies:', movieData);
        
      } catch (error) {
        console.error('Debug error:', error);
      }
    };
    
    loadData();
  }, []);

  const watchedMovies = movies.filter(m => m.status === 'watched');

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>🔍 Debug: Movie Data Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">Total Movies: {movies.length}</h3>
            <h3 className="font-semibold">Watched Movies: {watchedMovies.length}</h3>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Watched Movies with watchDate:</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {watchedMovies.map(movie => (
                <div key={movie.id} className="text-sm border p-2 rounded">
                  <div><strong>{movie.title}</strong></div>
                  <div>Status: {movie.status}</div>
                  <div>Watch Date: {movie.watchDate || 'NULL'}</div>
                  <div>Created: {movie.createdAt}</div>
                  <div>Updated: {movie.updatedAt}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Raw API Response Sample:</h4>
            <pre className="text-xs bg-gray-100 p-2 rounded max-h-40 overflow-y-auto">
              {JSON.stringify(rawData.slice(0, 2), null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DebugMovieData;