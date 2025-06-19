import React, { useState, useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  aspectRatio?: 'square' | 'video' | 'portrait';
  className?: string;
  priority?: boolean;
  blurDataURL?: string;
  sizes?: string;
  quality?: number;
}

const aspectRatioClasses = {
  square: 'aspect-square',
  video: 'aspect-video',
  portrait: 'aspect-[3/4]',
};

// Image size optimization based on viewport
const getOptimizedImageUrl = (src: string, width: number, quality: number = 75): string => {
  if (!src || src.startsWith('data:') || src.startsWith('blob:')) return src;
  
  // For TMDb images, use their sizing
  if (src.includes('image.tmdb.org')) {
    const sizeMap = {
      154: 'w154',
      185: 'w185',
      342: 'w342',
      500: 'w500',
      780: 'w780',
    };
    
    const closestSize = Object.keys(sizeMap)
      .map(Number)
      .reduce((prev, curr) => 
        Math.abs(curr - width) < Math.abs(prev - width) ? curr : prev
      );
    
    return src.replace(/w\d+/, sizeMap[closestSize as keyof typeof sizeMap]);
  }
  
  return src;
};

// Intersection Observer for lazy loading
const useIntersectionObserver = (
  elementRef: React.RefObject<HTMLElement>,
  { threshold = 0.1, rootMargin = '50px' } = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return isIntersecting;
};

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  fallbackSrc = '/placeholder-image.jpg',
  aspectRatio = 'portrait',
  className,
  priority = false,
  blurDataURL,
  sizes,
  quality = 75,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(containerRef);
  
  // Calculate optimal image size based on container
  const [containerWidth, setContainerWidth] = useState(300);
  
  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        const { width } = entries[0].contentRect;
        setContainerWidth(width);
      });
      
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  // Optimized src URL
  const optimizedSrc = useMemo(() => 
    getOptimizedImageUrl(src, containerWidth * (window.devicePixelRatio || 1), quality),
    [src, containerWidth, quality]
  );

  // Load image when visible or priority
  useEffect(() => {
    if (priority || isVisible) {
      setCurrentSrc(optimizedSrc);
    }
  }, [priority, isVisible, optimizedSrc]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setError(false); // Reset error state when trying fallback
    } else {
      setError(true);
      setIsLoading(false);
    }
  };

  // Blur placeholder effect
  const blurPlaceholder = blurDataURL || 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkrHBEf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==';

  return (
    <div 
      ref={containerRef}
      className={cn('relative overflow-hidden', aspectRatioClasses[aspectRatio], className)}
    >
      {/* Blur placeholder */}
      {isLoading && blurDataURL && (
        <img
          src={blurPlaceholder}
          alt=""
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-sm"
          aria-hidden="true"
        />
      )}
      
      {/* Loading skeleton */}
      {isLoading && !blurDataURL && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
      )}
      
      {/* Main image */}
      {currentSrc && (
        <img
          src={currentSrc}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100'
          )}
          {...props}
        />
      )}
      
      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
          <div className="text-center">
            <div className="text-2xl mb-2">🖼️</div>
            <div className="text-xs">Image not available</div>
          </div>
        </div>
      )}
    </div>
  );
}; 