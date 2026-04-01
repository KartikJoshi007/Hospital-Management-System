import { useState, useMemo } from 'react'
import { Search, MoreVertical, ShieldCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const mockUsers = [
  { id: 'U-001', fullName: 'Super Admin', email: 'admin@hms.com', role: 'admin', phone: '9000000001', isActive: true, lastLogin: '2024-06-12' },
  { id: 'U-002', fullName: 'Dr. Aryan Mehta', email: 'doctor@hms.com', role: 'doctor', phone: '9000000002', isActive: true, lastLogin: '2024-06-11' },
  { id: 'U-003', fullName: 'Rohan Sharma', email: 'patient@hms.com', role: 'patient', phone: '9000000003', isActive: true, lastLogin: '2024-06-10' },
  { id: 'U-004', fullName: 'Reception Staff', email: 'reception@hms.com', role: 'reception', phone: '9000000004', isActive: false, lastLogin: '2024-06-08' },
  { id: 'U-005', fullName: 'Dr. Sneha Verma', email: 'sneha@hms.com', role: 'doctor', phone: '9000000005', isActive: true, lastLogin: '2024-06-12' },
  { id: 'U-006', fullName: 'Priya Verma', email: 'priya@hms.com', role: 'patient', phone: '9000000006', isActive: true, lastLogin: '2024-06-09' },
]

const ROLE_COLORS = {
  admin: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  doctor: 'bg-blue-50 text-blue-700 border-blue-200',
  patient: 'bg-orange-50 text-orange-700 border-orange-200',
  reception: 'bg-purple-50 text-purple-700 border-purple-200',
}

function UserManagement() {
  const [users, setUsers] = useState(mockUsers)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [activeDropdown, setActiveDropdown] = useState(null)

  const filtered = useMemo(() => {
    return users.filter(u => {
      const bySearch = search
        ? u.fullName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
        : true
      const byRole = roleFilter ? u.role === roleFilter : true
      return bySearch && byRole
    })
  }, [users, search, roleFilter])

  const toggleActive = (id) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u))
    setActiveDropdown(null)
  }

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 border-l-4 border-emerald-500 pl-4">User Management</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 pl-5">All registered system users</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span className="text-xs font-black text-emerald-700">{users.length} Total Users</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition-all placeholder:text-slate-400"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-emerald-400 transition-all appearance-none min-w-[150px]"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="doctor">Doctor</option>
          <option value="patient">Patient</option>
          <option value="reception">Reception</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                {['User', 'Role', 'Phone', 'Last Login', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-xs font-bold text-slate-400">No users found</td></tr>
              ) : filtered.map((u, idx) => (
                <motion.tr
                  key={u.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullName)}&background=10b981&color=fff&bold=true&size=32`}
                        alt={u.fullName}
                        className="h-9 w-9 rounded-xl object-cover shrink-0"
                      />
                      <div>
                        <p className="text-xs font-black text-slate-900">{u.fullName}</p>
                        <p className="text-[10px] font-bold text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${ROLE_COLORS[u.role]}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600">{u.phone}</td>
                  <td className="px-6 py-4 text-[10px] font-bold text-slate-400">{u.lastLogin}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 w-fit ${u.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-500 border-rose-100'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === u.id ? null : u.id)}
                        className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all"
                      >
                        <MoreVertical size={14} />
                      </button>
                      <AnimatePresence>
                        {activeDropdown === u.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: 8 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: 8 }}
                              className="absolute right-0 mt-1 w-44 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-20"
                            >
                              <button
                                onClick={() => toggleActive(u.id)}
                                className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors ${u.isActive ? 'text-rose-500 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                              >
                                {u.isActive ? 'Deactivate User' : 'Activate User'}
                              </button>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default UserManagement
