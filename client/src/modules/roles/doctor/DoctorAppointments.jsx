import { useState, useMemo, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, CheckCircle2, Circle, AlertCircle, Clock, Filter, X, CalendarClock, Ban, Calendar, AlarmClock, FileText, Stethoscope, MoreVertical, Eye, User, Hash, Loader2 } from 'lucide-react'
import useAuth from '../../../hooks/useAuth'
import { getDoctorByUserId } from '../../doctors/doctorApi'
import { getDoctorAppointments, updateAppointment, cancelAppointment as apiCancelAppointment } from '../../appointments/appointmentApi'
import { toast } from 'react-toastify'

const TABS = ['All', 'Today', 'Upcoming', 'Completed']

const STATUS_CONFIG = {
  Completed:    { color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: <CheckCircle2 size={10} /> },
  'In Progress':{ color: 'bg-blue-50 text-blue-600 border-blue-100',         icon: <AlertCircle size={10} />  },
  Waiting:      { color: 'bg-orange-50 text-orange-600 border-orange-100',   icon: <Circle size={10} />       },
  Scheduled:    { color: 'bg-slate-50 text-slate-500 border-slate-100',      icon: <Clock size={10} />        },
  Pending:      { color: 'bg-amber-50 text-amber-600 border-amber-100',      icon: <Clock size={10} />        },
  Cancelled:    { color: 'bg-rose-50 text-rose-600 border-rose-100',         icon: <Ban size={10} />          },
}

const TIMES = ['08:00 AM','08:30 AM','09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','12:30 PM','01:00 PM','01:30 PM','02:00 PM','02:30 PM','03:00 PM','03:30 PM','04:00 PM','04:30 PM','05:00 PM']
const RESCHEDULE_REASONS = ['Doctor unavailable', 'Patient request', 'Emergency conflict', 'Equipment maintenance', 'Other']
const CANCEL_REASONS = ['Patient no-show', 'Doctor unavailable', 'Emergency', 'Patient request', 'Duplicate booking', 'Other']

function RescheduleModal({ appointment, onClose, onConfirm }) {
  const [form, setForm] = useState({ 
    date: new Date(appointment.date).toISOString().split('T')[0], 
    time: appointment.time, 
    type: appointment.type || 'Consultation', 
    reason: '', 
    note: '' 
  })
  const [submitting, setSubmitting] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const valid = form.date && form.time && form.reason && !(form.reason === 'Other' && !form.note.trim()) && !submitting

  const handleConfirm = async () => {
    setSubmitting(true)
    await onConfirm(form)
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md mx-4 overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Reschedule Appointment</h2>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">{appointment.patient} · {appointment._id}</p>
            </div>
            <button onClick={onClose} className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all">
              <X size={14} />
            </button>
          </div>

          <div className="px-6 py-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">New Date</label>
                <input type="date" value={form.date} min={new Date().toISOString().split('T')[0]} onChange={e => set('date', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:border-blue-400 transition-all bg-white" />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">New Time</label>
                <select value={form.time} onChange={e => set('time', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:border-blue-400 transition-all bg-white">
                  <option value="">Select time</option>
                  {TIMES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Reason</label>
              <div className="flex flex-wrap gap-2">
                {RESCHEDULE_REASONS.map(r => (
                  <button key={r} onClick={() => set('reason', r)}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                      form.reason === r ? 'bg-blue-500 text-white border-blue-500' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-blue-300'
                    }`}>{r}</button>
                ))}
              </div>
              {form.reason === 'Other' && (
                <textarea
                  value={form.note}
                  onChange={e => set('note', e.target.value)}
                  placeholder="Please describe the reason..."
                  rows={2}
                  className="mt-2 w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:border-blue-400 transition-all bg-white resize-none placeholder:text-slate-300"
                />
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
            <button onClick={onClose} className="px-5 py-2 rounded-xl bg-slate-100 text-slate-500 text-xs font-black uppercase tracking-widest hover:bg-slate-200">Cancel</button>
            <button onClick={handleConfirm} disabled={!valid}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${valid ? 'bg-amber-500 text-white shadow-lg' : 'bg-slate-100 text-slate-300'}`}>
              {submitting ? 'Processing...' : 'Confirm Reschedule'}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function ViewModal({ appointment, onClose }) {
  const s = STATUS_CONFIG[appointment.status] || STATUS_CONFIG.Scheduled
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Details</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center text-lg font-black">
              {appointment.patient?.charAt(0) || "P"}
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">{appointment.patient}</p>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${s.color}`}>{appointment.status}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
             <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Date</p>
                <p className="text-xs font-bold text-slate-700">{new Date(appointment.date).toLocaleDateString()}</p>
             </div>
             <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Time</p>
                <p className="text-xs font-bold text-slate-700">{appointment.time}</p>
             </div>
             <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 col-span-2">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Reason / Notes</p>
                <p className="text-xs font-bold text-slate-700 italic">"{appointment.reason || 'No additional notes provided.'}"</p>
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function CancelModal({ appointment, onClose, onConfirm }) {
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const valid = reason.trim() && !submitting

  const handleConfirm = async () => {
    setSubmitting(true)
    await onConfirm({ reason })
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between">
          <h2 className="text-sm font-black text-slate-900 uppercase">Cancel Visit</h2>
          <button onClick={onClose}><X size={14} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {CANCEL_REASONS.map(r => (
              <button key={r} onClick={() => setReason(r)}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                  reason === r ? 'bg-rose-500 text-white border-rose-500' : 'bg-slate-50 text-slate-500 hover:border-rose-300'
                }`}>{r}</button>
            ))}
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 text-xs font-black uppercase text-slate-400">Back</button>
          <button onClick={handleConfirm} disabled={!valid} className={`px-5 py-2 rounded-xl text-xs font-black uppercase transition-all ${valid ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-300'}`}>
            {submitting ? 'Cancelling...' : 'Confirm Cancel'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function ActionMenu({ appointment, onView, onMarkComplete, onReschedule, onCancel }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const { status } = appointment

  if (status === 'Completed' || status === 'Cancelled') {
    return (
      <button onClick={() => onView(appointment)} className="h-7 w-7 rounded-lg bg-slate-50 text-slate-400 border flex items-center justify-center hover:bg-blue-50 hover:text-blue-500 transition-all">
        <Eye size={13} />
      </button>
    )
  }

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="h-7 w-7 rounded-lg bg-slate-50 text-slate-400 border flex items-center justify-center hover:bg-slate-100 transition-all">
        <MoreVertical size={13} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute right-0 top-9 z-30 bg-white border rounded-2xl shadow-xl overflow-hidden min-w-[150px]">
            <button onClick={() => { setOpen(false); onView(appointment) }} className="w-full flex items-center gap-2 px-4 py-2.5 text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50 border-b">
              <Eye size={12} /> View Details
            </button>
            {/* Only allow marking completed if appointment date is today or past */}
            {new Date(appointment.date).setHours(0, 0, 0, 0) <= new Date().setHours(0, 0, 0, 0) && (
              <button onClick={() => { setOpen(false); onMarkComplete(appointment._id) }} className="w-full flex items-center gap-2 px-4 py-2.5 text-[10px] font-black uppercase text-emerald-600 hover:bg-emerald-50 border-b">
                <CheckCircle2 size={12} /> Mark Completed
              </button>
            )}
            <button onClick={() => { setOpen(false); onReschedule(appointment) }} className="w-full flex items-center gap-2 px-4 py-2.5 text-[10px] font-black uppercase text-amber-600 hover:bg-amber-50 border-b">
              <CalendarClock size={12} /> Reschedule
            </button>
            <button onClick={() => { setOpen(false); onCancel(appointment) }} className="w-full flex items-center gap-2 px-4 py-2.5 text-[10px] font-black uppercase text-rose-500 hover:bg-rose-50">
              <Ban size={12} /> Cancel Visit
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function DoctorAppointments() {
  const { user } = useAuth()
  const location = useLocation()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  const initialTab = new URLSearchParams(location.search).get('tab')
  const [tab, setTab] = useState(TABS.includes(initialTab) ? initialTab : 'Today')
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  
  const [viewAppt, setViewAppt] = useState(null)
  const [reschedule, setReschedule] = useState(null)
  const [cancelAppt, setCancelAppt] = useState(null)

  const fetchAppointments = async () => {
    if (!user?.id) return
    try {
      setLoading(true)
      const profRes = await getDoctorByUserId(user.id)
      const apptRes = await getDoctorAppointments(profRes.data._id, 1, 200)
      setAppointments(Array.isArray(apptRes.data) ? apptRes.data : (apptRes.data?.appointments || []))
    } catch (err) {
      console.error("Fetch appointments failed:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAppointments() }, [user?.id])

  const handleMarkComplete = async (id) => {
    if (!window.confirm('Mark this appointment as completed?')) return
    try {
      await updateAppointment(id, { status: 'Completed' })
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: 'Completed' } : a))
      toast.success('Appointment marked as completed')
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  const handleReschedule = async (form) => {
    try {
       await updateAppointment(reschedule._id, { date: form.date, time: form.time, type: form.type, status: 'Scheduled' })
       setAppointments(prev => prev.map(a => a._id === reschedule._id ? { ...a, ...form, status: 'Scheduled' } : a))
       setReschedule(null)
       toast.success('Appointment rescheduled successfully')
    } catch (err) {
       toast.error('Reschedule failed')
    }
  }

  const handleCancel = async ({ reason }) => {
     try {
        await apiCancelAppointment(cancelAppt._id)
        setAppointments(prev => prev.map(a => a._id === cancelAppt._id ? { ...a, status: 'Cancelled' } : a))
        setCancelAppt(null)
        toast.info('Appointment cancelled')
     } catch (err) {
        toast.error('Cancellation failed')
     }
  }

  const filtered = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return appointments.filter(a => {
      const aDate = new Date(a.date).toISOString().split('T')[0]
      const byTab =
        tab === 'All'       ? true :
        tab === 'Today'     ? aDate === today :
        tab === 'Upcoming'  ? aDate > today && a.status !== 'Cancelled' :
        tab === 'Completed' ? a.status === 'Completed' : true
      const bySearch = (a.patient || '').toLowerCase().includes(search.toLowerCase()) || a._id.includes(search)
      const byType   = type ? a.type === type : true
      return byTab && bySearch && byType
    })
  }, [appointments, tab, search, type])

  if (loading) {
     return (
       <div className="h-[70vh] flex flex-col items-center justify-center space-y-4">
         <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
         <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Clinical Schedule...</p>
       </div>
     )
  }

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Clinical Schedule</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Manage your appointments and patient visits.</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
         <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl w-fit">
            {TABS.map(t => (
               <button key={t} onClick={() => setTab(t)}
                  className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tab === t ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-700'}`}>
                  {t}
               </button>
            ))}
         </div>
         <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
               <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
               <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="pl-8 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-bold w-48 focus:border-blue-400 outline-none" />
            </div>
            <select value={type} onChange={e => setType(e.target.value)} className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold outline-none">
               <option value="">All Types</option>
               <option>OPD</option>
               <option>Follow-up</option>
               <option>Consultation</option>
            </select>
         </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50">
                {['Patient', 'Date', 'Time', 'Type', 'Status', 'Action'].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-20 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">No clinical records found</td></tr>
              ) : filtered.map(a => {
                const s = STATUS_CONFIG[a.status] || STATUS_CONFIG.Scheduled
                return (
                  <tr key={a._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-black group-hover:bg-blue-500 group-hover:text-white transition-all">
                          {a.patient?.charAt(0) || "P"}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900">{a.patient}</p>

                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-600">{new Date(a.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-600">{a.time}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-wider border border-blue-100">{a.type || 'Visit'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${s.color}`}>
                        {s.icon}{a.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <ActionMenu appointment={a} onView={setViewAppt} onMarkComplete={handleMarkComplete} onReschedule={setReschedule} onCancel={setCancelAppt} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {viewAppt && <ViewModal appointment={viewAppt} onClose={() => setViewAppt(null)} />}
      {cancelAppt && <CancelModal appointment={cancelAppt} onClose={() => setCancelAppt(null)} onConfirm={handleCancel} />}
      {reschedule && <RescheduleModal appointment={reschedule} onClose={() => setReschedule(null)} onConfirm={handleReschedule} />}
    </div>
  )
}

export default DoctorAppointments
