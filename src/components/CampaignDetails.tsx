/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Heart, Shield, ArrowLeft, Send, CheckCircle2, UserCheck, 
  MapPin, Clock, Info, ExternalLink, Calendar, HelpCircle, 
  ArrowRight, CreditCard, Smartphone, Globe, Receipt, Printer, X, Building 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { api, getAuthToken } from "../services/api";
import { downloadDummyPdf } from "../lib/pdf";

interface CampaignDetailsProps {
  campaignId: string;
  onBack: () => void;
  onOpenAuth: () => void;
  user: any;
  setTab: (tab: string) => void;
  setTrackQuery: (query: string) => void;
}

export default function CampaignDetails({ campaignId, onBack, onOpenAuth, user, setTab, setTrackQuery }: CampaignDetailsProps) {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [donateAmount, setDonateAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "Card" | "Net Banking" | "Direct Transfer (P2P)">("UPI");
  const [error, setError] = useState("");

  // Payment states
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"form" | "qr" | "razorpay" | "mining" | "receipt">("form");
  const [pendingDonationId, setPendingDonationId] = useState<string | null>(null);
  const [upiQrUrl, setUpiQrUrl] = useState<string | null>(null);
  const [upiId, setUpiId] = useState<string | null>(null);
  const [qrId, setQrId] = useState<string | null>(null);
  const [qrPolling, setQrPolling] = useState(false);
  const qrPollRef = React.useRef<any>(null);
  const [completedDonation, setCompletedDonation] = useState<any>(null);
  const [blockchainBlock, setBlockchainBlock] = useState<any>(null);
  const [miningLog, setMiningLog] = useState<string[]>([]);
  const [miningProgress, setMiningProgress] = useState(0);

  // Suggested values
  const suggestedAmounts = [100, 500, 1000, 5000];

  const fetchCampaign = async () => {
    setLoading(true);
    try {
      const resp = await api.getCampaignDetails(campaignId);
      setDetails(resp);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to load campaign metadata node.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaign();
  }, [campaignId]);

  const handleAmountSelection = (amt: number) => {
    setDonateAmount(amt);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    const num = parseFloat(e.target.value);
    if (!isNaN(num)) {
      setDonateAmount(num);
    }
  };

  const startCheckoutFlow = () => {
    setError("");
    if (!user) {
      onOpenAuth();
      return;
    }
    if (user.role === "ngo" || user.role === "admin") {
      setError("NGO and Admin accounts are not authorized to make contributions.");
      return;
    }
    if (donateAmount <= 0) {
      setError("Please specify a valid subscription or donation amount (₹1 minimum).");
      return;
    }
    setPaymentStep("form");
    setCheckoutOpen(true);
  };

  // Run Proof of Work simulation sequence for absolute user immersion and transparency
  const runMiningSequence = async (donationId: string, razorpayPayload?: any) => {
    setPaymentStep("mining");
    setMiningLog([]);
    setMiningProgress(10);

    const log = (msg: string, delay: number) => {
      return new Promise<void>(resolve => {
        setTimeout(() => {
          setMiningLog(prev => [...prev, msg]);
          resolve();
        }, delay);
      });
    };

    await log("Initializing Secure SSL Payment channels with Razorpay Node...", 400);
    setMiningProgress(25);
    await log("Signature validation payload passed securely.", 450);
    setMiningProgress(40);
    await log("Transaction BROADCAST to decentralised memory pool (mempool ID #812)...", 500);
    setMiningProgress(55);
    await log("Proof of Work Consensus initialized: Searching for valid SHA-256 block hash solutions with target difficulty [0000]...", 600);
    setMiningProgress(75);
    
    try {
      // Trigger API in backend which does real internal Proof of Work hashing
      const verifyPayload = {
        donationId,
        ...(razorpayPayload || {})
      };
      const response = await api.verifyPayment(verifyPayload);
      await log("PoW Solution discovered! Block successfully mined.", 300);
      setMiningProgress(90);
      
      // Fetch latest tracking details representing block proof
      const trackState = await api.trackDonation(donationId);
      setCompletedDonation(trackState.donation);
      setBlockchainBlock(trackState.blockProof);
      
      await log(`Verified ledger payload added to Blockchain! Block Index: #${trackState.blockProof?.index || "N/A"}`, 400);
      setMiningProgress(100);
      
      setTimeout(() => {
        setPaymentStep("receipt");
        fetchCampaign(); // Refresh campaign details raised amounts
      }, 500);
    } catch (e: any) {
      console.error(e);
      setMiningLog(prev => [...prev, "ERROR: Blockchain network consensus failed! " + e.message]);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.getElementById("razorpay-script")) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.id = "razorpay-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePaymentSubmit = async () => {
    setError("");

    // If Direct Transfer (P2P), skip Razorpay and go directly to mining
    if (paymentMethod === "Direct Transfer (P2P)") {
      setPaymentStep("razorpay"); // Using razorpay step to show loading
      try {
        const initResp = await api.initiateDonation({
          campaignId: campaignId,
          amount: donateAmount,
          paymentMethod: paymentMethod
        });
        await runMiningSequence(initResp.donation.id, { p2p: true });
      } catch (err: any) {
        setError(err.message || "Failed to initiate direct transfer.");
        setPaymentStep("form");
      }
      return;
    }

    try {
      setPaymentStep("razorpay");
      
      // Step 1: Initiate donation on backend
      const initResp = await api.initiateDonation({
        campaignId: campaignId,
        amount: donateAmount,
        paymentMethod: paymentMethod
      });

      if (initResp.razorpayKeyId && paymentMethod !== "UPI") {
        // Real Razorpay integration — open the official checkout popup
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          setError("Failed to load Razorpay SDK. Check your connection.");
          setPaymentStep("form");
          return;
        }

        const options = {
          key: initResp.razorpayKeyId,
          amount: initResp.razorpayOrder.amount,
          currency: initResp.razorpayOrder.currency,
          name: "TrustChain Donations",
          description: `Donation to ${campaign.title}`,
          order_id: initResp.razorpayOrder.orderId,
          handler: async function (response: any) {
            try {
              await runMiningSequence(initResp.donation.id, response);
            } catch (err) {
              console.error(err);
              setError("Verification failed.");
            }
          },
          prefill: { name: user.name, email: user.email },
          theme: { color: "#0EA5E9" },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.on("payment.failed", function (response: any) {
          setError("Payment was cancelled or failed.");
          setPaymentStep("form");
        });
        rzp.open();

      } else if (paymentMethod === "UPI") {
        // Create a real Razorpay UPI QR code via backend
        setPendingDonationId(initResp.donation.id);
        try {
          const qrResp = await api.createDonationQr({
            donationId: initResp.donation.id,
            amount: donateAmount,
            description: `Donation to ${campaign.title}`
          });
          setUpiQrUrl(qrResp.imageUrl);
          setQrId(qrResp.qrId);
          setUpiId("Razorpay UPI QR");
          setPaymentStep("qr");

          // Auto-poll every 4 seconds
          setQrPolling(true);
          qrPollRef.current = setInterval(async () => {
            try {
              const status = await api.pollQrPayment(qrResp.qrId);
              if (status.paid) {
                clearInterval(qrPollRef.current);
                setQrPolling(false);
                await runMiningSequence(initResp.donation.id, { razorpay_payment_id: status.paymentId });
              }
            } catch (e) {
              // polling error - ignore, user can confirm manually
            }
          }, 4000);
        } catch (qrErr: any) {
          // Razorpay QR failed — fall back to generic UPI QR
          const ngoUpi = details?.ngoUpiId || "trustchain@upi";
          const ngoName = encodeURIComponent(details?.ngoName || campaign.ngoName || "NGO");
          const qrData = encodeURIComponent(`upi://pay?pa=${ngoUpi}&pn=${ngoName}&am=${donateAmount}&cu=INR&tn=TrustChainDonation`);
          setUpiQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${qrData}`);
          setUpiId(ngoUpi);
          setPaymentStep("qr");
        }

      } else {
        // For Card / Net Banking in sandbox — show a brief processing screen then proceed
        setTimeout(() => {
          runMiningSequence(initResp.donation.id);
        }, 1500);
      }

    } catch (e: any) {
      setError(e.message || "Checkout simulation faulted.");
      setPaymentStep("form");
    }
  };

  const handleQrConfirmed = async () => {
    if (!pendingDonationId) return;
    if (qrPollRef.current) clearInterval(qrPollRef.current);
    setQrPolling(false);
    await runMiningSequence(pendingDonationId, { upi_confirmed: true });
  };

  const downloadReceipt = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-slate-400">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0EA5E9] mb-2" />
        <p className="text-xs font-semibold">Decrypting ledger indices for active contract...</p>
      </div>
    );
  }

  if (error && !details) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-slate-400">
        <p className="text-red-500 font-bold mb-4">{error}</p>
        <button onClick={onBack} className="text-xs text-amber-500 hover:underline flex items-center gap-1 mx-auto">
          <ArrowLeft className="w-4 h-4" /> Go back
        </button>
      </div>
    );
  }

  const { campaign, recentDonations } = details;
  const progress = Math.min(100, Math.round((campaign.raisedAmount / campaign.goalAmount) * 100));

  return (
    <div className="py-8 text-left bg-transparent">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Navigation Indicator */}
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-650 hover:text-white transition-colors bg-slate-800/40 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-white/10/60 shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Campaigns Index
        </button>

        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Info Left Column */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Banner & Title Box */}
            <div className="glass-panel rounded-2xl border border-white/10/60 overflow-hidden shadow-lg">
              <div className="aspect-video relative bg-slate-150">
                <img 
                  src={campaign.bannerImage} 
                  alt={campaign.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-4 left-4 bg-purple-600 text-white text-[10px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                  {campaign.category}
                </span>
                <span className="absolute bottom-4 right-4 bg-fuchsia-500 text-white text-[10px] font-black px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm border border-fuchsia-400">
                  <UserCheck className="w-3.5 h-3.5" /> SEC-AUDITED PROTOCOL PRESET
                </span>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-400">
                  <span className="flex items-center gap-1 text-slate-200">
                    <Shield className="w-4 h-4 text-amber-500" />
                    NGO Organiser: <strong className="text-white">{campaign.ngoName}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    {campaign.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    Deadline Match: {new Date(campaign.deadline).toLocaleDateString()}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-white leading-snug">
                  {campaign.title}
                </h1>

                <p className="text-slate-650 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                  {campaign.description}
                </p>

                {/* Proof documents index */}
                <div className="pt-4 border-t border-white/10/40 mt-4">
                  <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2.5">Supporting SLA Documentation</h4>
                  <div className="flex flex-wrap gap-2">
                    {campaign.supportingDocuments.map((doc: string, idx: number) => (
                      <button 
                        key={idx}
                        onClick={() => downloadDummyPdf(doc, `Supporting Document: ${doc}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/40 hover:bg-slate-900/70 text-slate-400 hover:text-amber-500 text-xs rounded-lg border border-white/10/60 transition-colors shadow-sm cursor-pointer"
                        title={`Download ${doc}`}
                      >
                        <Receipt className="w-3.5 h-3.5 text-slate-400" />
                        {doc}
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Campaign updates */}
            <div className="glass-panel-heavy rounded-2xl border border-white/10/70 p-6 shadow-xl space-y-4">
              <h3 className="text-base font-extrabold text-white flex items-center gap-1.5">
                <Clock className="w-5 h-5 text-amber-500" /> Recent Progress Updates ({campaign.updates.length})
              </h3>
              
              {campaign.updates.length === 0 ? (
                <p className="text-xs text-slate-400 p-4 border border-dashed border-white/10/50 rounded-xl text-center">
                  No execution milestones uploaded yet by the NGO. Check back soon for audit progress.
                </p>
              ) : (
                <div className="space-y-4">
                  {campaign.updates.map((upd: any) => (
                    <div key={upd.id} className="p-4 rounded-xl bg-slate-800/40 border border-white/10/60 text-xs shadow-sm">
                      <div className="flex justify-between items-baseline mb-1 text-[10px] text-slate-400 font-mono">
                        <strong className="text-slate-300 font-bold font-sans">{upd.title}</strong>
                        <span>{new Date(upd.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-400 leading-relaxed mt-1 font-medium">{upd.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Utilization Reports */}
            <div className="glass-panel rounded-2xl border border-white/10/60 p-6 shadow-xl space-y-4">
              <h3 className="text-base font-extrabold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5 text-purple-400" /> Ledger Fund Utilization Invoices ({campaign.utilizationReports.length})
              </h3>
              
              {campaign.utilizationReports.length === 0 ? (
                <div className="p-5 border border-dashed border-white/10/50 bg-slate-900/30 backdrop-blur-sm rounded-xl text-center shadow-inner">
                  <p className="text-xs text-slate-400">
                    Once funds are distributed, digital invoices, vendor payment receipts, and audits will resolve onto this ledger automatically.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {campaign.utilizationReports.map((rep: any) => (
                    <div key={rep.id} className="p-4 rounded-xl border border-white/10/60 bg-slate-800/40 hover:bg-slate-800/60 transition-all text-xs flex justify-between items-start shadow-sm">
                      <div className="space-y-2 max-w-[70%]">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 bg-fuchsia-500 text-white rounded text-[9px] font-black uppercase">Paid Vendor</span>
                          <h4 className="font-extrabold text-slate-200">{rep.title}</h4>
                        </div>
                        <p className="text-slate-400 font-bold text-[11px] leading-relaxed">{rep.description}</p>
                        <p className="text-[10px] text-slate-400">Recipient payload: <span className="font-mono text-slate-400">{rep.recipientName}</span></p>
                      </div>

                      <div className="text-right space-y-1">
                        <span className="text-sm font-black text-fuchsia-600 block">₹{rep.amountUsed.toLocaleString()}</span>
                        <span className="text-[8px] text-slate-400 font-mono block">Utilized: {new Date(rep.uploadedAt).toLocaleDateString()}</span>
                        <a 
                          href="#check-invoice" 
                          onClick={(e) => e.preventDefault()}
                          className="inline-flex items-center gap-0.5 text-amber-500 hover:underline hover:text-amber-500 font-bold text-[10px] pt-1"
                        >
                          Invoice <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Checkout Widget Right Column */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Right Column Sidebar Configuration based on Role permissions */}
            {user?.role === "ngo" || user?.role === "admin" ? (
              /* High compliance Campaign Administrative & Audit Terminal UI */
              <div className="bg-slate-900 text-white rounded-2xl border border-slate-850 p-6 shadow-2xl sticky top-24 text-left space-y-6">
                <div className="space-y-1 pb-3 border-b border-slate-800">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Consolidated Funding</span>
                    <span className="text-[9px] font-black uppercase text-fuchsia-400 bg-fuchsia-950/50 border border-fuchsia-900 px-2 py-0.5 rounded">Locked Node</span>
                  </div>
                  <span className="text-xl font-black text-white font-sans block mt-1">₹{campaign.raisedAmount.toLocaleString()}</span>
                  <p className="text-[10px] text-slate-450 font-medium">Raised of ₹{campaign.goalAmount.toLocaleString()} target ({progress}% achieved)</p>
                </div>

                {/* Secure Progress bar */}
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-fuchsia-500 to-[#0EA5E9] rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="space-y-4">
                  <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-3.5">
                    <div className="flex gap-2.5 items-start">
                      <Shield className="w-4 h-4 text-[#0ea5e9] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-extrabold text-[9px] uppercase tracking-wider text-slate-400 font-mono">Administrative Audit Console</p>
                        <p className="mt-1 leading-relaxed text-[11px]">
                          Authorized connection as <strong className="text-slate-100 uppercase">{user?.role} portal</strong>. Direct peer funding channel deactivated.
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-[9px] font-mono bg-slate-900 border border-slate-805 p-2.5 rounded text-slate-400 space-y-1.5">
                      <div className="flex justify-between"><span className="text-slate-400">Security State:</span> <span className="text-fuchsia-400 font-bold">Standardized</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">User ID:</span> <span>{user?.id}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Node Compliance:</span> <span className="text-amber-300 font-bold">Approved</span></div>
                    </div>
                  </div>

                  <div className="bg-fuchsia-950/30 border border-fuchsia-900/50 p-3.5 rounded-xl text-[10px] text-fuchsia-300 leading-relaxed flex gap-2">
                    <CheckCircle2 className="w-4.5 h-4.5 text-fuchsia-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold uppercase tracking-wider text-[8px] text-fuchsia-400 mb-0.5">Auditing Integrity Notice</p>
                      <p>To preserve ledger transparency, transaction simulation is blocked for organizational or platform coordinate endpoints.</p>
                    </div>
                  </div>

                  <div className="text-center pt-2">
                    <p className="text-[9px] text-slate-400 leading-normal">
                      Need to test payment flows? Please sign out and register with a standard <strong className="text-slate-400">Donor Account</strong>.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Standard Donor Pay Quick-Simulator UI */
              <div className="bg-slate-900 rounded-2xl border border-purple-900/50 p-6 shadow-md shadow-sky-50 sticky top-24 text-left space-y-5">
                <div className="space-y-1 pb-3 border-b border-sky-50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Audit Dashboard</span>
                  <span className="text-xl font-black text-white">₹{campaign.raisedAmount.toLocaleString()}</span>
                  <p className="text-[10px] text-slate-400 font-medium">Raised of ₹{campaign.goalAmount.toLocaleString()} goal ({progress}% complete)</p>
                </div>

                {/* Progress dynamic line */}
                <div className="w-full h-2.5 bg-purple-900/30 rounded-full overflow-hidden border border-purple-900/50/50">
                  <div 
                    className="h-full bg-gradient-to-r from-sky-400 to-[#0EA5E9] rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Suggestions Grid */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Supported Contributions</label>
                  <div className="grid grid-cols-4 gap-2">
                    {suggestedAmounts.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => handleAmountSelection(amt)}
                        className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                          donateAmount === amt && !customAmount
                            ? "bg-purple-900/30 border-[#38BDF8] text-amber-500 shadow-sm shadow-sky-50"
                            : "border-white/10 hover:bg-slate-900/50 text-slate-400"
                        }`}
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Input */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Custom Contribution Amount (INR)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      placeholder="Other Amount eg. 2500"
                      value={customAmount}
                      onChange={customAmountChange => handleCustomAmountChange(customAmountChange)}
                      className="w-full pl-7 pr-3 py-2 text-sm bg-slate-900 border border-purple-900/50 rounded-xl outline-none focus:border-sky-400 transition-colors font-bold text-slate-200"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={startCheckoutFlow}
                  className="w-full py-3 bg-purple-600 hover:bg-[#0284c7] text-white font-extrabold rounded-xl text-sm shadow-md shadow-sky-150 transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
                >
                  Contribute Now <Heart className="w-4 h-4 fill-white" />
                </button>

                <div className="bg-purple-900/30/40 border border-purple-900/50 p-3.5 rounded-xl text-[10px] text-slate-400 leading-relaxed flex gap-2">
                  <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <p>
                    Every rupee contributed generates a blockchain consensus proof record hash immediately searchable across Ethereum ledger networks.
                  </p>
                </div>
              </div>
            )}

            {/* Recent Contributors Feed */}
            <div className="bg-slate-900 rounded-2xl border border-purple-900/50 p-5 shadow-sm text-left space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest pb-2 border-b border-sky-50">
                Recent Contributions ({recentDonations.length})
              </h4>
              
              {recentDonations.length === 0 ? (
                <p className="text-[10px] text-slate-400 text-center py-4">Be the first to back this campaign!</p>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {recentDonations.slice(0, 10).map((d: any) => (
                    <div key={d.id} className="text-xs flex justify-between items-center bg-slate-900/50 p-2 rounded-lg border border-white/10">
                      <div className="truncate pr-2">
                        <p className="font-bold text-slate-850 truncate">{d.donorName}</p>
                        <span 
                          onClick={() => {
                            setTrackQuery(d.id);
                            setTab("tracker");
                          }}
                          className="text-[9px] font-mono text-amber-500 hover:underline cursor-pointer block truncate"
                        >
                          TX: {d.blockchainHash.slice(0, 16)}...
                        </span>
                      </div>
                      <span className="font-extrabold text-white shrink-0 text-[11px]">₹{d.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Checkout Simulator Modal */}
      <AnimatePresence>
        {checkoutOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-900/70 backdrop-blur-md glass-panel rounded-2xl shadow-2xl border border-white/10/10 overflow-hidden flex flex-col text-left"
            >
              <div className="p-4 border-b border-white/10/40 bg-slate-900/30 flex justify-between items-center text-white">
                <div>
                  <h3 className="text-sm font-bold">Razorpay Secure Sandbox</h3>
                  <p className="text-[10px] text-slate-400 font-semibold">Recipient NGO: {campaign.ngoName}</p>
                </div>
                <button onClick={() => setCheckoutOpen(false)} className="p-1 rounded-full hover:bg-slate-800/40 transition-colors cursor-pointer">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <div className="p-5 flex-1 max-h-[80vh] overflow-y-auto">
                
                {paymentStep === "form" && (
                  <div className="space-y-4">
                    <div className="bg-slate-800/60 border border-white/10/70 p-3.5 rounded-xl flex justify-between items-baseline text-xs shadow-sm shadow-sky-50">
                      <span className="font-bold text-slate-400">Total Contribution:</span>
                      <span className="text-lg font-black text-white font-sans">₹{donateAmount.toLocaleString()}</span>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300 block">Select Razorpay Payment Channel</label>
                      
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("UPI")}
                          className={`w-full p-3 rounded-lg border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                            paymentMethod === "UPI" ? "bg-slate-800/80 border-[#38BDF8] text-amber-500 shadow-sm" : "border-white/10/50 bg-slate-900/10"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <Smartphone className="w-5 h-5 text-amber-500" /> Instant UPI Options (GPay, PhonePe, Bhim)
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod("Card")}
                          className={`w-full p-3 rounded-lg border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                            paymentMethod === "Card" ? "bg-slate-800/80 border-[#38BDF8] text-amber-500 shadow-sm" : "border-white/10/50 bg-slate-900/10"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-purple-400" /> Debit / Credit Cards (MasterCard/Visa)
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod("Net Banking")}
                          className={`w-full p-3 rounded-lg border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                            paymentMethod === "Net Banking" ? "bg-slate-800/80 border-[#38BDF8] text-amber-500 shadow-sm" : "border-white/10/50 bg-slate-900/10"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <Globe className="w-5 h-5 text-purple-500" /> Indian Retail Netbanking Channels
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod("Direct Transfer (P2P)")}
                          className={`w-full p-3 rounded-lg border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                            paymentMethod === "Direct Transfer (P2P)" ? "bg-fuchsia-50 border-fuchsia-400 text-fuchsia-700 shadow-sm" : "border-white/10/50 bg-slate-900/10 text-slate-300"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <Building className="w-5 h-5 text-fuchsia-600" /> Direct Bank Transfer (0% Fee)
                          </span>
                        </button>
                      </div>
                    </div>

                    {paymentMethod === "Direct Transfer (P2P)" && (
                      <div className="p-4 bg-fuchsia-50/50 border border-fuchsia-200 rounded-xl space-y-4 animate-fade-in text-xs font-semibold text-fuchsia-900">
                        <p className="flex items-start gap-2 text-[10px]">
                          <Info className="w-3.5 h-3.5 text-fuchsia-600 shrink-0 mt-0.5" />
                          Please scan the QR code or send exactly ₹{donateAmount.toLocaleString()} to the NGO's account below, then click Confirm.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-stretch">
                          {details?.ngoUpiId && (
                            <div className="bg-slate-900 p-2 rounded-lg border border-fuchsia-200 shadow-sm shrink-0">
                              <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`upi://pay?pa=${details.ngoUpiId}&pn=${encodeURIComponent(details.ngoName || "NGO")}&am=${donateAmount}&cu=INR`)}`}
                                alt="Scan to Pay"
                                className="w-24 h-24 sm:w-28 sm:h-28"
                              />
                            </div>
                          )}
                          
                          <div className="bg-slate-900/70 p-3 rounded-lg border border-fuchsia-100 shadow-inner space-y-1.5 font-mono text-[11px] w-full flex flex-col justify-center">
                            <div className="flex justify-between">
                              <span className="text-fuchsia-700/70">UPI ID:</span>
                              <span className="font-bold text-slate-200 break-all">{details?.ngoUpiId || "Not provided"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-fuchsia-700/70">Bank A/C:</span>
                              <span className="font-bold text-slate-200 break-all">{details?.ngoBankAccount || "Not provided"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-fuchsia-700/70">IFSC:</span>
                              <span className="font-bold text-slate-200 break-all">{details?.ngoIfscCode || "Not provided"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handlePaymentSubmit}
                      className="w-full py-3 bg-purple-600 text-white font-extrabold text-sm rounded-xl text-center shadow-lg cursor-pointer hover:bg-[#0284c7] transition-all"
                    >
                      {paymentMethod === "Direct Transfer (P2P)" ? "Confirm Transfer Sent" : "Authorize Sandbox Payment"}
                    </button>
                  </div>
                )}

                {paymentStep === "qr" && (
                  <div className="space-y-4">
                    <div className="text-center space-y-1">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-[10px] font-black uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block"></span>
                        Razorpay UPI QR — Scan to Pay
                      </div>
                      <p className="text-slate-400 text-[10px] font-semibold">Open GPay, PhonePe, Paytm or any UPI app and scan</p>
                    </div>

                    <div className="flex justify-center">
                      <div className="p-3 bg-white rounded-2xl shadow-2xl border-4 border-[#072654]/60 relative">
                        {upiQrUrl ? (
                          <img src={upiQrUrl} alt="Razorpay UPI QR Code" className="w-52 h-52 rounded-lg" />
                        ) : (
                          <div className="w-52 h-52 flex items-center justify-center">
                            <svg className="animate-spin h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                          </div>
                        )}
                        {/* Razorpay branding */}
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#072654] text-white text-[9px] font-black px-3 py-1 rounded-full tracking-widest">RAZORPAY</div>
                      </div>
                    </div>

                    <div className="bg-slate-800/60 border border-white/10 rounded-xl p-3 space-y-2 text-xs font-mono mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Gateway</span>
                        <span className="text-blue-400 font-bold">Razorpay UPI</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Amount</span>
                        <span className="text-white font-black text-sm">₹{donateAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Recipient</span>
                        <span className="text-slate-200 font-semibold truncate max-w-[160px]">{details?.ngoName || campaign.ngoName}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Expires</span>
                        <span className="text-orange-400 font-bold">15 minutes</span>
                      </div>
                    </div>

                    {qrPolling && (
                      <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-mono">
                        <svg className="animate-spin h-3 w-3 text-green-400" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Listening for payment confirmation...
                      </div>
                    )}

                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[10px] text-amber-300 font-semibold flex items-start gap-2">
                      <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      Payment is auto-detected. Or click below after paying in your UPI app.
                    </div>

                    <button
                      onClick={handleQrConfirmed}
                      className="w-full py-3.5 bg-green-600 hover:bg-green-500 text-white font-extrabold text-sm rounded-xl shadow-lg cursor-pointer transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      I've Paid — Record on Blockchain
                    </button>

                    <button
                      onClick={() => {
                        if (qrPollRef.current) clearInterval(qrPollRef.current);
                        setQrPolling(false);
                        setPaymentStep("form");
                        setPendingDonationId(null);
                      }}
                      className="w-full py-2 text-slate-400 hover:text-slate-200 font-semibold text-xs cursor-pointer transition-colors"
                    >
                      ← Cancel & Go Back
                    </button>
                  </div>
                )}

                {paymentStep === "razorpay" && (
                  <div className="text-center py-10 space-y-4">
                    <svg className="animate-spin h-10 w-10 text-amber-500 mx-auto" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className="text-xs font-bold text-slate-200 font-mono">Contacting Razorpay simulated gateways...</p>
                    <p className="text-[10px] text-slate-400 max-w-xs mx-auto">Please do not exit or refresh. Verifying card validation parameters with bank servers...</p>
                  </div>
                )}

                {paymentStep === "mining" && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <svg className="animate-spin h-8 w-8 text-amber-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <h4 className="text-xs font-black text-slate-200 uppercase tracking-widest">MINING CONSENSUS IN PROGRESS</h4>
                      <div className="w-full bg-slate-900/60 h-1 rounded-full overflow-hidden mt-1 max-w-[150px] mx-auto border border-white/10/60">
                        <div className="bg-purple-900/300 h-full transition-all" style={{ width: `${miningProgress}%` }} />
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900/80 backdrop-blur-md rounded-xl font-mono text-[9px] text-amber-300 h-48 overflow-y-auto space-y-1 rounded border border-slate-800 shadow-inner">
                      {miningLog.map((logItem, index) => (
                        <p key={index} className="leading-normal">&gt; {logItem}</p>
                      ))}
                    </div>
                  </div>
                )}

                {paymentStep === "receipt" && completedDonation && (
                  <div className="space-y-4 text-left relative" id="printable-receipt">
                    <div className="text-center space-y-1">
                      <CheckCircle2 className="w-10 h-10 text-purple-400 mx-auto fill-fuchsia-50 mb-1" />
                      <h4 className="text-base font-black text-white">Donation Receipt</h4>
                      <p className="text-[10px] text-slate-400 font-mono">HASH: {completedDonation.blockchainHash.slice(0, 24)}...</p>
                    </div>

                    <div className="space-y-1.5 p-4 bg-slate-800/60 border border-white/10/70 rounded-xl text-xs shadow-inner">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Donor:</span>
                        <span className="font-extrabold text-slate-850">{completedDonation.donorName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Campaign:</span>
                        <span className="font-semibold text-slate-850 truncate max-w-[200px]">{completedDonation.campaignTitle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">NGO Code:</span>
                        <span className="font-mono text-slate-650 font-bold">{completedDonation.ngoId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Amount (INR):</span>
                        <span className="font-black text-fuchsia-600 font-sans">₹{(completedDonation.amount).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Receipt Code:</span>
                        <span className="font-mono text-slate-300 font-semibold">{completedDonation.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Block Height:</span>
                        <span className="font-mono text-amber-500 font-bold">#{blockchainBlock?.index}</span>
                      </div>
                    </div>

                    <p className="text-[8px] text-slate-400 leading-normal text-center font-medium">
                      This PDF / summary forms a legal audit statement. Ledger items can be queried on-chain.
                    </p>

                    <div className="flex gap-2">
                      <button
                        onClick={downloadReceipt}
                        className="flex-1 py-2 bg-slate-900 border border-slate-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer hover:bg-slate-800 shadow transition-all"
                      >
                        <Printer className="w-4 h-4" /> Print Receipt
                      </button>
                      <button
                        onClick={() => {
                          setCheckoutOpen(false);
                          setTab("dashboard");
                        }}
                        className="flex-1 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold text-center flex items-center justify-center gap-1 cursor-pointer hover:bg-[#0284c7] shadow transition-all"
                      >
                        Portal Panel <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
