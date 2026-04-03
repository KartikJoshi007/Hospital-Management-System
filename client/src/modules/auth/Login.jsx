import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Activity, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'
import { loginUser } from './authApi'

const ROLE_HOME = {
  admin: '/admin/dashboard',
  doctor: '/doctor/dashboard',
  patient: '/patient/dashboard',
  reception: '/reception/dashboard',
}

const DEMO_USERS = [
  { role: 'admin',     email: 'admin@hms.com',     password: 'admin123',     label: 'Admin',     color: 'emerald' },
  { role: 'doctor',    email: 'doctor@hms.com',    password: 'doctor123',    label: 'Doctor',    color: 'blue' },
  { role: 'patient',   email: 'patient@hms.com',   password: 'patient123',   label: 'Patient',   color: 'orange' },
  { role: 'reception', email: 'reception@hms.com', password: 'reception123', label: 'Reception', color: 'purple' },
]

const COLOR_MAP = {
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-500 hover:text-white hover:border-emerald-500',
  blue:    'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-500 hover:text-white hover:border-blue-500',
  orange:  'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-500 hover:text-white hover:border-orange-500',
  purple:  'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-500 hover:text-white hover:border-purple-500',
}

function Login() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({ email: '', password: '' })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  // Mock login — stores fake user in localStorage and redirects
  const mockLogin = (demoUser) => {
    const user = {
      id: `demo-${demoUser.role}`,
      fullName: demoUser.label + ' User',
      email: demoUser.email,
      role: demoUser.role,
      phone: '9000000000',
    }
    localStorage.setItem('token', 'demo-token-' + demoUser.role)
    localStorage.setItem('user', JSON.stringify(user))
    navigate(ROLE_HOME[demoUser.role], { replace: true })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Check if matches a demo user — bypass API
    const demo = DEMO_USERS.find(
      d => d.email === formData.email && d.password === formData.password
    )
    if (demo) {
      mockLogin(demo)
      return
    }

    // Check if user is a pending signup (awaiting admin approval)
    const pendingUsers = JSON.parse(localStorage.getItem('pendingUsers') || '[]')
    const pendingMatch = pendingUsers.find(
      u => u.email === formData.email.toLowerCase()
    )
    if (pendingMatch) {
      if (pendingMatch.status === 'rejected') {
        setError('Your access request was rejected. Contact the administrator.')
        setLoading(false)
        return
      }
      if ((pendingMatch.status === 'approved' || pendingMatch.status === 'active') && pendingMatch.password === formData.password) {
        const user = {
          id:       pendingMatch.id,
          fullName: pendingMatch.fullName,
          email:    pendingMatch.email,
          role:     pendingMatch.assignedRole,
          phone:    pendingMatch.phone,
        }
        localStorage.setItem('token', 'token-' + pendingMatch.id)
        localStorage.setItem('user', JSON.stringify(user))
        navigate(ROLE_HOME[user.role] || '/login', { replace: true })
        return
      }
      setError('Invalid credentials. Please try again.')
      setLoading(false)
      return
    }

    // Otherwise try real API
    try {
      const res = await loginUser(formData)
      const user = res?.data?.user
      const path = ROLE_HOME[user?.role] || '/login'
      navigate(path, { replace: true })
    } catch (err) {
      setError(err?.message || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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
        {/* Left — Branding */}
        <div className="hidden md:flex flex-col bg-slate-900 p-16 relative overflow-hidden text-white">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=2699&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />

          <div className="relative z-10 flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0">
              <Activity className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tighter leading-tight uppercase text-white/90">
                Hospital <br />Management System
              </h2>
            </div>
          </div>

          <div className="relative z-10 my-auto max-w-md">
            <h1 className="text-5xl lg:text-7xl font-black leading-[0.9] tracking-tighter mb-8">
              Clinical <br />excellence, <br />
              <span className="text-emerald-400">digitally optimized.</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest">
              Access the central hospital administration portal to manage patient records, physician schedules, and daily clinical operations.
            </p>
          </div>

          {/* Demo credentials card */}
          <div className="relative z-10 p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Demo Credentials</p>
            <div className="space-y-1.5">
              {DEMO_USERS.map(d => (
                <div key={d.role} className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-white/60 uppercase tracking-wider w-20">{d.label}</span>
                  <span className="text-[10px] font-bold text-slate-400">{d.email}</span>
                  <span className="text-[10px] font-bold text-emerald-400">{d.password}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Form */}
        <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Welcome back</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Sign in to your account</p>
          </div>

          {/* Quick demo login buttons */}
          <div className="mb-6">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Quick Demo Login</p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_USERS.map(d => (
                <button
                  key={d.role}
                  type="button"
                  onClick={() => mockLogin(d)}
                  className={`px-3 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${COLOR_MAP[d.color]}`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">or sign in manually</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-2xl bg-rose-50 border border-rose-100 text-xs font-bold text-rose-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="Provide your email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-bold text-slate-900 shadow-sm"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5 ml-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Password</label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    placeholder="Enter your security key"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-bold text-slate-900 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-emerald-500 text-white text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100/60 text-center">
            <p className="text-xs font-bold text-slate-500">
              Don't have an account?{' '}
              <Link to="/sign-up" className="text-emerald-500 hover:text-emerald-600 transition-colors uppercase tracking-wider ml-1">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
