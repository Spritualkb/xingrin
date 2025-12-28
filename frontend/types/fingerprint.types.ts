/**
 * 指纹相关类型定义
 */

// EHole 指纹类型
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

// Goby 规则类型
export interface GobyRule {
  label: string
  feature: string
  is_equal: boolean
}

// Goby 指纹类型
export interface GobyFingerprint {
  id: number
  name: string
  logic: string
  rule: GobyRule[]
  createdAt: string
}

// Wappalyzer 指纹类型
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

// 批量创建响应
export interface BatchCreateResponse {
  created: number
  failed: number
}

// 批量删除响应
export interface BulkDeleteResponse {
  deleted: number
}

// 指纹统计信息
export interface FingerprintStats {
  ehole: number
  goby: number
  wappalyzer: number
}
