import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Eye } from 'lucide-react'
import DoctorPatientModal from './DoctorPatientModal'

const patients = [
  {
    id: 'P-001', name: 'Rohan Sharma', age: 34, gender: 'Male', blood: 'B+',
    condition: 'Hypertension', lastVisit: '2024-06-10', totalVisits: 8, status: 'Active',
    phone: '+91 98765 43210', vitals: { bp: '140/90', temp: '98.6°F', pulse: '82 bpm', spo2: '97%' },
    notes: 'Patient on antihypertensive medication. Monitor BP weekly.',
  },
  {
    id: 'P-002', name: 'Priya Verma', age: 28, gender: 'Female', blood: 'O+',
    condition: 'Migraine', lastVisit: '2024-06-11', totalVisits: 4, status: 'Active',
    phone: '+91 91234 56789', vitals: { bp: '110/70', temp: '98.4°F', pulse: '74 bpm', spo2: '99%' },
    notes: 'Recurring migraines. Prescribed sumatriptan. Avoid triggers.',
  },
  {
    id: 'P-003', name: 'Amit Patel', age: 45, gender: 'Male', blood: 'A+',
    condition: 'Diabetes', lastVisit: '2024-06-09', totalVisits: 12, status: 'Active',
    phone: '+91 99887 76655', vitals: { bp: '130/85', temp: '98.7°F', pulse: '78 bpm', spo2: '96%' },
    notes: 'Type 2 diabetes. HbA1c: 7.2%. Diet control and metformin.',
  },
  {
    id: 'P-004', name: 'Sara Khan', age: 31, gender: 'Female', blood: 'AB-',
    condition: 'Asthma', lastVisit: '2024-06-12', totalVisits: 6, status: 'Active',
    phone: '+91 88776 65544', vitals: { bp: '118/76', temp: '98.5°F', pulse: '80 bpm', spo2: '95%' },
    notes: 'Mild persistent asthma. Using salbutamol inhaler as needed.',
  },
  {
    id: 'P-005', name: 'Vikram Singh', age: 52, gender: 'Male', blood: 'O-',
    condition: 'Arthritis', lastVisit: '2024-06-08', totalVisits: 9, status: 'Admitted',
    phone: '+91 77665 54433', vitals: { bp: '135/88', temp: '99.1°F', pulse: '88 bpm', spo2: '97%' },
    notes: 'Rheumatoid arthritis. On DMARDs. Joint pain management ongoing.',
  },
]

const STATUS_COLORS = {
  Active:   'bg-emerald-50 text-emerald-600 border-emerald-100',
  Admitted: 'bg-blue-50 text-blue-600 border-blue-100',
}

function PatientDetails() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [selected, setSelected] = useState(null)

  const filtered = useMemo(() => patients.filter(p => {
    const bySearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase())
    const byStatus = status ? p.status === status : true
    return bySearch && byStatus
  }), [search, status])

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">

      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">My Patients</h1>
        <p className="text-slate-500 font-medium text-sm mt-1">Patients currently under your care.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search patient or ID..."
            className="pl-8 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none focus:border-blue-400 transition-all w-56" />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none focus:border-blue-400 transition-all appearance-none min-w-32">
          <option value="">All Status</option>
          <option>Active</option>
          <option>Admitted</option>
        </select>
        {(search || status) && (
          <button onClick={() => { setSearch(''); setStatus('') }}
            className="px-4 py-2 rounded-xl bg-rose-50 text-rose-500 text-xs font-black uppercase tracking-widest border border-rose-100 hover:bg-rose-500 hover:text-white transition-all">
            Clear
          </button>
        )}
        <span className="ml-auto text-[10px] font-black text-slate-400 uppercase tracking-widest">{filtered.length} patients</span>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50">
                {['Patient', 'Age', 'Gender', 'Blood Group', 'Condition', 'Last Visit', 'Visits', 'Phone', 'Status', 'Action'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={10} className="px-6 py-10 text-center text-xs font-bold text-slate-400">No patients found</td></tr>
              ) : filtered.map((p, idx) => (
                <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.04 }}
                  className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div onClick={() => setSelected(p)}
                        className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center text-xs font-black group-hover:bg-blue-500 group-hover:text-white transition-colors shrink-0 cursor-pointer">
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900 whitespace-nowrap">{p.name}</p>
                        <p className="text-[9px] font-bold text-slate-400">{p.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-xs font-bold text-slate-600">{p.age} yrs</td>
                  <td className="px-6 py-3 text-xs font-bold text-slate-600">{p.gender}</td>
                  <td className="px-6 py-3">
                    <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-500 text-[9px] font-black uppercase tracking-wider border border-rose-100">{p.blood}</span>
                  </td>
                  <td className="px-6 py-3 text-xs font-bold text-slate-600 whitespace-nowrap">{p.condition}</td>
                  <td className="px-6 py-3 text-xs font-bold text-slate-600 whitespace-nowrap">{p.lastVisit}</td>
                  <td className="px-6 py-3 text-xs font-bold text-slate-600 text-center">{p.totalVisits}</td>
                  <td className="px-6 py-3 text-xs font-bold text-slate-600 whitespace-nowrap">{p.phone}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${STATUS_COLORS[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <button onClick={() => setSelected(p)}
                      className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-500 transition-colors border border-slate-100 hover:border-blue-100">
                      <Eye size={14} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AnimatePresence>
        {selected && <DoctorPatientModal patient={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>

    </div>
  )
}

export default PatientDetails
