// Performance monitoring hook
import { useEffect, useRef } from 'react';
import { usePerformanceStore } from '@/lib/store.enhanced';

export const usePerformanceMonitor = (componentName: string) => {
  const renderStartTime = useRef<number>();
  const { addRenderTime } = usePerformanceStore();

  useEffect(() => {
    renderStartTime.current = performance.now();
  });

  useEffect(() => {
    if (renderStartTime.current) {
      const renderTime = performance.now() - renderStartTime.current;
      addRenderTime(renderTime);
      
      // Log slow renders in development
      if (process.env.NODE_ENV === 'development' && renderTime > 16) {
        console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
    }
  });

  const measureApiCall = async <T>(
    apiCall: () => Promise<T>,
    operationName: string
  ): Promise<T> => {
    const startTime = performance.now();
    try {
      const result = await apiCall();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      usePerformanceStore.getState().addApiCallTime(duration);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`API call ${operationName}: ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      console.error(`API call ${operationName} failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  };

  return { measureApiCall };
};