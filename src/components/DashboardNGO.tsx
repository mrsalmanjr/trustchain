import React, { useState, useEffect } from "react";
import { 
  PlusCircle, BarChart2, Briefcase, FileText, Upload, CheckCircle, 
  MapPin, Clock, Edit3, MessageSquare, IndianRupee, HelpCircle, Users, Eye,
  ShieldCheck, AlertCircle, Check, Trash2, Settings, Building, Mail, Download, FileSpreadsheet, AlertTriangle
} from "lucide-react";
import { api } from "../services/api";
import { downloadDummyPdf } from "../lib/pdf";

import NgoAnalyticsPanel from "./NgoAnalyticsPanel";
import NgoDonationsPanel from "./NgoDonationsPanel";
import NgoProfilePanel from "./NgoProfilePanel";
import NgoDonorQueriesPanel from "./NgoDonorQueriesPanel";

interface DashboardNGOProps {
  user: any;
  ngo: any;
  setTab: (tab: string) => void;
  setSelectedCampaignId: (id: string) => void;
  onRefreshNGO?: () => Promise<void>;
}

export default function DashboardNGO({ user, ngo, setTab, setSelectedCampaignId, onRefreshNGO }: DashboardNGOProps) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "create" | "campaigns" | "donations" | "reports" | "updates" | "analytics" | "documents" | "profile">("overview");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Verification
  const [docFileName, setDocFileName] = useState("");
  const [registrationCodeInput, setRegistrationCodeInput] = useState(ngo?.registrationNumber || "");
  const [queuedDocs, setQueuedDocs] = useState<{ name: string; url: string }[]>([]);
  const [isSubmitVerifyLoading, setIsSubmitVerifyLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Campaign create form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Education");
  const [goalAmount, setGoalAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [location, setLocation] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [beneficiaryCount, setBeneficiaryCount] = useState("");
  const [supportingDocs, setSupportingDocs] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // Campaign edit form
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("Education");
  const [editGoalAmount, setEditGoalAmount] = useState("");
  const [editDeadline, setEditDeadline] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editBannerImage, setEditBannerImage] = useState("");
  const [editBeneficiaryCount, setEditBeneficiaryCount] = useState("");

  // NGO custom profile states
  const [ngoName, setNgoName] = useState(ngo?.ngoName || "Teach India Organization");
  const [ngoDescription, setNgoDescription] = useState(ngo?.description || "Providing high-fidelity education resources to low-income children.");
  const [ngoAddress, setNgoAddress] = useState(ngo?.address || "12, Koramangala Outer Ring Road, Bangalore, India");
  const [ngoTagline, setNgoTagline] = useState(ngo?.tagline || "Enabling direct on-chain impact validation and absolute financial honesty.");
  const [ngoEmail, setNgoEmail] = useState(user?.email || "trustees@teachindia.org");
  const [ngoPhone, setNgoPhone] = useState("+91-9876543210");
  const [ngoLogo, setNgoLogo] = useState(ngo?.logo || "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&auto=format&fit=crop&q=80");
  const [ngoBankAccount, setNgoBankAccount] = useState(ngo?.bankAccount || "");
  const [ngoIfscCode, setNgoIfscCode] = useState(ngo?.ifscCode || "");
  const [ngoUpiId, setNgoUpiId] = useState(ngo?.upiId || "");

  // Donor queries interactive state
  const [donorQueries, setDonorQueries] = useState([
    { id: "q1", donorName: "Aman Sen", campaignTitle: "Tablets for Rural Singhbhum Schools", message: "How do we verify the serial numbers of tablets shipped in Batch 1?", status: "pending", date: "2026-06-02T10:15:00Z", response: "" },
    { id: "q2", donorName: "Dr. Rachel Green", campaignTitle: "Cardiac Surgery Support for Infants", message: "Are direct recipient bills uploaded onto the ledger in real-time?", status: "replied", date: "2026-06-01T14:30:00Z", response: "Yes, all procurement records are scanned and loaded within 24 hours of execution." }
  ]);
  const [queryResponseText, setQueryResponseText] = useState("");
  const [selectedQueryId, setSelectedQueryId] = useState<string | null>(null);

  // Tools page states
  const [selectedToolsCampId, setSelectedToolsCampId] = useState("");
  const [updTitle, setUpdTitle] = useState("");
  const [updDesc, setUpdDesc] = useState("");
  const [repTitle, setRepTitle] = useState("");
  const [repDesc, setRepDesc] = useState("");
  const [repAmount, setRepAmount] = useState("");
  const [repRecipient, setRepRecipient] = useState("");

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const resp = await api.getNgoAnalytics();
      setAnalytics(resp);
      if (resp.campaigns?.length > 0) {
        setSelectedToolsCampId(resp.campaigns[0].id);
      }
    } catch (e: any) {
      setError(e.message || "Failed to load NGO analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await api.createCampaign({
        title,
        description,
        category,
        goalAmount,
        deadline,
        location,
        bannerImage,
        SupportingDocs: supportingDocs ? supportingDocs.split(",").map(s => s.trim()) : undefined,
        beneficiaryCount
      });
      setSuccess("Campaign draft successfully submitted for approval!");
      setTitle(""); setDescription(""); setGoalAmount(""); setDeadline(""); setLocation(""); setBannerImage(""); setBeneficiaryCount(""); setSupportingDocs("");
      loadAnalytics();
      setActiveSubTab("campaigns");
    } catch (err: any) {
      setError(err.message || "Template submission failed.");
    }
  };

  const handleStartEditCampaign = (c: any) => {
    setEditingCampaignId(c.id);
    setEditTitle(c.title);
    setEditDescription(c.description);
    setEditCategory(c.category);
    setEditGoalAmount(c.goalAmount.toString());
    setEditDeadline(c.deadline ? c.deadline.split("T")[0] : "");
    setEditLocation(c.location || "");
    setEditBannerImage(c.bannerImage || "");
    setEditBeneficiaryCount(c.beneficiaryCount?.toString() || "");
  };

  const handleSaveEditCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await api.editCampaign(editingCampaignId!, {
        title: editTitle,
        description: editDescription,
        category: editCategory,
        goalAmount: editGoalAmount,
        deadline: editDeadline,
        location: editLocation,
        bannerImage: editBannerImage,
        beneficiaryCount: editBeneficiaryCount
      });
      setSuccess("Campaign config successfully saved.");
      setEditingCampaignId(null);
      loadAnalytics();
    } catch (err: any) {
      setError(err.message || "Failed to edit campaign.");
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!window.confirm("Delete this campaign permanently?")) return;
    setError("");
    setSuccess("");
    try {
      await api.deleteCampaign(id);
      setSuccess("Campaign permanently removed.");
      loadAnalytics();
    } catch (err: any) {
      setError(err.message || "Failed to delete.");
    }
  };

  const handleAddProgressUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      await api.uploadUpdate(selectedToolsCampId, { title: updTitle, description: updDesc });
      setSuccess("Milestone update broadcasted on-chain!");
      setUpdTitle(""); setUpdDesc("");
      loadAnalytics();
    } catch (err: any) {
      setError(err.message || "Failed to post milestone.");
    }
  };

  const handleAddUtilizationReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      await api.uploadReport(selectedToolsCampId, {
        title: repTitle,
        description: repDesc,
        amountUsed: repAmount,
        recipientName: repRecipient
      });
      setSuccess("Expenditure report scanned and linked successfully!");
      setRepTitle(""); setRepDesc(""); setRepAmount(""); setRepRecipient("");
      loadAnalytics();
    } catch (err: any) {
      setError(err.message || "Failed to register report.");
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      await api.updateNgoProfile({
        ngoName, description: ngoDescription, address: ngoAddress, tagline: ngoTagline,
        logo: ngoLogo, bankAccount: ngoBankAccount, ifscCode: ngoIfscCode, upiId: ngoUpiId
      });
      setSuccess("Organizational identity successfully broadcast over TrustChain nodes!");
      if (onRefreshNGO) await onRefreshNGO();
    } catch (err: any) {
      setError(err.message || "Failed to save profile.");
    }
  };

  const handleRespondToQuery = (id: string) => {
    setDonorQueries(q => q.map(item => item.id === id ? { ...item, status: "replied", response: queryResponseText } : item));
    setSuccess("Response dispatched securely.");
    setQueryResponseText("");
    setSelectedQueryId(null);
  };

  const handleNGOVerificationSubmit = async () => {
    if (queuedDocs.length === 0) {
      setError("Dossier requires at least one cleared certification PDF file.");
      return;
    }
    setIsSubmitVerifyLoading(true);
    try {
      await api.submitNgoVerification({ registrationNumber: registrationCodeInput, documents: queuedDocs });
      setSuccess("Dossier submitted successfully to administrator review registry!");
      setQueuedDocs([]);
      if (onRefreshNGO) await onRefreshNGO();
    } catch (err: any) {
      setError(err.message || "Submission failed.");
    } finally {
      setIsSubmitVerifyLoading(false);
    }
  };

  if (loading && !analytics) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-slate-400">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500 mb-2" />
        <p className="text-xs">Authenticating secure NGO keys...</p>
      </div>
    );
  }

  const myCampaigns = analytics?.campaigns || [];
  const totalRaised = analytics?.totalRaised || 0;
  const activeCount = analytics?.activeCount || 0;
  const completedCount = analytics?.completedCount || 0;
  const donorsCount = analytics?.donorsCount || 0;
  const recentDonations = analytics?.recentDonations || [];

  // Calculate 5th card metric - Average campaign progress score
  const avgProgress = myCampaigns.length > 0 
    ? Math.round(myCampaigns.reduce((sum: number, c: any) => sum + Math.min(100, (c.raisedAmount / c.goalAmount) * 100), 0) / myCampaigns.length)
    : 0;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 text-left bg-transparent">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* NGO Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10/45">
          <div className="flex items-center gap-4">
            <img src={ngoLogo} alt="" className="w-12 h-12 rounded-xl object-cover border border-white/10 referrerPolicy='no-referrer'" />
            <div>
              <h1 className="text-2xl font-black text-white leading-tight">{ngoName}</h1>
              <p className="text-slate-400 text-xs italic">{ngoTagline}</p>
            </div>
          </div>
          
          <div className="shrink-0">
            {ngo?.verified === "approved" ? (
              <span className="p-1.5 px-3.5 bg-fuchsia-50 text-fuchsia-800 border border-fuchsia-200 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 shadow-sm">
                <CheckCircle className="w-4 h-4 text-purple-400" /> STATUS: CERTIFIED
              </span>
            ) : (
              <span className="p-1.5 px-3.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 shadow-sm">
                <Clock className="w-4 h-4 text-amber-500" /> STATUS: PENDING CLEARANCE
              </span>
            )}
          </div>
        </div>

        {/* Messaging Logs */}
        {error && <p className="p-3 bg-red-50 text-red-800 border border-red-100 rounded-xl text-xs">{error}</p>}
        {success && <p className="p-3 bg-fuchsia-50 text-fuchsia-800 border border-fuchsia-100 rounded-xl text-xs font-bold">{success}</p>}

        {/* 5 Distinct Dashboard Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="glass-panel rounded-2xl border border-white/10/60 p-4 shadow bg-slate-900/40 font-semibold">
            <span className="text-[9px] uppercase font-bold text-slate-400 block">Total Raised</span>
            <p className="text-lg font-black text-white mt-1">₹{totalRaised.toLocaleString()}</p>
          </div>
          <div className="glass-panel rounded-2xl border border-white/10/60 p-4 shadow bg-slate-900/40 font-semibold">
            <span className="text-[9px] uppercase font-bold text-slate-400 block">Active Goals</span>
            <p className="text-lg font-black text-amber-500 mt-1">{activeCount} live</p>
          </div>
          <div className="glass-panel rounded-2xl border border-white/10/60 p-4 shadow bg-slate-900/40 font-semibold">
            <span className="text-[9px] uppercase font-bold text-slate-400 block">Concluded Goals</span>
            <p className="text-lg font-black text-fuchsia-700 mt-1">{completedCount} items</p>
          </div>
          <div className="glass-panel rounded-2xl border border-white/10/60 p-4 shadow bg-slate-900/40 font-semibold">
            <span className="text-[9px] uppercase font-bold text-slate-400 block">Unique Donors</span>
            <p className="text-lg font-black text-slate-200 mt-1">{donorsCount} accounts</p>
          </div>
          <div className="glass-panel rounded-2xl border border-white/10/60 p-4 shadow bg-fuchsia-50/20 font-semibold border-fuchsia-100">
            <span className="text-[9px] uppercase font-bold text-fuchsia-800 block">Impact Score</span>
            <p className="text-lg font-black text-fuchsia-800 mt-1">{avgProgress}% Progress</p>
          </div>
        </div>

        {/* Main Workspaces Layout */}
        <div className="glass-panel-heavy rounded-2xl border border-white/10/75 overflow-hidden shadow-2xl flex flex-col md:flex-row bg-slate-900/10 min-h-[500px]">
          
          {/* Subtabs Menu Selection sidebar */}
          <div className="md:w-1/4 border-r border-[#E2E8F0] bg-slate-900/45 backdrop-blur-sm p-4 space-y-2">
            {[
              { id: "overview", label: "Dashboard", icon: BarChart2 },
              { id: "create", label: "Create Campaign", icon: PlusCircle },
              { id: "campaigns", label: "Manage Campaigns", icon: Briefcase },
              { id: "donations", label: "Donations Received", icon: IndianRupee },
              { id: "reports", label: "Fund Utilization Reports", icon: FileSpreadsheet },
              { id: "updates", label: "Campaign Updates", icon: MessageSquare },
              { id: "analytics", label: "Analytics", icon: Eye },
              { id: "documents", label: "Documents", icon: ShieldCheck },
              { id: "profile", label: "Profile Settings", icon: Settings },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveSubTab(tab.id as any); setError(""); setSuccess(""); }}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all text-left cursor-pointer ${
                    activeSubTab === tab.id ? "bg-slate-900 text-amber-500 font-black shadow border border-[#E2E8F0]" : "text-slate-400 hover:text-slate-950 hover:bg-slate-900/40"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" /> {tab.label}
                </button>
              );
            })}
          </div>

          {/* Dynamic Render Workspace Panel */}
          <div className="md:w-3/4 p-6 bg-slate-900/5">
            
            {/* 1. Dashboard Overview Tab */}
            {activeSubTab === "overview" && (
              <div className="space-y-6">
                
                {/* Allocations summary */}
                <div className="space-y-3 font-semibold text-xs text-slate-300">
                  <h3 className="font-extrabold text-white text-sm">Active Funding Allocations</h3>
                  {myCampaigns.length === 0 ? (
                    <p className="py-6 border border-dashed rounded-xl text-center text-slate-450 bg-slate-900/10">No campaigns launched. Use "Create Campaign" tab first.</p>
                  ) : (
                    <div className="space-y-3">
                      {myCampaigns.map((c: any) => {
                        const pct = Math.min(100, Math.round((c.raisedAmount / c.goalAmount) * 100));
                        return (
                          <div key={c.id} className="p-3 bg-slate-900/55 border border-white/10/60 shadow-sm rounded-xl space-y-1.5">
                            <div className="flex justify-between font-bold text-slate-200">
                              <span className="truncate max-w-[250px]">{c.title}</span>
                              <span>{pct}%</span>
                            </div>
                            <div className="w-full bg-slate-800/50 h-2 rounded-full overflow-hidden border">
                              <div className="h-full bg-purple-900/300 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <div className="flex justify-between text-[9px] text-slate-450 font-mono">
                              <span>Raised: ₹{c.raisedAmount.toLocaleString()}</span>
                              <span>Goal quota: ₹{c.goalAmount.toLocaleString()}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Split queries and received logs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  
                  {/* Miniature Received logs */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Recent Deposits</h3>
                    {recentDonations.length === 0 ? (
                      <p className="p-4 bg-slate-900/20 rounded-xl text-center text-slate-450 text-[10px] italic">No deposits resolved yet.</p>
                    ) : (
                      <div className="space-y-2 font-semibold">
                        {recentDonations.slice(0, 4).map((d: any) => (
                          <div key={d.id} className="p-2.5 bg-slate-800/60 border border-white/10/65 rounded-xl flex justify-between items-center text-[11px] shadow-sm">
                            <div className="truncate pr-2">
                              <span className="font-bold text-slate-200 block truncate max-w-[130px]">{d.donorName || "Anonymous Node"}</span>
                              <span className="text-[9px] text-slate-450 block truncate font-normal">{d.campaignName}</span>
                            </div>
                            <span className="font-extrabold text-white shrink-0 font-sans">₹{d.amount.toLocaleString()}</span>
                          </div>
                      ))}
                      </div>
                    )}
                  </div>

                  {/* Pending Messages logs */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Pending Citizen Queries</h3>
                    <div className="space-y-2 font-semibold text-[11px]">
                      {donorQueries.filter(q => q.status === "pending").length === 0 ? (
                        <p className="p-4 bg-slate-900/20 rounded-xl text-center text-slate-450 text-[10px] italic">No pending inquiries. All queries resolved.</p>
                      ) : (
                        donorQueries.filter(q => q.status === "pending").map(q => (
                          <div key={q.id} className="p-2.5 bg-slate-800/60 border border-white/10 py-3 rounded-xl space-y-1">
                            <span className="font-black text-slate-200">{q.donorName}</span>
                            <p className="text-[10px] text-slate-400 italic pr-2 line-clamp-2">"{q.message}"</p>
                            <button
                              onClick={() => {
                                // Jump directly to queries responding
                                setActiveSubTab("overview");
                                setSelectedQueryId(q.id);
                              }}
                              className="text-[#0ea5e9] hover:underline font-black mt-1 text-[9px] uppercase tracking-wider inline-block cursor-pointer"
                            >
                              Resolve Answer →
                            </button>
                          </div>
                      ))
                    )}
                    </div>
                  </div>

                </div>

                {/* Interactive answers drawer directly on dashboard */}
                {selectedQueryId && (
                  <div className="p-4 bg-purple-900/30/50 rounded-xl border border-purple-500/30 mt-4 animate-fade-in text-xs font-semibold">
                    <h4 className="font-extrabold text-slate-200">Resolve Citizen Query ID: #{selectedQueryId}</h4>
                    <p className="text-slate-505 italic mb-3">"{donorQueries.find(q => q.id === selectedQueryId)?.message}"</p>
                    <textarea
                      rows={2}
                      placeholder="Write your cryptographically certified response..."
                      value={queryResponseText}
                      onChange={(e) => setQueryResponseText(e.target.value)}
                      className="w-full text-xs p-2 bg-slate-900 border rounded-xl outline-none"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button onClick={() => setSelectedQueryId(null)} className="p-1 px-3 bg-slate-900 border text-[10px] rounded-lg cursor-pointer">Cancel</button>
                      <button onClick={() => handleRespondToQuery(selectedQueryId)} className="p-1 px-4 bg-purple-600 text-white text-[10px] font-bold rounded-lg cursor-pointer">Post Secure Answer</button>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* 2. Create Campaign Tab */}
            {activeSubTab === "create" && (
              <form onSubmit={handleCreateCampaign} className="space-y-4 text-xs font-semibold" id="new-charity-campaign-form">
                <h3 className="font-extrabold text-white border-b pb-2 text-sm uppercase">Launch Campaign Proposal</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Campaign Title</label>
                    <input type="text" placeholder="e.g. Literacy Support in Singhbhum" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-white/10/60 rounded-xl text-slate-200" required />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-white/10/60 rounded-xl text-slate-805 cursor-pointer">
                      <option value="Education">Education</option>
                      <option value="Medical">Medical</option>
                      <option value="Disaster Relief">Disaster Relief</option>
                      <option value="Animal Welfare">Animal Welfare</option>
                      <option value="Environment">Environment</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Mission Description</label>
                  <textarea rows={3} placeholder="Budget breakdowns, target goals and operation timelines..." value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-white/10/60 rounded-xl text-slate-200" required />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Funding Goal (INR)</label>
                    <input type="number" placeholder="500000" value={goalAmount} onChange={(e) => setGoalAmount(e.target.value)} className="w-full p-2.5 bg-slate-900 border rounded-xl" required />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Deadline Date</label>
                    <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full p-2.5 bg-slate-900 border rounded-xl text-slate-300 cursor-pointer" required />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Location / District</label>
                    <input type="text" placeholder="e.g. Ranchi, Jharkhand" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full p-2.5 bg-slate-900 border rounded-xl" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Banner Cover Image URL</label>
                    <input type="url" placeholder="https://images.unsplash.com/..." value={bannerImage} onChange={(e) => setBannerImage(e.target.value)} className="w-full p-2.5 bg-slate-900 border rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Beneficiary Count Estimate</label>
                    <input type="number" placeholder="250" value={beneficiaryCount} onChange={(e) => setBeneficiaryCount(e.target.value)} className="w-full p-2.5 bg-slate-900 border rounded-xl" />
                  </div>
                  <div className="font-sans">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Docs Proofs (PDF Filename)</label>
                    <input type="text" placeholder="BudgetPlan.pdf" value={supportingDocs} onChange={(e) => setSupportingDocs(e.target.value)} className="w-full p-2.5 bg-slate-900 border rounded-xl" />
                  </div>
                </div>

                <button type="submit" className="w-full py-3 bg-purple-600 hover:bg-sky-620 text-white font-extrabold rounded-xl uppercase tracking-widest text-[10px] transition-all cursor-pointer shadow">Submit Campaign for Admin Review</button>
              </form>
            )}

            {/* 3. Manage Campaigns Tab */}
            {activeSubTab === "campaigns" && (
              <div className="space-y-6 text-xs text-left font-semibold text-slate-705">
                <h3 className="font-extrabold text-slate-905 border-b pb-2 text-sm uppercase">Manage Launched Campaigns</h3>
                
                {/* INLINE EDIT WORKSPACE FORM */}
                {editingCampaignId && (
                  <form onSubmit={handleSaveEditCampaign} className="p-4 bg-purple-900/30/50 border border-purple-900/50 rounded-2xl space-y-4 shadow animate-fade-in text-slate-200">
                    <div className="flex justify-between items-center border-b pb-1.5 mb-1.5">
                      <h4 className="font-extrabold text-amber-500 uppercase text-[11px] tracking-tight">Active Edit Form - ID: {editingCampaignId}</h4>
                      <button type="button" onClick={() => setEditingCampaignId(null)} className="text-slate-450 hover:text-slate-300">Cancel</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[8px] uppercase tracking-wider font-bold mb-1">Title</label>
                        <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full p-2 bg-slate-900 border rounded-lg" required />
                      </div>
                      <div>
                        <label className="block text-[8px] uppercase tracking-wider font-bold mb-1">Category</label>
                        <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="w-full p-2 bg-slate-900 border rounded-lg cursor-pointer">
                          <option value="Education">Education</option>
                          <option value="Medical">Medical</option>
                          <option value="Disaster Relief">Disaster Relief</option>
                          <option value="Animal Welfare">Animal Welfare</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[8px] uppercase tracking-wider font-bold mb-1">Description</label>
                      <textarea rows={2} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="w-full p-2 bg-slate-900 border rounded-lg" required />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[8px] uppercase tracking-wider font-bold mb-1">Goal Amount (INR)</label>
                        <input type="number" value={editGoalAmount} onChange={(e) => setEditGoalAmount(e.target.value)} className="w-full p-2 bg-slate-900 border rounded-lg" required />
                      </div>
                      <div>
                        <label className="block text-[8px] uppercase tracking-wider font-bold mb-1">Deadline Date</label>
                        <input type="date" value={editDeadline} onChange={(e) => setEditDeadline(e.target.value)} className="w-full p-2 bg-slate-900 border rounded-lg text-slate-300 font-medium cursor-pointer" required />
                      </div>
                      <div>
                        <label className="block text-[8px] uppercase tracking-wider font-bold mb-1">Location</label>
                        <input type="text" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} className="w-full p-2 bg-slate-900 border rounded-lg" />
                      </div>
                    </div>

                    <button type="submit" className="p-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-extrabold uppercase rounded-xl text-[9px] text-center w-full shadow pointer cursor-pointer">Save Campaign Changes</button>
                  </form>
                )}

                {myCampaigns.length === 0 ? (
                  <p className="py-6 border border-dashed text-slate-400 text-center">No campaigns launched.</p>
                ) : (
                  <div className="space-y-3">
                    {myCampaigns.map((c: any) => (
                      <div key={c.id} className="p-4 bg-slate-800/60 hover:bg-slate-800 border border-white/10/60 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all shadow-sm">
                        
                        <div className="space-y-1">
                          <h4 className="font-extrabold text-slate-200 text-xs">{c.title}</h4>
                          <span className="text-[10px] text-slate-450 uppercase font-bold block">Goal: ₹{c.goalAmount.toLocaleString()} | Category: {c.category} | Location: {c.location}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase inline-block border mt-1 ${
                            c.status === "active" ? "bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200" : "bg-amber-50 text-amber-800 border-amber-200"
                          }`}>{c.status}</span>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] uppercase font-black font-sans shrink-0">
                          <button onClick={() => handleStartEditCampaign(c)} className="px-3.5 py-2 bg-purple-900/300 hover:bg-sky-600 text-white rounded-lg flex items-center gap-1 cursor-pointer"><Edit3 className="w-3.5 h-3.5" /> Edit</button>
                          <button onClick={() => handleDeleteCampaign(c.id)} className="px-3.5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-1 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. Donations Received Tab */}
            {activeSubTab === "donations" && (
              <NgoDonationsPanel recentDonations={recentDonations} />
            )}

            {/* 5. Reports & Utilization Tab (Progress & Utilizing Tools) */}
            {(activeSubTab === "reports" || activeSubTab === "updates") && (
              <div className="space-y-8 text-xs font-semibold text-slate-300 text-left">
                
                {/* Selector */}
                <div className="p-4 bg-slate-900/40 border border-white/10/50 rounded-xl space-y-2 mb-4">
                  <h4 className="font-extrabold text-[#0ea5e9]">
                    {activeSubTab === "reports" ? "Campaign Expenditure Scope Selector" : "Campaign Milestones Scope Selector"}
                  </h4>
                  {myCampaigns.length === 0 ? (
                    <p className="text-slate-450 font-bold italic">No active campaigns available.</p>
                  ) : (
                    <select value={selectedToolsCampId} onChange={(e) => setSelectedToolsCampId(e.target.value)} className="w-full max-w-sm p-2 bg-slate-900 border border-white/10 rounded-xl text-slate-200 font-bold cursor-pointer">
                      {myCampaigns.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-8">
                  
                  {/* Progress Milestone form */}
                  {activeSubTab === "updates" && (
                    <form onSubmit={handleAddProgressUpdate} className="space-y-4 p-5 bg-slate-900 border border-[#E2E8F0] shadow-sm rounded-2xl">
                      <h4 className="font-black text-white border-b pb-2 flex items-center gap-1.5"><MessageSquare className="w-4 h-4 text-[#0ea5e9]" /> Broadcast Campaign Milestone Update</h4>
                      <div>
                        <label className="block text-[9px] font-bold uppercase text-slate-400 tracking-wider mb-1">Milestone Progress Headline</label>
                        <input type="text" placeholder="e.g. Volunteers completed local computer lab assembly" value={updTitle} onChange={(e) => setUpdTitle(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-[#E2E8F0] rounded-xl outline-none" required />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold uppercase text-slate-400 tracking-wider mb-1">Details description</label>
                        <textarea rows={3} placeholder="Explain exactly what was completed, logistics milestones and target beneficiary impacts..." value={updDesc} onChange={(e) => setUpdDesc(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-[#E2E8F0] rounded-xl outline-none text-xs" required />
                      </div>
                      <div className="flex justify-end pt-1">
                        <button type="submit" className="p-2 px-5 bg-purple-600 hover:bg-sky-620 text-white rounded-lg cursor-pointer tracking-wider font-extrabold text-[9px] uppercase shadow-sm">Post progress update</button>
                      </div>
                    </form>
                  )}

                  {/* Fund Utility receipts form */}
                  {activeSubTab === "reports" && (
                    <form onSubmit={handleAddUtilizationReport} className="space-y-4 p-5 bg-slate-900 border border-[#E2E8F0] shadow-sm rounded-2xl">
                      <h4 className="font-black text-white border-b pb-2 flex items-center gap-1.5"><IndianRupee className="w-4 h-4 text-purple-400" /> Upload Fund utilization bill / report</h4>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-bold uppercase text-slate-400 tracking-wider mb-1">Vendor / Beneficiary Name</label>
                          <input type="text" placeholder="Dexter Electronics" value={repRecipient} onChange={(e) => setRepRecipient(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-[#E2E8F0] rounded-xl outline-none" required />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold uppercase text-slate-400 tracking-wider mb-1">Reference Title</label>
                          <input type="text" placeholder="Procured 12 Android units" value={repTitle} onChange={(e) => setRepTitle(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-[#E2E8F0] rounded-xl outline-none" required />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-bold uppercase text-slate-400 tracking-wider mb-1">INR Amount Used</label>
                          <input type="number" placeholder="250000" value={repAmount} onChange={(e) => setRepAmount(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-[#E2E8F0] rounded-xl outline-none" required />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold uppercase text-slate-400 tracking-wider mb-1">Scope Explanation</label>
                          <input type="text" placeholder="Tax receipts and serial keys cleared." value={repDesc} onChange={(e) => setRepDesc(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-[#E2E8F0] rounded-xl outline-none" />
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button type="submit" className="p-2 px-5 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-lg cursor-pointer tracking-wider font-extrabold text-[9px] uppercase shadow-sm">Save Expenditure Receipt</button>
                      </div>
                    </form>
                  )}

                </div>

                {/* HISTORICAL LOGS OF PREVIOUSLY FILED RECORDS */}
                <div className="border-t border-white/10/50 pt-6">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">
                    {activeSubTab === "reports" ? "Expenditures Filed Logs Ledger" : "Milestone Progress Timeline Logs"}
                  </h3>
                  
                  {myCampaigns.length === 0 ? (
                    <p className="italic text-slate-400 font-medium">Clearances registry empty.</p>
                  ) : (
                    <div className="space-y-4">
                      {myCampaigns.map((c: any) => {
                        const totalReports = c.utilizationReports?.length || 0;
                        const totalUpdates = c.updates?.length || 0;
                        if (activeSubTab === "reports" && totalReports === 0) return null;
                        if (activeSubTab === "updates" && totalUpdates === 0) return null;
                        return (
                          <div key={c.id} className="p-4 bg-slate-900/40 border border-white/10/60 rounded-2xl text-slate-300 font-semibold space-y-3">
                            <h4 className="font-extrabold text-slate-200 border-b pb-1">Report registry for: <strong className="text-white">{c.title}</strong></h4>
                            
                            {/* Updates */}
                            {activeSubTab === "updates" && totalUpdates > 0 && (
                              <div className="space-y-2">
                                <span className="text-[9px] font-bold uppercase text-amber-500 tracking-wider block">Completed Milestone Track ({totalUpdates})</span>
                                {c.updates.map((u: any, idx: number) => (
                                  <div key={idx} className="p-2 bg-slate-900/70 rounded-lg text-[10px] space-y-0.5 border border-white/10">
                                    <strong className="text-slate-200">{u.title}</strong>
                                    <p className="text-slate-400">{u.description}</p>
                                    <span className="text-[8px] font-mono text-slate-400 block pt-0.5">Dispatched: {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Reports */}
                            {activeSubTab === "reports" && totalReports > 0 && (
                              <div className="space-y-2 pt-1">
                                <span className="text-[9px] font-bold uppercase text-fuchsia-600 tracking-wider block">Ledger Scanned Expenditure Invoices ({totalReports})</span>
                                {c.utilizationReports.map((r: any, idx: number) => (
                                  <div key={idx} className="p-2 bg-fuchsia-50/40 rounded-lg text-[10px] flex justify-between items-center border border-fuchsia-100">
                                    <div>
                                      <strong className="text-slate-850 block">{r.title}</strong>
                                      <span className="text-[8px] text-slate-450 block">Vendor: {r.recipientName || "Internal"} | Explanatory notes: {r.description}</span>
                                    </div>
                                    <strong className="text-fuchsia-800 font-sans">₹{(r.amountUsed || r.amount)?.toLocaleString()}</strong>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* 6. Visual Analytics Tab */}
            {activeSubTab === "analytics" && (
              <NgoAnalyticsPanel campaigns={myCampaigns} totalRaised={totalRaised} donorsCount={donorsCount} />
            )}

            {/* 7. Profile Settings Tab */}
            {activeSubTab === "profile" && (
              <NgoProfilePanel
                ngoName={ngoName} setNgoName={setNgoName}
                ngoDescription={ngoDescription} setNgoDescription={setNgoDescription}
                ngoAddress={ngoAddress} setNgoAddress={setNgoAddress}
                ngoTagline={ngoTagline} setNgoTagline={setNgoTagline}
                ngoEmail={ngoEmail} setNgoEmail={setNgoEmail}
                ngoPhone={ngoPhone} setNgoPhone={setNgoPhone}
                ngoLogo={ngoLogo} setNgoLogo={setNgoLogo}
                ngoBankAccount={ngoBankAccount} setNgoBankAccount={setNgoBankAccount}
                ngoIfscCode={ngoIfscCode} setNgoIfscCode={setNgoIfscCode}
                ngoUpiId={ngoUpiId} setNgoUpiId={setNgoUpiId}
                onSave={handleSaveProfile}
                successMessage={success}
                errorMessage={error}
              />
            )}

            {/* 8. NGO Documents Verification Tab */}
            {activeSubTab === "documents" && (
              <div className="space-y-8 text-xs font-semibold text-slate-300 text-left">
                
                {/* Timeline and instructions */}
                <div className="p-5 bg-slate-800/60 border border-white/10/70 rounded-2xl shadow-sm backdrop-blur-sm space-y-4">
                  <div className="flex justify-between items-center border-b pb-3">
                    <div>
                      <h4 className="font-extrabold text-[#0ea5e9] text-base">NGO Compliance Verification Dossier</h4>
                      <p className="text-slate-400 font-medium text-[10px] mt-0.5">Submit regulatory and tax clearance documents to obtain CERTIFIED active status.</p>
                    </div>
                    <div>
                      {ngo?.verified === "approved" ? (
                        <span className="p-1 px-3 bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-200 rounded-full font-black text-[9px] uppercase">CERTIFIED ACTIVE</span>
                      ) : (
                        <span className="p-1 px-3 bg-amber-100 text-amber-800 border border-amber-200 rounded-full font-black text-[9px] uppercase animate-pulse">AWAITING SYSTEM AUDIT</span>
                      )}
                    </div>
                  </div>

                  <p className="leading-relaxed leading-normal text-slate-550">
                    To comply with global on-chain social fundraising transparency, every registered trust must provide regulatory proofs (such as 12A/8G exception clauses). Upload certificates underneath, which will be logged into the administrative master index.
                  </p>

                  <div className="border-t pt-3 relative">
                    <h5 className="font-bold text-slate-200 uppercase text-[9px] tracking-wider mb-2">Audit Compliance Pipeline</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="p-2 bg-slate-900/40 rounded-xl border border-white/10/60"><span className="text-[10px] font-bold text-purple-400 block">1. Sign Onboard</span> <span className="text-[8px] uppercase font-bold text-[#0ea5e9]">COMPLETED</span></div>
                      <div className="p-2 bg-slate-900/40 rounded-xl border border-white/10/60"><span className="text-[10px] font-bold text-purple-400 block">2. Upload PDFs</span> <span className="text-[8px] uppercase font-bold text-[#0ea5e9]">READY</span></div>
                      <div className="p-2 bg-slate-150/40 rounded-xl border border-white/10/50"><span className="text-[10px] font-bold text-slate-400 block">3. Oversight Audit</span> <span className="text-[8px] uppercase font-bold text-slate-400">PENDING QUEUE</span></div>
                      <div className="p-2 bg-slate-150/40 rounded-xl border border-white/10/50"><span className="text-[10px] font-bold text-slate-400 block">4. Certify Node</span> <span className="text-[8px] uppercase font-bold text-slate-400">LOCKED</span></div>
                    </div>
                  </div>
                </div>

                {/* Submissions interactive panel */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                  
                  {/* Selector field & file writer simulation */}
                  <div className="p-4 bg-slate-900/40 border border-white/10/60 rounded-xl space-y-4">
                    <h4 className="font-extrabold text-slate-200 uppercase text-[10px] border-b pb-2">Upload Clearance Certificate</h4>
                    
                    <div>
                      <label className="block text-[8px] font-bold uppercase tracking-wider mb-1">Corporate Registration Code</label>
                      <input type="text" value={registrationCodeInput} onChange={(e) => setRegistrationCodeInput(e.target.value)} placeholder="e.g. NGO-IND-80G-2023-8821" className="w-full p-2 bg-slate-900 border rounded-lg font-mono font-bold" />
                    </div>

                    <div className="border-2 border-dashed border-purple-900/50 hover:border-sky-300 p-5 rounded-xl bg-purple-900/30/10 text-center space-y-2">
                      <Upload className="w-6 h-6 text-amber-400 mx-auto" />
                      <p className="text-[10px] text-slate-400 font-bold">Write Certificate Filename and click upload:</p>
                      
                      <div className="flex gap-2 w-full max-w-xs mx-auto">
                        <input type="text" placeholder="e.g. Trust_Deed_80G.pdf" value={docFileName} onChange={(e) => setDocFileName(e.target.value)} className="w-full text-xs p-1.5 bg-slate-900 border rounded" />
                        <button
                          type="button"
                          onClick={() => {
                            if (!docFileName.trim()) return;
                            setQueuedDocs([...queuedDocs, { name: docFileName.toLowerCase().endsWith(".pdf") ? docFileName : docFileName + ".pdf", url: "#" }]);
                            setDocFileName("");
                            setSuccess("Certificate file added to dossier dispatcher queue!");
                          }}
                          className="p-1 px-3 bg-purple-900/300 text-white font-bold text-[10px] rounded hover:bg-sky-620 cursor-pointer"
                        >
                          Queue
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5 justify-center pt-2">
                        {["80G_Tax_Clearance.pdf", "Section_12A_Entity.pdf", "Trustee_Board_Resolution.pdf"].map(name => (
                          <button key={name} type="button" onClick={() => setDocFileName(name)} className="p-1 px-2 border rounded font-mono text-[8px] bg-slate-900 text-amber-500 hover:border-sky-305 cursor-pointer">
                            + {name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Dispatcher Queue */}
                  <div className="p-4 bg-slate-900/40 border border-white/10/60 rounded-xl flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-200 uppercase text-[10px] border-b pb-2 flex justify-between items-center">
                        <span>Dispatch Queue</span>
                        <span className="p-0.5 px-2 bg-slate-800 rounded text-[8px] font-mono">{queuedDocs.length} queued</span>
                      </h4>

                      {queuedDocs.length === 0 ? (
                        <p className="text-center italic py-10 text-slate-400">Queue is empty. Select or type file name on the left.</p>
                      ) : (
                        <div className="space-y-1.5 pt-2">
                          {queuedDocs.map((doc, i) => (
                            <div key={i} className="p-2 bg-slate-900 border rounded-lg flex items-center justify-between text-[11px]">
                              <span>{doc.name}</span>
                              <button type="button" onClick={() => setQueuedDocs(queuedDocs.filter((_, idx) => idx !== i))} className="text-red-500 font-bold text-[9px] hover:underline">Remove</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleNGOVerificationSubmit}
                      disabled={queuedDocs.length === 0 || isSubmitVerifyLoading}
                      className="w-full py-3 bg-purple-600 disabled:bg-slate-200 text-white font-black hover:bg-sky-620 rounded-xl tracking-widest uppercase text-[10px] mt-4 shadow"
                    >
                      {isSubmitVerifyLoading ? "Transmitting Folder..." : "Dispatch Folder for Admin Audit"}
                    </button>
                  </div>

                </div>

                {/* Validated Credentials list */}
                <div className="p-4 bg-slate-900/40 border border-white/10/60 rounded-2xl space-y-3 mt-4">
                  <h4 className="font-black text-slate-200 uppercase text-[10px] border-b pb-2">Verified compliance documents ({ngo?.documents?.length || 0})</h4>
                  {(!ngo?.documents || ngo.documents.length === 0) ? (
                    <p className="italic text-slate-405 text-center py-4 bg-slate-900/10 rounded-sm">No compliance proofs on-chain yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {ngo.documents.map((doc: any, i: number) => (
                        <div key={i} className="p-2 bg-slate-900 border rounded-lg flex items-center gap-2 shadow-sm">
                          <FileText className="w-4 h-4 text-purple-400" />
                          <div className="truncate text-left">
                            <span className="font-bold text-slate-300 hover:text-amber-400 block truncate cursor-pointer text-[10px]" onClick={() => downloadDummyPdf(doc.name, `NGO Compliance Document: ${doc.name}`)} title={`Download ${doc.name}`}>{doc.name}</span>
                            <span className="text-[8px] font-mono tracking-widest text-amber-500 font-black uppercase">BLOCKCHAIN LINKED</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
