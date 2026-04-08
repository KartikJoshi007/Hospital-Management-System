import { useState, useEffect } from 'react';
import { Bell, Clock, Trash2, CheckCircle, Filter, Search, Loader2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useNotifications from '../../hooks/useNotifications';

const NotificationsPage = () => {
    const navigate = useNavigate();
    const { notifications, loading, markAsRead, markAllAsRead, refresh } = useNotifications();
    const [filter, setFilter] = useState('all'); // all, unread, bookings, cancellations
    const [searchTerm, setSearchTerm] = useState('');

    const filteredNotifications = notifications.filter(n => {
        const matchesSearch = n.message.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             n.type.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' || 
                             (filter === 'unread' && !n.isRead) ||
                             (n.type === filter);
        return matchesSearch && matchesFilter;
    });

    const getTypeStyles = (type) => {
        switch (type) {
            case 'cancellation': return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'booking': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'leave': return 'bg-amber-50 text-amber-600 border-amber-100';
            default: return 'bg-blue-50 text-blue-600 border-blue-100';
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
                    <div className="divide-y divide-slate-50">
                        {filteredNotifications.map((n, idx) => (
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.03 }}
                                key={n._id}
                                className={`p-6 hover:bg-slate-50/50 transition-all flex gap-6 group relative ${!n.isRead ? 'bg-blue-50/10' : ''}`}
                            >
                                {!n.isRead && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500" />
                                )}
                                
                                <div className={`h-12 w-12 rounded-2xl shrink-0 flex items-center justify-center border transition-transform group-hover:scale-110 ${getTypeStyles(n.type)}`}>
                                    <Bell size={20} />
                                </div>

                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getTypeStyles(n.type)}`}>
                                            {n.type}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                                            <Clock size={12} /> {new Date(n.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                    <h4 className={`text-sm tracking-tight ${!n.isRead ? 'font-black text-slate-900' : 'font-bold text-slate-600'}`}>
                                        {n.message}
                                    </h4>
                                    <div className="flex items-center gap-4 pt-2">
                                        {!n.isRead && (
                                            <button 
                                                onClick={() => markAsRead(n._id)}
                                                className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                                            >
                                                Mark as Read
                                            </button>
                                        )}
                                        {n.referenceId && (
                                            <button 
                                                onClick={() => navigate(n.role === 'admin' ? '/admin/appointments' : '/doctor/appointments')}
                                                className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline"
                                            >
                                                View Source Attachment
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
