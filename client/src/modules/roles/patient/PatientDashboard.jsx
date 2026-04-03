import { motion } from 'framer-motion'
import {
  ArrowRight,
  Plus,
  Activity,
  TrendingUp,
  User,
  ShieldCheck,
  Calendar,
  Clock,
  ChevronRight,
  FileText,
  Stethoscope,
  ArrowUpRight
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../../../hooks/useAuth'

const upcomingAppointments = [
  { id: 1, doctor: 'Dr. Aryan Mehta', dept: 'Cardiology', date: 'Oct 24, 2023', time: '10:30 AM', status: 'Confirmed' },
  { id: 2, doctor: 'Dr. Sneha Verma', dept: 'Neurology', date: 'Oct 28, 2023', time: '02:15 PM', status: 'Pending' },
]

const recentHistory = [
  { id: 1, doctor: 'Dr. Rahul Patil', dept: 'Orthopedics', date: 'Oct 12, 2023', diagnosis: 'Muscle Strain', treatment: 'Physiotherapy' },
  { id: 2, doctor: 'Dr. Nisha Iyer', dept: 'Dermatology', date: 'Sep 28, 2023', diagnosis: 'Skin Allergy', treatment: 'Antihistamines' },
]

const medicalSnapshot = [
  { label: 'Blood Group', value: 'O+', icon: Activity, color: 'emerald' },
  { label: 'Height', value: '175 cm', icon: User, color: 'blue' },
  { label: 'Weight', value: '72 kg', icon: TrendingUp, color: 'orange' },
  { label: 'Last Sync', value: '12 Days Ago', icon: ShieldCheck, color: 'purple' },
]

const STATUS_COLORS = {
  Confirmed: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  Pending: 'bg-amber-50 text-amber-600 border-amber-100',
}

function PatientDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div className="space-y-10 pb-10 animate-in fade-in duration-500 px-2 sm:px-4 max-w-[100vw] overflow-x-hidden">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 overflow-hidden">
        <div className="min-w-0">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight truncate leading-tight">Hello, {user?.name || 'Patient'}</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-3 pl-1 line-clamp-1 sm:line-clamp-none">Your health summary & clinical records</p>
        </div>

        <Link
          to="/patient/appointments"
          className="flex items-center justify-center gap-3 px-10 py-4 bg-emerald-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-200 active:scale-95 shrink-0"
        >
          <Plus size={20} strokeWidth={3} />
          Book Visit
        </Link>
      </div>

      {/* Snapshot Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {medicalSnapshot.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center gap-5 group hover:shadow-md transition-all cursor-default min-h-[90px]"
          >
            <div className={`p-4 rounded-2xl transition-all shadow-sm shrink-0 ${
              item.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white' :
              item.color === 'blue' ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-500 group-hover:text-white' :
              item.color === 'orange' ? 'bg-orange-50 text-orange-600 group-hover:bg-orange-500 group-hover:text-white' :
              'bg-purple-50 text-purple-600 group-hover:bg-purple-500 group-hover:text-white'
            }`}>
              <item.icon size={20} strokeWidth={3} />
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-normal mb-1">{item.label}</p>
              <p className="text-lg font-black text-slate-900 leading-tight tracking-tight">{item.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Upcoming Appointments */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900 border-l-4 border-emerald-500 pl-4 uppercase tracking-widest leading-none">Upcoming Visits</h3>
              <p className="text-xs font-bold text-slate-400 pl-5 mt-2">Active clinical consultations</p>
            </div>
            <Link to="/patient/appointments" className="text-xs font-black text-emerald-600 hover:text-emerald-700 transition-colors uppercase tracking-widest flex items-center gap-2">
              All Appointments <ArrowUpRight size={16} strokeWidth={3} />
            </Link>
          </div>

          <div className="p-6 flex-1">
            <div className="space-y-4">
              {upcomingAppointments.map((apt) => (
                <div key={apt.id} className="p-6 rounded-[1.5rem] bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col sm:flex-row items-center justify-between gap-6 group border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-6 w-full sm:w-auto">
                    <div className="h-14 w-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 font-black text-sm group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-400 transition-all shrink-0 shadow-sm">
                      {apt.doctor.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-base font-black text-slate-900 leading-tight truncate">{apt.doctor}</h4>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1.5">{apt.dept} • {apt.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-10">
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900 mb-1">{apt.date}</p>
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${STATUS_COLORS[apt.status]}`}>
                        {apt.status}
                      </span>
                    </div>
                    <ChevronRight size={20} strokeWidth={3} className="text-slate-200 group-hover:text-slate-900 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Health Timeline */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col overflow-hidden">
          <div className="p-8 border-b border-slate-50 bg-slate-50/30">
            <h3 className="text-base font-black text-slate-900 border-l-4 border-emerald-500 pl-4 uppercase tracking-widest leading-none">Diagnostic Log</h3>
            <p className="text-xs font-bold text-slate-400 pl-5 mt-2">Latest clinical outcomes</p>
          </div>

          <div className="p-8 space-y-10 flex-1">
            {recentHistory.map((history, idx) => (
              <div key={history.id} className="relative flex gap-6">
                {idx !== recentHistory.length - 1 && (
                  <div className="absolute left-[11px] top-8 bottom-[-40px] w-[2.5px] bg-slate-100 rounded-full" />
                )}
                <div className="h-6 w-6 rounded-full bg-emerald-500 border-4 border-white shadow-xl ring-2 ring-emerald-50 shrink-0 relative z-10" />
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex flex-col gap-1">
                    <h4 className="text-base font-black text-slate-900 truncate leading-tight">{history.diagnosis}</h4>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{history.date}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Attended by {history.doctor}</p>
                  <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100/50">
                    <p className="text-xs font-bold text-slate-600 leading-relaxed italic">
                      {history.treatment}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-8 mt-auto pt-0">
            <Link to="/patient/records" className="w-full flex items-center justify-center gap-4 py-4 bg-slate-950 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-2xl">
              Launch Records
              <ArrowRight size={18} strokeWidth={3} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}

export default PatientDashboard
