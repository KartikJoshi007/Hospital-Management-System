import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { motion } from 'framer-motion'
import { Users, Stethoscope, CalendarCheck, CreditCard, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const stats = [
  { label: 'Total Patients', value: '12,842', change: '+12.5%', trend: 'up', icon: Users, color: 'emerald', path: '/admin/patients' },
  { label: 'Total Doctors', value: '48', change: '+4.1%', trend: 'up', icon: Stethoscope, color: 'blue', path: '/admin/doctors' },
  { label: 'Appointments Today', value: '184', change: '+8.2%', trend: 'up', icon: CalendarCheck, color: 'orange', path: '/admin/appointments' },
  { label: 'Total Revenue', value: '₹14.2L', change: '-2.4%', trend: 'down', icon: CreditCard, color: 'purple', path: '/admin/billing' },
]

const appointmentData = [
  { day: 'Mon', appointments: 42 },
  { day: 'Tue', appointments: 58 },
  { day: 'Wed', appointments: 35 },
  { day: 'Thu', appointments: 71 },
  { day: 'Fri', appointments: 63 },
  { day: 'Sat', appointments: 29 },
  { day: 'Sun', appointments: 18 },
]

const revenueData = [
  { name: 'OPD', value: 400, color: '#10b981' },
  { name: 'IPD', value: 300, color: '#3b82f6' },
  { name: 'Pharmacy', value: 200, color: '#f59e0b' },
  { name: 'Lab', value: 100, color: '#8b5cf6' },
]

const allPatients = [
  { id: 'P-001', name: 'Rohan Sharma', age: 34, gender: 'Male', status: 'Active', date: '2024-06-10' },
  { id: 'P-002', name: 'Priya Verma', age: 28, gender: 'Female', status: 'Admitted', date: '2024-06-11' },
  { id: 'P-003', name: 'Amit Patel', age: 45, gender: 'Male', status: 'Discharged', date: '2024-06-09' },
  { id: 'P-004', name: 'Sara Khan', age: 31, gender: 'Female', status: 'Active', date: '2024-06-12' },
  { id: 'P-005', name: 'Vikram Singh', age: 52, gender: 'Male', status: 'Admitted', date: '2024-06-08' },
]

const allDoctors = [
  { id: 'D-001', name: 'Dr. Aryan Mehta', dept: 'Cardiology', status: 'Active', patients: 24 },
  { id: 'D-002', name: 'Dr. Sneha Verma', dept: 'Neurology', status: 'Active', patients: 18 },
  { id: 'D-003', name: 'Dr. Rahul Patil', dept: 'Orthopedics', status: 'On Leave', patients: 0 },
  { id: 'D-004', name: 'Dr. Nisha Iyer', dept: 'Dermatology', status: 'Active', patients: 12 },
]

const STATUS_COLORS = {
  Active: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  Admitted: 'bg-blue-50 text-blue-600 border-blue-100',
  Discharged: 'bg-slate-50 text-slate-500 border-slate-100',
  'On Leave': 'bg-orange-50 text-orange-600 border-orange-100',
}

function AdminDashboard() {
  const navigate = useNavigate()
  const [dateFilter, setDateFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const filteredPatients = useMemo(() => {
    return allPatients.filter(p => {
      const byDate = dateFilter ? p.date === dateFilter : true
      const byStatus = statusFilter ? p.status === statusFilter : true
      return byDate && byStatus
    })
  }, [dateFilter, statusFilter])

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-500">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 font-medium text-sm mt-1">Hospital overview — real-time metrics & operations.</p>
      </div>

      {/* Stats Cards */}
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
              <div className="p-3 rounded-xl bg-slate-50 text-slate-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Bar Chart — Appointments per day */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 p-8 rounded-3xl bg-white border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-black text-slate-900 border-l-4 border-emerald-500 pl-3 uppercase tracking-widest">Appointments / Week</h3>
              <p className="text-xs font-bold text-slate-400 pl-4 mt-0.5">Daily appointment volume</p>
            </div>
            <button onClick={() => navigate('/admin/appointments')} className="p-2 hover:bg-emerald-50 rounded-lg transition-colors group">
              <ArrowUpRight size={18} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
            </button>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appointmentData} barSize={28}>
                <XAxis dataKey="day" tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 700 }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar dataKey="appointments" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pie Chart — Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm flex flex-col"
        >
          <div className="mb-4">
            <h3 className="text-sm font-black text-slate-900 border-l-4 border-emerald-500 pl-3 uppercase tracking-widest">Revenue Split</h3>
            <p className="text-xs font-bold text-slate-400 pl-4 mt-0.5">By department</p>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={revenueData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={6} dataKey="value">
                  {revenueData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '11px', fontWeight: 700 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {revenueData.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-[10px] font-black text-slate-500 uppercase truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter:</p>
        <input
          type="date"
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none focus:border-emerald-400 transition-all"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none focus:border-emerald-400 transition-all appearance-none min-w-[140px]"
        >
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Admitted">Admitted</option>
          <option value="Discharged">Discharged</option>
        </select>
        {(dateFilter || statusFilter) && (
          <button
            onClick={() => { setDateFilter(''); setStatusFilter('') }}
            className="px-4 py-2 rounded-xl bg-rose-50 text-rose-500 text-xs font-black uppercase tracking-widest border border-rose-100 hover:bg-rose-500 hover:text-white transition-all"
          >
            Clear
          </button>
        )}
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Patient Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Recent Patients</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">{filteredPatients.length} records</p>
            </div>
            <button onClick={() => navigate('/admin/patients')} className="text-[10px] font-black text-emerald-600 hover:underline uppercase tracking-widest">
              View All →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Patient</th>
                  <th className="px-6 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Age</th>
                  <th className="px-6 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredPatients.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-xs font-bold text-slate-400">No records match filters</td></tr>
                ) : filteredPatients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-black group-hover:bg-emerald-500 group-hover:text-white transition-colors shrink-0">
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900">{p.name}</p>
                          <p className="text-[9px] font-bold text-slate-400">{p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-xs font-bold text-slate-600">{p.age} yrs</td>
                    <td className="px-6 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${STATUS_COLORS[p.status]}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-[10px] font-bold text-slate-400">{p.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Doctor Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">On-Duty Doctors</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">{allDoctors.length} doctors</p>
            </div>
            <button onClick={() => navigate('/admin/doctors')} className="text-[10px] font-black text-emerald-600 hover:underline uppercase tracking-widest">
              View All →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Doctor</th>
                  <th className="px-6 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Dept</th>
                  <th className="px-6 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Patients</th>
                  <th className="px-6 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {allDoctors.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-black group-hover:bg-emerald-500 group-hover:text-white transition-colors shrink-0">
                          {d.name.split(' ').slice(1).map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900">{d.name}</p>
                          <p className="text-[9px] font-bold text-slate-400">{d.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-wider border border-emerald-100">
                        {d.dept}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-xs font-black text-slate-700">{d.patients}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${STATUS_COLORS[d.status]}`}>
                        {d.status}
                      </span>
                    </td>
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

export default AdminDashboard
