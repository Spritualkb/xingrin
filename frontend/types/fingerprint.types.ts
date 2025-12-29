/**
 * Fingerprint related type definitions
 */

// EHole fingerprint type
export interface EholeFingerprint {
  id: number
  cms: string
  method: string
  location: string
  keyword: string[]
  isImportant: boolean
  type: string
  createdAt: string
}

// Goby rule type
export interface GobyRule {
  label: string
  feature: string
  is_equal: boolean
}

// Goby fingerprint type
export interface GobyFingerprint {
  id: number
  name: string
  logic: string
  rule: GobyRule[]
  createdAt: string
}

// Wappalyzer fingerprint type
export interface WappalyzerFingerprint {
  id: number
  name: string
  cats: number[]
  cookies: Record<string, string>
  headers: Record<string, string>
  scriptSrc: string[]
  js: string[]
  implies: string[]
  meta: Record<string, string[]>
  html: string[]
  description: string
  website: string
  cpe: string
  createdAt: string
}

// Batch create response
export interface BatchCreateResponse {
  created: number
  failed: number
}

// Bulk delete response
export interface BulkDeleteResponse {
  deleted: number
}

// Fingerprint statistics
export interface FingerprintStats {
  ehole: number
  goby: number
  wappalyzer: number
}
