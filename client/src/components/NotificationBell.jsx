import { useRef } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Bell, BellOff, Check, Clock, CalendarCheck, XCircle, UserCheck, Info, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useNotifications from '../hooks/useNotifications';

const TYPE_CONFIG = {
  cancellation: { icon: XCircle,      style: 'bg-rose-50 text-rose-500 border-rose-100',     dot: 'bg-rose-500',     label: 'Cancelled' },
  booking:      { icon: CalendarCheck, style: 'bg-emerald-50 text-emerald-600 border-emerald-100', dot: 'bg-emerald-500', label: 'Booking' },
  leave:        { icon: UserCheck,     style: 'bg-amber-50 text-amber-600 border-amber-100',   dot: 'bg-amber-500',    label: 'Leave' },
  default:      { icon: Info,          style: 'bg-blue-50 text-blue-600 border-blue-100',      dot: 'bg-blue-500',     label: 'Alert' },
};

const getConfig = (type) => TYPE_CONFIG[type] || TYPE_CONFIG.default;

// group notifications by date label
const groupByDate = (list) => {
  const today    = new Date(); today.setHours(0,0,0,0);
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  const groups = {};
  list.forEach(n => {
    const d = new Date(n.createdAt); d.setHours(0,0,0,0);
    let label;
    if (d.getTime() === today.getTime())     label = 'Today';
    else if (d.getTime() === yesterday.getTime()) label = 'Yesterday';
    else label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  });
  return groups;
};

const NotificationBell = () => {
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const recent    = notifications.slice(0, 20);
  const grouped   = groupByDate(recent);

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="relative p-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-500 transition-all border border-slate-100">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 bg-rose-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={10}
          className="z-[200] w-[360px] outline-none"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="bg-white rounded-2xl shadow-2xl shadow-slate-300/40 border border-slate-100 overflow-hidden"
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Bell size={14} className="text-slate-500" />
                <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-blue-500 text-white text-[9px] font-black">{unreadCount}</span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-[10px] font-black text-blue-500 hover:text-blue-700 uppercase tracking-widest transition-colors"
                >
                  <Check size={11} /> Mark all read
                </button>
              )}
            </div>

            {/* ── List ── */}
            <div className="max-h-[420px] overflow-y-auto">
              {recent.length === 0 ? (
                <div className="py-14 flex flex-col items-center gap-3 text-slate-300">
                  <BellOff size={32} strokeWidth={1.5} />
                  <p className="text-xs font-bold text-slate-400">All caught up!</p>
                </div>
              ) : (
                Object.entries(grouped).map(([dateLabel, items]) => (
                  <div key={dateLabel}>
                    {/* date group header */}
                    <div className="px-4 py-2 bg-slate-50/80 border-b border-slate-100">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{dateLabel}</span>
                    </div>

                    {items.map((n) => {
                      const cfg  = getConfig(n.type);
                      const Icon = cfg.icon;
                      return (
                        <div
                          key={n._id}
                          onClick={() => markAsRead(n._id)}
                          className={`flex items-start gap-3 px-4 py-3 border-b border-slate-50 cursor-pointer transition-colors hover:bg-slate-50 ${!n.isRead ? 'bg-blue-50/30' : ''}`}
                        >
                          {/* icon */}
                          <div className={`h-8 w-8 rounded-xl shrink-0 flex items-center justify-center border mt-0.5 ${cfg.style}`}>
                            <Icon size={14} />
                          </div>

                          {/* text */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${cfg.style}`}>
                                {cfg.label}
                              </span>
                              {!n.isRead && (
                                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                              )}
                            </div>
                            <p className={`text-[11px] leading-snug ${!n.isRead ? 'font-bold text-slate-800' : 'font-medium text-slate-500'}`}>
                              {n.message}
                            </p>
                            <p className="text-[9px] font-bold text-slate-300 mt-1 flex items-center gap-1">
                              <Clock size={9} />
                              {new Date(n.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </p>

                            <div className="flex items-center gap-3 mt-2">
                              {!n.isRead && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(n._id);
                                  }}
                                  className="flex items-center gap-1 text-[9px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-700 transition-colors"
                                >
                                  <Check size={10} /> MARK READ
                                </button>
                              )}
                              {n.referenceId && (
                                <Popover.Close asChild>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const role = (user?.role || 'patient').toLowerCase();
                                      
                                      // 🚗 Smart Navigation based on Reference Model
                                      if (n.referenceModel === 'Patient') {
                                        navigate(`/${role}/patients`);
                                      } else {
                                        let query = '';
                                        if (['doctor', 'admin', 'reception'].includes(role)) {
                                          query = '?tab=All';
                                        } else if (role === 'patient') {
                                          query = n.type === 'cancellation' ? '?tab=past' : '?tab=upcoming';
                                        }
                                        navigate(`/${role}/appointments${query}`);
                                      }
                                    }}
                                    className="text-[9px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-800 transition-colors"
                                  >
                                    VIEW →
                                  </button>
                                </Popover.Close>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* ── Footer ── */}
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50">
              <Popover.Close asChild>
                <button
                  onClick={() => navigate(`/${(user?.role || 'patient').toLowerCase()}/notifications`)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all"
                >
                  View All Notifications <ArrowRight size={12} />
                </button>
              </Popover.Close>
            </div>
          </motion.div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default NotificationBell;
