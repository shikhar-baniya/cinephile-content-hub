// Virtual scrolling hook for large lists
import { useMemo, useState, useEffect, useCallback } from 'react';

interface UseVirtualizationProps {
  itemCount: number;
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export const useVirtualization = ({
  itemCount,
  itemHeight,
  containerHeight,
  overscan = 5,
}: UseVirtualizationProps) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight),
      itemCount - 1
    );

    const visibleStartIndex = Math.max(0, startIndex - overscan);
    const visibleEndIndex = Math.min(itemCount - 1, endIndex + overscan);

    return {
      startIndex: visibleStartIndex,
      endIndex: visibleEndIndex,
      items: Array.from(
        { length: visibleEndIndex - visibleStartIndex + 1 },
        (_, index) => visibleStartIndex + index
      ),
    };
  }, [scrollTop, itemHeight, containerHeight, itemCount, overscan]);

  const totalHeight = itemCount * itemHeight;
  const offsetY = visibleItems.startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems: visibleItems.items,
    totalHeight,
    offsetY,
    handleScroll,
  };
};