import React from 'react';

export const CardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl p-5 border border-slate-200 animate-pulse space-y-3">
    <div className="flex items-center justify-between">
      <div className="h-3 bg-slate-200 rounded w-24"></div>
      <div className="h-8 w-8 bg-slate-200 rounded-xl"></div>
    </div>
    <div className="h-8 bg-slate-200 rounded w-16"></div>
    <div className="h-3 bg-slate-200 rounded w-32"></div>
  </div>
);

export const TableRowSkeleton: React.FC = () => (
  <tr className="animate-pulse">
    <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
    <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
    <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
    <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-40"></div></td>
    <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
    <td className="py-4 px-4"><div className="h-6 bg-slate-200 rounded-full w-20"></div></td>
    <td className="py-4 px-4 text-center"><div className="h-7 bg-slate-200 rounded-lg w-16 mx-auto"></div></td>
  </tr>
);
