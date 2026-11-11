/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Search, ShieldAlert, CheckCircle2, HelpCircle, 
  Sparkles, FileText, Calendar, Wallet, ExternalLink, ArrowRight 
} from "lucide-react";
import { motion } from "motion/react";
import { api } from "../services/api";

interface DonationTrackerProps {
  initialQuery?: string;
  setTab: (tab: string) => void;
}

export default function DonationTracker({ initialQuery = "", setTab }: DonationTrackerProps) {
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSearch = async (queryToSearch: string) => {
    if (!queryToSearch.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await api.trackDonation(queryToSearch.trim());
      setResult(data);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "No corresponding donation ID or hash found on search.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      setSearchInput(initialQuery);
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchInput);
  };

  // Define steps with associated statuses, labels, and descriptions
  const trackerTimelineSteps = [
    { key: "initiated", label: "Donation Initiated", desc: "Donor checkout payload generated." },
    { key: "paid", label: "Payment Successful", desc: "INR authorization settled via Razorpay gateways." },
    { key: "verified", label: "Backend Verification", desc: "Signature validation completed, matched to campaign database." },
    { key: "hashed", label: "Blockchain Recorded", desc: "Transactions signed and mined into decentralized block blocks." },
    { key: "transferred", label: "Transferred To NGO", desc: "Cryptographic assets settled into verified NGO wallet vaults." },
    { key: "utilized", label: "Fund Utilized", desc: "Capital disbursed for physical raw resources (Receipt invoices uploaded)." },
    { key: "impacted", label: "Impact Generated", desc: "On-ground report verification logged. Humanitarian social feedback delivered." },
  ];

  // Helper to determine step status
  const getStepIndex = (status: string) => {
    const keys = ["initiated", "paid", "verified", "hashed", "transferred", "utilized", "impacted"];
    return keys.indexOf(status);
  };

  const getStepState = (stepIndex: number, currentStatusIndex: number) => {
    if (stepIndex < currentStatusIndex) return "completed";
    if (stepIndex === currentStatusIndex) return "active";
    return "pending";
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 text-left bg-transparent">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Title */}
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-amber-500 uppercase tracking-widest block">Ledger Audit Utility</span>
          <h1 className="text-3xl font-black text-white">Traceable Donation Auditing</h1>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Input a Donation ID or simulated transaction block hash below to retrieve cryptographic Proof of Work proofs.
          </p>
        </div>

        {/* Search Input box */}
        <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-5 shadow-lg">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="e.g. don_abc123 or transaction blockchain hash..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-white/10/60 rounded-xl focus:border-sky-400 outline-none text-sm font-semibold"
              />
              <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-purple-600 hover:bg-[#0284c7] text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-purple-900 cursor-pointer disabled:opacity-50"
            >
              {loading ? "Searching indices..." : "Execute Audit Tracking"}
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 text-center sm:text-left">
            Try test receipts eg. <span className="font-mono bg-slate-800/60 px-1 py-0.5 border border-white/10/10 rounded text-amber-600">don1</span> or <span className="font-mono bg-slate-800/60 px-1 py-0.5 border border-white/10/10 rounded text-amber-600">don2</span> for instant tracking results.
          </p>
        </form>

        {/* Errors */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 flex gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
            <div>
              <p className="font-bold">Audit Query Missed</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Results layout */}
        {result && (
          <div className="space-y-6">
            
            {/* Meta summary card */}
            <div className="glass-panel rounded-2xl border border-white/10/60 p-6 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="space-y-1 md:col-span-2">
                <span className="text-[9px] font-black uppercase text-amber-500 tracking-wider block">Campaign Target</span>
                <h4 className="text-base font-extrabold text-white leading-tight">{result.donation.campaignTitle}</h4>
                <p className="text-xs text-slate-400">Beneficiary Group: {result.donation.ngoName}</p>
                <div className="pt-2 text-[10px] text-slate-400 space-y-0.5 font-mono truncate">
                  <p>Donation ID: <span className="text-slate-300">{result.donation.id}</span></p>
                  <p className="truncate">Blockchain Hash: <span className="text-amber-500 font-bold">{result.donation.blockchainHash}</span></p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10/60 text-right flex flex-col justify-between shadow-sm">
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase block">Settled Amount (INR)</span>
                  <span className="text-xl font-black text-white font-sans">₹{(result.donation.amount).toLocaleString()}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-bold mt-2">
                  <span>Channel: {result.donation.paymentMethod}</span>
                  <span className="block text-[8px] font-mono text-slate-400">Timestamp: {new Date(result.donation.createdAt).toLocaleString()}</span>
                </div>
              </div>

            </div>

            {/* Timeline cards flow */}
            <div className="glass-panel-heavy rounded-2xl border border-white/10/10 p-6 shadow-xl space-y-8">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-widest pb-3 border-b border-white/10/40 flex items-center justify-between">
                <span>Real-time Auditing Timeline</span>
                <span className="text-xs text-amber-500 lowercase font-semibold">Ledger verified</span>
              </h3>

              <div className="relative pl-8 space-y-8">
                {/* Connector bar */}
                <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-sky-200/50" />

                {trackerTimelineSteps.map((st, idx) => {
                  const currentStatusIdx = getStepIndex(result.donation.status);
                  const stepIndex = idx;
                  const state = getStepState(stepIndex, currentStatusIdx);

                  return (
                    <div key={st.key} className="relative flex flex-col gap-1.5">
                      
                      {/* Timeline icon */}
                      <span className={`absolute -left-8 top-1.5 w-4.5 h-4.5 rounded-full border flex items-center justify-center transition-all ${
                        state === "completed" 
                          ? "bg-fuchsia-500 border-fuchsia-500 text-white" 
                          : state === "active"
                            ? "bg-purple-600 border-[#0EA5E9] text-white ring-4 ring-sky-100"
                            : "bg-slate-900 border-white/10 text-slate-300"
                      }`}>
                        {state === "completed" && (
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {state === "active" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-900 animate-ping" />
                        )}
                      </span>

                      {/* Content block */}
                      <div className="text-left">
                        <h4 className={`text-xs font-extrabold tracking-tight ${
                          state === "completed" ? "text-slate-200" : state === "active" ? "text-amber-500" : "text-slate-400"
                        }`}>
                          {st.label}
                        </h4>
                        <p className="text-[10px] text-slate-400 leading-normal max-w-lg">{st.desc}</p>
                        
                        {/* Custom tags/action triggers for specific states */}
                        {st.key === "hashed" && state === "completed" && result.blockProof && (
                          <div className="mt-2 p-2 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-lg font-mono text-[9px] text-amber-300 max-w-md self-start flex justify-between items-center h-8 shadow-sm">
                            <span>Block Mined at Index: #{result.blockProof.index} (Nonce: {result.blockProof.nonce})</span>
                            <button 
                              onClick={() => setTab("ledger")}
                              className="text-[#38BDF8] hover:underline flex items-center gap-0.5 hover:text-sky-300 transition-colors"
                            >
                              Ledger <ExternalLink className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        )}

                        {st.key === "utilized" && state === "completed" && result.campaignMin?.utilizationReports?.length > 0 && (
                          <div className="mt-2 text-[9px] text-fuchsia-800 bg-slate-800/60 backdrop-blur-sm border border-white/10/60 p-2.5 rounded-lg max-w-md shadow-sm">
                            <span className="font-bold flex items-center gap-1 mb-1 text-fuchsia-700"><FileText className="w-3.5 h-3.5" /> Active Utilization Report Matched</span>
                            <p className="leading-relaxed font-sans">{result.campaignMin.utilizationReports[0].title}: used ₹{result.campaignMin.utilizationReports[0].amountUsed.toLocaleString()} for {result.campaignMin.utilizationReports[0].recipientName}.</p>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
