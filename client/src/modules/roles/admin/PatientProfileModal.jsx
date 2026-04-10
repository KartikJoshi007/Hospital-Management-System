import { useState, useEffect } from 'react'
import { X, User, Phone, MapPin, Droplets, Calendar, FileText, Activity, ClipboardList, Eye, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getPatientRecords } from '../../patients/medicalRecordApi'
import { getPatientAppointments } from '../../appointments/appointmentApi'

const TABS = [
  { key: 'overview', label: 'Overview', icon: User },
  { key: 'appointments', label: 'Appointments', icon: Calendar },
  { key: 'reports', label: 'Reports', icon: FileText },
  { key: 'vitals', label: 'Vitals', icon: Activity },
]

const STATUS_COLORS = {
  Active: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  Admitted: 'bg-blue-50 text-blue-600 border-blue-100',
  Discharged: 'bg-slate-50 text-slate-500 border-slate-100',
}

const APPT_COLORS = {
  Confirmed: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  Completed: 'bg-slate-50 text-slate-500 border-slate-100',
  Cancelled: 'bg-rose-50 text-rose-500 border-rose-100',
}

const RESULT_COLORS = {
  Normal: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  Clear: 'bg-blue-50 text-blue-600 border-blue-100',
  Abnormal: 'bg-rose-50 text-rose-500 border-rose-100',
  Final: 'bg-emerald-50 text-emerald-600 border-emerald-100',
}

function PatientProfileModal({ patient, onClose }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [viewReport, setViewReport] = useState(null)
  const [reports, setReports] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)

  // Vitals from patient model
  const vitals = patient?.vitals || {}

  useEffect(() => {
    if (!patient?._id) return

    const fetchData = async () => {
      setLoading(true)
      try {
        const [appRes, recRes] = await Promise.all([
          getPatientAppointments(patient._id, 1, 100),
          getPatientRecords(patient._id)
        ])

        // Parse appointments
        const appData = Array.isArray(appRes?.data) ? appRes.data : (appRes?.data?.appointments || [])
        setAppointments(appData)

        // Parse reports
        const recData = Array.isArray(recRes?.data) ? recRes.data : (recRes?.data?.records || [])
        const reportsOnly = recData
          .filter(r => r.type === 'Lab Report' || r.type === 'Imaging')
          .map(r => {
            let findings = []
            try {
              findings = JSON.parse(r.description)
            } catch {
              findings = [{ label: 'Documentation & Notes', value: r.description, status: '' }]
            }
            return {
              id: r._id?.slice(-8).toUpperCase() || 'R-NEW',
              name: r.title,
              date: new Date(r.date).toISOString().slice(0, 10),
              type: r.type,
              result: r.title.toLowerCase().includes('normal') ? 'Normal' : 'Final',
              doctor: r.doctorId?.fullName || r.doctorId?.name || 'Lab Physician',
              lab: r.clinicName || 'Central Lab',
              summary: r.title,
              findings: findings,
              attachments: r.attachments || [],
            }
          })
        setReports(reportsOnly)

      } catch (err) {
        console.error("Failed to load patient data:", err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [patient?._id])

  return (
    <>
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
                  {patient.name?.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">{patient.name}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{patient.userId?.email || patient.email || 'No Email'}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${STATUS_COLORS[patient.status] || ''}`}>
                      {patient.status}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all border border-slate-200">
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto">
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all whitespace-nowrap ${activeTab === tab.key
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
            {loading ? (
              <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
                 <Loader2 size={18} className="animate-spin" />
                 <span className="text-xs font-black uppercase tracking-widest">Loading records...</span>
              </div>
            ) : (
              <>
                {/* Overview */}
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                          { label: 'Age', value: `${patient.age} yrs` },
                          { label: 'Gender', value: patient.gender },
                          { label: 'Blood Group', value: patient.bloodGroup || 'N/A' },
                          { label: 'Status', value: patient.status },
                          { label: 'Email', value: patient.userId?.email || patient.email || 'N/A' },
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
                  </div>
                )}

                {/* Appointments */}
                {activeTab === 'appointments' && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{appointments.length} appointments on record</p>
                    {appointments.map((a, i) => (
                      <motion.div key={a._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-100 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                            <Calendar size={16} className="text-emerald-500" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900">{a.doctor}</p>
                            <p className="text-[10px] font-bold text-slate-400">{a.type} • {new Date(a.date).toLocaleDateString()} at {a.time}</p>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${APPT_COLORS[a.status] || ''}`}>
                          {a.status}
                        </span>
                      </motion.div>
                    ))}
                    {appointments.length === 0 && <p className="text-xs font-bold text-slate-400 text-center py-10">No appointments found.</p>}
                  </div>
                )}

                {/* Reports */}
                {activeTab === 'reports' && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{reports.length} reports available</p>
                    {reports.map((r, i) => (
                      <motion.div key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-100 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                            <FileText size={16} className="text-emerald-500" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900">{r.name}</p>
                            <p className="text-[10px] font-bold text-slate-400">{r.type} • {r.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${RESULT_COLORS[r.result] || 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                            {r.result}
                          </span>
                          <button
                            onClick={() => setViewReport(r)}
                            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100 transition-all"
                          >
                            <Eye size={13} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                    {reports.length === 0 && <p className="text-xs font-bold text-slate-400 text-center py-10">No reports found.</p>}
                  </div>
                )}

                {/* Vitals */}
                {activeTab === 'vitals' && (() => {
                  const rows = [
                    { label: 'Height', value: vitals.height, unit: 'cm', color: 'text-blue-500 bg-blue-50 border-blue-100' },
                    { label: 'Weight', value: vitals.weight, unit: 'kg', color: 'text-orange-500 bg-orange-50 border-orange-100' },
                  ].filter(r => r.value && r.value !== 0)
                  return (
                    <div className="space-y-6">
                      {rows.length === 0 ? (
                        <div className="py-20 text-center space-y-3">
                           <Activity className="h-10 w-10 text-slate-200 mx-auto" />
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No clinical vitals recorded yet.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {rows.map((row, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                              className={`p-4 rounded-2xl border ${row.color} text-center`}>
                              <p className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-70">{row.label}</p>
                              <p className="text-2xl font-black">{row.value} <span className="text-xs font-bold ml-1 opacity-60">{row.unit}</span></p>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })()}
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/* Report Detail Modal */}
      <AnimatePresence>
        {viewReport && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
            >
              <div className="px-8 pt-6 pb-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                    <FileText size={16} className="text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">{viewReport.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{viewReport.type} • {viewReport.date}</p>
                  </div>
                </div>
                <button onClick={() => setViewReport(null)} className="h-9 w-9 flex items-center justify-center rounded-xl bg-white text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all border border-slate-200">
                  <X size={16} />
                </button>
              </div>

              <div className="px-8 py-6 space-y-5 overflow-y-auto">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                  <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1.5">Record Title</p>
                  <p className="text-sm font-bold text-slate-800 leading-relaxed">
                    {viewReport.name}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Findings</p>
                  <div className="grid gap-3">
                    {viewReport.findings.length > 0 ? viewReport.findings.map((f, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{f.label}</p>
                        <p className="text-sm font-black text-slate-900">{f.value}</p>
                        {f.status && f.status !== 'Normal' && (
                          <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${RESULT_COLORS[f.status] || 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                            {f.status}
                          </span>
                        )}
                      </div>
                    )) : (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                        {viewReport.findings}
                      </div>
                    )}
                  </div>
                </div>

                {viewReport.attachments && viewReport.attachments.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                       <span className="h-2 w-2 rounded-full bg-emerald-500" /> Attached Documents
                    </p>
                    <div className="grid grid-cols-1 gap-3">
                      {viewReport.attachments.map((file, idx) => (
                        <a key={idx} href={`http://localhost:5000${file.fileUrl}`} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-white hover:bg-slate-50 transition-all group no-underline text-slate-900 shadow-sm">
                          <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                            <FileText size={18} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-black truncate">{file.fileName}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">View / Download</p>
                          </div>
                          <Eye size={16} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

export default PatientProfileModal
