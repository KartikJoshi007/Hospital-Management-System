import { useState } from 'react'
import { User, Mail, Phone, Lock, Eye, EyeOff, Edit2, Check, X, ShieldCheck, Clock, Activity } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useAuth from '../../../hooks/useAuth'

function AdminProfile() {
  const { user, login } = useAuth()

  const [editMode, setEditMode] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    email:    user?.email    || '',
    phone:    user?.phone    || '',
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword:     '',
    confirmPassword: '',
  })

  const notify = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 4000)
  }

  const handleProfileSave = (e) => {
    e.preventDefault()
    const updated = { ...user, ...profileForm }
    localStorage.setItem('user', JSON.stringify(updated))
    login(updated)
    setEditMode(false)
    notify('Profile updated successfully')
  }

  const handleProfileCancel = () => {
    setProfileForm({ fullName: user?.fullName || '', email: user?.email || '', phone: user?.phone || '' })
    setEditMode(false)
  }

  const handlePasswordSave = (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      notify('New passwords do not match', 'error')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      notify('Password must be at least 6 characters', 'error')
      return
    }
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    notify('Password changed successfully')
  }

  const stats = [
    { label: 'Role',       value: 'Administrator', icon: ShieldCheck, color: 'emerald' },
    { label: 'Status',     value: 'Active',         icon: Activity,    color: 'blue'    },
    { label: 'Last Login', value: 'Today',          icon: Clock,       color: 'purple'  },
  ]

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500 max-w-4xl">

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
        <div className="h-28 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900 relative">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #10b981 0%, transparent 50%), radial-gradient(circle at 80% 20%, #3b82f6 0%, transparent 40%)' }} />
        </div>

        {/* Avatar + Info */}
        <div className="px-8 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-10 mb-6">
            <div className="flex items-end gap-4">
              <div className="relative">
                <img
                  src={`https://ui-avatars.com/api/?name=Admin&background=10b981&color=fff&bold=true&size=80`}
                  alt="Admin"
                  className="h-20 w-20 rounded-2xl object-cover border-4 border-white shadow-xl"
                />
                <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                  <span className="h-2 w-2 rounded-full bg-white" />
                </span>
              </div>
              <div className="mb-1">
                <h2 className="text-xl font-black text-slate-900 leading-tight">Admin</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">System Administrator</p>
              </div>
            </div>

            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg"
              >
                <Edit2 size={13} /> Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleProfileCancel}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all">
                  <X size={13} /> Cancel
                </button>
                <button form="profile-form" type="submit"
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg">
                  <Check size={13} /> Save
                </button>
              </div>
            )}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mb-6">
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

          {/* Profile Form */}
          <form id="profile-form" onSubmit={handleProfileSave}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 h-4 w-4" />
                  <input
                    type="text"
                    value={profileForm.fullName}
                    onChange={e => setProfileForm({ ...profileForm, fullName: e.target.value })}
                    disabled={!editMode}
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm font-bold text-slate-900 outline-none transition-all ${editMode ? 'bg-white border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50' : 'bg-slate-50 border-slate-100 text-slate-600 cursor-default'}`}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 h-4 w-4" />
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                    disabled={!editMode}
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm font-bold text-slate-900 outline-none transition-all ${editMode ? 'bg-white border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50' : 'bg-slate-50 border-slate-100 text-slate-600 cursor-default'}`}
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 h-4 w-4" />
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                    disabled={!editMode}
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm font-bold text-slate-900 outline-none transition-all ${editMode ? 'bg-white border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50' : 'bg-slate-50 border-slate-100 text-slate-600 cursor-default'}`}
                  />
                </div>
              </div>

              {/* Role — always readonly */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Role</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 h-4 w-4" />
                  <input
                    type="text"
                    value="Administrator"
                    disabled
                    className="w-full pl-11 pr-4 py-3 rounded-xl border bg-emerald-50 border-emerald-100 text-sm font-black text-emerald-700 cursor-default"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600">
              <Lock size={16} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Change Password</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">Update your account security key</p>
            </div>
          </div>
        </div>

        <form onSubmit={handlePasswordSave} className="px-8 py-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Current Password */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 h-4 w-4" />
                <input
                  type={showCurrent ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-900 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition-all"
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors">
                  {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 h-4 w-4" />
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-900 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition-all"
                />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors">
                  {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 h-4 w-4" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className={`w-full pl-11 pr-11 py-3 rounded-xl border bg-white text-sm font-bold text-slate-900 outline-none focus:ring-4 transition-all ${
                    passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword
                      ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-50'
                      : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-50'
                  }`}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors">
                  {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                <p className="text-[10px] font-bold text-rose-500 mt-1.5 ml-1">Passwords do not match</p>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg active:scale-95">
              <Lock size={13} /> Update Password
            </button>
          </div>
        </form>
      </div>

      {/* Account Info Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-5 border-l-4 border-emerald-500 pl-3">Account Information</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Account ID',   value: user?.id || 'demo-admin' },
            { label: 'Role',         value: 'Admin' },
            { label: 'Account Type', value: 'Full Access' },
            { label: 'Member Since', value: '2024' },
          ].map((item, i) => (
            <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
              <p className="text-xs font-black text-slate-900 truncate">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

export default AdminProfile
