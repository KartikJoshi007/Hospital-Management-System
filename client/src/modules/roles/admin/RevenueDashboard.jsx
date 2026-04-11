import { useState, useEffect, useCallback } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Plus, X, TrendingDown, Wrench, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../../api/axios'

// ── matches Expense model enum exactly ──
const CATEGORIES = ['Machine', 'Equipment', 'Furniture', 'Medicine', 'Salary', 'Other']

const CATEGORY_COLORS = {
  Machine: 'bg-purple-50 text-purple-600 border-purple-100',
  Equipment: 'bg-blue-50 text-blue-600 border-blue-100',
  Furniture: 'bg-amber-50 text-amber-600 border-amber-100',
  Medicine: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  Salary: 'bg-rose-50 text-rose-500 border-rose-100',
  Other: 'bg-slate-50 text-slate-600 border-slate-100',
}

const EMPTY_FORM = { item: '', category: 'Machine', amount: '', date: '' }

function RevenueDashboard() {
  const [expenses, setExpenses] = useState([])
  const [stats, setStats] = useState(null)   // { total, breakdown }
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [chartTab, setChartTab] = useState('year')

  const notify = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 3500)
  }

  // ── GET /api/expenses?category= ──
  const fetchExpenses = useCallback(async () => {
    try {
      const params = {}
      if (categoryFilter) params.category = categoryFilter
      // response: { statusCode, data: [...expenses], message }
      const res = await api.get('/expenses', { params })
      setExpenses(res.data.data || [])
    } catch {
      notify('Failed to load expenses.', 'error')
    }
  }, [categoryFilter])

  // ── GET /api/expenses/stats ──
  const fetchStats = useCallback(async () => {
    try {
      // response: { statusCode, data: { total, breakdown: [{_id, total, count}] }, message }
      const res = await api.get('/expenses/stats')
      setStats(res.data.data)
    } catch {
      // non-blocking
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchExpenses(), fetchStats()]).finally(() => setLoading(false))
  }, [fetchExpenses, fetchStats])

  // ── Build chart from real expense data grouped by month ──
  const buildChartData = () => {
    if (!expenses.length) return []
    const map = {}
    expenses.forEach(e => {
      const d = new Date(e.date)
      const year = d.getFullYear()
      const month = d.getMonth()
      const key = `${year}-${String(month + 1).padStart(2, '0')}`
      const label = d.toLocaleString('default', { month: 'short' })
      if (!map[key]) map[key] = { key, label, amount: 0 }
      map[key].amount += e.amount
    })
    const sorted = Object.values(map).sort((a, b) => a.key.localeCompare(b.key))
    return chartTab === 'month' ? sorted.slice(-4) : sorted.slice(-12)
  }
  const chartData = buildChartData()

  // ── Summary values ──
  const totalExpenses = stats?.total ?? expenses.reduce((s, e) => s + e.amount, 0)
  const currentMonth = new Date().getMonth()
  const thisMonthTotal = expenses
    .filter(e => new Date(e.date).getMonth() === currentMonth)
    .reduce((s, e) => s + e.amount, 0)

  // ── POST /api/expenses ──
  const handleAdd = async (e) => {
    e.preventDefault()
    const today = new Date().toISOString().split('T')[0]
    if (form.date > today) {
      notify('Future dates are not allowed for expenses.', 'error')
      setSubmitting(false)
      return
    }
    setSubmitting(true)
    try {
      // body: { item, category, amount (Number), date }
      await api.post('/expenses', { ...form, amount: Number(form.amount) })
      notify('Expense recorded successfully')
      setAddOpen(false)
      setForm(EMPTY_FORM)
      fetchExpenses()
      fetchStats()
    } catch (err) {
      notify(err?.response?.data?.message || 'Failed to add expense.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // ── DELETE /api/expenses/:id ──
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return
    try {
      await api.delete(`/expenses/${id}`)
      notify('Expense deleted')
      fetchExpenses()
      fetchStats()
    } catch {
      notify('Failed to delete expense.', 'error')
    }
  }

  const filtered = expenses.filter(e => categoryFilter ? e.category === categoryFilter : true)

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 border-l-4 border-emerald-500 pl-4">Billing & Finance</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 pl-5">Track hospital equipment & machine expenses</p>
        </div>
        <button onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl hover:bg-emerald-500 transition-all font-black text-xs uppercase tracking-widest shadow-lg">
          <Plus size={16} /> Add Expense
        </button>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {message.text && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`px-5 py-3 rounded-2xl text-xs font-black border ${message.type === 'error'
                ? 'bg-rose-50 border-rose-100 text-rose-600'
                : 'bg-emerald-50 border-emerald-100 text-emerald-700'
              }`}>
            {message.type === 'error' ? '✗' : '✓'} {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Total Expenses', value: `₹${(totalExpenses / 100000).toFixed(1)}L`, icon: TrendingDown },
          { label: 'This Month', value: `₹${(thisMonthTotal / 100000).toFixed(1)}L`, icon: Wrench },
          { label: 'Total Items', value: expenses.length, icon: Wrench },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <div className="p-3 rounded-xl bg-emerald-50 w-fit mb-4">
              <s.icon size={20} className="text-emerald-500" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{s.label}</p>
            <h3 className="text-2xl font-black text-slate-900">{loading ? '—' : s.value}</h3>
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
            {[{ key: 'month', label: 'Month' }, { key: 'year', label: 'Year' }].map(t => (
              <button key={t.key} onClick={() => setChartTab(t.key)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${chartTab === t.key ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                  }`}>{t.label}</button>
            ))}
          </div>
        </div>
        <div className="h-52">
          {loading ? (
            <div className="h-full flex items-center justify-center text-xs font-bold text-slate-300">Loading...</div>
          ) : chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs font-bold text-slate-300">No expense data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barSize={32}>
                <XAxis dataKey="label" tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v / 1000}K`} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '11px', fontWeight: 700 }}
                  formatter={v => [`₹${v.toLocaleString()}`, 'Expenses']} cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="amount" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">All Expenses</h3>
            <p className="text-[10px] font-bold text-slate-400">{filtered.length} records</p>
          </div>
          <div className="flex items-center gap-3">
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-emerald-400 transition-all appearance-none">
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
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
                {['Item / Description', 'Category', 'Amount', 'Date', 'Action'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-xs font-bold text-slate-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-xs font-bold text-slate-400">No expenses found</td></tr>
              ) : filtered.map((e, idx) => (
                <motion.tr key={e._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}
                  className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-xs font-black text-slate-900">{e.item}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black border ${CATEGORY_COLORS[e.category] || CATEGORY_COLORS.Other}`}>
                      {e.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-black text-emerald-600">₹{e.amount?.toLocaleString()}</td>
                  <td className="px-6 py-4 text-[10px] font-bold text-slate-400">
                    {e.date ? new Date(e.date).toLocaleDateString('en-GB') : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleDelete(e._id)} title="Delete"
                      className="h-7 w-7 rounded-lg bg-rose-50 border border-rose-100 text-rose-400 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all">
                      <Trash2 size={13} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      <AnimatePresence>
        {addOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden mx-4">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Add Expense</h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">Record a hospital purchase</p>
                </div>
                <button onClick={() => setAddOpen(false)}
                  className="h-8 w-8 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all border border-slate-100">
                  <X size={14} />
                </button>
              </div>
              <form onSubmit={handleAdd} className="px-6 py-4 space-y-4">
                {/* item */}
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Item / Description *</label>
                  <input type="text" required placeholder="e.g. MRI Machine" value={form.item}
                    onChange={e => setForm(p => ({ ...p, item: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-emerald-400 transition-all" />
                </div>
                {/* amount + date */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Amount (₹) *</label>
                    <input type="number" required min="0" placeholder="0" value={form.amount}
                      onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-emerald-400 transition-all" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Date *</label>
                    <input type="date" required value={form.date}
                      max={new Date().toISOString().split('T')[0]}
                      onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-emerald-400 transition-all" />
                  </div>
                </div>
                {/* category — all 6 from enum */}
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Category</label>
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-emerald-400 transition-all appearance-none">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setAddOpen(false)}
                    className="flex-1 py-3 rounded-xl border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting}
                    className="flex-1 py-3 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-500 transition-all active:scale-95 disabled:opacity-60">
                    {submitting ? 'Saving...' : 'Add Expense'}
                  </button>
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
