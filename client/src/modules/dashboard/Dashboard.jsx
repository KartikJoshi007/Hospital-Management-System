import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { 
  Users, 
  Calendar, 
  CreditCard, 
  Activity, 
  TrendingUp, 
  ArrowUpRight, 
  Clock, 
  ShoppingBag 
} from 'lucide-react'
import { motion } from 'framer-motion'

const stats = [
  { 
    label: 'Total Patients', 
    value: '12,842', 
    change: '+12.5%', 
    trend: 'up', 
    icon: Users, 
    color: 'emerald' 
  },
  { 
    label: 'Appointments', 
    value: '184', 
    change: '+8.2%', 
    trend: 'up', 
    icon: Calendar, 
    color: 'blue' 
  },
  { 
    label: 'Total Revenue', 
    value: '₹14.2L', 
    change: '+14.1%', 
    trend: 'up', 
    icon: CreditCard, 
    color: 'orange' 
  },
  { 
    label: 'Active Pharmacy', 
    value: '1,240', 
    change: '-2.4%', 
    trend: 'down', 
    icon: ShoppingBag, 
    color: 'purple' 
  },
]

const pieData = [
  { name: 'Cardiology', value: 400, color: '#10b981' },
  { name: 'Neurology', value: 300, color: '#3b82f6' },
  { name: 'Orthopedics', value: 300, color: '#f59e0b' },
  { name: 'Dermatology', value: 200, color: '#8b5cf6' },
  { name: 'Emergency', value: 100, color: '#ef4444' },
]

const recentAppointments = [
  { name: 'Rohan Sharma', time: '10:30 AM', status: 'Confirmed', dept: 'Cardiology' },
  { name: 'Priya Verma', time: '11:15 AM', status: 'Pending', dept: 'Neurology' },
  { name: 'Amit Patel', time: '12:00 PM', status: 'Confirmed', dept: 'Orthopedics' },
  { name: 'Sara Khan', time: '01:30 PM', status: 'Cancelled', dept: 'Dermatology' },
]

function Dashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Hospital Overview</h1>
        <p className="text-slate-500 font-medium text-sm">Welcome back, Admin! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-slate-50 text-slate-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <stat.icon size={20} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-black ${stat.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {stat.change}
                {stat.trend === 'up' ? <TrendingUp size={12} /> : <Activity size={12} />}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Circular Graph Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-1 p-8 rounded-3xl bg-white border border-slate-100 shadow-sm flex flex-col items-center"
        >
          <div className="w-full mb-6">
            <h3 className="text-lg font-black text-slate-900 border-l-4 border-emerald-500 pl-4 uppercase tracking-widest">Patient Distribution</h3>
            <p className="text-xs font-bold text-slate-400 pl-5">Distribution by Department</p>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full mt-4">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-[10px] font-black text-slate-500 uppercase truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 p-8 rounded-3xl bg-white border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-black text-slate-900 border-l-4 border-emerald-500 pl-4 uppercase tracking-widest">Daily Appointments</h3>
              <p className="text-xs font-bold text-slate-400 pl-5">Real-time status tracking</p>
            </div>
            <button className="p-2 hover:bg-emerald-50 rounded-lg transition-colors group">
              <ArrowUpRight size={20} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
            </button>
          </div>

          <div className="space-y-4">
            {recentAppointments.map((apt, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 hover:border-emerald-100 hover:bg-emerald-50/10 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-black group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                    {apt.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{apt.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock size={10} className="text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{apt.time} • {apt.dept}</span>
                    </div>
                  </div>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border
                  ${apt.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                    apt.status === 'Pending' ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                    'bg-rose-50 text-rose-600 border-rose-100'}`}>
                  {apt.status}
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-8 py-4 rounded-2xl bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all transform hover:scale-[1.01] active:scale-95 shadow-sm">
            View All Records
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard
