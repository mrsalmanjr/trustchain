/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { 
  Users, Briefcase, FileText, Check, X, ShieldCheck, 
  Terminal, BarChart2, Activity, RefreshCw, Clock
} from "lucide-react";
import { api } from "../services/api";

export default function DashboardAdmin() {
  const [requests, setRequests] = useState<any>(null);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<"ngos" | "campaigns" | "ledger">("ngos");
  const [ngoSectionFilter, setNgoSectionFilter] = useState<"pending" | "all">("pending");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadAdminControlData = async () => {
    setLoading(true);
    try {
      const dbRequests = await api.getAdminRequests();
      setRequests(dbRequests);

      const dbBlocks = await api.getBlockchain();
      setBlocks(dbBlocks);

      const dbStats = await api.getStats();
      setStats(dbStats);
    } catch (e: any) {
      console.error(e);
      setError("Admin database credentials syncing failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminControlData();
  }, []);

  const handleNgoApproval = async (id: string, approve: boolean) => {
    setError("");
    setSuccess("");
    try {
      await api.adminVerifyNGO(id, approve ? "approve" : "reject");
      setSuccess(`NGO Document status successfully updated to: ${approve ? "APPROVED" : "REJECTED"}. Node notified.`);
      loadAdminControlData();
    } catch (e: any) {
      setError(e.message || "Failed to update NGO verification");
    }
  };

  const handleCampaignApproval = async (id: string, approve: boolean) => {
    setError("");
    setSuccess("");
    try {
      await api.adminVerifyCampaign(id, approve ? "approve" : "reject");
      setSuccess(`Fundraiser layout approved into active ledger status: ${approve ? "LIVE" : "DECLINED"}.`);
      loadAdminControlData();
    } catch (e: any) {
      setError(e.message || "Failed to update campaign verification");
    }
  };

  if (loading && !requests) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-slate-400">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500 mb-2" />
        <p className="text-xs">Connecting and verifying security hashes with admin token...</p>
      </div>
    );
  }

  const pendingNGOList = requests?.pendingNGOs || [];
  const pendingCampaignList = requests?.pendingCampaigns || [];

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 text-left bg-transparent">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Title Module */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10/45">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">Platform Master Console</h1>
            <p className="text-slate-400 text-xs text-left">Administrative oversight, smart-contracts audits, and blockchain validation.</p>
          </div>

          <button
            onClick={loadAdminControlData}
            className="inline-flex items-center gap-1 text-xs font-bold bg-slate-800/60 text-slate-200 px-3.5 py-1.5 border border-white/10/70 rounded-xl hover:bg-slate-800/90 transition shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Re-audit Ledger State
          </button>
        </div>

        {/* Info Feedbacks */}
        {error && (
          <p className="p-3 bg-red-100/60 backdrop-blur-sm text-red-800 border border-red-200 rounded-xl text-xs">{error}</p>
        )}
        {success && (
          <p className="p-3 bg-slate-900/70 text-fuchsia-800 border border-fuchsia-200 rounded-xl text-xs font-bold">{success}</p>
        )}

        {/* Analytical Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="glass-panel rounded-2xl border border-white/10/60 p-4 shadow-lg text-left bg-slate-900/40 font-semibold font-sans">
            <span className="text-[9px] uppercase font-bold text-slate-400">Total Donations Volume</span>
            <p className="text-xl font-black text-white mt-1 font-sans">₹{stats?.totalDonations?.toLocaleString() || "0"}</p>
          </div>

          <div className="glass-panel rounded-2xl border border-white/10/60 p-4 shadow-lg text-left bg-slate-900/40 font-semibold font-sans">
            <span className="text-[9px] uppercase font-bold text-slate-400">Unique Donor accounts</span>
            <p className="text-xl font-black text-white mt-1">{stats?.totalDonors || "0"}</p>
          </div>

          <div className="glass-panel rounded-2xl border border-white/10/60 p-4 shadow-lg text-left bg-slate-900/40 font-semibold font-sans">
            <span className="text-[9px] uppercase font-bold text-slate-400">Verified NGOs Active</span>
            <p className="text-xl font-black text-white mt-1">{stats?.verifiedNGOs || "0"}</p>
          </div>

          <div className="glass-panel rounded-2xl border border-white/10/60 p-4 shadow-lg text-left bg-gradient-to-br from-white/40 via-amber-100/10 to-amber-200/5 font-semibold font-sans">
            <span className="text-[9px] uppercase font-bold text-amber-900">Pending SLA Approvals</span>
            <p className="text-xl font-black text-amber-950 mt-1">{pendingNGOList.length + pendingCampaignList.length} items</p>
          </div>
        </div>

        {/* Tabbed workspace */}
        <div className="glass-panel-heavy rounded-2xl border border-white/10/75 shadow-2xl overflow-hidden min-h-[400px] flex flex-col">
          
          {/* Tabs Menu headers */}
          <div className="flex border-b border-white/10/40 bg-slate-900/30 backdrop-blur-sm text-xs font-bold text-slate-400">
            <button
              onClick={() => setActiveSubTab("ngos")}
              className={`px-5 py-3.5 border-r border-white/10/40 transition-all cursor-pointer ${
                activeSubTab === "ngos" ? "bg-slate-800/80 text-amber-500 font-black hover:bg-slate-900/95" : "hover:bg-slate-900/45"
              }`}
            >
              NGO Verification Registry ({pendingNGOList.length})
            </button>
            <button
              onClick={() => setActiveSubTab("campaigns")}
              className={`px-5 py-3.5 border-r border-white/10/40 transition-all cursor-pointer ${
                activeSubTab === "campaigns" ? "bg-slate-800/80 text-amber-500 font-black hover:bg-slate-900/95" : "hover:bg-slate-900/45"
              }`}
            >
              Campaign Verification Requests ({pendingCampaignList.length})
            </button>
            <button
              onClick={() => setActiveSubTab("ledger")}
              className={`px-5 py-3.5 transition-all cursor-pointer ${
                activeSubTab === "ledger" ? "bg-slate-800/80 text-amber-500 font-black hover:bg-slate-900/95" : "hover:bg-slate-900/45"
              }`}
            >
              Decentralized Blocks Log ({blocks.length})
            </button>
          </div>

          {/* Active Panel Content */}
          <div className="p-6">
                     {activeSubTab === "ngos" && (
              <div className="space-y-4 font-semibold text-xs">
                
                {/* Visual filter options for tracking status in admin section */}
                <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-4">
                  <button
                    onClick={() => setNgoSectionFilter("pending")}
                    className={`px-3.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                      ngoSectionFilter === "pending"
                        ? "bg-purple-600 text-white border-[#0ea5e9] font-black shadow-sm"
                        : "bg-slate-900/60 text-slate-300 border-white/10 hover:bg-slate-900"
                    }`}
                  >
                    Pending Review ({pendingNGOList.length})
                  </button>
                  <button
                    onClick={() => setNgoSectionFilter("all")}
                    className={`px-3.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                      ngoSectionFilter === "all"
                        ? "bg-purple-600 text-white border-[#0ea5e9] font-black shadow-sm"
                        : "bg-slate-900/60 text-slate-300 border-white/10 hover:bg-slate-900"
                    }`}
                  >
                    All Registered NGOs ({(requests?.allNGOs || []).length})
                  </button>
                </div>

                {ngoSectionFilter === "pending" ? (
                  <>
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest font-sans">Pending NGO Registration Index Proposals</h3>
                    
                    {pendingNGOList.length === 0 ? (
                      <div className="text-center py-12 border border-dashed rounded-2xl border-white/10/60 bg-slate-900/20">
                        <ShieldCheck className="w-8 h-8 text-slate-305 mx-auto mb-1.5" />
                        <p className="text-xs text-slate-400 font-bold">No pending registrations are awaiting review.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left text-slate-400 border border-white/10/40 rounded-xl overflow-hidden shadow-sm">
                          <thead className="text-[10px] uppercase font-black text-slate-450 bg-slate-900/40">
                            <tr>
                              <th className="p-3">Registered Name</th>
                              <th className="p-3">Govt Registration Code</th>
                              <th className="p-3">Description</th>
                              <th className="p-3">Documents Proof</th>
                              <th className="p-3 text-right">Actions Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/30">
                            {pendingNGOList.map((ngoItem: any) => (
                              <tr key={ngoItem.id} className="hover:bg-slate-900/30 transition-colors">
                                <td className="p-3 font-bold text-slate-200">{ngoItem.ngoName}</td>
                                <td className="p-3 font-mono text-[10px] text-slate-400 font-bold">{ngoItem.registrationNumber || "Unset"}</td>
                                <td className="p-3 max-w-xs truncate font-medium text-slate-650">{ngoItem.description}</td>
                                <td className="p-3">
                                  <div className="flex flex-col gap-1.5 text-left">
                                    {ngoItem.documents && ngoItem.documents.length > 0 ? (
                                      ngoItem.documents.map((doc: any, index: number) => (
                                        <a
                                          key={index}
                                          href={doc.url}
                                          onClick={(e) => { e.preventDefault(); alert(`Downloading compliance certificate: ${doc.name}`); }}
                                          className="text-amber-500 font-black hover:underline hover:text-amber-500 truncate max-w-[150px] inline-flex items-center gap-1 cursor-pointer"
                                        >
                                          <FileText className="w-3.5 h-3.5" /> {doc.name}
                                        </a>
                                      ))
                                    ) : (
                                      <a
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); alert("Downloading compliance certificate: 80G_Certificate.pdf"); }}
                                        className="text-amber-500 font-black hover:underline inline-flex items-center gap-1 cursor-pointer"
                                      >
                                        <FileText className="w-3.5 h-3.5" /> 80G_Certificate.pdf
                                      </a>
                                    )}
                                  </div>
                                </td>
                                <td className="p-3 text-right flex justify-end gap-1.5">
                                  <button
                                    onClick={() => handleNgoApproval(ngoItem.id, true)}
                                    className="p-1 px-2.5 bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded font-bold text-[10px] flex items-center gap-0.5 cursor-pointer shadow"
                                  >
                                    <Check className="w-3.5 h-3.5" /> Approve
                                  </button>
                                  <button
                                    onClick={() => handleNgoApproval(ngoItem.id, false)}
                                    className="p-1 px-2.5 bg-red-500 hover:bg-red-600 text-white rounded font-bold text-[10px] flex items-center gap-0.5 cursor-pointer shadow"
                                  >
                                    <X className="w-3.5 h-3.5" /> Deny
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest font-sans">All Authenticated & Registered NGOs</h3>
                    
                    {(!requests?.allNGOs || requests.allNGOs.length === 0) ? (
                      <p className="text-xs text-slate-400 py-10 border border-dashed rounded-xl border-white/10/50 bg-slate-900/20 text-center">No registered NGOs found in system registries.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left text-slate-400 border border-white/10/40 rounded-xl overflow-hidden shadow-sm">
                          <thead className="text-[10px] uppercase font-black text-slate-450 bg-slate-900/40">
                            <tr>
                              <th className="p-3">Organization Name</th>
                              <th className="p-3">Registration ID</th>
                              <th className="p-3">Verification Track</th>
                              <th className="p-3">PDF Clearances</th>
                              <th className="p-3 text-right">Administrative overrides</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/30">
                            {requests.allNGOs.map((ngoItem: any) => (
                              <tr key={ngoItem.id} className="hover:bg-slate-900/30 transition-colors">
                                <td className="p-3 font-bold text-slate-200">
                                  <div className="flex items-center gap-2">
                                    {ngoItem.logo && (
                                      <img src={ngoItem.logo} alt="" className="w-5.5 h-5.5 rounded-full object-cover border border-white/10 bg-slate-900 shadow-sm shrink-0 referrerPolicy='no-referrer'" />
                                    )}
                                    <span>{ngoItem.ngoName}</span>
                                  </div>
                                </td>
                                <td className="p-3 font-mono text-[10px] text-slate-650 font-bold">{ngoItem.registrationNumber || "Not Linked"}</td>
                                <td className="p-3">
                                  {ngoItem.verified === "approved" ? (
                                    <span className="p-1 px-2.5 bg-fuchsia-500/10 text-fuchsia-800 border border-fuchsia-500/20 rounded-full text-[9px] font-black uppercase inline-flex items-center gap-1 shadow-sm">
                                      <Check className="w-3 h-3 text-fuchsia-600" /> CERTIFIED
                                    </span>
                                  ) : ngoItem.verified === "pending" ? (
                                    <span className="p-1 px-2.5 bg-amber-500/10 text-amber-800 border border-amber-500/20 rounded-full text-[9px] font-black uppercase inline-flex items-center gap-1 shadow-sm">
                                      <Clock className="w-3 h-3 text-amber-600 animate-pulse" /> PENDING
                                    </span>
                                  ) : (
                                    <span className="p-1 px-2.5 bg-rose-55/10 text-rose-800 border border-rose-55/20 rounded-full text-[9px] font-black uppercase inline-flex items-center gap-1 shadow-sm">
                                      <X className="w-3 h-3 text-rose-500" /> REJECTED
                                    </span>
                                  )}
                                </td>
                                <td className="p-3 font-medium">
                                  <div className="flex flex-col gap-1 text-left">
                                    {ngoItem.documents && ngoItem.documents.length > 0 ? (
                                      ngoItem.documents.map((doc: any, index: number) => (
                                        <a
                                          key={index}
                                          href={doc.url}
                                          onClick={(e) => { e.preventDefault(); alert(`Viewing compliance document: ${doc.name}`); }}
                                          className="text-amber-500 font-black hover:underline hover:text-amber-500 truncate max-w-[150px] inline-flex items-center gap-1 cursor-pointer"
                                        >
                                          <FileText className="w-3 h-3" /> {doc.name}
                                        </a>
                                      ))
                                    ) : (
                                      <span className="text-slate-400 italic font-normal">None uploaded</span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-3 text-right flex justify-end gap-1.5">
                                  {ngoItem.verified !== "approved" && (
                                    <button
                                      onClick={() => handleNgoApproval(ngoItem.id, true)}
                                      className="p-1 px-2.5 bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded font-bold text-[10px] flex items-center gap-0.5 cursor-pointer shadow"
                                    >
                                      <Check className="w-3 h-3" /> Approve
                                    </button>
                                  )}
                                  {ngoItem.verified !== "rejected" && (
                                    <button
                                      onClick={() => handleNgoApproval(ngoItem.id, false)}
                                      className="p-1 px-2.5 bg-red-500 hover:bg-red-600 text-white rounded font-bold text-[10px] flex items-center gap-0.5 cursor-pointer shadow"
                                    >
                                      <X className="w-3 h-3" /> Reject / Recertify
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeSubTab === "campaigns" && (
              <div className="space-y-4 font-semibold">
                <h3 className="text-xs font-bold text-white uppercase tracking-widest">Pending Campaign Sabbat proposals</h3>
                
                {pendingCampaignList.length === 0 ? (
                  <p className="text-xs text-slate-400 py-10 border border-dashed rounded-xl border-white/10/50 bg-slate-900/20 text-center">No pending campaign proposal draft in registry.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-slate-400 border border-white/10/45 rounded-xl overflow-hidden shadow-sm">
                      <thead className="text-[10px] uppercase font-black text-slate-450 bg-slate-900/40">
                        <tr>
                          <th className="p-3">Campaign Proposal</th>
                          <th className="p-3">Target NGO</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Goal amount (INR)</th>
                          <th className="p-3 text-right">Approval Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/30">
                        {pendingCampaignList.map((camp: any) => (
                          <tr key={camp.id} className="hover:bg-slate-900/30 transition-colors">
                            <td className="p-3 font-bold text-slate-200">{camp.title}</td>
                            <td className="p-3 font-medium text-slate-650">{camp.ngoName}</td>
                            <td className="p-3">
                              <span className="px-2.5 py-1 text-[9px] font-black bg-slate-800/80 border border-white/10/90 text-sky-700 shadow-sm rounded-full">
                                {camp.category}
                              </span>
                            </td>
                            <td className="p-3 font-bold text-slate-850">₹{camp.goalAmount.toLocaleString()}</td>
                            <td className="p-3 text-right flex justify-end gap-1.5">
                              <button
                                onClick={() => handleCampaignApproval(camp.id, true)}
                                className="p-1 px-2.5 bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded font-bold text-[10px] flex items-center gap-0.5 cursor-pointer shadow"
                              >
                                <Check className="w-3.5 h-3.5" /> Approve Proposal
                              </button>
                              <button
                                onClick={() => handleCampaignApproval(camp.id, false)}
                                className="p-1 px-2.5 bg-red-500 hover:bg-red-600 text-white rounded font-bold text-[10px] flex items-center gap-0.5 cursor-pointer shadow"
                              >
                                <X className="w-3.5 h-3.5" /> Reject Proposal
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeSubTab === "ledger" && (
              <div className="space-y-4 font-semibold">
                <h3 className="text-xs font-bold text-white uppercase tracking-widest">Active Ledger Blockchain Audit Transactions</h3>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {blocks.map((b) => (
                    <div key={b.index} className="p-3.5 bg-slate-900/40 hover:bg-slate-800/60 rounded-xl border border-white/10/50 flex justify-between items-center text-xs shadow-sm transition-colors">
                      <div className="space-y-1">
                        <span className="text-[9px] font-black uppercase text-purple-700">Block height: #{b.index}</span>
                        <p className="font-bold text-slate-200">Hash: <span className="font-mono text-slate-400 text-[10px] font-normal">{b.hash}</span></p>
                      </div>
                      <div className="text-right">
                        <strong className="text-white font-black text-xs font-sans">₹{b.amount.toLocaleString()}</strong>
                        <span className="block text-[8px] text-slate-450 font-mono font-semibold mt-0.5">Nonce solution solved: {b.nonce}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
