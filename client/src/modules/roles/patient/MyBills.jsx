import { useState, useEffect } from 'react'
import {
   CreditCard,
   ArrowLeft,
   Download,
   CheckCircle2,
   Timer,
   Loader2,
   TrendingUp,
   Wallet
} from 'lucide-react'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import ModernTable from './ModernTable'
import useAuth from '../../../hooks/useAuth'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { getPatientByUserId } from '../../patients/patientApi'
import { getBillsByPatient } from '../../billing/billingApi'

function MyBills() {
   const navigate = useNavigate()
   const { user } = useAuth()
   
   const [bills, setBills] = useState([])
   const [loading, setLoading] = useState(true)
   const [patientId, setPatientId] = useState(null)

   useEffect(() => {
      const fetchBills = async () => {
         try {
            setLoading(true)
            const pRes = await getPatientByUserId(user.id)
            const p = pRes.data
            setPatientId(p?._id)
            
            if (p?._id) {
               const bData = await getBillsByPatient(p._id)
               setBills(bData || [])
            }
         } catch (err) {
            console.error('Failed to fetch bills:', err)
         } finally {
            setLoading(false)
         }
      }
      if (user?.id) fetchBills()
   }, [user.id])

   const stats = {
      paid: bills.filter(b => b.paymentStatus === 'Paid' || b.status === 'Paid').length,
      pending: bills.filter(b => b.paymentStatus === 'Pending' || b.status === 'Pending').length,
      total: bills.reduce((acc, curr) => acc + (curr.amount || 0), 0)
   }

   const downloadInvoice = (bill) => {
      try {
         const doc = new jsPDF()
         const pageWidth = doc.internal.pageSize.getWidth()

         // -- Header --
         doc.setFontSize(22); doc.setTextColor(30, 41, 59); doc.setFont("helvetica", "bold")
         doc.text("LIFELINE HOSPITAL", 20, 30)
         
         doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(100, 100, 100)
         doc.text("123 Health Ave, Medical District", 20, 38)
         doc.text("Contact: +91 9876543210 | info@lifelinehospital.com", 20, 43)

         // -- Invoice Info --
         doc.setFontSize(16); doc.setFont("helvetica", "bold"); doc.setTextColor(79, 70, 229)
         doc.text("INVOICE", pageWidth - 50, 30)
         
         doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(100, 100, 100)
         doc.text(`No: #${(bill._id || "NEW").slice(-6).toUpperCase()}`, pageWidth - 50, 38)
         doc.text(`Date: ${new Date(bill.date || bill.createdAt).toLocaleDateString()}`, pageWidth - 50, 43)

         doc.setDrawColor(241, 245, 249); doc.line(20, 55, pageWidth - 20, 55)

         // -- Details --
         doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 41, 59)
         doc.text("PATIENT NAME", 20, 68)
         doc.setFont("helvetica", "normal"); doc.text(bill.patientName || user?.fullName || "Patient", 20, 75)

         doc.setFont("helvetica", "bold"); doc.text("PAYMENT STATUS", pageWidth / 2, 68)
         doc.setFont("helvetica", "normal")
         if (bill.paymentStatus === "Paid") doc.setTextColor(16, 185, 129); else doc.setTextColor(249, 115, 22)
         doc.text((bill.paymentStatus || "PENDING").toUpperCase(), pageWidth / 2, 75)

         doc.setTextColor(30, 41, 59); doc.setFont("helvetica", "bold")
         doc.text("DEPARTMENT", pageWidth - 60, 68)
         doc.setFont("helvetica", "normal"); doc.text(bill.type || "General", pageWidth - 60, 75)

         // -- Table --
         autoTable(doc, {
            startY: 90,
            head: [["Service Description", "Unit Price", "Qty", "Total Amount"]],
            body: [[bill.service || "Medical Care", `Rs. ${(bill.amount || 0).toLocaleString()}`, "1", `Rs. ${(bill.amount || 0).toLocaleString()}`]],
            theme: 'grid',
            headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
            columnStyles: { 0: { cellWidth: 95 }, 1: { halign: 'right' }, 2: { halign: 'center' }, 3: { halign: 'right', fontStyle: 'bold' } }
         })

         const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 150
         doc.setDrawColor(241, 245, 249); doc.setFillColor(248, 250, 252)
         doc.roundedRect(pageWidth - 95, finalY, 75, 22, 3, 3, 'FD')
         doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(100, 116, 139)
         doc.text("GRAND TOTAL", pageWidth - 90, finalY + 13)
         doc.setFontSize(13); doc.setTextColor(30, 41, 59)
         doc.text(`Rs. ${(bill.amount || 0).toLocaleString()}`, pageWidth - 25, finalY + 14, { align: "right" })

         doc.save(`Invoice_${(bill.patientName || "Patient").replace(/\s+/g, '_')}_${(bill._id || "ID").slice(-4)}.pdf`)
      } catch (err) {
         console.error("PDF Export failed:", err)
         toast.error("Failed to generate PDF. Please try again.")
      }
   }

   const downloadStatement = () => {
      if (!bills.length) return
      const header = 'Invoice ID,Service,Date,Amount (₹),Status,Payment Method,Type'
      const rows = bills.map(b => {
         const id = b._id?.slice(-8).toUpperCase() || 'INV-0000'
         const svc = (b.service || b.notes || 'Medical Service').replace(/"/g, '""')
         const dt = new Date(b.date || b.createdAt).toLocaleDateString('en-IN')
         const amt = b.amount || 0
         const st = b.paymentStatus || b.status || 'N/A'
         const pm = b.paymentMethod || 'N/A'
         const tp = b.type || 'General'
         return `"${id}","${svc}","${dt}",${amt},"${st}","${pm}","${tp}"`
      })
      const footer = `\n\n"TOTAL","","",${stats.total},"","",""`
      const csv = header + '\n' + rows.join('\n') + footer
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url
      a.download = `Billing_Statement_${new Date().toISOString().slice(0, 10)}.csv`
      a.click(); URL.revokeObjectURL(url)
   }

   const tableHeaders = ['Ref ID', 'Description / Service', 'Date', 'Amount', 'Status']

   const renderBillRow = (bill) => (
      <tr key={bill._id} className="hover:bg-slate-50/50 transition-all group">
         <td className="px-6 py-4 text-[11px] font-black text-slate-400 leading-none truncate max-w-[80px] text-center">
           #{bill._id?.slice(-8).toUpperCase() || 'INV-0000'}
         </td>
         <td className="px-6 py-4">
            <div className="flex flex-col items-center text-center">
               <p className="text-sm font-black text-slate-800 leading-tight truncate max-w-[300px]">
                 {bill.service || bill.notes || 'Medical Service'}
               </p>
               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 leading-none">
                  {bill.paymentStatus === 'Paid' ? `VIA ${bill.paymentMethod || 'CASH'}` : 'PENDING SETTLEMENT'}
               </p>
            </div>
         </td>
         <td className="px-6 py-4 text-xs font-black text-slate-600 whitespace-nowrap leading-none text-center">
            {new Date(bill.date || bill.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
         </td>
         <td className="px-6 py-4 text-sm font-black text-slate-950 leading-none text-center">
           ₹{bill.amount?.toLocaleString('en-IN') || '0.00'}
         </td>
         <td className="px-6 py-4 text-center">
            <div className="flex items-center justify-center gap-3">
               <span className={`inline-flex px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${bill.paymentStatus === 'Paid'
                     ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                     : 'bg-amber-50 text-amber-600 border-amber-100'
                   }`}>
                  {bill.paymentStatus}
               </span>
               <button onClick={() => downloadInvoice(bill)} className="p-2 text-slate-300 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition-all outline-none">
                  <Download size={16} strokeWidth={3} />
               </button>
            </div>
         </td>
      </tr>
   );

   return (
      <div className="space-y-6 pb-10 animate-in fade-in duration-700 w-full px-2 sm:px-4 max-w-[100vw] overflow-x-hidden">
         
         {/* 🏙️ Billing Hero Area */}
         <div className="bg-slate-900 px-8 py-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
               <div>
                  <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2 leading-none">Financial Desk</p>
                  <h1 className="text-3xl sm:text-4xl font-black text-white leading-none tracking-tight">Billing & Invoices</h1>
                  <p className="text-slate-400 text-xs font-bold mt-4 opacity-80 decoration-emerald-500/30 underline underline-offset-4">Manage settlements and download clinical invoices.</p>
               </div>
               <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors shrink-0 outline-none">
                  <ArrowLeft size={16} strokeWidth={3} /> Back
               </button>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-emerald-500/20 transition-all duration-700" />
         </div>

         {loading ? (
            <div className="py-24 flex flex-col items-center justify-center text-slate-300 gap-4">
               <Loader2 className="animate-spin text-emerald-500" size={32} strokeWidth={3} />
               <p className="text-[10px] font-black uppercase tracking-widest">Compiling Financial Data...</p>
            </div>
         ) : (
            <>
               {/* 📊 Rapid Financial Stats Ribbon */}
               <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden px-4 py-6 sm:px-8">
                  <div className="flex flex-wrap items-center justify-between gap-y-6">
                     <div className="flex items-center gap-4 flex-1 min-w-[140px] justify-center sm:justify-start sm:border-r border-slate-100">
                        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-500 shrink-0"><CheckCircle2 size={18} strokeWidth={3} /></div>
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Settled Bills</p>
                           <h3 className="text-sm sm:text-base font-black text-slate-900 leading-none">{stats.paid}</h3>
                        </div>
                     </div>
                     <div className="flex items-center gap-4 flex-1 min-w-[140px] justify-center sm:justify-start sm:border-r border-slate-100">
                        <div className="p-2.5 rounded-xl bg-amber-50 text-amber-500 shrink-0"><Timer size={18} strokeWidth={3} /></div>
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Pending</p>
                           <h3 className="text-sm sm:text-base font-black text-slate-900 leading-none">{stats.pending}</h3>
                        </div>
                     </div>
                     <div className="flex items-center gap-4 flex-1 min-w-[140px] justify-center sm:justify-start">
                        <div className="p-2.5 rounded-xl bg-slate-50 text-slate-900 shrink-0"><TrendingUp size={18} strokeWidth={3} /></div>
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Total Billed</p>
                           <h3 className="text-sm sm:text-base font-black text-slate-900 leading-none">₹{stats.total.toLocaleString('en-IN')}</h3>
                        </div>
                     </div>
                  </div>
               </div>

               {/* 🧾 Invoices Table Section */}
               <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
                  <div className="px-8 py-6 border-b border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-5 bg-slate-50/30">
                     <div className="flex items-center gap-3">
                        <Wallet size={16} className="text-emerald-500" strokeWidth={3} />
                        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">Transaction Log</h3>
                     </div>
                     <button onClick={downloadStatement} disabled={!bills.length} className="flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all outline-none disabled:opacity-40 disabled:scale-100 shadow-xl active:scale-95">
                        Download Full Statement <Download size={14} strokeWidth={4} />
                     </button>
                  </div>

                  <div className="p-2 sm:p-4">
                     <ModernTable 
                        headers={tableHeaders} 
                        data={bills} 
                        renderRow={renderBillRow} 
                        centerAllHeaders={true}
                     />
                     {bills.length === 0 && (
                        <div className="py-24 text-center flex flex-col items-center gap-4 opacity-40">
                           <CreditCard size={48} strokeWidth={1} className="text-slate-300" />
                           <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No active financial history</p>
                        </div>
                     )}
                  </div>
               </div>
            </>
         )}
      </div>
   )
}

export default MyBills
