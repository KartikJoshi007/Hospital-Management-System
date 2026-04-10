import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Clock,
  ChevronRight,
  Filter,
  CheckCircle2,
  XCircle,
  Clock3,
  Plus,
  Stethoscope,
  Info,
  ArrowLeft,
  Search,
  MoreVertical,
  X,
  Check,
  Loader2,
  Activity,
  CalendarClock,
  Trash2,
  CalendarRange,
  AlertTriangle
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import ModernTable from './ModernTable'
import useAuth from '../../../hooks/useAuth'
import { getPatientByUserId } from '../../patients/patientApi'
import { getPatientAppointments, createAppointment, cancelAppointment, updateAppointment, getDoctorAppointments } from '../../appointments/appointmentApi'
import { getAllDoctors } from '../../doctors/doctorApi'
import { toast } from 'react-toastify'

const departments = ['All', 'Cardiology', 'Neurology', 'Orthopedics', 'Dermatology']

function MyAppointments() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const [view, setView] = useState('list')
  const [appointments, setAppointments] = useState([])
  const [patientData, setPatientData] = useState(null)
  const [doctorList, setDoctorList] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const initialTab = new URLSearchParams(location.search).get('tab')
  const [activeTab, setActiveTab] = useState(['upcoming', 'past'].includes(initialTab) ? initialTab : 'upcoming')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeMenu, setActiveMenu] = useState(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedDept, setSelectedDept] = useState('All')
  const [rescheduleData, setRescheduleData] = useState(null)
  const [bookedTimes, setBookedTimes] = useState([])
  const [bookingForm, setBookingForm] = useState({
    doctorId: '',
    date: '',
    time: '',
    reason: '',
    type: 'In-Clinic'
  })

  useEffect(() => {
    const dId = bookingForm.doctorId || rescheduleData?.doctorId;
    const dDate = bookingForm.date || rescheduleData?.date;
    if (dId && dDate) {
      getDoctorAppointments(dId, 1, 100, dDate)
        .then(res => {
          const apps = res?.data?.appointments ?? res?.data ?? []
          setBookedTimes(apps.map(a => a.time))
        })
        .catch(() => setBookedTimes([]))
    }
  }, [bookingForm.doctorId, bookingForm.date, rescheduleData?.doctorId, rescheduleData?.date])

  const filteredAppointments = appointments.filter(apt => {
    const matchesTab = activeTab === 'upcoming'
      ? ['Confirmed', 'Pending', 'Rescheduled'].includes(apt.status)
      : ['Completed', 'Cancelled', 'No-show'].includes(apt.status)
    const matchesSearch = apt.doctor.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDept = selectedDept === 'All' || apt.dept === selectedDept
    return matchesTab && matchesSearch && matchesDept
  })



  const selectedDoctor = doctorList.find(d => d._id === bookingForm.doctorId)
  
  const availableSlots = useMemo(() => {
    const activeDoctor = selectedDoctor || (rescheduleData ? doctorList.find(d => d._id === rescheduleData.doctorId) : null);
    const activeDate = bookingForm.date || rescheduleData?.date;

    if (!activeDoctor || !activeDate || !Array.isArray(activeDoctor.availability)) return []
    const date = new Date(activeDate)
    const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const dayName = DAYS[date.getDay()]
    const rules = activeDoctor.availability.find(a => a.day === dayName)
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
  }, [selectedDoctor, rescheduleData, bookingForm.date, bookedTimes, doctorList])

  const availabilityError = useMemo(() => {
    const activeDoctor = selectedDoctor;
    if (!activeDoctor || !bookingForm.date || !bookingForm.time) return null;
    
    if (!Array.isArray(activeDoctor.availability) || activeDoctor.availability.length === 0) return null;

    const date = new Date(bookingForm.date);
    const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = DAYS[date.getDay()];
    
    const slot = activeDoctor.availability.find(a => a.day === dayName);
    if (!slot) return `Doctor is not available on ${dayName}`;
    
    const [h, m] = bookingForm.time.split(':').map(Number);
    const currentTime = h * 60 + m;
    
    const [sh, sm] = slot.startTime.split(':').map(Number);
    const startTime = sh * 60 + sm;
    
    const [eh, em] = slot.endTime.split(':').map(Number);
    const endTime = eh * 60 + em;
    
    if (currentTime < startTime || currentTime > endTime) {
      return `Available only between ${slot.startTime} and ${slot.endTime} on ${dayName}`;
    }
    
    if (bookedTimes.includes(bookingForm.time)) {
      return `This slot is already reserved.`;
    }
    
    return null;
  }, [selectedDoctor, bookingForm.date, bookingForm.time, bookedTimes])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const pRes = await getPatientByUserId(user.id)
        const patient = pRes.data
        setPatientData(patient)

        const aRes = await getPatientAppointments(patient._id)
        const apts = aRes.data.appointments || aRes.data || []
        const formatted = apts.map(apt => ({
          id: apt._id,
          doctor: apt.doctor || 'N/A',
          dept: apt.dept || 'General',
          date: apt.date ? apt.date.split('T')[0] : 'N/A',
          time: apt.time || 'N/A',
          status: apt.status ? (apt.status.charAt(0).toUpperCase() + apt.status.slice(1)) : 'Pending',
          type: apt.type || 'In-Clinic',
          location: apt.location || 'Hospital Clinic'
        }))
        setAppointments(formatted)

        const dRes = await getAllDoctors(1, 100)
        setDoctorList(dRes.data?.doctors || dRes.data || [])
      } catch (err) {
        console.error('Data fetch failed:', err)
      } finally {
        setLoading(false)
      }
    }
    if (user?.id) fetchData()
  }, [user?.id])

  const handleCancelVisit = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await cancelAppointment(id)
        setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, status: 'Cancelled' } : apt))
        setActiveMenu(null)
        toast.success('Appointment cancelled successfully.')
      } catch (err) {
        toast.error(err.message || 'Failed to cancel appointment')
      }
    }
  }

  const handleBooking = async (e) => {
    e.preventDefault()
    if (!bookingForm.doctorId || !bookingForm.date || !bookingForm.time) {
      toast.warning('Please fill in all required fields including a time slot')
      return
    }
    if (availabilityError) {
      toast.error(availabilityError)
      return
    }
    try {
      setSubmitting(true)
      const selectedDoctor = doctorList.find(d => d._id === bookingForm.doctorId)
      const payload = {
        patient: patientData.name,
        doctor: selectedDoctor?.name || 'N/A',
        dept: selectedDoctor?.specialization || 'General',
        date: bookingForm.date,
        time: bookingForm.time,
        reason: bookingForm.reason || 'General Consultation',
        status: 'Pending',
        patientId: patientData._id,
        doctorId: selectedDoctor?._id
      }
      await createAppointment(payload)
      toast.success('Appointment scheduled successfully!')
      setView('list')
      // Refresh list
      const aRes = await getPatientAppointments(patientData._id)
      const apts = aRes.data.appointments || aRes.data || []
      const formatted = apts.map(apt => ({
          id: apt._id,
          doctor: apt.doctor || 'N/A',
          dept: apt.dept || 'General',
          date: apt.date ? apt.date.split('T')[0] : 'N/A',
          time: apt.time || 'N/A',
          status: apt.status ? (apt.status.charAt(0).toUpperCase() + apt.status.slice(1)) : 'Pending',
          type: apt.type || 'In-Clinic',
          location: apt.location || 'Hospital Clinic'
        }))
        setAppointments(formatted)
    } catch (err) {
      toast.error(err.message || 'Failed to book appointment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReschedule = async (e) => {
    e.preventDefault()
    if (!rescheduleData.date || !rescheduleData.time) {
      toast.warning('Please select a new date and time')
      return
    }
    try {
      setSubmitting(true)
      await updateAppointment(rescheduleData.id, {
        date: rescheduleData.date,
        time: rescheduleData.time,
        status: 'Rescheduled'
      })
      toast.success('Your appointment time has been changed!')
      setRescheduleData(null)
      // Refresh list
      const aRes = await getPatientAppointments(patientData._id)
      const apts = aRes.data.appointments || aRes.data || []
      const formatted = apts.map(apt => ({
          id: apt._id,
          doctor: apt.doctor || 'N/A',
          dept: apt.dept || 'General',
          date: apt.date ? apt.date.split('T')[0] : 'N/A',
          time: apt.time || 'N/A',
          status: apt.status ? (apt.status.charAt(0).toUpperCase() + apt.status.slice(1)) : 'Pending',
          type: apt.type || 'In-Clinic',
          location: apt.location || 'Hospital Clinic'
      }))
      setAppointments(formatted)
    } catch (err) {
      toast.error('Could not change the time. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleViewDetails = (apt) => {
    toast.info(
      <div>
        <h4 className="font-black text-[11px] uppercase tracking-widest mb-2 border-b border-blue-100 pb-1 text-slate-900">Appointment Ledger</h4>
        <div className="space-y-1 text-[10px] font-bold text-slate-600">
           <p><span className="text-slate-400">DOCTOR:</span> {apt.doctor}</p>
           <p><span className="text-slate-400">UNIT:</span> {apt.dept}</p>
           <p><span className="text-slate-400">SCHEDULE:</span> {new Date(apt.date).toDateString()} @ {apt.time}</p>
           <p><span className="text-slate-400">LOC:</span> {apt.location || 'Clinical Wing A'}</p>
        </div>
      </div>,
      { icon: <Activity size={18} className="text-blue-500" /> }
    )
    setActiveMenu(null)
  }

  const StatusBadge = ({ status }) => {
    const config = {
      'Confirmed': { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', icon: CheckCircle2 },
      'Pending': { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', icon: Clock3 },
      'Completed': { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', icon: CheckCircle2 },
      'Cancelled': { bg: 'bg-rose-50', text: 'text-rose-500', border: 'border-rose-100', icon: XCircle },
      'No-show': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: XCircle },
      'Rescheduled': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', icon: Clock3 },
    }
    const { bg, text, border, icon: Icon } = config[status] || config['Pending']
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${bg} ${text} ${border}`}>
        <Icon size={12} strokeWidth={3} /> {status}
      </span>
    )
  }

  const tableHeaders = ['Doctor / Specialist', 'Type', 'Unit / Location', 'Date & Time', 'Status', 'Actions']

  const renderAptRow = (apt) => {
    const docInitials = apt.doctor.split(' ').filter(n => n.length > 0).map(n => n[0]).join('')
    return (
      <tr key={apt.id} className="hover:bg-slate-50/50 transition-all group">
        <td className="px-6 py-4 border-none text-left">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-slate-100 text-slate-400 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-all border border-slate-200 group-hover:border-emerald-400 shrink-0">
              <Stethoscope size={16} strokeWidth={3} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-slate-900 leading-tight truncate max-w-[200px]">{apt.doctor}</p>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 text-center">
          <span className="inline-flex px-3 py-1.5 rounded-lg text-[9px] font-black bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-widest">
            {apt.type}
          </span>
        </td>
        <td className="px-6 py-4 text-center">
          <div className="flex flex-col items-center">
            <p className="text-[13px] font-black text-slate-700 leading-tight">{apt.dept}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-70">{apt.location || 'Our Hospital'}</p>
          </div>
        </td>
        <td className="px-6 py-4 text-center">
          <div className="flex flex-col items-center">
            <p className="text-[13px] font-black text-slate-700 leading-tight">
              {new Date(apt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{apt.time}</p>
          </div>
        </td>
        <td className="px-6 py-4 text-center">
          <StatusBadge status={apt.status} />
        </td>
        <td className="px-6 py-4 text-center">
          <div className="flex justify-center items-center gap-3">
            <div className="relative inline-block">
              <button 
                onClick={() => setActiveMenu(activeMenu === apt.id ? null : apt.id)} 
                className="p-2 rounded-xl transition-all text-slate-300 hover:text-slate-900 hover:bg-slate-100 border border-slate-100"
              >
                <MoreVertical size={18} strokeWidth={3} />
              </button>
              <AnimatePresence>
                {activeMenu === apt.id && (
                  <motion.div initial={{ opacity: 0, scale: 0.95, x: 10 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95, x: 10 }} className="absolute right-full top-0 mr-3 w-48 bg-white rounded-2xl border border-slate-100 shadow-2xl z-[1000] py-2 origin-right text-left">
                    <button onClick={() => handleViewDetails(apt)} className="w-full px-5 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-emerald-500 transition-all flex items-center gap-3"><Info size={14} strokeWidth={3} /> View Details</button>
                    
                    {(apt.status === 'Confirmed' || apt.status === 'Pending' || apt.status === 'Rescheduled') && (
                      <>
                        <button 
                          onClick={() => {
                            const doc = doctorList.find(d => d.name === apt.doctor || d.specialization === apt.dept);
                            setRescheduleData({ ...apt, doctorId: doc?._id });
                            setActiveMenu(null);
                          }} 
                          className="w-full px-5 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-amber-600 hover:bg-amber-50 transition-all flex items-center gap-3 border-t border-slate-50"
                        >
                          <CalendarClock size={14} strokeWidth={3} /> Change Time
                        </button>
                        <button 
                          onClick={() => handleCancelVisit(apt.id)} 
                          className="w-full px-5 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 transition-all flex items-center gap-3 border-t border-slate-50"
                        >
                          <Trash2 size={14} strokeWidth={3} /> Cancel Visit
                        </button>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-700 w-full px-2 sm:px-4 max-w-[100vw] overflow-x-hidden">

      {/* 🏙️ Visit Schedule Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 border-l-4 border-emerald-500 pl-4">Visit Schedule</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 pl-5">Oversee and coordinate your clinical consultations</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setView(view === 'list' ? 'book' : 'list')} 
            className={`flex items-center gap-2 px-5 py-3 ${view === 'list' ? 'bg-slate-900 hover:bg-emerald-500' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} text-white rounded-xl transition-all font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95`}
          >
            {view === 'list' ? <Plus size={16} strokeWidth={3} /> : <ArrowLeft size={16} strokeWidth={3} />}
            {view === 'list' ? 'Book New Visit' : 'Back to Records'}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">

            {/* 🔍 Filters & Quick Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex p-1.5 bg-slate-100 rounded-2xl lg:self-auto self-start overflow-x-auto max-w-full">
                {['upcoming', 'past'].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 flex-1 w-full lg:max-w-lg">
                <div className="relative flex-1 min-w-0">
                  <Search size={16} strokeWidth={3} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input type="text" placeholder="Search by specialist..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50/50 transition-all" />
                </div>
                <div className="relative shrink-0">
                  <button onClick={() => setIsFilterOpen(!isFilterOpen)} className={`p-4 rounded-xl transition-all border ${isFilterOpen ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white text-slate-400 border-slate-100 hover:text-slate-900'}`}>
                    <Filter size={20} strokeWidth={3} />
                  </button>
                  <AnimatePresence>
                    {isFilterOpen && (
                      <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute right-0 top-full mt-3 w-60 bg-white rounded-[2rem] shadow-2xl border border-slate-100 py-4 z-[150] overflow-hidden">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-6 py-2">Consultation Dept</p>
                        {departments.map(d => (
                          <button key={d} onClick={() => { setSelectedDept(d); setIsFilterOpen(false); }} className={`w-full flex items-center justify-between px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${selectedDept === d ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                            {d} {selectedDept === d && <Check size={14} strokeWidth={4} />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="min-h-[400px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 text-slate-300 gap-4">
                  <Loader2 size={32} strokeWidth={3} className="animate-spin text-emerald-500" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Hydrating Sessions...</p>
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200 gap-4 opacity-60">
                  <Calendar size={48} strokeWidth={1} className="text-slate-300" />
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 text-center px-6">Direct consultative history not available</p>
                </div>
              ) : (
                <ModernTable headers={tableHeaders} data={filteredAppointments} renderRow={renderAptRow} />
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div key="book" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="flex justify-center w-full">
            <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden w-full max-w-4xl relative">
              <div className="p-8 sm:p-10 border-b border-slate-50 flex items-center justify-between bg-emerald-50/20">
                <div className="flex items-center gap-5">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20"><Stethoscope size={24} strokeWidth={3} /></div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none text-left">Clinical Setup</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 text-left">Initialize healthcare session</p>
                  </div>
                </div>
                <button onClick={() => setView('list')} className="p-2 text-slate-300 hover:text-slate-900 hover:bg-white rounded-xl transition-all border-none bg-transparent outline-none"><X size={20} strokeWidth={3} /></button>
              </div>

              <form onSubmit={handleBooking} className="p-8 sm:p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                   <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-left block">Select Specialist</label>
                    <select required value={bookingForm.doctorId} onChange={e => setBookingForm({ ...bookingForm, doctorId: e.target.value, time: '' })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200/60 rounded-xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-emerald-400 transition-all cursor-pointer">
                      <option value="" disabled>Search Unit Specialist...</option>
                      {doctorList.map(d => <option key={d._id} value={d._id}>{d.name} ({d.specialization})</option>)}
                    </select>
                    {selectedDoctor && (
                      <div className="flex items-center gap-2 mt-2 px-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">On-Duty: {selectedDoctor.shift} Shift</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-left block">Appointment Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                      <input 
                        required 
                        type="date" 
                        value={bookingForm.date} 
                        min={new Date().toISOString().split('T')[0]} 
                        onChange={e => setBookingForm({ ...bookingForm, date: e.target.value, time: '' })} 
                        className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200/60 rounded-xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-emerald-400 transition-all" 
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-4">
                    <div className="flex items-center gap-3">
                      <CalendarRange size={16} className="text-slate-400" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Select an available timing slot</p>
                    </div>
                    {availableSlots.length === 0 ? (
                      <div className="p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {bookingForm.doctorId && bookingForm.date ? 'Doctor is not available on this day' : 'Select a doctor and date first'}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {availableSlots.map((slot, idx) => (
                          <button
                            key={idx}
                            type="button"
                            disabled={slot.isBooked}
                            onClick={() => setBookingForm({ ...bookingForm, time: slot.time })}
                            className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-2 ${
                              bookingForm.time === slot.time
                                ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-200 scale-105'
                                : slot.isBooked
                                  ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                                  : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 active:scale-95'
                            }`}
                          >
                            {slot.time}
                            {bookingForm.time === slot.time && <CheckCircle2 size={10} />}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {availabilityError && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-3">
                        <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={14} />
                        <div>
                          <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest leading-none">Scheduling Policy</p>
                          <p className="text-[10px] font-bold text-amber-600 mt-1">{availabilityError}</p>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-left block">Brief Symptoms / Notes</label>
                    <textarea required rows={3} value={bookingForm.reason} onChange={e => setBookingForm({ ...bookingForm, reason: e.target.value })} placeholder="Reason for clinical encounter..." className="w-full px-6 py-5 bg-slate-50 border border-slate-200/60 rounded-[1.5rem] text-sm font-bold text-slate-900 outline-none resize-none focus:bg-white focus:border-emerald-400 transition-all" />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <Info size={16} className="text-slate-300" strokeWidth={3} />
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">Validate clinical data before final submission.</p>
                  </div>
                  <button type="submit" disabled={submitting} className="w-full sm:w-auto flex items-center justify-center gap-4 px-12 py-5 bg-slate-950 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-2xl active:scale-95 disabled:bg-slate-300 border-none outline-none">
                    {submitting ? <Loader2 className="animate-spin" size={18} strokeWidth={3} /> : (<>Confirm Booking <Check size={18} strokeWidth={4} /> </>)}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📅 Reschedule Modal */}
      <AnimatePresence>
        {rescheduleData && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setRescheduleData(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="p-8 border-b border-slate-50 bg-amber-50/30">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-200">
                    <CalendarClock size={24} strokeWidth={3} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Change Appointment</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Select your new preferred time</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleReschedule} className="p-8 space-y-6">
                <div className="space-y-4 text-left">
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Pick a New Date</label>
                    <input 
                      required 
                      type="date" 
                      min={new Date().toISOString().split('T')[0]}
                      value={rescheduleData.date} 
                      onChange={e => setRescheduleData({...rescheduleData, date: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200/60 rounded-2xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-amber-400 transition-all" 
                    />
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Pick a New Slot</label>
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.map((slot, idx) => (
                        <button
                          key={idx}
                          type="button"
                          disabled={slot.isBooked}
                          onClick={() => setRescheduleData({ ...rescheduleData, time: slot.time })}
                          className={`px-3 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-2 ${
                            rescheduleData.time === slot.time
                              ? 'bg-amber-500 text-white border-amber-400 shadow-lg shadow-amber-200'
                              : slot.isBooked
                                ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300 hover:bg-amber-50 active:scale-95'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                    {availableSlots.length === 0 && (
                      <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest text-center py-2">No slots available on this day</p>
                    )}
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setRescheduleData(null)}
                    className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-400 text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all border-none outline-none"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="flex-[2] py-4 bg-slate-950 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-amber-500 transition-all shadow-xl active:scale-95 disabled:bg-slate-300 border-none outline-none"
                  >
                    {submitting ? <Loader2 className="animate-spin mx-auto text-white" size={18} strokeWidth={3} /> : 'Update Appointment'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MyAppointments
