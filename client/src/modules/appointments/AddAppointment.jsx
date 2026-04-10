import { useEffect, useMemo, useState } from 'react'
import Button from '../../components/Button'
import Input from '../../components/Input'
import { APPOINTMENT_STATUSES } from '../../utils/constants'
import { validateAppointmentForm } from '../../utils/validators'
import { getAllDoctors } from '../doctors/doctorApi'
import { getDoctorAppointments } from './appointmentApi'
import { Clock, AlertTriangle, CalendarRange, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function AddAppointment({ patients, onSubmit, loading, initialDate, onCancel, hideStatus }) {
  const [formValues, setFormValues] = useState({
    patientId: '',
    doctorId: '',
    date: initialDate || '',
    time: '',
    status: 'Pending',
  })

  // Custom states for 12hr time format
  const [hour, setHour] = useState('12')
  const [minute, setMinute] = useState('00')
  const [ampm, setAmPm] = useState('AM')

  const [doctors, setDoctors] = useState([])
  const [bookedTimes, setBookedTimes] = useState([])
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (formValues.doctorId && formValues.date) {
      getDoctorAppointments(formValues.doctorId, 1, 100, formValues.date)
        .then(res => {
          const apps = res?.data?.appointments ?? res?.data ?? []
          setBookedTimes(apps.map(a => a.time))
        })
        .catch(() => setBookedTimes([]))
    }
  }, [formValues.doctorId, formValues.date])

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await getAllDoctors()
        setDoctors(res?.data?.data ?? res?.data ?? [])
      } catch (err) {
        console.error('Failed to fetch doctors', err)
      }
    }
    fetchDocs()
  }, [])

  // Keep selected date in sync when user switches days / opens modal.
  useEffect(() => {
    setFormValues((prev) => ({ ...prev, date: initialDate || '' }))
  }, [initialDate])

  // Sync custom 12-hr inputs to the formValues.time (24-hr) for validation/storage
  useEffect(() => {
    let h = parseInt(hour, 10)
    if (ampm === 'PM' && h < 12) h += 12
    if (ampm === 'AM' && h === 12) h = 0
    const formattedTime = `${String(h).padStart(2, '0')}:${minute}`
    setFormValues((prev) => ({ ...prev, time: formattedTime }))
  }, [hour, minute, ampm])

  const patientOptions = useMemo(
    () =>
      patients.map((patient) => ({
        label: patient.name,
        value: patient.id || patient._id,
      })),
    [patients],
  )

  const doctorOptions = useMemo(() => 
    doctors.map((doctor) => ({
      label: doctor.name,
      value: doctor._id,
    })),
  [doctors])

  const selectedDoctor = useMemo(() => 
    doctors.find(d => d._id === formValues.doctorId), 
  [doctors, formValues.doctorId])

  const availabilityError = useMemo(() => {
    if (!selectedDoctor || !formValues.date || !formValues.time) return null;
    
    // If availability is still a string (legacy), we can't easily validate
    if (!Array.isArray(selectedDoctor.availability) || selectedDoctor.availability.length === 0) return null;

    const date = new Date(formValues.date);
    const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = DAYS[date.getDay()];
    
    const slot = selectedDoctor.availability.find(a => a.day === dayName);
    if (!slot) return `Doctor is not available on ${dayName}`;
    
    const [h, m] = formValues.time.split(':').map(Number);
    const currentTime = h * 60 + m;
    
    const [sh, sm] = slot.startTime.split(':').map(Number);
    const startTime = sh * 60 + sm;
    
    const [eh, em] = slot.endTime.split(':').map(Number);
    const endTime = eh * 60 + em;
    
    if (currentTime < startTime || currentTime > endTime) {
      return `Available only between ${slot.startTime} and ${slot.endTime} on ${dayName}`;
    }
    
    if (bookedTimes.includes(formValues.time)) {
      return `This time slot is already booked for Dr. ${selectedDoctor.name}`;
    }

    return null;
  }, [selectedDoctor, formValues.date, formValues.time, bookedTimes])

  const availableSlots = useMemo(() => {
    if (!selectedDoctor || !formValues.date || !Array.isArray(selectedDoctor.availability)) return []
    const date = new Date(formValues.date)
    const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const dayName = DAYS[date.getDay()]
    const rules = selectedDoctor.availability.find(a => a.day === dayName)
    if (!rules) return []

    const slots = []
    let [sh, sm] = rules.startTime.split(':').map(Number)
    let [eh, em] = rules.endTime.split(':').map(Number)
    let current = sh * 60 + sm
    const end = eh * 60 + em

    while (current <= end) {
      const h = Math.floor(current / 60)
      const m = current % 60
      const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      slots.push({
        time: timeStr,
        isBooked: bookedTimes.includes(timeStr)
      })
      current += 30
    }
    return slots
  }, [selectedDoctor, formValues.date, bookedTimes])

  const selectSlot = (timeStr) => {
    const [h24, m] = timeStr.split(':')
    let h = parseInt(h24, 10)
    let mode = 'AM'
    if (h >= 12) {
      mode = 'PM'
      if (h > 12) h -= 12
    }
    if (h === 0) h = 12
    setHour(String(h).padStart(2, '0'))
    setMinute(m)
    setAmPm(mode)
  }

  const statusOptions = APPOINTMENT_STATUSES.map((status) => ({
    label: status,
    value: status,
  }))

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationErrors = validateAppointmentForm(formValues)
    if (availabilityError) {
      validationErrors.time = availabilityError
    }
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length) return

    await onSubmit(formValues)
    setFormValues({
      patientId: '',
      doctorId: '',
      date: initialDate || '',
      time: '12:00',
      status: 'Pending',
    })
    setHour('12')
    setMinute('00')
    setAmPm('AM')
    setErrors({})
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="space-y-6">
        <section>
          <div className="flex items-center gap-4 mb-4">
            <h3 className="text-sm font-black text-slate-900 border-l-4 border-emerald-500 pl-4 uppercase tracking-[0.2em]">
              1. Clinical Information
            </h3>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Input
              label="Select Patient"
              name="patientId"
              as="select"
              value={formValues.patientId}
              onChange={handleChange}
              options={patientOptions}
              error={errors.patientId}
            />
            <Input
              label="Assign Doctor"
              name="doctorId"
              as="select"
              value={formValues.doctorId}
              onChange={handleChange}
              options={doctorOptions}
              error={errors.doctorId}
            />
            {!hideStatus && (
              <Input
                label="Appointment Status"
                name="status"
                as="select"
                value={formValues.status}
                onChange={handleChange}
                options={statusOptions}
                error={errors.status}
              />
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-4 mb-4">
            <h3 className="text-sm font-black text-slate-900 border-l-4 border-emerald-500 pl-4 uppercase tracking-[0.2em]">
              2. Schedule Details
            </h3>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Appointment Date"
              name="date"
              type="date"
              value={formValues.date}
              min={new Date().toISOString().split('T')[0]}
              onChange={handleChange}
              error={errors.date}
            />

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-700 uppercase tracking-tighter">Appointment Time</label>
              <div className="flex items-center gap-3">
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <select
                    value={hour}
                    onChange={(e) => setHour(e.target.value)}
                    className={`w-full appearance-none rounded-2xl border bg-slate-50 px-5 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 ${errors.time ? 'border-rose-300' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    {[...Array(12)].map((_, i) => {
                      const h = String(i + 1).padStart(2, '0')
                      return <option key={h} value={h}>{h}</option>
                    })}
                  </select>
                  <select
                    value={minute}
                    onChange={(e) => setMinute(e.target.value)}
                    className={`w-full appearance-none rounded-2xl border bg-slate-50 px-5 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 ${errors.time ? 'border-rose-300' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    {['00', '15', '30', '45'].map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="h-8 w-px bg-slate-200"></div>
                <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1 shrink-0 shadow-inner">
                  {['AM', 'PM'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setAmPm(mode)}
                      className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                        ampm === mode 
                          ? 'bg-white text-emerald-600 shadow-md' 
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
              {errors.time && (
                <p className="mt-2 text-xs font-bold text-rose-500">{errors.time}</p>
              )}
            </div>
          </div>

          {/* Quick Slot Selector */}
          <AnimatePresence>
            {availableSlots.length > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="mt-8 space-y-4 overflow-hidden">
                <div className="flex items-center gap-3">
                  <CalendarRange size={16} className="text-slate-400" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Available Rotation Slots (30m)</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableSlots.map((slot, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={slot.isBooked}
                      onClick={() => selectSlot(slot.time)}
                      className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center gap-2 ${
                        formValues.time === slot.time
                          ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-200 scale-105'
                          : slot.isBooked
                            ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 active:scale-95'
                      }`}
                    >
                      {slot.time}
                      {formValues.time === slot.time && <CheckCircle2 size={10} />}
                      {slot.isBooked && <span className="text-[8px] opacity-60">(Booked)</span>}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Availability Alert */}
          <AnimatePresence>
            {availabilityError && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-start gap-3">
                <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={16} />
                <div>
                  <p className="text-xs font-black text-amber-800 uppercase tracking-widest">Schedule Conflict</p>
                  <p className="text-[11px] font-bold text-amber-600 mt-0.5">{availabilityError}</p>
                </div>
              </motion.div>
            )}

            {selectedDoctor && Array.isArray(selectedDoctor.availability) && selectedDoctor.availability.length > 0 && !availabilityError && formValues.time && (
               <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                 className="mt-4 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-center gap-3">
                 <Clock className="text-emerald-500" size={16} />
                 <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                   Doctor is available during this time
                 </p>
               </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>

      <div className="mt-8 border-t border-slate-100 pt-6 flex justify-end items-center gap-6">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden md:block">Double-check all entries before confirming</p>
        <button
          type="submit"
          disabled={loading}
          className={`group flex items-center gap-3 px-10 py-4 rounded-2xl bg-slate-900 text-white text-sm font-black uppercase tracking-[0.2em] transition-all transform active:scale-95 shadow-2xl shadow-slate-200 hover:bg-emerald-500 hover:shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? 'Processing...' : 'Confirm Appointment'}
          <svg className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </button>
      </div>
    </form>
  )
}

export default AddAppointment
