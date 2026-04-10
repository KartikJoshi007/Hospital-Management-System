import { useState } from 'react';
import { Bell, Clock, CheckCircle, Filter, Search, Loader2, ArrowLeft, CalendarCheck, XCircle, UserCheck, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useNotifications from '../../hooks/useNotifications';
import useAuth from '../../hooks/useAuth';

const NotificationsPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { notifications, loading, markAsRead, markAllAsRead, refresh } = useNotifications();
    const [filter, setFilter] = useState('all'); // all, unread, bookings, cancellations
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedNotif, setSelectedNotif] = useState(null);

    const filteredNotifications = notifications.filter(n => {
        const matchesSearch = n.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
            n.type.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' ||
            (filter === 'unread' && !n.isRead) ||
            (n.type === filter);
        return matchesSearch && matchesFilter;
    });

    const getTypeConfig = (type) => {
        switch (type) {
            case 'cancellation': return { style: 'bg-rose-50 text-rose-600 border-rose-200', dot: 'bg-rose-500', icon: XCircle, label: 'Cancellation' };
            case 'booking':      return { style: 'bg-emerald-50 text-emerald-600 border-emerald-200', dot: 'bg-emerald-500', icon: CalendarCheck, label: 'Booking' };
            case 'leave':        return { style: 'bg-amber-50 text-amber-600 border-amber-200', dot: 'bg-amber-500', icon: UserCheck, label: 'Leave' };
            default:             return { style: 'bg-blue-50 text-blue-600 border-blue-200', dot: 'bg-blue-500', icon: Info, label: type || 'Alert' };
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all shadow-sm"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Notification Center</h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Clinical Activity & Alerts</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={markAllAsRead}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
                    >
                        <CheckCircle size={14} /> Mark All as Read
                    </button>
                    <button
                        onClick={refresh}
                        className="px-4 py-2 bg-blue-600 rounded-xl text-xs font-black text-white hover:bg-blue-700 transition-all flex items-center gap-2 shadow-blue-200 shadow-lg"
                    >
                        <Bell size={14} /> Refresh Alerts
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Search your activity history..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-slate-900 appearance-none outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all"
                    >
                        <option value="all">All Activity</option>
                        <option value="unread">Unread Only</option>
                        <option value="booking">Bookings</option>
                        <option value="cancellation">Cancellations</option>
                        <option value="leave">Staff Leaves</option>
                    </select>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
                {loading ? (
                    <div className="h-[500px] flex flex-col items-center justify-center gap-4">
                        <Loader2 className="animate-spin text-blue-500" size={32} />
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Syncing with clinical cloud...</p>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="h-[500px] flex flex-col items-center justify-center gap-4">
                        <div className="h-20 w-20 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-200">
                            <Bell size={40} />
                        </div>
                        <div className="text-center">
                            <h3 className="text-sm font-black text-slate-900 uppercase">No Activity Found</h3>
                            <p className="text-xs font-bold text-slate-400 mt-1">Try adjusting your filters or search term.</p>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 space-y-3">
                        {filteredNotifications.map((n, idx) => {
                            const cfg = getTypeConfig(n.type)
                            const Icon = cfg.icon
                            return (
                                <motion.div
                                    key={n._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className={`relative flex items-start gap-4 p-4 rounded-2xl border transition-all group ${
                                        !n.isRead
                                            ? 'bg-white border-slate-200 shadow-sm'
                                            : 'bg-slate-50/60 border-slate-100'
                                    }`}
                                >
                                    {/* unread dot */}
                                    {!n.isRead && (
                                        <span className={`absolute top-4 right-4 h-2 w-2 rounded-full ${cfg.dot}`} />
                                    )}

                                    {/* icon */}
                                    <div className={`h-10 w-10 rounded-xl shrink-0 flex items-center justify-center border ${cfg.style}`}>
                                        <Icon size={18} />
                                    </div>

                                    {/* body */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${cfg.style}`}>
                                                {cfg.label}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                                <Clock size={10} />
                                                {new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <p className={`text-sm leading-snug ${
                                            !n.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-500'
                                        }`}>
                                            {n.message}
                                        </p>
                                        {(!n.isRead || n.referenceId) && (
                                            <div className="flex items-center gap-3 mt-2">
                                                {!n.isRead && (
                                                    <button
                                                        onClick={() => markAsRead(n._id)}
                                                        className="flex items-center gap-1 text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-700 transition-colors"
                                                    >
                                                        <CheckCircle size={11} /> MARK READ
                                                    </button>
                                                )}
                                                {n.referenceId && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const role = (user?.role || 'patient').toLowerCase();

                                                            // 🚗 Smart Navigation
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
                                                        className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-800 transition-colors"
                                                    >
                                                        VIEW →
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedNotif(n);
                                                        if(!n.isRead) markAsRead(n._id);
                                                    }}
                                                    className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                                                >
                                                    Details
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Notification Detail Modal */}
            <AnimatePresence>
                {selectedNotif && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedNotif(null)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
                        >
                            {/* Modal Header */}
                            <div className={`p-6 border-b flex items-center justify-between ${getTypeConfig(selectedNotif.type).style}`}>
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-2xl bg-white/50 flex items-center justify-center shadow-sm">
                                        {(() => {
                                            const Icon = getTypeConfig(selectedNotif.type).icon;
                                            return <Icon size={24} />;
                                        })()}
                                    </div>
                                    <div>
                                        <h3 className="font-black uppercase tracking-widest text-[10px] opacity-70">
                                            {getTypeConfig(selectedNotif.type).label} Detail
                                        </h3>
                                        <p className="text-sm font-bold truncate">Notification Reference</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedNotif(null)}
                                    className="h-10 w-10 rounded-xl bg-white/20 hover:bg-white/40 flex items-center justify-center transition-all"
                                >
                                    <XCircle size={20} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Message</label>
                                        <p className="text-lg font-bold text-slate-900 leading-relaxed italic">
                                            "{selectedNotif.message}"
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Time Received</label>
                                            <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                                <Clock size={14} className="text-slate-400" />
                                                {new Date(selectedNotif.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Date</label>
                                            <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                                <CalendarCheck size={14} className="text-slate-400" />
                                                {new Date(selectedNotif.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>

                                    {selectedNotif.referenceId && (
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mt-2">
                                            <p className="text-xs font-medium text-slate-600">
                                                This notification is linked to an active clinical record. You can view the full details in the appointments section.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4">
                                <button
                                    onClick={() => setSelectedNotif(null)}
                                    className="flex-1 py-3 rounded-2xl bg-white border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all font-sans"
                                >
                                    Close
                                </button>
                                {selectedNotif.referenceId && (
                                    <button
                                        onClick={() => {
                                            const role = (user?.role || 'patient').toLowerCase();
                                            
                                            if (selectedNotif.referenceModel === 'Patient') {
                                              navigate(`/${role}/patients`);
                                            } else {
                                              let query = '';
                                              if (['doctor', 'admin', 'reception'].includes(role)) {
                                                  query = '?tab=All';
                                              } else if (role === 'patient') {
                                                  query = selectedNotif.type === 'cancellation' ? '?tab=past' : '?tab=upcoming';
                                              }
                                              navigate(`/${role}/appointments${query}`);
                                            }
                                            setSelectedNotif(null);
                                        }}
                                        className="flex-1 py-3 rounded-2xl bg-emerald-500 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200 font-sans"
                                    >
                                        {selectedNotif.referenceModel === 'Patient' ? 'VIEW PATIENT' : 'VIEW APPOINTMENT'}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationsPage;
