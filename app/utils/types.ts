export interface Notification {
  id: string;
  title: string;
  text: string;
  by: string;
  date: string;
  isRead: boolean;
}

export interface NotificationResponse {
  notifications: Notification[];
  error?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
} 