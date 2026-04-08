import { useNotificationContext } from '../context/NotificationContext';

const useNotifications = () => {
  return useNotificationContext();
};

export default useNotifications;
