/**
 * Authentication service
 */
import { api } from '@/lib/api-client'
import type { 
  LoginRequest, 
  LoginResponse, 
  MeResponse, 
  LogoutResponse,
  ChangePasswordRequest,
  ChangePasswordResponse
} from '@/types/auth.types'

/**
 * User login
 */
export async function login(data: LoginRequest): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>('/auth/login/', data)
  return res.data
}

/**
 * User logout
 */
export async function logout(): Promise<LogoutResponse> {
  const res = await api.post<LogoutResponse>('/auth/logout/')
  return res.data
}

/**
 * Get current user information
 */
export async function getMe(): Promise<MeResponse> {
  const res = await api.get<MeResponse>('/auth/me/')
  return res.data
}

/**
 * Change password
 */
export async function changePassword(data: ChangePasswordRequest): Promise<ChangePasswordResponse> {
  const res = await api.post<ChangePasswordResponse>('/auth/change-password/', data)
  return res.data
}
