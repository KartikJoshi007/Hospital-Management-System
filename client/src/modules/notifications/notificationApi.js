import api from '../../api/axios';

export const getNotifications = async (page = 1, limit = 20, unreadOnly = false) => {
  const response = await api.get('/notifications', {
    params: { page, limit, unreadOnly }
  });
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await api.get('/notifications/unread-count');
  return response.data;
};

export const markAsRead = async (id) => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data;
};

export const markAllAsRead = async () => {
  const response = await api.put('/notifications/read-all');
  return response.data;
};
