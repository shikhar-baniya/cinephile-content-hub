import { apiClient } from '@/services/apiClient';

export const debugBackend = {
  async testBackendConnection() {
    try {
      // Test health endpoint
      const healthResponse = await fetch(`${apiClient.baseURL.replace('/api', '')}/health`);
      
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
      }

      // Test movies endpoint (should work)
      const moviesResponse = await fetch(`${apiClient.baseURL}/movies`, {
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (moviesResponse.ok) {
        const moviesData = await moviesResponse.json();
      } else {
        const errorText = await moviesResponse.text();
      }

    } catch (error) {
      // Connection test failed
    }
  },

  async testSeriesEndpoint(seriesId: string) {
    try {
      // Test debug endpoint first
      const debugResponse = await fetch(`${apiClient.baseURL}/debug/series/${seriesId}`, {
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (debugResponse.ok) {
        const debugData = await debugResponse.json();
      } else {
        const errorText = await debugResponse.text();
      }
      
      // Test series seasons endpoint
      const seasonsResponse = await fetch(`${apiClient.baseURL}/series/${seriesId}/seasons`, {
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (seasonsResponse.ok) {
        const seasonsData = await seasonsResponse.json();
      } else {
        const errorText = await seasonsResponse.text();
      }

      // Test series overview endpoint
      const overviewResponse = await fetch(`${apiClient.baseURL}/series/${seriesId}/overview`, {
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (overviewResponse.ok) {
        const overviewData = await overviewResponse.json();
      } else {
        const errorText = await overviewResponse.text();
      }

    } catch (error) {
      // Series endpoint test failed
    }
  },

  async getAllSeriesDebugInfo() {
    try {
      const response = await fetch(`${apiClient.baseURL}/debug/series`, {
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        const errorText = await response.text();
      }

    } catch (error) {
      // All series debug test failed
    }
  }
};

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).debugBackend = debugBackend;
}
