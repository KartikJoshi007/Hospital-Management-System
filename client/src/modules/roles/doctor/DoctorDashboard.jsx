import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'
import { CalendarCheck, Users, FileText, Clock, TrendingUp, TrendingDown, ArrowUpRight, CheckCircle2, Circle, AlertCircle, MapPin, Stethoscope } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../../hooks/useAuth'

const stats = [
  { label: "Today's Appointments", value: '12', change: '+3', trend: 'up', icon: CalendarCheck, path: '/doctor/appointments' },
  { label: 'Total Patients', value: '148', change: '+5', trend: 'up', icon: Users, path: '/doctor/patients' },
  { label: 'Pending Records', value: '7', change: '-2', trend: 'down', icon: FileText, path: '/doctor/records' },
  { label: 'Schedule Slots', value: '4', change: '+1', trend: 'up', icon: Clock, path: '/doctor/schedule' },
]

const weeklyData = [
  { day: 'Mon', appointments: 8 },
  { day: 'Tue', appointments: 14 },
  { day: 'Wed', appointments: 10 },
  { day: 'Thu', appointments: 12 },
  { day: 'Fri', appointments: 9 },
  { day: 'Sat', appointments: 5 },
  { day: 'Sun', appointments: 3 },
]

const todayAppointments = [
  { id: 'A-101', patient: 'Rohan Sharma', age: 34, time: '09:00 AM', type: 'OPD', status: 'Completed' },
  { id: 'A-102', patient: 'Priya Verma', age: 28, time: '10:30 AM', type: 'Follow-up', status: 'In Progress' },
  { id: 'A-103', patient: 'Amit Patel', age: 45, time: '11:00 AM', type: 'OPD', status: 'Waiting' },
  { id: 'A-104', patient: 'Sara Khan', age: 31, time: '12:00 PM', type: 'Consultation', status: 'Waiting' },
  { id: 'A-105', patient: 'Vikram Singh', age: 52, time: '02:00 PM', type: 'Follow-up', status: 'Scheduled' },
]

const recentPatients = [
  { id: 'P-001', name: 'Rohan Sharma', age: 34, gender: 'Male', condition: 'Hypertension', lastVisit: '2024-06-10' },
  { id: 'P-002', name: 'Priya Verma', age: 28, gender: 'Female', condition: 'Migraine', lastVisit: '2024-06-11' },
  { id: 'P-003', name: 'Amit Patel', age: 45, gender: 'Male', condition: 'Diabetes', lastVisit: '2024-06-09' },
  { id: 'P-004', name: 'Sara Khan', age: 31, gender: 'Female', condition: 'Asthma', lastVisit: '2024-06-12' },
]

const upcomingAppointments = [
  { id: 'A-106', patient: 'Neha Gupta',    age: 26, date: 'Tomorrow',    time: '09:30 AM', type: 'OPD',          location: 'Room 204', avatar: 'N' },
  { id: 'A-107', patient: 'Ravi Desai',    age: 41, date: 'Tomorrow',    time: '11:00 AM', type: 'Follow-up',    location: 'Room 204', avatar: 'R' },
  { id: 'A-108', patient: 'Meena Joshi',   age: 55, date: 'Jun 15',      time: '10:00 AM', type: 'Consultation', location: 'Room 204', avatar: 'M' },
  { id: 'A-109', patient: 'Arjun Nair',    age: 30, date: 'Jun 15',      time: '02:30 PM', type: 'OPD',          location: 'Room 204', avatar: 'A' },
  { id: 'A-110', patient: 'Sunita Rao',    age: 48, date: 'Jun 16',      time: '09:00 AM', type: 'Follow-up',    location: 'Room 204', avatar: 'S' },
]

const STATUS_CONFIG = {
  Completed:   { color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: <CheckCircle2 size={10} /> },
  'In Progress': { color: 'bg-blue-50 text-blue-600 border-blue-100', icon: <AlertCircle size={10} /> },
  Waiting:     { color: 'bg-orange-50 text-orange-600 border-orange-100', icon: <Circle size={10} /> },
  Scheduled:   { color: 'bg-slate-50 text-slate-500 border-slate-100', icon: <Clock size={10} /> },
}

function DoctorDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-500">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          Good morning, {user?.fullName?.split(' ')[0] || 'Doctor'} 👋
        </h1>
        <p className="text-slate-500 font-medium text-sm mt-1">{today} — Here's your daily overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
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
              <div className="p-3 rounded-xl bg-slate-50 text-slate-600 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <s.icon size={20} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-black ${s.trend === 'up' ? 'text-emerald-600' : 'text-rose-500'}`}>
                {s.change}
                {s.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              </div>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{s.label}</p>
            <h3 className="text-2xl font-black text-slate-900">{s.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Chart + Today's Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 p-8 rounded-3xl bg-white border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-black text-slate-900 border-l-4 border-blue-500 pl-3 uppercase tracking-widest">Weekly Appointments</h3>
              <p className="text-xs font-bold text-slate-400 pl-4 mt-0.5">Appointment volume this week</p>
            </div>
            <button onClick={() => navigate('/doctor/appointments')} className="p-2 hover:bg-blue-50 rounded-lg transition-colors group">
              <ArrowUpRight size={18} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
            </button>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} barSize={28}>
                <XAxis dataKey="day" tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 700 }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar dataKey="appointments" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Quick Stats Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm flex flex-col gap-4"
        >
          <h3 className="text-sm font-black text-slate-900 border-l-4 border-blue-500 pl-3 uppercase tracking-widest">Today's Status</h3>
          {[
            { label: 'Completed', count: 1, color: 'bg-emerald-500' },
            { label: 'In Progress', count: 1, color: 'bg-blue-500' },
            { label: 'Waiting', count: 2, color: 'bg-orange-400' },
            { label: 'Scheduled', count: 1, color: 'bg-slate-300' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                <span className="text-xs font-bold text-slate-600">{item.label}</span>
              </div>
              <span className="text-sm font-black text-slate-900">{item.count}</span>
            </div>
          ))}
          <div className="mt-auto pt-4 border-t border-slate-100">
            <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
              <span>Progress</span>
              <span>1 / 5</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full w-1/5 rounded-full bg-blue-500 transition-all" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Today's Appointments Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Today's Appointments</h3>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5">{todayAppointments.length} scheduled</p>
          </div>
          <button onClick={() => navigate('/doctor/appointments')} className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-widest">
            View All →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50">
                {['Patient', 'Time', 'Type', 'Status'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {todayAppointments.map((a) => {
                const s = STATUS_CONFIG[a.status]
                return (
                  <tr key={a.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-black group-hover:bg-blue-500 group-hover:text-white transition-colors shrink-0">
                          {a.patient.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900">{a.patient}</p>
                          <p className="text-[9px] font-bold text-slate-400">{a.age} yrs · {a.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-xs font-bold text-slate-600">{a.time}</td>
                    <td className="px-6 py-3">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-wider border border-blue-100">
                        {a.type}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${s.color}`}>
                        {s.icon}{a.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Upcoming Appointments</h3>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5">{upcomingAppointments.length} scheduled ahead</p>
          </div>
          <button onClick={() => navigate('/doctor/appointments')} className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-widest">
            View All →
          </button>
        </div>
        <div className="divide-y divide-slate-50">
          {upcomingAppointments.map((a, idx) => (
            <div key={a.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors group">
              {/* Timeline dot */}
              <div className="flex flex-col items-center shrink-0">
                <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center text-xs font-black group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  {a.avatar}
                </div>
                {idx < upcomingAppointments.length - 1 && (
                  <div className="w-px h-4 bg-slate-100 mt-1" />
                )}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs font-black text-slate-900">{a.patient}</p>
                  <span className="text-[9px] font-bold text-slate-400">{a.age} yrs · {a.id}</span>
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                    <Clock size={10} />{a.date} · {a.time}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                    <MapPin size={10} />{a.location}
                  </span>
                </div>
              </div>
              {/* Type badge */}
              <span className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-wider border border-blue-100">
                <Stethoscope size={9} />{a.type}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent Patients */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Recent Patients</h3>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5">{recentPatients.length} records</p>
          </div>
          <button onClick={() => navigate('/doctor/patients')} className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-widest">
            View All →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50">
                {['Patient', 'Gender', 'Condition', 'Last Visit'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentPatients.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-black group-hover:bg-blue-500 group-hover:text-white transition-colors shrink-0">
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900">{p.name}</p>
                        <p className="text-[9px] font-bold text-slate-400">{p.age} yrs · {p.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-xs font-bold text-slate-600">{p.gender}</td>
                  <td className="px-6 py-3">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 text-[9px] font-black uppercase tracking-wider border border-slate-100">
                      {p.condition}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-[10px] font-bold text-slate-400">{p.lastVisit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

export default DoctorDashboard
