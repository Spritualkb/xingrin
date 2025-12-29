import { api } from '@/lib/api-client'
import type { DashboardStats, AssetStatistics, StatisticsHistoryItem } from '@/types/dashboard.types'

export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await api.get<DashboardStats>('/dashboard/stats/')
  return res.data
}

/**
 * Get asset statistics data (pre-aggregated)
 */
export async function getAssetStatistics(): Promise<AssetStatistics> {
  const res = await api.get<AssetStatistics>('/assets/statistics/')
  return res.data
}

/**
 * Get statistics history data (for line charts)
 */
export async function getStatisticsHistory(days: number = 7): Promise<StatisticsHistoryItem[]> {
  const res = await api.get<StatisticsHistoryItem[]>('/assets/statistics/history/', {
    params: { days }
  })
  return res.data
}
