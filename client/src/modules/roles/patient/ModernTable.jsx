import React from 'react';

const ModernTable = ({ headers, data, renderRow }) => {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 shadow-sm transition-all hover:shadow-md bg-white overflow-visible">
      <div className="overflow-x-auto scrollbar-hide rounded-[1.5rem]">
        <table className="min-w-full divide-y divide-slate-100 table-fixed sm:table-auto">
          <thead className="bg-slate-50/50">
            <tr>
              {headers.map((header, idx) => (
                <th 
                  key={idx} 
                  className={`px-6 py-5 whitespace-nowrap text-[11px] font-black uppercase tracking-widest text-slate-400 ${idx === 0 ? 'text-left' : 'text-center'}`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50 overflow-visible">
            {data.length > 0 ? (
              data.map((item, idx) => renderRow(item, idx))
            ) : (
              <tr>
                <td colSpan={headers.length} className="px-6 py-24 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-[1.5rem] bg-slate-50 text-slate-300 mb-4 border border-slate-100 shadow-inner">
                    <svg size={24} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  </div>
                  <h3 className="text-slate-900 font-extrabold text-sm uppercase tracking-widest">No matching records</h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">Adjust your search or filter criteria</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ModernTable;
