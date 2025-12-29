import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getEngines,
  getEngine,
  createEngine,
  updateEngine,
  deleteEngine,
} from '@/services/engine.service'
import type { ScanEngine } from '@/types/engine.types'

/**
 * Get engine list
 */
export function useEngines() {
  return useQuery({
    queryKey: ['engines'],
    queryFn: getEngines,
  })
}

/**
 * Get engine details
 */
export function useEngine(id: number) {
  return useQuery({
    queryKey: ['engines', id],
    queryFn: () => getEngine(id),
    enabled: !!id,
  })
}

/**
 * Create engine
 */
export function useCreateEngine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createEngine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['engines'] })
      toast.success('Engine created successfully')
    },
    onError: (error: any) => {
      toast.error('Failed to create engine', {
        description: error?.response?.data?.error || error.message,
      })
    },
  })
}

/**
 * Update engine
 */
export function useUpdateEngine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof updateEngine>[1] }) =>
      updateEngine(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['engines'] })
      queryClient.invalidateQueries({ queryKey: ['engines', variables.id] })
      toast.success('Engine updated successfully')
    },
    onError: (error: any) => {
      toast.error('Failed to update engine', {
        description: error?.response?.data?.error || error.message,
      })
    },
  })
}

/**
 * Delete engine
 */
export function useDeleteEngine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteEngine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['engines'] })
      toast.success('Engine deleted successfully')
    },
    onError: (error: any) => {
      toast.error('Failed to delete engine', {
        description: error?.response?.data?.error || error.message,
      })
    },
  })
}

