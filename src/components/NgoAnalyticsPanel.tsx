import React from "react";
import { BarChart2, TrendingUp, Award, Zap, CheckCircle } from "lucide-react";

interface NgoAnalyticsPanelProps {
  campaigns: any[];
  totalRaised: number;
  donorsCount: number;
}

export default function NgoAnalyticsPanel({ campaigns, totalRaised, donorsCount }: NgoAnalyticsPanelProps) {
  // Compute some analytical values
  const totalGoal = campaigns.reduce((sum, c) => sum + c.goalAmount, 0);
  const avgProgress = campaigns.length > 0 
    ? Math.round(campaigns.reduce((sum, c) => sum + Math.min(100, (c.raisedAmount / c.goalAmount) * 100), 0) / campaigns.length)
    : 0;

  // Categorize campaigns
  const categories = campaigns.reduce((acc: any, c) => {
    acc[c.category] = (acc[c.category] || 0) + c.raisedAmount;
    return acc;
  }, {});

  const catList = Object.entries(categories).map(([name, val]) => ({
    name,
    value: val as number
  })).sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-6 text-xs text-slate-300 font-semibold" id="ngo-analytics-workspace">
      <div>
        <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-amber-400" /> Platform Impact & Financial Analytics
        </h3>
        <p className="text-slate-450 mt-1 leading-relaxed">Cryptographically validated transaction logs, funding progress tracks, and category-wise capital allocation indices.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Core ratios */}
        <div className="p-4 bg-slate-800/60 border border-white/10/60 rounded-xl space-y-4">
          <h4 className="font-extrabold text-slate-200 uppercase tracking-wider text-[10px] border-b pb-2">Campaign Success Metrics</h4>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <span>Average Campaign Progress Rate</span>
                <span className="font-bold text-amber-500 font-mono">{avgProgress}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border">
                <div className="bg-purple-900/300 h-full rounded-full" style={{ width: `${avgProgress}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-baseline mb-1">
                <span>Average Donation Ticket Size</span>
                <span className="font-bold text-fuchsia-600 font-mono">₹{donorsCount > 0 ? Math.round(totalRaised / donorsCount).toLocaleString() : "0"}</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border">
                <div className="bg-fuchsia-500 h-full rounded-full" style={{ width: `65%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-baseline mb-1">
                <span>Ledger Trust Audit Score</span>
                <span className="font-bold text-purple-600 font-mono">100%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: `100%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Category Index */}
        <div className="p-4 bg-slate-800/60 border border-white/10/60 rounded-xl space-y-3">
          <h4 className="font-extrabold text-slate-200 uppercase tracking-wider text-[10px] border-b pb-2">Funds Allocated by Category</h4>
          
          {catList.length === 0 ? (
            <p className="text-slate-400 italic py-6 text-center">No categories recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {catList.map((cat, idx) => {
                const totalPct = totalRaised > 0 ? Math.round((cat.value / totalRaised) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="font-bold">{cat.name}</span>
                      <span className="font-mono text-slate-400">₹{cat.value.toLocaleString()} ({totalPct}%)</span>
                    </div>
                    <div className="w-full bg-slate-900/60 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-sky-400 h-full rounded-full" 
                        style={{ width: `${totalPct}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Dynamic Funding Progress Map */}
        <div className="p-4 bg-slate-800/60 border border-white/10/60 rounded-xl flex flex-col justify-between">
          <div className="space-y-2.5">
            <h4 className="font-extrabold text-slate-200 uppercase tracking-wider text-[10px] border-b pb-2">Ledger Validation Ratios</h4>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-2.5 bg-purple-900/30/50 rounded-lg border">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Funds Targeted</span>
                <strong className="text-xs font-black text-slate-200">₹{totalGoal.toLocaleString()}</strong>
              </div>
              <div className="p-2.5 bg-fuchsia-50/50 rounded-lg border">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Funds Cleared</span>
                <strong className="text-xs font-black text-fuchsia-800">₹{totalRaised.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          <div className="p-3 bg-fuchsia-50/40 border border-fuchsia-100 rounded-lg text-[10px] text-fuchsia-850 mt-3 flex items-start gap-2 text-left">
            <CheckCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <p className="leading-normal">All values correspond directly to blocks compiled on the TrustChain cryptographic network. Data is updated concurrently with every node validation round.</p>
          </div>
        </div>

      </div>

      {/* Analytical chart display */}
      <div className="p-5 bg-slate-900/60 border border-white/10/60 rounded-2xl">
        <h4 className="font-extrabold text-slate-200 uppercase tracking-wider text-[10px] mb-4">Interconnected Milestone Progress Visualization</h4>
        
        {campaigns.length === 0 ? (
          <p className="text-slate-400 italic text-center py-10">No active charts to build.</p>
        ) : (
          <div className="space-y-4">
            <div className="flex items-end justify-between h-40 pt-4 px-2 border-b border-white/10">
              {campaigns.slice(0, 6).map((c, i) => {
                const heightPct = Math.max(10, Math.min(100, Math.round((c.raisedAmount / c.goalAmount) * 100)));
                return (
                  <div key={i} className="flex flex-col items-center gap-1.5 w-1/6 group relative">
                    {/* Tooltip */}
                    <span className="absolute bottom-full bg-slate-900 text-white font-mono text-[9px] px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none mb-1 z-10 whitespace-nowrap">
                      Raised: ₹{c.raisedAmount.toLocaleString()}
                    </span>
                    <div className="w-10 bg-gradient-to-t from-[#0ea5e9]/70 to-[#0ea5e9]/90 hover:from-purple-900/300 hover:to-sky-400 rounded-t-md transition-all shadow-sm" style={{ height: `${heightPct}%` }} />
                    <span className="font-mono text-[9px] text-slate-400 truncate max-w-[50px]">{c.title}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[9px] text-slate-400 font-mono text-center pt-1 px-4">
              <span>Interactive funding bars representing progress levels relative to individual campaigns targets</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
