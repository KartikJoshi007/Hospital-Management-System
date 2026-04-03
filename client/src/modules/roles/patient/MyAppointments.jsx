import { useState } from 'react'
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
  Check
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ModernTable from './ModernTable'

const initialAppointments = [
  {
    id: 1,
    doctor: 'Dr. Aryan Mehta',
    dept: 'Cardiology',
    date: '2023-10-24',
    time: '10:30 AM',
    status: 'Confirmed',
    type: 'In-Clinic',
    location: 'Tower A - Room 302'
  }
]

const doctors = [
  { name: 'Dr. Aryan Mehta', dept: 'Cardiology', rating: '4.8' },
  { name: 'Dr. Sneha Verma', dept: 'Neurology', rating: '4.9' },
]

const departments = ['All', 'Cardiology', 'Neurology', 'Orthopedics', 'Dermatology']

function MyAppointments() {
  const navigate = useNavigate()
  const [view, setView] = useState('list')
  const [appointments, setAppointments] = useState(initialAppointments)
  const [activeTab, setActiveTab] = useState('upcoming')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeMenu, setActiveMenu] = useState(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedDept, setSelectedDept] = useState('All')

  const filteredAppointments = appointments.filter(apt => {
    const matchesTab = activeTab === 'upcoming'
      ? ['Confirmed', 'Pending'].includes(apt.status)
      : ['Completed', 'Cancelled'].includes(apt.status)
    const matchesSearch = apt.doctor.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDept = selectedDept === 'All' || apt.dept === selectedDept
    return matchesTab && matchesSearch && matchesDept
  })

  const handleCancelVisit = (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      setAppointments(prev => prev.map(apt => 
        apt.id === id ? { ...apt, status: 'Cancelled' } : apt
      ))
      setActiveMenu(null)
      alert('Appointment cancelled successfully.')
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
    }
    const { bg, text, border, icon: Icon } = config[status] || config['Pending']
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-widest border ${bg} ${text} ${border}`}>
        <Icon size={12} strokeWidth={3} />
        {status}
      </span>
    )
  }

  const tableHeaders = ['Doctor / Specialist', 'Dept', 'Date & Time', 'Status', 'Actions']

  const renderAptRow = (apt) => (
    <tr key={apt.id} className="group hover:bg-slate-50/50 transition-all">
      <td className="px-6 py-6 border-none">
        <div className="flex items-center gap-4 text-left">
          <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs border border-slate-200 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-400 transition-all shrink-0">
            {apt.doctor.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-black text-slate-900 leading-tight truncate max-w-[200px]">{apt.doctor}</h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 lg:hidden">{apt.dept}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-6 hidden md:table-cell text-center">
        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">{apt.dept}</span>
      </td>
      <td className="px-6 py-6 text-center">
        <div className="flex flex-col items-center justify-center gap-1.5">
          <div className="flex items-center justify-center gap-2 text-sm font-black text-slate-700">
            <Calendar size={16} className="text-slate-300" strokeWidth={3} />
            {new Date(apt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
            <Clock size={16} className="text-slate-300" strokeWidth={3} />
            {apt.time}
          </div>
        </div>
      </td>
      <td className="px-6 py-6 text-center">
        <div className="flex justify-center items-center">
          <StatusBadge status={apt.status} />
        </div>
      </td>
      <td className="px-6 py-6 text-center">
        <div className="relative inline-block">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === apt.id ? null : apt.id);
            }} 
            className="p-2.5 rounded-xl transition-all text-slate-300 hover:text-slate-900 hover:bg-slate-100"
          >
            <MoreVertical size={20} strokeWidth={3} />
          </button>
          <AnimatePresence>
            {activeMenu === apt.id && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, x: 10 }} 
                animate={{ opacity: 1, scale: 1, x: 0 }} 
                exit={{ opacity: 0, scale: 0.95, x: 10 }} 
                className="absolute right-full top-0 mr-3 w-48 bg-white rounded-2xl border border-slate-100 shadow-2xl z-[1000] py-2 origin-right"
              >
                 <button 
                  onClick={() => handleViewDetails(apt)}
                  className="w-full px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-emerald-500 transition-all flex items-center gap-3">
                    <Info size={14} strokeWidth={3} /> View Details
                 </button>
                 {(apt.status === 'Confirmed' || apt.status === 'Pending') ? (
                   <button 
                    onClick={() => handleCancelVisit(apt.id)}
                    className="w-full px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 transition-all flex items-center gap-3 border-t border-slate-50">
                      <XCircle size={14} strokeWidth={3} /> Cancel Visit
                   </button>
                 ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500 w-full px-2 sm:px-4 max-w-[100vw] overflow-x-hidden">

      {/* Header Section */}
      <div className="p-6 sm:p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 border-l-4 border-emerald-500 pl-4 uppercase leading-none truncate">My Appointments</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-3 pl-5 line-clamp-1 sm:line-clamp-none">Track and manage your visits</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button 
             onClick={() => setView('book')}
             className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl active:scale-95 shrink-0"
          >
            <Plus size={16} strokeWidth={3} />
            Book New
          </button>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors shrink-0"
          >
            <ArrowLeft size={16} strokeWidth={3} />
            Back
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Filters & Search - Improved text sizing */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50 p-4 sm:p-5 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="flex p-1 bg-white rounded-xl border border-slate-100 self-start lg:self-auto overflow-x-auto max-w-full">
                {['upcoming', 'past'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-8 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-700'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 flex-1 w-full lg:max-w-md">
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} strokeWidth={3} />
                  <input
                    type="text"
                    placeholder="Search appointments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition-all text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none shadow-sm min-w-0"
                  />
                </div>
                <div className="relative shrink-0">
                  <button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`p-3.5 rounded-xl transition-all shadow-sm border ${isFilterOpen ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-200 hover:text-slate-900'}`}>
                    {isFilterOpen ? <X size={20} strokeWidth={3} /> : <Filter size={20} strokeWidth={3} />}
                  </button>

                  <AnimatePresence>
                    {isFilterOpen && (
                      <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute right-0 top-full mt-3 w-60 bg-white rounded-[1.5rem] shadow-2xl border border-slate-100 py-4 z-[150]">
                        <div className="px-5 py-2 border-b border-slate-50 mb-3 text-left">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Filter By Dept</p>
                        </div>
                        <div className="space-y-1 px-2">
                          {departments.map((dept) => (
                            <button
                              key={dept}
                              onClick={() => {
                                setSelectedDept(dept)
                                setIsFilterOpen(false)
                              }}
                              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${selectedDept === dept ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                              {dept}
                              {selectedDept === dept && <Check size={14} strokeWidth={4} />}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Using the new ModernTable layout */}
            <div className="min-h-[400px]">
              <ModernTable 
                headers={tableHeaders} 
                data={filteredAppointments} 
                renderRow={renderAptRow} 
              />
            </div>
            
          </motion.div>
        ) : (
          <motion.div key="book" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full">
            <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden w-full">
               <div className="p-6 sm:p-8 border-b border-slate-50 flex items-center gap-4 bg-slate-50/50">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-xl shrink-0"><Stethoscope size={24} strokeWidth={3} /></div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none">Schedule Visit</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 pl-1">Clinical details for appointment</p>
                  </div>
               </div>
               <div className="p-6 sm:p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-3">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Specialist / Doctor</label>
                        <select className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-emerald-400 transition-all cursor-pointer">
                           <option disabled selected>Pick a specialist</option>
                           {doctors.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                        </select>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                           <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                           <input type="date" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 outline-none" />
                        </div>
                        <div className="space-y-3">
                           <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Time Slot</label>
                           <select className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 outline-none cursor-pointer"><option>10:00 AM</option></select>
                        </div>
                     </div>
                     <div className="md:col-span-2 space-y-3">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Consultation Summary</label>
                        <textarea rows={4} className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-sm font-bold text-slate-900 outline-none resize-none focus:bg-white transition-all shadow-sm" />
                     </div>
                  </div>
               </div>
               <div className="px-6 sm:px-8 py-8 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6">
                  <button onClick={() => setView('list')} className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900">Cancel</button>
                  <button className="w-full sm:w-auto flex items-center justify-center gap-4 px-10 py-5 bg-slate-950 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl">
                    Confirm Schedule 
                    <ChevronRight size={18} strokeWidth={3} />
                  </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MyAppointments
