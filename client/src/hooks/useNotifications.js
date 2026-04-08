import { useState, useEffect, useCallback, useRef } from 'react';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../modules/notifications/notificationApi';
import useAuth from './useAuth';

const useNotifications = (pollInterval = 5000) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const pollTimer = useRef(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const [notifsRes, countRes] = await Promise.all([
        getNotifications(1, 10),
        getUnreadCount()
      ]);
      
      setNotifications(notifsRes?.data?.notifications || notifsRes?.data || []);
      setUnreadCount(countRes?.data?.unreadCount || 0);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, [user]);

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      fetchData(); // Refresh list and count
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      fetchData();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
      pollTimer.current = setInterval(fetchData, pollInterval);
    }
    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, [user, fetchData, pollInterval]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead: handleMarkRead,
    markAllAsRead: handleMarkAllRead,
    refresh: fetchData
  };
};

export default useNotifications;
