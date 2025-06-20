import { Movie } from "@/components/MovieCard";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Handle empty responses (like DELETE requests)
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Auth methods
  async signUp(email: string, password: string) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async signIn(email: string, password: string) {
    return this.request('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async signOut() {
    return this.request('/auth/signout', {
      method: 'POST',
    });
  }

  async getUser() {
    return this.request('/auth/user');
  }

  async refreshToken(refreshToken: string) {
    return this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  async initiateGoogleAuth(origin: string) {
    return this.request('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ origin }),
    });
  }

  async handleGoogleCallback(code: string) {
    return this.request(`/auth/google/callback?code=${encodeURIComponent(code)}`);
  }

  // Movie methods
  async getMovies(): Promise<Movie[]> {
    return this.request<Movie[]>('/movies');
  }

  async addMovie(movieData: Omit<Movie, 'id'>): Promise<Movie> {
    return this.request<Movie>('/movies', {
      method: 'POST',
      body: JSON.stringify(movieData),
    });
  }

  async updateMovie(movieId: string, updates: Partial<Movie>): Promise<Movie> {
    return this.request<Movie>(`/movies/${movieId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteMovie(movieId: string): Promise<void> {
    await this.request<void>(`/movies/${movieId}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;