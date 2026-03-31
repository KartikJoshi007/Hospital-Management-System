import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import AddAppointment from './AddAppointment'
import AppointmentTable from './AppointmentTable'
import Alert from '../../components/Alert'
import Loader from '../../components/Loader'
import useAppointments from '../../hooks/useAppointments'
import usePatients from '../../hooks/usePatients'
// import formatDate from "../../utils/formatData"
import { formatDate } from '../../utils/formatData'
const toDateKey = (value) => {
  if (!value) return ''
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const formatDateKey = (key) => {
  if (!key) return '-'
  const [y, m, d] = key.split('-').map(Number)
  return formatDate(new Date(y, m - 1, d))
}

function Appointments({ view = 'calendar' }) {
  const navigate = useNavigate()
  const {
    appointments,
    loading: appointmentsLoading,
    error: appointmentsError,
    clearError: clearAppointmentsError,
    message,
    setMessage,
    addAppointment,
  } = useAppointments()
  const { patients, loading: patientsLoading } = usePatients()

  const today = useMemo(() => new Date(), [])

  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth()) // 0-11
  const [selectedDateKey, setSelectedDateKey] = useState(toDateKey(today))
  const [isFormOpen, setIsFormOpen] = useState(false)

  const monthDays = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1)
    const startWeekday = first.getDay() // 0=Sun
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

    return Array.from({ length: 42 }, (_, idx) => {
      const dayNum = idx - startWeekday + 1
      if (dayNum < 1 || dayNum > daysInMonth) return null
      const date = new Date(viewYear, viewMonth, dayNum)
      return { date, key: toDateKey(date), dayNum }
    })
  }, [viewYear, viewMonth])

  const patientMap = useMemo(() => {
    return patients.reduce((acc, patient) => {
      acc[patient.id || patient._id] = patient.name
      return acc
    }, {})
  }, [patients])

  const appointmentsByDateKey = useMemo(() => {
    const map = {}
    for (const appointment of appointments) {
      const key = toDateKey(appointment.date)
      if (!key) continue
      map[key] = map[key] || []
      map[key].push(appointment)
    }
    return map
  }, [appointments])

  const selectedAppointments = useMemo(() => {
    return appointments.filter(
      (a) => toDateKey(a.date) === selectedDateKey,
    )
  }, [appointments, selectedDateKey])

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((y) => y - 1)
      return
    }
    setViewMonth((m) => m - 1)
  }

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((y) => y + 1)
      return
    }
    setViewMonth((m) => m + 1)
  }

  const handleSubmit = async (payload) => {
    try {
      await addAppointment(payload)
      setIsFormOpen(false)
      if (view === 'book') {
        navigate('/appointments/calendar')
      }
    } catch {
      // Error is handled in custom hook state.
    }
  }

  return (
    <div className="space-y-8 pb-10">
      <Alert type="success" message={message} onClose={() => setMessage('')} />
      <Alert type="error" message={appointmentsError} onClose={clearAppointmentsError} />

      {/* Booking Form (Full Screen/Modal Integration) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-5xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden scale-in-center">
            <div className="p-8">
              <div className="flex items-center justify-between mb-10">
                <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Schedule Consultation</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ensuring seamless patient-doctor handshake</p>
                </div>
                <button onClick={() => setIsFormOpen(false)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors border border-slate-100">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <AddAppointment
                patients={patients}
                onSubmit={handleSubmit}
                loading={appointmentsLoading}
                initialDate={selectedDateKey}
                onCancel={() => setIsFormOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Daily List Drawer (Contextual Popup) */}
      {selectedDateKey && view === 'calendar' && !isFormOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden scale-in-center">
            <div className="border-b border-slate-100 p-8 flex items-center justify-between bg-slate-50/30">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  {formatDateKey(selectedDateKey)}
                  <div className="h-6 w-px bg-slate-200"></div>
                  <span className="text-emerald-500 text-sm font-bold uppercase tracking-widest">{selectedAppointments.length} Visits</span>
                </h3>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">Live schedule for clinical rotations</p>
              </div>
              <div className="flex gap-3">
                <Button variant="primary" onClick={() => setIsFormOpen(true)} className="!bg-[#0F172A] !hover:bg-slate-800 !rounded-xl text-[10px] font-black uppercase tracking-widest px-6 shadow-lg shadow-slate-200">
                  Book New
                </Button>
                <button
                  onClick={() => setSelectedDateKey(null)}
                  className="h-11 w-11 flex items-center justify-center rounded-xl bg-white text-slate-400 hover:text-slate-600 border border-slate-200 transition-all hover:bg-slate-50 shadow-sm"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            <div className="p-8 max-h-[60vh] overflow-y-auto">
              <AppointmentTable appointments={selectedAppointments} patients={patients} />
            </div>
          </div>
        </div>
      )}

      {view === 'book' ? (
        <div className="bg-white p-8 lg:p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40 w-full mx-auto animate-in fade-in zoom-in-95 duration-700">
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-[1.25rem] bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-200 ring-8 ring-emerald-50">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Clinical Booking</h2>
              </div>
              <p className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.4em] ml-1">Advanced Clinical Rotation Registry</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/appointments/calendar')}
                className="px-8 py-3 rounded-2xl border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 hover:border-rose-100 hover:bg-rose-50 transition-all active:scale-95"
              >
                Back to Calendar
              </button>
            </div>
          </div>

          <div className="bg-slate-50/30 p-1 lg:p-1 rounded-[2.5rem]">
            <AddAppointment
              patients={patients}
              onSubmit={handleSubmit}
              loading={appointmentsLoading}
              initialDate={selectedDateKey}
              onCancel={() => navigate('/appointments/calendar')}
              hideStatus={true}
            />
          </div>
        </div>
      ) : view === 'view' ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
          <div className="mb-10 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Full Schedule</h2>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Audit log of all hospital traffic</p>
            </div>
            <Button onClick={() => navigate('/appointments/book')} className="!bg-[#0F172A] !rounded-xl px-8 font-black uppercase tracking-widest text-[10px]">Book Consultation</Button>
          </div>
          {appointmentsLoading || patientsLoading ? (
            <div className="py-20"><Loader label="Collecting logs..." /></div>
          ) : (
            <AppointmentTable appointments={appointments} patients={patients} />
          )}
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden text-slate-900">
          {/* Calendar Header */}
          <div className="flex flex-col gap-6 border-b border-slate-100 px-10 pt-10 pb-8 md:flex-row md:items-end md:justify-between items-start">
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                {new Date(viewYear, viewMonth, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                <span className="flex h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"></span>
              </h2>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Interactive appointment scheduler</p>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="flex items-center rounded-xl bg-slate-50 p-1 border border-slate-100 shadow-inner w-full md:w-auto">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="rounded-lg px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all hover:bg-white hover:text-emerald-600 hover:shadow-sm flex-1 md:flex-none"
                >
                  Prev
                </button>
                <div className="h-3 w-px bg-slate-200 mx-1"></div>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="rounded-lg px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all hover:bg-white hover:text-emerald-600 hover:shadow-sm flex-1 md:flex-none"
                >
                  Next
                </button>
              </div>
              <Button onClick={() => navigate('/appointments/book')} className="!bg-[#0F172A] !hover:bg-slate-800 !rounded-xl h-11 px-6 font-black uppercase tracking-widest text-[10px] whitespace-nowrap shadow-xl shadow-slate-100">Book New</Button>
            </div>
          </div>

          {appointmentsLoading || patientsLoading ? (
            <div className="py-24"><Loader label="Encrypting calendar views..." /></div>
          ) : (
            <div className="w-full">
              {/* Day Names Header */}
              <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/30">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d} className="py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-px bg-slate-100 border-l border-r border-slate-100">
                {monthDays.map((cell, idx) => {
                  if (!cell) {
                    return <div key={`empty-${idx}`} className="min-h-[160px] bg-slate-50/40" />
                  }

                  const dayKey = cell.key
                  const dayAppointments = appointmentsByDateKey[dayKey] || []
                  const isToday = dayKey === toDateKey(new Date())

                  return (
                    <button
                      key={dayKey}
                      type="button"
                      onClick={() => setSelectedDateKey(dayKey)}
                      className="group relative min-h-[160px] bg-white p-4 text-left transition-all hover:z-10 hover:shadow-2xl hover:bg-slate-50/80 active:scale-[0.98]"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className={`text-sm font-black transition-all ${isToday ? 'flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'text-slate-900 group-hover:text-emerald-600'
                          }`}>
                          {cell.dayNum}
                        </span>
                        {dayAppointments.length > 0 && (
                          <span className={`h-2 w-2 rounded-full ${isToday ? 'bg-emerald-500' : 'bg-emerald-500 animate-pulse'}`}></span>
                        )}
                      </div>

                      <div className="space-y-2">
                        {dayAppointments.slice(0, 3).map((appt, i) => (
                          <div key={`${dayKey}-${i}`} className="flex items-center gap-2 truncate rounded-xl bg-white border border-slate-100 px-3 py-2 text-[9px] font-bold text-slate-600 shadow-sm group-hover:border-emerald-100 group-hover:bg-emerald-50/30 transition-colors">
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400"></span>
                            <span className="font-black text-slate-900">{appt.time ? String(appt.time).slice(0, 5) : '--:--'}</span>
                            <span className="truncate opacity-70">{patientMap[appt.patientId] || 'Unknown'}</span>
                          </div>
                        ))}
                        {dayAppointments.length > 3 && (
                          <div className="pl-1 text-[9px] font-black text-emerald-600 uppercase tracking-widest mt-1">
                            + {dayAppointments.length - 3} more
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Appointments
