import { useState, useCallback, useMemo } from 'react';

interface PaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  pageSizes?: number[];
}

interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

interface PaginationControls {
  goToPage: (page: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  changePageSize: (size: number) => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

export function usePagination(
  totalItems: number,
  options: PaginationOptions = {}
): PaginationState & PaginationControls {
  const {
    initialPage = 0,
    initialPageSize = 20,
    pageSizes = [10, 20, 50, 100]
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Calculate derived state
  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / pageSize);
  }, [totalItems, pageSize]);

  const canGoNext = useMemo(() => {
    return currentPage < totalPages - 1;
  }, [currentPage, totalPages]);

  const canGoPrevious = useMemo(() => {
    return currentPage > 0;
  }, [currentPage]);

  // Navigation functions
  const goToPage = useCallback((page: number) => {
    const clampedPage = Math.max(0, Math.min(page, totalPages - 1));
    setCurrentPage(clampedPage);
  }, [totalPages]);

  const goToNextPage = useCallback(() => {
    if (canGoNext) {
      setCurrentPage(prev => prev + 1);
    }
  }, [canGoNext]);

  const goToPreviousPage = useCallback(() => {
    if (canGoPrevious) {
      setCurrentPage(prev => prev - 1);
    }
  }, [canGoPrevious]);

  const goToFirstPage = useCallback(() => {
    setCurrentPage(0);
  }, []);

  const goToLastPage = useCallback(() => {
    setCurrentPage(totalPages - 1);
  }, [totalPages]);

  const changePageSize = useCallback((size: number) => {
    const newPageSize = pageSizes.includes(size) ? size : initialPageSize;
    setPageSize(newPageSize);

    // Adjust current page to maintain approximate position
    const currentPosition = currentPage * pageSize;
    const newPage = Math.floor(currentPosition / newPageSize);
    setCurrentPage(Math.max(0, newPage));
  }, [currentPage, pageSize, pageSizes, initialPageSize]);

  // Reset pagination when total items changes significantly
  useState(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  });

  return {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    changePageSize,
    canGoNext,
    canGoPrevious
  };
}

// Hook for managing infinite scroll pagination
interface InfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
}

export function useInfiniteScroll(
  callback: () => void,
  options: InfiniteScrollOptions = {}
) {
  const { threshold = 0.1, rootMargin = '0px' } = options;

  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const lastElementRef = useCallback((node: HTMLElement | null) => {
    if (isFetching || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsFetching(true);
          callback();
        }
      },
      { threshold, rootMargin }
    );

    if (node) observer.observe(node);

    return () => {
      if (node) observer.unobserve(node);
    };
  }, [callback, isFetching, hasMore, threshold, rootMargin]);

  const resetInfiniteScroll = useCallback(() => {
    setIsFetching(false);
    setHasMore(true);
  }, []);

  const stopInfiniteScroll = useCallback(() => {
    setHasMore(false);
    setIsFetching(false);
  }, []);

  return {
    lastElementRef,
    isFetching,
    hasMore,
    setIsFetching,
    setHasMore,
    resetInfiniteScroll,
    stopInfiniteScroll
  };
}

// Hook for table sorting
interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export function useSorting<T>(
  data: T[],
  initialSortKey?: keyof T,
  initialDirection: 'asc' | 'desc' = 'asc'
) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(
    initialSortKey ? { key: initialSortKey as string, direction: initialDirection } : null
  );

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aVal = (a as any)[sortConfig.key];
      const bVal = (b as any)[sortConfig.key];

      if (aVal < bVal) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aVal > bVal) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  const handleSort = useCallback((key: string) => {
    setSortConfig(prevConfig => {
      if (prevConfig && prevConfig.key === key) {
        // Toggle direction if same key
        return {
          key,
          direction: prevConfig.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      // New key, default to ascending
      return { key, direction: 'asc' };
    });
  }, []);

  const clearSort = useCallback(() => {
    setSortConfig(null);
  }, []);

  return {
    sortedData,
    sortConfig,
    handleSort,
    clearSort
  };
}