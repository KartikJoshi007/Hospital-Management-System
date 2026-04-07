import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus, X, Clock, BedDouble, AlertTriangle, Bell, CheckCircle2, Stethoscope, CalendarDays, Scissors, Loader2 } from 'lucide-react'
import useAuth from '../../../hooks/useAuth'
import { getDoctorByUserId } from '../../doctors/doctorApi'
import { getDoctorSchedule, createScheduleEvent, deleteScheduleEvent } from './scheduleApi'
import { getDoctorAppointments, cancelAppointment } from '../../appointments/appointmentApi'

// ─── Constants ───────────────────────────────────────────────────────────────
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const EVENT_TYPES = {
  appointment: { label: 'Appointment', color: 'bg-blue-500', light: 'bg-blue-50 border-blue-100', text: 'text-blue-600', dot: 'bg-blue-500' },
  completed:   { label: 'Completed',   color: 'bg-emerald-500', light: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-600', dot: 'bg-emerald-500' },
  upcoming: { label: 'Upcoming Appointment', color: 'bg-purple-500', light: 'bg-purple-50 border-purple-100', text: 'text-purple-600', dot: 'bg-purple-500' },
  procedure: { label: 'Procedure', color: 'bg-rose-500', light: 'bg-rose-50 border-rose-100', text: 'text-rose-600', dot: 'bg-rose-500' },
  leave: { label: 'Leave', color: 'bg-amber-500', light: 'bg-amber-50 border-amber-100', text: 'text-amber-600', dot: 'bg-amber-500' },
  holiday: { label: 'Holiday', color: 'bg-slate-400', light: 'bg-slate-50 border-slate-200', text: 'text-slate-500', dot: 'bg-slate-400' },
}

const LEAVE_REASONS = ['Personal Emergency', 'Medical / Health Issue', 'Family Function', 'Conference / Training', 'Planned Vacation', 'Other']

// ─── Seed Events (yyyy-mm-dd) ─────────────────────────────────────────────────
// SEED_EVENTS removed as we now use backend data

const TYPE_ICONS = {
  appointment: <Stethoscope size={11} className="text-white" />,
  completed:   <CheckCircle2 size={11} className="text-white" />,
  upcoming: <CalendarDays size={11} className="text-white" />,
  procedure: <Scissors size={11} className="text-white" />,
  leave: <BedDouble size={11} className="text-white" />,
  holiday: <Bell size={11} className="text-white" />,
}

// ─── Add Event Modal ──────────────────────────────────────────────────────────
function AddEventModal({ date, onClose, onAdd }) {
  const [type, setType] = useState('appointment')
  const [title, setTitle] = useState('')
  const [time, setTime] = useState('')
  const [note, setNote] = useState('')
  const valid = title.trim() && (type === 'holiday' || type === 'leave' || time)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Add Event</h2>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5">{date}</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all">
            <X size={14} />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* Type */}
          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Event Type</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(EVENT_TYPES).filter(([key]) => key !== 'completed').map(([key, val]) => (
                <button key={key} onClick={() => setType(key)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${type === key ? `${val.color} text-white border-transparent` : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'
                    }`}>{val.label}</button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Title <span className="text-rose-400">*</span></label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Event title..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:border-blue-400 transition-all bg-white" />
          </div>

          {/* Time */}
          {type !== 'holiday' && type !== 'leave' && (
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Time <span className="text-rose-400">*</span></label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:border-blue-400 transition-all bg-white" />
            </div>
          )}

          {/* Leave reason */}
          {type === 'leave' && (
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Reason</label>
              <div className="flex flex-wrap gap-2">
                {LEAVE_REASONS.map(r => (
                  <button key={r} onClick={() => setNote(r)}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${note === r ? 'bg-amber-500 text-white border-amber-500' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-amber-300'
                      }`}>{r}</button>
                ))}
              </div>
            </div>
          )}

          {/* Note */}
          {type !== 'leave' && (
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Note</label>
              <input value={note} onChange={e => setNote(e.target.value)} placeholder="Optional note..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:border-blue-400 transition-all bg-white" />
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-slate-100">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-500 text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
            Cancel
          </button>
          <button onClick={() => valid && onAdd({ type, title: title.trim(), time: time || (type === 'leave' || type === 'holiday' ? 'All Day' : ''), note })}
            disabled={!valid}
            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${valid ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-slate-100 text-slate-300 cursor-not-allowed'
              }`}>
            Add Event
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
function Schedule() {
  const { user } = useAuth()
  const today = new Date()
  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const [selected, setSelected] = useState(today.toISOString().slice(0, 10))
  const [events, setEvents] = useState([])
  const [appointments, setAppointments] = useState([])
  const [doctorProfile, setDoctorProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [addModal, setAddModal] = useState(false)
  const [viewEvent, setViewEvent] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const fetchSchedule = async (doctorId) => {
    try {
      const [schedRes, apptRes] = await Promise.all([
        getDoctorSchedule(doctorId),
        getDoctorAppointments(doctorId, 1, 200)
      ])
      setEvents(schedRes.data || [])
      setAppointments(apptRes.data || [])
    } catch (err) {
      console.error("Failed to fetch schedule:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const init = async () => {
      if (!user?.id) return
      try {
        setLoading(true)
        const profRes = await getDoctorByUserId(user.id)
        const profile = profRes.data
        setDoctorProfile(profile)
        if (profile?._id) {
          await fetchSchedule(profile._id)
        }
      } catch (err) {
        console.error("Failed to initialize schedule:", err)
        setLoading(false)
      }
    }
    init()
  }, [user?.id])

  // Sync when other parts of the app update the schedule
  useEffect(() => {
    const sync = () => {
       if (doctorProfile?._id) fetchSchedule(doctorProfile._id)
    }
    window.addEventListener('scheduleUpdated', sync)
    return () => window.removeEventListener('scheduleUpdated', sync)
  }, [doctorProfile?._id])

  const firstDay = new Date(current.year, current.month, 1).getDay()
  const daysInMonth = new Date(current.year, current.month + 1, 0).getDate()
  const prevDays = new Date(current.year, current.month, 0).getDate()

  const dateStr = (day) =>
    `${current.year}-${String(current.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  const appointmentEvents = useMemo(() => appointments
    .filter(a => a.status !== 'Cancelled')
    .map(a => ({
      _id: a._id,
      type: a.status === 'Completed' ? 'completed' : 'appointment',
      title: a.patient,
      date: new Date(a.date).toISOString().slice(0, 10),
      time: a.time,
      note: a.reason,
      status: a.status,
      dept: a.dept,
      apptType: a.type,
      _isAppointment: true,
    })), [appointments])

  const allEvents = useMemo(() => {
    const apptIds = new Set(appointmentEvents.map(e => e._id))
    const schedOnly = events.filter(e => !apptIds.has(e._id))
    return [...schedOnly, ...appointmentEvents]
  }, [events, appointmentEvents])

  const eventsForDate = (d) => allEvents.filter(e => e.date === d)

  const selectedEvents = eventsForDate(selected).sort((a, b) => a.time.localeCompare(b.time))

  const handleAdd = async (data) => {
    if (!doctorProfile?._id) return
    try {
      const res = await createScheduleEvent({
        ...data,
        date: selected,
        doctorId: doctorProfile._id
      })
      if (res.success) {
        setEvents(prev => [...prev, res.data])
        setAddModal(false)
      }
    } catch (err) {
      console.error("Failed to add event:", err)
    }
  }

  const removeEvent = async (id) => {
    const isAppt = confirmDelete?._isAppointment
    try {
      const res = isAppt
        ? await cancelAppointment(id)
        : await deleteScheduleEvent(id)
      if (res.success) {
        if (isAppt) {
          setAppointments(prev => prev.filter(a => a._id !== id))
        } else {
          setEvents(prev => prev.filter(e => (e._id || e.id) !== id))
        }
        setConfirmDelete(null)
        setViewEvent(null)
      }
    } catch (err) {
      console.error('Failed to remove event:', err)
    }
  }

  const todayStr = today.toISOString().slice(0, 10)

  const upcomingList = useMemo(() => {
    return allEvents
      .filter(e => e.date >= todayStr && (e.type === 'upcoming' || e.type === 'appointment' || e.type === 'procedure'))
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
      .slice(0, 5)
  }, [allEvents, todayStr])

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading clinical schedule...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">

      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">My Schedule</h1>
        <p className="text-slate-500 font-medium text-sm mt-1">Manage appointments, procedures, leaves and holidays.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: Calendar ── */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">

          {/* Calendar Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
            <button onClick={() => setCurrent(p => { const d = new Date(p.year, p.month - 1); return { year: d.getFullYear(), month: d.getMonth() } })}
              className="h-8 w-8 rounded-xl hover:bg-slate-100 text-slate-400 flex items-center justify-center transition-colors">
              <ChevronLeft size={16} />
            </button>
            <div className="text-center">
              <p className="text-sm font-black text-slate-900">{MONTHS[current.month]} {current.year}</p>
            </div>
            <button onClick={() => setCurrent(p => { const d = new Date(p.year, p.month + 1); return { year: d.getFullYear(), month: d.getMonth() } })}
              className="h-8 w-8 rounded-xl hover:bg-slate-100 text-slate-400 flex items-center justify-center transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Day Labels */}
          <div className="grid grid-cols-7 border-b border-slate-50">
            {DAYS_SHORT.map(d => (
              <div key={d} className="py-2 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">{d}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {/* Prev month filler */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`prev-${i}`} className="min-h-[80px] p-1.5 border-b border-r border-slate-50">
                <p className="text-[10px] font-bold text-slate-200 mb-1">{prevDays - firstDay + i + 1}</p>
              </div>
            ))}

            {/* Current month days */}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const ds = dateStr(day)
              const dayEvents = eventsForDate(ds)
              const isToday = ds === todayStr
              const isSel = ds === selected
              const isWeekend = (() => { const dow = new Date(ds).getDay(); return dow === 0 || dow === 6 })()
              const hasLeave = dayEvents.some(e => e.type === 'leave')
              const hasHoliday = dayEvents.some(e => e.type === 'holiday')

              return (
                <div key={day} onClick={() => setSelected(ds)}
                  className={`min-h-[80px] p-1.5 border-b border-r border-slate-50 cursor-pointer transition-colors ${isSel ? 'bg-blue-50' :
                    hasHoliday ? 'bg-slate-50' :
                      hasLeave ? 'bg-amber-50/40' :
                        isWeekend ? 'bg-slate-50/50' :
                          'hover:bg-slate-50'
                    }`}>
                  {/* Day number */}
                  <div className="flex items-center justify-between mb-1">
                    <span className={`h-6 w-6 flex items-center justify-center rounded-full text-[11px] font-black transition-all ${isToday ? 'bg-blue-500 text-white' :
                      isSel ? 'bg-blue-100 text-blue-600' :
                        isWeekend ? 'text-slate-400' :
                          'text-slate-700'
                      }`}>{day}</span>
                    {hasHoliday && <span className="text-[8px] font-black text-slate-400 uppercase">Holiday</span>}
                    {hasLeave && !hasHoliday && <span className="text-[8px] font-black text-amber-500 uppercase">Leave</span>}
                  </div>

                  {/* Event pills */}
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map(e => (
                      <div key={e._id || e.id} className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black truncate ${EVENT_TYPES[e.type].color} text-white`}>
                        {TYPE_ICONS[e.type]}
                        <span className="truncate">{e.title}</span>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <p className="text-[9px] font-black text-slate-400 pl-1">+{dayEvents.length - 3} more</p>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Next month filler */}
            {Array.from({ length: (7 - ((firstDay + daysInMonth) % 7)) % 7 }).map((_, i) => (
              <div key={`next-${i}`} className="min-h-[80px] p-1.5 border-b border-r border-slate-50">
                <p className="text-[10px] font-bold text-slate-200 mb-1">{i + 1}</p>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 px-6 py-3 border-t border-slate-50">
            {Object.entries(EVENT_TYPES).map(([key, val]) => (
              <div key={key} className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${val.dot}`} />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{val.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Day Detail + Upcoming ── */}
        <div className="space-y-4">

          {/* Selected Day Panel */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
              <div>
                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">
                  {new Date(selected + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">{selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''}</p>
              </div>
              <button onClick={() => setAddModal(true)}
                className="h-8 w-8 rounded-xl bg-blue-50 border border-blue-100 text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all">
                <Plus size={14} />
              </button>
            </div>

            <div className="divide-y divide-slate-50 max-h-[360px] overflow-y-auto">
              {selectedEvents.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-xs font-bold text-slate-300">No events on this day</p>
                  <button onClick={() => setAddModal(true)} className="mt-2 text-[10px] font-black text-blue-400 hover:text-blue-600 uppercase tracking-widest transition-colors">
                    + Add Event
                  </button>
                </div>
              ) : selectedEvents.map(e => (
                <motion.div key={e._id || e.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                  onClick={() => setViewEvent(e)}
                  className="flex items-start gap-3 px-5 py-3 group hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className={`h-7 w-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${EVENT_TYPES[e.type].color}`}>
                    {TYPE_ICONS[e.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-black truncate ${EVENT_TYPES[e.type].text}`}>{e.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                        <Clock size={8} />{e.time}
                      </span>
                      {e.note && <span className="text-[9px] font-bold text-slate-300 truncate">· {e.note}</span>}
                    </div>
                  </div>
                  <button onClick={() => !e._isAppointment && setConfirmDelete(e)}
                    className={`opacity-0 group-hover:opacity-100 transition-all shrink-0 mt-1 ${e._isAppointment ? 'text-slate-200 cursor-not-allowed' : 'text-slate-300 hover:text-rose-400'}`}>
                    <X size={12} />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-50">
              <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Upcoming</p>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">Next appointments & follow-ups</p>
            </div>
            <div className="divide-y divide-slate-50">
              {upcomingList.length === 0 ? (
                <p className="px-5 py-6 text-xs font-bold text-slate-300 text-center">No upcoming events</p>
              ) : upcomingList.map(e => (
                <div key={e._id || e.id} onClick={() => setViewEvent(e)}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors cursor-pointer group">
                  <div className={`h-2 w-2 rounded-full shrink-0 ${EVENT_TYPES[e.type].dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-700 truncate">{e.title}</p>
                    <p className="text-[9px] font-bold text-slate-400">{e.date} · {e.time}</p>
                  </div>
                  <button
                    onClick={ev => { ev.stopPropagation(); setConfirmDelete(e) }}
                    className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-400 transition-all shrink-0">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Event Detail Modal */}
      <AnimatePresence>
        {viewEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-sm mx-4 overflow-hidden">
              {/* Header */}
              <div className={`px-6 py-4 ${EVENT_TYPES[viewEvent.type].color}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center">
                      {TYPE_ICONS[viewEvent.type]}
                    </div>
                    <span className="text-[9px] font-black text-white/80 uppercase tracking-widest">{EVENT_TYPES[viewEvent.type].label}</span>
                  </div>
                  <button onClick={() => setViewEvent(null)}
                    className="h-7 w-7 rounded-lg bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-all">
                    <X size={13} />
                  </button>
                </div>
                <p className="text-base font-black text-white mt-3">{viewEvent.title}</p>
              </div>

              {/* Details */}
              <div className="px-6 py-4 space-y-3">
                {viewEvent._isAppointment && viewEvent.status && (
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <CheckCircle2 size={13} className="text-slate-400 shrink-0" />
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                      <p className="text-xs font-black text-slate-700">{viewEvent.status}</p>
                    </div>
                  </div>
                )}
                {viewEvent._isAppointment && viewEvent.dept && (
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <Stethoscope size={13} className="text-slate-400 shrink-0" />
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Department</p>
                      <p className="text-xs font-black text-slate-700">{viewEvent.dept}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <Clock size={13} className="text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Time</p>
                    <p className="text-xs font-black text-slate-700">{viewEvent.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <CalendarDays size={13} className="text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Date</p>
                    <p className="text-xs font-black text-slate-700">{viewEvent.date}</p>
                  </div>
                </div>
                {viewEvent.note && (
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <Bell size={13} className="text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Note</p>
                      <p className="text-xs font-black text-slate-700">{viewEvent.note}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex gap-3 px-6 py-4 border-t border-slate-100">
                <button onClick={() => setViewEvent(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-500 text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
                  Close
                </button>
                <button onClick={() => setConfirmDelete(viewEvent)}
                  className="flex-1 py-2 rounded-xl bg-rose-500 text-white text-xs font-black uppercase tracking-widest hover:bg-rose-600 transition-all">
                  Delete Event
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Event Modal */}
      <AnimatePresence>
        {addModal && (
          <AddEventModal date={selected} onClose={() => setAddModal(false)} onAdd={handleAdd} />
        )}
      </AnimatePresence>

      {/* Confirm Delete Modal */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-sm mx-4 overflow-hidden"
            >
              <div className="px-6 pt-6 pb-4 flex flex-col items-center text-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center">
                  <AlertTriangle size={20} className="text-rose-500" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">Cancel this event?</p>
                  <p className="text-xs font-bold text-slate-400 mt-1 leading-relaxed">
                    <span className={`font-black ${EVENT_TYPES[confirmDelete.type]?.text}`}>{confirmDelete.title}</span>
                    <br />{confirmDelete.date} · {confirmDelete.time}
                  </p>
                </div>
                <p className="text-[10px] font-bold text-slate-400">This action cannot be undone.</p>
              </div>
              <div className="flex gap-3 px-6 py-4 border-t border-slate-100">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-500 text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Keep It
                </button>
                <button
                  onClick={() => removeEvent(confirmDelete._id || confirmDelete.id)}
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white text-xs font-black uppercase tracking-widest hover:bg-rose-600 transition-all"
                >
                  Yes, Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}

export default Schedule
