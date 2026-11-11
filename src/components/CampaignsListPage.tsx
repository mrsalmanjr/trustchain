/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Search, MapPin, Clock, Filter, ArrowUpDown, RefreshCcw } from "lucide-react";
import { api } from "../services/api";

interface CampaignsListPageProps {
  setTab: (tab: string) => void;
  setSelectedCampaignId: (id: string) => void;
}

export default function CampaignsListPage({ setTab, setSelectedCampaignId }: CampaignsListPageProps) {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSort, setSelectedSort] = useState("Newest");
  const [loading, setLoading] = useState(true);

  const categories = [
    "All",
    "Education",
    "Medical",
    "Disaster Relief",
    "Animal Welfare",
    "Environment",
    "Community Support"
  ];

  const sortOptions = ["Newest", "Most Funded", "Ending Soon"];

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const data = await api.getCampaigns({
        search: searchText,
        category: selectedCategory,
        sort: selectedSort
      });
      setCampaigns(data);
    } catch (e) {
      console.error("Failed to query campaign register:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [selectedCategory, selectedSort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCampaigns();
  };

  const clearFilters = () => {
    setSearchText("");
    setSelectedCategory("All");
    setSelectedSort("Newest");
    setTimeout(fetchCampaigns, 50);
  };

  const handleCardClick = (id: string) => {
    setSelectedCampaignId(id);
    setTab("details");
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 text-left bg-transparent">
      <div className="max-w-7xl mx-auto space-y-8">
         
         {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Verified Social Campaigns</h1>
          <p className="text-slate-400 text-sm max-w-lg">
            Invest in real social change. Browse campaigns audited and recorded continuously on the public trust ledger.
          </p>
        </div>

        {/* Filter Controls Card with Grid layouts */}
        <div className="glass-panel rounded-2xl p-5 shadow-lg space-y-4">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
            {/* Search Input */}
            <div className="md:col-span-6 relative">
              <input
                type="text"
                placeholder="Search by campaign title, keywords, or NGO agency..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-white/10/60 rounded-xl focus:border-sky-400 focus:ring-1 focus:ring-sky-450 outline-none text-sm font-semibold"
              />
              <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
            </div>

            {/* Sort Selector */}
            <div className="md:col-span-3 relative">
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/60 border border-white/10/60 rounded-xl focus:border-sky-400 outline-none text-sm appearance-none cursor-pointer font-bold text-slate-300"
              >
                {sortOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <ArrowUpDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Action Buttons */}
            <div className="md:col-span-3 flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-purple-600 hover:bg-[#0284c7] text-white font-bold rounded-xl text-sm transition-colors cursor-pointer text-center shadow-md shadow-purple-900"
              >
                Apply Lookup
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="p-2.5 bg-slate-900/60 hover:bg-slate-800/80 border border-white/10/60 rounded-xl text-slate-400 hover:text-slate-300 transition-all cursor-pointer"
                title="Reset Filters"
              >
                <RefreshCcw className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Categories Horizontal scroll list */}
          <div className="pt-2 border-t border-white/10/45">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2.5 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-amber-400" /> Category Filter Indices
            </p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                    selectedCategory === cat 
                      ? "bg-purple-600 border-[#0EA5E9] text-white shadow-md shadow-purple-900" 
                      : "bg-slate-900/45 hover:bg-slate-900/70 border-white/10/60 text-slate-650 hover:text-sky-655"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Campaigns Listing Cards */}
        {loading ? (
          <div className="text-center py-20 bg-slate-800/40 backdrop-blur-md rounded-2xl border border-white/10/50 shadow-lg">
            <svg className="animate-spin h-8 w-8 text-amber-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-sm font-bold text-slate-750 font-mono">Syncing and verifying blockchain indices...</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="bg-slate-900/45 backdrop-blur-md rounded-2xl border border-white/10/50 p-12 text-center text-slate-400 space-y-4 shadow-lg">
            <p className="text-sm font-bold">No active fundraisers matched the queried filters.</p>
            <button 
              onClick={clearFilters}
              className="text-xs text-amber-500 border border-white/10/60 px-4 py-2 rounded-xl bg-slate-800/40 font-bold hover:bg-slate-800/60 transition-colors shadow-sm"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {campaigns.map((c) => {
              const progress = Math.min(100, Math.round((c.raisedAmount / c.goalAmount) * 100));
              return (
                <div 
                  key={c.id} 
                  onClick={() => handleCardClick(c.id)}
                  className="glass-panel hover:bg-slate-900/55 rounded-2xl border border-white/10/60 shadow-lg hover:shadow-2xl transition-all overflow-hidden flex flex-col h-full cursor-pointer text-left group"
                >
                  <div className="relative aspect-video overflow-hidden bg-slate-800/40">
                    <img 
                      src={c.bannerImage} 
                      alt={c.title} 
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 bg-slate-900/95 px-3 py-1 rounded-full text-[10px] font-black text-amber-500 border border-purple-900/50 shadow-sm">
                      {c.category}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                        <span>NGO: {c.ngoName}</span>
                        <span className="flex items-center gap-0.5 text-fuchsia-600 bg-fuchsia-50 px-2 py-0.5 rounded border border-fuchsia-100/40">
                          <span className="w-1.5 h-1.5 bg-fuchsia-500 rounded-full animate-pulse mr-0.5" />
                          Verified
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-white leading-snug group-hover:text-amber-500 transition-colors">
                        {c.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {c.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-sky-50/60 space-y-4">
                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between items-baseline mb-1.5 text-xs">
                          <span className="font-extrabold text-slate-950">₹{(c.raisedAmount).toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">raised</span></span>
                          <span className="text-[10px] font-bold text-slate-400">of ₹{(c.goalAmount).toLocaleString()}</span>
                        </div>
                        
                        <div className="w-full h-2 bg-purple-900/30 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-purple-600 rounded-full transition-all duration-300" 
                            style={{ width: `${progress}%` }}
                          />
                        </div>

                        <div className="flex justify-between items-center mt-1 text-[10px] font-bold text-slate-400">
                          <span className="text-amber-500">{progress}% Complete</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-300" />
                            {c.location || "India"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
