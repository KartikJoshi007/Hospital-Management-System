import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Download, Eye, X, FileText, Activity, Pill, FlaskConical, ImageIcon } from 'lucide-react'

const records = [
  {
    id: 'R-001', patient: 'Rohan Sharma',  age: 34, gender: 'Male',   blood: 'B+',  type: 'Prescription',  date: '2024-06-10', diagnosis: 'Hypertension',        status: 'Final',
    vitals: { bp: '140/90', temp: '98.6°F', pulse: '82 bpm', spo2: '97%' },
    medications: ['Amlodipine 5mg – once daily', 'Telmisartan 40mg – once daily'],
    notes: 'Patient on antihypertensive medication. Monitor BP weekly. Reduce sodium intake.',
    followUp: '2024-07-10', doctor: 'Dr. Arjun Mehta',
  },
  {
    id: 'R-002', patient: 'Priya Verma',   age: 28, gender: 'Female', blood: 'O+',  type: 'Lab Report',    date: '2024-06-11', diagnosis: 'Migraine',             status: 'Final',
    vitals: { bp: '110/70', temp: '98.4°F', pulse: '74 bpm', spo2: '99%' },
    medications: ['Sumatriptan 50mg – as needed', 'Ibuprofen 400mg – as needed'],
    notes: 'Recurring migraines. Avoid known triggers (bright light, stress). Hydration advised.',
    followUp: '2024-07-11', doctor: 'Dr. Arjun Mehta',
  },
  {
    id: 'R-003', patient: 'Amit Patel',    age: 45, gender: 'Male',   blood: 'A+',  type: 'Prescription',  date: '2024-06-09', diagnosis: 'Diabetes Type 2',      status: 'Final',
    vitals: { bp: '130/85', temp: '98.7°F', pulse: '78 bpm', spo2: '96%' },
    medications: ['Metformin 500mg – twice daily', 'Glimepiride 1mg – once daily'],
    notes: 'Type 2 diabetes. HbA1c: 7.2%. Strict diet control. Avoid sugar-rich foods.',
    followUp: '2024-07-09', doctor: 'Dr. Arjun Mehta',
  },
  {
    id: 'R-004', patient: 'Sara Khan',     age: 31, gender: 'Female', blood: 'AB-', type: 'Discharge Note', date: '2024-06-12', diagnosis: 'Asthma',               status: 'Draft',
    vitals: { bp: '118/76', temp: '98.5°F', pulse: '80 bpm', spo2: '95%' },
    medications: ['Salbutamol inhaler – as needed', 'Budesonide inhaler – twice daily'],
    notes: 'Mild persistent asthma. Avoid allergens and cold air. Carry rescue inhaler at all times.',
    followUp: '2024-07-12', doctor: 'Dr. Arjun Mehta',
  },
  {
    id: 'R-005', patient: 'Vikram Singh',  age: 52, gender: 'Male',   blood: 'O-',  type: 'Lab Report',    date: '2024-06-08', diagnosis: 'Rheumatoid Arthritis', status: 'Pending',
    vitals: { bp: '135/88', temp: '99.1°F', pulse: '88 bpm', spo2: '97%' },
    medications: ['Methotrexate 10mg – weekly', 'Folic acid 5mg – daily'],
    notes: 'Rheumatoid arthritis. On DMARDs. Joint pain management ongoing. ESR elevated.',
    followUp: '2024-07-08', doctor: 'Dr. Arjun Mehta',
  },
  {
    id: 'R-006', patient: 'Neha Gupta',   age: 26, gender: 'Female', blood: 'A-',  type: 'Prescription',  date: '2024-06-07', diagnosis: 'Sinusitis',            status: 'Final',
    vitals: { bp: '112/72', temp: '99.0°F', pulse: '76 bpm', spo2: '98%' },
    medications: ['Amoxicillin 500mg – thrice daily x 7 days', 'Cetirizine 10mg – once daily'],
    notes: 'Acute sinusitis. Steam inhalation advised. Avoid cold beverages.',
    followUp: '2024-07-07', doctor: 'Dr. Arjun Mehta',
  },
  {
    id: 'R-007', patient: 'Ravi Desai',   age: 41, gender: 'Male',   blood: 'B-',  type: 'Imaging',       date: '2024-06-06', diagnosis: 'Lumbar Spondylosis',   status: 'Pending',
    vitals: { bp: '128/82', temp: '98.6°F', pulse: '80 bpm', spo2: '98%' },
    medications: ['Diclofenac 50mg – twice daily', 'Pantoprazole 40mg – once daily'],
    notes: 'MRI shows L4-L5 disc bulge. Physiotherapy recommended. Avoid heavy lifting.',
    followUp: '2024-07-06', doctor: 'Dr. Arjun Mehta',
  },
  {
    id: 'R-008', patient: 'Meena Joshi',  age: 55, gender: 'Female', blood: 'AB+', type: 'Discharge Note', date: '2024-06-05', diagnosis: 'Hypothyroidism',       status: 'Draft',
    vitals: { bp: '122/78', temp: '97.8°F', pulse: '62 bpm', spo2: '98%' },
    medications: ['Levothyroxine 50mcg – once daily (empty stomach)'],
    notes: 'TSH: 8.2 mIU/L. Levothyroxine initiated. Recheck TSH after 6 weeks.',
    followUp: '2024-07-05', doctor: 'Dr. Arjun Mehta',
  },
]

const STATUS_COLORS = {
  Final:   'bg-emerald-50 text-emerald-600 border-emerald-100',
  Draft:   'bg-orange-50 text-orange-600 border-orange-100',
  Pending: 'bg-blue-50 text-blue-600 border-blue-100',
}

const TYPE_ICONS = {
  'Prescription':   { label: 'Rx',  icon: Pill },
  'Lab Report':     { label: 'Lab', icon: FlaskConical },
  'Discharge Note': { label: 'DC',  icon: FileText },
  'Imaging':        { label: 'IMG', icon: ImageIcon },
}

function RecordDetailPanel({ record, onClose }) {
  const TypeIcon = TYPE_ICONS[record.type]?.icon || FileText
  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed top-0 right-0 h-full w-full max-w-md bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/60">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <TypeIcon size={16} />
          </div>
          <div>
            <p className="text-sm font-black text-slate-900">{record.id}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{record.type}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

        {/* Patient Info */}
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-blue-500 text-white flex items-center justify-center text-sm font-black shrink-0">
            {record.patient.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-black text-slate-900">{record.patient}</p>
            <p className="text-[10px] font-bold text-slate-500">{record.age} yrs · {record.gender} · Blood: {record.blood}</p>
          </div>
          <span className={`ml-auto px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${STATUS_COLORS[record.status]}`}>
            {record.status}
          </span>
        </div>

        {/* Diagnosis & Date */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Diagnosis</p>
            <p className="text-xs font-black text-slate-900">{record.diagnosis}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</p>
            <p className="text-xs font-black text-slate-900">{record.date}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Follow-up</p>
            <p className="text-xs font-black text-slate-900">{record.followUp}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Doctor</p>
            <p className="text-xs font-black text-slate-900">{record.doctor}</p>
          </div>
        </div>

        {/* Vitals */}
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <Activity size={10} /> Vitals
          </p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(record.vitals).map(([k, v]) => (
              <div key={k} className="p-3 rounded-xl bg-white border border-slate-100 shadow-sm">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{k === 'bp' ? 'Blood Pressure' : k === 'spo2' ? 'SpO₂' : k === 'temp' ? 'Temperature' : 'Pulse'}</p>
                <p className="text-sm font-black text-slate-900 mt-0.5">{v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Medications */}
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <Pill size={10} /> Medications
          </p>
          <div className="space-y-2">
            {record.medications.map((m, i) => (
              <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <span className="h-4 w-4 rounded-full bg-emerald-500 text-white text-[8px] font-black flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                <p className="text-xs font-bold text-emerald-800">{m}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Clinical Notes</p>
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
            <p className="text-xs font-bold text-amber-900 leading-relaxed">{record.notes}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-100 flex gap-2">
        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-500 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-colors">
          <Download size={13} /> Download
        </button>
        <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-colors">
          Close
        </button>
      </div>
    </motion.div>
  )
}

function MedicalRecords() {
  const [search, setSearch]     = useState('')
  const [type, setType]         = useState('')
  const [status, setStatus]     = useState('')
  const [selected, setSelected] = useState(null)

  const filtered = useMemo(() => records.filter(r => {
    const bySearch = r.patient.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase())
    const byType   = type   ? r.type   === type   : true
    const byStatus = status ? r.status === status : true
    return bySearch && byType && byStatus
  }), [search, type, status])

  const counts = useMemo(() => ({
    total:   records.length,
    final:   records.filter(r => r.status === 'Final').length,
    pending: records.filter(r => r.status === 'Pending').length,
    draft:   records.filter(r => r.status === 'Draft').length,
  }), [])

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">

      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Medical Records</h1>
        <p className="text-slate-500 font-medium text-sm mt-1">Patient medical records and complete history.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Records', value: counts.total,   color: 'bg-blue-50 text-blue-600 border-blue-100'          },
          { label: 'Finalized',     value: counts.final,   color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
          { label: 'Pending',       value: counts.pending, color: 'bg-blue-50 text-blue-600 border-blue-100'          },
          { label: 'Draft',         value: counts.draft,   color: 'bg-orange-50 text-orange-600 border-orange-100'    },
        ].map((c, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className={`p-4 rounded-2xl border ${c.color} flex flex-col gap-1`}>
            <p className="text-[9px] font-black uppercase tracking-widest opacity-70">{c.label}</p>
            <p className="text-2xl font-black">{c.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search patient or ID..."
            className="pl-8 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none focus:border-blue-400 transition-all w-56" />
        </div>
        <div className="relative">
          <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select value={type} onChange={e => setType(e.target.value)}
            className="pl-8 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none focus:border-blue-400 transition-all appearance-none min-w-36">
            <option value="">All Types</option>
            <option>Prescription</option>
            <option>Lab Report</option>
            <option>Discharge Note</option>
            <option>Imaging</option>
          </select>
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none focus:border-blue-400 transition-all appearance-none min-w-32">
          <option value="">All Status</option>
          <option>Final</option>
          <option>Pending</option>
          <option>Draft</option>
        </select>
        {(search || type || status) && (
          <button onClick={() => { setSearch(''); setType(''); setStatus('') }}
            className="px-4 py-2 rounded-xl bg-rose-50 text-rose-500 text-xs font-black uppercase tracking-widest border border-rose-100 hover:bg-rose-500 hover:text-white transition-all">
            Clear
          </button>
        )}
        <span className="ml-auto text-[10px] font-black text-slate-400 uppercase tracking-widest">{filtered.length} records</span>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50">
                {['Record', 'Patient', 'Diagnosis', 'Date', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-xs font-bold text-slate-400">No records found</td></tr>
              ) : filtered.map(r => {
                const TIcon = TYPE_ICONS[r.type]?.icon || FileText
                return (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => setSelected(r)}>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                          <TIcon size={13} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900">{r.id}</p>
                          <p className="text-[9px] font-bold text-slate-400">{r.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <p className="text-xs font-black text-slate-900">{r.patient}</p>
                      <p className="text-[9px] font-bold text-slate-400">{r.age} yrs</p>
                    </td>
                    <td className="px-6 py-3 text-xs font-bold text-slate-600">{r.diagnosis}</td>
                    <td className="px-6 py-3 text-[10px] font-bold text-slate-400">{r.date}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${STATUS_COLORS[r.status]}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <button onClick={e => { e.stopPropagation(); setSelected(r) }}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-500 transition-colors border border-slate-100 hover:border-blue-100">
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Backdrop */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setSelected(null)} />
            <RecordDetailPanel record={selected} onClose={() => setSelected(null)} />
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MedicalRecords
