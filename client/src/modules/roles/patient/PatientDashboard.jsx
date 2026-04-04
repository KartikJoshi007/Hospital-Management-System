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
  Loader2
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../../../hooks/useAuth'
import { getPatientByUserId, updatePatient } from '../../patients/patientApi'
import { getPatientAppointments } from '../../appointments/appointmentApi'

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
            gender: p.gender || 'Male',
            height: p.vitals?.height || '',
            weight: p.vitals?.weight || '',
            bloodGroup: p.bloodGroup || 'O+',
            address: p.address && p.address !== "Not Provided" ? p.address : '',
            medicalHistory: p.medicalHistory && p.medicalHistory !== "No known conditions" ? p.medicalHistory : ''
          })
        }

        if (p?._id) {
          const aRes = await getPatientAppointments(p._id, 1, 3)
          setAppointments(aRes.data.appointments || aRes.data || [])
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
    { label: 'Blood Group', value: patientData?.bloodGroup || 'O+', icon: Activity, color: 'emerald' },
    { label: 'Height', value: patientData?.vitals?.height ? `${patientData.vitals.height} cm` : 'N/A', icon: User, color: 'blue' },
    { label: 'Weight', value: patientData?.vitals?.weight ? `${patientData.vitals.weight} kg` : 'N/A', icon: TrendingUp, color: 'orange' },
    { label: 'Medical History', value: patientData?.medicalHistory && patientData.medicalHistory !== "No known conditions" ? patientData.medicalHistory : 'None', icon: ShieldCheck, color: 'purple' },
  ]

  return (
    <div className="space-y-10 pb-10 animate-in fade-in duration-500 px-2 sm:px-4 max-w-[100vw] overflow-x-hidden">
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin mr-2" size={24} />
          <span className="text-sm font-black uppercase tracking-widest">Loading dashboard...</span>
        </div>
      ) : (
        <>
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
            {stats.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center gap-5 group hover:shadow-md transition-all cursor-default min-h-[90px]"
              >
                <div className={`p-4 rounded-2xl transition-all shadow-sm shrink-0 ${item.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white' :
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
                  {appointments.length === 0 ? (
                    <div className="p-10 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No Scheduled Visits</div>
                  ) : appointments.map((apt) => (
                    <div key={apt._id} className="p-6 rounded-[1.5rem] bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col sm:flex-row items-center justify-between gap-6 group border border-transparent hover:border-slate-100">
                      <div className="flex items-center gap-6 w-full sm:w-auto">
                        <div className="h-14 w-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 font-black text-sm group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-400 transition-all shrink-0 shadow-sm">
                          {apt.doctor?.split(' ').map(n => n[0]).join('') || 'DR'}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-base font-black text-slate-900 leading-tight truncate">{apt.doctor || 'Unknown Doctor'}</h4>
                          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1.5">{apt.dept || 'General'} • {apt.time || 'TBD'}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-10">
                        <div className="text-right">
                          <p className="text-sm font-black text-slate-900 mb-1">{apt.date ? new Date(apt.date).toDateString() : 'Date TBD'}</p>
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${STATUS_COLORS[apt.status?.charAt(0).toUpperCase() + apt.status?.slice(1)] || STATUS_COLORS['Pending']}`}>
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

              <div className="p-8 space-y-10 flex-1 overflow-y-auto">
                {!patientData?.medicalHistory || (Array.isArray(patientData.medicalHistory) && patientData.medicalHistory.length === 0) ? (
                  <div className="text-center text-slate-400 font-bold uppercase tracking-widest text-xs py-10 opacity-60">No Diagnostics Logged</div>
                ) : (
                  (Array.isArray(patientData.medicalHistory) ? patientData.medicalHistory : [patientData.medicalHistory]).map((condition, idx) => (
                    <div key={idx} className="relative flex gap-6">
                      {(Array.isArray(patientData.medicalHistory) ? idx !== patientData.medicalHistory.length - 1 : false) && (
                        <div className="absolute left-[11px] top-8 bottom-[-40px] w-[2.5px] bg-slate-100 rounded-full" />
                      )}
                      <div className="h-6 w-6 rounded-full bg-emerald-500 border-4 border-white shadow-xl ring-2 ring-emerald-50 shrink-0 relative z-10" />
                      <div className="space-y-3 flex-1 min-w-0">
                        <div className="flex flex-col gap-1">
                          <h4 className="text-base font-black text-slate-900 truncate leading-tight">Clinical Summary</h4>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Diagnostic Record</span>
                        </div>
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100/50 mt-2">
                          <p className="text-xs font-bold text-slate-600 leading-relaxed italic">
                            {condition}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-8 mt-auto pt-0">
                <Link to="/patient/records" className="w-full flex items-center justify-center gap-4 py-4 bg-slate-950 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-2xl">
                  Launch Records
                  <ArrowRight size={18} strokeWidth={3} />
                </Link>
              </div>
            </div>

          </div>
        </>
      )}

      {/* Onboarding Modal */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden border border-slate-100"
            >
              <div className="bg-emerald-500 p-8 text-white relative">
                <div className="absolute top-0 right-0 p-10 opacity-10">
                  <Activity size={120} strokeWidth={4} />
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tight leading-tight">Complete Your Profile</h2>
                <p className="text-emerald-100 font-bold text-sm tracking-widest mt-2">Initialize your clinical records for better care</p>
              </div>

              <form onSubmit={handleOnboardingSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Age (Years)</label>
                    <input
                      required
                      type="number"
                      min="1"
                      max="130"
                      step="1"
                      placeholder="e.g. 25"
                      disabled={submittingOnboarding}
                      value={onboardingForm.age}
                      onChange={e => setOnboardingForm({ ...onboardingForm, age: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender</label>
                    <select
                      value={onboardingForm.gender}
                      disabled={submittingOnboarding}
                      onChange={e => setOnboardingForm({ ...onboardingForm, gender: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition-all cursor-pointer"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Blood Group</label>
                    <select
                      value={onboardingForm.bloodGroup}
                      disabled={submittingOnboarding}
                      onChange={e => setOnboardingForm({ ...onboardingForm, bloodGroup: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition-all cursor-pointer"
                    >
                      {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Height (cm)</label>
                    <input
                      required
                      type="number"
                      placeholder="e.g. 175"
                      disabled={submittingOnboarding}
                      value={onboardingForm.height}
                      onChange={e => setOnboardingForm({ ...onboardingForm, height: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Weight (kg)</label>
                    <input
                      required
                      type="number"
                      placeholder="e.g. 70"
                      disabled={submittingOnboarding}
                      value={onboardingForm.weight}
                      onChange={e => setOnboardingForm({ ...onboardingForm, weight: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Residential Address</label>
                  <textarea
                    required
                    placeholder="Provide your full primary address..."
                    disabled={submittingOnboarding}
                    value={onboardingForm.address}
                    onChange={e => setOnboardingForm({ ...onboardingForm, address: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition-all min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Medical history / Chronic Conditions</label>
                  <textarea
                    placeholder="List any ongoing conditions (Diabetes, Hypertension, etc.)..."
                    disabled={submittingOnboarding}
                    value={onboardingForm.medicalHistory}
                    onChange={e => setOnboardingForm({ ...onboardingForm, medicalHistory: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition-all min-h-[80px]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingOnboarding}
                  className="w-full flex items-center justify-center gap-3 py-5 bg-slate-950 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-2xl active:scale-[0.98] disabled:opacity-50"
                >
                  {submittingOnboarding ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Saving Profile...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={18} strokeWidth={3} />
                      Finalize My Profile
                    </>
                  )}
                </button>
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setShowOnboarding(false)}
                    className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-700 transition-colors bg-transparent border-none outline-none"
                  >
                    I'll complete this later
                  </button>
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
