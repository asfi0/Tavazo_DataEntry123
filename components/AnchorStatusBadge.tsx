
import React from 'react';
import { AnchorStatus, Brand } from '../types';

interface AnchorStatusBadgeProps {
  status: AnchorStatus;
  brand: Brand;
}

export const AnchorStatusBadge: React.FC<AnchorStatusBadgeProps> = ({ status, brand }) => {
  const config = {
    [AnchorStatus.ACTIVE]: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-800',
      dot: 'bg-emerald-600',
      label: `Anchor: ${brand}`,
      tooltip: 'Primary pricing anchor active'
    },
    [AnchorStatus.FALLBACK]: {
      bg: 'bg-amber-100',
      text: 'text-amber-800',
      dot: 'bg-amber-600',
      label: `Anchor: ${brand} (Fallback)`,
      tooltip: 'Fallback anchor due to insufficient Laziza data'
    },
    [AnchorStatus.UNKNOWN]: {
      bg: 'bg-slate-100',
      text: 'text-slate-800',
      dot: 'bg-slate-600',
      label: 'Anchor Unavailable',
      tooltip: 'Insufficient anchor data — pricing cannot be approved'
    }
  };

  const style = config[status];

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${style.bg} ${style.text} text-xs font-bold border border-current opacity-90 transition-all cursor-help`} title={style.tooltip}>
      <span className={`w-2 h-2 rounded-full ${style.dot} animate-pulse`}></span>
      {style.label}
    </div>
  );
};
