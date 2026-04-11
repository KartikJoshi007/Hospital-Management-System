import { useState, useEffect } from 'react'
import { X, User, FileText, Pill, Calendar, Activity, Eye, Phone, MapPin, AlertTriangle, DollarSign, Droplets, Download, Scissors, Clock, ChevronLeft, ChevronRight, Plus, Check, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useAuth from '../../../hooks/useAuth'
import { getDoctorByUserId } from '../../doctors/doctorApi'
import { createScheduleEvent } from './scheduleApi'
import { getBillsByPatient } from '../../billing/billingApi'
import { getPatientRecords, createRecord } from '../../patients/medicalRecordApi'
import jsPDF from 'jspdf'

const HOSPITAL = {
  name:    'City Care Hospital',
  timing:  'Mon – Sat: 8:00 AM – 9:00 PM  |  Sun: 9:00 AM – 2:00 PM',
  address: '42, MG Road, Mumbai, Maharashtra – 400001',
  phone:   '+91 98001 11222',
}

const TABS = [
  { key: 'overview',     label: 'Overview',     icon: User        },
  { key: 'reports',      label: 'Reports',      icon: FileText    },
  { key: 'prescription', label: 'Prescription', icon: Pill        },
  { key: 'vitals',       label: 'Vitals',       icon: Activity    },
  { key: 'billing',      label: 'Billing',      icon: DollarSign  },
  { key: 'calendar',     label: 'Calendar',     icon: Calendar    },
]

const RESULT_COLORS = {
  Normal:   'bg-emerald-50 text-emerald-600 border-emerald-100',
  Clear:    'bg-blue-50 text-blue-600 border-blue-100',
  Abnormal: 'bg-rose-50 text-rose-500 border-rose-100',
  High:     'bg-orange-50 text-orange-600 border-orange-100',
}

const BILL_COLORS = {
  Paid:    'bg-emerald-50 text-emerald-600 border-emerald-100',
  Pending: 'bg-amber-50 text-amber-600 border-amber-100',
  Overdue: 'bg-rose-50 text-rose-500 border-rose-100',
  Unpaid:  'bg-rose-50 text-rose-500 border-rose-100',
}

const RECORD_STATUS_COLORS = {
  Final:   'bg-emerald-50 text-emerald-600 border-emerald-100',
  Draft:   'bg-orange-50 text-orange-600 border-orange-100',
  Pending: 'bg-blue-50 text-blue-600 border-blue-100',
}

const TYPE_ICONS = {
  'Prescription':   'Rx',
  'Lab Report':     'Lab',
  'Discharge Note': 'DC',
  'Imaging':        'IMG',
}

const EVENT_COLORS = {
  surgery:     { bg: 'bg-rose-500',    light: 'bg-rose-50 border-rose-100',    text: 'text-rose-600',    dot: 'bg-rose-500'    },
  appointment: { bg: 'bg-blue-500',    light: 'bg-blue-50 border-blue-100',    text: 'text-blue-600',    dot: 'bg-blue-500'    },
  upcoming:    { bg: 'bg-purple-500',  light: 'bg-purple-50 border-purple-100', text: 'text-purple-600',  dot: 'bg-purple-500'  },
  followup:    { bg: 'bg-emerald-500', light: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-600', dot: 'bg-emerald-500' },
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

const EMPTY_MED = { name: '', dose: '', freq: '', duration: '', instructions: '' }

const EMPTY_FINDING = { label: '', value: '', status: '' }

function PrescriptionTab({ patient }) {
  const { user } = useAuth()
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading]             = useState(false)
  const [showForm, setShowForm]           = useState(false)
  const [medicines, setMedicines]         = useState([{ ...EMPTY_MED }])
  const [notes, setNotes]                 = useState('')
  const [error, setError]                 = useState('')
  const [confirmDel, setConfirmDel]       = useState(null)
  const [doctorProfile, setDoctorProfile] = useState(null)

  // Fetch Doctor Profile
  useEffect(() => {
    if (user?.id) {
      getDoctorByUserId(user.id)
        .then(res => setDoctorProfile(res?.data?.data || res?.data))
        .catch(err => console.error("Failed to fetch doctor profile:", err))
    }
  }, [user?.id])

  // Fetch Patient Prescriptions
  const fetchRx = async () => {
    if (!patient?._id) return
    setLoading(true)
    try {
      const res = await getPatientRecords(patient._id)
      const list = res?.data || []
      const rxOnly = list
        .filter(r => r.type === 'Prescription')
        .map(r => {
          let meds = []
          try {
             meds = JSON.parse(r.description)
          } catch {
             meds = [{ name: r.title, dose: '—', freq: '—', duration: '—', instructions: r.description }]
          }
          return {
            id:       r._id?.slice(-8).toUpperCase() || 'Rx-NEW',
            dbId:     r._id,
            date:     new Date(r.date).toISOString().slice(0, 10),
            doctor:   r.doctorId?.fullName || r.doctorId?.name || 'Doctor',
            medicines: meds,
            notes:     r.title === 'Prescription' ? '' : r.title, // Simplified notes handling
          }
        })
      setPrescriptions(rxOnly)
    } catch (err) {
      console.error("Failed to fetch prescriptions:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRx()
  }, [patient?._id])

  const updateMed = (i, field, val) =>
    setMedicines(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: val } : m))

  const addMedRow = () => setMedicines(prev => [...prev, { ...EMPTY_MED }])

  const removeMedRow = (i) => setMedicines(prev => prev.filter((_, idx) => idx !== i))

  const handleSave = async () => {
    const filled = medicines.filter(m => m.name.trim())
    if (!filled.length) { setError('Add at least one medicine.'); return }
    if (!doctorProfile?._id) { setError('Doctor profile not loaded yet.'); return }

    setLoading(true)
    try {
      const recordData = {
        patientId: patient._id,
        doctorId:  doctorProfile._id,
        type:      'Prescription',
        title:     notes || 'General Prescription',
        description: JSON.stringify(filled)
      }

      await createRecord(recordData)
      setShowForm(false)
      setMedicines([{ ...EMPTY_MED }])
      setNotes('')
      setError('')
      fetchRx() // Refresh list
    } catch (err) {
      setError(err?.message || 'Failed to save record.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-400 bg-white placeholder:text-slate-300'

  const downloadPDF = (rx) => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const pw = doc.internal.pageSize.getWidth()
    let y = 0

    // ── Header background ──
    doc.setFillColor(37, 99, 235)
    doc.rect(0, 0, pw, 38, 'F')

    // Hospital name
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(20)
    doc.setTextColor(255, 255, 255)
    doc.text(HOSPITAL.name, pw / 2, 14, { align: 'center' })

    // Timing
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(HOSPITAL.timing, pw / 2, 21, { align: 'center' })

    // Doctor degree / name
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text(rx.doctor, pw / 2, 28, { align: 'center' })

    // Divider line
    doc.setDrawColor(255, 255, 255)
    doc.setLineWidth(0.3)
    doc.line(14, 33, pw - 14, 33)

    // Rx ID + Date
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(`Rx ID: ${rx.id}`, 14, 37)
    doc.text(`Date: ${rx.date}`, pw - 14, 37, { align: 'right' })

    y = 50

    // ── Patient info ──
    doc.setTextColor(30, 41, 59)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('Patient:', 14, y)
    doc.setFont('helvetica', 'normal')
    doc.text(patient.name, 35, y)
    y += 6

    // ── Divider ──
    doc.setDrawColor(203, 213, 225)
    doc.setLineWidth(0.3)
    doc.line(14, y, pw - 14, y)
    y += 8

    // ── Rx symbol ──
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.setTextColor(37, 99, 235)
    doc.text('Rx', 14, y)
    y += 8

    // ── Medicine table header ──
    const cols = { med: 14, dose: 72, freq: 100, dur: 130, inst: 158 }
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(100, 116, 139)
    doc.text('MEDICINE',     cols.med,  y)
    doc.text('DOSE',         cols.dose, y)
    doc.text('FREQUENCY',    cols.freq, y)
    doc.text('DURATION',     cols.dur,  y)
    doc.text('INSTRUCTIONS', cols.inst, y)
    y += 3

    doc.setDrawColor(203, 213, 225)
    doc.line(14, y, pw - 14, y)
    y += 6

    // ── Medicine rows ──
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(30, 41, 59)
    rx.medicines.forEach((m, idx) => {
      // alternating row bg
      if (idx % 2 === 0) {
        doc.setFillColor(248, 250, 252)
        doc.rect(14, y - 4, pw - 28, 8, 'F')
      }
      doc.setFontSize(8.5)
      doc.setFont('helvetica', 'bold')
      doc.text(m.name        || '—', cols.med,  y)
      doc.setFont('helvetica', 'normal')
      doc.text(m.dose        || '—', cols.dose, y)
      doc.text(m.freq        || '—', cols.freq, y)
      doc.text(m.duration    || '—', cols.dur,  y)
      doc.text(m.instructions|| '—', cols.inst, y)
      y += 9
    })

    y += 4
    doc.setDrawColor(203, 213, 225)
    doc.line(14, y, pw - 14, y)
    y += 8

    // ── Notes ──
    if (rx.notes) {
      doc.setFillColor(255, 251, 235)
      const noteLines = doc.splitTextToSize(`Notes: ${rx.notes}`, pw - 28)
      const noteH = noteLines.length * 5 + 6
      doc.rect(14, y - 4, pw - 28, noteH, 'F')
      doc.setFontSize(8.5)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(120, 83, 8)
      doc.text(noteLines, 17, y)
      y += noteH + 4
    }

    // ── Doctor signature line ──
    y += 6
    doc.setDrawColor(148, 163, 184)
    doc.line(pw - 60, y, pw - 14, y)
    y += 5
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(30, 41, 59)
    doc.text(rx.doctor, pw - 14, y, { align: 'right' })
    y += 4
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 116, 139)
    doc.text('Signature', pw - 14, y, { align: 'right' })

    // ── Footer ──
    const pageH = doc.internal.pageSize.getHeight()
    doc.setFillColor(37, 99, 235)
    doc.rect(0, pageH - 18, pw, 18, 'F')
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(255, 255, 255)
    doc.text(HOSPITAL.address, pw / 2, pageH - 10, { align: 'center' })
    doc.text(`Tel: ${HOSPITAL.phone}`, pw / 2, pageH - 5, { align: 'center' })

    doc.save(`Prescription_${rx.id}_${patient.name.replace(/\s+/g, '_')}.pdf`)
  }

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{prescriptions.length} prescription(s)</p>
        <button
          onClick={() => { setShowForm(v => !v); setError('') }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
            showForm
              ? 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
              : 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600'
          }`}>
          <Plus size={12} />{showForm ? 'Cancel' : 'Add Prescription'}
        </button>
      </div>

      {/* Add Prescription Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="rounded-2xl border border-blue-100 bg-blue-50/40 overflow-hidden"
          >
            <div className="px-5 py-3 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
              <Pill size={13} className="text-blue-500" />
              <p className="text-xs font-black text-blue-700">New Prescription — {patient.name}</p>
            </div>

            <div className="px-5 py-4 space-y-3">
              {/* Medicine rows */}
              <div className="space-y-2">
                {/* Column headers */}
                <div className="grid grid-cols-[2fr_1fr_1.5fr_1fr_1.5fr_auto] gap-2">
                  {['Medicine', 'Dose', 'Frequency', 'Duration', 'Instructions', ''].map((h, i) => (
                    <p key={i} className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</p>
                  ))}
                </div>

                {medicines.map((m, i) => (
                  <div key={i} className="grid grid-cols-[2fr_1fr_1.5fr_1fr_1.5fr_auto] gap-2 items-center">
                    <input value={m.name}         onChange={e => updateMed(i, 'name',         e.target.value)} placeholder="e.g. Metformin 500mg" className={inputCls} />
                    <input value={m.dose}         onChange={e => updateMed(i, 'dose',         e.target.value)} placeholder="1 tablet"            className={inputCls} />
                    <input value={m.freq}         onChange={e => updateMed(i, 'freq',         e.target.value)} placeholder="Twice daily"         className={inputCls} />
                    <input value={m.duration}     onChange={e => updateMed(i, 'duration',     e.target.value)} placeholder="30 days"             className={inputCls} />
                    <input value={m.instructions} onChange={e => updateMed(i, 'instructions', e.target.value)} placeholder="After meals"         className={inputCls} />
                    <button onClick={() => removeMedRow(i)} disabled={medicines.length === 1}
                      className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>

              <button onClick={addMedRow}
                className="flex items-center gap-1.5 text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-700 transition-colors">
                <Plus size={11} /> Add Medicine
              </button>

              {/* Notes */}
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Notes / Instructions</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                  placeholder="e.g. Avoid high-sodium diet. Monitor BP weekly."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-400 bg-white resize-none placeholder:text-slate-300" />
              </div>

              {error && <p className="text-[10px] font-black text-rose-500">{error}</p>}

              <div className="flex gap-2 pt-1">
                <button onClick={handleSave}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-colors">
                  <Check size={12} /> Save Prescription
                </button>
                <button onClick={() => { setShowForm(false); setError('') }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prescription list */}
      {prescriptions.map((rx, i) => (
        <motion.div key={rx.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
          className="rounded-2xl border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-100">
            <div>
              <p className="text-xs font-black text-slate-900">{rx.id}</p>
              <p className="text-[10px] font-bold text-slate-400">{rx.doctor} • {rx.date}</p>
            </div>
            <div className="flex items-center gap-2">
              <Pill size={15} className="text-blue-400" />
              <button
                onClick={() => downloadPDF(rx)}
                title="Download PDF"
                className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-blue-500 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all">
                <Download size={13} />
              </button>
              <button
                onClick={() => setConfirmDel(rx)}
                className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all">
                <X size={13} />
              </button>
            </div>
          </div>
          <div className="divide-y divide-slate-50">
            {rx.medicines.map((m, j) => (
              <div key={j} className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-5 py-3">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Medicine</p>
                  <p className="text-xs font-black text-slate-900">{m.name}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Dose</p>
                  <p className="text-xs font-bold text-slate-700">{m.dose}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Frequency</p>
                  <p className="text-xs font-bold text-slate-700">{m.freq} · {m.duration}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Instructions</p>
                  <p className="text-xs font-bold text-blue-600">{m.instructions}</p>
                </div>
              </div>
            ))}
          </div>
          {rx.notes ? (
            <div className="px-5 py-3 bg-amber-50 border-t border-amber-100">
              <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1">Notes</p>
              <p className="text-xs font-bold text-amber-900">{rx.notes}</p>
            </div>
          ) : null}
        </motion.div>
      ))}

      {prescriptions.length === 0 && (
        <p className="text-center text-xs font-bold text-slate-400 py-8">No prescriptions yet.</p>
      )}

      {/* Confirm Delete Modal */}
      <AnimatePresence>
        {confirmDel && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-sm bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden"
            >
              <div className="px-6 pt-6 pb-4 flex flex-col items-center text-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center">
                  <AlertTriangle size={20} className="text-rose-500" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">Delete this prescription?</p>
                  <p className="text-xs font-bold text-slate-400 mt-1">
                    <span className="font-black text-slate-700">{confirmDel.id}</span> · {confirmDel.doctor} · {confirmDel.date}
                  </p>
                </div>
                <p className="text-[10px] font-bold text-slate-400">This action cannot be undone.</p>
              </div>
              <div className="flex gap-3 px-6 py-4 border-t border-slate-100">
                <button
                  onClick={() => setConfirmDel(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-500 text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Keep It
                </button>
                <button
                  onClick={() => {
                    setPrescriptions(prev => prev.filter(r => r.id !== confirmDel.id))
                    setConfirmDel(null)
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white text-xs font-black uppercase tracking-widest hover:bg-rose-600 transition-all"
                >
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ReportsTab({ patient }) {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [viewReport, setViewReport] = useState(null)

  const fetchReports = async () => {
    if (!patient?._id) return
    setLoading(true)
    try {
      const res = await getPatientRecords(patient._id)
      const list = Array.isArray(res?.data) ? res.data : (res?.data?.records || [])
      const reportsOnly = list
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
      console.error("Failed to fetch reports:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [patient?._id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-xs font-black uppercase tracking-widest">Accessing laboratory records...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{reports.length} report(s) available</p>
      {reports.map((r, i) => (
        <motion.div key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
          className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-100 transition-all">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
              <FileText size={16} className="text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">{r.name}</p>
              <p className="text-[10px] font-bold text-slate-400">{r.type} • {r.date}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${RESULT_COLORS[r.result] || 'bg-slate-50 text-slate-500 border-slate-100'}`}>
              {r.result}
            </span>
            <button onClick={() => setViewReport(r)}
              className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all">
              <Eye size={13} />
            </button>
          </div>
        </motion.div>
      ))}

      {reports.length === 0 && (
        <div className="py-16 text-center text-xs font-bold text-slate-400 flex flex-col items-center gap-3">
          <FileText size={24} className="text-slate-200" />
          No laboratory reports or imaging found for this patient.
        </div>
      )}

      {/* Report Detail Sub-Modal */}
      <AnimatePresence>
        {viewReport && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden"
            >
              <div className="px-8 pt-6 pb-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm">
                    <FileText size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">{viewReport.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{viewReport.type} • {viewReport.date}</p>
                  </div>
                </div>
                <button onClick={() => setViewReport(null)}
                  className="h-9 w-9 flex items-center justify-center rounded-xl bg-white text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all border border-slate-200 shadow-sm">
                  <X size={16} />
                </button>
              </div>

              <div className="px-8 py-6 space-y-5 max-h-[60vh] overflow-y-auto">
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                  <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1.5">Record Title</p>
                  <p className="text-sm font-bold text-slate-800 leading-relaxed">{viewReport.name}</p>
                </div>

                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Laboratory Findings</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Array.isArray(viewReport.findings) ? viewReport.findings.map((f, i) => (
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
                      <div className="col-span-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                        {viewReport.findings}
                      </div>
                    )}
                  </div>
                </div>

                {/* Attachments Section */}
                {viewReport.attachments && viewReport.attachments.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                       <span className="h-2 w-2 rounded-full bg-blue-500" /> Attached Documents
                    </p>
                    <div className="grid grid-cols-1 gap-3">
                      {viewReport.attachments.map((file, idx) => (
                        <a key={idx} href={`http://localhost:5000${file.fileUrl}`} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-white hover:bg-slate-50 transition-all group no-underline text-slate-900 shadow-sm">
                          <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                            <FileText size={18} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-black truncate">{file.fileName}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">View / Download</p>
                          </div>
                          <Eye size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
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
    </div>
  )
}

function fmt12(time24) {
  if (!time24) return ''
  const [h, m] = time24.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12  = h % 12 || 12
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`
}

function CalendarTab({ events, onBookSurgery, patient }) {
  const today = new Date()
  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const [selected, setSelected] = useState(null)
  const [modal, setModal] = useState(null) // { type: 'surgery'|'appointment'|'upcoming' }
  const [form, setForm] = useState({ date: '', time: '', note: '' })
  const [localEvents, setLocalEvents] = useState(events)

  const firstDay = new Date(current.year, current.month, 1).getDay()
  const daysInMonth = new Date(current.year, current.month + 1, 0).getDate()

  const getEventsForDay = (day) => {
    const d = `${current.year}-${String(current.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return localEvents.filter(e => e.date === d)
  }

  const [showUpcoming, setShowUpcoming] = useState(false)

  const upcomingEvents = localEvents
    .filter(e => e.type === 'appointment' || e.type === 'surgery')
    .sort((a, b) => a.date.localeCompare(b.date))

  const { user } = useAuth()
  const [doctorProfile, setDoctorProfile] = useState(null)

  useEffect(() => {
    const fetchDoc = async () => {
      if (!user?.id) return
      try {
        const res = await getDoctorByUserId(user.id)
        setDoctorProfile(res.data)
      } catch (err) {
        console.error("Failed to load doctor profile in modal:", err)
      }
    }
    fetchDoc()
  }, [user?.id])

  const handleSave = async () => {
    if (!form.date || !form.time || !doctorProfile?._id) return
    const titles  = { surgery: 'Schedule Procedure', appointment: 'Next Appointment' }
    const typeMap  = { surgery: 'procedure', appointment: 'upcoming' }
    const timeDisp = fmt12(form.time)
    
    const eventParams = {
      doctorId: doctorProfile._id,
      date: form.date,
      type: typeMap[modal.type],
      title: `${patient.name} — ${titles[modal.type]}`,
      time: timeDisp,
      note: form.note || patient.name,
    }

    try {
      const res = await createScheduleEvent(eventParams)
      if (res.success) {
        const newEvent = {
          ...res.data,
          id: res.data._id || res.data.id
        }
        setLocalEvents(prev => [...prev, newEvent])
        
        // Notify other components (like Schedule.jsx) that schedule has updated
        window.dispatchEvent(new Event('scheduleUpdated'))
        
        if (modal.type === 'surgery' && onBookSurgery) {
          onBookSurgery(newEvent)
        }
        setModal(null)
        setForm({ date: '', time: '', note: '' })
      }
    } catch (err) {
      console.error("Failed to save schedule event from modal:", err)
    }
  }

  const selectedDateStr = selected
    ? `${current.year}-${String(current.month + 1).padStart(2, '0')}-${String(selected).padStart(2, '0')}`
    : ''

  const selectedEvents = selected ? getEventsForDay(selected) : []

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-3">
        <button onClick={() => { setShowUpcoming(false); setModal({ type: 'surgery' }); setForm(p => ({ ...p, date: selectedDateStr })) }}
          className="flex items-center justify-center gap-2 p-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100">
          <Scissors size={13} /> Schedule Procedure
        </button>
        <button onClick={() => { setShowUpcoming(false); setModal({ type: 'appointment' }); setForm(p => ({ ...p, date: selectedDateStr })) }}
          className="flex items-center justify-center gap-2 p-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100">
          <Plus size={13} /> Next Appointment
        </button>
        <button onClick={() => setShowUpcoming(v => !v)}
          className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${
            showUpcoming ? 'bg-purple-500 text-white border-purple-500' : 'bg-purple-50 border-purple-100 text-purple-600 hover:bg-purple-100'
          }`}>
          <Clock size={13} /> Upcoming
        </button>
      </div>

      {/* Upcoming Panel */}
      <AnimatePresence>
        {showUpcoming && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="rounded-2xl border border-purple-100 bg-purple-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-purple-100">
              <p className="text-[9px] font-black text-purple-500 uppercase tracking-widest">Upcoming — Next Appointments & Surgeries</p>
            </div>
            {upcomingEvents.length === 0 ? (
              <p className="px-4 py-4 text-xs font-bold text-slate-400">No upcoming events scheduled.</p>
            ) : (
              <div className="divide-y divide-purple-100">
                {upcomingEvents.map(e => (
                  <div key={e.id} className="flex items-center gap-3 px-4 py-3">
                    <div className={`h-7 w-7 rounded-xl flex items-center justify-center shrink-0 ${EVENT_COLORS[e.type].bg}`}>
                      {e.type === 'surgery' ? <Scissors size={11} className="text-white" /> : <Calendar size={11} className="text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-black ${EVENT_COLORS[e.type].text}`}>{e.title}</p>
                      <p className="text-[10px] font-bold text-slate-400">{e.date} · {e.time}{e.note ? ` · ${e.note}` : ''}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                      e.type === 'surgery' ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-blue-50 text-blue-500 border-blue-100'
                    }`}>{e.type === 'surgery' ? 'Procedure' : 'Appointment'}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calendar — hidden when Upcoming panel is open */}
      {!showUpcoming && (
        <>
          {/* Calendar Header */}
          <div className="flex items-center justify-between px-1">
            <button onClick={() => setCurrent(p => { const d = new Date(p.year, p.month - 1); return { year: d.getFullYear(), month: d.getMonth() } })}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"><ChevronLeft size={16} /></button>
            <p className="text-sm font-black text-slate-900">{MONTHS[current.month]} {current.year}</p>
            <button onClick={() => setCurrent(p => { const d = new Date(p.year, p.month + 1); return { year: d.getFullYear(), month: d.getMonth() } })}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"><ChevronRight size={16} /></button>
          </div>

          {/* Day Labels */}
          <div className="grid grid-cols-7 gap-1">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[9px] font-black text-slate-400 uppercase tracking-widest py-1">{d}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const dayEvents = getEventsForDay(day)
              const isToday = today.getDate() === day && today.getMonth() === current.month && today.getFullYear() === current.year
              const isSelected = selected === day
              return (
                <button key={day} onClick={() => {
                    const newDay = isSelected ? null : day
                    setSelected(newDay)
                    if (newDay) {
                      const d = `${current.year}-${String(current.month + 1).padStart(2, '0')}-${String(newDay).padStart(2, '0')}`
                      setForm(p => ({ ...p, date: d }))
                    }
                  }}
                  className={`relative flex flex-col items-center justify-start pt-1.5 pb-1 rounded-xl min-h-[44px] text-xs font-black transition-all border ${
                    isSelected ? 'bg-blue-500 text-white border-blue-500' :
                    isToday    ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                 'bg-white text-slate-700 border-slate-100 hover:border-blue-100 hover:bg-slate-50'
                  }`}>
                  {day}
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                      {dayEvents.slice(0, 3).map(e => (
                        <span key={e.id} className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white' : EVENT_COLORS[e.type].dot}`} />
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Selected Day Events */}
          <AnimatePresence>
            {selected && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                className="space-y-2">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  {selectedEvents.length ? `${selectedEvents.length} event(s) on ${MONTHS[current.month]} ${selected}` : `No events on ${MONTHS[current.month]} ${selected}`}
                </p>
                {selectedEvents.map(e => (
                  <div key={e.id} className={`flex items-start gap-3 p-3 rounded-2xl border ${EVENT_COLORS[e.type].light}`}>
                    <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${EVENT_COLORS[e.type].bg}`}>
                      {e.type === 'surgery' ? <Scissors size={13} className="text-white" /> :
                       e.type === 'upcoming' ? <Clock size={13} className="text-white" /> :
                       <Calendar size={13} className="text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-black ${EVENT_COLORS[e.type].text}`}>{e.title}</p>
                      <p className="text-[10px] font-bold text-slate-400">{e.time}{e.note ? ` • ${e.note}` : ''}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100">
            {Object.entries(EVENT_COLORS).map(([type, c]) => (
              <div key={type} className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${c.dot}`} />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest capitalize">{type}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add Event Modal */}
      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
              <div className="px-6 pt-5 pb-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${EVENT_COLORS[modal.type].bg}`}>
                    {modal.type === 'surgery' ? <Scissors size={13} className="text-white" /> :
                     modal.type === 'upcoming' ? <Clock size={13} className="text-white" /> :
                     <Calendar size={13} className="text-white" />}
                  </div>
                  <p className="text-sm font-black text-slate-900">
                    {modal.type === 'surgery' ? 'Schedule Procedure' : 'Next Appointment'}
                  </p>
                </div>
                <button onClick={() => setModal(null)}
                  className="h-8 w-8 flex items-center justify-center rounded-xl bg-white text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all border border-slate-200">
                  <X size={14} />
                </button>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Date</label>
                  <input type="date" value={form.date} min={new Date().toISOString().split('T')[0]} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-400 bg-slate-50" />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Time</label>
                  <input type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-400 bg-slate-50" />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Note (optional)</label>
                  <input type="text" value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
                    placeholder="Add a note..."
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-400 bg-slate-50" />
                </div>
                <button onClick={handleSave}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest transition-all ${EVENT_COLORS[modal.type].bg} hover:opacity-90`}>
                  <Check size={13} /> Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function DoctorPatientModal({ patient, onClose, onBookSurgery }) {
  const [activeTab,   setActiveTab]   = useState('overview')
  const [viewReport,  setViewReport]  = useState(null)
  const [bills,       setBills]       = useState([])
  const [billsLoading, setBillsLoading] = useState(false)
  const [billsError,  setBillsError]  = useState('')

  useEffect(() => {
    if (activeTab !== 'billing' || !patient._id) return
    setBillsLoading(true)
    setBillsError('')
    getBillsByPatient(patient._id)
      .then(data => setBills(Array.isArray(data) ? data : []))
      .catch(() => setBillsError('Failed to load billing records'))
      .finally(() => setBillsLoading(false))
  }, [activeTab, patient._id])

  return (
    <>
      {/* Main Modal */}
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
                <div className="h-14 w-14 rounded-2xl bg-blue-500 text-white flex items-center justify-center text-2xl font-black shadow-md shrink-0">
                  {patient.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">{patient.name}</h2>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{patient.email || 'No Email'}</span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                      <Droplets size={10} className="text-rose-400" />{patient.blood}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${patient.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                      {patient.status}
                    </span>
                    {patient.nextVisit && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border bg-purple-50 text-purple-600 border-purple-100">
                        <Calendar size={9} /> Next: {patient.nextVisit}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button onClick={onClose}
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-white text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all border border-slate-200 shrink-0">
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto">
              {TABS.map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-[10px] font-black uppercase tracking-widest border-b-2 whitespace-nowrap transition-all ${
                    activeTab === tab.key ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}>
                  <tab.icon size={12} />{tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto px-8 py-6">

            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Age',    value: `${patient.age || '—'} yrs` },
                    { label: 'Gender', value: patient.gender || '—'        },
                    { label: 'Blood',  value: patient.bloodGroup || '—'    },
                    { label: 'Visits', value: patient.totalVisits || '—'   },
                  ].map((item, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                      <p className="text-sm font-black text-slate-900">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Quick Vitals in Overview (Height & Weight only) */}
                {(patient.vitals?.height || patient.vitals?.weight) && (
                   <div className="grid grid-cols-2 gap-4 max-w-sm">
                      {patient.vitals.height ? (
                        <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-center gap-3">
                           <div className="h-8 w-8 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-sm"><Activity size={14} /></div>
                           <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Height</p>
                              <p className="text-sm font-black text-slate-900">{patient.vitals.height} cm</p>
                           </div>
                        </div>
                      ) : null}
                      {patient.vitals.weight ? (
                        <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-100 flex items-center gap-3">
                           <div className="h-8 w-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-sm"><Activity size={14} /></div>
                           <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Weight</p>
                              <p className="text-sm font-black text-slate-900">{patient.vitals.weight} kg</p>
                           </div>
                        </div>
                      ) : null}
                   </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Phone size={12} className="text-slate-400" />
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Phone</p>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{patient.contact || patient.phone || '—'}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Mail size={12} className="text-slate-400" />
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email</p>
                    </div>
                    <p className="text-sm font-bold text-slate-900 lowercase">{patient.email || patient.userId?.email || '—'}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin size={12} className="text-slate-400" />
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Address</p>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{patient.address || '—'}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar size={12} className="text-purple-400" />
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Last Visit</p>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{patient.lastVisit}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={12} className="text-rose-500" />
                    <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Medical History / Known Allergies</p>
                  </div>
                  <p className="text-sm font-bold text-rose-900 leading-relaxed">
                    {patient.medicalHistory || 'No known conditions or allergies recorded.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                  <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">Current Condition</p>
                  <p className="text-sm font-black text-blue-900">{patient.status}</p>
                </div>
              </div>
            )}

            {/* REPORTS */}
            {activeTab === 'reports' && (
              <ReportsTab patient={patient} />
            )}

            {/* PRESCRIPTION */}
            {activeTab === 'prescription' && (
              <PrescriptionTab patient={patient} />
            )}

            {/* VITALS */}
            {activeTab === 'vitals' && (() => {
              const v = patient.vitals || {}
              const rows = [
                { label: 'Height', value: v.height, unit: 'cm', icon: <Activity size={14} />, color: 'bg-blue-500' },
                { label: 'Weight', value: v.weight, unit: 'kg', icon: <Activity size={14} />, color: 'bg-orange-500' },
              ].filter(r => r.value && r.value !== 0)

              return (
                <div className="space-y-6">
                  {rows.length === 0 ? (
                    <div className="py-20 text-center space-y-3">
                       <Activity className="h-10 w-10 text-slate-200 mx-auto" />
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No clinical vitals recorded yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
                      {rows.map((row, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                          className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center">
                          <div className={`h-14 w-14 rounded-3xl ${row.color} text-white flex items-center justify-center mb-4 shadow-lg shadow-black/5`}>
                             {row.icon}
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{row.label}</p>
                          <p className="text-2xl font-black text-slate-900">{row.value} <span className="text-xs text-slate-400 font-bold ml-1">{row.unit}</span></p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })()}

            {/* CALENDAR */}
            {activeTab === 'calendar' && (
              <CalendarTab
                events={(patient.appointments || []).map(a => ({
                  id:    a._id,
                  date:  new Date(a.date).toISOString().slice(0, 10),
                  type:  a.status === 'Completed' ? 'followup' : 'appointment',
                  title: `${a.patient} — ${a.type}`,
                  time:  a.time,
                  note:  a.reason,
                }))
                }
                patient={patient}
                onBookSurgery={(ev) => onBookSurgery && onBookSurgery({ ...ev, patient: patient.name })}
              />
            )}

            {/* BILLING */}
            {activeTab === 'billing' && (
              <div className="space-y-3">
                {billsLoading ? (
                  <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
                    <Loader2 size={18} className="animate-spin" />
                    <span className="text-xs font-bold">Loading billing records...</span>
                  </div>
                ) : billsError ? (
                  <div className="flex items-center justify-center py-16 gap-2 text-rose-400">
                    <AlertTriangle size={16} />
                    <span className="text-xs font-bold">{billsError}</span>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {[
                        {
                          label: 'Total Paid',
                          value: bills.filter(b => b.paymentStatus === 'Paid' || b.status === 'Paid').length,
                          cls: 'bg-emerald-50 border-emerald-100 text-emerald-600',
                        },
                        {
                          label: 'Pending / Overdue',
                          value: bills.filter(b => b.paymentStatus !== 'Paid' && b.status !== 'Paid').length,
                          cls: 'bg-rose-50 border-rose-100 text-rose-500',
                        },
                      ].map((s, i) => (
                        <div key={i} className={`p-4 rounded-2xl border text-center ${s.cls}`}>
                          <p className="text-2xl font-black">{s.value}</p>
                          <p className="text-[9px] font-black uppercase tracking-widest mt-1 opacity-70">{s.label}</p>
                        </div>
                      ))}
                    </div>

                    {bills.length === 0 ? (
                      <div className="py-10 text-center text-xs font-bold text-slate-400">No billing records found for this patient.</div>
                    ) : bills.map((b, i) => {
                      const status    = b.paymentStatus || b.status || 'Pending'
                      const statusCls = BILL_COLORS[status] || BILL_COLORS['Pending']
                      const desc      = b.service || b.type || 'Consultation'
                      const date      = b.date ? new Date(b.date).toLocaleDateString('en-IN') : '—'
                      const amount    = `₹${Number(b.amount || 0).toLocaleString('en-IN')}`
                      return (
                        <motion.div key={b._id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                          className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-100 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                              <DollarSign size={16} className="text-slate-400" />
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900">{desc}</p>
                              <p className="text-[10px] font-bold text-slate-400">
                                {b._id?.slice(-6).toUpperCase()} • {date}
                                {b.paymentMethod ? ` • ${b.paymentMethod}` : ''}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <p className="text-sm font-black text-slate-900">{amount}</p>
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusCls}`}>
                              {status}
                            </span>
                          </div>
                        </motion.div>
                      )
                    })}
                  </>
                )}
              </div>
            )}

          </div>
        </motion.div>
      </div>
    </>
  )
}

export default DoctorPatientModal
