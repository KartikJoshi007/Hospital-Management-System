import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Users, Calendar, Clock, CreditCard, ArrowUpRight, TrendingUp, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../../../api/axios";

const ReceptionDashboard = () => {
  const navigate = useNavigate();
  
  const [data, setData] = useState({
    patients: [],
    appointments: [],
    queue: [],
    billingStats: { totalRevenue: 0, totalPending: 0 }
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [patientsRes, appointmentsRes, billingRes,queueRes] = await Promise.all([
        API.get("/patients"),
        API.get("/appointments"),
        API.get("/bills/stats"),
         API.get("/queue") 
      ]);

      setData({
        patients: patientsRes.data?.data || [],
        appointments: appointmentsRes.data?.data || [],
         queue: queueRes.data?.data || [], // Queue typically separate but we can keep it as mock for now or fetch if route exists
        billingStats: billingRes.data?.data?.summary || { totalRevenue: 0, totalPending: 0 }
      });
    } catch (err) {
      console.error("Dashboard data fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = useMemo(() => [
    {
      label: "Total Patients",
      value: data.patients.length,
      icon: Users,
      color: "purple",
      path: "/reception/patients",
      change: "+4.5%",
      trend: "up"
    },
    {
      label: "Appointments",
      value: data.appointments.length,
      icon: Calendar,
      color: "blue",
      path: "/reception/appointments",
      change: "+2.1%",
      trend: "up"
    },
    {
      label: "Queue Size",
      value: data.queue.length,
      icon: Clock,
      color: "orange",
      path: "/reception/queue",
      change: "-1.2%",
      trend: "down"
    },
    {
      label: "Revenue",
      value: `₹${data.billingStats.totalRevenue.toLocaleString('en-IN')}`,
      icon: CreditCard,
      color: "emerald",
      path: "/reception/billing",
      change: "+8.4%",
      trend: "up"
    },
  ], [data]);

  const colorClasses = {
    purple: "group-hover:bg-purple-500",
    blue: "group-hover:bg-blue-500",
    orange: "group-hover:bg-orange-500",
    emerald: "group-hover:bg-emerald-500",
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-purple-500 animate-spin" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Waking up the cloud system...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Reception Dashboard</h1>
        <p className="text-slate-500 font-medium text-sm mt-1">Hospital front desk overview — live synchronization enabled.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            onClick={() => navigate(s.path)}
            className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all group cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl bg-slate-50 text-slate-600 transition-colors ${colorClasses[s.color]} group-hover:text-white`}>
                <s.icon size={20} />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-black ${s.trend === 'up' ? 'text-emerald-600' : 'text-rose-500'} bg-slate-50 px-2 py-1 rounded-full uppercase tracking-tighter`}>
                {s.change}
                {s.trend === 'up' ? <TrendingUp size={10} /> : <Clock size={10} />}
              </div>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{s.label}</p>
            <h3 className="text-2xl font-black text-slate-900">{s.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Main Grid Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Recent Appointments */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Incoming Today</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">{data.appointments.length} scheduled</p>
            </div>
            <button onClick={() => navigate('/reception/appointments')} className="text-[10px] font-black text-purple-600 hover:scale-110 transition-transform flex items-center gap-1 uppercase tracking-widest">
              Desk <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[400px]">
            {data.appointments.length === 0 ? (
              <div className="py-10 text-center text-xs font-bold text-slate-400">No scheduled visits recorded</div>
            ) : (
              data.appointments.slice(0, 5).map((a, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-slate-50/50 border border-transparent hover:border-purple-100 hover:bg-white transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-black group-hover:bg-purple-500 group-hover:text-white transition-colors">
                      {a.patient?.charAt(0) || "P"}
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900">{a.patient}</p>
                      <p className="text-[10px] font-bold text-slate-400">
                        {new Date(a.date).toLocaleDateString()} | {a.time}
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 font-black uppercase tracking-widest rounded-full">
                    {a.status || 'Active'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Global Patient Master */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Recent Registry</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">{data.patients.length} total entries</p>
            </div>
            <button onClick={() => navigate('/reception/patients')} className="text-[10px] font-black text-blue-600 hover:scale-110 transition-transform flex items-center gap-1 uppercase tracking-widest">
              Records <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[400px]">
            {data.patients.length === 0 ? (
              <div className="py-10 text-center text-xs font-bold text-slate-400">No patient records found</div>
            ) : (
              data.patients.slice(0, 5).map((p, i) => (
                <div key={i} className="flex justify-between p-3 rounded-xl bg-slate-50/50 border border-transparent hover:border-blue-100 hover:bg-white transition-all group">
                   <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-black group-hover:bg-blue-500 group-hover:text-white transition-colors">
                      {p.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900">{p.name}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono">
                        {p.contact}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

       {/* Secondary Statistics Bar */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 flex items-center justify-between group overflow-hidden relative">
             <div className="relative z-10">
                <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1">Clinic Revenue</p>
                <h3 className="text-2xl font-black text-slate-900">₹{data.billingStats.totalRevenue.toLocaleString('en-IN')}</h3>
                <button onClick={() => navigate('/reception/billing')} className="mt-4 text-[10px] font-black bg-emerald-500 text-white px-4 py-2 rounded-xl uppercase tracking-widest hover:scale-105 transition-all">View Billing Desk</button>
             </div>
             <CreditCard className="text-emerald-200 absolute -right-6 -bottom-6 w-32 h-32 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
          </div>
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 flex items-center justify-between group overflow-hidden relative shadow-xl">
             <div className="relative z-10">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">System Health</p>
                <h3 className="text-xl font-black text-white">Live Cloud Sync</h3>
                <div className="flex items-center gap-2 mt-4">
                   <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Active Connection</span>
                </div>
             </div>
             <Calendar className="text-white/5 absolute -right-6 -bottom-6 w-32 h-32 -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
          </div>
       </div>

      {/* Quick Desk Actions Bar */}
      <div className="bg-slate-900 p-6 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group mt-8">
        <div className="relative z-10 text-center md:text-left">
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">Medical Front Desk Console</h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Manage registration & bookings efficiently.</p>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-3 relative z-10">
          <button onClick={() => navigate("/reception/patients")} className="bg-white text-slate-900 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all hover:shadow-xl hover:shadow-purple-500/20 active:scale-95">
            New Registration
          </button>
          <button onClick={() => navigate("/reception/appointments")} className="bg-white/10 text-white border border-white/10 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all active:scale-95">
            Check Slots
          </button>
        </div>

        {/* Abstract design elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
      </div>
    </div>
  );
};

export default ReceptionDashboard;