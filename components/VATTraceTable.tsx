
import React from 'react';
import { VATStage } from '../types';

interface VATTraceTableProps {
  stages: VATStage[];
}

export const VATTraceTable: React.FC<VATTraceTableProps> = ({ stages }) => {
  const totalCashImpact = stages.reduce((acc, stage) => acc + stage.cashImpact, 0);

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-left border-collapse text-xs">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-3 py-2 font-bold text-slate-500 uppercase">Stage</th>
            <th className="px-3 py-2 font-bold text-slate-500 uppercase">Actor</th>
            <th className="px-3 py-2 font-bold text-slate-500 uppercase text-right">VAT Rate</th>
            <th className="px-3 py-2 font-bold text-slate-500 uppercase text-right">Collected</th>
            <th className="px-3 py-2 font-bold text-slate-500 uppercase text-right">Reclaimed</th>
            <th className="px-3 py-2 font-bold text-slate-500 uppercase text-right">Cash Impact</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {stages.map((stage, idx) => (
            <tr key={idx} className="hover:bg-slate-50 transition-colors">
              <td className="px-3 py-2 font-medium text-slate-700">{stage.stage}</td>
              <td className="px-3 py-2 text-slate-600">{stage.actor}</td>
              <td className="px-3 py-2 text-right text-slate-500">{(stage.vatRate * 100).toFixed(1)}%</td>
              <td className="px-3 py-2 text-right text-slate-900">€{stage.vatCollected.toFixed(2)}</td>
              <td className="px-3 py-2 text-right text-emerald-600">€{stage.vatReclaimed.toFixed(2)}</td>
              <td className={`px-3 py-2 text-right font-mono font-bold ${stage.cashImpact > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                €{stage.cashImpact.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
          <tr>
            <td colSpan={5} className="px-3 py-2 text-right uppercase text-slate-500">Net Tax Float Impact</td>
            <td className="px-3 py-2 text-right font-mono text-slate-900">€{totalCashImpact.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
