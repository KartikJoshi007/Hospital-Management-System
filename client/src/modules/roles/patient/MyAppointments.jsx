import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  MapPin,
  Clock,
  Video,
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
  MoreVertical
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

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
  },
  {
    id: 2,
    doctor: 'Dr. Sneha Verma',
    dept: 'Neurology',
    date: '2023-10-28',
    time: '02:15 PM',
    status: 'Pending',
    type: 'Tele-Consult',
    location: 'Video Meeting Link'
  },
  {
    id: 3,
    doctor: 'Dr. Rahul Patil',
    dept: 'Orthopedics',
    date: '2023-10-12',
    time: '11:00 AM',
    status: 'Completed',
    type: 'In-Clinic',
    location: 'Tower B - Room 104'
  },
]

const doctors = [
  { name: 'Dr. Aryan Mehta', dept: 'Cardiology', rating: '4.8', charges: '₹800' },
  { name: 'Dr. Sneha Verma', dept: 'Neurology', rating: '4.9', charges: '₹1200' },
  { name: 'Dr. Rahul Patil', dept: 'Orthopedics', rating: '4.6', charges: '₹1000' },
  { name: 'Dr. Nisha Iyer', dept: 'Dermatology', rating: '4.7', charges: '₹900' },
]

function MyAppointments() {
  const navigate = useNavigate()
  const [view, setView] = useState('list')
  const [appointments] = useState(initialAppointments)
  const [activeTab, setActiveTab] = useState('upcoming')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeMenu, setActiveMenu] = useState(null)

  const filteredAppointments = appointments.filter(apt => {
    const matchesTab = activeTab === 'upcoming'
      ? ['Confirmed', 'Pending'].includes(apt.status)
      : ['Completed', 'Cancelled'].includes(apt.status)
    const matchesSearch = apt.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.dept.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  const StatusBadge = ({ status }) => {
    const config = {
      'Confirmed': { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', icon: CheckCircle2 },
      'Pending': { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', icon: Clock3 },
      'Completed': { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', icon: CheckCircle2 },
      'Cancelled': { bg: 'bg-rose-50', text: 'text-rose-500', border: 'border-rose-100', icon: XCircle },
    }
    const { bg, text, border, icon: Icon } = config[status] || config['Pending']
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${bg} ${text} ${border}`}>
        <Icon size={10} strokeWidth={3} />
        {status}
      </span>
    )
  }

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-500 w-full px-4 text-slate-900">

      {/* Header Section */}
      <div className="p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 border-l-4 border-emerald-500 pl-4 uppercase leading-none">My Appointments</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 pl-5">Manage your healthcare schedule and consultation history</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={14} strokeWidth={3} />
          Back
        </button>
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
            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 p-5 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="flex p-1 bg-white rounded-xl border border-slate-100">
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'upcoming' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-700'}`}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => setActiveTab('past')}
                  className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'past' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-700'}`}
                >
                  Past Visits
                </button>
              </div>

              <div className="flex items-center gap-3 flex-1 md:max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} strokeWidth={3} />
                  <input
                    type="text"
                    placeholder="Search appointments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition-all text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none shadow-sm"
                  />
                </div>
                <button
                  onClick={() => setView('book')}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-100 active:scale-95"
                >
                  <Plus size={14} strokeWidth={3} />
                  Book New
                </button>
              </div>
            </div>

            {/* List Structure */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
              {filteredAppointments.length > 0 ? (
                <div className="divide-y divide-slate-50">
                  {filteredAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="p-6 hover:bg-slate-50/50 transition-all group flex flex-col md:flex-row md:items-center gap-6"
                    >
                      {/* Doctor Info */}
                      <div className="flex items-center gap-4 min-w-[240px]">
                        <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-sm border border-slate-200 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-400 transition-all shrink-0">
                          {apt.doctor.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 leading-tight">{apt.doctor}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{apt.dept}</p>
                        </div>
                      </div>

                      {/* Date & Time */}
                      <div className="grid grid-cols-2 gap-6 flex-1">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-white transition-colors">
                            <Calendar size={14} strokeWidth={3} />
                          </div>
                          <div>
                            <p className="text-[9px] uppercase tracking-widest font-black text-slate-400 leading-none mb-1.5">Consultation Date</p>
                            <p className="text-xs font-black text-slate-700">{new Date(apt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-white transition-colors">
                            <Clock size={14} strokeWidth={3} />
                          </div>
                          <div>
                            <p className="text-[9px] uppercase tracking-widest font-black text-slate-400 leading-none mb-1.5">Scheduled Time</p>
                            <p className="text-xs font-black text-slate-700">{apt.time}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0">
                        <StatusBadge status={apt.status} />
                        <div className="relative">
                          <button 
                            onClick={() => setActiveMenu(activeMenu === apt.id ? null : apt.id)}
                            className={`p-2 rounded-xl transition-all ${activeMenu === apt.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-300 hover:text-slate-900 hover:bg-slate-100'}`}
                          >
                            <MoreVertical size={16} strokeWidth={3} />
                          </button>

                          <AnimatePresence>
                            {activeMenu === apt.id && (
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className="absolute right-0 top-full mt-3 w-48 bg-white rounded-2xl border border-slate-100 shadow-2xl z-[100] py-2 overflow-hidden"
                              >
                                {apt.status === 'Confirmed' || apt.status === 'Pending' ? (
                                  <>
                                    <button className="w-full px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-emerald-500 transition-colors flex items-center gap-3">
                                      <Calendar size={14} /> Reschedule
                                    </button>
                                    <button className="w-full px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 transition-colors flex items-center gap-3">
                                      <XCircle size={14} /> Cancel Visit
                                    </button>
                                  </>
                                ) : null}
                                <button className="w-full px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center gap-3">
                                  <Plus size={14} /> Download Slip
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-24 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-slate-50 text-slate-200 mb-6 border border-slate-100">
                    <Calendar size={32} strokeWidth={1} />
                  </div>
                  <h3 className="text-slate-900 font-black text-sm uppercase tracking-widest">No entries found</h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">Try adjusting your filters</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="book"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full"
          >
            {/* Booking Form Card */}
            <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden w-full">
              <div className="p-8 border-b border-slate-50 flex items-center gap-4 bg-slate-50/50">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-xl shadow-emerald-100">
                  <Stethoscope size={20} strokeWidth={3} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none">Schedule Consultation</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Fill in the clinical details below</p>
                </div>
              </div>

              <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Specialist / Doctor</label>
                    <select className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 text-xs font-bold text-slate-900 transition-all appearance-none cursor-pointer outline-none shadow-sm">
                      <option disabled selected>Pick a specialist</option>
                      {doctors.map(d => <option key={d.name} value={d.name}>{d.name} • {d.dept}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                      <input type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 text-xs font-bold text-slate-900 transition-all outline-none shadow-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Time Slot</label>
                      <select className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 text-xs font-bold text-slate-900 transition-all appearance-none cursor-pointer outline-none shadow-sm">
                        <option>10:00 AM</option>
                        <option>11:30 AM</option>
                        <option>02:15 PM</option>
                        <option>04:00 PM</option>
                      </select>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Consultation Summary</label>
                    <textarea
                      rows={4}
                      placeholder="Briefly describe your symptoms or reason for the visit..."
                      className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 text-xs font-bold text-slate-900 transition-all resize-none outline-none shadow-sm placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Guidelines Section within the form card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4 p-5 rounded-2xl bg-blue-50/50 border border-blue-100">
                    <Info size={16} className="text-blue-500 mt-0.5 shrink-0" strokeWidth={3} />
                    <p className="text-[10px] font-bold text-blue-700 leading-relaxed uppercase tracking-widest leading-normal">
                      Verify insurance details before submission. Confirmation will be sent via SMS.
                    </p>
                  </div>
                  <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl">
                    <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-3 leading-none">Booking Guidelines</h5>
                    <div className="grid grid-cols-1 gap-2">
                      {['Arrive 15 mins early', 'Stable internet link', '2-hour cancel window'].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-[9px] text-slate-500 font-bold uppercase tracking-wide leading-none">
                          <div className="w-1 h-1 rounded-full bg-emerald-500" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
                <button onClick={() => setView('list')} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">Cancel</button>
                <button className="flex items-center gap-3 px-8 py-3.5 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl active:scale-95">
                  Confirm Schedule
                  <ChevronRight size={14} strokeWidth={3} />
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
