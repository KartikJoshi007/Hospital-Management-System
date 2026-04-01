import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Plus, X, CreditCard, TrendingUp, AlertCircle, Download } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const initialBills = [
  { id: 'B-001', patient: 'Rohan Sharma', amount: 4500, type: 'OPD', date: '2024-06-10', status: 'Paid' },
  { id: 'B-002', patient: 'Priya Verma', amount: 18000, type: 'IPD', date: '2024-06-11', status: 'Pending' },
  { id: 'B-003', patient: 'Amit Patel', amount: 2200, type: 'Lab', date: '2024-06-09', status: 'Paid' },
  { id: 'B-004', patient: 'Sara Khan', amount: 1500, type: 'Pharmacy', date: '2024-06-12', status: 'Pending' },
  { id: 'B-005', patient: 'Vikram Singh', amount: 32000, type: 'IPD', date: '2024-06-08', status: 'Paid' },
]

const revenueByMonth = [
  { month: 'Jan', revenue: 120000 },
  { month: 'Feb', revenue: 98000 },
  { month: 'Mar', revenue: 145000 },
  { month: 'Apr', revenue: 132000 },
  { month: 'May', revenue: 178000 },
  { month: 'Jun', revenue: 162000 },
]

const STATUS_COLORS = {
  Paid: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  Pending: 'bg-orange-50 text-orange-600 border-orange-100',
  Overdue: 'bg-rose-50 text-rose-500 border-rose-100',
}

const emptyBill = { patient: '', amount: '', type: 'OPD', date: '', status: 'Pending' }

function RevenueDashboard() {
  const [bills, setBills] = useState(initialBills)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState(emptyBill)
  const [statusFilter, setStatusFilter] = useState('')
  const [message, setMessage] = useState('')

  const filtered = useMemo(() => bills.filter(b => statusFilter ? b.status === statusFilter : true), [bills, statusFilter])

  const totalRevenue = bills.filter(b => b.status === 'Paid').reduce((sum, b) => sum + b.amount, 0)
  const totalPending = bills.filter(b => b.status === 'Pending').reduce((sum, b) => sum + b.amount, 0)
  const totalBills = bills.length

  const handleGenerate = (e) => {
    e.preventDefault()
    setBills(prev => [...prev, { ...formData, id: `B-00${prev.length + 1}`, amount: Number(formData.amount) }])
    setMessage('Bill generated successfully')
    setIsFormOpen(false)
    setFormData(emptyBill)
    setTimeout(() => setMessage(''), 3000)
  }

  const markPaid = (id) => {
    setBills(prev => prev.map(b => b.id === id ? { ...b, status: 'Paid' } : b))
    setMessage('Payment marked as received')
    setTimeout(() => setMessage(''), 3000)
  }

  const downloadBill = (b) => {
    const content = [
      '========================================',
      '         HOSPITAL MANAGEMENT SYSTEM     ',
      '              BILL RECEIPT              ',
      '========================================',
      `Bill ID     : ${b.id}`,
      `Patient     : ${b.patient}`,
      `Bill Type   : ${b.type}`,
      `Amount      : \u20B9${b.amount.toLocaleString()}`,
      `Date        : ${b.date}`,
      `Status      : ${b.status}`,
      '========================================',
      '     Thank you for choosing our care    ',
      '========================================',
    ].join('\n')

    const blob = new Blob([content], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `Bill-${b.id}-${b.patient.replace(/\s+/g, '-')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadAllBills = () => {
    const rows = [
      ['Bill ID', 'Patient', 'Type', 'Amount (\u20B9)', 'Date', 'Status'].join(','),
      ...filtered.map(b => [b.id, b.patient, b.type, b.amount, b.date, b.status].join(','))
    ].join('\n')

    const blob = new Blob([rows], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `HMS-Bills-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 border-l-4 border-emerald-500 pl-4">Billing & Finance</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 pl-5">Generate bills, track payments & view revenue</p>
        </div>
        <button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl hover:bg-emerald-500 transition-all font-black text-xs uppercase tracking-widest shadow-lg">
          <Plus size={16} /> Generate Bill
        </button>
      </div>

      {message && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="px-5 py-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-xs font-black text-emerald-700">
          ✓ {message}
        </motion.div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Total Revenue', value: `₹${(totalRevenue / 1000).toFixed(1)}K`, icon: TrendingUp, color: 'emerald' },
          { label: 'Pending Amount', value: `₹${(totalPending / 1000).toFixed(1)}K`, icon: AlertCircle, color: 'orange' },
          { label: 'Total Bills', value: totalBills, icon: CreditCard, color: 'blue' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-slate-50 text-slate-600"><s.icon size={20} /></div>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{s.label}</p>
            <h3 className="text-2xl font-black text-slate-900">{s.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div className="mb-6">
          <h3 className="text-sm font-black text-slate-900 border-l-4 border-emerald-500 pl-3 uppercase tracking-widest">Monthly Revenue</h3>
          <p className="text-xs font-bold text-slate-400 pl-4 mt-0.5">Revenue trend over 6 months</p>
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueByMonth} barSize={32}>
              <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v / 1000}K`} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '11px', fontWeight: 700 }} formatter={v => [`₹${v.toLocaleString()}`, 'Revenue']} cursor={{ fill: '#f1f5f9' }} />
              <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filter + Bills Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50">
        <div className="flex items-center gap-3">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">All Bills</h3>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5">{filtered.length} records</p>
          </div>
          <div className="flex items-center gap-3">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-emerald-400 transition-all appearance-none">
              <option value="">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </select>
            <button
              onClick={downloadAllBills}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-sm"
            >
              <Download size={13} /> Export CSV
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50">
                {['Bill ID', 'Patient', 'Type', 'Amount', 'Date', 'Status', 'Action', 'Download'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((b, idx) => (
                <motion.tr key={b.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}
                  className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3 text-xs font-black text-slate-500">{b.id}</td>
                  <td className="px-6 py-3 text-xs font-black text-slate-900">{b.patient}</td>
                  <td className="px-6 py-3">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 text-[9px] font-black border border-slate-100">{b.type}</span>
                  </td>
                  <td className="px-6 py-3 text-xs font-black text-slate-900">₹{b.amount.toLocaleString()}</td>
                  <td className="px-6 py-3 text-[10px] font-bold text-slate-400">{b.date}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${STATUS_COLORS[b.status]}`}>{b.status}</span>
                  </td>
                  <td className="px-6 py-3">
                    {b.status === 'Pending' && (
                      <button onClick={() => markPaid(b.id)} className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest border border-emerald-100 hover:bg-emerald-500 hover:text-white transition-all">
                        Mark Paid
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <button
                      onClick={() => downloadBill(b)}
                      title="Download bill"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 text-slate-500 text-[9px] font-black uppercase tracking-widest border border-slate-200 hover:bg-slate-900 hover:text-white transition-all"
                    >
                      <Download size={11} /> Download
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Bill Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Generate Bill</h3>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-0.5">Create a new patient bill</p>
                </div>
                <button onClick={() => setIsFormOpen(false)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all border border-slate-100"><X size={18} /></button>
              </div>
              <form onSubmit={handleGenerate} className="space-y-4">
                {[
                  { label: 'Patient Name', key: 'patient', type: 'text', placeholder: 'Full name' },
                  { label: 'Amount (₹)', key: 'amount', type: 'number', placeholder: '0' },
                  { label: 'Date', key: 'date', type: 'date', placeholder: '' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{f.label}</label>
                    <input required type={f.type} placeholder={f.placeholder} value={formData[f.key]}
                      onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-emerald-400 transition-all" />
                  </div>
                ))}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Bill Type</label>
                  <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-emerald-400 transition-all appearance-none">
                    <option value="OPD">OPD</option>
                    <option value="IPD">IPD</option>
                    <option value="Lab">Lab</option>
                    <option value="Pharmacy">Pharmacy</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 py-3 rounded-xl border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
                  <button type="submit" className="flex-1 py-3 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-500 transition-all active:scale-95">Generate</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default RevenueDashboard
