/**
 * Authentication related type definitions
 */

// User info
export interface User {
  id: number
  username: string
  isStaff: boolean
  isSuperuser: boolean
}

// Login request
export interface LoginRequest {
  username: string
  password: string
}

// Login response
export interface LoginResponse {
  message: string
  user: User
}

// Get current user response
export interface MeResponse {
  authenticated: boolean
  user: User | null
}

// Logout response
export interface LogoutResponse {
  message: string
}

// Change password request
export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}

// Change password response
export interface ChangePasswordResponse {
  message: string
}
