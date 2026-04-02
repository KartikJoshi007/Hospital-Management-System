import { FileText, Clock, Eye, Download } from 'lucide-react'

const MedicalRecordRow = ({ title, type, date, doctor, dept, size }) => {
  return (
    <tr className="group hover:bg-slate-50/50 transition-colors">
      <td className="py-6 px-4">
        <div className="flex items-center gap-4">
          <div className={`h-12 w-12 rounded-2xl bg-${type === 'Prescription' ? 'emerald' : 'blue'}-50 text-${type === 'Prescription' ? 'emerald' : 'blue'}-500 flex items-center justify-center shrink-0`}>
            <FileText size={20} />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900 tracking-tight">{title}</h4>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{type}</p>
          </div>
        </div>
      </td>
      <td className="py-6 px-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-slate-300"></div>
          <span className="text-xs font-bold text-slate-600">{dept}</span>
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase">{doctor}</span>
      </td>
      <td className="py-6 px-4">
        <div className="flex items-center gap-2 text-slate-500">
          <Clock size={12} className="text-emerald-500" />
          <span className="text-xs font-bold">{date}</span>
        </div>
      </td>
      <td className="py-6 px-4 text-center">
        <span className="text-[10px] font-black text-slate-400 uppercase px-2.5 py-1 bg-slate-100/50 border border-slate-200 rounded-lg whitespace-nowrap">{size}</span>
      </td>
      <td className="py-6 px-4">
        <div className="flex items-center justify-end gap-2">
          <button className="p-2.5 rounded-xl border border-slate-100 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 hover:border-emerald-200 transition-all">
            <Eye size={18} />
          </button>
          <button className="p-2.5 rounded-xl border border-slate-100 text-slate-400 hover:text-blue-500 hover:bg-blue-50 hover:border-blue-200 transition-all">
            <Download size={18} />
          </button>
        </div>
      </td>
    </tr>
  )
}

export default MedicalRecordRow
