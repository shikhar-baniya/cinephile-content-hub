// Enhanced testing utilities
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';

// Mock data generators
export const createMockMovie = (overrides = {}) => ({
  id: Math.random().toString(36).substring(7),
  title: 'Test Movie',
  genre: 'Action',
  category: 'Movie' as const,
  releaseYear: 2024,
  platform: 'Netflix',
  rating: 8,
  status: 'watched' as const,
  poster: 'https://example.com/poster.jpg',
  notes: 'Great movie!',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockMovies = (count: number) => 
  Array.from({ length: count }, (_, i) => createMockMovie({
    id: `movie-${i}`,
    title: `Movie ${i + 1}`,
    rating: Math.floor(Math.random() * 10) + 1,
  }));

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Performance testing utilities
export const measureRenderTime = async (renderFn: () => void) => {
  const start = performance.now();
  renderFn();
  const end = performance.now();
  return end - start;
};

export const measureAsyncOperation = async <T,>(operation: () => Promise<T>): Promise<{
  result: T;
  duration: number;
}> => {
  const start = performance.now();
  const result = await operation();
  const end = performance.now();
  return { result, duration: end - start };
};

// Mock API responses
export const mockApiSuccess = <T,>(data: T, delay = 0) => 
  new Promise<T>(resolve => setTimeout(() => resolve(data), delay));

export const mockApiError = (message = 'API Error', status = 500, delay = 0) =>
  new Promise((_, reject) => 
    setTimeout(() => reject({ message, status }), delay)
  );

// Local Storage mocking
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => Object.keys(store).forEach(key => delete store[key]),
  };
};

// Network status mocking
export const mockNetworkStatus = (online = true) => {
  Object.defineProperty(navigator, 'onLine', {
    writable: true,
    value: online,
  });
  
  return {
    goOnline: () => {
      Object.defineProperty(navigator, 'onLine', { value: true });
      window.dispatchEvent(new Event('online'));
    },
    goOffline: () => {
      Object.defineProperty(navigator, 'onLine', { value: false });
      window.dispatchEvent(new Event('offline'));
    },
  };
};

// Intersection Observer mock
export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  });
  
  window.IntersectionObserver = mockIntersectionObserver;
  return mockIntersectionObserver;
};

// User event utilities
export const createMouseEvent = (type: string, options = {}) => 
  new MouseEvent(type, { bubbles: true, cancelable: true, ...options });

export const createKeyboardEvent = (type: string, key: string, options = {}) =>
  new KeyboardEvent(type, { bubbles: true, cancelable: true, key, ...options });

// Wait utilities
export const waitForNextTick = () => new Promise(resolve => setTimeout(resolve, 0));

export const waitForCondition = async (
  condition: () => boolean,
  timeout = 5000,
  interval = 100
) => {
  const start = Date.now();
  
  while (!condition() && Date.now() - start < timeout) {
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  if (!condition()) {
    throw new Error(`Condition not met within ${timeout}ms`);
  }
};

// Component testing helpers
export const getByTextContent = (container: HTMLElement, text: string) => {
  return Array.from(container.querySelectorAll('*')).find(
    element => element.textContent === text
  );
};

export const getAllByTextContent = (container: HTMLElement, text: string) => {
  return Array.from(container.querySelectorAll('*')).filter(
    element => element.textContent?.includes(text)
  );
};

// Export everything needed for testing
export * from '@testing-library/react';
export { customRender as render };