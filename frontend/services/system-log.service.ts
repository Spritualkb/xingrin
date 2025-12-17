import apiClient from "@/lib/api-client"
import type { SystemLogResponse } from "@/types/system-log.types"

const BASE_URL = "/system/logs"

export const systemLogService = {
  async getSystemLogs(params?: { lines?: number }): Promise<SystemLogResponse> {
    const searchParams = new URLSearchParams()

    if (params?.lines != null) {
      searchParams.set("lines", String(params.lines))
    }

    const query = searchParams.toString()
    const url = query ? `${BASE_URL}/?${query}` : `${BASE_URL}/`

    const response = await apiClient.get<SystemLogResponse>(url)
    return response.data
  },
}
