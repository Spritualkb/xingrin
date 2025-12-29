import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { NotificationSettingsService } from '@/services/notification-settings.service'
import type { UpdateNotificationSettingsRequest } from '@/types/notification-settings.types'
import { toast } from 'sonner'

export function useNotificationSettings() {
  return useQuery({
    queryKey: ['notification-settings'],
    queryFn: () => NotificationSettingsService.getSettings(),
  })
}

export function useUpdateNotificationSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateNotificationSettingsRequest) =>
      NotificationSettingsService.updateSettings(data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['notification-settings'] })
      toast.success(res?.message || 'Notification settings saved')
    },
    onError: () => {
      toast.error('Save failed, please try again')
    },
  })
}
