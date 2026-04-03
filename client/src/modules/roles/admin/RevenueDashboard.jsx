import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Plus, X, TrendingDown, Wrench } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const initialExpenses = [
  { id: 'E-001', item: 'MRI Machine',         category: 'Machine',   amount: 2500000, date: '2024-05-15' },
  { id: 'E-002', item: 'Surgical Tools Set',  category: 'Equipment', amount: 85000,   date: '2024-05-28' },
  { id: 'E-003', item: 'X-Ray Machine',       category: 'Machine',   amount: 750000,  date: '2024-06-02' },
  { id: 'E-004', item: 'Hospital Beds (10)',  category: 'Furniture',  amount: 120000,  date: '2024-06-05' },
  { id: 'E-005', item: 'Lab Equipment',       category: 'Equipment', amount: 340000,  date: '2024-06-08' },
]

const chartData = {
  day: [
    { label: '6AM',  amount: 0       },
    { label: '9AM',  amount: 85000   },
    { label: '12PM', amount: 120000  },
    { label: '3PM',  amount: 340000  },
    { label: '6PM',  amount: 0       },
    { label: '9PM',  amount: 0       },
  ],
  week: [
    { label: 'Mon', amount: 120000  },
    { label: 'Tue', amount: 0       },
    { label: 'Wed', amount: 340000  },
    { label: 'Thu', amount: 85000   },
    { label: 'Fri', amount: 750000  },
    { label: 'Sat', amount: 0       },
    { label: 'Sun', amount: 0       },
  ],
  month: [
    { label: 'W1', amount: 835000   },
    { label: 'W2', amount: 1210000  },
    { label: 'W3', amount: 420000   },
    { label: 'W4', amount: 120000   },
  ],
  year: [
    { label: 'Jan', amount: 320000  },
    { label: 'Feb', amount: 150000  },
    { label: 'Mar', amount: 890000  },
    { label: 'Apr', amount: 420000  },
    { label: 'May', amount: 2585000 },
    { label: 'Jun', amount: 1210000 },
    { label: 'Jul', amount: 480000  },
    { label: 'Aug', amount: 310000  },
    { label: 'Sep', amount: 720000  },
    { label: 'Oct', amount: 540000  },
    { label: 'Nov', amount: 390000  },
    { label: 'Dec', amount: 260000  },
  ],
}

const CHART_TABS = [
  { key: 'day',   label: 'Day'   },
  { key: 'week',  label: 'Week'  },
  { key: 'month', label: 'Month' },
  { key: 'year',  label: 'Year'  },
]

const CATEGORY_COLORS = {
  Machine:   'bg-purple-50 text-purple-600 border-purple-100',
  Equipment: 'bg-blue-50 text-blue-600 border-blue-100',
  Furniture: 'bg-amber-50 text-amber-600 border-amber-100',
  Other:     'bg-slate-50 text-slate-600 border-slate-100',
}

const emptyExpense = { item: '', category: 'Machine', amount: '', date: '' }

function RevenueDashboard() {
  const [expenses, setExpenses]         = useState(initialExpenses)
  const [isExpenseOpen, setIsExpenseOpen] = useState(false)
  const [expenseForm, setExpenseForm]   = useState(emptyExpense)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [chartTab, setChartTab]             = useState('year')
  const [message, setMessage]               = useState('')

  const filtered      = expenses.filter(e => categoryFilter ? e.category === categoryFilter : true)
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

  const notify = (text) => { setMessage(text); setTimeout(() => setMessage(''), 3000) }

  const handleAddExpense = (e) => {
    e.preventDefault()
    setExpenses(prev => [...prev, { ...expenseForm, id: `E-00${prev.length + 1}`, amount: Number(expenseForm.amount) }])
    notify('Expense recorded successfully')
    setIsExpenseOpen(false)
    setExpenseForm(emptyExpense)
  }

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 border-l-4 border-emerald-500 pl-4">Billing & Finance</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 pl-5">Track hospital equipment & machine expenses</p>
        </div>
        <button onClick={() => setIsExpenseOpen(true)} className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl hover:bg-emerald-500 transition-all font-black text-xs uppercase tracking-widest shadow-lg">
          <Plus size={16} /> Add Expense
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
          { label: 'Total Expenses',      value: `₹${(totalExpenses / 100000).toFixed(1)}L`, icon: TrendingDown, bg: 'bg-emerald-50', color: 'text-emerald-500' },
          { label: 'This Month',          value: `₹${(expenses.filter(e => e.date.startsWith('2024-06')).reduce((s, e) => s + e.amount, 0) / 100000).toFixed(1)}L`, icon: Wrench, bg: 'bg-emerald-50', color: 'text-emerald-500' },
          { label: 'Total Items Purchased', value: expenses.length, icon: Wrench, bg: 'bg-emerald-50', color: 'text-emerald-500' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <div className={`p-3 rounded-xl ${s.bg} w-fit mb-4`}><s.icon size={20} className={s.color} /></div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{s.label}</p>
            <h3 className="text-2xl font-black text-slate-900">{s.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-black text-slate-900 border-l-4 border-emerald-500 pl-3 uppercase tracking-widest">Expenses Overview</h3>
            <p className="text-xs font-bold text-slate-400 pl-4 mt-0.5">Hospital spending trend</p>
          </div>
          <div className="flex gap-1">
            {CHART_TABS.map(t => (
              <button key={t.key} onClick={() => setChartTab(t.key)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  chartTab === t.key ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData[chartTab]} barSize={32}>
              <XAxis dataKey="label" tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v / 1000}K`} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '11px', fontWeight: 700 }} formatter={v => [`₹${v.toLocaleString()}`, 'Expenses']} cursor={{ fill: '#f1f5f9' }} />
              <Bar dataKey="amount" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">All Expenses</h3>
            <p className="text-[10px] font-bold text-slate-400">{filtered.length} records</p>
          </div>
          <div className="flex items-center gap-3">
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-emerald-400 transition-all appearance-none">
              <option value="">All Categories</option>
              <option>Machine</option>
              <option>Equipment</option>
              <option>Furniture</option>
              <option>Other</option>
            </select>
            <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
              <span className="text-xs font-black text-emerald-700">Total: ₹{totalExpenses.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50">
                {['Expense ID', 'Item / Description', 'Category', 'Amount', 'Date'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-xs font-bold text-slate-400">No expenses found</td></tr>
              ) : filtered.map((e, idx) => (
                <motion.tr key={e.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}
                  className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-xs font-black text-slate-500">{e.id}</td>
                  <td className="px-6 py-4 text-xs font-black text-slate-900">{e.item}</td>
                  <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-lg text-[9px] font-black border ${CATEGORY_COLORS[e.category] || CATEGORY_COLORS.Other}`}>{e.category}</span></td>
                  <td className="px-6 py-4 text-xs font-black text-emerald-600">₹{e.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-[10px] font-bold text-slate-400">{e.date}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      <AnimatePresence>
        {isExpenseOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Add Expense</h3>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-0.5">Record a hospital purchase</p>
                </div>
                <button onClick={() => setIsExpenseOpen(false)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all border border-slate-100"><X size={18} /></button>
              </div>
              <form onSubmit={handleAddExpense} className="space-y-4">
                {[
                  { label: 'Item / Description', key: 'item',   type: 'text',   placeholder: 'e.g. MRI Machine' },
                  { label: 'Amount (₹)',          key: 'amount', type: 'number', placeholder: '0' },
                  { label: 'Date',                key: 'date',   type: 'date',   placeholder: '' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{f.label}</label>
                    <input required type={f.type} placeholder={f.placeholder} value={expenseForm[f.key]}
                      onChange={e => setExpenseForm({ ...expenseForm, [f.key]: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-emerald-400 transition-all" />
                  </div>
                ))}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Category</label>
                  <select value={expenseForm.category} onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-emerald-400 transition-all appearance-none">
                    <option>Machine</option><option>Equipment</option><option>Furniture</option><option>Other</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsExpenseOpen(false)} className="flex-1 py-3 rounded-xl border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
                  <button type="submit" className="flex-1 py-3 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-500 transition-all active:scale-95">Add Expense</button>
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
