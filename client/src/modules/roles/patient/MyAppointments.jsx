import { useState, useEffect } from 'react'
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
  Loader2
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ModernTable from './ModernTable'
import useAuth from '../../../hooks/useAuth'
import { getPatientByUserId } from '../../patients/patientApi'
import { getPatientAppointments, createAppointment, cancelAppointment } from '../../appointments/appointmentApi'
import { getAllDoctors } from '../../doctors/doctorApi'

const departments = ['All', 'Cardiology', 'Neurology', 'Orthopedics', 'Dermatology']

function MyAppointments() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [view, setView] = useState('list')
  const [appointments, setAppointments] = useState([])
  const [patientData, setPatientData] = useState(null)
  const [doctorList, setDoctorList] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('upcoming')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeMenu, setActiveMenu] = useState(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedDept, setSelectedDept] = useState('All')

  const filteredAppointments = appointments.filter(apt => {
    const matchesTab = activeTab === 'upcoming'
      ? ['Confirmed', 'Pending', 'Rescheduled'].includes(apt.status)
      : ['Completed', 'Cancelled', 'No-show'].includes(apt.status)
    const matchesSearch = apt.doctor.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDept = selectedDept === 'All' || apt.dept === selectedDept
    return matchesTab && matchesSearch && matchesDept
  })

  const [bookingForm, setBookingForm] = useState({
    doctorId: '',
    date: '',
    time: '',
    reason: '',
    type: 'In-Clinic'
  })

  const getTimeSlots = (shift) => {
    switch (shift) {
      case 'Morning': return ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30']
      case 'Afternoon': return ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30']
      case 'Night': return ['19:00', '19:30', '20:00', '20:30', '21:00', '21:30']
      case 'On Call': return ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00']
      default: return []
    }
  }

  const selectedDoctor = doctorList.find(d => d._id === bookingForm.doctorId)
  const availableSlots = selectedDoctor ? getTimeSlots(selectedDoctor.shift) : []

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
  }, [user.id])

  const handleCancelVisit = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await cancelAppointment(id)
        setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, status: 'Cancelled' } : apt))
        setActiveMenu(null)
        alert('Appointment cancelled successfully.')
      } catch (err) {
        alert(err.message || 'Failed to cancel appointment')
      }
    }
  }

  const handleBooking = async (e) => {
    e.preventDefault()
    if (!bookingForm.doctorId || !bookingForm.date) {
      alert('Please fill in required fields')
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
      alert('Appointment scheduled successfully!')
      setView('list')
      window.location.reload()
    } catch (err) {
      alert(err.message || 'Failed to book appointment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleViewDetails = (apt) => {
    alert(`Appointment Details:\nDoctor: ${apt.doctor}\nDept: ${apt.dept}\nDate: ${apt.date}\nTime: ${apt.time}\nLocation: ${apt.location}`)
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

  const tableHeaders = ['Doctor / Specialist', 'Dept', 'Date & Time', 'Status', 'Actions']

  const renderAptRow = (apt) => (
    <tr key={apt.id} className="group hover:bg-slate-50/50 transition-all">
      <td className="px-6 py-4 border-none text-left">
        <div className="flex items-center gap-4">
          <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs border border-slate-200 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-400 transition-all shrink-0">
            {apt.doctor.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-black text-slate-900 leading-tight truncate max-w-[200px]">{apt.doctor}</h4>
            <div className="flex items-center gap-2 lg:hidden">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{apt.dept}</span>
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 hidden md:table-cell text-center">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">{apt.dept}</span>
      </td>
      <td className="px-6 py-4 text-center">
        <div className="flex flex-col items-center justify-center gap-1">
          <div className="text-[13px] font-black text-slate-700 leading-none">
            {new Date(apt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
            {apt.time}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-center">
        <StatusBadge status={apt.status} />
      </td>
      <td className="px-6 py-4 text-center">
        <div className="relative inline-block">
          <button onClick={() => setActiveMenu(activeMenu === apt.id ? null : apt.id)} className="p-2 rounded-xl transition-all text-slate-300 hover:text-slate-900 hover:bg-slate-100">
            <MoreVertical size={18} strokeWidth={3} />
          </button>
          <AnimatePresence>
            {activeMenu === apt.id && (
              <motion.div initial={{ opacity: 0, scale: 0.95, x: 10 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95, x: 10 }} className="absolute right-full top-0 mr-3 w-40 bg-white rounded-2xl border border-slate-100 shadow-2xl z-[1000] py-2 origin-right">
                <button onClick={() => handleViewDetails(apt)} className="w-full px-5 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-emerald-500 transition-all flex items-center gap-3"><Info size={14} strokeWidth={3} /> Details</button>
                {(apt.status === 'Confirmed' || apt.status === 'Pending') && (
                  <button onClick={() => handleCancelVisit(apt.id)} className="w-full px-5 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 transition-all flex items-center gap-3 border-t border-slate-50"><XCircle size={14} strokeWidth={3} /> Cancel</button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </td>
    </tr>
  )

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-700 w-full px-2 sm:px-4 max-w-[100vw] overflow-x-hidden">

      {/* 🏙️ Hero Selection Area */}
      <div className="bg-slate-900 px-8 py-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2 leading-none">Management Center</p>
            <h1 className="text-3xl sm:text-4xl font-black text-white leading-none tracking-tight">Visit Schedule</h1>
            <p className="text-slate-400 text-xs font-bold mt-4 opacity-80">Oversee and coordinate your clinical consultations.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setView(view === 'list' ? 'book' : 'list')} className={`flex items-center gap-3 px-8 py-4 ${view === 'list' ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-white/10 hover:bg-white/20'} text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-2xl active:scale-95 border-none`}>
              {view === 'list' ? <Plus size={16} strokeWidth={4} /> : <ArrowLeft size={16} strokeWidth={4} />}
              {view === 'list' ? 'Book New Visit' : 'Back to Records'}
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-emerald-500/20 transition-all duration-700" />
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
                    <select required value={bookingForm.doctorId} onChange={e => { const dId = e.target.value; const doc = doctorList.find(d => d._id === dId); const slots = doc ? getTimeSlots(doc.shift) : []; setBookingForm({ ...bookingForm, doctorId: dId, time: slots[0] || '' }); }} className="w-full px-5 py-4 bg-slate-50 border border-slate-200/60 rounded-xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-emerald-400 transition-all cursor-pointer">
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-left block">Date</label>
                      <input required type="date" value={bookingForm.date} min={new Date().toISOString().split('T')[0]} onChange={e => setBookingForm({ ...bookingForm, date: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200/60 rounded-xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-emerald-400 transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-left block">Slot</label>
                      <select required value={bookingForm.time} disabled={!bookingForm.doctorId} onChange={e => setBookingForm({ ...bookingForm, time: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200/60 rounded-xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-emerald-400 transition-all disabled:opacity-40">
                        {availableSlots.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
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
    </div>
  )
}

export default MyAppointments
