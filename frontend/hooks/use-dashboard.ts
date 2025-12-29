import { useQuery } from '@tanstack/react-query'
import { getDashboardStats, getAssetStatistics, getStatisticsHistory } from '@/services/dashboard.service'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => getDashboardStats(),
  })
}

/**
 * Get asset statistics data (pre-aggregated)
 */
export function useAssetStatistics() {
  return useQuery({
    queryKey: ['asset', 'statistics'],
    queryFn: getAssetStatistics,
  })
}

/**
 * Get statistics history data (for line charts)
 */
export function useStatisticsHistory(days: number = 7) {
  return useQuery({
    queryKey: ['asset', 'statistics', 'history', days],
    queryFn: () => getStatisticsHistory(days),
  })
}
