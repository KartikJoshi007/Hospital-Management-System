import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Mail, Lock, User, Phone, Activity, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'
import { registerUser } from './authApi'

function SignUp() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', password: '', confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password.length < 6) return setError('Password must be at least 6 characters.')
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match.')

    setLoading(true)
    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email.toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
        role: 'patient'
      }

      // 🛡️ FRONTEND VALIDATION
      if (payload.phone.includes('@')) {
        const msg = 'Double check: You have entered an email in the "Phone Number" field.';
        setError(msg);
        toast.error(msg);
        setLoading(false);
        return;
      }

      await registerUser(payload)
      toast.success("Account created! Please sign in.");
      navigate('/login')
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Something went wrong during registration';
      setError(msg)
      toast.error(msg);
    } finally {
      setLoading(false)
    }
  }

  const inp = 'w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-bold text-slate-900 shadow-sm'
  const inpPwd = 'w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-bold text-slate-900 shadow-sm [&::-ms-reveal]:hidden [&::-ms-clear]:hidden'

  return (
    <div className="relative min-h-screen w-full bg-[#f8fafc] flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] h-[40rem] w-[40rem] rounded-full bg-emerald-400/20 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[40rem] w-[40rem] rounded-full bg-slate-900/10 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-6xl grid md:grid-cols-2 bg-white/60 backdrop-blur-2xl rounded-[3rem] border border-white/50 shadow-2xl overflow-hidden"
      >
        {/* ── Left: Branding ── */}
        <div className="hidden md:flex flex-col bg-slate-900 p-16 relative overflow-hidden text-white">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2653&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />

          <div className="relative z-10 flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0">
              <Activity className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-xl font-black tracking-tighter leading-tight uppercase text-white/90">
              Hospital <br />Management System
            </h2>
          </div>

          <div className="relative z-10 my-auto max-w-md">
            <h1 className="text-5xl lg:text-7xl font-black leading-[0.9] tracking-tighter mb-8">
              Your health, <br />
              <span className="text-emerald-400">our priority.</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest">
              Register as a patient to book appointments, view your records, and manage your health journey.
            </p>
          </div>
        </div>

        {/* ── Right: Form ── */}
        <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
          <div className="mb-6 text-center md:text-left">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Create Account</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Patient registration</p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-2xl bg-rose-50 border border-rose-100 text-xs font-bold text-rose-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input type="text" name="fullName" required placeholder="E.g. Aryan Mehta"
                  value={formData.fullName} onChange={handleChange} className={inp} />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input type="email" name="email" required placeholder="your@email.com"
                  value={formData.email} onChange={handleChange} className={inp} />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input type="tel" name="phone" required placeholder="+91 98765 43210"
                  value={formData.phone} onChange={handleChange} className={inp} />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input type={showPassword ? 'text' : 'password'} name="password" required placeholder="Min. 6 characters"
                  value={formData.password} onChange={handleChange} className={inpPwd} />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" required placeholder="Re-enter password"
                  value={formData.confirmPassword} onChange={handleChange}
                  className={`w-full pl-10 pr-10 py-3 bg-white border rounded-2xl focus:outline-none focus:ring-4 transition-all text-sm font-bold text-slate-900 shadow-sm [&::-ms-reveal]:hidden [&::-ms-clear]:hidden ${formData.confirmPassword && formData.password !== formData.confirmPassword
                    ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-500/10'
                    : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10'
                    }`} />
                <button type="button" onClick={() => setShowConfirm(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-[10px] font-bold text-rose-500 mt-1 ml-1">Passwords do not match</p>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-4 rounded-2xl bg-emerald-500 text-white text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-[0.98] flex items-center justify-center gap-2 !mt-5 disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Account'} <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100/60 text-center">
            <p className="text-xs font-bold text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="text-emerald-500 hover:text-emerald-600 transition-colors uppercase tracking-wider ml-1">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default SignUp
