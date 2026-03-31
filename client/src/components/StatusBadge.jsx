function StatusBadge({ status }) {
  const statusMap = {
    Completed: { dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
    'In Progress': { dot: 'bg-orange-500', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100' },
    Waiting: { dot: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' },
    Scheduled: { dot: 'bg-slate-400', bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100' },
    Urgent: { dot: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100' },
    Emergency: { dot: 'bg-rose-600', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100' },
    Confirmed: { dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
    Pending: { dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
    Cancelled: { dot: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100' },
  }

  const { dot, bg, text, border } = statusMap[status] || statusMap['Scheduled']

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border ${bg} ${text} ${border} text-[10px] font-black uppercase tracking-widest shadow-sm`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot} shrink-0`}></span>
      {status}
    </span>
  )
}

export default StatusBadge
