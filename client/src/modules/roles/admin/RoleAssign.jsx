import { useState, useEffect } from 'react'
import { ShieldCheck, Check, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const ROLE_COLORS = {
  admin:     'bg-emerald-50 text-emerald-700 border-emerald-200',
  doctor:    'bg-blue-50 text-blue-700 border-blue-200',
  patient:   'bg-orange-50 text-orange-700 border-orange-200',
  reception: 'bg-purple-50 text-purple-700 border-purple-200',
}

const STATUS_COLORS = {
  pending:  'bg-orange-50 text-orange-600 border-orange-100',
  approved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  rejected: 'bg-rose-50 text-rose-500 border-rose-100',
}

const ROLES = ['patient', 'doctor', 'reception', 'admin']

function RoleAssign() {
  const [requests, setRequests]     = useState([])
  const [selectedRoles, setSelectedRoles] = useState({})
  const [message, setMessage]       = useState({ text: '', type: '' })
  const [activeTab, setActiveTab]   = useState('pending')

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('pendingUsers') || '[]')
    setRequests(stored)
    const defaults = {}
    stored.forEach(r => { defaults[r.id] = 'patient' })
    setSelectedRoles(defaults)
  }, [])

  const save = (updated) => {
    setRequests(updated)
    localStorage.setItem('pendingUsers', JSON.stringify(updated))
  }

  const notify = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 4000)
  }

  const handleApprove = (id) => {
    const role = selectedRoles[id] || 'patient'
    const req  = requests.find(r => r.id === id)
    save(requests.map(r => r.id === id ? { ...r, status: 'approved', assignedRole: role } : r))
    notify(`${req.fullName} approved as ${role}`, 'success')
  }

  const handleReject = (id) => {
    const req = requests.find(r => r.id === id)
    save(requests.map(r => r.id === id ? { ...r, status: 'rejected', assignedRole: null } : r))
    notify(`${req.fullName}'s request rejected`, 'error')
  }

  const pending  = requests.filter(r => r.status === 'pending')
  const approved = requests.filter(r => r.status === 'approved')
  const rejected = requests.filter(r => r.status === 'rejected')
  const displayed = activeTab === 'pending' ? pending : requests

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 border-l-4 border-emerald-500 pl-4">Role Management</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 pl-5">Review signup requests & assign roles</p>
        </div>
        {pending.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-50 border border-orange-100">
            <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-xs font-black text-orange-700">{pending.length} Pending</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending',  count: pending.length,  bg: 'bg-orange-50',  text: 'text-orange-500',  border: 'border-orange-100' },
          { label: 'Approved', count: approved.length, bg: 'bg-emerald-50', text: 'text-emerald-500', border: 'border-emerald-100' },
          { label: 'Rejected', count: rejected.length, bg: 'bg-rose-50',    text: 'text-rose-500',    border: 'border-rose-100' },
        ].map(s => (
          <div key={s.label} className={`p-5 rounded-2xl border ${s.bg} ${s.border} text-center`}>
            <h3 className={`text-3xl font-black ${s.text}`}>{s.count}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toast */}
      <AnimatePresence>
        {message.text && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`px-5 py-3 rounded-2xl text-xs font-black border ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
            {message.type === 'success' ? '✓' : '✗'} {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { key: 'pending', label: `Pending (${pending.length})` },
          { key: 'all',     label: `All Requests (${requests.length})` },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.key ? 'bg-slate-900 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">

        {/* Table header bar */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
              {activeTab === 'pending' ? 'Pending Signup Requests' : 'All Signup Requests'}
            </h3>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5">
              {displayed.length} {displayed.length === 1 ? 'request' : 'requests'}
            </p>
          </div>
        </div>

        {displayed.length === 0 ? (
          <div className="py-20 text-center">
            <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={24} className="text-slate-300" />
            </div>
            <p className="text-sm font-black text-slate-400">No requests found</p>
            <p className="text-[10px] font-bold text-slate-300 mt-1 uppercase tracking-widest">
              New signups from /sign-up will appear here
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100">
                  <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">User</th>
                  <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                  <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Requested On</th>
                  <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Assign Role</th>
                  <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {displayed.map((req, idx) => (
                  <motion.tr
                    key={req.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="hover:bg-slate-50/40 transition-colors group"
                  >
                    {/* User */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(req.fullName)}&background=0f172a&color=fff&bold=true&size=36`}
                          alt={req.fullName}
                          className="h-10 w-10 rounded-xl object-cover shrink-0 group-hover:ring-2 group-hover:ring-emerald-200 transition-all"
                        />
                        <div>
                          <p className="text-sm font-black text-slate-900 leading-tight">{req.fullName}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-0.5">{req.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-slate-600">{req.phone}</p>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-slate-500">{req.requestedAt}</p>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${STATUS_COLORS[req.status]}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${req.status === 'pending' ? 'bg-orange-500 animate-pulse' : req.status === 'approved' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {req.status}
                      </span>
                    </td>

                    {/* Assign Role */}
                    <td className="px-6 py-4">
                      {req.status === 'pending' ? (
                        <select
                          value={selectedRoles[req.id] || 'patient'}
                          onChange={e => setSelectedRoles(prev => ({ ...prev, [req.id]: e.target.value }))}
                          className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all appearance-none cursor-pointer min-w-[120px]"
                        >
                          {ROLES.map(r => (
                            <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                          ))}
                        </select>
                      ) : req.status === 'approved' ? (
                        <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${ROLE_COLORS[req.assignedRole]}`}>
                          {req.assignedRole}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-300">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      {req.status === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApprove(req.id)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white text-[10px] font-black uppercase tracking-widest border border-emerald-100 transition-all active:scale-95"
                          >
                            <Check size={12} /> Approve
                          </button>
                          <button
                            onClick={() => handleReject(req.id)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white text-[10px] font-black uppercase tracking-widest border border-rose-100 transition-all active:scale-95"
                          >
                            <X size={12} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className={`text-[10px] font-black uppercase tracking-widest ${req.status === 'approved' ? 'text-emerald-500' : 'text-rose-400'}`}>
                          {req.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default RoleAssign
