import { useState } from 'react'
import { X, User, FileText, Pill, Calendar, Activity, Eye, Phone, MapPin, AlertTriangle, DollarSign, ClipboardList, Droplets, Download, Filter, Scissors, Clock, ChevronLeft, ChevronRight, Plus, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { addScheduleEvent } from './scheduleStore'

const TABS = [
  { key: 'overview',     label: 'Overview',     icon: User        },
  { key: 'reports',      label: 'Reports',      icon: FileText    },
  { key: 'prescription', label: 'Prescription', icon: Pill        },
  { key: 'vitals',       label: 'Vitals',       icon: Activity    },
  { key: 'billing',      label: 'Billing',      icon: DollarSign  },
  { key: 'calendar',     label: 'Calendar',     icon: Calendar    },
]

const RESULT_COLORS = {
  Normal:   'bg-emerald-50 text-emerald-600 border-emerald-100',
  Clear:    'bg-blue-50 text-blue-600 border-blue-100',
  Abnormal: 'bg-rose-50 text-rose-500 border-rose-100',
  High:     'bg-orange-50 text-orange-600 border-orange-100',
}

const BILL_COLORS = {
  Paid:   'bg-emerald-50 text-emerald-600 border-emerald-100',
  Unpaid: 'bg-rose-50 text-rose-500 border-rose-100',
}

const RECORD_STATUS_COLORS = {
  Final:   'bg-emerald-50 text-emerald-600 border-emerald-100',
  Draft:   'bg-orange-50 text-orange-600 border-orange-100',
  Pending: 'bg-blue-50 text-blue-600 border-blue-100',
}

const TYPE_ICONS = {
  'Prescription':   'Rx',
  'Lab Report':     'Lab',
  'Discharge Note': 'DC',
  'Imaging':        'IMG',
}

const EVENT_COLORS = {
  surgery:     { bg: 'bg-rose-500',    light: 'bg-rose-50 border-rose-100',    text: 'text-rose-600',    dot: 'bg-rose-500'    },
  appointment: { bg: 'bg-blue-500',    light: 'bg-blue-50 border-blue-100',    text: 'text-blue-600',    dot: 'bg-blue-500'    },
  upcoming:    { bg: 'bg-purple-500',  light: 'bg-purple-50 border-purple-100', text: 'text-purple-600',  dot: 'bg-purple-500'  },
  followup:    { bg: 'bg-emerald-500', light: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-600', dot: 'bg-emerald-500' },
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

const MOCK = {
  address:   '42, MG Road, Mumbai, Maharashtra',
  emergency: '+91 98001 11222',
  allergies: ['Penicillin', 'Dust', 'Pollen'],
  nextVisit: '2024-07-15',
  calendarEvents: [
    { id: 'E-001', date: '2024-07-15', type: 'appointment', title: 'Follow-up Consultation', time: '10:00 AM', note: 'Review HbA1c results' },
    { id: 'E-002', date: '2024-07-22', type: 'surgery',     title: 'Knee Arthroscopy',        time: '08:30 AM', note: 'Pre-op fasting required' },
    { id: 'E-003', date: '2024-07-28', type: 'upcoming',    title: 'Upcoming Appointment',    time: '11:00 AM', note: 'Routine check-up' },
    { id: 'E-004', date: '2024-08-05', type: 'followup',    title: 'Post-Surgery Follow-up',  time: '09:00 AM', note: 'Wound inspection' },
  ],
  reports: [
    {
      id: 'R-001', name: 'Blood Test Report', date: '2024-06-08', type: 'Lab', result: 'Normal',
      summary: 'Complete Blood Count within normal range.',
      findings: [
        { label: 'Hemoglobin',     value: '14.2 g/dL', status: 'Normal' },
        { label: 'WBC Count',      value: '7,200 /µL', status: 'Normal' },
        { label: 'Platelet Count', value: '2.5 L /µL', status: 'Normal' },
        { label: 'RBC Count',      value: '5.1 M/µL',  status: 'Normal' },
      ],
      doctor: 'Dr. Aryan Mehta', lab: 'Central Lab',
    },
    {
      id: 'R-002', name: 'X-Ray Chest', date: '2024-05-20', type: 'Radiology', result: 'Clear',
      summary: 'Lungs clear. No consolidation or pleural effusion.',
      findings: [
        { label: 'Lung Fields', value: 'Clear',       status: 'Normal' },
        { label: 'Heart Size',  value: 'Normal',      status: 'Normal' },
        { label: 'Pleura',      value: 'No effusion', status: 'Normal' },
        { label: 'Bones',       value: 'Intact',      status: 'Normal' },
      ],
      doctor: 'Dr. Rahul Patil', lab: 'Radiology Dept',
    },
    {
      id: 'R-003', name: 'HbA1c Test', date: '2024-06-01', type: 'Lab', result: 'High',
      summary: 'HbA1c elevated at 8.1%. Indicates poor glycemic control.',
      findings: [
        { label: 'HbA1c',           value: '8.1%',      status: 'High'   },
        { label: 'Fasting Glucose', value: '148 mg/dL', status: 'High'   },
        { label: 'Post-meal',       value: '210 mg/dL', status: 'High'   },
        { label: 'Insulin',         value: 'Normal',    status: 'Normal' },
      ],
      doctor: 'Dr. Sneha Verma', lab: 'Central Lab',
    },
  ],
  prescriptions: [
    {
      id: 'Rx-001', date: '2024-06-10', doctor: 'Dr. Aryan Mehta',
      medicines: [
        { name: 'Metformin 500mg', dose: '1 tablet',  freq: 'Twice daily', duration: '30 days', instructions: 'After meals'  },
        { name: 'Amlodipine 5mg',  dose: '1 tablet',  freq: 'Once daily',  duration: '30 days', instructions: 'Morning'      },
        { name: 'Aspirin 75mg',    dose: '1 tablet',  freq: 'Once daily',  duration: '30 days', instructions: 'After dinner' },
      ],
      notes: 'Avoid high-sodium diet. Monitor BP weekly. Follow-up in 4 weeks.',
    },
    {
      id: 'Rx-002', date: '2024-05-01', doctor: 'Dr. Sneha Verma',
      medicines: [
        { name: 'Pantoprazole 40mg', dose: '1 tablet',  freq: 'Once daily', duration: '14 days', instructions: 'Before meals' },
        { name: 'Vitamin D3 60K',    dose: '1 capsule', freq: 'Weekly',     duration: '8 weeks', instructions: 'With milk'    },
      ],
      notes: 'Increase calcium-rich food intake.',
    },
  ],
  vitals: {
    bp: '140/90 mmHg', heartRate: '82 bpm', temp: '98.6°F',
    spo2: '97%', weight: '78 kg', height: '172 cm', bmi: '26.4', lastUpdated: '2024-06-10', lastUpdatedTime: '09:45 AM',
  },
  records: [
    { id: 'R-001', type: 'Prescription',  date: '2024-06-10', diagnosis: 'Hypertension',        status: 'Final'   },
    { id: 'R-002', type: 'Lab Report',    date: '2024-06-11', diagnosis: 'Migraine',             status: 'Final'   },
    { id: 'R-003', type: 'Discharge Note',date: '2024-06-09', diagnosis: 'Diabetes Type 2',      status: 'Draft'   },
    { id: 'R-004', type: 'Imaging',       date: '2024-06-08', diagnosis: 'Rheumatoid Arthritis', status: 'Pending' },
  ],
  billing: [
    { id: 'B-001', desc: 'OPD Consultation', date: '2024-06-10', amount: '₹500',  status: 'Paid'   },
    { id: 'B-002', desc: 'Blood Test (CBC)',  date: '2024-06-08', amount: '₹800',  status: 'Paid'   },
    { id: 'B-003', desc: 'X-Ray Chest',       date: '2024-05-20', amount: '₹1200', status: 'Paid'   },
    { id: 'B-004', desc: 'HbA1c Test',        date: '2024-06-01', amount: '₹650',  status: 'Unpaid' },
    { id: 'B-005', desc: 'Follow-up Visit',   date: '2024-06-15', amount: '₹300',  status: 'Unpaid' },
  ],
}

function CalendarTab({ events, onBookSurgery }) {
  const today = new Date()
  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const [selected, setSelected] = useState(null)
  const [modal, setModal] = useState(null) // { type: 'surgery'|'appointment'|'upcoming' }
  const [form, setForm] = useState({ date: '', time: '', note: '' })
  const [localEvents, setLocalEvents] = useState(events)

  const firstDay = new Date(current.year, current.month, 1).getDay()
  const daysInMonth = new Date(current.year, current.month + 1, 0).getDate()

  const getEventsForDay = (day) => {
    const d = `${current.year}-${String(current.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return localEvents.filter(e => e.date === d)
  }

  const [showUpcoming, setShowUpcoming] = useState(false)

  const upcomingEvents = localEvents
    .filter(e => e.type === 'appointment' || e.type === 'surgery')
    .sort((a, b) => a.date.localeCompare(b.date))

  const handleSave = () => {
    if (!form.date || !form.time) return
    const titles = { surgery: 'Schedule Procedure', appointment: 'Next Appointment' }
    const typeMap = { surgery: 'procedure', appointment: 'upcoming' }
    const newEvent = {
      id: `E-${Date.now()}`, date: form.date, type: modal.type,
      title: titles[modal.type], time: form.time, note: form.note,
    }
    setLocalEvents(prev => [...prev, newEvent])
    // push to shared schedule store
    addScheduleEvent({
      id:    newEvent.id,
      date:  newEvent.date,
      type:  typeMap[modal.type],
      title: `${patient.name} — ${titles[modal.type]}`,
      time:  form.time,
      note:  form.note || patient.name,
    })
    if (modal.type === 'surgery' && onBookSurgery) {
      onBookSurgery(newEvent)
    }
    setModal(null)
    setForm({ date: '', time: '', note: '' })
  }

  const selectedDateStr = selected
    ? `${current.year}-${String(current.month + 1).padStart(2, '0')}-${String(selected).padStart(2, '0')}`
    : ''

  const selectedEvents = selected ? getEventsForDay(selected) : []

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-3">
        <button onClick={() => { setShowUpcoming(false); setModal({ type: 'surgery' }); setForm(p => ({ ...p, date: selectedDateStr })) }}
          className="flex items-center justify-center gap-2 p-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100">
          <Scissors size={13} /> Schedule Procedure
        </button>
        <button onClick={() => { setShowUpcoming(false); setModal({ type: 'appointment' }); setForm(p => ({ ...p, date: selectedDateStr })) }}
          className="flex items-center justify-center gap-2 p-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100">
          <Plus size={13} /> Next Appointment
        </button>
        <button onClick={() => setShowUpcoming(v => !v)}
          className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${
            showUpcoming ? 'bg-purple-500 text-white border-purple-500' : 'bg-purple-50 border-purple-100 text-purple-600 hover:bg-purple-100'
          }`}>
          <Clock size={13} /> Upcoming
        </button>
      </div>

      {/* Upcoming Panel */}
      <AnimatePresence>
        {showUpcoming && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="rounded-2xl border border-purple-100 bg-purple-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-purple-100">
              <p className="text-[9px] font-black text-purple-500 uppercase tracking-widest">Upcoming — Next Appointments & Surgeries</p>
            </div>
            {upcomingEvents.length === 0 ? (
              <p className="px-4 py-4 text-xs font-bold text-slate-400">No upcoming events scheduled.</p>
            ) : (
              <div className="divide-y divide-purple-100">
                {upcomingEvents.map(e => (
                  <div key={e.id} className="flex items-center gap-3 px-4 py-3">
                    <div className={`h-7 w-7 rounded-xl flex items-center justify-center shrink-0 ${EVENT_COLORS[e.type].bg}`}>
                      {e.type === 'surgery' ? <Scissors size={11} className="text-white" /> : <Calendar size={11} className="text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-black ${EVENT_COLORS[e.type].text}`}>{e.title}</p>
                      <p className="text-[10px] font-bold text-slate-400">{e.date} · {e.time}{e.note ? ` · ${e.note}` : ''}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                      e.type === 'surgery' ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-blue-50 text-blue-500 border-blue-100'
                    }`}>{e.type === 'surgery' ? 'Procedure' : 'Appointment'}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calendar — hidden when Upcoming panel is open */}
      {!showUpcoming && (
        <>
          {/* Calendar Header */}
          <div className="flex items-center justify-between px-1">
            <button onClick={() => setCurrent(p => { const d = new Date(p.year, p.month - 1); return { year: d.getFullYear(), month: d.getMonth() } })}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"><ChevronLeft size={16} /></button>
            <p className="text-sm font-black text-slate-900">{MONTHS[current.month]} {current.year}</p>
            <button onClick={() => setCurrent(p => { const d = new Date(p.year, p.month + 1); return { year: d.getFullYear(), month: d.getMonth() } })}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"><ChevronRight size={16} /></button>
          </div>

          {/* Day Labels */}
          <div className="grid grid-cols-7 gap-1">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[9px] font-black text-slate-400 uppercase tracking-widest py-1">{d}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const dayEvents = getEventsForDay(day)
              const isToday = today.getDate() === day && today.getMonth() === current.month && today.getFullYear() === current.year
              const isSelected = selected === day
              return (
                <button key={day} onClick={() => {
                    const newDay = isSelected ? null : day
                    setSelected(newDay)
                    if (newDay) {
                      const d = `${current.year}-${String(current.month + 1).padStart(2, '0')}-${String(newDay).padStart(2, '0')}`
                      setForm(p => ({ ...p, date: d }))
                    }
                  }}
                  className={`relative flex flex-col items-center justify-start pt-1.5 pb-1 rounded-xl min-h-[44px] text-xs font-black transition-all border ${
                    isSelected ? 'bg-blue-500 text-white border-blue-500' :
                    isToday    ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                 'bg-white text-slate-700 border-slate-100 hover:border-blue-100 hover:bg-slate-50'
                  }`}>
                  {day}
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                      {dayEvents.slice(0, 3).map(e => (
                        <span key={e.id} className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white' : EVENT_COLORS[e.type].dot}`} />
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Selected Day Events */}
          <AnimatePresence>
            {selected && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                className="space-y-2">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  {selectedEvents.length ? `${selectedEvents.length} event(s) on ${MONTHS[current.month]} ${selected}` : `No events on ${MONTHS[current.month]} ${selected}`}
                </p>
                {selectedEvents.map(e => (
                  <div key={e.id} className={`flex items-start gap-3 p-3 rounded-2xl border ${EVENT_COLORS[e.type].light}`}>
                    <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${EVENT_COLORS[e.type].bg}`}>
                      {e.type === 'surgery' ? <Scissors size={13} className="text-white" /> :
                       e.type === 'upcoming' ? <Clock size={13} className="text-white" /> :
                       <Calendar size={13} className="text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-black ${EVENT_COLORS[e.type].text}`}>{e.title}</p>
                      <p className="text-[10px] font-bold text-slate-400">{e.time}{e.note ? ` • ${e.note}` : ''}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100">
            {Object.entries(EVENT_COLORS).map(([type, c]) => (
              <div key={type} className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${c.dot}`} />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest capitalize">{type}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add Event Modal */}
      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
              <div className="px-6 pt-5 pb-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${EVENT_COLORS[modal.type].bg}`}>
                    {modal.type === 'surgery' ? <Scissors size={13} className="text-white" /> :
                     modal.type === 'upcoming' ? <Clock size={13} className="text-white" /> :
                     <Calendar size={13} className="text-white" />}
                  </div>
                  <p className="text-sm font-black text-slate-900">
                    {modal.type === 'surgery' ? 'Schedule Procedure' : 'Next Appointment'}
                  </p>
                </div>
                <button onClick={() => setModal(null)}
                  className="h-8 w-8 flex items-center justify-center rounded-xl bg-white text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all border border-slate-200">
                  <X size={14} />
                </button>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Date</label>
                  <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-400 bg-slate-50" />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Time</label>
                  <input type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-400 bg-slate-50" />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Note (optional)</label>
                  <input type="text" value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
                    placeholder="Add a note..."
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-400 bg-slate-50" />
                </div>
                <button onClick={handleSave}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest transition-all ${EVENT_COLORS[modal.type].bg} hover:opacity-90`}>
                  <Check size={13} /> Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function DoctorPatientModal({ patient, onClose, onBookSurgery }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [viewReport, setViewReport] = useState(null)

  return (
    <>
      {/* Main Modal */}
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
                <div className="h-14 w-14 rounded-2xl bg-blue-500 text-white flex items-center justify-center text-2xl font-black shadow-md shrink-0">
                  {patient.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">{patient.name}</h2>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{patient.id}</span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                      <Droplets size={10} className="text-rose-400" />{patient.blood}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${patient.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                      {patient.status}
                    </span>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border bg-purple-50 text-purple-600 border-purple-100">
                      <Calendar size={9} /> Next: {MOCK.nextVisit}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={onClose}
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-white text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all border border-slate-200 shrink-0">
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto">
              {TABS.map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-[10px] font-black uppercase tracking-widest border-b-2 whitespace-nowrap transition-all ${
                    activeTab === tab.key ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}>
                  <tab.icon size={12} />{tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto px-8 py-6">

            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Age',    value: `${patient.age} yrs` },
                    { label: 'Gender', value: patient.gender        },
                    { label: 'Blood',  value: patient.blood         },
                    { label: 'Visits', value: patient.totalVisits   },
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
                    <p className="text-sm font-bold text-slate-900">{patient.phone}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin size={12} className="text-slate-400" />
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Address</p>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{MOCK.address}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Phone size={12} className="text-rose-400" />
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Emergency Contact</p>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{MOCK.emergency}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar size={12} className="text-purple-400" />
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Last Visit</p>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{patient.lastVisit}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={12} className="text-rose-500" />
                    <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Known Allergies</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {MOCK.allergies.map(a => (
                      <span key={a} className="px-3 py-1 rounded-full bg-white border border-rose-200 text-rose-600 text-[10px] font-black">{a}</span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                  <div className="flex items-center gap-2 mb-2">
                    <ClipboardList size={12} className="text-amber-500" />
                    <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Doctor Notes</p>
                  </div>
                  <p className="text-sm font-bold text-amber-900 leading-relaxed">{patient.notes}</p>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                  <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">Current Condition</p>
                  <p className="text-sm font-black text-blue-900">{patient.condition}</p>
                </div>
              </div>
            )}

            {/* REPORTS */}
            {activeTab === 'reports' && (
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{MOCK.reports.length} reports available</p>
                {MOCK.reports.map((r, i) => (
                  <motion.div key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-100 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                        <FileText size={16} className="text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{r.name}</p>
                        <p className="text-[10px] font-bold text-slate-400">{r.type} • {r.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${RESULT_COLORS[r.result] || 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                        {r.result}
                      </span>
                      <button onClick={() => setViewReport(r)}
                        className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all">
                        <Eye size={13} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* PRESCRIPTION */}
            {activeTab === 'prescription' && (
              <div className="space-y-6">
                {MOCK.prescriptions.map((rx, i) => (
                  <motion.div key={rx.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    className="rounded-2xl border border-slate-100 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-100">
                      <div>
                        <p className="text-xs font-black text-slate-900">{rx.id}</p>
                        <p className="text-[10px] font-bold text-slate-400">{rx.doctor} • {rx.date}</p>
                      </div>
                      <Pill size={16} className="text-blue-400" />
                    </div>
                    <div className="divide-y divide-slate-50">
                      {rx.medicines.map((m, j) => (
                        <div key={j} className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-5 py-3">
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Medicine</p>
                            <p className="text-xs font-black text-slate-900">{m.name}</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Dose</p>
                            <p className="text-xs font-bold text-slate-700">{m.dose}</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Frequency</p>
                            <p className="text-xs font-bold text-slate-700">{m.freq} · {m.duration}</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Instructions</p>
                            <p className="text-xs font-bold text-blue-600">{m.instructions}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-5 py-3 bg-amber-50 border-t border-amber-100">
                      <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1">Notes</p>
                      <p className="text-xs font-bold text-amber-900">{rx.notes}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* VITALS */}
            {activeTab === 'vitals' && (
              <div className="space-y-4">
                <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <Clock size={11} />
                  Last updated: {MOCK.vitals.lastUpdated} at {MOCK.vitals.lastUpdatedTime}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Blood Pressure', value: MOCK.vitals.bp        },
                    { label: 'Heart Rate',      value: MOCK.vitals.heartRate },
                    { label: 'Temperature',     value: MOCK.vitals.temp      },
                    { label: 'SpO2',            value: MOCK.vitals.spo2      },
                    { label: 'Weight',          value: MOCK.vitals.weight    },
                    { label: 'Height',          value: MOCK.vitals.height    },
                    { label: 'BMI',             value: MOCK.vitals.bmi       },
                  ].map((v, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{v.label}</p>
                      <p className="text-sm font-black text-slate-900">{v.value}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* CALENDAR */}
            {activeTab === 'calendar' && (
              <CalendarTab events={MOCK.calendarEvents} onBookSurgery={(ev) => onBookSurgery && onBookSurgery({ ...ev, patient: patient.name })} />
            )}

            {/* BILLING */}
            {activeTab === 'billing' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {[
                    { label: 'Total Paid',   value: MOCK.billing.filter(b => b.status === 'Paid').length,   cls: 'bg-emerald-50 border-emerald-100 text-emerald-600' },
                    { label: 'Total Unpaid', value: MOCK.billing.filter(b => b.status === 'Unpaid').length, cls: 'bg-rose-50 border-rose-100 text-rose-500'         },
                  ].map((s, i) => (
                    <div key={i} className={`p-4 rounded-2xl border text-center ${s.cls}`}>
                      <p className="text-2xl font-black">{s.value}</p>
                      <p className="text-[9px] font-black uppercase tracking-widest mt-1 opacity-70">{s.label}</p>
                    </div>
                  ))}
                </div>
                {MOCK.billing.map((b, i) => (
                  <motion.div key={b.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-100 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                        <DollarSign size={16} className="text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{b.desc}</p>
                        <p className="text-[10px] font-bold text-slate-400">{b.id} • {b.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <p className="text-sm font-black text-slate-900">{b.amount}</p>
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${BILL_COLORS[b.status]}`}>
                        {b.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

          </div>
        </motion.div>
      </div>

      {/* Report Detail Sub-Modal */}
      <AnimatePresence>
        {viewReport && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden"
            >
              <div className="px-8 pt-6 pb-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <FileText size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">{viewReport.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{viewReport.type} • {viewReport.date}</p>
                  </div>
                </div>
                <button onClick={() => setViewReport(null)}
                  className="h-9 w-9 flex items-center justify-center rounded-xl bg-white text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all border border-slate-200">
                  <X size={16} />
                </button>
              </div>

              <div className="px-8 py-6 space-y-5">
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                  <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1.5">Summary</p>
                  <p className="text-sm font-bold text-slate-800 leading-relaxed">{viewReport.summary}</p>
                </div>

                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Findings</p>
                  <div className="grid grid-cols-2 gap-3">
                    {viewReport.findings.map((f, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{f.label}</p>
                        <p className="text-sm font-black text-slate-900">{f.value}</p>
                        <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${RESULT_COLORS[f.status] || 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                          {f.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Reviewed By</p>
                    <p className="text-xs font-black text-slate-900 mt-0.5">{viewReport.doctor}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Lab / Dept</p>
                    <p className="text-xs font-black text-slate-900 mt-0.5">{viewReport.lab}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

export default DoctorPatientModal
