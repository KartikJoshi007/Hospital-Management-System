import { useState, useEffect, useMemo } from 'react'
import { Search, Check, X, UserCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../../api/axios'

const STATUS_COLORS = {
  Pending:     'bg-orange-50 text-orange-600 border-orange-100',
  Confirmed:   'bg-emerald-50 text-emerald-600 border-emerald-100',
  Scheduled:   'bg-blue-50 text-blue-600 border-blue-100',
  'In Progress':'bg-purple-50 text-purple-600 border-purple-100',
  Completed:   'bg-slate-50 text-slate-500 border-slate-100',
  Cancelled:   'bg-rose-50 text-rose-500 border-rose-100',
}

function AppointmentManagement() {
  const [appointments,  setAppointments]  = useState([])
  const [doctors,       setDoctors]       = useState([])
  const [loading,       setLoading]       = useState(true)
  const [message,       setMessage]       = useState({ text: '', type: '' })
  const [search,        setSearch]        = useState('')
  const [statusFilter,  setStatusFilter]  = useState('')
  const [dateFilter,    setDateFilter]    = useState('')
  const [assignTarget,  setAssignTarget]  = useState(null)
  const [selectedDoctor,setSelectedDoctor]= useState('')
  const [saving,        setSaving]        = useState(false)

  const notify = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 3000)
  }

  // GET /api/appointments
  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments')
      // backend returns { statusCode, data: { appointments: [], pagination: {} }, message }
      const raw = res.data.data
      setAppointments(Array.isArray(raw) ? raw : (raw?.appointments ?? []))
    } catch {
      notify('Failed to load appointments.', 'error')
    } finally {
      setLoading(false)
    }
  }

  // GET /api/doctors
  const fetchDoctors = async () => {
    try {
      const res = await api.get('/doctors')
      setDoctors(res.data.data || [])
    } catch {}
  }

  useEffect(() => {
    fetchAppointments()
    fetchDoctors()
  }, [])

  // Client-side filter
  const filtered = useMemo(() => appointments.filter(a => {
    const bySearch = search
      ? a.patient?.toLowerCase().includes(search.toLowerCase()) || a.doctor?.toLowerCase().includes(search.toLowerCase())
      : true
    const byStatus = statusFilter ? a.status === statusFilter : true
    const byDate   = dateFilter
      ? new Date(a.date).toISOString().slice(0, 10) === dateFilter
      : true
    return bySearch && byStatus && byDate
  }), [appointments, search, statusFilter, dateFilter])

  // PUT /api/appointments/:id — update status
  const updateStatus = async (id, status) => {
    try {
      await api.put(`/appointments/${id}`, { status })
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status } : a))
      notify(`Appointment ${status.toLowerCase()} successfully`)
    } catch {
      notify('Failed to update appointment.', 'error')
    }
  }

  // PUT /api/appointments/:id — assign doctor
  const handleAssignDoctor = async () => {
    if (!selectedDoctor) return
    setSaving(true)
    try {
      const doc = doctors.find(d => d._id === selectedDoctor)
      await api.put(`/appointments/${assignTarget._id}`, {
        doctor: doc?.name || selectedDoctor,
        doctorId: doc?._id || selectedDoctor, // Fix: Ensure ID is sent for notifications
        status: 'Confirmed',
      })
      setAppointments(prev => prev.map(a =>
        a._id === assignTarget._id
          ? { ...a, doctor: doc?.name || selectedDoctor, status: 'Confirmed' }
          : a
      ))
      notify(`Doctor assigned: ${doc?.name || selectedDoctor}`)
      setAssignTarget(null)
      setSelectedDoctor('')
    } catch {
      notify('Failed to assign doctor.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">

      {/* Header */}
      <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 border-l-4 border-emerald-500 pl-4">Appointment Management</h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 pl-5">View, approve, cancel and assign doctors to appointments</p>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {message.text && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`px-5 py-3 rounded-2xl text-xs font-black border ${
              message.type === 'error'
                ? 'bg-rose-50 border-rose-100 text-rose-600'
                : 'bg-emerald-50 border-emerald-100 text-emerald-700'
            }`}>
            {message.type === 'error' ? '✗' : '✓'} {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input type="text" placeholder="Search patient or doctor..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition-all placeholder:text-slate-400" />
        </div>
        <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
          className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-emerald-400 transition-all" />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-emerald-400 transition-all appearance-none min-w-[140px]">
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Confirmed">Confirmed</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
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
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-xs font-bold text-slate-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-xs font-bold text-slate-400">No appointments found</td></tr>
              ) : filtered.map((a, idx) => (
                <motion.tr key={a._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}
                  className="hover:bg-slate-50/50 transition-colors group">

                  {/* Patient */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-black group-hover:bg-emerald-500 group-hover:text-white transition-all shrink-0">
                        {a.patient?.charAt(0)}
                      </div>
                      <p className="text-xs font-black text-slate-900">{a.patient}</p>
                    </div>
                  </td>

                  {/* Doctor */}
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-slate-700">{a.doctor}</p>
                    <p className="text-[9px] font-bold text-slate-400">{a.dept}</p>
                  </td>

                  {/* Date & Time */}
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-slate-700">
                      {a.date ? new Date(a.date).toLocaleDateString('en-GB') : '—'}
                    </p>
                    <p className="text-[9px] font-bold text-slate-400">{a.time}</p>
                  </td>

                  {/* Reason */}
                  <td className="px-6 py-4 text-xs font-bold text-slate-600 max-w-[120px] truncate">{a.reason}</td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${STATUS_COLORS[a.status] || STATUS_COLORS.Pending}`}>
                      {a.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      {a.status === 'Pending' && (
                        <button onClick={() => updateStatus(a._id, 'Confirmed')}
                          className="p-2 rounded-lg text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all" title="Confirm">
                          <Check size={14} />
                        </button>
                      )}
                      {a.status !== 'Cancelled' && a.status !== 'Completed' && (
                        <button onClick={() => updateStatus(a._id, 'Cancelled')}
                          className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all" title="Cancel">
                          <X size={14} />
                        </button>
                      )}
                      <button onClick={() => { setAssignTarget(a); setSelectedDoctor('') }}
                        className="p-2 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-500 transition-all" title="Assign Doctor">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden mx-4">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Assign Doctor</h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">For {assignTarget.patient}</p>
                </div>
                <button onClick={() => setAssignTarget(null)}
                  className="h-8 w-8 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all border border-slate-100">
                  <X size={14} />
                </button>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Select Doctor</label>
                  <select value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-emerald-400 transition-all appearance-none">
                    <option value="">-- Select a doctor --</option>
                    {doctors.map(d => (
                      <option key={d._id} value={d._id}>{d.name} — {d.specialization}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-1">
                  <button onClick={() => setAssignTarget(null)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">
                    Cancel
                  </button>
                  <button onClick={handleAssignDoctor} disabled={!selectedDoctor || saving}
                    className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-500 transition-all disabled:opacity-50">
                    {saving ? 'Assigning...' : 'Assign'}
                  </button>
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
