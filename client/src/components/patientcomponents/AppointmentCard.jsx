import { Calendar, Clock } from 'lucide-react'

const AppointmentCard = ({ doctor, dept, date, time, status }) => {
  return (
    <div className="p-5 rounded-2xl bg-slate-50/50 border border-slate-100 hover:border-emerald-200 transition-all group relative overflow-hidden">
      <div className="absolute right-0 top-0 h-full w-1.5 bg-emerald-500/10 group-hover:bg-emerald-500 transition-all"></div>
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-col">
          <h4 className="text-sm font-black text-slate-900">{doctor}</h4>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{dept}</span>
        </div>
        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'
          }`}>
          {status}
        </div>
      </div>
      <div className="flex items-center gap-4 text-slate-500">
        <div className="flex items-center gap-1.5">
          <Calendar size={12} className="text-emerald-500" />
          <span className="text-[10px] font-bold">{date}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={12} className="text-emerald-500" />
          <span className="text-[10px] font-bold">{time}</span>
        </div>
      </div>
    </div>
  )
}

export default AppointmentCard
