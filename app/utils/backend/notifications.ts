import { Notification, NotificationResponse } from '../types';

export async function getNotifications(): Promise<NotificationResponse> {
  try {
    const response = await fetch('/api/notifications');
    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return {
      notifications: [],
      error: 'Failed to fetch notifications',
    };
  }
}

export async function markNotificationAsRead(id: string): Promise<boolean> {
  try {
    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
}

export async function markAllNotificationsAsRead(): Promise<boolean> {
  try {
    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ markAll: true }),
    });
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
} 