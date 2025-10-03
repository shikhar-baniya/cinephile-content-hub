const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface UserStats {
  moviesWatchedCount: number;
  seriesWatchedCount: number;
  moviesRequired: number;
  seriesRequired: number;
  moviesRemaining: number;
  seriesRemaining: number;
  isUnlocked: boolean;
  progressPercentage: number;
  updatedAt: string;
}

export const userStatsService = {
  async getUserStats(): Promise<UserStats> {
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(`${API_URL}/api/user-stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user stats');
    }

    return response.json();
  },
};
