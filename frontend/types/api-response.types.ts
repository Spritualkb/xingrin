// Common API response types
export interface ApiResponse<T = any> {
  code: string;          // HTTP status code, e.g. "200", "400", "500"
  state: string;         // Business state, e.g. "success", "error"
  message: string;       // Response message
  data?: T;              // Response data
}

// Common batch create response data (corresponds to backend BaseBatchCreateResponseData)
// Applicable to: domains, endpoints and other batch create operations
export interface BatchCreateResponse {
  message: string          // Detailed description, e.g. "Processed 5 domains, created 3 new, 2 existed, 1 skipped"
  requestedCount: number   // Total requested count
  createdCount: number     // Newly created count
  existedCount: number     // Already existed count
  skippedCount?: number    // Skipped count (optional)
  skippedDomains?: Array<{  // Skipped domains list (optional)
    name: string
    reason: string
  }>
}


// Paginated response type
export interface PaginatedResponse<T> {
  results: T[]
  total: number
  page: number
  pageSize: number
  totalPages?: number
}
