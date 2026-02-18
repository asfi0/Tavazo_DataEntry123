import React from 'react';
import { MarketPrice, Brand } from '../types';
import { BRAND_CONFIG } from '../constants';

interface IntelligenceTableProps {
  data: MarketPrice[];
  activeAnchor: Brand;
}

export const IntelligenceTable: React.FC<IntelligenceTableProps> = ({ data, activeAnchor }) => {
  const getSourceUrl = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'amazon.de': return 'https://www.amazon.de';
      case 'amazon.fr': return 'https://www.amazon.fr';
      case 'jamoona': return 'https://www.jamoona.com';
      case 'indianstore.de': return 'https://www.indianstore.de';
      case 'asiashop online': return 'https://www.asiashop-online.de';
      case 'getir': return 'https://getir.com/de';
      case 'rewe online': return 'https://shop.rewe.de';
      case 'carrefour': return 'https://www.carrefour.fr';
      case 'monoprix': return 'https://www.monoprix.fr';
      case 'asian mart': 
      case 'asian market fr': return 'https://www.asian-market.eu';
      default: return '#';
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Platform</th>
            <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Brand</th>
            <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Product</th>
            <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Shelf Price</th>
            <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Normalized</th>
            <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Confidence</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((item) => {
            const isAnchor = item.brand === activeAnchor;
            const config = BRAND_CONFIG[item.brand];
            return (
              <tr key={item.id} className={`${isAnchor ? 'bg-emerald-50/30 font-medium' : 'text-slate-600 bg-white opacity-80'} hover:bg-slate-50/50 transition-colors`}>
                <td className="px-4 py-3 text-sm">
                  <a 
                    href={getSourceUrl(item.platform)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:text-emerald-600 hover:underline transition-all group"
                    title={`View source on ${item.platform}`}
                  >
                    {item.platform}
                    <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{item.brand}</span>
                    <span 
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-tighter"
                      style={{ backgroundColor: `${config.color}20`, color: config.color, border: `1px solid ${config.color}40` }}
                    >
                      {config.label}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm truncate max-w-[200px]">{item.productTitle}</td>
                <td className="px-4 py-3 text-sm font-mono font-semibold">€{item.shelfPrice.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm font-mono">€{item.normalizedPrice.toFixed(2)} / 100g</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    item.confidence === 'HIGH' ? 'bg-green-100 text-green-700' : 
                    item.confidence === 'MEDIUM' ? 'bg-blue-100 text-blue-700' : 
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {item.confidence}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};