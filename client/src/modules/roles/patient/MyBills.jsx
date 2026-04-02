import { useState } from 'react'
import {
   CreditCard,
   ArrowLeft,
   Activity,
   Calendar,
   Download,
   CheckCircle2,
   Timer,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const bills = [
   { id: 'INV-4482', description: 'Emergency Consultation + Tests', date: '2023-10-24', amount: '₹1240.00', status: 'Paid', method: 'UPI' },
   { id: 'INV-4481', description: 'Post-Surgery Pharmacy Bundle', date: '2023-10-12', amount: '₹4800.00', status: 'Paid', method: 'Card' },
   { id: 'INV-4480', description: 'Diagnostic Scan (Chest X-Ray)', date: '2023-09-28', amount: '₹1500.00', status: 'Pending', method: '---' },
   { id: 'INV-4479', description: 'General Physician Visit', date: '2023-09-15', amount: '₹800.00', status: 'Paid', method: 'Cash' },
   { id: 'INV-4478', description: 'Cardiology Specialist Consult', date: '2023-08-30', amount: '₹1200.00', status: 'Paid', method: 'Net Banking' },
]

function MyBills() {
   const navigate = useNavigate()

   return (
      <div className="space-y-8 pb-10 animate-in fade-in duration-500 w-full px-4">

         {/* Header Section */}
         <div className="p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
               <h1 className="text-3xl font-black tracking-tight text-slate-900 border-l-4 border-emerald-500 pl-4 uppercase leading-none">Billing & Invoices</h1>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 pl-5">Review your payment history and download invoice records</p>
            </div>
            <button
               onClick={() => navigate(-1)}
               className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
            >
               <ArrowLeft size={14} strokeWidth={3} />
               Back
            </button>
         </div>

         {/* Stats Grid */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 group">
               <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-500 group-hover:text-white transition-all border border-emerald-100 group-hover:border-emerald-400">
                  <CheckCircle2 size={22} strokeWidth={3} />
               </div>
               <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Paid Invoices</p>
                  <p className="text-2xl font-black text-slate-900 mt-0.5">4</p>
               </div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 group">
               <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl group-hover:bg-amber-500 group-hover:text-white transition-all border border-amber-100 group-hover:border-amber-400">
                  <Timer size={22} strokeWidth={3} />
               </div>
               <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pending Settlement</p>
                  <p className="text-2xl font-black text-slate-900 mt-0.5">1</p>
               </div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 group">
               <div className="p-3 bg-slate-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-500 group-hover:text-white transition-all border border-slate-100 group-hover:border-emerald-400">
                  <CreditCard size={22} strokeWidth={3} />
               </div>
               <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Billed</p>
                  <p className="text-2xl font-black text-slate-900 mt-0.5">₹9,540.00</p>
               </div>
            </div>
         </div>

         {/* Billing Table Card */}
         <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
               <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-l-4 border-emerald-500 pl-3 leading-none">Billing History</h3>
               <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all">
                  Download Statement <Download size={14} strokeWidth={3} />
               </button>
            </div>

            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Invoice ID</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Description</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Date</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Amount</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none text-right">Status & Action</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {bills.map((bill) => (
                        <tr key={bill.id} className="hover:bg-slate-50/50 transition-all group">
                           <td className="px-8 py-6 text-xs font-black text-slate-900 leading-none">{bill.id}</td>
                           <td className="px-8 py-6">
                              <p className="text-sm font-black text-slate-800 leading-tight">{bill.description}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 leading-none">
                                 {bill.status === 'Paid' ? `PAID VIA ${bill.method}` : 'SETTLEMENT PENDING'}
                              </p>
                           </td>
                           <td className="px-8 py-6 text-xs font-black text-slate-600 whitespace-nowrap leading-none">
                              {new Date(bill.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                           </td>
                           <td className="px-8 py-6 text-sm font-black text-slate-900 leading-none">{bill.amount}</td>
                           <td className="px-8 py-6 text-right">
                              <div className="flex items-center justify-end gap-5">
                                 <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${bill.status === 'Paid'
                                       ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                       : 'bg-amber-50 text-amber-600 border-amber-100'
                                    }`}>
                                    {bill.status}
                                 </span>
                                 <button className="p-2.5 text-slate-300 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all" title="Download Invoice">
                                    <Download size={16} strokeWidth={3} />
                                 </button>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
   )
}

export default MyBills
