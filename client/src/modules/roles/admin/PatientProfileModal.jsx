import { useState } from 'react'
import { X, User, Phone, MapPin, Droplets, Calendar, FileText, Activity, ClipboardList } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const TABS = [
  { key: 'overview',      label: 'Overview',     icon: User },
  { key: 'appointments',  label: 'Appointments', icon: Calendar },
  { key: 'reports',       label: 'Reports',      icon: FileText },
  { key: 'vitals',        label: 'Vitals',       icon: Activity },
]

const STATUS_COLORS = {
  Active:     'bg-emerald-50 text-emerald-600 border-emerald-100',
  Admitted:   'bg-blue-50 text-blue-600 border-blue-100',
  Discharged: 'bg-slate-50 text-slate-500 border-slate-100',
}

// Mock extended data per patient
const getMockData = (patient) => ({
  appointments: [
    { id: 'A-001', date: '2024-06-10', time: '10:30 AM', doctor: 'Dr. Aryan Mehta', dept: 'Cardiology',  status: 'Confirmed' },
    { id: 'A-002', date: '2024-05-22', time: '11:00 AM', doctor: 'Dr. Sneha Verma',  dept: 'Neurology',  status: 'Completed' },
    { id: 'A-003', date: '2024-04-15', time: '02:00 PM', doctor: 'Dr. Nisha Iyer',   dept: 'Dermatology', status: 'Completed' },
  ],
  reports: [
    { id: 'R-001', name: 'Blood Test Report',    date: '2024-06-08', type: 'Lab',      result: 'Normal' },
    { id: 'R-002', name: 'X-Ray Chest',          date: '2024-05-20', type: 'Radiology', result: 'Clear' },
    { id: 'R-003', name: 'ECG Report',           date: '2024-04-10', type: 'Cardiology', result: 'Normal' },
    { id: 'R-004', name: 'Urine Analysis',       date: '2024-03-18', type: 'Lab',      result: 'Normal' },
  ],
  vitals: {
    bloodPressure: '120/80 mmHg',
    heartRate:     '72 bpm',
    temperature:   '98.6°F',
    weight:        '70 kg',
    height:        '175 cm',
    bmi:           '22.9',
    oxygenSat:     '98%',
    lastUpdated:   '2024-06-10',
  },
})

const APPT_COLORS = {
  Confirmed: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  Completed: 'bg-slate-50 text-slate-500 border-slate-100',
  Cancelled: 'bg-rose-50 text-rose-500 border-rose-100',
}

const RESULT_COLORS = {
  Normal: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  Clear:  'bg-blue-50 text-blue-600 border-blue-100',
  Abnormal: 'bg-rose-50 text-rose-500 border-rose-100',
}

function PatientProfileModal({ patient, onClose }) {
  const [activeTab, setActiveTab] = useState('overview')
  const data = getMockData(patient)

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-3xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="px-8 pt-6 pb-0 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-2xl font-black shadow-md">
                    {patient.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">{patient.name}</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{patient.id}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${STATUS_COLORS[patient.status]}`}>
                        {patient.status}
                      </span>
                    </div>
                  </div>
                </div>
                <button onClick={onClose}
                  className="h-10 w-10 flex items-center justify-center rounded-xl bg-white text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all border border-slate-200">
                  <X size={18} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 border-b border-slate-100">
                {TABS.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-1.5 px-4 py-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${
                      activeTab === tab.key
                        ? 'border-emerald-500 text-emerald-600'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <tab.icon size={12} />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto px-8 py-6">

            {/* Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Age',        value: `${patient.age} yrs`,    icon: User,     color: 'emerald' },
                    { label: 'Gender',     value: patient.gender,           icon: User,     color: 'blue'    },
                    { label: 'Blood Group', value: patient.bloodGroup || 'N/A', icon: Droplets, color: 'rose' },
                    { label: 'Status',     value: patient.status,           icon: Activity, color: 'orange'  },
                  ].map((item, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                      <p className="text-sm font-black text-slate-900">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Phone size={12} className="text-slate-400" />
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contact</p>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{patient.contact || 'N/A'}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin size={12} className="text-slate-400" />
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Address</p>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{patient.address || 'N/A'}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                  <div className="flex items-center gap-2 mb-2">
                    <ClipboardList size={12} className="text-amber-500" />
                    <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Medical History</p>
                  </div>
                  <p className="text-sm font-bold text-amber-900 leading-relaxed">{patient.medicalHistory || 'No prior medical history recorded.'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Admission Date</p>
                  <p className="text-sm font-bold text-slate-900">{patient.date || 'N/A'}</p>
                </div>
              </div>
            )}

            {/* Appointments */}
            {activeTab === 'appointments' && (
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{data.appointments.length} appointments on record</p>
                {data.appointments.map((a, i) => (
                  <motion.div key={a.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-100 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                        <Calendar size={16} className="text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{a.doctor}</p>
                        <p className="text-[10px] font-bold text-slate-400">{a.dept} • {a.date} at {a.time}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${APPT_COLORS[a.status]}`}>
                      {a.status}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Reports */}
            {activeTab === 'reports' && (
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{data.reports.length} reports available</p>
                {data.reports.map((r, i) => (
                  <motion.div key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-100 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                        <FileText size={16} className="text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{r.name}</p>
                        <p className="text-[10px] font-bold text-slate-400">{r.type} • {r.date}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${RESULT_COLORS[r.result] || 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                      {r.result}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Vitals */}
            {activeTab === 'vitals' && (
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last updated: {data.vitals.lastUpdated}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Blood Pressure', value: data.vitals.bloodPressure, color: 'rose' },
                    { label: 'Heart Rate',     value: data.vitals.heartRate,     color: 'red' },
                    { label: 'Temperature',    value: data.vitals.temperature,   color: 'orange' },
                    { label: 'Oxygen Sat.',    value: data.vitals.oxygenSat,     color: 'blue' },
                    { label: 'Weight',         value: data.vitals.weight,        color: 'emerald' },
                    { label: 'Height',         value: data.vitals.height,        color: 'emerald' },
                    { label: 'BMI',            value: data.vitals.bmi,           color: 'purple' },
                  ].map((v, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{v.label}</p>
                      <p className="text-sm font-black text-slate-900">{v.value}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default PatientProfileModal
