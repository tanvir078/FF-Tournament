import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../../../store/auth';
import api from '../../../lib/api';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/user/login');
      return;
    }
    fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (err) {
      console.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all as read');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Notifications</h1>
          {notifications.length > 0 && (
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              Mark All as Read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-gray-400">No notifications yet</div>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`p-6 ${!notification.isRead ? 'border-l-4 border-blue-500' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold">{notification.title}</h3>
                      {!notification.isRead && (
                        <span className="bg-blue-500 text-xs px-2 py-1 rounded-full">New</span>
                      )}
                    </div>
                    <p className="text-gray-300 mb-2">{notification.message}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      Mark as Read
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
