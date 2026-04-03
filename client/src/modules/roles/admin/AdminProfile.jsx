import { useState, useRef } from 'react'
import { User, Mail, Phone, Lock, Eye, EyeOff, Edit2, X, Activity, Clock, ShieldCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useAuth from '../../../hooks/useAuth'

function AdminProfile() {
  const { user, login } = useAuth()

  const [editMode,    setEditMode]    = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew,     setShowNew]     = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [message,     setMessage]     = useState({ text: '', type: '' })
  const editSectionRef = useRef(null)

  const [profileForm] = useState({
    fullName: user?.fullName || '',
    email:    user?.email    || '',
    phone:    user?.phone    || '',
  })

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })

  const notify = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 4000)
  }

  const handleEditClick = () => {
    setEditMode(true)
    setTimeout(() => editSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  const handlePasswordSave = (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) return notify('New passwords do not match', 'error')
    if (passwordForm.newPassword.length < 6) return notify('Password must be at least 6 characters', 'error')
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    notify('Password changed successfully')
  }

  const stats = [
    { label: 'Role',       value: 'Administrator', icon: ShieldCheck, color: 'emerald' },
    { label: 'Status',     value: 'Active',         icon: Activity,    color: 'blue'    },
    { label: 'Last Login', value: 'Today',          icon: Clock,       color: 'purple'  },
  ]

  const inputClass = 'w-full pl-11 pr-4 py-3 rounded-xl border bg-slate-50 border-slate-100 text-sm font-bold text-slate-600 outline-none cursor-default'

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500 w-full">

      {/* Toast */}
      <AnimatePresence>
        {message.text && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`px-5 py-3 rounded-2xl text-xs font-black border ${message.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
            {message.type === 'error' ? '✗' : '✓'} {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Hero Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-r from-emerald-500 to-emerald-700 relative flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'Admin')}&background=ffffff&color=10b981&bold=true&size=80`}
                alt="Admin"
                className="h-16 w-16 rounded-2xl object-cover border-4 border-white/30 shadow-xl"
              />
              <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              </span>
            </div>
            <div>
              <h2 className="text-xl font-black text-white leading-tight">{user?.fullName || 'Admin'}</h2>
              <p className="text-xs font-bold text-emerald-100 uppercase tracking-widest">System Administrator</p>
              <p className="text-xs font-bold text-emerald-100 mt-0.5">{user?.email || 'admin@hospital.com'}</p>
            </div>
          </div>
          {!editMode ? (
            <button onClick={handleEditClick}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/20 text-white text-xs font-black uppercase tracking-widest hover:bg-white/30 transition-all">
              <Edit2 size={13} /> Edit Profile
            </button>
          ) : (
            <button onClick={() => setEditMode(false)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/20 text-white text-xs font-black uppercase tracking-widest hover:bg-white/30 transition-all">
              <X size={13} /> Cancel
            </button>
          )}
        </div>

        {/* Stats + Fields */}
        <div className="px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className={`p-2 rounded-xl ${s.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' : s.color === 'blue' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                  <s.icon size={15} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                  <p className="text-xs font-black text-slate-900 mt-0.5">{s.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 h-4 w-4" />
                <input type="text" value={profileForm.fullName} disabled className={inputClass} />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 h-4 w-4" />
                <input type="email" value={profileForm.email} disabled className={inputClass} />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 h-4 w-4" />
                <input type="tel" value={profileForm.phone} disabled className={inputClass} />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Role</label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 h-4 w-4" />
                <input type="text" value="Administrator" disabled
                  className="w-full pl-11 pr-4 py-3 rounded-xl border bg-emerald-50 border-emerald-100 text-sm font-black text-emerald-700 cursor-default" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Cards — shown only when editMode */}
      <AnimatePresence>
        {editMode && (
          <motion.div ref={editSectionRef} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
            className="space-y-6">

            {/* Change Email */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600"><Mail size={16} /></div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Change Email</h3>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">Update your account email address</p>
                  </div>
                </div>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault()
                if (e.target.email.value !== e.target.confirmEmail.value) return notify('Emails do not match', 'error')
                const updated = { ...user, email: e.target.email.value }
                localStorage.setItem('user', JSON.stringify(updated))
                login(updated)
                notify('Email updated successfully')
                e.target.reset()
              }} className="px-8 py-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Current Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 h-4 w-4" />
                      <input type="email" value={user?.email || ''} disabled
                        className="w-full pl-11 pr-4 py-3 rounded-xl border bg-emerald-50 border-emerald-100 text-sm font-black text-emerald-700 cursor-default" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">New Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 h-4 w-4" />
                      <input type="email" name="email" required placeholder="Enter new email"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-900 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Confirm New Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 h-4 w-4" />
                      <input type="email" name="confirmEmail" required placeholder="Confirm new email"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-900 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition-all" />
                    </div>
                  </div>
                  <div className="flex items-end">
                    <button type="submit"
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg active:scale-95">
                      <Mail size={13} /> Update Email
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Change Phone */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600"><Phone size={16} /></div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Change Phone Number</h3>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">Update your contact number</p>
                  </div>
                </div>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault()
                const newPhone     = e.target.phone.value.trim()
                const confirmPhone = e.target.confirmPhone.value.trim()
                if (!newPhone) return notify('Please enter a phone number', 'error')
                if (newPhone !== confirmPhone) return notify('Phone numbers do not match', 'error')
                const updated = { ...user, phone: newPhone }
                localStorage.setItem('user', JSON.stringify(updated))
                login(updated)
                notify('Phone number updated successfully')
                e.target.reset()
              }} className="px-8 py-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Current Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 h-4 w-4" />
                      <input type="tel" value={user?.phone || 'Not set'} disabled
                        className="w-full pl-11 pr-4 py-3 rounded-xl border bg-emerald-50 border-emerald-100 text-sm font-black text-emerald-700 cursor-default" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">New Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 h-4 w-4" />
                      <input type="tel" name="phone" required placeholder="Enter new number"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-900 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Confirm New Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 h-4 w-4" />
                      <input type="tel" name="confirmPhone" required placeholder="Confirm new number"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-900 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition-all" />
                    </div>
                  </div>
                  <div className="flex items-end">
                    <button type="submit"
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg active:scale-95">
                      <Phone size={13} /> Update Number
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600"><Lock size={16} /></div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Change Password</h3>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">Update your account security key</p>
                  </div>
                </div>
              </div>
              <form onSubmit={handlePasswordSave} className="px-8 py-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                    { label: 'Current Password', key: 'currentPassword', show: showCurrent, toggle: () => setShowCurrent(p => !p) },
                    { label: 'New Password',     key: 'newPassword',     show: showNew,     toggle: () => setShowNew(p => !p)     },
                    { label: 'Confirm Password', key: 'confirmPassword', show: showConfirm, toggle: () => setShowConfirm(p => !p) },
                  ].map(({ label, key, show, toggle }) => (
                    <div key={key}>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 h-4 w-4" />
                        <input type={show ? 'text' : 'password'} required placeholder="••••••••"
                          value={passwordForm[key]}
                          onChange={e => setPasswordForm({ ...passwordForm, [key]: e.target.value })}
                          className={`w-full pl-11 pr-11 py-3 rounded-xl border bg-white text-sm font-bold text-slate-900 outline-none focus:ring-4 transition-all [&::-ms-reveal]:hidden ${
                            key === 'confirmPassword' && passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword
                              ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-50'
                              : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-50'
                          }`} />
                        <button type="button" onClick={toggle}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors">
                          {show ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                      {key === 'confirmPassword' && passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                        <p className="text-[10px] font-bold text-rose-500 mt-1.5 ml-1">Passwords do not match</p>
                      )}
                    </div>
                  ))}
                  <div className="flex items-end">
                    <button type="submit"
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg active:scale-95">
                      <Lock size={13} /> Update Password
                    </button>
                  </div>
                </div>
              </form>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}

export default AdminProfile
