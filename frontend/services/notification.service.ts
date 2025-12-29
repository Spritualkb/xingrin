/**
 * Notification service
 * Handles all notification-related API requests
 */

import api from '@/lib/api-client'
import type { ApiResponse } from '@/types/api-response.types'
import type {
  Notification,
  GetNotificationsRequest,
  GetNotificationsResponse,
} from '@/types/notification.types'

export class NotificationService {
  /**
   * Get notification list
   */
  static async getNotifications(
    params: GetNotificationsRequest = {}
  ): Promise<GetNotificationsResponse> {
    const response = await api.get<GetNotificationsResponse | ApiResponse<GetNotificationsResponse>>('/notifications/', {
      params,
    })
    const payload = response.data

    if (
      payload &&
      typeof payload === 'object' &&
      'data' in payload &&
      (payload as ApiResponse<GetNotificationsResponse>).data
    ) {
      return (payload as ApiResponse<GetNotificationsResponse>).data as GetNotificationsResponse
    }

    return payload as GetNotificationsResponse
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(): Promise<ApiResponse<null>> {
    const response = await api.post<ApiResponse<null>>('/notifications/mark-all-as-read/')
    return response.data
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    const response = await api.get<ApiResponse<{ count: number }>>('/notifications/unread-count/')
    return response.data
  }
}
