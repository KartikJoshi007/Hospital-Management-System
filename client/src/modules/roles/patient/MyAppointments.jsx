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
  HelpCircle,
  PlusCircle,
  Stethoscope,
  Info,
  ArrowLeft
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const initialAppointments = [
  {
    id: 1,
    doctor: 'Dr. Aryan Mehta',
    dept: 'Cardiology',
    date: 'Oct 24, 2023',
    time: '10:30 AM',
    status: 'Confirmed',
    type: 'In-Clinic',
    location: 'Tower A - Room 302'
  },
  {
    id: 2,
    doctor: 'Dr. Sneha Verma',
    dept: 'Neurology',
    date: 'Oct 28, 2023',
    time: '02:15 PM',
    status: 'Pending',
    type: 'Tele-Consult',
    location: 'Video MeetingLink'
  },
  {
    id: 3,
    doctor: 'Dr. Rahul Patil',
    dept: 'Orthopedics',
    date: 'Oct 12, 2023',
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
  const [view, setView] = useState('list') // 'list' or 'book'
  const [appointments, setAppointments] = useState(initialAppointments)
  const [activeTab, setActiveTab] = useState('current')

  const filteredAppointments = activeTab === 'current'
    ? appointments.filter(a => a.status !== 'Completed' && a.status !== 'Cancelled')
    : appointments.filter(a => a.status === 'Completed' || a.status === 'Cancelled')

  const StatusBadge = ({ status }) => {
    const styles = {
      'Confirmed': 'bg-emerald-50 text-emerald-600 border-emerald-100',
      'Pending': 'bg-orange-50 text-orange-600 border-orange-100',
      'Completed': 'bg-blue-50 text-blue-600 border-blue-100',
      'Cancelled': 'bg-rose-50 text-rose-600 border-rose-100',
    }
    return (
      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status]}`}>
        {status}
      </span>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-emerald-500 transition-colors uppercase tracking-widest mb-2 group w-fit"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Go Back
          </button>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 italic">My Appointments</h1>
          <p className="text-slate-500 font-bold text-sm tracking-wide">Manage and book your clinic visits.</p>
        </div>
        <div className="flex p-1 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <button
            onClick={() => setView('list')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'list' ? 'bg-[#0F172A] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            All Lists
          </button>
          <button
            onClick={() => setView('book')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'book' ? 'bg-[#0F172A] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Book New
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {/* Filter Tabs */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex gap-8">
                <button
                  onClick={() => setActiveTab('current')}
                  className={`pb-4 -mb-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'current' ? 'text-[#0F172A]' : 'text-slate-400'}`}
                >
                  Current Appointments
                  {activeTab === 'current' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-t-full" />}
                </button>
                <button
                  onClick={() => setActiveTab('past')}
                  className={`pb-4 -mb-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'past' ? 'text-[#0F172A]' : 'text-slate-400'}`}
                >
                  Past Visits
                  {activeTab === 'past' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-t-full" />}
                </button>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-500 hover:bg-slate-50">
                <Filter size={14} />
                Advanced Filter
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((apt) => (
                  <div key={apt.id} className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-black group-hover:bg-emerald-500 group-hover:text-white transition-colors text-xl">
                          {apt.doctor.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="text-base font-black text-slate-900">{apt.doctor}</h4>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{apt.dept}</p>
                        </div>
                      </div>
                      <StatusBadge status={apt.status} />
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                        <Calendar size={14} className="text-emerald-500" />
                        <span className="text-[10px] font-black text-slate-900 uppercase">{apt.date}</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                        <Clock size={14} className="text-emerald-500" />
                        <span className="text-[10px] font-black text-slate-900 uppercase">{apt.time}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 bg-slate-50/30">
                      <div className="flex items-center gap-3">
                        {apt.type === 'Tele-Consult' ? <Video size={16} className="text-rose-500" /> : <MapPin size={16} className="text-blue-500" />}
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-slate-400 uppercase">{apt.type}</span>
                          <span className="text-xs font-bold text-slate-700">{apt.location}</span>
                        </div>
                      </div>
                      <button className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-emerald-500 hover:border-emerald-200 hover:bg-emerald-50 transition-all">
                        <HelpCircle size={18} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-20 text-center space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                    <Calendar size={32} />
                  </div>
                  <p className="text-slate-400 font-bold text-sm tracking-tight">No consultations found in this category.</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="book"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Appointment Form */}
            <div className="lg:col-span-8 space-y-6">
              <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-8">
                <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
                  <div className="h-12 w-12 rounded-2xl bg-[#0F172A] flex items-center justify-center text-emerald-400 shadow-xl">
                    <Stethoscope size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Request Appointment</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select your preferred slot</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Doctor</label>
                    <select className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-bold text-slate-900 appearance-none bg-white">
                      <option disabled selected>Pick a specialist</option>
                      {doctors.map(d => <option key={d.name}>{d.name} ({d.dept})</option>)}
                    </select>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Date</label>
                        <input type="date" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-bold text-slate-900" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Preferred Time</label>
                        <select className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-bold text-slate-900 appearance-none bg-white">
                          <option>10:00 AM</option>
                          <option>11:30 AM</option>
                          <option>02:15 PM</option>
                          <option>04:00 PM</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason for consultation</label>
                    <textarea
                      rows={6}
                      placeholder="Describe your symptoms or reason for visit..."
                      className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-bold text-slate-900 min-h-[160px]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                  <Info size={20} className="text-emerald-600 shrink-0" />
                  <p className="text-xs font-bold text-emerald-700">A verification call will be made within 15 minutes to confirm this request.</p>
                </div>

                <div className="flex justify-end pt-4">
                  <button className="flex items-center gap-2 px-10 py-5 bg-[#0F172A] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-500 transition-all shadow-2xl shadow-slate-900/20 active:scale-95">
                    Transmit Request
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Price Preview / Dr. Profile */}
            <div className="lg:col-span-4 space-y-6">
              <div className="p-8 rounded-3xl bg-[#F8FAFC] border border-slate-100 shadow-sm">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Request Summary</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-400 uppercase text-[10px]">Consultation Fee</span>
                    <span className="font-black text-slate-900 tracking-tight">₹800.00</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-400 uppercase text-[10px]">Booking Charges</span>
                    <span className="font-black text-slate-900 tracking-tight">₹49.00</span>
                  </div>
                  <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                    <span className="font-black text-[#0F172A] uppercase text-[12px] tracking-widest">Grand Total</span>
                    <span className="text-2xl font-black text-emerald-500 tracking-tight">₹849.00</span>
                  </div>
                </div>
                <div className="mt-8 p-4 rounded-xl border border-dashed border-slate-300 flex items-center justify-between group cursor-pointer hover:border-emerald-500 transition-colors">
                  <span className="text-[10px] font-black text-slate-400 group-hover:text-emerald-600 tracking-widest uppercase">Promo Code?</span>
                  <PlusCircle size={16} className="text-slate-300 group-hover:text-emerald-500" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MyAppointments
