import { CheckCircle2, AlertCircle, Download } from 'lucide-react'

const BillingRow = ({ id, description, date, amount, status, method, onPay, loading }) => {
  return (
    <tr className="group hover:bg-slate-50/50 transition-colors">
      <td className="py-6 px-4">
        <h4 className="text-sm font-black text-slate-900 tracking-tight mb-1">{description}</h4>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{id}</span>
      </td>
      <td className="py-6 px-4">
        <span className="text-xs font-bold text-slate-600 italic">{date}</span>
      </td>
      <td className="py-6 px-4">
        <span className="text-sm font-black text-slate-900 tracking-tight">{amount}</span>
      </td>
      <td className="py-6 px-4 text-xs font-black">
        <div className={`flex items-center gap-2 ${status === 'Paid' ? 'text-emerald-600' : 'text-rose-500'}`}>
          {status === 'Paid' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
          <span className="uppercase text-[10px] tracking-widest">{status}</span>
        </div>
      </td>
      <td className="py-6 px-4">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-100 rounded-lg px-2 py-1">{method}</span>
      </td>
      <td className="py-6 px-4">
        <div className="flex items-center justify-end gap-2">
          {status === 'Pending' ? (
            <button
              onClick={() => onPay(id)}
              disabled={loading}
              className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Settle Now'}
            </button>
          ) : (
            <button className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 text-slate-400 hover:text-blue-500 hover:bg-blue-50 hover:border-blue-200 transition-all text-[10px] font-black uppercase tracking-widest px-4">
              <Download size={14} />
              Invoice
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}

export default BillingRow
