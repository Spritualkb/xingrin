/**
 * Fingerprint management API service
 */

import apiClient from "@/lib/api-client"
import type { PaginatedResponse } from "@/types/api-response.types"
import type { 
  EholeFingerprint,
  GobyFingerprint,
  WappalyzerFingerprint,
  FingersFingerprint,
  FingerPrintHubFingerprint,
  ARLFingerprint,
  BatchCreateResponse, 
  BulkDeleteResponse,
  FingerprintStats 
} from "@/types/fingerprint.types"

// Paginated query parameters
interface QueryParams {
  page?: number
  pageSize?: number
  filter?: string
}

export const FingerprintService = {
  // ==================== EHole ====================
  
  /**
   * Get EHole fingerprint list
   */
  async getEholeFingerprints(params: QueryParams = {}): Promise<PaginatedResponse<EholeFingerprint>> {
    const response = await apiClient.get("/fingerprints/ehole/", { params })
    return response.data
  },

  /**
   * Get EHole fingerprint details
   */
  async getEholeFingerprint(id: number): Promise<EholeFingerprint> {
    const response = await apiClient.get(`/fingerprints/ehole/${id}/`)
    return response.data
  },

  /**
   * Create single EHole fingerprint
   */
  async createEholeFingerprint(data: Omit<EholeFingerprint, 'id' | 'createdAt'>): Promise<EholeFingerprint> {
    const response = await apiClient.post("/fingerprints/ehole/", data)
    return response.data
  },

  /**
   * Update EHole fingerprint
   */
  async updateEholeFingerprint(id: number, data: Partial<EholeFingerprint>): Promise<EholeFingerprint> {
    const response = await apiClient.put(`/fingerprints/ehole/${id}/`, data)
    return response.data
  },

  /**
   * Delete single EHole fingerprint
   */
  async deleteEholeFingerprint(id: number): Promise<void> {
    await apiClient.delete(`/fingerprints/ehole/${id}/`)
  },

  /**
   * Batch create EHole fingerprints
   */
  async batchCreateEholeFingerprints(fingerprints: Omit<EholeFingerprint, 'id' | 'createdAt'>[]): Promise<BatchCreateResponse> {
    const response = await apiClient.post("/fingerprints/ehole/batch_create/", { fingerprints })
    return response.data
  },

  /**
   * File import EHole fingerprints
   */
  async importEholeFingerprints(file: File): Promise<BatchCreateResponse> {
    const formData = new FormData()
    formData.append("file", file)
    const response = await apiClient.post("/fingerprints/ehole/import_file/", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    })
    return response.data
  },

  /**
   * Bulk delete EHole fingerprints
   */
  async bulkDeleteEholeFingerprints(ids: number[]): Promise<BulkDeleteResponse> {
    const response = await apiClient.post("/fingerprints/ehole/bulk-delete/", { ids })
    return response.data
  },

  /**
   * Delete all EHole fingerprints
   */
  async deleteAllEholeFingerprints(): Promise<BulkDeleteResponse> {
    const response = await apiClient.post("/fingerprints/ehole/delete-all/")
    return response.data
  },

  /**
   * Export EHole fingerprints
   */
  async exportEholeFingerprints(): Promise<Blob> {
    const response = await apiClient.get("/fingerprints/ehole/export/", {
      responseType: "blob"
    })
    return response.data
  },

  /**
   * Get EHole fingerprint count
   */
  async getEholeCount(): Promise<number> {
    const response = await apiClient.get("/fingerprints/ehole/", { params: { pageSize: 1 } })
    return response.data.total || 0
  },

  // ==================== Goby ====================
  
  /**
   * Get Goby fingerprint list
   */
  async getGobyFingerprints(params: QueryParams = {}): Promise<PaginatedResponse<GobyFingerprint>> {
    const response = await apiClient.get("/fingerprints/goby/", { params })
    return response.data
  },

  /**
   * 获取 Goby 指纹详情
   */
  async getGobyFingerprint(id: number): Promise<GobyFingerprint> {
    const response = await apiClient.get(`/fingerprints/goby/${id}/`)
    return response.data
  },

  /**
   * 创建单条 Goby 指纹
   */
  async createGobyFingerprint(data: Omit<GobyFingerprint, 'id' | 'createdAt'>): Promise<GobyFingerprint> {
    const response = await apiClient.post("/fingerprints/goby/", data)
    return response.data
  },

  /**
   * 更新 Goby 指纹
   */
  async updateGobyFingerprint(id: number, data: Partial<GobyFingerprint>): Promise<GobyFingerprint> {
    const response = await apiClient.put(`/fingerprints/goby/${id}/`, data)
    return response.data
  },

  /**
   * 删除单条 Goby 指纹
   */
  async deleteGobyFingerprint(id: number): Promise<void> {
    await apiClient.delete(`/fingerprints/goby/${id}/`)
  },

  /**
   * 文件导入 Goby 指纹
   */
  async importGobyFingerprints(file: File): Promise<BatchCreateResponse> {
    const formData = new FormData()
    formData.append("file", file)
    const response = await apiClient.post("/fingerprints/goby/import_file/", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    })
    return response.data
  },

  /**
   * 批量删除 Goby 指纹
   */
  async bulkDeleteGobyFingerprints(ids: number[]): Promise<BulkDeleteResponse> {
    const response = await apiClient.post("/fingerprints/goby/bulk-delete/", { ids })
    return response.data
  },

  /**
   * 删除所有 Goby 指纹
   */
  async deleteAllGobyFingerprints(): Promise<BulkDeleteResponse> {
    const response = await apiClient.post("/fingerprints/goby/delete-all/")
    return response.data
  },

  /**
   * 导出 Goby 指纹
   */
  async exportGobyFingerprints(): Promise<Blob> {
    const response = await apiClient.get("/fingerprints/goby/export/", {
      responseType: "blob"
    })
    return response.data
  },

  /**
   * 获取 Goby 指纹数量
   */
  async getGobyCount(): Promise<number> {
    const response = await apiClient.get("/fingerprints/goby/", { params: { pageSize: 1 } })
    return response.data.total || 0
  },

  // ==================== Wappalyzer ====================
  
  /**
   * 获取 Wappalyzer 指纹列表
   */
  async getWappalyzerFingerprints(params: QueryParams = {}): Promise<PaginatedResponse<WappalyzerFingerprint>> {
    const response = await apiClient.get("/fingerprints/wappalyzer/", { params })
    return response.data
  },

  /**
   * 获取 Wappalyzer 指纹详情
   */
  async getWappalyzerFingerprint(id: number): Promise<WappalyzerFingerprint> {
    const response = await apiClient.get(`/fingerprints/wappalyzer/${id}/`)
    return response.data
  },

  /**
   * 创建单条 Wappalyzer 指纹
   */
  async createWappalyzerFingerprint(data: Omit<WappalyzerFingerprint, 'id' | 'createdAt'>): Promise<WappalyzerFingerprint> {
    const response = await apiClient.post("/fingerprints/wappalyzer/", data)
    return response.data
  },

  /**
   * 更新 Wappalyzer 指纹
   */
  async updateWappalyzerFingerprint(id: number, data: Partial<WappalyzerFingerprint>): Promise<WappalyzerFingerprint> {
    const response = await apiClient.put(`/fingerprints/wappalyzer/${id}/`, data)
    return response.data
  },

  /**
   * 删除单条 Wappalyzer 指纹
   */
  async deleteWappalyzerFingerprint(id: number): Promise<void> {
    await apiClient.delete(`/fingerprints/wappalyzer/${id}/`)
  },

  /**
   * 文件导入 Wappalyzer 指纹
   */
  async importWappalyzerFingerprints(file: File): Promise<BatchCreateResponse> {
    const formData = new FormData()
    formData.append("file", file)
    const response = await apiClient.post("/fingerprints/wappalyzer/import_file/", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    })
    return response.data
  },

  /**
   * 批量删除 Wappalyzer 指纹
   */
  async bulkDeleteWappalyzerFingerprints(ids: number[]): Promise<BulkDeleteResponse> {
    const response = await apiClient.post("/fingerprints/wappalyzer/bulk-delete/", { ids })
    return response.data
  },

  /**
   * 删除所有 Wappalyzer 指纹
   */
  async deleteAllWappalyzerFingerprints(): Promise<BulkDeleteResponse> {
    const response = await apiClient.post("/fingerprints/wappalyzer/delete-all/")
    return response.data
  },

  /**
   * 导出 Wappalyzer 指纹
   */
  async exportWappalyzerFingerprints(): Promise<Blob> {
    const response = await apiClient.get("/fingerprints/wappalyzer/export/", {
      responseType: "blob"
    })
    return response.data
  },

  /**
   * 获取 Wappalyzer 指纹数量
   */
  async getWappalyzerCount(): Promise<number> {
    const response = await apiClient.get("/fingerprints/wappalyzer/", { params: { pageSize: 1 } })
    return response.data.total || 0
  },

  // ==================== Fingers ====================

  /**
   * 获取 Fingers 指纹列表
   */
  async getFingersFingerprints(params: QueryParams = {}): Promise<PaginatedResponse<FingersFingerprint>> {
    const response = await apiClient.get("/fingerprints/fingers/", { params })
    return response.data
  },

  /**
   * 获取 Fingers 指纹详情
   */
  async getFingersFingerprint(id: number): Promise<FingersFingerprint> {
    const response = await apiClient.get(`/fingerprints/fingers/${id}/`)
    return response.data
  },

  /**
   * 创建单条 Fingers 指纹
   */
  async createFingersFingerprint(data: Omit<FingersFingerprint, 'id' | 'createdAt'>): Promise<FingersFingerprint> {
    const response = await apiClient.post("/fingerprints/fingers/", data)
    return response.data
  },

  /**
   * 更新 Fingers 指纹
   */
  async updateFingersFingerprint(id: number, data: Partial<FingersFingerprint>): Promise<FingersFingerprint> {
    const response = await apiClient.put(`/fingerprints/fingers/${id}/`, data)
    return response.data
  },

  /**
   * 删除单条 Fingers 指纹
   */
  async deleteFingersFingerprint(id: number): Promise<void> {
    await apiClient.delete(`/fingerprints/fingers/${id}/`)
  },

  /**
   * 文件导入 Fingers 指纹
   */
  async importFingersFingerprints(file: File): Promise<BatchCreateResponse> {
    const formData = new FormData()
    formData.append("file", file)
    const response = await apiClient.post("/fingerprints/fingers/import_file/", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    })
    return response.data
  },

  /**
   * 批量删除 Fingers 指纹
   */
  async bulkDeleteFingersFingerprints(ids: number[]): Promise<BulkDeleteResponse> {
    const response = await apiClient.post("/fingerprints/fingers/bulk-delete/", { ids })
    return response.data
  },

  /**
   * 删除所有 Fingers 指纹
   */
  async deleteAllFingersFingerprints(): Promise<BulkDeleteResponse> {
    const response = await apiClient.post("/fingerprints/fingers/delete-all/")
    return response.data
  },

  /**
   * 导出 Fingers 指纹
   */
  async exportFingersFingerprints(): Promise<Blob> {
    const response = await apiClient.get("/fingerprints/fingers/export/", {
      responseType: "blob"
    })
    return response.data
  },

  /**
   * 获取 Fingers 指纹数量
   */
  async getFingersCount(): Promise<number> {
    const response = await apiClient.get("/fingerprints/fingers/", { params: { pageSize: 1 } })
    return response.data.total || 0
  },

  // ==================== FingerPrintHub ====================

  /**
   * 获取 FingerPrintHub 指纹列表
   */
  async getFingerPrintHubFingerprints(params: QueryParams = {}): Promise<PaginatedResponse<FingerPrintHubFingerprint>> {
    const response = await apiClient.get("/fingerprints/fingerprinthub/", { params })
    return response.data
  },

  /**
   * 获取 FingerPrintHub 指纹详情
   */
  async getFingerPrintHubFingerprint(id: number): Promise<FingerPrintHubFingerprint> {
    const response = await apiClient.get(`/fingerprints/fingerprinthub/${id}/`)
    return response.data
  },

  /**
   * 创建单条 FingerPrintHub 指纹
   */
  async createFingerPrintHubFingerprint(data: Omit<FingerPrintHubFingerprint, 'id' | 'createdAt'>): Promise<FingerPrintHubFingerprint> {
    const response = await apiClient.post("/fingerprints/fingerprinthub/", data)
    return response.data
  },

  /**
   * 更新 FingerPrintHub 指纹
   */
  async updateFingerPrintHubFingerprint(id: number, data: Partial<FingerPrintHubFingerprint>): Promise<FingerPrintHubFingerprint> {
    const response = await apiClient.put(`/fingerprints/fingerprinthub/${id}/`, data)
    return response.data
  },

  /**
   * 删除单条 FingerPrintHub 指纹
   */
  async deleteFingerPrintHubFingerprint(id: number): Promise<void> {
    await apiClient.delete(`/fingerprints/fingerprinthub/${id}/`)
  },

  /**
   * 文件导入 FingerPrintHub 指纹
   */
  async importFingerPrintHubFingerprints(file: File): Promise<BatchCreateResponse> {
    const formData = new FormData()
    formData.append("file", file)
    const response = await apiClient.post("/fingerprints/fingerprinthub/import_file/", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    })
    return response.data
  },

  /**
   * 批量删除 FingerPrintHub 指纹
   */
  async bulkDeleteFingerPrintHubFingerprints(ids: number[]): Promise<BulkDeleteResponse> {
    const response = await apiClient.post("/fingerprints/fingerprinthub/bulk-delete/", { ids })
    return response.data
  },

  /**
   * 删除所有 FingerPrintHub 指纹
   */
  async deleteAllFingerPrintHubFingerprints(): Promise<BulkDeleteResponse> {
    const response = await apiClient.post("/fingerprints/fingerprinthub/delete-all/")
    return response.data
  },

  /**
   * 导出 FingerPrintHub 指纹
   */
  async exportFingerPrintHubFingerprints(): Promise<Blob> {
    const response = await apiClient.get("/fingerprints/fingerprinthub/export/", {
      responseType: "blob"
    })
    return response.data
  },

  /**
   * 获取 FingerPrintHub 指纹数量
   */
  async getFingerPrintHubCount(): Promise<number> {
    const response = await apiClient.get("/fingerprints/fingerprinthub/", { params: { pageSize: 1 } })
    return response.data.total || 0
  },

  // ==================== ARL ====================

  /**
   * 获取 ARL 指纹列表
   */
  async getARLFingerprints(params: QueryParams = {}): Promise<PaginatedResponse<ARLFingerprint>> {
    const response = await apiClient.get("/fingerprints/arl/", { params })
    return response.data
  },

  /**
   * 获取 ARL 指纹详情
   */
  async getARLFingerprint(id: number): Promise<ARLFingerprint> {
    const response = await apiClient.get(`/fingerprints/arl/${id}/`)
    return response.data
  },

  /**
   * 创建单条 ARL 指纹
   */
  async createARLFingerprint(data: Omit<ARLFingerprint, 'id' | 'createdAt'>): Promise<ARLFingerprint> {
    const response = await apiClient.post("/fingerprints/arl/", data)
    return response.data
  },

  /**
   * 更新 ARL 指纹
   */
  async updateARLFingerprint(id: number, data: Partial<ARLFingerprint>): Promise<ARLFingerprint> {
    const response = await apiClient.put(`/fingerprints/arl/${id}/`, data)
    return response.data
  },

  /**
   * 删除单条 ARL 指纹
   */
  async deleteARLFingerprint(id: number): Promise<void> {
    await apiClient.delete(`/fingerprints/arl/${id}/`)
  },

  /**
   * 文件导入 ARL 指纹（支持 YAML 和 JSON）
   */
  async importARLFingerprints(file: File): Promise<BatchCreateResponse> {
    const formData = new FormData()
    formData.append("file", file)
    const response = await apiClient.post("/fingerprints/arl/import_file/", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    })
    return response.data
  },

  /**
   * 批量删除 ARL 指纹
   */
  async bulkDeleteARLFingerprints(ids: number[]): Promise<BulkDeleteResponse> {
    const response = await apiClient.post("/fingerprints/arl/bulk-delete/", { ids })
    return response.data
  },

  /**
   * 删除所有 ARL 指纹
   */
  async deleteAllARLFingerprints(): Promise<BulkDeleteResponse> {
    const response = await apiClient.post("/fingerprints/arl/delete-all/")
    return response.data
  },

  /**
   * 导出 ARL 指纹（YAML 格式）
   */
  async exportARLFingerprints(): Promise<Blob> {
    const response = await apiClient.get("/fingerprints/arl/export/", {
      responseType: "blob"
    })
    return response.data
  },

  /**
   * 获取 ARL 指纹数量
   */
  async getARLCount(): Promise<number> {
    const response = await apiClient.get("/fingerprints/arl/", { params: { pageSize: 1 } })
    return response.data.total || 0
  },

  // ==================== 统计 ====================

  /**
   * 获取所有指纹库统计
   */
  async getStats(): Promise<FingerprintStats> {
    // 并行获取各指纹库数量
    const [eholeCount, gobyCount, wappalyzerCount, fingersCount, fingerprinthubCount, arlCount] = await Promise.all([
      this.getEholeCount(),
      this.getGobyCount(),
      this.getWappalyzerCount(),
      this.getFingersCount(),
      this.getFingerPrintHubCount(),
      this.getARLCount(),
    ])
    return {
      ehole: eholeCount,
      goby: gobyCount,
      wappalyzer: wappalyzerCount,
      fingers: fingersCount,
      fingerprinthub: fingerprinthubCount,
      arl: arlCount,
    }
  },
}
