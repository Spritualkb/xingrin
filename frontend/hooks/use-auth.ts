/**
 * Authentication-related hooks
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { login, logout, getMe, changePassword } from '@/services/auth.service'
import { getErrorMessage } from '@/lib/api-client'
import type { LoginRequest, ChangePasswordRequest } from '@/types/auth.types'

/**
 * Get current user information
 */
export function useAuth() {
  const skipAuth = process.env.NEXT_PUBLIC_SKIP_AUTH === 'true'
  
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: skipAuth 
      ? () => Promise.resolve({ authenticated: true } as Awaited<ReturnType<typeof getMe>>)
      : getMe,
    staleTime: 1000 * 60 * 5, // Don't re-request within 5 minutes
    retry: false,
  })
}

/**
 * User login
 */
export function useLogin() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
      toast.success('Login successful')
      router.push('/dashboard/')
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}

/**
 * User logout
 */
export function useLogout() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
      toast.success('Logged out')
      router.push('/login/')
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}

/**
 * Change password
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => changePassword(data),
    onSuccess: () => {
      toast.success('Password changed successfully')
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}
