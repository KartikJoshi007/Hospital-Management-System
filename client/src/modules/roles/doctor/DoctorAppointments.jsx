import { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, CheckCircle2, Circle, AlertCircle, Clock, Filter, X, CalendarClock, Ban, Calendar, AlarmClock, FileText, Stethoscope, MoreVertical, Eye, User, Hash } from 'lucide-react'

const INITIAL_APPOINTMENTS = [
  { id: 'A-101', patient: 'Rohan Sharma',  age: 34, date: '2024-06-13', time: '09:00 AM', type: 'OPD',          status: 'Completed'   },
  { id: 'A-102', patient: 'Priya Verma',   age: 28, date: '2024-06-13', time: '10:30 AM', type: 'Follow-up',    status: 'In Progress' },
  { id: 'A-103', patient: 'Amit Patel',    age: 45, date: '2024-06-13', time: '11:00 AM', type: 'OPD',          status: 'Waiting'     },
  { id: 'A-104', patient: 'Sara Khan',     age: 31, date: '2024-06-13', time: '12:00 PM', type: 'Consultation', status: 'Waiting'     },
  { id: 'A-105', patient: 'Vikram Singh',  age: 52, date: '2024-06-13', time: '02:00 PM', type: 'Follow-up',    status: 'Scheduled'   },
  { id: 'A-106', patient: 'Neha Gupta',   age: 26, date: '2024-06-14', time: '09:30 AM', type: 'OPD',          status: 'Scheduled'   },
  { id: 'A-107', patient: 'Ravi Desai',   age: 41, date: '2024-06-14', time: '11:00 AM', type: 'Follow-up',    status: 'Scheduled'   },
  { id: 'A-108', patient: 'Meena Joshi',  age: 55, date: '2024-06-15', time: '10:00 AM', type: 'Consultation', status: 'Scheduled'   },
  { id: 'A-109', patient: 'Arjun Nair',   age: 30, date: '2024-06-15', time: '02:30 PM', type: 'OPD',          status: 'Scheduled'   },
  { id: 'A-110', patient: 'Sunita Rao',   age: 48, date: '2024-06-16', time: '09:00 AM', type: 'Follow-up',    status: 'Scheduled'   },
]

const TABS = ['All', 'Today', 'Upcoming', 'Completed']

const STATUS_CONFIG = {
  Completed:    { color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: <CheckCircle2 size={10} /> },
  'In Progress':{ color: 'bg-blue-50 text-blue-600 border-blue-100',         icon: <AlertCircle size={10} />  },
  Waiting:      { color: 'bg-orange-50 text-orange-600 border-orange-100',   icon: <Circle size={10} />       },
  Scheduled:    { color: 'bg-slate-50 text-slate-500 border-slate-100',      icon: <Clock size={10} />        },
}

const TODAY = '2024-06-13'

const TIMES = ['08:00 AM','08:30 AM','09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','12:30 PM','01:00 PM','01:30 PM','02:00 PM','02:30 PM','03:00 PM','03:30 PM','04:00 PM','04:30 PM','05:00 PM']

const RESCHEDULE_REASONS = ['Doctor unavailable', 'Patient request', 'Emergency conflict', 'Equipment maintenance', 'Other']

const CANCEL_REASONS = ['Patient no-show', 'Doctor unavailable', 'Emergency', 'Patient request', 'Duplicate booking', 'Other']

function RescheduleModal({ appointment, onClose, onConfirm }) {
  const [form, setForm] = useState({ date: '', time: '', type: appointment.type, reason: '', note: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const valid = form.date && form.time && form.reason

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md mx-4 overflow-hidden"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Reschedule Appointment</h2>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">{appointment.patient} · {appointment.id}</p>
            </div>
            <button onClick={onClose} className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all">
              <X size={14} />
            </button>
          </div>

          {/* Current Info */}
          <div className="mx-6 mt-4 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Current</div>
            <div className="flex items-center gap-3 ml-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-slate-600"><Calendar size={10} />{appointment.date}</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-slate-600"><AlarmClock size={10} />{appointment.time}</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-blue-500"><Stethoscope size={10} />{appointment.type}</span>
            </div>
          </div>

          {/* Form */}
          <div className="px-6 py-4 space-y-4">
            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">New Date <span className="text-rose-400">*</span></label>
                <div className="relative">
                  <Calendar size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
                    min={TODAY}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:border-blue-400 transition-all bg-white" />
                </div>
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">New Time <span className="text-rose-400">*</span></label>
                <div className="relative">
                  <AlarmClock size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select value={form.time} onChange={e => set('time', e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:border-blue-400 transition-all appearance-none bg-white">
                    <option value="">Select time</option>
                    {TIMES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Type */}
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Appointment Type</label>
              <div className="relative">
                <Stethoscope size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select value={form.type} onChange={e => set('type', e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:border-blue-400 transition-all appearance-none bg-white">
                  <option>OPD</option>
                  <option>Follow-up</option>
                  <option>Consultation</option>
                </select>
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Reason for Reschedule <span className="text-rose-400">*</span></label>
              <div className="flex flex-wrap gap-2">
                {RESCHEDULE_REASONS.map(r => (
                  <button key={r} type="button" onClick={() => set('reason', r)}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                      form.reason === r
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-500'
                    }`}>{r}</button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Additional Note</label>
              <div className="relative">
                <FileText size={12} className="absolute left-3 top-3 text-slate-400" />
                <textarea value={form.note} onChange={e => set('note', e.target.value)}
                  rows={2} placeholder="Optional note for the patient..."
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:border-blue-400 transition-all resize-none bg-white" />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
            <button onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-100 text-slate-500 text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
              Cancel
            </button>
            <button onClick={() => valid && onConfirm(form)} disabled={!valid}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                valid ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-slate-100 text-slate-300 cursor-not-allowed'
              }`}>
              Confirm Reschedule
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function ViewModal({ appointment, onClose }) {
  const s = STATUS_CONFIG[appointment.status]
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-sm mx-4 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Appointment Details</h2>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">{appointment.id}</p>
            </div>
            <button onClick={onClose} className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all">
              <X size={14} />
            </button>
          </div>

          {/* Patient avatar + name */}
          <div className="flex items-center gap-4 px-6 py-5 border-b border-slate-50">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center text-lg font-black">
              {appointment.patient.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">{appointment.patient}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">{appointment.age} yrs</p>
            </div>
            <span className={`ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${s.color}`}>
              {s.icon}{appointment.status}
            </span>
          </div>

          {/* Details grid */}
          <div className="px-6 py-4 grid grid-cols-2 gap-3">
            {[
              { icon: <Hash size={11} />,        label: 'Appointment ID', value: appointment.id },
              { icon: <Stethoscope size={11} />,  label: 'Type',           value: appointment.type },
              { icon: <Calendar size={11} />,     label: 'Date',           value: appointment.date },
              { icon: <AlarmClock size={11} />,   label: 'Time',           value: appointment.time },
              { icon: <User size={11} />,         label: 'Patient',        value: appointment.patient },
            ].map(({ icon, label, value }) => (
              <div key={label} className="bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100">
                <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{icon}{label}</div>
                <p className="text-xs font-black text-slate-700">{value}</p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex justify-end px-6 py-4 border-t border-slate-100">
            <button onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-100 text-slate-500 text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
              Close
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function CancelModal({ appointment, onClose, onConfirm }) {
  const [reason, setReason] = useState('')
  const [note, setNote]     = useState('')
  const valid = reason.trim()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md mx-4 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Cancel Appointment</h2>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">{appointment.patient} · {appointment.id}</p>
            </div>
            <button onClick={onClose} className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all">
              <X size={14} />
            </button>
          </div>

          {/* Appointment Info */}
          <div className="mx-6 mt-4 px-4 py-3 rounded-2xl bg-rose-50 border border-rose-100 flex items-center gap-4">
            <div className="text-[9px] font-black text-rose-300 uppercase tracking-widest">Appointment</div>
            <div className="flex items-center gap-3 ml-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-500"><Calendar size={10} />{appointment.date}</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-500"><AlarmClock size={10} />{appointment.time}</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-500"><Stethoscope size={10} />{appointment.type}</span>
            </div>
          </div>

          <div className="px-6 py-4 space-y-4">
            {/* Reason chips */}
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Reason for Cancellation <span className="text-rose-400">*</span></label>
              <div className="flex flex-wrap gap-2">
                {CANCEL_REASONS.map(r => (
                  <button key={r} type="button" onClick={() => setReason(r)}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                      reason === r
                        ? 'bg-rose-500 text-white border-rose-500'
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-rose-300 hover:text-rose-500'
                    }`}>{r}</button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Additional Note</label>
              <div className="relative">
                <FileText size={12} className="absolute left-3 top-3 text-slate-400" />
                <textarea value={note} onChange={e => setNote(e.target.value)}
                  rows={2} placeholder="Optional note..."
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:border-rose-400 transition-all resize-none bg-white" />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
            <button onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-100 text-slate-500 text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
              Back
            </button>
            <button onClick={() => valid && onConfirm({ reason, note })} disabled={!valid}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                valid ? 'bg-rose-500 text-white hover:bg-rose-600' : 'bg-slate-100 text-slate-300 cursor-not-allowed'
              }`}>
              Confirm Cancel
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
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

  // In Progress → Eye only
  if (status === 'In Progress') {
    return (
      <button
        onClick={() => onView(appointment)}
        title="View"
        className="h-7 w-7 rounded-lg bg-slate-50 text-slate-400 border border-slate-100 flex items-center justify-center hover:bg-blue-50 hover:text-blue-500 hover:border-blue-100 transition-all">
        <Eye size={13} />
      </button>
    )
  }

  // Completed → Eye + Mark as Completed radio
  if (status === 'Completed') {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => onView(appointment)}
          title="View"
          className="h-7 w-7 rounded-lg bg-slate-50 text-slate-400 border border-slate-100 flex items-center justify-center hover:bg-blue-50 hover:text-blue-500 hover:border-blue-100 transition-all">
          <Eye size={13} />
        </button>
        <button
          onClick={() => onMarkComplete(appointment.id)}
          title={appointment.marked ? 'Marked as Completed' : 'Mark as Completed'}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all ${
            appointment.marked
              ? 'bg-emerald-500 text-white border-emerald-500'
              : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-500 hover:text-white'
          }`}>
          <div className={`h-3 w-3 rounded-full border-2 flex items-center justify-center transition-all ${
            appointment.marked ? 'border-white' : 'border-emerald-400'
          }`}>
            {appointment.marked && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
          </div>
          {appointment.marked ? 'Completed' : 'Mark Done'}
        </button>
      </div>
    )
  }

  // Waiting → three-dot dropdown with Reschedule + Cancel
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="h-7 w-7 rounded-lg bg-slate-50 text-slate-400 border border-slate-100 flex items-center justify-center hover:bg-slate-100 hover:text-slate-600 transition-all">
        <MoreVertical size={13} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-9 z-30 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden min-w-[140px]">
            <button
              onClick={() => { setOpen(false); onReschedule(appointment) }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-amber-600 hover:bg-amber-50 transition-colors">
              <CalendarClock size={12} /> Reschedule
            </button>
            <button
              onClick={() => { setOpen(false); onCancel(appointment) }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 transition-colors">
              <Ban size={12} /> Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function DoctorAppointments() {
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS)
  const [tab, setTab]           = useState('All')
  const [search, setSearch]     = useState('')
  const [type, setType]         = useState('')
  const [viewAppt, setViewAppt]     = useState(null)
  const [reschedule, setReschedule] = useState(null)
  const [cancelAppt, setCancelAppt] = useState(null)

  const toggleMark = (id) => setAppointments(prev =>
    prev.map(a => a.id === id ? { ...a, marked: !a.marked } : a)
  )

  const filtered = useMemo(() => {
    return appointments.filter(a => {
      const byTab =
        tab === 'All'       ? true :
        tab === 'Today'     ? a.date === TODAY :
        tab === 'Upcoming'  ? a.date > TODAY :
        tab === 'Completed' ? a.status === 'Completed' : true
      const bySearch = a.patient.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase())
      const byType   = type ? a.type === type : true
      return byTab && bySearch && byType
    })
  }, [appointments, tab, search, type])

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">My Appointments</h1>
        <p className="text-slate-500 font-medium text-sm mt-1">Manage and track all your appointments.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${tab === t ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search patient or ID..."
            className="pl-8 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none focus:border-blue-400 transition-all w-56"
          />
        </div>
        <div className="relative">
          <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select value={type} onChange={e => setType(e.target.value)}
            className="pl-8 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none focus:border-blue-400 transition-all appearance-none min-w-36">
            <option value="">All Types</option>
            <option>OPD</option>
            <option>Follow-up</option>
            <option>Consultation</option>
          </select>
        </div>
        {(search || type) && (
          <button onClick={() => { setSearch(''); setType('') }}
            className="px-4 py-2 rounded-xl bg-rose-50 text-rose-500 text-xs font-black uppercase tracking-widest border border-rose-100 hover:bg-rose-500 hover:text-white transition-all">
            Clear
          </button>
        )}
        <span className="ml-auto text-[10px] font-black text-slate-400 uppercase tracking-widest">{filtered.length} records</span>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50">
                {['Patient', 'Date', 'Time', 'Type', 'Status', 'Action'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-xs font-bold text-slate-400">No appointments found</td></tr>
              ) : filtered.map(a => {
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
                    <td className="px-6 py-3 text-xs font-bold text-slate-600">{a.date}</td>
                    <td className="px-6 py-3 text-xs font-bold text-slate-600">{a.time}</td>
                    <td className="px-6 py-3">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-wider border border-blue-100">{a.type}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${s.color}`}>
                        {s.icon}{a.status}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <ActionMenu
                        appointment={a}
                        onView={setViewAppt}
                        onMarkComplete={toggleMark}
                        onReschedule={setReschedule}
                        onCancel={setCancelAppt}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
      {viewAppt && (
        <ViewModal appointment={viewAppt} onClose={() => setViewAppt(null)} />
      )}
      {cancelAppt && (
        <CancelModal
          appointment={cancelAppt}
          onClose={() => setCancelAppt(null)}
          onConfirm={({ reason, note }) => {
            console.log('Cancelled:', cancelAppt.id, { reason, note })
            setCancelAppt(null)
          }}
        />
      )}
      {reschedule && (
        <RescheduleModal
          appointment={reschedule}
          onClose={() => setReschedule(null)}
          onConfirm={(form) => {
            console.log('Rescheduled:', reschedule.id, form)
            setReschedule(null)
          }}
        />
      )}
    </div>
  )
}

export default DoctorAppointments
