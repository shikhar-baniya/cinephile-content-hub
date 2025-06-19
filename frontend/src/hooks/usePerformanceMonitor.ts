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
      
      // Track slow renders silently
      if (process.env.NODE_ENV === 'development' && renderTime > 16) {
        // Slow render detected - handled silently
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
        // API call timing tracked silently
      }
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      // API call failed - error handled silently
      throw error;
    }
  };

  return { measureApiCall };
};