/**
 * Scan engine type definitions
 * 
 * Backend actual return fields: id, name, configuration, created_at, updated_at
 */

// Scan engine interface
export interface ScanEngine {
  id: number
  name: string
  configuration?: string   // YAML configuration content
  createdAt: string
  updatedAt: string
}

// Create engine request
export interface CreateEngineRequest {
  name: string
  configuration: string
}

// Update engine request
export interface UpdateEngineRequest {
  name?: string
  configuration?: string
}

