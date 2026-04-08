import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import { getNotifications, getUnreadCount, markAsRead as apiMarkAsRead, markAllAsRead as apiMarkAllAsRead } from '../modules/notifications/notificationApi';
import useAuth from '../hooks/useAuth';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const lastSeenId = useRef(null);
  const pollTimer = useRef(null);
  const POLL_INTERVAL = 15000; // Increased to 15s for better server balance

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const [notifsRes, countRes] = await Promise.all([
        getNotifications(1, 10),
        getUnreadCount()
      ]);
      
      const newNotifs = notifsRes?.data?.notifications || notifsRes?.data || [];
      const newCount = countRes?.data?.unreadCount || 0;

      // 📺 Trigger Toast for NEW Unread Notification
      if (newNotifs.length > 0) {
        const latest = newNotifs[0];
        if (!latest.isRead && latest._id !== lastSeenId.current) {
          lastSeenId.current = latest._id;
          toast(latest.message, {
            type: latest.type === 'cancellation' ? 'error' : 
                  latest.type === 'booking' ? 'success' : 'info',
            icon: '🔔'
          });
        }
      }
      
      setNotifications(newNotifs);
      setUnreadCount(newCount);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, [user]);

  const markAsRead = async (id) => {
    try {
      await apiMarkAsRead(id);
      fetchData();
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiMarkAllAsRead();
      fetchData();
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchData();

    const poll = () => {
      // 🕵️ Visibility Guard: Only poll if tab is active
      if (document.visibilityState === 'visible') {
        fetchData();
      }
      pollTimer.current = setTimeout(poll, POLL_INTERVAL);
    };

    pollTimer.current = setTimeout(poll, POLL_INTERVAL);

    const handleFocus = () => {
      if (document.visibilityState === 'visible') fetchData();
    };
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      if (pollTimer.current) clearTimeout(pollTimer.current);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [user, fetchData]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      markAsRead,
      markAllAsRead,
      refresh: fetchData
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};
