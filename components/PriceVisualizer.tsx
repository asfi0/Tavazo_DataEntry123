
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ReferenceArea, ReferenceLine, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { AnchorStatus } from '../types';

interface PriceVisualizerProps {
  retailPrice: number;
  anchorMedian: number;
  lowerBound: number;
  upperBound: number;
  status: AnchorStatus;
  isVatIncluded: boolean;
  onToggleVat: (val: boolean) => void;
}

export const PriceVisualizer: React.FC<PriceVisualizerProps> = ({ 
  retailPrice, 
  anchorMedian, 
  lowerBound, 
  upperBound,
  status,
  isVatIncluded,
  onToggleVat
}) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 50);
    return () => clearTimeout(timer);
  }, []);

  if (status === AnchorStatus.UNKNOWN) {
    return (
      <div className="h-64 flex items-center justify-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
        <div className="text-center">
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-1">Intelligence Gap</p>
          <p className="text-slate-500 font-medium text-sm">No Anchor Data Available</p>
        </div>
      </div>
    );
  }

  const data = [
    { name: 'TAVAAZO SRP', price: retailPrice },
    { name: 'Anchor Median', price: anchorMedian }
  ];

  const isPass = retailPrice >= lowerBound && retailPrice <= upperBound;
  const bandColor = status === AnchorStatus.ACTIVE ? '#DCFCE7' : '#FEF3C7';
  const medianColor = status === AnchorStatus.ACTIVE ? '#15803D' : '#B45309';

  return (
    <div className="h-[300px] w-full relative bg-white rounded-xl flex flex-col pt-2">
      <div className="flex justify-between items-center px-4 mb-2">
        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
          {isVatIncluded ? 'Gross (Consumer)' : 'Net (Business)'} View
        </div>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md">
           <button 
             onClick={() => onToggleVat(false)} 
             className={`px-2 py-1 text-[8px] font-bold rounded transition-all ${!isVatIncluded ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
           >
             EX-VAT
           </button>
           <button 
             onClick={() => onToggleVat(true)} 
             className={`px-2 py-1 text-[8px] font-bold rounded transition-all ${isVatIncluded ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
           >
             INCL-VAT
           </button>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        {!isReady ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50/30">
             <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <ResponsiveContainer width="99%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} 
              />
              <YAxis 
                domain={['auto', 'auto']} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94A3B8', fontSize: 10 }} 
                tickFormatter={(val) => `€${val.toFixed(2)}`}
              />
              <Tooltip 
                cursor={{ fill: '#F8FAFC' }}
                formatter={(value: number) => [`€${value.toFixed(2)}`, isVatIncluded ? 'Price (Gross)' : 'Price (Net)']}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: '1px solid #E2E8F0', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  fontSize: '11px',
                  fontWeight: 'bold'
                }}
              />
              
              <ReferenceArea 
                y1={lowerBound} 
                y2={upperBound} 
                fill={bandColor} 
                stroke="none"
                fillOpacity={0.5}
              />
              
              <ReferenceLine 
                y={anchorMedian} 
                stroke={medianColor} 
                strokeWidth={2} 
                strokeDasharray="4 4" 
                label={{ 
                  position: 'right', 
                  value: 'MEDIAN', 
                  fill: medianColor, 
                  fontSize: 9, 
                  fontWeight: 800
                }} 
              />

              <Bar dataKey="price" radius={[6, 6, 0, 0]} barSize={40}>
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.name === 'TAVAAZO SRP' ? (isPass ? '#10B981' : '#EF4444') : '#94A3B8'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
