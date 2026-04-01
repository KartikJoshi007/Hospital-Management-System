import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Lock, User, Phone, Activity, ArrowRight, Eye, EyeOff, ShieldCheck, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

function SignUp() {
  const [showPassword, setShowPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  })
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Check if email already registered or pending
    const existing = JSON.parse(localStorage.getItem('pendingUsers') || '[]')
    const demoEmails = ['admin@hms.com', 'doctor@hms.com', 'patient@hms.com', 'reception@hms.com']

    if (demoEmails.includes(formData.email.toLowerCase())) {
      setError('This email is already registered.')
      return
    }
    if (existing.find(u => u.email === formData.email.toLowerCase())) {
      setError('A request with this email is already pending.')
      return
    }

    // Save to pendingUsers in localStorage
    const newRequest = {
      id: `REQ-${Date.now()}`,
      fullName: formData.fullName,
      email: formData.email.toLowerCase(),
      phone: formData.phone,
      password: formData.password, // in real app this would be hashed
      requestedAt: new Date().toLocaleDateString('en-GB'),
      status: 'pending',
      assignedRole: null,
    }

    localStorage.setItem('pendingUsers', JSON.stringify([...existing, newRequest]))
    setSubmitted(true)
  }

  // ── Success screen ──
  if (submitted) {
    return (
      <div className="relative min-h-screen w-full bg-[#f8fafc] flex items-center justify-center p-4 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] h-[40rem] w-[40rem] rounded-full bg-emerald-400/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] h-[40rem] w-[40rem] rounded-full bg-slate-900/10 blur-[120px]" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-md bg-white rounded-[3rem] border border-white/50 shadow-2xl p-12 text-center"
        >
          <div className="h-20 w-20 rounded-3xl bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-6 border border-emerald-100">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Request Submitted!</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Awaiting admin approval</p>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-8">
            <p className="text-xs font-bold text-slate-500 leading-relaxed">
              Your account request has been sent to the administrator. Once your role is assigned, you'll be able to log in.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100 mb-8">
            <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">Registered as</p>
            <p className="text-sm font-black text-slate-900">{formData.fullName}</p>
            <p className="text-xs font-bold text-slate-400">{formData.email}</p>
          </div>
          <Link
            to="/login"
            className="w-full py-4 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-emerald-500 transition-all flex items-center justify-center gap-2"
          >
            Back to Login <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    )
  }

  // ── Sign Up Form ──
  return (
    <div className="relative min-h-screen w-full bg-[#f8fafc] flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] h-[40rem] w-[40rem] rounded-full bg-emerald-400/20 blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] h-[40rem] w-[40rem] rounded-full bg-slate-900/10 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-6xl grid md:grid-cols-2 bg-white/60 backdrop-blur-2xl rounded-[3rem] border border-white/50 shadow-2xl overflow-hidden"
      >
        {/* Left — Form */}
        <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center order-2 md:order-1">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Request Access</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Your role will be assigned by the admin</p>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-2xl bg-rose-50 border border-rose-100 text-xs font-bold text-rose-600">
              {error}
            </div>
          )}

          {/* Info banner */}
          <div className="mb-6 px-4 py-3 rounded-2xl bg-blue-50 border border-blue-100 flex items-start gap-3">
            <ShieldCheck size={16} className="text-blue-500 shrink-0 mt-0.5" />
            <p className="text-[10px] font-bold text-blue-600 leading-relaxed">
              After submitting, your request will be reviewed by the admin who will assign your role (Patient, Doctor, or Reception).
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                <input
                  type="text" name="fullName" required
                  placeholder="E.g. Aryan Mehta"
                  value={formData.fullName} onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-bold text-slate-900 shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                <input
                  type="email" name="email" required
                  placeholder="your@email.com"
                  value={formData.email} onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-bold text-slate-900 shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                <input
                  type="tel" name="phone" required
                  placeholder="+91 98765 43210"
                  value={formData.phone} onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-bold text-slate-900 shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                <input
                  type={showPassword ? 'text' : 'password'} name="password" required
                  placeholder="Min. 6 characters"
                  value={formData.password} onChange={handleChange}
                  className="w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-bold text-slate-900 shadow-sm"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button type="submit"
              className="w-full py-4 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-500 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2">
              Submit Request <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100/60 text-center">
            <p className="text-xs font-bold text-slate-500">
              Already have credentials?{' '}
              <Link to="/login" className="text-emerald-500 hover:text-emerald-600 transition-colors uppercase tracking-wider ml-1">Log In</Link>
            </p>
          </div>
        </div>

        {/* Right — Branding */}
        <div className="hidden md:flex flex-col justify-between bg-slate-900 p-12 relative overflow-hidden text-white order-1 md:order-2">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2653&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-black tracking-tight">Hospital Management System</h2>
          </div>

          <div className="relative z-10 mt-20">
            <h1 className="text-4xl lg:text-5xl font-black leading-tight tracking-tighter mb-6">
              Join the leading <br />
              <span className="text-emerald-400">digital care network.</span>
            </h1>
            <p className="text-sm font-medium text-slate-400 max-w-md leading-relaxed">
              Submit your access request. The admin will review and assign your role — Patient, Doctor, or Reception staff.
            </p>
          </div>

          <div className="relative z-10 p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm mt-12 w-max shadow-xl">
            <div className="flex items-center gap-4 mb-3">
              <ShieldCheck className="h-6 w-6 text-emerald-400" />
              <div className="text-xs font-black uppercase tracking-widest">Admin Controlled Access</div>
            </div>
            <p className="text-[10px] font-bold text-slate-400 max-w-[220px] leading-relaxed">
              All accounts are reviewed and approved by the hospital administrator before activation.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default SignUp
