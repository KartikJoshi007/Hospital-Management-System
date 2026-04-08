import { useState, useRef, useEffect } from 'react';
import { Bell, Check, BellOff, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useNotifications from '../hooks/useNotifications';

const NotificationBell = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon & Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-500 transition-all border border-slate-100 group"
      >
        <Bell size={20} className={unreadCount > 0 ? 'animate-bounce-subtle' : ''} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 bg-rose-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm ring-2 ring-rose-500/20">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden z-[100]"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest flex items-center gap-1"
                >
                  <Check size={12} /> Mark all read
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-10 text-center flex flex-col items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
                    <BellOff size={24} />
                  </div>
                  <p className="text-xs font-bold text-slate-400">All caught up!</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    onClick={() => markAsRead(n._id)}
                    className={`p-4 border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer group relative ${!n.isRead ? 'bg-blue-50/20' : ''}`}
                  >
                    {!n.isRead && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                    )}
                    <p className={`text-xs ${!n.isRead ? 'font-black text-slate-900' : 'font-bold text-slate-600'}`}>
                      {n.title}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2 text-[9px] font-black text-slate-300 uppercase tracking-widest group-hover:text-blue-400 transition-colors">
                      <Clock size={10} />
                      {new Date(n.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50/50 text-center border-t border-slate-50">
              <button
                onClick={() => {
                  setIsOpen(false);
                  const rolePath = (user?.role || 'patient').toLowerCase();
                  navigate(`/${rolePath}/notifications`);
                }}
                className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors w-full"
              >
                View all activity
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
