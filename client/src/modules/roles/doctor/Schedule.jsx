import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus, X, Clock, BedDouble, AlertTriangle, Bell, CheckCircle2, Stethoscope, CalendarDays, Scissors } from 'lucide-react'
import { getScheduleEvents } from './scheduleStore'

// ─── Constants ───────────────────────────────────────────────────────────────
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

const EVENT_TYPES = {
  appointment: { label: 'Appointment',         color: 'bg-blue-500',   light: 'bg-blue-50 border-blue-100',   text: 'text-blue-600',   dot: 'bg-blue-500'   },
  upcoming:    { label: 'Upcoming Appointment', color: 'bg-purple-500', light: 'bg-purple-50 border-purple-100', text: 'text-purple-600', dot: 'bg-purple-500' },
  procedure:   { label: 'Procedure',            color: 'bg-rose-500',   light: 'bg-rose-50 border-rose-100',   text: 'text-rose-600',   dot: 'bg-rose-500'   },
  leave:       { label: 'Leave',                color: 'bg-amber-500',  light: 'bg-amber-50 border-amber-100', text: 'text-amber-600',  dot: 'bg-amber-500'  },
  holiday:     { label: 'Holiday',              color: 'bg-slate-400',  light: 'bg-slate-50 border-slate-200', text: 'text-slate-500',  dot: 'bg-slate-400'  },
}

const LEAVE_REASONS = ['Personal Emergency','Medical / Health Issue','Family Function','Conference / Training','Planned Vacation','Other']

// ─── Seed Events (yyyy-mm-dd) ─────────────────────────────────────────────────
const SEED_EVENTS = [
  { id: 'E-001', date: '2025-07-01', type: 'holiday',     title: 'National Holiday',           time: 'All Day',  note: 'Hospital closed' },
  { id: 'E-002', date: '2025-07-02', type: 'appointment', title: 'Rohan Sharma — OPD',         time: '09:00 AM', note: 'Hypertension follow-up' },
  { id: 'E-003', date: '2025-07-02', type: 'appointment', title: 'Priya Verma — Follow-up',    time: '10:30 AM', note: 'Migraine review' },
  { id: 'E-004', date: '2025-07-02', type: 'procedure',   title: 'Knee Arthroscopy',           time: '08:00 AM', note: 'Vikram Singh · OT-1' },
  { id: 'E-005', date: '2025-07-03', type: 'appointment', title: 'Amit Patel — OPD',           time: '11:00 AM', note: 'Diabetes check' },
  { id: 'E-006', date: '2025-07-03', type: 'upcoming',    title: 'Sara Khan — Consultation',   time: '02:00 PM', note: 'Asthma management' },
  { id: 'E-007', date: '2025-07-04', type: 'leave',       title: 'Half Day Leave',             time: 'PM',       note: 'Personal Emergency' },
  { id: 'E-008', date: '2025-07-07', type: 'appointment', title: 'Neha Gupta — OPD',           time: '09:30 AM', note: 'Routine check-up' },
  { id: 'E-009', date: '2025-07-07', type: 'procedure',   title: 'Thyroid Lobectomy',          time: '07:30 AM', note: 'Meena Joshi · OT-2' },
  { id: 'E-010', date: '2025-07-08', type: 'upcoming',    title: 'Ravi Desai — Follow-up',     time: '11:00 AM', note: 'Post-op review' },
  { id: 'E-011', date: '2025-07-09', type: 'appointment', title: 'Arjun Nair — OPD',           time: '02:30 PM', note: 'General consultation' },
  { id: 'E-012', date: '2025-07-10', type: 'leave',       title: 'Full Day Leave',             time: 'All Day',  note: 'Conference / Training' },
  { id: 'E-013', date: '2025-07-14', type: 'appointment', title: 'Sunita Rao — Follow-up',     time: '09:00 AM', note: 'BP monitoring' },
  { id: 'E-014', date: '2025-07-14', type: 'upcoming',    title: 'Vikram Singh — Consultation',time: '03:00 PM', note: 'Post-surgery review' },
  { id: 'E-015', date: '2025-07-15', type: 'procedure',   title: 'Lumbar Discectomy',          time: '08:30 AM', note: 'Ravi Desai · OT-1' },
  { id: 'E-016', date: '2025-07-21', type: 'holiday',     title: 'Public Holiday',             time: 'All Day',  note: 'Hospital closed' },
  { id: 'E-017', date: '2025-07-22', type: 'appointment', title: 'Rohan Sharma — OPD',         time: '10:00 AM', note: 'Monthly review' },
  { id: 'E-018', date: '2025-07-23', type: 'upcoming',    title: 'Priya Verma — Follow-up',    time: '11:30 AM', note: 'Migraine follow-up' },
  { id: 'E-019', date: '2025-07-28', type: 'procedure',   title: 'Carpal Tunnel Release',      time: '09:00 AM', note: 'Arjun Nair · OT-2' },
  { id: 'E-020', date: '2025-07-30', type: 'appointment', title: 'Amit Patel — Consultation',  time: '02:00 PM', note: 'HbA1c review' },
]

const TYPE_ICONS = {
  appointment: <Stethoscope size={11} className="text-white" />,
  upcoming:    <CalendarDays size={11} className="text-white" />,
  procedure:   <Scissors size={11} className="text-white" />,
  leave:       <BedDouble size={11} className="text-white" />,
  holiday:     <Bell size={11} className="text-white" />,
}

// ─── Add Event Modal ──────────────────────────────────────────────────────────
function AddEventModal({ date, onClose, onAdd }) {
  const [type, setType]   = useState('appointment')
  const [title, setTitle] = useState('')
  const [time, setTime]   = useState('')
  const [note, setNote]   = useState('')
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
              {Object.entries(EVENT_TYPES).map(([key, val]) => (
                <button key={key} onClick={() => setType(key)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                    type === key ? `${val.color} text-white border-transparent` : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'
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
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                      note === r ? 'bg-amber-500 text-white border-amber-500' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-amber-300'
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
            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              valid ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-slate-100 text-slate-300 cursor-not-allowed'
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
  const today = new Date()
  const [current, setCurrent]     = useState({ year: today.getFullYear(), month: today.getMonth() })
  const [selected, setSelected]   = useState(today.toISOString().slice(0, 10))
  const [events, setEvents]       = useState(() => [...SEED_EVENTS, ...getScheduleEvents()])
  const [addModal, setAddModal]   = useState(false)
  const [viewEvent, setViewEvent] = useState(null)

  // sync when DoctorPatientModal adds a new event
  useEffect(() => {
    const sync = () => setEvents(() => [...SEED_EVENTS, ...getScheduleEvents()])
    window.addEventListener('scheduleUpdated', sync)
    return () => window.removeEventListener('scheduleUpdated', sync)
  }, [])

  const firstDay    = new Date(current.year, current.month, 1).getDay()
  const daysInMonth = new Date(current.year, current.month + 1, 0).getDate()
  const prevDays    = new Date(current.year, current.month, 0).getDate()

  const dateStr = (day) =>
    `${current.year}-${String(current.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  const eventsForDate = (d) => events.filter(e => e.date === d)

  const selectedEvents = eventsForDate(selected).sort((a, b) => a.time.localeCompare(b.time))

  const handleAdd = (data) => {
    setEvents(prev => [...prev, { id: `E-${Date.now()}`, date: selected, ...data }])
    setAddModal(false)
  }

  const removeEvent = (id) => setEvents(prev => prev.filter(e => e.id !== id))

  const todayStr = today.toISOString().slice(0, 10)

  // upcoming events from today sorted
  const upcomingList = events
    .filter(e => e.date >= todayStr && (e.type === 'upcoming' || e.type === 'appointment'))
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    .slice(0, 5)

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
              const ds        = dateStr(day)
              const dayEvents = eventsForDate(ds)
              const isToday   = ds === todayStr
              const isSel     = ds === selected
              const isWeekend = (() => { const dow = new Date(ds).getDay(); return dow === 0 || dow === 6 })()
              const hasLeave  = dayEvents.some(e => e.type === 'leave')
              const hasHoliday= dayEvents.some(e => e.type === 'holiday')

              return (
                <div key={day} onClick={() => setSelected(ds)}
                  className={`min-h-[80px] p-1.5 border-b border-r border-slate-50 cursor-pointer transition-colors ${
                    isSel      ? 'bg-blue-50' :
                    hasHoliday ? 'bg-slate-50' :
                    hasLeave   ? 'bg-amber-50/40' :
                    isWeekend  ? 'bg-slate-50/50' :
                    'hover:bg-slate-50'
                  }`}>
                  {/* Day number */}
                  <div className="flex items-center justify-between mb-1">
                    <span className={`h-6 w-6 flex items-center justify-center rounded-full text-[11px] font-black transition-all ${
                      isToday ? 'bg-blue-500 text-white' :
                      isSel   ? 'bg-blue-100 text-blue-600' :
                      isWeekend ? 'text-slate-400' :
                      'text-slate-700'
                    }`}>{day}</span>
                    {hasHoliday && <span className="text-[8px] font-black text-slate-400 uppercase">Holiday</span>}
                    {hasLeave   && !hasHoliday && <span className="text-[8px] font-black text-amber-500 uppercase">Leave</span>}
                  </div>

                  {/* Event pills */}
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map(e => (
                      <div key={e.id} className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black truncate ${EVENT_TYPES[e.type].color} text-white`}>
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
                <motion.div key={e.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-3 px-5 py-3 group hover:bg-slate-50 transition-colors">
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
                  <button onClick={() => removeEvent(e.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-400 transition-all shrink-0 mt-1">
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
                <div key={e.id} onClick={() => setViewEvent(e)}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className={`h-2 w-2 rounded-full shrink-0 ${EVENT_TYPES[e.type].dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-700 truncate">{e.title}</p>
                    <p className="text-[9px] font-bold text-slate-400">{e.date} · {e.time}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${EVENT_TYPES[e.type].light} ${EVENT_TYPES[e.type].text}`}>
                    {EVENT_TYPES[e.type].label}
                  </span>
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
                <button onClick={() => { removeEvent(viewEvent.id); setViewEvent(null) }}
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

    </div>
  )
}

export default Schedule
