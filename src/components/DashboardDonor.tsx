/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Heart, CreditCard, ShieldCheck, FileText, Grid, User, LucideIcon,
  Search, Printer, Download, Settings, BarChart2, CheckCircle2, Sliders 
} from "lucide-react";
import { api } from "../services/api";

interface DashboardDonorProps {
  user: any;
  setTab: (tab: string) => void;
  setTrackQuery: (query: string) => void;
  onRefreshUser?: () => Promise<void>;
}

export default function DashboardDonor({ user, setTab, setTrackQuery, onRefreshUser }: DashboardDonorProps) {
  const [donations, setDonations] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalAmount: 0,
    campaignsJoined: 0,
    impactScore: 0 // e.g. lives impacted
  });
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<"history" | "tracking" | "receipts" | "settings">("history");
  
  // Settings values
  const [tempName, setTempName] = useState(user?.name || "");
  const [tempEmail, setTempEmail] = useState(user?.email || "");
  const [tempPhone, setTempPhone] = useState(user?.phone || "");
  const [tempLocation, setTempLocation] = useState(user?.location || "");
  const [tempBio, setTempBio] = useState(user?.bio || "");
  const [tempAvatarUrl, setTempAvatarUrl] = useState(user?.avatarUrl || "");
  const [tempPassword, setTempPassword] = useState("");
  const [preferredCategory, setPreferredCategory] = useState(user?.preferredCategory || "Education");
  const [emailNotif, setEmailNotif] = useState(user?.notificationPreferences?.email !== false);
  const [smsNotif, setSmsNotif] = useState(user?.notificationPreferences?.sms !== false);
  const [milestonesNotif, setMilestonesNotif] = useState(user?.notificationPreferences?.milestones !== false);
  
  const [saveSuccess, setSaveSuccess] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const loadDonorData = async () => {
    setLoading(true);
    try {
      const list = await api.getMyDonations();
      setDonations(list);

      const total = list.reduce((sum, d) => sum + d.amount, 0);
      const uniques = new Set(list.map(d => d.campaignId)).size;
      const livesImpacted = Math.round(total * 0.12); // Simulated metric

      setStats({
        totalAmount: total,
        campaignsJoined: uniques,
        impactScore: livesImpacted
      });
    } catch (e) {
      console.error("Failed to fetch donor profiles:", e);
    } finally {
      setLoading(false);
    }
  };

  const presetAvatars = [
    { url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80", name: "Classic Corporate" },
    { url: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80", name: "Philanthropist Coach" },
    { url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80", name: "Community Sponsor" },
    { url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80", name: "Global Supporter" },
    { url: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=120&auto=format&fit=crop&q=80", name: "Tech Investor" },
  ];

  useEffect(() => {
    loadDonorData();
    if (user) {
      setTempName(user.name || "");
      setTempEmail(user.email || "");
      setTempPhone(user.phone || "");
      setTempLocation(user.location || "");
      setTempBio(user.bio || "");
      setTempAvatarUrl(user.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80");
      setPreferredCategory(user.preferredCategory || "Education");
      setEmailNotif(user.notificationPreferences?.email !== false);
      setSmsNotif(user.notificationPreferences?.sms !== false);
      setMilestonesNotif(user.notificationPreferences?.milestones !== false);
    }
  }, [user]);

  const handleTrackSubmit = (id: string) => {
    setTrackQuery(id);
    setTab("tracker");
  };

  const saveProfileSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess("");
    setErrorMsg("");
    try {
      await api.updateProfile({
        name: tempName,
        email: tempEmail,
        phone: tempPhone,
        location: tempLocation,
        bio: tempBio,
        avatarUrl: tempAvatarUrl,
        preferredCategory,
        password: tempPassword || undefined,
        notificationPreferences: {
          email: emailNotif,
          sms: smsNotif,
          milestones: milestonesNotif,
        }
      });
      setSaveSuccess("Your donor profile parameters have been securely saved and synchronized!");
      if (onRefreshUser) {
        await onRefreshUser();
      }
      setTimeout(() => setSaveSuccess(""), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to edit user profile.");
    }
  };

  // Printable receipt window
  const printAction = (donationId: string) => {
    setTrackQuery(donationId);
    setTab("tracker");
  };

  // Calculate dynamic monthly trend data from donor's actual history
  const monthlyData = React.useMemo(() => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const monthsList: { month: string; monthIndex: number; year: number; amount: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthsList.push({
        month: monthNames[d.getMonth()],
        monthIndex: d.getMonth(),
        year: d.getFullYear(),
        amount: 0
      });
    }

    donations.forEach(d => {
      if (d.createdAt) {
        const date = new Date(d.createdAt);
        if (!isNaN(date.getTime())) {
          const match = monthsList.find(m => m.monthIndex === date.getMonth() && m.year === date.getFullYear());
          if (match) {
            match.amount += (d.amount || 0);
          }
        }
      }
    });

    return monthsList.map(m => ({ month: m.month, amount: m.amount }));
  }, [donations]);

  // Calculate dynamic category breakdown percentages from donor's actual donations
  const categoryAllocations = React.useMemo(() => {
    const totalSpent = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
    const standardCategories = ["Education", "Medical", "Disaster Relief", "Environment"];
    const colorMap: Record<string, string> = {
      "Education": "bg-sky-400",
      "Medical": "bg-teal-400",
      "Disaster Relief": "bg-rose-400",
      "Environment": "bg-fuchsia-400",
      "Community Support": "bg-amber-400",
      "Animal Welfare": "bg-emerald-400"
    };

    if (!donations.length || totalSpent === 0) {
      return standardCategories.map(cat => ({
        cat,
        percentage: 0,
        color: colorMap[cat] || "bg-sky-400"
      }));
    }

    const catTotals: Record<string, number> = {};
    donations.forEach(d => {
      const cat = d.category || "Education";
      catTotals[cat] = (catTotals[cat] || 0) + (d.amount || 0);
    });

    const activeCats = Array.from(new Set([...Object.keys(catTotals), ...standardCategories]));

    return activeCats.map(cat => {
      const amt = catTotals[cat] || 0;
      const percentage = totalSpent > 0 ? Math.round((amt / totalSpent) * 100) : 0;
      return {
        cat,
        percentage,
        color: colorMap[cat] || "bg-indigo-400"
      };
    }).filter(c => c.percentage > 0 || standardCategories.includes(c.cat));
  }, [donations]);

  // SVG Chart sizing parameters
  const maxChartAmt = Math.max(...monthlyData.map(d => d.amount));
  const svgHeight = 120;
  const svgWidth = 400;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 text-left bg-transparent">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Welcome Board */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 p-6 bg-slate-900/60 backdrop-blur-md border border-white/10/10 rounded-2xl shadow-xl transition-all hover:bg-slate-900/80">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <img 
              src={user?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80"} 
              alt="Donor Avatar" 
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white/10 shadow bg-slate-800 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight flex items-center gap-2">
                Welcome, {user?.name || "Donor"}
              </h1>
              {user?.bio ? (
                <p className="text-slate-400 text-xs italic line-clamp-2 max-w-lg">"{user.bio}"</p>
              ) : (
                <p className="text-slate-400 text-xs">Review your live contribution audit logs and blockchain receipts.</p>
              )}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-1 text-xs">
                {user?.location && (
                  <span className="font-bold text-slate-300 flex items-center gap-1 bg-slate-800/60 px-2.5 py-1 rounded-lg border border-white/10/10 shadow-xs">
                    📍 {user.location}
                  </span>
                )}
                {user?.phone && (
                  <span className="font-medium text-slate-400 flex items-center gap-1 bg-slate-800/60 px-2.5 py-1 rounded-lg border border-white/10/10 shadow-xs">
                    📞 {user.phone}
                  </span>
                )}
                {user?.preferredCategory && (
                  <span className="bg-purple-900/30 text-amber-500 font-bold px-2.5 py-1 rounded-lg text-[10px] uppercase border border-purple-900/50 shadow-xs">
                    ★ {user.preferredCategory} Investor
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="text-xs bg-slate-800 backdrop-blur-sm p-4 border border-white/10 rounded-xl font-mono text-slate-400 shadow-md shrink-0 flex flex-col justify-center">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">Network Node parameters</div>
            <div>Node Identity: <strong className="text-amber-500">{user?.id || "N/A"}</strong></div>
            <div className="text-[10px] text-slate-400 mt-0.5 font-sans font-semibold">{user?.email}</div>
          </div>
        </div>

        {/* Dynamic Metric Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass-panel rounded-2xl border border-white/10/60 p-5 shadow-lg flex items-center gap-4">
            <span className="p-3 bg-slate-800 border border-white/10/10 text-amber-500 rounded-xl shadow-sm"><Heart className="w-6 h-6 fill-sky-100" /></span>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Contributed</p>
              <h4 className="text-lg font-black text-white font-sans">₹{stats.totalAmount.toLocaleString()}</h4>
            </div>
          </div>
          
          <div className="glass-panel rounded-2xl border border-white/10/60 p-5 shadow-lg flex items-center gap-4">
            <span className="p-3 bg-slate-800 border border-white/10/10 text-teal-600 rounded-xl shadow-sm"><Grid className="w-6 h-6" /></span>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Campaigns Backed</p>
              <h4 className="text-lg font-black text-white">{stats.campaignsJoined} verified</h4>
            </div>
          </div>

          <div className="glass-panel rounded-2xl border border-white/10/60 p-5 shadow-lg bg-gradient-to-br from-white/40 to-fuchsia-100/10 flex items-center gap-4">
            <span className="p-3 bg-slate-800 border border-white/10/10 text-fuchsia-600 rounded-xl shadow-sm"><CheckCircle2 className="w-6 h-6" /></span>
            <div>
              <p className="text-[10px] text-fuchsia-750 font-bold uppercase tracking-wider">Estimated Impact score</p>
              <h4 className="text-lg font-black text-fuchsia-800">{stats.impactScore} Lives Supported</h4>
            </div>
          </div>
        </div>

        {/* Charts Section Double row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Monthly Donation Area Chart */}
          <div className="glass-panel rounded-2xl border border-white/10/60 p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5 border-b border-white/10/30 pb-3 font-mono">
              <BarChart2 className="w-4 h-4 text-amber-500" /> Monthly Contributions Summary
            </h3>
            
            <div className="relative">
              {/* Plot Vector path */}
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible">
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.4"/>
                    <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.0"/>
                  </linearGradient>
                </defs>
                {/* Horizontal grid guide */}
                <line x1="0" y1={svgHeight/2} x2={svgWidth} y2={svgHeight/2} stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3" />

                {/* Draw Areas & Curves */}
                <path 
                  d={`
                    M 0,${svgHeight}
                    ${monthlyData.map((d, i) => {
                      const x = (i / (monthlyData.length - 1)) * svgWidth;
                      const y = svgHeight - (d.amount / maxChartAmt) * (svgHeight - 15);
                      return `L ${x},${y}`;
                    }).join(" ")}
                    L ${svgWidth},${svgHeight} Z
                  `} 
                  fill="url(#gradient)"
                />
                <path 
                  d={monthlyData.map((d, i) => {
                    const x = (i / (monthlyData.length - 1)) * svgWidth;
                    const y = svgHeight - (d.amount / maxChartAmt) * (svgHeight - 15);
                    return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
                  }).join(" ")}
                  fill="none"
                  stroke="#0EA5E9"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Plot points */}
                {monthlyData.map((d, i) => {
                  const x = (i / (monthlyData.length - 1)) * svgWidth;
                  const y = svgHeight - (d.amount / maxChartAmt) * (svgHeight - 15);
                  return (
                    <circle key={i} cx={x} cy={y} r="3.5" fill="#FFFFFF" stroke="#0ea5e9" strokeWidth="2.5" />
                  );
                })}
              </svg>

              {/* Labels x-axis */}
              <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-3">
                {monthlyData.map((d) => (
                  <span key={d.month}>{d.month}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Allocation Segment percentages */}
          <div className="glass-panel rounded-2xl border border-white/10/60 p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5 border-b border-white/10/30 pb-3 font-mono">
              <Sliders className="w-4 h-4 text-purple-400" /> Donation Category Breakdown
            </h3>

            <div className="space-y-4 pt-1 font-semibold">
              {categoryAllocations.map((alloc) => (
                <div key={alloc.cat} className="space-y-1.5 text-xs text-slate-650">
                  <div className="flex justify-between items-baseline">
                    <span>{alloc.cat}</span>
                    <span className="font-bold text-slate-200">{alloc.percentage}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-900/40 border border-white/10/55 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${alloc.color} rounded-full`} 
                      style={{ width: `${alloc.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modular Tabs section */}
        <div className="glass-panel-heavy rounded-2xl border border-white/10/75 overflow-hidden shadow-2xl flex flex-col md:flex-row">
          
          {/* Navigation drawer rail */}
          <div className="md:w-1/4 border-r border-white/10/40 bg-slate-900/30 backdrop-blur-sm p-4 space-y-2">
            <button
              onClick={() => setActiveSubTab("history")}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeSubTab === "history" ? "bg-slate-800/80 text-amber-500 shadow border border-white/10/50 font-bold" : "text-slate-400 hover:text-white hover:bg-slate-900/40"
              }`}
            >
              <Heart className="w-4 h-4" /> Donation History
            </button>
            <button
              onClick={() => setActiveSubTab("tracking")}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeSubTab === "tracking" ? "bg-slate-800/80 text-amber-500 shadow border border-white/10/50 font-bold" : "text-slate-400 hover:text-white hover:bg-slate-900/40"
              }`}
            >
              <Search className="w-4 h-4" /> Donation Tracking ID
            </button>
            <button
              onClick={() => setActiveSubTab("receipts")}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeSubTab === "receipts" ? "bg-slate-800/80 text-amber-500 shadow border border-white/10/50 font-bold" : "text-slate-400 hover:text-white hover:bg-slate-900/40"
              }`}
            >
              <FileText className="w-4 h-4" /> audit Receipts
            </button>
            <button
              onClick={() => setActiveSubTab("settings")}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeSubTab === "settings" ? "bg-slate-800/80 text-amber-500 shadow border border-white/10/50 font-bold" : "text-slate-400 hover:text-white hover:bg-slate-900/40"
              }`}
            >
              <Settings className="w-4 h-4" /> Profile Settings
            </button>
          </div>

          {/* Subtab Dynamic Workspace */}
          <div className="md:w-3/4 p-6">
            
            {activeSubTab === "history" && (
              <div className="space-y-4 text-xs">
                <h3 className="font-extrabold text-white text-sm">Your Contribution History ({donations.length})</h3>
                
                {loading ? (
                  <p className="text-slate-400">Retrieving ledger indices...</p>
                ) : donations.length === 0 ? (
                  <p className="text-slate-400 py-6 border border-dashed rounded-xl border-white/10/50 text-center bg-slate-900/20">No donations saved to this network address yet.</p>
                ) : (
                  <div className="divide-y divide-white/40">
                    {donations.map((d) => (
                      <div key={d.id} className="py-3 flex justify-between items-center first:pt-0 last:pb-0">
                        <div className="space-y-1">
                          <h5 className="font-bold text-slate-200">{d.campaignTitle}</h5>
                          <div className="flex items-center gap-2 font-mono text-[9px] text-slate-450">
                            <span>TX digest: {d.blockchainHash.slice(0, 16)}...</span>
                            <span>Method: {d.paymentMethod}</span>
                          </div>
                        </div>

                        <div className="text-right space-y-1 shrink-0">
                          <strong className="text-white text-xs font-sans">₹{d.amount.toLocaleString()}</strong>
                          <span className={`block text-[8px] font-bold uppercase rounded px-1.5 py-0.5 text-center ${
                            d.status === "utilized" ? "bg-fuchsia-100/50 text-fuchsia-800 border border-fuchsia-200" : "bg-slate-800/60 text-sky-700 border border-white/10/70"
                          }`}>
                            {d.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSubTab === "tracking" && (
              <div className="space-y-4 text-xs">
                <h3 className="font-extrabold text-white text-sm">Active Timeline Queries</h3>
                <p className="text-slate-400">Instantly query step-by-step progress audits for any donation listed on your log.</p>
                
                {donations.length === 0 ? (
                  <p className="text-slate-450 italic font-medium">No donations registered to check tracking indices.</p>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {donations.map((d) => (
                      <div key={d.id} className="p-3.5 rounded-xl border border-white/10/50 bg-slate-900/40 flex justify-between items-center hover:bg-slate-800/60 transition-colors shadow-sm">
                        <div>
                          <h5 className="font-bold text-slate-200 truncate max-w-[200px] md:max-w-xs">{d.campaignTitle}</h5>
                          <span className="font-mono text-[9px] text-slate-450 font-semibold">ID: {d.id} | Hash: {d.blockchainHash.slice(0, 12)}...</span>
                        </div>
                        <button
                          onClick={() => handleTrackSubmit(d.id)}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-[#0284c7] text-white font-bold rounded-lg text-[10px] cursor-pointer shadow-md transition-all"
                        >
                          Track Flow
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSubTab === "receipts" && (
              <div className="space-y-4 text-xs">
                <h3 className="font-extrabold text-white text-sm">Tax Audit Receipts & SLA Certificates</h3>
                <p className="text-slate-400">Download immutable PDF receipts verified recursively on Ledger blocks for corporate tax exemption purposes.</p>

                {donations.length === 0 ? (
                  <p className="text-slate-450 italic font-medium">No transactions processed to output printable summaries.</p>
                ) : (
                  <div className="space-y-2">
                    {donations.map((d) => (
                      <div key={d.id} className="p-3.5 border border-white/10/50 rounded-xl flex justify-between items-center text-xs bg-slate-900/40 shadow-sm">
                        <div>
                          <p className="font-bold text-slate-200 font-sans">Amount: ₹{d.amount.toLocaleString()} (INR)</p>
                          <span className="text-[10px] text-slate-450 block ellipsis truncate font-semibold">Campaign: {d.campaignTitle}</span>
                        </div>
                        <button
                          onClick={() => printAction(d.id)}
                          className="flex items-center gap-1 py-1.5 px-3 border border-white/10/60 bg-slate-800/60 hover:bg-slate-800/80 rounded-lg text-[10px] font-bold text-slate-300 cursor-pointer shadow-sm transition-all"
                        >
                          <Printer className="w-3.5 h-3.5" /> Printable Summary
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSubTab === "settings" && (
              <form onSubmit={saveProfileSettings} className="space-y-8 text-xs font-semibold">
                <div>
                  <h3 className="font-extrabold text-slate-200 text-base font-sans">Global Donor Profile & Security Node Settings</h3>
                  <p className="text-slate-400 font-normal text-xs mt-0.5">Customize your public metadata, notification alerts, and login authentication signatures used across the TrustChain block ledger.</p>
                </div>

                {saveSuccess && (
                  <div className="p-4 bg-fuchsia-50 text-fuchsia-800 border border-fuchsia-200 rounded-xl font-bold flex items-center gap-2 shadow-sm animate-fade-in">
                    <span className="text-base">✓</span> {saveSuccess}
                  </div>
                )}

                {errorMsg && (
                  <div className="p-4 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl font-bold flex items-center gap-2 shadow-sm">
                    <span className="text-base">⚠</span> {errorMsg}
                  </div>
                )}

                {/* 1. Interactive Avatar Node Picker */}
                <div className="space-y-3 p-5 rounded-2xl bg-slate-900/40 border border-white/10/60 shadow-sm">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Profile Avatar</label>
                    <p className="text-slate-400 font-normal text-[11px] mt-0.5">Choose an avatar to represent your node on leaderboard lists and campaign receipt records.</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <img 
                      src={tempAvatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80"} 
                      alt="Current Selection" 
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-[#0EA5E9] shadow-md shrink-0 bg-slate-900"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex flex-wrap gap-2.5">
                      {presetAvatars.map((av, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setTempAvatarUrl(av.url)}
                          className={`w-11 h-11 rounded-xl overflow-hidden border-2 cursor-pointer transition-all hover:scale-105 hover:shadow ${
                            tempAvatarUrl === av.url ? "border-[#0EA5E9] ring-2 ring-sky-100" : "border-transparent opacity-75 hover:opacity-100"
                          }`}
                          title={av.name}
                        >
                          <img src={av.url} alt={av.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Or Paste custom image URL:</span>
                    <input
                      type="url"
                      placeholder="https://example.com/my-photo.jpg"
                      value={tempAvatarUrl}
                      onChange={(e) => setTempAvatarUrl(e.target.value)}
                      className="w-full p-2.5 border border-white/10/60 rounded-xl bg-slate-900/60 focus:border-[#38BDF8] outline-none font-mono text-[10px] font-normal shadow-xs"
                    />
                  </div>
                </div>

                {/* 2. Basic Contact and Location Meta */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Donor Full Name</label>
                    <input
                      type="text"
                      placeholder="E.g. Siddharth Hegde"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="w-full p-2.5 border border-white/10/60 rounded-xl bg-slate-900/60 focus:border-[#38BDF8] outline-none shadow-sm"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Security Sync Email</label>
                    <input
                      type="email"
                      placeholder="name@domain.com"
                      value={tempEmail}
                      onChange={(e) => setTempEmail(e.target.value)}
                      className="w-full p-2.5 border border-white/10/60 rounded-xl bg-slate-900/60 focus:border-[#38BDF8] outline-none shadow-sm"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Secure Mobile Phone (Optional)</label>
                    <input
                      type="tel"
                      placeholder="E.g. +91 98765 43210"
                      value={tempPhone}
                      onChange={(e) => setTempPhone(e.target.value)}
                      className="w-full p-2.5 border border-white/10/60 rounded-xl bg-slate-900/60 focus:border-[#38BDF8] outline-none shadow-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Donor Location/City (Optional)</label>
                    <input
                      type="text"
                      placeholder="E.g. Bangalore, India"
                      value={tempLocation}
                      onChange={(e) => setTempLocation(e.target.value)}
                      className="w-full p-2.5 border border-white/10/60 rounded-xl bg-slate-900/60 focus:border-[#38BDF8] outline-none shadow-sm"
                    />
                  </div>
                </div>

                {/* 3. Personalized Message and Alignment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Preferred Campaign Category</label>
                    <select
                      value={preferredCategory}
                      onChange={(e) => setPreferredCategory(e.target.value)}
                      className="w-full p-2.5 border border-white/10/60 rounded-xl bg-slate-900/60 focus:border-[#38BDF8] outline-none shadow-sm font-semibold text-slate-300"
                    >
                      <option value="Education">Education & Learning</option>
                      <option value="Medical">Medical treatment & Health</option>
                      <option value="Disaster Relief">Disaster Response & Relief</option>
                      <option value="Animal Welfare">Animal Protection & Welfare</option>
                      <option value="Environment">Environmental Sustainability</option>
                      <option value="Community Support">Community Redevelopment</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Change Security Key (Password)</label>
                    <input
                      type="password"
                      placeholder="•••••••• (Leave blank to keep current signature)"
                      value={tempPassword}
                      onChange={(e) => setTempPassword(e.target.value)}
                      className="w-full p-2.5 border border-white/10/60 rounded-xl bg-slate-900/60 focus:border-[#38BDF8] outline-none shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Personal Statement / Bio text</label>
                  <textarea
                    placeholder="E.g. Passionate advocate for youth education and climate resilience efforts across South Asia..."
                    rows={3}
                    value={tempBio}
                    onChange={(e) => setTempBio(e.target.value)}
                    className="w-full p-3 border border-white/10/60 rounded-xl bg-slate-900/60 focus:border-[#38BDF8] outline-none font-normal text-slate-300 shadow-sm resize-none"
                  />
                </div>

                {/* 4. Deep Ledger Notification Preferences */}
                <div className="space-y-3 p-5 rounded-2xl bg-slate-900/30 border border-white/10/50">
                  <div>
                    <h4 className="text-xs font-black text-slate-200 uppercase tracking-wide">Blockchain Ledger Notification Alerts</h4>
                    <p className="text-slate-400 text-[10.5px] font-normal leading-relaxed mt-0.5">Select your preferred communication channels when our smart tracking networks detect real-world campaign milestones.</p>
                  </div>
                  
                  <div className="space-y-2.5 pt-2">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={emailNotif}
                        onChange={(e) => setEmailNotif(e.target.checked)}
                        className="w-4 h-4 text-amber-500 border-white/10/60 bg-slate-900/60 rounded-sm focus:ring-sky-400 cursor-pointer"
                      />
                      <div>
                        <span className="block text-xs font-bold text-slate-300">Receive Transaction Email Logs</span>
                        <span className="block text-[10px] text-slate-450 font-normal">Receive immediate cryptographic receipts on your registered email block.</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={smsNotif}
                        onChange={(e) => setSmsNotif(e.target.checked)}
                        className="w-4 h-4 text-amber-500 border-white/10/60 bg-slate-900/60 rounded-sm focus:ring-sky-400 cursor-pointer"
                      />
                      <div>
                        <span className="block text-xs font-bold text-slate-300">Secure SMS Alerts</span>
                        <span className="block text-[10px] text-slate-450 font-normal">Push SMS text updates to your terminal nodes during high priority disasters.</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={milestonesNotif}
                        onChange={(e) => setMilestonesNotif(e.target.checked)}
                        className="w-4 h-4 text-amber-500 border-white/10/60 bg-slate-900/60 rounded-sm focus:ring-sky-400 cursor-pointer"
                      />
                      <div>
                        <span className="block text-xs font-bold text-slate-300">Project Milestone Verification Reports</span>
                        <span className="block text-[10px] text-slate-450 font-normal">Receive detailed liability ledger digests indicating proof of execution at target locations.</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Form controls submission elements */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-purple-600 hover:bg-[#0284c7] text-white font-extrabold rounded-xl cursor-pointer shadow-lg transition-all transform hover:-translate-y-[1px] active:translate-y-0 text-xs tracking-wider uppercase"
                  >
                    Save & Broadcast Profile Updates
                  </button>
                </div>
              </form>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
