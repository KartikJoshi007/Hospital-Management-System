import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Mail, Lock, Activity, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'
import { loginUser } from './authApi'
import useAuth from '../../hooks/useAuth'

const ROLE_HOME = {
  admin:     '/admin/dashboard',
  doctor:    '/doctor/dashboard',
  patient:   '/patient/dashboard',
  reception: '/reception/dashboard',
}

// Demo accounts for internal use (no UI buttons)
// const DEMO_USERS = [
//   { role: 'admin',     email: 'admin@hms.com',     password: 'admin123',     fullName: 'Admin User'     },
//   { role: 'doctor',    email: 'doctor@hms.com',    password: 'doctor123',    fullName: 'Doctor User'    },
//   { role: 'patient',   email: 'patient@hms.com',   password: 'patient123',   fullName: 'Patient User'   },
//   { role: 'reception', email: 'reception@hms.com', password: 'reception123', fullName: 'Reception User' },
// ]

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState('')
  const [formData,     setFormData]     = useState({ email: '', password: '' })

  const handleChange = (e) => {
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const email    = formData.email.toLowerCase()
    const password = formData.password

    // 1. Check demo accounts
    // const demo = DEMO_USERS.find(d => d.email === email && d.password === password)
    // if (demo) {
    //   localStorage.setItem('token', 'demo-token-' + demo.role)
    //   localStorage.setItem('user', JSON.stringify({ id: `demo-${demo.role}`, fullName: demo.fullName, email: demo.email, role: demo.role, phone: '9000000000' }))
    //   navigate(ROLE_HOME[demo.role], { replace: true })
    //   return
    // }

    // 2. Check locally registered patients
    //  const localUsers = JSON.parse(localStorage.getItem('pendingUsers') || '[]')
    // const localMatch = localUsers.find(u => u.email === email)
    // if (localMatch) {
    //   if (localMatch.status === 'rejected') {
    //     setError('Your account has been rejected. Contact the administrator.')
    //     setLoading(false)
    //     return
    //   }
    //   if (localMatch.password !== password) {
    //     setError('Invalid credentials. Please try again.')
    //     setLoading(false)
    //     return
    //   }
    //   localStorage.setItem('token', 'token-' + localMatch.id)
    //   localStorage.setItem('user', JSON.stringify({
    //     id:       localMatch.id,
    //     fullName: localMatch.fullName,
    //     email:    localMatch.email,
    //     role:     localMatch.assignedRole,
    //     phone:    localMatch.phone,
    //   }))
    //   navigate(ROLE_HOME[localMatch.assignedRole] || '/patient/dashboard', { replace: true })
    //   return
    // }

    // 3. Try real API
    try {
      const res = await loginUser(formData);
      const { token, user: userData } = res.data ? res.data : res;

      // ✅ Use global login context to wake up all providers (Notifications, etc)
      login(userData, token);

      toast.success("Welcome back! Signing you in...");
      navigate(ROLE_HOME[userData.role] || "/login", { replace: true });

    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Invalid credentials";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
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
        {/* ── Left: Branding ── */}
        <div className="hidden md:flex flex-col bg-slate-900 p-16 relative overflow-hidden text-white">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=2699&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay" />
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
              Clinical <br />excellence, <br />
              <span className="text-emerald-400">digitally optimized.</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest">
              Access the central hospital portal to manage patient records, physician schedules, and daily clinical operations.
            </p>
          </div>
        </div>

        {/* ── Right: Form ── */}
        <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Welcome back</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-2xl bg-rose-50 border border-rose-100 text-xs font-bold text-rose-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                <input
                  type="email" name="email" required
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
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
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-bold text-slate-900 shadow-sm [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-4 rounded-2xl bg-emerald-500 text-white text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? 'Signing in...' : 'Sign In'}
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
