import { useState, useEffect, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'
import { CalendarCheck, Users, FileText, Clock, TrendingUp, TrendingDown, ArrowUpRight, CheckCircle2, Circle, AlertCircle, MapPin, Stethoscope, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../../hooks/useAuth'
import { getDoctorByUserId } from '../../doctors/doctorApi'
import { getDoctorAppointments } from '../../appointments/appointmentApi'

function DoctorDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [doctorProfile, setDoctorProfile] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [stats, setStats] = useState([])

  const todayStr = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return
      try {
        setLoading(true)
        // 1. Get Doctor Profile
        const profRes = await getDoctorByUserId(user.id)
        const profile = profRes.data
        setDoctorProfile(profile)

        // 2. Get Doctor Appointments
        const d = new Date().toISOString().split('T')[0]
        const apptRes = await getDoctorAppointments(profile._id, 1, 100)
        const allAppts = Array.isArray(apptRes.data) ? apptRes.data : (apptRes.data?.appointments || [])
        setAppointments(allAppts)

        // 3. Derived Today's Appts
        const todayAppts = allAppts.filter(a => {
          const aDate = new Date(a.date).toISOString().split('T')[0]
          return aDate === d
        })

        // 4. Update Stats
        const completed = allAppts.filter(a => a.status === 'Completed').length
        setStats([
          { label: "Today's Appointments", value: todayAppts.length.toString(), change: '+0', trend: 'up', icon: CalendarCheck, path: '/doctor/appointments' },
          { label: 'Total Patients', value: profile.patients?.toString() || '0', change: '+0', trend: 'up', icon: Users, path: '/doctor/patients' },
          { label: 'Completed Visits', value: completed.toString(), change: '+0', trend: 'up', icon: CheckCircle2, path: '/doctor/appointments' },
          { label: 'On Duty Status', value: profile.isOnDuty ? 'Yes' : 'No', change: '', trend: 'up', icon: Clock, path: '/doctor/schedule' },
        ])

      } catch (err) {
        console.error("Doctor dashboard fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user?.id])

  const weeklyData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const counts = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 }

    appointments.forEach(a => {
      const dayName = days[new Date(a.date).getDay()]
      counts[dayName]++
    })

    return days.map(d => ({ day: d, appointments: counts[d] }))
  }, [appointments])

  const todayAppointments = useMemo(() => {
    const d = new Date().toISOString().split('T')[0]
    return appointments.filter(a => new Date(a.date).toISOString().split('T')[0] === d).slice(0, 5)
  }, [appointments])

  const statusSummary = useMemo(() => {
    const counts = { Completed: 0, 'In Progress': 0, Waiting: 0, Scheduled: 0 }
    todayAppointments.forEach(a => {
      const s = a.status === 'Pending' ? 'Scheduled' : a.status
      if (counts[s] !== undefined) counts[s]++
    })
    return [
      { label: 'Completed', count: counts.Completed, color: 'bg-emerald-500' },
      { label: 'In Progress', count: counts['In Progress'], color: 'bg-blue-500' },
      { label: 'Waiting', count: counts.Waiting, color: 'bg-orange-400' },
      { label: 'Scheduled', count: counts.Scheduled, color: 'bg-slate-300' },
    ]
  }, [todayAppointments])

  const STATUS_CONFIG = {
    Completed: { color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: <CheckCircle2 size={10} /> },
    'In Progress': { color: 'bg-blue-50 text-blue-600 border-blue-100', icon: <AlertCircle size={10} /> },
    Waiting: { color: 'bg-orange-50 text-orange-600 border-orange-100', icon: <Circle size={10} /> },
    Scheduled: { color: 'bg-slate-50 text-slate-500 border-slate-100', icon: <Clock size={10} /> },
    Pending: { color: 'bg-amber-50 text-amber-600 border-amber-100', icon: <Clock size={10} /> },
  }

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Consulting clinical cloud...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Good morning, {user?.name?.split(' ')[0] || 'Doctor'} 👋
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">{todayStr} — Here's your daily overview.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${doctorProfile?.isOnDuty ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
            {doctorProfile?.isOnDuty ? '● On Duty' : '○ Off Duty'}
          </div>
        </div>
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
              <div className={`flex items-center gap-1 text-[10px] font-black ${s.trend === 'up' ? 'text-emerald-600' : 'text-rose-500'} bg-slate-50 px-2 py-1 rounded-full uppercase tracking-tighter`}>
                {s.change}
                <TrendingUp size={10} />
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
              <h3 className="text-sm font-black text-slate-900 border-l-4 border-blue-500 pl-3 uppercase tracking-widest">Weekly Load</h3>
              <p className="text-xs font-bold text-slate-400 pl-4 mt-0.5">Appointment volume distribution</p>
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
          {statusSummary.map((item, i) => (
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
              <span>Today's Progress</span>
              <span>{statusSummary[0].count} / {todayAppointments.length}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{ width: `${todayAppointments.length > 0 ? (statusSummary[0].count / todayAppointments.length) * 100 : 0}%` }}
              />
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
          <button onClick={() => navigate('/doctor/appointments')} className="text-[10px] font-black text-blue-600 hover:scale-110 transition-transform uppercase tracking-widest">
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
              {todayAppointments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-xs font-bold text-slate-400">No scheduled visits for today</td>
                </tr>
              ) : todayAppointments.map((a) => {
                const s = STATUS_CONFIG[a.status] || STATUS_CONFIG.Pending
                return (
                  <tr key={a._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-black group-hover:bg-blue-500 group-hover:text-white transition-colors shrink-0">
                          {a.patient?.charAt(0) || "P"}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900">{a.patient}</p>
                          <p className="text-[9px] font-bold text-slate-400">{a.type} · {a._id.slice(-6).toUpperCase()}</p>
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

      {/* Upcoming Section & Recent Patients (Derived from latest appts) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Upcoming */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Upcoming</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">Scheduled for next few days</p>
            </div>
            <button onClick={() => navigate('/doctor/appointments')} className="p-2 hover:bg-blue-50 rounded-lg transition-colors group">
              <ArrowUpRight size={18} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
            </button>
          </div>
          <div className="divide-y divide-slate-50 p-2">
            {appointments.filter(a => new Date(a.date) > new Date()).slice(0, 5).map((a, idx) => (
              <div key={a._id} className="flex items-center gap-4 px-4 py-4 hover:bg-slate-50/50 rounded-2xl transition-colors group">
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-black group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  {a.patient?.charAt(0) || "P"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-slate-900">{a.patient}</p>
                  <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <Clock size={10} /> {new Date(a.date).toLocaleDateString()} · {a.time}
                  </p>
                </div>
                <span className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-50 text-slate-500 text-[9px] font-black uppercase tracking-wider border border-slate-100">
                  {a.type}
                </span>
              </div>
            ))}
            {appointments.filter(a => new Date(a.date) > new Date()).length === 0 && (
              <div className="py-10 text-center text-xs font-bold text-slate-400">No upcoming visits</div>
            )}
          </div>
        </div>

        {/* Recent Patient List (Most recent appointments) */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Recent Activity</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">Latest clinical interactions</p>
            </div>
            <button onClick={() => navigate('/doctor/patients')} className="p-2 hover:bg-blue-50 rounded-lg transition-colors group">
              <ArrowUpRight size={18} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50">
                  {['Patient', 'Purpose', 'Date'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {appointments.slice(0, 5).map((a) => (
                  <tr key={a._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-3">
                      <div className="flex gap-3 items-center">
                        <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-black group-hover:bg-blue-500 group-hover:text-white transition-colors shrink-0">
                          {a.patient?.charAt(0) || "P"}
                        </div>
                        <p className="text-xs font-black text-slate-900">{a.patient}</p>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">{a.type}</span>
                    </td>
                    <td className="px-6 py-3 text-[10px] font-bold text-slate-400">{new Date(a.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  )
}

export default DoctorDashboard
