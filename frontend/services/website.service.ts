import { api } from "@/lib/api-client"

// Bulk create websites response type
export interface BulkCreateWebsitesResponse {
  message: string
  createdCount: number
}

/**
 * Website related API service
 * All frontend website interface calls should be centralized here
 */
export class WebsiteService {
  /**
   * Bulk create websites (bind to target)
   * POST /api/targets/{target_id}/websites/bulk-create/
   */
  static async bulkCreateWebsites(
    targetId: number,
    urls: string[]
  ): Promise<BulkCreateWebsitesResponse> {
    const response = await api.post<BulkCreateWebsitesResponse>(
      `/targets/${targetId}/websites/bulk-create/`,
      { urls }
    )
    return response.data
  }

  /** Export all website URLs by target (text file, one per line) */
  static async exportWebsitesByTargetId(targetId: number): Promise<Blob> {
    const response = await api.get<Blob>(`/targets/${targetId}/websites/export/`, {
      responseType: "blob",
    })
    return response.data
  }

  /** Export all website URLs by scan task (text file, one per line) */
  static async exportWebsitesByScanId(scanId: number): Promise<Blob> {
    const response = await api.get<Blob>(`/scans/${scanId}/websites/export/`, {
      responseType: "blob",
    })
    return response.data
  }
}
