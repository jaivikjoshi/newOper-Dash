"use client";

import { useState, useEffect } from 'react';
import { Bell, X, MessageSquare, Users, Calendar, Info, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/app/utils/UserContext';
import { format } from 'date-fns';

// Define notification types
interface Notification {
  id: string;
  type: 'announcement' | 'poll' | 'mention' | 'team' | 'shift' | 'module';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export default function NotificationsPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { userProfile } = useUser();

  // Generate mock notifications on component mount
  useEffect(() => {
    try {
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'announcement',
          title: 'New Announcement',
          message: 'A new announcement has been posted: "System Maintenance this Weekend"',
          time: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
          read: false
        },
        {
          id: '2',
          type: 'poll',
          title: 'New Poll Available',
          message: 'Please participate in the new team satisfaction survey',
          time: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
          read: false
        },
        {
          id: '3',
          type: 'mention',
          title: 'You were mentioned',
          message: 'Jane mentioned you in a comment: "Thanks @user for your help!"',
          time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          read: true
        },
        {
          id: '4',
          type: 'team',
          title: 'Team Update',
          message: 'New team member Sarah Jones has joined the Operations team',
          time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          read: true
        },
        {
          id: '5',
          type: 'shift',
          title: 'Shift Change',
          message: 'Your shift on Friday has been rescheduled to 10:00 AM',
          time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          read: true
        },
        {
          id: '6',
          type: 'module',
          title: 'New Module Available',
          message: 'New Wine Pairing Module is now available for your team',
          time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          read: false
        }
      ];

      setNotifications(mockNotifications);
    } catch (error) {
      console.error("Error initializing notifications:", error);
      setNotifications([]);
    }
  }, []);

  // Filter notifications based on user settings
  useEffect(() => {
    try {
      if (!userProfile || !userProfile.notificationSettings) {
        setFilteredNotifications(notifications);
        setUnreadCount(notifications.filter(n => !n.read).length);
        return;
      }

      const settings = userProfile.notificationSettings;
      
      const filtered = notifications.filter(notification => {
        switch(notification.type) {
          case 'announcement':
            return settings.announcements;
          case 'poll':
            return settings.polls;
          case 'mention':
            return settings.mentions;
          case 'team':
            return settings.teamUpdates;
          case 'shift':
            return settings.shiftChanges;
          default:
            return true;
        }
      });
      
      setFilteredNotifications(filtered);
      setUnreadCount(filtered.filter(n => !n.read).length);
    } catch (error) {
      console.error("Error filtering notifications:", error);
      setFilteredNotifications([]);
      setUnreadCount(0);
    }
  }, [notifications, userProfile]);

  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };

  const closeNotifications = () => {
    setIsOpen(false);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
      
      if (diffInHours < 1) {
        const minutes = Math.round(diffInHours * 60);
        return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
      } else if (diffInHours < 24) {
        const hours = Math.round(diffInHours);
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
      } else {
        return format(date, 'MMM d, h:mm a');
      }
    } catch (error) {
      console.error("Error formatting time:", error);
      return "Unknown time";
    }
  };

  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'announcement':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'poll':
        return <MessageSquare className="h-5 w-5 text-purple-500" />;
      case 'mention':
        return <MessageSquare className="h-5 w-5 text-green-500" />;
      case 'team':
        return <Users className="h-5 w-5 text-indigo-500" />;
      case 'shift':
        return <Calendar className="h-5 w-5 text-orange-500" />;
      case 'module':
        return <FileText className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button 
        className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg z-50 flex items-center justify-center"
        onClick={toggleNotifications}
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Sidebar - Simplified with no animations */}
      {isOpen && (
        <div className="fixed z-50 top-0 right-0 h-full w-80 md:w-96 bg-white shadow-lg overflow-y-auto">
          <div className="sticky top-0 bg-white z-10 shadow-sm">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Notifications</h2>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={markAllAsRead} 
                  disabled={!filteredNotifications.some(n => !n.read)}
                  className="text-xs"
                >
                  Mark all as read
                </Button>
                <button 
                  onClick={closeNotifications}
                  className="p-1 hover:bg-gray-100 rounded-full"
                  aria-label="Close notifications"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Notification List */}
          <div className="divide-y">
            {filteredNotifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No notifications to display</p>
              </div>
            ) : (
              filteredNotifications.map(notification => (
                <div 
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm mb-1">{notification.title}</p>
                      <p className="text-gray-600 text-sm mb-1">{notification.message}</p>
                      <p className="text-xs text-gray-400">{formatTime(notification.time)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
} 