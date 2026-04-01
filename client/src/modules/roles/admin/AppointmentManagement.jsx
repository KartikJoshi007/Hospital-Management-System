import { useState, useMemo } from 'react'
import { Search, Check, X, UserCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const DOCTORS = ['Dr. Aryan Mehta', 'Dr. Sneha Verma', 'Dr. Rahul Patil', 'Dr. Nisha Iyer']

const initialAppointments = [
  { id: 'A-001', patient: 'Rohan Sharma', doctor: 'Dr. Aryan Mehta', dept: 'Cardiology', date: '2024-06-12', time: '10:30 AM', status: 'Pending', reason: 'Chest pain' },
  { id: 'A-002', patient: 'Priya Verma', doctor: 'Dr. Sneha Verma', dept: 'Neurology', date: '2024-06-12', time: '11:15 AM', status: 'Confirmed', reason: 'Headache' },
  { id: 'A-003', patient: 'Amit Patel', doctor: 'Dr. Rahul Patil', dept: 'Orthopedics', date: '2024-06-13', time: '12:00 PM', status: 'Pending', reason: 'Knee pain' },
  { id: 'A-004', patient: 'Sara Khan', doctor: 'Dr. Nisha Iyer', dept: 'Dermatology', date: '2024-06-13', time: '01:30 PM', status: 'Cancelled', reason: 'Skin rash' },
  { id: 'A-005', patient: 'Vikram Singh', doctor: 'Dr. Aryan Mehta', dept: 'Cardiology', date: '2024-06-14', time: '09:00 AM', status: 'Confirmed', reason: 'Follow-up' },
]

const STATUS_COLORS = {
  Pending: 'bg-orange-50 text-orange-600 border-orange-100',
  Confirmed: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  Cancelled: 'bg-rose-50 text-rose-500 border-rose-100',
}

function AppointmentManagement() {
  const [appointments, setAppointments] = useState(initialAppointments)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [assignTarget, setAssignTarget] = useState(null)
  const [selectedDoctor, setSelectedDoctor] = useState('')
  const [message, setMessage] = useState('')

  const filtered = useMemo(() => appointments.filter(a => {
    const bySearch = search ? a.patient.toLowerCase().includes(search.toLowerCase()) || a.doctor.toLowerCase().includes(search.toLowerCase()) : true
    const byStatus = statusFilter ? a.status === statusFilter : true
    const byDate = dateFilter ? a.date === dateFilter : true
    return bySearch && byStatus && byDate
  }), [appointments, search, statusFilter, dateFilter])

  const updateStatus = (id, status) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    setMessage(`Appointment ${status.toLowerCase()} successfully`)
    setTimeout(() => setMessage(''), 3000)
  }

  const assignDoctor = () => {
    if (!selectedDoctor) return
    setAppointments(prev => prev.map(a => a.id === assignTarget.id ? { ...a, doctor: selectedDoctor, status: 'Confirmed' } : a))
    setMessage(`Doctor assigned: ${selectedDoctor}`)
    setAssignTarget(null)
    setSelectedDoctor('')
    setTimeout(() => setMessage(''), 3000)
  }

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">

      {/* Header */}
      <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 border-l-4 border-emerald-500 pl-4">Appointment Management</h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 pl-5">View, approve, cancel and assign doctors to appointments</p>
      </div>

      {message && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="px-5 py-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-xs font-black text-emerald-700">
          ✓ {message}
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input type="text" placeholder="Search patient or doctor..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition-all placeholder:text-slate-400" />
        </div>
        <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
          className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-emerald-400 transition-all" />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-emerald-400 transition-all appearance-none min-w-[140px]">
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        {(search || statusFilter || dateFilter) && (
          <button onClick={() => { setSearch(''); setStatusFilter(''); setDateFilter('') }}
            className="px-4 py-3 rounded-xl bg-rose-50 text-rose-500 text-xs font-black uppercase tracking-widest border border-rose-100 hover:bg-rose-500 hover:text-white transition-all">
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                {['Patient', 'Doctor', 'Date & Time', 'Reason', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-xs font-bold text-slate-400">No appointments found</td></tr>
              ) : filtered.map((a, idx) => (
                <motion.tr key={a.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}
                  className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-black group-hover:bg-emerald-500 group-hover:text-white transition-all shrink-0">
                        {a.patient.charAt(0)}
                      </div>
                      <p className="text-xs font-black text-slate-900">{a.patient}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-slate-700">{a.doctor}</p>
                    <p className="text-[9px] font-bold text-slate-400">{a.dept}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-slate-700">{a.date}</p>
                    <p className="text-[9px] font-bold text-slate-400">{a.time}</p>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600 max-w-[120px] truncate">{a.reason}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${STATUS_COLORS[a.status]}`}>{a.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      {a.status === 'Pending' && (
                        <button onClick={() => updateStatus(a.id, 'Confirmed')} className="p-2 rounded-lg text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all" title="Approve">
                          <Check size={14} />
                        </button>
                      )}
                      {a.status !== 'Cancelled' && (
                        <button onClick={() => updateStatus(a.id, 'Cancelled')} className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all" title="Cancel">
                          <X size={14} />
                        </button>
                      )}
                      <button onClick={() => { setAssignTarget(a); setSelectedDoctor(a.doctor) }} className="p-2 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-500 transition-all" title="Assign Doctor">
                        <UserCheck size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Doctor Modal */}
      <AnimatePresence>
        {assignTarget && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Assign Doctor</h3>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-0.5">For {assignTarget.patient}</p>
                </div>
                <button onClick={() => setAssignTarget(null)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all border border-slate-100"><X size={18} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Select Doctor</label>
                  <select value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-emerald-400 transition-all appearance-none">
                    {DOCTORS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setAssignTarget(null)} className="flex-1 py-3 rounded-xl border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
                  <button onClick={assignDoctor} className="flex-1 py-3 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-500 transition-all active:scale-95">Assign</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AppointmentManagement
