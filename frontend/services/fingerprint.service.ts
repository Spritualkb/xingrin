/**
 * Fingerprint management API service
 */

import apiClient from "@/lib/api-client"
import type { PaginatedResponse } from "@/types/api-response.types"
import type { 
  EholeFingerprint,
  GobyFingerprint,
  WappalyzerFingerprint,
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

  // ==================== 统计 ====================

  /**
   * 获取所有指纹库统计
   */
  async getStats(): Promise<FingerprintStats> {
    // 并行获取各指纹库数量
    const [eholeCount, gobyCount, wappalyzerCount] = await Promise.all([
      this.getEholeCount(),
      this.getGobyCount(),
      this.getWappalyzerCount(),
    ])
    return {
      ehole: eholeCount,
      goby: gobyCount,
      wappalyzer: wappalyzerCount,
    }
  },
}
