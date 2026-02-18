
import React from 'react';
import { Country } from '../types';

interface MarketSelectorProps {
  currentCountry: Country;
  onCountryChange: (country: Country) => void;
}

export const MarketSelector: React.FC<MarketSelectorProps> = ({ currentCountry, onCountryChange }) => {
  return (
    <div className="flex bg-slate-200 p-1 rounded-lg">
      <button
        onClick={() => onCountryChange(Country.DE)}
        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
          currentCountry === Country.DE
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        Germany (DE)
      </button>
      <button
        onClick={() => onCountryChange(Country.FR)}
        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
          currentCountry === Country.FR
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        France (FR)
      </button>
    </div>
  );
};
