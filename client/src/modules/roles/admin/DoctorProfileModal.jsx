import { X, User, CalendarCheck, CheckCircle, Clock, XCircle, TrendingUp, Phone, Mail, Award, Stethoscope, Loader2 } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getDoctorAppointments } from '../../appointments/appointmentApi'
import { getDoctorSchedule } from '../doctor/scheduleApi'

const TABS = [
  { key: 'overview',      label: 'Overview',     icon: User },
  { key: 'appointments',  label: 'Appointments', icon: CalendarCheck },
  { key: 'leaves',        label: 'Leaves',       icon: Clock },
  { key: 'progress',      label: 'Progress',     icon: TrendingUp },
]

const STATUS_COLORS = {
  Active:     'bg-emerald-50 text-emerald-600 border-emerald-100',
  'On Leave': 'bg-orange-50 text-orange-600 border-orange-100',
}

const APPT_COLORS = {
  Completed: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  Pending:   'bg-orange-50 text-orange-600 border-orange-100',
  Cancelled: 'bg-rose-50 text-rose-500 border-rose-100',
  Scheduled: 'bg-blue-50 text-blue-600 border-blue-100',
}

const LEAVE_COLORS = {
  Approved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  Rejected: 'bg-rose-50 text-rose-500 border-rose-100',
  Pending:  'bg-orange-50 text-orange-600 border-orange-100',
}

function ProgressBar({ pct, color, delay = 0 }) {
  return (
    <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: 'easeOut', delay }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
  )
}

function DoctorProfileModal({ doctor, onClose }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [appointments, setAppointments] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [appRes, schedRes] = await Promise.all([
          getDoctorAppointments(doctor._id, 1, 100),
          getDoctorSchedule(doctor._id)
        ])
        setAppointments(appRes?.data?.appointments ?? appRes?.data ?? [])
        setEvents(schedRes?.data ?? [])
      } catch (err) {
        console.error("Failed to fetch doctor profile data:", err)
      } finally {
        setLoading(false)
      }
    }
    if (doctor?._id) fetchData()
  }, [doctor?._id])

  const stats = useMemo(() => {
    const total = appointments.length
    const completed = appointments.filter(a => a.status === 'Completed').length
    const pending = appointments.filter(a => a.status === 'Pending' || a.status === 'Scheduled').length
    const cancelled = appointments.filter(a => a.status === 'Cancelled').length
    
    // Process leaves from schedule events
    const doctorLeaves = events.filter(e => e.type === 'leave')
    
    return {
      total,
      completed,
      pending,
      cancelled,
      leaves: {
        total: 0, // Set to 0 by default (clean)
        taken: doctorLeaves.length,
        records: doctorLeaves.map(l => ({
           id: l._id,
           type: l.title || 'Leave',
           from: l.date,
           to: l.date,
           days: 1,
           status: 'Approved' 
        }))
      }
    }
  }, [appointments, events])

  const completionPct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
  const pendingPct    = stats.total > 0 ? Math.round((stats.pending   / stats.total) * 100) : 0
  const cancelledPct  = stats.total > 0 ? Math.round((stats.cancelled / stats.total) * 100) : 0
  const leavesPct     = Math.round((stats.leaves.taken / stats.leaves.total) * 100)

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-3xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="px-8 pt-6 pb-0 bg-slate-50 border-b border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-blue-500 text-white flex items-center justify-center text-2xl font-black shadow-md">
                  {doctor.name.startsWith('Dr.') 
                    ? (doctor.name.split(' ').slice(1).map(n => n[0]).join('').toUpperCase() || 'D')
                    : (doctor.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'D')}
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">{doctor.name}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border bg-blue-50 text-blue-600 border-blue-100">
                      {doctor.dept}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${STATUS_COLORS[doctor.status]}`}>
                      {doctor.status}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={onClose}
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-white text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all border border-slate-200">
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-slate-100">
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <tab.icon size={12} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto px-8 py-6 min-h-[400px]">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-4 py-20">
                <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fetching clinical records...</p>
              </div>
            ) : (
              <>
                {/* Overview */}
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { label: 'Experience',     value: doctor.experience || 'N/A' },
                        { label: 'Qualification',  value: doctor.specialization },
                        { label: 'Patients (All)', value: stats.total },
                        { label: 'Status',         value: doctor.status },
                      ].map((item, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                          <p className="text-sm font-black text-slate-900">{item.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-2 mb-1">
                          <Phone size={12} className="text-slate-400" />
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Phone</p>
                        </div>
                        <p className="text-sm font-bold text-slate-900">{doctor.contact || 'Not Provided'}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-2 mb-1">
                          <Mail size={12} className="text-slate-400" />
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email</p>
                        </div>
                        <p className="text-sm font-bold text-slate-900">{doctor.email || doctor.userId?.email || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Structured Availability Display */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <Clock size={10} /> Weekly Availability
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(doctor.availability) && doctor.availability.length > 0 ? (
                          doctor.availability.map((a, i) => (
                            <span key={i} className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600">
                              <span className="text-blue-600 font-black">{(a.day || 'Day').slice(0, 3)}:</span> {a.startTime} - {a.endTime}
                            </span>
                          ))
                        ) : (
                          <p className="text-xs font-bold text-slate-400">
                            {typeof doctor.availability === 'string' ? doctor.availability : 'No schedule set'}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-2 mb-1">
                          <Stethoscope size={12} className="text-slate-400" />
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Account Created</p>
                        </div>
                        <p className="text-sm font-bold text-slate-900">{new Date(doctor.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-2 mb-1">
                          <Award size={12} className="text-slate-400" />
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Last Updated</p>
                        </div>
                        <p className="text-sm font-bold text-slate-900">{new Date(doctor.updatedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Appointments */}
                {activeTab === 'appointments' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {[
                        { label: 'Completed', value: stats.completed, cls: 'bg-emerald-50 border-emerald-100 text-emerald-600' },
                        { label: 'Pending',   value: stats.pending,   cls: 'bg-orange-50 border-orange-100 text-orange-600' },
                        { label: 'Cancelled', value: stats.cancelled, cls: 'bg-rose-50 border-rose-100 text-rose-500' },
                      ].map((s, i) => (
                        <div key={i} className={`p-4 rounded-2xl border text-center ${s.cls}`}>
                          <p className="text-2xl font-black">{s.value}</p>
                          <p className="text-[9px] font-black uppercase tracking-widest mt-1 opacity-70">{s.label}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{appointments.length} total appointments</p>
                    {appointments.length === 0 ? (
                      <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                        <p className="text-xs font-bold text-slate-300">No appointment records found</p>
                      </div>
                    ) : appointments.map((a, i) => (
                      <motion.div key={a._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-100 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                            <CalendarCheck size={16} className="text-blue-500" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900">{a.patient}</p>
                            <p className="text-[10px] font-bold text-slate-400">{new Date(a.date).toLocaleDateString()} at {a.time}</p>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${APPT_COLORS[a.status] || APPT_COLORS.Scheduled}`}>
                          {a.status}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Leaves */}
                {activeTab === 'leaves' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 mb-2">
                      {[
                        { label: 'Days Allotted',  value: stats.leaves.total,     cls: 'bg-slate-50 border-slate-100 text-slate-900' },
                        { label: 'Days Taken',     value: stats.leaves.taken,     cls: 'bg-orange-50 border-orange-100 text-orange-600' },
                        { label: 'Days Remaining', value: stats.leaves.total - stats.leaves.taken, cls: 'bg-emerald-50 border-emerald-100 text-emerald-600' },
                      ].map((s, i) => (
                        <div key={i} className={`p-4 rounded-2xl border text-center ${s.cls}`}>
                          <p className="text-2xl font-black">{s.value}</p>
                          <p className="text-[9px] font-black uppercase tracking-widest mt-1 opacity-70">{s.label}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stats.leaves.records.length} leave events</p>
                    {stats.leaves.records.length === 0 ? (
                      <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                        <p className="text-xs font-bold text-slate-300">No leave records registered</p>
                      </div>
                    ) : stats.leaves.records.map((l, i) => (
                      <motion.div key={l.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-100 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                            <Clock size={16} className="text-orange-400" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900">{l.type}</p>
                            <p className="text-[10px] font-bold text-slate-400">{new Date(l.from).toLocaleDateString()} • {l.days} day</p>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${LEAVE_COLORS[l.status]}`}>
                          {l.status}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Progress */}
                {activeTab === 'progress' && (
                  <div className="space-y-5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real Performance Metrics</p>

                    {[
                      { label: 'Completion Rate',         pct: completionPct, color: 'bg-emerald-500', icon: CheckCircle, iconCls: 'text-emerald-500', delay: 0 },
                      { label: 'Pending / Scheduled',    pct: pendingPct,    color: 'bg-orange-400', icon: Clock,        iconCls: 'text-orange-400', delay: 0.1 },
                      { label: 'Cancellation Rate',       pct: cancelledPct,  color: 'bg-rose-400',   icon: XCircle,      iconCls: 'text-rose-400',   delay: 0.2 },
                      { label: 'Annual Leaves Utilised',  pct: leavesPct,     color: 'bg-blue-400',   icon: CalendarCheck,iconCls: 'text-blue-400',   delay: 0.3 },
                    ].map((item, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                        className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <item.icon size={13} className={item.iconCls} />
                            <span className="text-xs font-black text-slate-700">{item.label}</span>
                          </div>
                          <span className={`text-xs font-black ${item.iconCls}`}>{item.pct}%</span>
                        </div>
                        <ProgressBar pct={item.pct} color={item.color} delay={item.delay} />
                      </motion.div>
                    ))}

                    <div className="p-5 rounded-2xl bg-blue-50 border border-blue-100">
                      <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Total Patient Visits</p>
                      <p className="text-3xl font-black text-blue-600">{stats.total}</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default DoctorProfileModal
