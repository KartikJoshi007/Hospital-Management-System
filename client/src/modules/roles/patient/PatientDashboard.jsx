import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  ArrowRight,
  Plus,
  Activity,
  TrendingUp,
  User,
  ShieldCheck
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../../../hooks/useAuth'
import HealthSummaryCard from '../../../components/patientcomponents/HealthSummaryCard'
import AppointmentCard from '../../../components/patientcomponents/AppointmentCard'
import MedicalHistoryItem from '../../../components/patientcomponents/MedicalHistoryItem'

const upcomingAppointments = [
  { id: 1, doctor: 'Dr. Aryan Mehta', dept: 'Cardiology', date: 'Oct 24, 2023', time: '10:30 AM', status: 'Confirmed' },
  { id: 2, doctor: 'Dr. Sneha Verma', dept: 'Neurology', date: 'Oct 28, 2023', time: '02:15 PM', status: 'Pending' },
]

const recentHistory = [
  { id: 1, doctor: 'Dr. Rahul Patil', dept: 'Orthopedics', date: 'Oct 12, 2023', diagnosis: 'Muscle Strain', treatment: 'Physiotherapy' },
  { id: 2, doctor: 'Dr. Nisha Iyer', dept: 'Dermatology', date: 'Sep 28, 2023', diagnosis: 'Skin Allergy', treatment: 'Antihistamines' },
]

const medicalSnapshot = [
  { label: 'Blood Group', value: 'O+', icon: Activity, color: 'rose' },
  { label: 'Height', value: '175 cm', icon: User, color: 'blue' },
  { label: 'Weight', value: '72 kg', icon: TrendingUp, color: 'emerald' },
  { label: 'Last Checkup', value: '12 Days Ago', icon: ShieldCheck, color: 'purple' },
]

function PatientDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-emerald-500 transition-colors uppercase tracking-widest mb-2 group w-fit"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Go Back
          </button>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 italic">Hello, {user?.name || 'Patient'}!</h1>
          <p className="text-slate-500 font-bold text-sm tracking-wide">We are here to help you get better. Here is your health update.</p>
        </div>
        <Link
          to="/patient/appointments"
          className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95 group"
        >
          <Plus size={16} />
          Book Appointment
        </Link>
      </div>

      {/* Snapshot Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {medicalSnapshot.map((item, idx) => (
          <HealthSummaryCard
            key={idx}
            {...item}
            delay={idx}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Appointments */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm flex flex-col"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-black text-slate-900 border-l-4 border-emerald-500 pl-4 uppercase tracking-widest leading-none">Upcoming Visits</h3>
              <p className="text-[10px] font-black text-slate-400 pl-5 mt-1">Don't forget your next appointment</p>
            </div>
            <Link to="/patient/appointments" className="text-[10px] font-black text-emerald-600 hover:underline uppercase tracking-widest">
              View All →
            </Link>
          </div>

          <div className="space-y-4">
            {upcomingAppointments.map((apt) => (
              <AppointmentCard key={apt.id} {...apt} />
            ))}
          </div>

          <button className="w-full mt-8 py-4 rounded-2xl bg-[#0F172A] text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg active:scale-95">
            Add to Calendar
          </button>
        </motion.div>

        {/* Medical History Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-black text-slate-900 border-l-4 border-emerald-500 pl-4 uppercase tracking-widest leading-none">Past Visits</h3>
              <p className="text-[10px] font-black text-slate-400 pl-5 mt-1">Details of your previous checkups</p>
            </div>
            <Link to="/patient/records" className="text-[10px] font-black text-emerald-600 hover:underline uppercase tracking-widest">
              Full History →
            </Link>
          </div>

          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-100"></div>
            <div className="space-y-8 relative">
              {recentHistory.map((history) => (
                <MedicalHistoryItem key={history.id} {...history} />
              ))}
            </div>
          </div>

          <Link to="/patient/records" className="w-full mt-8 py-4 rounded-2xl bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 transition-colors border border-slate-100 flex items-center justify-center gap-2 group">
            Download My Reports
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

export default PatientDashboard
