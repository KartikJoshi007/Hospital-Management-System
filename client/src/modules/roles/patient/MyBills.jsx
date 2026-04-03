import { useState } from 'react'
import {
   CreditCard,
   ArrowLeft,
   Download,
   CheckCircle2,
   Timer,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ModernTable from './ModernTable'

const bills = [
   { id: 'INV-4482', description: 'Emergency Consultation + Tests', date: '2023-10-24', amount: '₹1240.00', status: 'Paid', method: 'UPI' },
   { id: 'INV-4481', description: 'Post-Surgery Pharmacy Bundle', date: '2023-10-12', amount: '₹4800.00', status: 'Paid', method: 'Card' },
   { id: 'INV-4480', description: 'Diagnostic Scan (Chest X-Ray)', date: '2023-09-28', amount: '₹1500.00', status: 'Pending', method: '---' },
   { id: 'INV-4479', description: 'General Physician Visit', date: '2023-09-15', amount: '₹800.00', status: 'Paid', method: 'Cash' },
   { id: 'INV-4478', description: 'Cardiology Specialist Consult', date: '2023-08-30', amount: '₹1200.00', status: 'Paid', method: 'Net Banking' },
]

function MyBills() {
   const navigate = useNavigate()

   const tableHeaders = ['Invoice ID', 'Description', 'Date', 'Amount', 'Status & Action']

   const renderBillRow = (bill) => (
      <tr key={bill.id} className="hover:bg-slate-50/50 transition-all group">
         <td className="px-6 py-8 text-sm font-black text-slate-900 leading-none">{bill.id}</td>
         <td className="px-6 py-8">
            <div className="text-center">
               <p className="text-base font-black text-slate-800 leading-tight truncate max-w-[250px] mx-auto">{bill.description}</p>
               <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2 leading-none">
                  {bill.status === 'Paid' ? `PAID VIA ${bill.method}` : 'SETTLEMENT PENDING'}
               </p>
            </div>
         </td>
         <td className="px-6 py-8 text-sm font-black text-slate-600 whitespace-nowrap leading-none text-center">
            {new Date(bill.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
         </td>
         <td className="px-6 py-8 text-base font-black text-slate-900 leading-none text-center">{bill.amount}</td>
         <td className="px-6 py-8 text-center">
            <div className="flex items-center justify-center gap-4">
               <span className={`inline-flex px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${bill.status === 'Paid'
                     ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                     : 'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                  {bill.status}
               </span>
               <button className="p-2.5 text-slate-300 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition-all" title="Download Invoice">
                  <Download size={18} strokeWidth={3} />
               </button>
            </div>
         </td>
      </tr>
   );

   return (
      <div className="space-y-6 pb-10 animate-in fade-in duration-500 w-full px-2 sm:px-4 max-w-[100vw] overflow-x-hidden">

         {/* Header Section */}
         <div className="p-6 sm:p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden">
            <div className="min-w-0">
               <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 border-l-4 border-emerald-500 pl-4 uppercase leading-none truncate">Billing & Invoices</h1>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-3 pl-5 line-clamp-1 sm:line-clamp-none">Review your payment history and download records</p>
            </div>
            <button
               onClick={() => navigate(-1)}
               className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors shrink-0 outline-none"
            >
               <ArrowLeft size={16} strokeWidth={3} />
               Back
            </button>
         </div>

         {/* Stats Grid */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 font-black uppercase tracking-widest text-[11px]">
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 group hover:shadow-md transition-all">
               <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-500 group-hover:text-white transition-all border border-emerald-100 shrink-0 shadow-sm shadow-emerald-50">
                  <CheckCircle2 size={24} strokeWidth={3} />
               </div>
               <div className="min-w-0">
                  <p className="text-slate-400 mb-1.5 leading-none truncate">Paid Invoices</p>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">4</p>
               </div>
            </div>
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 group hover:shadow-md transition-all">
               <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl group-hover:bg-amber-500 group-hover:text-white transition-all border border-amber-100 shrink-0 shadow-sm shadow-amber-50">
                  <Timer size={24} strokeWidth={3} />
               </div>
               <div className="min-w-0">
                  <p className="text-slate-400 mb-1.5 leading-none truncate">Pending Settlement</p>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">1</p>
               </div>
            </div>
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 group hover:shadow-md transition-all">
               <div className="p-3.5 bg-slate-50 text-slate-600 rounded-2xl group-hover:bg-slate-900 group-hover:text-white transition-all border border-slate-100 shrink-0 shadow-sm">
                  <CreditCard size={24} strokeWidth={3} />
               </div>
               <div className="min-w-0">
                  <p className="text-slate-400 mb-1.5 leading-none truncate">Total Billed</p>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900 leading-none truncate">₹9,540.00</p>
               </div>
            </div>
         </div>

         {/* Billing Table Card */}
         <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
            <div className="p-6 sm:p-8 border-b border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-5">
               <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-l-4 border-emerald-500 pl-4 leading-none truncate">Billing History</h3>
               <button className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3 rounded-xl border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all outline-none">
                  Download Statement <Download size={16} strokeWidth={3} />
               </button>
            </div>

            <div className="p-2 sm:p-4">
              <ModernTable 
                 headers={tableHeaders} 
                 data={bills} 
                 renderRow={renderBillRow} 
              />
            </div>
         </div>
      </div>
   )
}

export default MyBills
