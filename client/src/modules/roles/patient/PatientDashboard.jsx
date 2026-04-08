import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  ArrowUpRight,
  Loader2,
  Lock,
  Heart
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../../../hooks/useAuth'
import { getPatientByUserId, updatePatient } from '../../patients/patientApi'
import { getPatientAppointments } from '../../appointments/appointmentApi'
import { GENDERS, BLOOD_GROUPS } from '../../../utils/constants'

const STATUS_COLORS = {
  Confirmed: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  Pending: 'bg-amber-50 text-amber-600 border-amber-100',
  Completed: 'bg-blue-50 text-blue-600 border-blue-100',
  Cancelled: 'bg-rose-50 text-rose-600 border-rose-100',
  'No-show': 'bg-rose-50 text-rose-700 border-rose-200',
  Rescheduled: 'bg-amber-100 text-amber-700 border-amber-200',
}

function PatientDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [patientData, setPatientData] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  // Onboarding State
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [submittingOnboarding, setSubmittingOnboarding] = useState(false)
  const [onboardingForm, setOnboardingForm] = useState({
    age: '',
    gender: 'Male',
    height: '',
    weight: '',
    bloodGroup: 'O+',
    address: '',
    medicalHistory: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const pRes = await getPatientByUserId(user.id)
        const p = pRes.data
        setPatientData(p)

        // Strictly trigger onboarding if vital stats are missing/disabled
        if (p && (!p.vitals || p.vitals.height === 0 || p.vitals.weight === 0 || p.age === 0 || p.address === 'Not Provided')) {
          setShowOnboarding(true)
          setOnboardingForm({
            age: p.age || '',
            gender: (p.gender || 'Male').charAt(0).toUpperCase() + (p.gender || 'Male').slice(1).toLowerCase(),
            height: p.vitals?.height || '',
            weight: p.vitals?.weight || '',
            bloodGroup: p.bloodGroup || 'O+',
            address: p.address && p.address !== "Not Provided" ? p.address : '',
            medicalHistory: p.medicalHistory && p.medicalHistory !== "No known conditions" ? p.medicalHistory : ''
          })
        }

        if (p?._id) {
          const aRes = await getPatientAppointments(p._id, 1, 5) // Get more for dashboard
          setAppointments((aRes.data.appointments || aRes.data || []).slice(0, 3))
        }
      } catch (err) {
        console.error('Dashboard data fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    if (user?.id) fetchData()
  }, [user.id])

  const handleOnboardingSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmittingOnboarding(true)
      const payload = {
        ...onboardingForm,
        height: Number(onboardingForm.height),
        weight: Number(onboardingForm.weight)
      }
      await updatePatient(patientData._id, payload)
      const pRes = await getPatientByUserId(user.id)
      setPatientData(pRes.data)
      setShowOnboarding(false)
    } catch (err) {
      console.error('Onboarding update failed:', err)
      alert('Failed to update profile. Please try again.')
    } finally {
      setSubmittingOnboarding(false)
    }
  }

  const stats = [
    { label: 'Blood Group', value: patientData?.bloodGroup || 'O+', icon: Heart, color: 'rose' },
    { label: 'Height', value: patientData?.vitals?.height ? `${patientData.vitals.height} cm` : 'N/A', icon: TrendingUp, color: 'emerald' },
    { label: 'Weight', value: patientData?.vitals?.weight ? `${patientData.vitals.weight} kg` : 'N/A', icon: Activity, color: 'blue' },
    { label: 'Age', value: patientData?.age ? `${patientData.age} Yrs` : 'N/A', icon: User, color: 'orange' },
  ]

  const completeness = (() => {
    if (!patientData) return 0;
    let score = 0;
    const fields = [
      patientData.vitals?.height,
      patientData.vitals?.weight,
      patientData.bloodGroup,
      patientData.age,
      patientData.address,
    ]
    fields.forEach(f => { if (f && f !== 0 && f !== 'Not Provided') score += 20 });
    return score;
  })();

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" strokeWidth={3} />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Initializing Portal...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-700 px-2 sm:px-4 max-w-[100vw] overflow-x-hidden">
      
      {/* 🚀 Header & Welcome Bar */}
      <div className="bg-slate-900 px-6 sm:px-10 py-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Welcome Back</p>
            <h1 className="text-3xl sm:text-4xl font-black text-white leading-none tracking-tight">
              Hello, {user?.fullName?.split(' ')[0] || user?.name?.split(' ')[0] || 'Patient'}
            </h1>
            <p className="text-slate-400 text-xs font-bold mt-2 opacity-80">Track your clinical health and manage medical schedules.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
               onClick={() => navigate('/patient/profile')}
               className="p-3 bg-white/10 hover:bg-emerald-500 text-white rounded-2xl transition-all active:scale-95 border border-white/5 shadow-xl flex items-center justify-center group/profile"
            >
              <User size={20} strokeWidth={3} className="text-white group-hover/profile:text-white" />
            </button>
            <button
               onClick={() => navigate('/patient/appointments')}
               className="flex items-center gap-3 px-8 py-3.5 bg-emerald-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-2xl active:scale-95 border-none"
            >
              <Plus size={16} strokeWidth={4} />
              Book New Visit
            </button>
          </div>
        </div>
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-emerald-500/20 transition-all duration-700" />
      </div>

      {/* 📊 Vital Stats Ribbon - Compact & Integrated */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden px-4 py-4 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-y-6">
          {stats.map((s, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`flex items-center gap-4 flex-1 min-w-[120px] justify-center sm:justify-start ${idx !== stats.length - 1 ? 'sm:border-r border-slate-100' : ''}`}
            >
              <div className="p-2.5 rounded-xl bg-slate-50 text-emerald-500 group transition-all group-hover:scale-110 shrink-0">
                <s.icon size={16} strokeWidth={3} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{s.label}</p>
                <h3 className="text-sm sm:text-base font-black text-slate-900 leading-none tracking-tight">{s.value}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 📅 Active Consultation - 2 Cols */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
          <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-l-4 border-emerald-500 pl-4">Active Sessions</h3>
            <Link to="/patient/appointments" className="text-[10px] font-black text-slate-400 hover:text-emerald-500 transition-colors flex items-center gap-2 uppercase tracking-widest">
              View All <ArrowUpRight size={14} strokeWidth={3} />
            </Link>
          </div>
          <div className="p-6 space-y-3 flex-1 overflow-y-auto max-h-[450px]">
             {appointments.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                  <Calendar size={48} strokeWidth={1} className="mb-4 opacity-30" />
                  <p className="text-xs font-black uppercase tracking-widest text-center">No Visiting Slots Booked</p>
               </div>
             ) : (
                appointments.map((a, i) => (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }} key={a._id} className="flex flex-col sm:flex-row justify-between items-center p-5 rounded-2xl bg-slate-50 border border-slate-100/50 hover:bg-white hover:border-emerald-100 transition-all group gap-4 relative overflow-hidden">
                    <div className="flex items-center gap-5 w-full sm:w-auto z-10">
                      <div className="h-12 w-12 rounded-xl bg-white text-slate-600 flex items-center justify-center text-xs font-black group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm border border-slate-100 group-hover:border-emerald-400 shrink-0">
                        {a.doctor?.split(' ').map(n => n[0]).join('') || "DR"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-900 truncate leading-tight">{a.doctor}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                           <Clock size={12} strokeWidth={3} className="text-slate-300" />
                           {a.dept} • {a.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end z-10">
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-900 mb-1">{new Date(a.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        <span className={`text-[9px] px-3 py-1 font-black uppercase tracking-widest rounded-full border ${STATUS_COLORS[a.status?.charAt(0).toUpperCase() + a.status?.slice(1)] || STATUS_COLORS['Pending']}`}>
                           {a.status}
                        </span>
                      </div>
                      <Link to="/patient/appointments" className="p-2 sm:p-3 rounded-xl bg-white border border-slate-100 text-slate-300 group-hover:text-emerald-500 group-hover:border-emerald-200 transition-all shadow-sm">
                        <ChevronRight size={18} strokeWidth={3} />
                      </Link>
                    </div>
                    <div className="absolute top-0 right-0 h-full w-1/4 bg-gradient-to-l from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-all pointer-events-none" />
                  </motion.div>
                ))
             )}
          </div>
          <div className="px-8 py-6 border-t border-slate-50 bg-slate-50/10">
            <p className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest">Always carry your health card for clinical visits.</p>
          </div>
        </div>

        {/* ⚕️ Health Summary - Sidebar Style */}
        <div className="flex flex-col gap-8 h-full">
          
          {/* Completeness Card */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm flex flex-col gap-6 relative overflow-hidden border-t-4 border-emerald-500">
            <div className="flex items-center justify-between relative z-10">
               <div>
                 <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Portal Status</h4>
                 <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Records Completion</p>
               </div>
               <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 font-black text-xs shadow-inner border border-emerald-100">
                 {completeness}%
               </div>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden relative z-10">
               <motion.div initial={{ width: 0 }} animate={{ width: `${completeness}%` }} className="h-full bg-emerald-500 rounded-full shadow-lg" transition={{ duration: 1, ease: 'easeOut' }} />
            </div>
            {completeness < 100 && (
               <button onClick={() => navigate('/patient/profile')} className="w-full py-4 px-6 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl active:scale-95 relative z-10 border-none">
                 Complete Records Now
               </button>
            )}
            <div className="absolute -bottom-10 -right-10 opacity-5 rotate-12 transition-transform group-hover:rotate-0 duration-700">
               <ShieldCheck size={160} strokeWidth={4} />
            </div>
          </div>

          {/* Quick List - Medical History */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col flex-1 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/10 flex items-center gap-3">
               <div className="p-2 rounded-lg bg-emerald-500 text-white shrink-0 shadow-sm"><FileText size={16} strokeWidth={3} /></div>
               <div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Medical History</h4>
                  <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">Recent Clinical Summary</p>
               </div>
            </div>
            <div className="p-8 space-y-6 flex-1 overflow-y-auto max-h-[300px]">
               {!patientData?.medicalHistory || patientData.medicalHistory === "No known conditions" || (Array.isArray(patientData.medicalHistory) && patientData.medicalHistory.length === 0) ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-4 opacity-50">
                    <Activity size={32} strokeWidth={2} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-center">No Health Records Logged</p>
                  </div>
               ) : (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center shrink-0">
                      <div className="h-4 w-4 rounded-full bg-emerald-500 border-4 border-white shadow-xl ring-2 ring-emerald-50" />
                      <div className="w-[2px] h-full bg-slate-100 rounded-full mt-2" />
                    </div>
                    <div className="space-y-2 pb-4 flex-1">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Summary</p>
                      <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100/50">
                         <p className="text-[11px] font-semibold text-slate-600 leading-relaxed italic line-clamp-4">
                            {Array.isArray(patientData.medicalHistory) ? patientData.medicalHistory[0] : patientData.medicalHistory}
                         </p>
                      </div>
                    </div>
                  </div>
               )}
            </div>
            <div className="p-6 mt-auto">
               <Link to="/patient/records" className="w-full flex items-center justify-center gap-3 py-4 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-2xl active:scale-95 group">
                 Launch clinic records
                 <ArrowUpRight size={14} strokeWidth={4} className="group-hover:rotate-45 transition-transform" />
               </Link>
            </div>
          </div>
        </div>

      </div>

      {/* 🔐 Security Badge Bar */}
      <div className="bg-slate-50 border border-slate-200 px-8 py-5 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-4">
         <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm"><Lock size={16} className="text-slate-400" strokeWidth={3} /></div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] text-center md:text-left">Your health data is protected by hospital-grade encryption standards.</p>
         </div>
         <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest shadow-lg shadow-emerald-500/20">Active Secured Connection</span>
         </div>
      </div>

      {/* 📝 Onboarding Modal - Compact & Modern */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 30 }} className="bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] w-full max-w-lg overflow-hidden border border-slate-200">
              <div className="bg-emerald-500 px-8 py-8 text-white relative">
                 <h2 className="text-2xl font-black uppercase tracking-tight leading-tight">Complete Profile</h2>
                 <p className="text-emerald-100 font-bold text-[10px] uppercase tracking-widest mt-1 opacity-80">Initialize clinical health records</p>
              </div>

              <form onSubmit={handleOnboardingSubmit} className="p-8 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Age</label>
                    <input required type="number" min="1" max="130" value={onboardingForm.age} onChange={e => setOnboardingForm({ ...onboardingForm, age: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender</label>
                    <select value={onboardingForm.gender} onChange={e => setOnboardingForm({ ...onboardingForm, gender: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-emerald-400 transition-all cursor-pointer">
                      {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Ht (cm)</label>
                    <input required type="number" min="30" max="300" value={onboardingForm.height} onChange={e => setOnboardingForm({ ...onboardingForm, height: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-emerald-400" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Wt (kg)</label>
                    <input required type="number" min="1" max="500" value={onboardingForm.weight} onChange={e => setOnboardingForm({ ...onboardingForm, weight: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-emerald-400" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Blood</label>
                    <select value={onboardingForm.bloodGroup} onChange={e => setOnboardingForm({ ...onboardingForm, bloodGroup: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-emerald-400 transition-all">
                      {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Primary Address</label>
                  <textarea required rows={2} value={onboardingForm.address} onChange={e => setOnboardingForm({ ...onboardingForm, address: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-emerald-400 resize-none transition-all" />
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <button type="submit" disabled={submittingOnboarding} className="w-full flex items-center justify-center gap-3 py-4 bg-slate-950 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl active:scale-[0.98] disabled:bg-slate-300 border-none">
                    {submittingOnboarding ? <Loader2 className="animate-spin" size={16} /> : ( <><ShieldCheck size={16} strokeWidth={3} /> Finalize Records</> )}
                  </button>
                  <button type="button" onClick={() => setShowOnboarding(false)} className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors bg-transparent border-none">Sync records later</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PatientDashboard
