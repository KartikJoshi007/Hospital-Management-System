import { useState, useEffect, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { motion } from 'framer-motion'
import { Users, Stethoscope, CalendarCheck, CreditCard, TrendingUp, ArrowUpRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PatientProfileModal from './PatientProfileModal'
import DoctorProfileModal from './DoctorProfileModal'
import api from '../../../api/axios'

// Static appointment chart data — no backend endpoint exists
const chartData = {
  day:   [
    { label: '12AM', appointments: 4  }, { label: '3AM',  appointments: 2  },
    { label: '6AM',  appointments: 8  }, { label: '9AM',  appointments: 31 },
    { label: '12PM', appointments: 47 }, { label: '3PM',  appointments: 38 },
    { label: '6PM',  appointments: 22 }, { label: '9PM',  appointments: 11 },
  ],
  week:  [
    { label: 'Mon', appointments: 42 }, { label: 'Tue', appointments: 58 },
    { label: 'Wed', appointments: 35 }, { label: 'Thu', appointments: 71 },
    { label: 'Fri', appointments: 63 }, { label: 'Sat', appointments: 29 },
    { label: 'Sun', appointments: 18 },
  ],
  month: [
    { label: 'W1', appointments: 210 }, { label: 'W2', appointments: 185 },
    { label: 'W3', appointments: 240 }, { label: 'W4', appointments: 198 },
  ],
  year:  [
    { label: 'Jan', appointments: 520 }, { label: 'Feb', appointments: 480 },
    { label: 'Mar', appointments: 610 }, { label: 'Apr', appointments: 570 },
    { label: 'May', appointments: 690 }, { label: 'Jun', appointments: 640 },
    { label: 'Jul', appointments: 710 }, { label: 'Aug', appointments: 680 },
    { label: 'Sep', appointments: 590 }, { label: 'Oct', appointments: 630 },
    { label: 'Nov', appointments: 550 }, { label: 'Dec', appointments: 500 },
  ],
}

const CHART_TABS = [
  { key: 'day', label: 'Day' }, { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' }, { key: 'year', label: 'Year' },
]

// Colors for pie chart — assigned by index
const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4']

const STATUS_COLORS = {
  Active:     'bg-emerald-50 text-emerald-600 border-emerald-100',
  Admitted:   'bg-blue-50 text-blue-600 border-blue-100',
  Discharged: 'bg-slate-50 text-slate-500 border-slate-100',
  'On Leave': 'bg-orange-50 text-orange-600 border-orange-100',
  Inactive:   'bg-rose-50 text-rose-500 border-rose-100',
}

function AdminDashboard() {
  const navigate = useNavigate()

  const [dashData,        setDashData]        = useState(null)
  const [loading,         setLoading]         = useState(true)
  const [chartTab,        setChartTab]        = useState('week')
  const [chartCache,      setChartCache]      = useState({})
  const [chartLoading,    setChartLoading]    = useState(false)
  const [dateFilter,      setDateFilter]      = useState('')
  const [statusFilter,    setStatusFilter]    = useState('')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [selectedDoctor,  setSelectedDoctor]  = useState(null)

  // GET /api/dashboard/stats
  useEffect(() => {
    api.get('/dashboard/stats')
      .then(res => setDashData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // GET /api/dashboard/appointments-chart?period=
  useEffect(() => {
    if (chartCache[chartTab]) return
    setChartLoading(true)
    api.get(`/dashboard/appointments-chart?period=${chartTab}`)
      .then(res => setChartCache(prev => ({ ...prev, [chartTab]: res.data.data || [] })))
      .catch(() => setChartCache(prev => ({ ...prev, [chartTab]: [] })))
      .finally(() => setChartLoading(false))
  }, [chartTab])

  // Stats cards from API
  const stats = [
    { label: 'Total Patients',      value: dashData?.totalPatients      ?? '—', icon: Users,         color: 'emerald', path: '/admin/patients'     },
    { label: 'Total Doctors',       value: dashData?.totalDoctors       ?? '—', icon: Stethoscope,   color: 'blue',    path: '/admin/doctors'      },
    { label: 'Appointments Today',  value: dashData?.appointmentsToday  ?? '—', icon: CalendarCheck, color: 'orange',  path: '/admin/appointments' },
    { label: 'Total Expenses',      value: dashData?.totalRevenue != null ? `₹${(dashData.totalRevenue / 100000).toFixed(1)}L` : '—', icon: CreditCard, color: 'purple', path: '/admin/billing' },
  ]

  // Revenue pie chart from API — assign colors by index
  const revenueData = (dashData?.revenueByDept || []).map((d, i) => ({
    name:  d.name || d._id || 'Other',
    value: d.value,
    color: PIE_COLORS[i % PIE_COLORS.length],
  }))

  // Recent patients from API
  const recentPatients = dashData?.recentPatients || []

  // On-duty doctors from API
  const onDutyDoctors = dashData?.onDutyDoctors || []

  // Filter recent patients by date and status
  const filteredPatients = useMemo(() => recentPatients.filter(p => {
    const byDate   = dateFilter   ? new Date(p.createdAt).toISOString().slice(0, 10) === dateFilter : true
    const byStatus = statusFilter ? p.status === statusFilter : true
    return byDate && byStatus
  }), [recentPatients, dateFilter, statusFilter])

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
          <motion.div key={idx}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}
            onClick={() => navigate(s.path)}
            className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all group cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-slate-50 text-slate-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <s.icon size={20} />
              </div>
              <TrendingUp size={12} className="text-emerald-500 mt-1" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{s.label}</p>
            <h3 className="text-2xl font-black text-slate-900">
              {loading ? '—' : s.value}
            </h3>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Bar Chart — static appointment data */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 p-8 rounded-3xl bg-white border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 border-l-4 border-emerald-500 pl-3 uppercase tracking-widest">Appointments</h3>
              <p className="text-xs font-bold text-slate-400 pl-4 mt-0.5">Appointment volume over time</p>
            </div>
            <button onClick={() => navigate('/admin/appointments')} className="p-2 hover:bg-emerald-50 rounded-lg transition-colors group">
              <ArrowUpRight size={18} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
            </button>
          </div>
          <div className="flex gap-1 mb-5">
            {CHART_TABS.map(t => (
              <button key={t.key} onClick={() => setChartTab(t.key)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  chartTab === t.key ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                }`}>{t.label}</button>
            ))}
          </div>
          <div className="h-56">
            {chartLoading ? (
              <div className="h-full flex items-center justify-center text-xs font-bold text-slate-300">Loading...</div>
            ) : !chartCache[chartTab]?.length ? (
              <div className="h-full flex items-center justify-center text-xs font-bold text-slate-300">No appointment data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartCache[chartTab]} barSize={28}>
                  <XAxis dataKey="label" tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 700 }} cursor={{ fill: '#f1f5f9' }} />
                  <Bar dataKey="appointments" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Pie Chart — real revenue by dept */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-black text-slate-900 border-l-4 border-emerald-500 pl-3 uppercase tracking-widest">Revenue Split</h3>
            <p className="text-xs font-bold text-slate-400 pl-4 mt-0.5">By department</p>
          </div>
          <div className="h-44 flex-1 min-h-0">
            {loading || revenueData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs font-bold text-slate-300">
                {loading ? 'Loading...' : 'No revenue data'}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={revenueData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={6} dataKey="value">
                    {revenueData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '11px', fontWeight: 700 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
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
        <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none focus:border-emerald-400 transition-all" />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none focus:border-emerald-400 transition-all appearance-none min-w-32">
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Admitted">Admitted</option>
          <option value="Discharged">Discharged</option>
        </select>
        {(dateFilter || statusFilter) && (
          <button onClick={() => { setDateFilter(''); setStatusFilter('') }}
            className="px-4 py-2 rounded-xl bg-rose-50 text-rose-500 text-xs font-black uppercase tracking-widest border border-rose-100 hover:bg-rose-500 hover:text-white transition-all">
            Clear
          </button>
        )}
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Recent Patients — from API */}
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
                  {['Patient', 'Age', 'Status', 'Date'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-xs font-bold text-slate-400">Loading...</td></tr>
                ) : filteredPatients.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-xs font-bold text-slate-400">No records found</td></tr>
                ) : filteredPatients.map(p => (
                  <tr key={p._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div onClick={() => setSelectedPatient(p)}
                          className="h-8 w-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-black group-hover:bg-emerald-500 group-hover:text-white transition-colors shrink-0 cursor-pointer">
                          {p.name?.charAt(0)}
                        </div>
                        <p className="text-xs font-black text-slate-900">{p.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-xs font-bold text-slate-600">{p.age ? `${p.age} yrs` : '—'}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${STATUS_COLORS[p.status] || STATUS_COLORS.Active}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-[10px] font-bold text-slate-400">
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-GB') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* On-Duty Doctors — from API */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">On-Duty Doctors</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">{onDutyDoctors.length} doctors</p>
            </div>
            <button onClick={() => navigate('/admin/doctors')} className="text-[10px] font-black text-emerald-600 hover:underline uppercase tracking-widest">
              View All →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50">
                  {['Doctor', 'Specialization', 'Shift', 'Rating'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-xs font-bold text-slate-400">Loading...</td></tr>
                ) : onDutyDoctors.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-xs font-bold text-slate-400">No doctors on duty</td></tr>
                ) : onDutyDoctors.map(d => (
                  <tr key={d._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div onClick={() => setSelectedDoctor(d)}
                          className="h-8 w-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-black group-hover:bg-emerald-500 group-hover:text-white transition-colors shrink-0 cursor-pointer">
                          {d.name?.split(' ').slice(1).map(n => n[0]).join('') || '?'}
                        </div>
                        <p className="text-xs font-black text-slate-900">{d.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-wider border border-emerald-100">
                        {d.specialization}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-xs font-bold text-slate-600">{d.shift || '—'}</td>
                    <td className="px-6 py-3 text-xs font-black text-slate-700">{d.rating ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedPatient && <PatientProfileModal patient={selectedPatient} onClose={() => setSelectedPatient(null)} />}
      {selectedDoctor  && <DoctorProfileModal  doctor={selectedDoctor}   onClose={() => setSelectedDoctor(null)}  />}

    </div>
  )
}

export default AdminDashboard
