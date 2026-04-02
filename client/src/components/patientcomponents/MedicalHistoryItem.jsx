import { Clock3, FileText, User } from 'lucide-react'

const MedicalHistoryItem = ({ diagnosis, date, doctor, dept, treatment }) => {
  return (
    <div className="flex gap-6 items-start group">
      <div className="h-12 w-12 rounded-xl bg-white border-2 border-slate-100 shrink-0 flex items-center justify-center text-slate-400 group-hover:border-emerald-500 group-hover:text-emerald-600 transition-all z-10 shadow-sm">
        <Clock3 size={18} />
      </div>
      <div className="flex-1 pb-2 border-b border-slate-50 group-last:border-none">
        <div className="flex justify-between items-start mb-1">
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{diagnosis}</h4>
          <span className="text-[10px] font-black text-slate-400 uppercase">{date}</span>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <User size={10} className="text-slate-300" />
            <span className="text-[10px] font-bold text-slate-500 italic">{doctor} ({dept})</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 text-[10px] font-bold text-slate-600 border border-slate-100 flex items-center gap-2">
            <FileText size={12} className="text-emerald-500" />
            Prescribed: {treatment}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MedicalHistoryItem
