import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query'
import { useMemo } from 'react'

// Optimized query hook with built-in performance enhancements
export function useOptimizedQuery<TData, TError = Error>(
  queryKey: unknown[],
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'> & {
    // Enhanced performance options
    enableBackground?: boolean
    enablePersistence?: boolean
    debounceMs?: number
  }
): UseQueryResult<TData, TError> {

  // Optimize query key to prevent unnecessary re-renders
  const optimizedQueryKey = useMemo(() => queryKey, [JSON.stringify(queryKey)])

  return useQuery<TData, TError>({
    queryKey: optimizedQueryKey,
    queryFn: queryFn,
    // Performance optimizations
    staleTime: options?.enableBackground ? 5 * 60 * 1000 : 30 * 1000, // 5min background / 30s foreground
    gcTime: options?.enablePersistence ? 30 * 60 * 1000 : 5 * 60 * 1000, // 30min persistent / 5min default
    retry: (failureCount, error) => {
      // Smart retry logic
      if (failureCount < 2) return true
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as any).status
        // Don't retry client errors (4xx)
        if (status >= 400 && status < 500) return false
      }
      return failureCount < 3
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Network mode optimization
    networkMode: 'online',
    // Refetch optimizations
    refetchOnWindowFocus: false,
    refetchOnMount: 'always',
    refetchOnReconnect: 'always',
    // Error boundary integration
    throwOnError: false,
    ...options
  })
}

// Optimized mutation hook with performance enhancements
export function useOptimizedMutation<TData, TError = Error, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void
    onError?: (error: TError, variables: TVariables) => void
    invalidateQueries?: string[]
    optimisticUpdate?: boolean
  }
) {
  // Implementation would go here for mutation optimization
  // This is a placeholder for the concept
}

// Query cache optimization utilities
export const queryOptimizations = {
  // Prefetch critical data
  prefetchCriticalData: (queryClient: any) => {
    queryClient.prefetchQuery({
      queryKey: ['dashboard', 'kpis'],
      queryFn: () => fetch('/api/v1/dashboard/kpis').then(res => res.json()),
      staleTime: 2 * 60 * 1000 // 2 minutes
    })
  },

  // Background sync for offline support
  backgroundSync: {
    enableOfflineSupport: true,
    syncInterval: 30000, // 30 seconds
    maxRetries: 3
  },

  // Memory optimization
  memoryOptimization: {
    maxCacheSize: 50 * 1024 * 1024, // 50MB
    cleanupInterval: 5 * 60 * 1000, // 5 minutes
    enableCompression: true
  }
}

// Performance monitoring
export const performanceMonitor = {
  // Track query performance
  trackQueryPerformance: (queryKey: string, duration: number) => {
    if (duration > 3000) { // Slow query threshold
      console.warn(`Slow query detected: ${queryKey} took ${duration}ms`)
    }
  },

  // Memory usage tracking
  trackMemoryUsage: () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      }
    }
    return null
  },

  // Bundle size analysis
  analyzeBundle: () => {
    return {
      loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
      domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
      firstPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime || 0
    }
  }
}