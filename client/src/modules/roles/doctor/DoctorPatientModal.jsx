import { useState } from 'react'
import { X, User, FileText, Pill, Calendar, Activity, Eye, Phone, MapPin, AlertTriangle, DollarSign, ClipboardList, Droplets, Download, Filter, Scissors, Clock, ChevronLeft, ChevronRight, Plus, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { addScheduleEvent } from './scheduleStore'
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
  Paid:   'bg-emerald-50 text-emerald-600 border-emerald-100',
  Unpaid: 'bg-rose-50 text-rose-500 border-rose-100',
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

const MOCK = {
  address:   '42, MG Road, Mumbai, Maharashtra',
  emergency: '+91 98001 11222',
  allergies: ['Penicillin', 'Dust', 'Pollen'],
  nextVisit: '2024-07-15',
  calendarEvents: [
    { id: 'E-001', date: '2024-07-15', type: 'appointment', title: 'Follow-up Consultation', time: '10:00 AM', note: 'Review HbA1c results' },
    { id: 'E-002', date: '2024-07-22', type: 'surgery',     title: 'Knee Arthroscopy',        time: '08:30 AM', note: 'Pre-op fasting required' },
    { id: 'E-003', date: '2024-07-28', type: 'upcoming',    title: 'Upcoming Appointment',    time: '11:00 AM', note: 'Routine check-up' },
    { id: 'E-004', date: '2024-08-05', type: 'followup',    title: 'Post-Surgery Follow-up',  time: '09:00 AM', note: 'Wound inspection' },
  ],
  reports: [
    {
      id: 'R-001', name: 'Blood Test Report', date: '2024-06-08', type: 'Lab', result: 'Normal',
      summary: 'Complete Blood Count within normal range.',
      findings: [
        { label: 'Hemoglobin',     value: '14.2 g/dL', status: 'Normal' },
        { label: 'WBC Count',      value: '7,200 /µL', status: 'Normal' },
        { label: 'Platelet Count', value: '2.5 L /µL', status: 'Normal' },
        { label: 'RBC Count',      value: '5.1 M/µL',  status: 'Normal' },
      ],
      doctor: 'Dr. Aryan Mehta', lab: 'Central Lab',
    },
    {
      id: 'R-002', name: 'X-Ray Chest', date: '2024-05-20', type: 'Radiology', result: 'Clear',
      summary: 'Lungs clear. No consolidation or pleural effusion.',
      findings: [
        { label: 'Lung Fields', value: 'Clear',       status: 'Normal' },
        { label: 'Heart Size',  value: 'Normal',      status: 'Normal' },
        { label: 'Pleura',      value: 'No effusion', status: 'Normal' },
        { label: 'Bones',       value: 'Intact',      status: 'Normal' },
      ],
      doctor: 'Dr. Rahul Patil', lab: 'Radiology Dept',
    },
    {
      id: 'R-003', name: 'HbA1c Test', date: '2024-06-01', type: 'Lab', result: 'High',
      summary: 'HbA1c elevated at 8.1%. Indicates poor glycemic control.',
      findings: [
        { label: 'HbA1c',           value: '8.1%',      status: 'High'   },
        { label: 'Fasting Glucose', value: '148 mg/dL', status: 'High'   },
        { label: 'Post-meal',       value: '210 mg/dL', status: 'High'   },
        { label: 'Insulin',         value: 'Normal',    status: 'Normal' },
      ],
      doctor: 'Dr. Sneha Verma', lab: 'Central Lab',
    },
  ],
  prescriptions: [
    {
      id: 'Rx-001', date: '2024-06-10', doctor: 'Dr. Aryan Mehta',
      medicines: [
        { name: 'Metformin 500mg', dose: '1 tablet',  freq: 'Twice daily', duration: '30 days', instructions: 'After meals'  },
        { name: 'Amlodipine 5mg',  dose: '1 tablet',  freq: 'Once daily',  duration: '30 days', instructions: 'Morning'      },
        { name: 'Aspirin 75mg',    dose: '1 tablet',  freq: 'Once daily',  duration: '30 days', instructions: 'After dinner' },
      ],
      notes: 'Avoid high-sodium diet. Monitor BP weekly. Follow-up in 4 weeks.',
    },
    {
      id: 'Rx-002', date: '2024-05-01', doctor: 'Dr. Sneha Verma',
      medicines: [
        { name: 'Pantoprazole 40mg', dose: '1 tablet',  freq: 'Once daily', duration: '14 days', instructions: 'Before meals' },
        { name: 'Vitamin D3 60K',    dose: '1 capsule', freq: 'Weekly',     duration: '8 weeks', instructions: 'With milk'    },
      ],
      notes: 'Increase calcium-rich food intake.',
    },
  ],
  vitals: {
    bp: '140/90 mmHg', heartRate: '82 bpm', temp: '98.6°F',
    spo2: '97%', weight: '78 kg', height: '172 cm', bmi: '26.4', lastUpdated: '2024-06-10', lastUpdatedTime: '09:45 AM',
  },
  records: [
    { id: 'R-001', type: 'Prescription',  date: '2024-06-10', diagnosis: 'Hypertension',        status: 'Final'   },
    { id: 'R-002', type: 'Lab Report',    date: '2024-06-11', diagnosis: 'Migraine',             status: 'Final'   },
    { id: 'R-003', type: 'Discharge Note',date: '2024-06-09', diagnosis: 'Diabetes Type 2',      status: 'Draft'   },
    { id: 'R-004', type: 'Imaging',       date: '2024-06-08', diagnosis: 'Rheumatoid Arthritis', status: 'Pending' },
  ],
  billing: [
    { id: 'B-001', desc: 'OPD Consultation', date: '2024-06-10', amount: '₹500',  status: 'Paid'   },
    { id: 'B-002', desc: 'Blood Test (CBC)',  date: '2024-06-08', amount: '₹800',  status: 'Paid'   },
    { id: 'B-003', desc: 'X-Ray Chest',       date: '2024-05-20', amount: '₹1200', status: 'Paid'   },
    { id: 'B-004', desc: 'HbA1c Test',        date: '2024-06-01', amount: '₹650',  status: 'Unpaid' },
    { id: 'B-005', desc: 'Follow-up Visit',   date: '2024-06-15', amount: '₹300',  status: 'Unpaid' },
  ],
}

const EMPTY_MED = { name: '', dose: '', freq: '', duration: '', instructions: '' }

function PrescriptionTab({ patient }) {
  const [prescriptions, setPrescriptions] = useState(MOCK.prescriptions)
  const [showForm, setShowForm]           = useState(false)
  const [medicines, setMedicines]         = useState([{ ...EMPTY_MED }])
  const [notes, setNotes]                 = useState('')
  const [error, setError]                 = useState('')
  const [confirmDel, setConfirmDel]       = useState(null) // rx to delete

  const updateMed = (i, field, val) =>
    setMedicines(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: val } : m))

  const addMedRow = () => setMedicines(prev => [...prev, { ...EMPTY_MED }])

  const removeMedRow = (i) => setMedicines(prev => prev.filter((_, idx) => idx !== i))

  const handleSave = () => {
    const filled = medicines.filter(m => m.name.trim())
    if (!filled.length) { setError('Add at least one medicine.'); return }
    const newRx = {
      id:       `Rx-${String(prescriptions.length + 1).padStart(3, '0')}`,
      date:     new Date().toISOString().slice(0, 10),
      doctor:   'Dr. (You)',
      medicines: filled,
      notes,
    }
    setPrescriptions(prev => [newRx, ...prev])
    setShowForm(false)
    setMedicines([{ ...EMPTY_MED }])
    setNotes('')
    setError('')
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

  const handleSave = () => {
    if (!form.date || !form.time) return
    const titles  = { surgery: 'Schedule Procedure', appointment: 'Next Appointment' }
    const typeMap  = { surgery: 'procedure', appointment: 'upcoming' }
    const timeDisp = fmt12(form.time)
    const newEvent = {
      id: `E-${Date.now()}`, date: form.date, type: modal.type,
      title: titles[modal.type], time: timeDisp, note: form.note,
    }
    setLocalEvents(prev => [...prev, newEvent])
    addScheduleEvent({
      id:    newEvent.id,
      date:  newEvent.date,
      type:  typeMap[modal.type],
      title: `${patient.name} — ${titles[modal.type]}`,
      time:  timeDisp,
      note:  form.note || patient.name,
    })
    if (modal.type === 'surgery' && onBookSurgery) {
      onBookSurgery(newEvent)
    }
    setModal(null)
    setForm({ date: '', time: '', note: '' })
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
                  <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
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
  const [activeTab, setActiveTab] = useState('overview')
  const [viewReport, setViewReport] = useState(null)

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
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{patient.id}</span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                      <Droplets size={10} className="text-rose-400" />{patient.blood}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${patient.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                      {patient.status}
                    </span>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border bg-purple-50 text-purple-600 border-purple-100">
                      <Calendar size={9} /> Next: {MOCK.nextVisit}
                    </span>
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
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Age',    value: `${patient.age} yrs` },
                    { label: 'Gender', value: patient.gender        },
                    { label: 'Blood',  value: patient.blood         },
                    { label: 'Visits', value: patient.totalVisits   },
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
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Phone</p>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{patient.phone}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin size={12} className="text-slate-400" />
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Address</p>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{MOCK.address}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Phone size={12} className="text-rose-400" />
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Emergency Contact</p>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{MOCK.emergency}</p>
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
                    <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Known Allergies</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {MOCK.allergies.map(a => (
                      <span key={a} className="px-3 py-1 rounded-full bg-white border border-rose-200 text-rose-600 text-[10px] font-black">{a}</span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                  <div className="flex items-center gap-2 mb-2">
                    <ClipboardList size={12} className="text-amber-500" />
                    <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Doctor Notes</p>
                  </div>
                  <p className="text-sm font-bold text-amber-900 leading-relaxed">{patient.notes}</p>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                  <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">Current Condition</p>
                  <p className="text-sm font-black text-blue-900">{patient.condition}</p>
                </div>
              </div>
            )}

            {/* REPORTS */}
            {activeTab === 'reports' && (
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{MOCK.reports.length} reports available</p>
                {MOCK.reports.map((r, i) => (
                  <motion.div key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-100 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
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
              </div>
            )}

            {/* PRESCRIPTION */}
            {activeTab === 'prescription' && (
              <PrescriptionTab patient={patient} />
            )}

            {/* VITALS */}
            {activeTab === 'vitals' && (
              <div className="space-y-4">
                <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <Clock size={11} />
                  Last updated: {MOCK.vitals.lastUpdated} at {MOCK.vitals.lastUpdatedTime}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Blood Pressure', value: MOCK.vitals.bp        },
                    { label: 'Heart Rate',      value: MOCK.vitals.heartRate },
                    { label: 'Temperature',     value: MOCK.vitals.temp      },
                    { label: 'SpO2',            value: MOCK.vitals.spo2      },
                    { label: 'Weight',          value: MOCK.vitals.weight    },
                    { label: 'Height',          value: MOCK.vitals.height    },
                    { label: 'BMI',             value: MOCK.vitals.bmi       },
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

            {/* CALENDAR */}
            {activeTab === 'calendar' && (
              <CalendarTab events={MOCK.calendarEvents} patient={patient} onBookSurgery={(ev) => onBookSurgery && onBookSurgery({ ...ev, patient: patient.name })} />
            )}

            {/* BILLING */}
            {activeTab === 'billing' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {[
                    { label: 'Total Paid',   value: MOCK.billing.filter(b => b.status === 'Paid').length,   cls: 'bg-emerald-50 border-emerald-100 text-emerald-600' },
                    { label: 'Total Unpaid', value: MOCK.billing.filter(b => b.status === 'Unpaid').length, cls: 'bg-rose-50 border-rose-100 text-rose-500'         },
                  ].map((s, i) => (
                    <div key={i} className={`p-4 rounded-2xl border text-center ${s.cls}`}>
                      <p className="text-2xl font-black">{s.value}</p>
                      <p className="text-[9px] font-black uppercase tracking-widest mt-1 opacity-70">{s.label}</p>
                    </div>
                  ))}
                </div>
                {MOCK.billing.map((b, i) => (
                  <motion.div key={b.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-100 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                        <DollarSign size={16} className="text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{b.desc}</p>
                        <p className="text-[10px] font-bold text-slate-400">{b.id} • {b.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <p className="text-sm font-black text-slate-900">{b.amount}</p>
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${BILL_COLORS[b.status]}`}>
                        {b.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

          </div>
        </motion.div>
      </div>

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
                  <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <FileText size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">{viewReport.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{viewReport.type} • {viewReport.date}</p>
                  </div>
                </div>
                <button onClick={() => setViewReport(null)}
                  className="h-9 w-9 flex items-center justify-center rounded-xl bg-white text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all border border-slate-200">
                  <X size={16} />
                </button>
              </div>

              <div className="px-8 py-6 space-y-5">
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                  <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1.5">Summary</p>
                  <p className="text-sm font-bold text-slate-800 leading-relaxed">{viewReport.summary}</p>
                </div>

                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Findings</p>
                  <div className="grid grid-cols-2 gap-3">
                    {viewReport.findings.map((f, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{f.label}</p>
                        <p className="text-sm font-black text-slate-900">{f.value}</p>
                        <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${RESULT_COLORS[f.status] || 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                          {f.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Reviewed By</p>
                    <p className="text-xs font-black text-slate-900 mt-0.5">{viewReport.doctor}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Lab / Dept</p>
                    <p className="text-xs font-black text-slate-900 mt-0.5">{viewReport.lab}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

export default DoctorPatientModal
