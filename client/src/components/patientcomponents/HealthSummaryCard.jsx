import { motion } from 'framer-motion'

const HealthSummaryCard = ({ label, value, icon: Icon, color, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1 }}
      className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all group"
    >
      <div className={`p-2.5 rounded-xl bg-${color}-50 text-${color}-600 w-fit mb-3 group-hover:bg-${color}-500 group-hover:text-white transition-colors`}>
        <Icon size={18} />
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-xl font-black text-slate-900">{value}</h3>
    </motion.div>
  )
}

export default HealthSummaryCard
