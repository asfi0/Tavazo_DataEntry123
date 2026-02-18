
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Country, Brand, SKU, MarketPrice, AnchorStatus, GuardrailStatus, PricingState, AnchorBand, AgentLog, TransactionRoute, VATStage } from './types';
import { SKUS, VAT_CONFIG } from './constants';
import { MarketSelector } from './components/MarketSelector';
import { AnchorStatusBadge } from './components/AnchorStatusBadge';
import { IntelligenceTable } from './components/IntelligenceTable';
import { PriceVisualizer } from './components/PriceVisualizer';
import { VATTraceTable } from './components/VATTraceTable';
import { fetchStrategy } from './services/aiService';

const App: React.FC = () => {
  const [currentCountry, setCurrentCountry] = useState<Country>(Country.DE);
  const [selectedSkuId, setSelectedSkuId] = useState<number>(1);
  const [pricing, setPricing] = useState<PricingState>({
    brandMargin: 0.25,
    distributorMargin: 0.20,
    retailerMargin: 0.35,
    vatRate: 0.07,
    isVatDeferred: true,
    isVatIncluded: true,
    customerType: 'DTC',
    route: TransactionRoute.DIRECT_IMPORT,
    vatReturnCycle: 30
  });
  
  const [intelligence, setIntelligence] = useState<MarketPrice[]>([]);
  const [isScraping, setIsScraping] = useState(false);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showVatTrace, setShowVatTrace] = useState(false);

  const selectedSku = useMemo(() => SKUS.find(s => s.id === selectedSkuId)!, [selectedSkuId]);

  // Sync pricing.vatRate when country or SKU changes
  useEffect(() => {
    const config = VAT_CONFIG[currentCountry];
    const newRate = selectedSku.vatType === 'Reduced' ? config.Reduced : config.Standard;
    setPricing(prev => ({ ...prev, vatRate: newRate }));
  }, [currentCountry, selectedSku]);

  const addLog = useCallback((message: string, level: AgentLog['level'] = 'info') => {
    setLogs(prev => [{ timestamp: new Date().toISOString(), message, level }, ...prev].slice(0, 50));
  }, []);

  const scrapeMarketData = useCallback(() => {
    setIsScraping(true);
    addLog(`Initiating market scrape for ${currentCountry}...`, 'info');
    
    setTimeout(() => {
      const mockData: MarketPrice[] = [];
      const brands = Object.values(Brand);
      const basePrice = currentCountry === Country.DE ? 1.95 : 2.15;
      const platforms = currentCountry === Country.DE 
        ? ['Amazon.de', 'Jamoona', 'IndianStore.de']
        : ['Amazon.fr', 'Monoprix', 'Carrefour'];

      brands.forEach(brand => {
        const sampleCount = brand === Brand.LAZIZA ? 4 : 2;
        for (let i = 0; i < sampleCount; i++) {
          const variance = (Math.random() - 0.5) * 0.4;
          const price = basePrice + variance;
          mockData.push({
            id: `${brand}-${i}-${Math.random()}`,
            brand: brand,
            productTitle: `${brand} ${selectedSku.description}`,
            shelfPrice: price,
            normalizedPrice: price, 
            metric: 'EUR_PER_100G',
            confidence: 'HIGH',
            timestamp: new Date().toISOString(),
            platform: platforms[Math.floor(Math.random() * platforms.length)]
          });
        }
      });
      setIntelligence(mockData);
      setIsScraping(false);
      addLog(`Market intelligence gathered for ${selectedSku.description}`, 'success');
    }, 800);
  }, [currentCountry, selectedSku.description, addLog]);

  useEffect(() => { scrapeMarketData(); }, [currentCountry, selectedSkuId, scrapeMarketData]);

  const anchorBand = useMemo((): AnchorBand => {
    const samples = intelligence.filter(i => i.brand === Brand.LAZIZA);
    if (samples.length < 2) return { brand: Brand.LAZIZA, median: 0, lower: 0, upper: 0, status: AnchorStatus.UNKNOWN };
    
    const prices = samples.map(s => s.normalizedPrice).sort((a, b) => a - b);
    const median = prices[Math.floor(prices.length / 2)];
    return { brand: Brand.LAZIZA, median, lower: median * 0.90, upper: median * 1.10, status: AnchorStatus.ACTIVE };
  }, [intelligence]);

  const chainAnalysis = useMemo(() => {
    const cost = selectedSku.cost;
    const dbp = cost / (1 - pricing.brandMargin);
    const dsp = dbp / (1 - pricing.distributorMargin);
    const retailNet = dsp / (1 - pricing.retailerMargin);
    const vatAmount = retailNet * pricing.vatRate;
    const srp = retailNet + vatAmount;

    // VAT Trace Generation
    const stages: VATStage[] = [
      {
        stage: 'Import',
        actor: 'Importer (TAVAAZO)',
        netPrice: cost,
        vatRate: pricing.vatRate,
        vatCollected: 0,
        vatReclaimed: pricing.isVatDeferred ? cost * pricing.vatRate : 0,
        cashImpact: pricing.isVatDeferred ? 0 : cost * pricing.vatRate,
        notes: pricing.isVatDeferred ? 'Postponed accounting applied' : 'Cash outlay at border'
      },
      {
        stage: 'Distribution Sale',
        actor: 'Distributor',
        netPrice: dsp,
        vatRate: pricing.vatRate,
        vatCollected: dsp * pricing.vatRate,
        vatReclaimed: dbp * pricing.vatRate,
        cashImpact: (dsp - dbp) * pricing.vatRate,
        notes: 'Domestic B2B VAT cycle'
      },
      {
        stage: 'Retail Sale',
        actor: 'Final Consumer',
        netPrice: retailNet,
        vatRate: pricing.vatRate,
        vatCollected: vatAmount,
        vatReclaimed: 0,
        cashImpact: vatAmount,
        notes: 'Final tax incidence'
      }
    ];

    const displayPrice = pricing.isVatIncluded ? srp : retailNet;
    const displayMedian = pricing.isVatIncluded ? anchorBand.median : (anchorBand.median / (1 + pricing.vatRate));
    const displayLower = pricing.isVatIncluded ? anchorBand.lower : (anchorBand.lower / (1 + pricing.vatRate));
    const displayUpper = pricing.isVatIncluded ? anchorBand.upper : (anchorBand.upper / (1 + pricing.vatRate));

    return { dbp, dsp, retailNet, srp, vatAmount, stages, displayPrice, displayMedian, displayLower, displayUpper };
  }, [selectedSku, pricing, anchorBand]);

  const handleExportText = useCallback(() => {
    if (!aiAnalysis) return;
    
    const timestamp = new Date().toLocaleString();
    const content = `TAVAAZO PRICING INTELLIGENCE REPORT
-----------------------------------------
Generated: ${timestamp}
Market: ${currentCountry}
SKU: ${selectedSku.description} (${selectedSku.packSize})
Proposed SRP (Incl. VAT): €${chainAnalysis.srp.toFixed(2)}
Anchor Median: €${anchorBand.median.toFixed(2)}

AI STRATEGY ANALYSIS:
-----------------------------------------
${aiAnalysis}

-----------------------------------------
Proprietary Document - TAVAAZO Global Operations
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TAVAAZO_Strategy_${selectedSku.description.replace(/\s+/g, '_')}_${currentCountry.split(' ')[1].replace(/[()]/g, '')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addLog(`Strategy exported as .txt for ${selectedSku.description}`, 'success');
  }, [aiAnalysis, selectedSku, currentCountry, chainAnalysis.srp, anchorBand.median, addLog]);

  useEffect(() => {
    if (chainAnalysis.srp > 0 && anchorBand.status !== AnchorStatus.UNKNOWN) {
      const timer = setTimeout(() => {
        setIsAnalyzing(true);
        fetchStrategy({
          sku_name: selectedSku.description,
          country: currentCountry,
          cost: selectedSku.cost,
          sell_in: chainAnalysis.dbp,
          retail_price: chainAnalysis.srp,
          anchor_brand: anchorBand.brand,
          anchor_median: anchorBand.median,
          anchor_lower: anchorBand.lower,
          anchor_upper: anchorBand.upper,
          distributor_margin: pricing.distributorMargin,
          retailer_margin: pricing.retailerMargin
        })
        .then(data => {
          setAiAnalysis(data.strategy_text);
          setIsAnalyzing(false);
        })
        .catch(() => setIsAnalyzing(false));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [chainAnalysis.srp, anchorBand, currentCountry, selectedSku]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <img src="https://i.ibb.co/BHMZhNsp/logo.png" alt="TAVAAZO" className="h-10 w-auto object-contain" />
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight leading-none">TAVAAZO PRICING & VAT COMPLIANCE</h1>
            <p className="text-[10px] text-emerald-600 font-bold tracking-widest uppercase mt-1">EU Tax Compliance Engineer • V4.2</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <MarketSelector currentCountry={currentCountry} onCountryChange={setCurrentCountry} />
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
             <button onClick={() => setPricing(p => ({...p, isVatIncluded: true}))} className={`px-3 py-1 text-[10px] font-bold rounded ${pricing.isVatIncluded ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>INCL-VAT</button>
             <button onClick={() => setPricing(p => ({...p, isVatIncluded: false}))} className={`px-3 py-1 text-[10px] font-bold rounded ${!pricing.isVatIncluded ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>EX-VAT</button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <aside className="w-72 border-r border-slate-200 bg-white flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h2 className="text-xs font-bold text-slate-500 uppercase">Portfolio</h2>
            <span className="text-[10px] font-bold text-emerald-600 border border-emerald-200 px-1.5 rounded">EU FOOD RATE</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {SKUS.map((sku) => (
              <button
                key={sku.id}
                onClick={() => setSelectedSkuId(sku.id)}
                className={`w-full text-left p-4 transition-all hover:bg-slate-50 border-l-4 ${
                  selectedSkuId === sku.id ? 'bg-emerald-50 border-emerald-600' : 'border-transparent'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-bold text-slate-400">#{sku.id}</span>
                  <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1 rounded uppercase">{sku.vatType} VAT</span>
                </div>
                <span className={`text-sm font-semibold block ${selectedSkuId === sku.id ? 'text-emerald-900' : 'text-slate-700'}`}>
                  {sku.description}
                </span>
                <span className="text-[11px] text-slate-500">Net Cost: €{sku.cost.toFixed(4)}</span>
              </button>
            ))}
          </div>
        </aside>

        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="p-6 grid grid-cols-12 gap-6">
            
            {/* Board View Metrics */}
            <div className="col-span-12 grid grid-cols-4 gap-4">
               <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">VAT Exposure</p>
                  <p className="text-xl font-mono font-bold text-slate-900">€{chainAnalysis.vatAmount.toFixed(2)}</p>
                  <p className="text-[9px] text-emerald-600 font-bold mt-1 tracking-tight">Per Unit SRP Burden</p>
               </div>
               <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Cash Float</p>
                  <p className="text-xl font-mono font-bold text-slate-900">{pricing.vatReturnCycle} Days</p>
                  <p className="text-[9px] text-amber-600 font-bold mt-1 tracking-tight">Avg Liquidity Lock</p>
               </div>
               <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Importer Mode</p>
                  <p className="text-xl font-bold text-slate-900">{pricing.isVatDeferred ? 'DEFERRED' : 'CASH-SETTLED'}</p>
                  <p className="text-[9px] text-blue-600 font-bold mt-1 tracking-tight">Customs Strategy Active</p>
               </div>
               <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Tax Neutrality</p>
                  <p className="text-xl font-bold text-emerald-600">CERTIFIED</p>
                  <p className="text-[9px] text-slate-400 font-bold mt-1 tracking-tight">EU Art. 138 Compliant</p>
               </div>
            </div>

            {/* Left Column: Engineering */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
              <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h4 className="text-sm font-bold text-slate-800 mb-6 border-b border-slate-100 pb-3 flex justify-between items-center">
                   Margin Engineering
                   <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">Ex-VAT Targets</span>
                </h4>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2 text-xs font-bold uppercase text-slate-600">
                      <span>Brand Margin</span>
                      <span className="text-emerald-600">{(pricing.brandMargin * 100).toFixed(0)}%</span>
                    </div>
                    <input type="range" min="0.10" max="0.60" step="0.01" value={pricing.brandMargin} onChange={(e) => setPricing(p => ({...p, brandMargin: parseFloat(e.target.value)}))} className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer accent-emerald-600" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2 text-xs font-bold uppercase text-slate-600">
                      <span>Distributor Margin</span>
                      <span>{(pricing.distributorMargin * 100).toFixed(0)}%</span>
                    </div>
                    <input type="range" min="0.05" max="0.40" step="0.01" value={pricing.distributorMargin} onChange={(e) => setPricing(p => ({...p, distributorMargin: parseFloat(e.target.value)}))} className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer accent-slate-600" />
                  </div>
                  <div className="pt-6 border-t border-slate-50">
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Net B2B Sale (DSP)</span>
                      <span className="text-sm font-mono font-bold">€{chainAnalysis.dsp.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 mt-2 bg-emerald-50 rounded-lg">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase">Final {pricing.isVatIncluded ? 'Incl' : 'Ex'}-VAT Price</span>
                      <span className="text-lg font-mono font-extrabold text-emerald-900">€{chainAnalysis.displayPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl">
                 <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">VAT Liquidity Simulation</h4>
                 <div className="space-y-4">
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase">VAT Return Cycle (Days)</label>
                      <select value={pricing.vatReturnCycle} onChange={(e) => setPricing(p => ({...p, vatReturnCycle: parseInt(e.target.value)}))} className="w-full mt-1 bg-slate-800 border border-slate-700 text-white text-xs p-2 rounded">
                        <option value={30}>30 Days (Standard)</option>
                        <option value={60}>60 Days (Delayed)</option>
                        <option value={90}>90 Days (Quarterly)</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-3">
                       <input type="checkbox" checked={pricing.isVatDeferred} onChange={(e) => setPricing(p => ({...p, isVatDeferred: e.target.checked}))} className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-600" />
                       <label className="text-[10px] font-bold text-slate-300">Enable Deferred Import VAT</label>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-800">
                       <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500">Working Capital Lock:</span>
                          <span className={`font-mono font-bold ${pricing.isVatDeferred ? 'text-emerald-400' : 'text-rose-400'}`}>
                             €{(pricing.isVatDeferred ? 0 : chainAnalysis.vatAmount).toFixed(2)}
                          </span>
                       </div>
                    </div>
                 </div>
              </section>
            </div>

            {/* Right Column: Intelligence & Strategy */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
              <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                   <div>
                      <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Market Indexing Visualizer</h4>
                   </div>
                   <AnchorStatusBadge status={anchorBand.status} brand={anchorBand.brand} />
                </div>
                <PriceVisualizer 
                  retailPrice={chainAnalysis.displayPrice} 
                  anchorMedian={chainAnalysis.displayMedian} 
                  lowerBound={chainAnalysis.displayLower} 
                  upperBound={chainAnalysis.displayUpper} 
                  status={anchorBand.status} 
                  isVatIncluded={pricing.isVatIncluded}
                  onToggleVat={(val) => setPricing(p => ({...p, isVatIncluded: val}))}
                />
              </section>

              <section className="bg-emerald-900 text-white shadow-lg p-6 rounded-xl border border-emerald-800">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Pricing Strategy Advisor (Gemini 3)</h4>
                  <div className="flex gap-2 items-center">
                    {aiAnalysis && (
                      <button 
                        onClick={handleExportText}
                        className="flex items-center gap-1.5 px-2 py-1 text-[8px] font-bold bg-white/10 hover:bg-white/20 border border-white/20 rounded transition-colors group"
                        title="Export strategy as .txt file"
                      >
                        <svg className="w-3 h-3 text-emerald-300 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        EXPORT (.TXT)
                      </button>
                    )}
                    <span className="text-[8px] font-bold px-1.5 py-0.5 bg-emerald-800 border border-emerald-700 rounded">TAX AWARE</span>
                    <span className="text-[8px] font-bold px-1.5 py-0.5 bg-emerald-800 border border-emerald-700 rounded">MARGIN OPTIMIZED</span>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border bg-white/10 border-white/20">
                    {isAnalyzing ? <div className="w-5 h-5 border-2 border-emerald-300 border-t-transparent rounded-full animate-spin"></div> : <svg className="w-5 h-5 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed italic opacity-90">
                      {isAnalyzing ? "Processing EU VAT differential and margin resilience..." : (aiAnalysis || "Awaiting pricing signals...")}
                    </p>
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <button onClick={() => setShowVatTrace(!showVatTrace)} className="w-full px-6 py-4 flex justify-between items-center bg-slate-50 hover:bg-slate-100 transition-colors">
                   <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tight">VAT Lifecycle & Traceability Panel</h4>
                   <svg className={`w-5 h-5 text-slate-400 transition-transform ${showVatTrace ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {showVatTrace && (
                  <div className="p-6 border-t border-slate-200 animate-in slide-in-from-top duration-300">
                     <VATTraceTable stages={chainAnalysis.stages} />
                  </div>
                )}
              </section>

              <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Competitive Intelligence Feed</h4>
                  <button onClick={scrapeMarketData} disabled={isScraping} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all flex items-center gap-2">
                    <svg className={`w-3 h-3 ${isScraping ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    Refresh Market Signals
                  </button>
                </div>
                <IntelligenceTable data={intelligence} activeAnchor={anchorBand.brand} />
              </section>
            </div>
          </div>

          <footer className="mt-auto p-6 bg-white border-t border-slate-200 flex justify-between items-center text-slate-400 text-[10px] uppercase font-bold tracking-widest">
            <div className="flex gap-6 items-center">
              <span>Markets: DE, FR</span>
              <span>VAT Status: <span className="text-emerald-500">EU ART. 138 COMPLIANT</span></span>
            </div>
            <div className="text-right max-w-md normal-case font-medium leading-tight">
              TAVAAZO Proprietary VAT Compliance Engine. AI-Synthesized Recommendations via Gemini 3 Flash. © 2025 Pakistan Global Operations.
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default App;
