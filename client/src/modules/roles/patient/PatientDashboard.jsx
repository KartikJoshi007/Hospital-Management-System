import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Activity,
  TrendingUp,
  User,
  ShieldCheck,
  Calendar,
  Clock,
  ChevronRight,
  FileText
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
    <div className="space-y-10 pb-10 animate-in fade-in duration-500">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Hello, {user?.name || 'Patient'}</h1>
          <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Your personal health summary & clinical records</p>
        </div>

        <Link
          to="/patient/appointments"
          className="flex items-center gap-3 px-8 py-3.5 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-200 active:scale-95"
        >
          <Plus size={18} strokeWidth={3} />
          Book Appointment
        </Link>
      </div>

      {/* Snapshot Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {medicalSnapshot.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4 group hover:shadow-md transition-all cursor-default"
          >
            <div className={`p-3 rounded-2xl bg-slate-50 text-slate-600 w-fit group-hover:bg-emerald-500 group-hover:text-white transition-colors`}>
              <item.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{item.label}</p>
              <p className="text-2xl font-black text-slate-900 leading-none">{item.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Upcoming Appointments */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 border-l-4 border-emerald-500 pl-4 uppercase tracking-widest leading-none">Upcoming Visits</h3>
              <p className="text-[10px] font-bold text-slate-400 pl-5 mt-1.5">Your next clinical consultations</p>
            </div>
            <Link to="/patient/appointments" className="text-[10px] font-black text-emerald-600 hover:underline uppercase tracking-widest">
              View Schedule →
            </Link>
          </div>

          <div className="p-4 flex-1">
            <div className="space-y-2">
              {upcomingAppointments.map((apt) => (
                <div key={apt.id} className="p-5 rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-between group border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-5">
                    <div className="h-12 w-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-black text-xs group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-400 transition-all">
                      {apt.doctor.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">{apt.doctor}</h4>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight mt-0.5">{apt.dept} • {apt.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-slate-900 mb-1">{apt.date}</p>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${STATUS_COLORS[apt.status]}`}>
                      {apt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Health Timeline */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col overflow-hidden">
          <div className="p-8 border-b border-slate-50">
            <h3 className="text-sm font-black text-slate-900 border-l-4 border-emerald-500 pl-4 uppercase tracking-widest leading-none">Health Timeline</h3>
            <p className="text-[10px] font-bold text-slate-400 pl-5 mt-1.5">Latest clinical outcomes</p>
          </div>

          <div className="p-8 space-y-8 flex-1">
            {recentHistory.map((history, idx) => (
              <div key={history.id} className="relative flex gap-6">
                {idx !== recentHistory.length - 1 && (
                  <div className="absolute left-[11px] top-8 bottom-[-32px] w-[2px] bg-slate-50" />
                )}
                <div className="h-6 w-6 rounded-full bg-emerald-50 border-4 border-white shadow-sm ring-1 ring-emerald-100 shrink-0 relative z-10" />
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4">
                    <h4 className="text-sm font-black text-slate-900 truncate">{history.diagnosis}</h4>
                    <span className="text-[10px] font-black text-slate-400 whitespace-nowrap uppercase">{history.date}</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">With {history.doctor}</p>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                    <p className="text-[10px] font-bold text-slate-600 leading-relaxed italic line-clamp-2">
                      Prescribed: {history.treatment}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-8 mt-auto pt-0">
            <Link to="/patient/records" className="w-full flex items-center justify-center gap-3 py-3 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
              Health Archive
              <ArrowRight size={14} strokeWidth={3} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}

export default PatientDashboard
