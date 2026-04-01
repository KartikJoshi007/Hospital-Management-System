import { useState } from 'react'
import { 
   CreditCard, 
   ArrowUpRight, 
   ArrowLeft,
   Clock, 
   Wallet,
   Activity,
   Calendar,
   AlertCircle
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import BillingRow from '../../../components/patientcomponents/BillingRow'

const bills = [
   { id: 'INV-4482', description: 'Emergency Consultation + Tests', date: 'Oct 24, 2023', amount: '₹1240.00', status: 'Paid', method: 'UPI' },
   { id: 'INV-4481', description: 'Post-Surgery Pharmacy Bundle', date: 'Oct 12, 2023', amount: '₹4800.00', status: 'Paid', method: 'Card' },
   { id: 'INV-4480', description: 'Diagnostic Scan (Chest X-Ray)', date: 'Sep 28, 2023', amount: '₹1500.00', status: 'Pending', method: '---' },
   { id: 'INV-4479', description: 'General Physician Visit', date: 'Sep 15, 2023', amount: '₹800.00', status: 'Paid', method: 'Cash' },
   { id: 'INV-4478', description: 'Cardiology Specialist Consult', date: 'Aug 30, 2023', amount: '₹1200.00', status: 'Paid', method: 'Net Banking' },
]

function MyBills() {
   const [loading, setLoading] = useState(false)
   const navigate = useNavigate()

   const handlePay = (id) => {
      setLoading(true)
      setTimeout(() => {
         setLoading(false)
         alert(`Initiating payment for ${id}...`)
      }, 1000)
   }

   return (
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pb-10">
         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col gap-1">
               <button 
                  onClick={() => navigate(-1)} 
                  className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-emerald-500 transition-colors uppercase tracking-widest mb-2 group w-fit"
               >
                  <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                  Go Back
               </button>
               <h1 className="text-3xl font-black tracking-tight text-slate-900 italic">My Bills & Invoices</h1>
               <p className="text-slate-500 font-bold text-sm tracking-wide">You have {bills.length} total bills and invoices.</p>
            </div>

            <button className="flex items-center gap-3 px-8 py-4 bg-[#0F172A] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl active:scale-95 group">
               <Wallet size={16} />
               Add Payment Method
               <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
         </div>

         {/* Billing Ledger */}
         <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-10 px-2">
               <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest border-l-4 border-emerald-500 pl-4">Bill History</h3>
               <div className="flex gap-2">
                  <button className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-emerald-500 transition-colors">
                     <Clock size={16} />
                  </button>
               </div>
            </div>

            <div className="overflow-x-auto scroller-hide">
               <table className="w-full min-w-[800px]">
                  <thead>
                     <tr className="border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <th className="text-left py-4 px-4">Bill Details</th>
                        <th className="text-left py-4 px-4">Date</th>
                        <th className="text-left py-4 px-4">Amount</th>
                        <th className="text-left py-4 px-4">Status</th>
                        <th className="text-left py-4 px-4">Paid Via</th>
                        <th className="text-right py-4 px-4">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {bills.map((bill) => (
                        <BillingRow
                           key={bill.id}
                           {...bill}
                           onPay={handlePay}
                           loading={loading}
                        />
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
   )
}

export default MyBills
