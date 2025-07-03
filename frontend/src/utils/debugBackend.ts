import { apiClient } from '@/services/apiClient';

export const debugBackend = {
  async testBackendConnection() {
    try {
      console.log('Testing backend connection...');
      console.log('Backend URL:', apiClient.baseURL);
      console.log('Auth token:', apiClient.getToken() ? 'Present' : 'Missing');

      // Test health endpoint
      const healthResponse = await fetch(`${apiClient.baseURL.replace('/api', '')}/health`);
      console.log('Health check status:', healthResponse.status);
      
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        console.log('Health check data:', healthData);
      }

      // Test movies endpoint (should work)
      const moviesResponse = await fetch(`${apiClient.baseURL}/movies`, {
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('Movies endpoint status:', moviesResponse.status);

      if (moviesResponse.ok) {
        const moviesData = await moviesResponse.json();
        console.log('Movies data length:', moviesData.length);
        console.log('First few movies:', moviesData.slice(0, 3));
      } else {
        const errorText = await moviesResponse.text();
        console.error('Movies endpoint error:', errorText);
      }

    } catch (error) {
      console.error('Backend connection test failed:', error);
    }
  },

  async testSeriesEndpoint(seriesId: string) {
    try {
      console.log('Testing series endpoint for ID:', seriesId);
      
      // Test debug endpoint first
      const debugResponse = await fetch(`${apiClient.baseURL}/debug/series/${seriesId}`, {
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Debug endpoint status:', debugResponse.status);
      
      if (debugResponse.ok) {
        const debugData = await debugResponse.json();
        console.log('Debug data:', debugData);
      } else {
        const errorText = await debugResponse.text();
        console.error('Debug endpoint error:', errorText);
      }
      
      // Test series seasons endpoint
      const seasonsResponse = await fetch(`${apiClient.baseURL}/series/${seriesId}/seasons`, {
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Series seasons endpoint status:', seasonsResponse.status);
      
      if (seasonsResponse.ok) {
        const seasonsData = await seasonsResponse.json();
        console.log('Seasons data:', seasonsData);
      } else {
        const errorText = await seasonsResponse.text();
        console.error('Series seasons error:', errorText);
      }

      // Test series overview endpoint
      const overviewResponse = await fetch(`${apiClient.baseURL}/series/${seriesId}/overview`, {
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Series overview endpoint status:', overviewResponse.status);
      
      if (overviewResponse.ok) {
        const overviewData = await overviewResponse.json();
        console.log('Overview data:', overviewData);
      } else {
        const errorText = await overviewResponse.text();
        console.error('Series overview error:', errorText);
      }

    } catch (error) {
      console.error('Series endpoint test failed:', error);
    }
  },

  async getAllSeriesDebugInfo() {
    try {
      console.log('Getting debug info for all series...');
      
      const response = await fetch(`${apiClient.baseURL}/debug/series`, {
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('All series debug status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('All series debug data:', data);
        return data;
      } else {
        const errorText = await response.text();
        console.error('All series debug error:', errorText);
      }

    } catch (error) {
      console.error('All series debug test failed:', error);
    }
  }
};

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).debugBackend = debugBackend;
}
