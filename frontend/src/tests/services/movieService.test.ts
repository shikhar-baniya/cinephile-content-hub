import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchMoviesAndShows, getImageUrl, getGenreName } from '@/services/movieService';

describe('movieService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('searchMoviesAndShows', () => {
    it('should fetch and return movies and shows', async () => {
      const mockMovieResponse = {
        results: [
          {
            id: 1,
            title: 'Test Movie',
            overview: 'Test overview',
            release_date: '2024-01-01',
            poster_path: '/test.jpg',
            genre_ids: [28],
            vote_average: 8.5,
          },
        ],
      };

      const mockTVResponse = {
        results: [
          {
            id: 2,
            name: 'Test Show',
            overview: 'Test overview',
            first_air_date: '2024-01-01',
            poster_path: '/test.jpg',
            genre_ids: [18],
            vote_average: 8.0,
          },
        ],
      };

      global.fetch = vi.fn()
        .mockImplementationOnce(() => Promise.resolve({
          json: () => Promise.resolve(mockMovieResponse),
        }))
        .mockImplementationOnce(() => Promise.resolve({
          json: () => Promise.resolve(mockTVResponse),
        }));

      const result = await searchMoviesAndShows('test');

      expect(result.movies).toHaveLength(1);
      expect(result.shows).toHaveLength(1);
      expect(result.movies[0].title).toBe('Test Movie');
      expect(result.shows[0].name).toBe('Test Show');
    });

    it('should handle API errors gracefully', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('API Error'));

      const result = await searchMoviesAndShows('test');

      expect(result.movies).toHaveLength(0);
      expect(result.shows).toHaveLength(0);
    });
  });

  describe('getImageUrl', () => {
    it('should return correct image URL', () => {
      const posterPath = '/test.jpg';
      const url = getImageUrl(posterPath);
      expect(url).toBe('https://image.tmdb.org/t/p/w500/test.jpg');
    });

    it('should return null for null poster path', () => {
      const url = getImageUrl(null);
      expect(url).toBeNull();
    });
  });

  describe('getGenreName', () => {
    it('should return correct genre name', () => {
      const genreName = getGenreName([28]);
      expect(genreName).toBe('Action');
    });

    it('should return Unknown for empty genre ids', () => {
      const genreName = getGenreName([]);
      expect(genreName).toBe('Unknown');
    });

    it('should return Unknown for invalid genre id', () => {
      const genreName = getGenreName([999]);
      expect(genreName).toBe('Unknown');
    });
  });
}); 