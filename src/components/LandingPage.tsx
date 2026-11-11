/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from "react";
import { getGeoData } from "../lib/utils";
import { 
  ArrowRight, Heart, ShieldCheck, Cpu, Search, CheckCircle2, 
  MapPin, Clock, CircleEqual, Star, UserCheck, Flame, Database, Activity 
} from "lucide-react";
import { motion } from "motion/react";
import { api } from "../services/api";
import InteractiveMap from "./InteractiveMap";
import NeuralBackground from "./ui/flow-field-background";
import TacticalGlobe3D from "./ui/TacticalGlobe3D";

interface LandingPageProps {
  setTab: (tab: string) => void;
  setSelectedCampaignId: (id: string) => void;
  onOpenAuth: () => void;
  user: any;
}

export default function LandingPage({ setTab, setSelectedCampaignId, onOpenAuth, user }: LandingPageProps) {
  const [stats, setStats] = useState({
    totalDonations: 2210000,
    totalDonors: 3220,
    verifiedNGOs: 18,
    activeCampaigns: 6
  });
  const [featured, setFeatured] = useState<any[]>([]);
  const [allCampaigns, setAllCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const globeMarkers = useMemo(() => {
    return allCampaigns
      .filter((c) => c.status === "active")
      .map((c) => {
        const geo = getGeoData(c.location);
        return {
          label: c.title.length > 30 ? c.title.substring(0, 30) + "..." : c.title,
          description: `${c.ngoName} • Raised: ₹${(c.raisedAmount || 0).toLocaleString()} / ₹${(c.goalAmount || 0).toLocaleString()}`,
          latitude: geo.lat,
          longitude: geo.lng,
          color: "#eab308", // Gold for active campaign needing funding
        };
      });
  }, [allCampaigns]);

  useEffect(() => {
    const loadOverviewData = async () => {
      try {
        const statsData = await api.getStats();
        setStats(statsData);

        const list = await api.getCampaigns();
        setAllCampaigns(list);
        setFeatured(list.slice(0, 3)); // show first 3
      } catch (e) {
        console.error("Failed to load platform data", e);
      } finally {
        setLoading(false);
      }
    };
    loadOverviewData();
  }, []);

  const handleDonateClick = (campaignId: string) => {
    setSelectedCampaignId(campaignId);
    setTab("details");
  };

  const steps = [
    {
      num: "01",
      title: "Choose Campaign",
      desc: "Browse through verified humanitarian requests across Education, Medical, Disaster, or Environment programs.",
      icon: <Heart className="w-6 h-6 text-amber-500" />
    },
    {
      num: "02",
      title: "Make Donation",
      desc: "Contribute securely via credit cards, net banking, or instant UPI utilizing streamlined Razorpay checkout portals.",
      icon: <Cpu className="w-6 h-6 text-amber-500" />
    },
    {
      num: "03",
      title: "Payment Verification",
      desc: "Our secure server validates payments, generating secure transaction IDs that tie straight to the recipient NGO.",
      icon: <ShieldCheck className="w-6 h-6 text-amber-500" />
    },
    {
      num: "04",
      title: "Blockchain Recording",
      desc: "Proof of Work consensus mines a transaction block. Generating immutable hashes, permanent timestamping, and ledger blocks.",
      icon: <Database className="w-6 h-6 text-amber-500" />
    },
    {
      num: "05",
      title: "Track Donation",
      desc: "Query the public blockchain explorer at any time. Monitor status transitions as funds are converted to actual goods.",
      icon: <Search className="w-6 h-6 text-amber-500" />
    },
    {
      num: "06",
      title: "See Impact",
      desc: "Review detailed utilization invoices, beneficiary counts, and on-ground reports uploaded continuously by NGOs.",
      icon: <CheckCircle2 className="w-6 h-6 text-amber-400" />
    }
  ];

  const successStories = [
    {
      id: "story-1",
      title: "Rebuilding 12 Classrooms Post-Odisha Floods",
      snippet: "Our community funded ₹8,40,000 to construct weather-proof roofing for secondary wings. Full ledger verify logs and hardware invoices on-chain.",
      img: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&auto=format&fit=crop&q=80",
      beneficiary: "Bhadrak Secondary School students",
      hash: "0x0000de8192a83bc"
    },
    {
      id: "story-2",
      title: "Emergency Pacemaker Surgery for Little Piya",
      snippet: "Within 48 hours, donors matched the ₹4,50,050 goal. Piya successfully underwent pacing implantation at Bangalore Cardiotech. Invoices uploaded.",
      img: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&auto=format&fit=crop&q=80",
      beneficiary: "Piya S., age 4 months",
      hash: "0x0000a39d8e7c1bc"
    }
  ];

  return (
    <div className="pb-12 text-slate-100 bg-transparent">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 px-4 sm:px-6 lg:px-8 bg-black">
        {/* Neural Flow Background */}
        <NeuralBackground color="#FBBF24" trailOpacity={0.15} speed={0.8} />
        <div className="absolute inset-0 bg-black/40 z-0 pointer-events-none"></div>

        {/* Floating background nodes */}
        <div className="absolute top-1/4 left-10 w-4 h-4 rounded-full bg-purple-600 animate-bounce z-10" />
        <div className="absolute top-1/3 right-12 w-6 h-6 rounded-full bg-amber-400 animate-pulse z-10" />
        <div className="absolute bottom-10 left-1/3 w-3 h-3 rounded-full bg-purple-500 z-10" />

        <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-2 items-center gap-8 lg:gap-12">
          {/* Hero Messaging */}
          <div className="text-left space-y-6 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-black/60 border border-white/15/85 rounded-full text-xs font-bold text-purple-400 uppercase tracking-wider animate-pulse shadow-sm shadow-sky-900/50">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Layer 2 Trust Verification Protocol
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
              Transparent Charity Powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-amber-500">Blockchain</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-lg leading-relaxed">
              Track every donation, verify every transaction, and create real impact through complete transparency. No hidden admin fees. No question marks.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => setTab("campaigns")}
                className="px-6 py-3 bg-purple-700 hover:bg-purple-600 text-white font-bold rounded-xl text-base shadow-lg shadow-purple-900 transition-all flex items-center gap-2 cursor-pointer"
              >
                Donate Now
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTab("ledger")}
                className="px-6 py-3 bg-white/60 hover:bg-white/80 border border-white/80 shadow-md backdrop-blur-sm text-amber-500 font-bold rounded-xl text-base transition-all flex items-center gap-2 cursor-pointer"
              >
                Explore Ledger
                <Database className="w-4.5 h-4.5" />
              </button>
            </div>
            
            {/* Trust badge */}
            <div className="flex items-center gap-6 pt-4 text-slate-500 text-xs font-semibold">
              <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-amber-400" /> Sec-Audit Compliant</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-purple-400" /> Razorpay Secured</span>
            </div>
          </div>

          {/* Right column: 3D Tactical Globe */}
          <div className="w-full h-[380px] sm:h-[450px] lg:h-[500px] relative flex items-center justify-center pointer-events-auto">
            <motion.div
              className="w-full h-full"
              animate={{
                y: [0, -10, 0]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <TacticalGlobe3D markers={globeMarkers} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Platform Statistics Section */}
      <section className="bg-black/50 py-12 border-y border-white/10 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <p className="text-3xl font-black text-white">₹{(stats.totalDonations).toLocaleString()}</p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Total Donations</p>
            </div>
            <div className="space-y-1 border-l border-white/10">
              <p className="text-3xl font-black text-amber-500">{stats.totalDonors}</p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Total Donors</p>
            </div>
            <div className="space-y-1 border-l border-white/10">
              <p className="text-3xl font-black text-white">{stats.verifiedNGOs}</p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Verified NGOs</p>
            </div>
            <div className="space-y-1 border-l border-white/10">
              <p className="text-3xl font-black text-amber-500">{stats.activeCampaigns}</p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Active Campaigns</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How It Works Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="space-y-3 mb-12">
          <span className="text-xs font-extrabold text-amber-500 uppercase tracking-widest block">Process Timeline</span>
          <h2 className="text-3xl font-black text-white">Traceable Path of Contributions</h2>
          <p className="text-slate-400 max-w-md mx-auto text-sm">
            Learn step-by-step how TrustChain guarantees your capital lands exactly where it generates life-altering impact.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((st) => (
            <div 
              key={st.num} 
              className="glass-panel-heavy bg-black/60 hover:bg-slate-800/80 rounded-2xl p-6 shadow-md hover:shadow-xl border border-white/15/80 text-left transition-all relative group overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 font-black text-4xl text-sky-900/50 group-hover:text-sky-800/60 transition-colors font-mono">
                {st.num}
              </div>
              <div className="w-12 h-12 rounded-xl bg-slate-800 backdrop-blur-sm flex items-center justify-center mb-4 border border-white/15">
                {st.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{st.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{st.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Map Visual Section */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <InteractiveMap campaigns={allCampaigns} onSelectCampaign={handleDonateClick} />
      </section>

      {/* 4. Global Map Impact Section */}
      <section className="py-24 bg-black border-t border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <span className="text-xs font-extrabold text-amber-500 uppercase tracking-widest block mb-2">Urgent Needs</span>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <h2 className="text-3xl sm:text-4xl font-black text-white max-w-lg leading-tight">Active High-Impact Fundraisers</h2>
              <button
                onClick={() => setTab("campaigns")}
                className="px-5 py-2.5 bg-white text-slate-900 font-bold rounded-xl text-sm shadow-sm hover:shadow-md transition-all flex items-center gap-2 w-fit border border-slate-200"
              >
                Explore and Search Campaigns
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Featured Campaign Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-80 bg-black rounded-2xl animate-pulse border border-white/10" />
              ))
            ) : (
              featured.map(campaign => (
                <div key={campaign.id} className="bg-black rounded-2xl border border-white/10 overflow-hidden hover:shadow-xl transition-all flex flex-col">
                  <div className="h-48 relative overflow-hidden bg-slate-800">
                    {campaign.bannerImage && (
                      <img src={campaign.bannerImage} alt={campaign.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                    )}
                    <div className="absolute top-3 left-3 bg-black/70 backdrop-blur px-2.5 py-1 rounded text-[10px] font-bold text-white tracking-widest uppercase border border-white/15">
                      {campaign.category}
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-lg text-white mb-2 leading-tight line-clamp-2">{campaign.title}</h3>
                    <p className="text-xs text-slate-400 mb-4 line-clamp-2 flex-1">{campaign.description}</p>
                    
                    <div className="space-y-3 mt-auto">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-amber-500">₹{campaign.raisedAmount.toLocaleString()}</span>
                        <span className="text-slate-500">of ₹{campaign.goalAmount.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-purple-700 to-amber-500 h-2 rounded-full" 
                          style={{ width: `${Math.min(100, (campaign.raisedAmount / campaign.goalAmount) * 100)}%` }}
                        />
                      </div>
                      <button 
                        onClick={() => handleDonateClick(campaign.id)}
                        className="w-full mt-2 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors border border-white/15"
                      >
                        View Details & Donate
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 5. Success Stories Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="space-y-3 text-center mb-12">
          <span className="text-xs font-bold text-fuchsia-400 bg-fuchsia-900/40 border border-fuchsia-800 px-3 py-1 rounded-full uppercase tracking-wider inline-block">Impact Statements</span>
          <h2 className="text-3xl font-black text-white">Decentralized Success Stories</h2>
          <p className="text-slate-400 max-w-md mx-auto text-sm">
            Completed campaigns holding 100% on-chain audit reports. Check our records directly!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          {successStories.map((st) => (
            <div key={st.id} className="glass-panel hover:bg-slate-800/80 rounded-2xl border border-white/15 shadow-lg overflow-hidden flex flex-col sm:flex-row hover:shadow-xl transition-all bg-black/60">
              <div className="sm:w-1/3 aspect-video sm:aspect-auto">
                <img src={st.img} alt={st.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="p-5 sm:w-2/3 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-fuchsia-400 bg-slate-800 px-2.5 py-0.5 rounded-full border border-white/15">
                    Fully Utilized
                  </span>
                  <h3 className="text-base font-bold text-white">{st.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{st.snippet}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/15/50 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                  <span>Beneficiary: <strong className="text-slate-300 font-sans">{st.beneficiary}</strong></span>
                  <span 
                    className="text-amber-500 hover:underline cursor-pointer flex items-center gap-0.5"
                    onClick={() => {
                      setTab("ledger");
                    }}
                  >
                    Ledger verify
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. CTA Footer Section */}
      <section className="relative py-20 overflow-hidden z-10 border-t border-white/10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-purple-900/20 z-0" />
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10 space-y-8">
          <div className="w-16 h-16 bg-purple-700 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-purple-600/30 transform rotate-3">
            <Flame className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Ready to Build a Better World?
          </h2>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto font-medium">
            Join thousands of transparent donors using blockchain to ensure their generosity reaches those who need it most.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <button
              onClick={() => onOpenAuth()}
              className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all flex items-center gap-2 cursor-pointer border border-purple-500"
            >
              <UserCheck className="w-5 h-5" />
              Create Donor Account
            </button>
          </div>
        </div>
      </section>

      {/* 7. Trusted NGO Section */}
      <section className="glass-panel py-16 border-t border-white/10 text-center backdrop-blur-md bg-black/50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Collaborating Verified NGO Federations</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-65 grayscale hover:grayscale-0 transition-all">
            <span className="text-sm font-black text-slate-300 flex items-center gap-1.5"><Heart className="w-5 h-5 text-red-500" /> TeachIndia Foundation</span>
            <span className="text-sm font-black text-slate-300 flex items-center gap-1.5"><ShieldCheck className="w-5 h-5 text-amber-500" /> SaveHearts Critical-Care</span>
            <span className="text-sm font-black text-slate-300 flex items-center gap-1.5"><Star className="w-5 h-5 text-amber-500" /> GreenCross Global</span>
            <span className="text-sm font-black text-slate-300 flex items-center gap-1.5"><UserCheck className="w-5 h-5 text-amber-400" /> JalSwaraj Alliance</span>
          </div>
        </div>
      </section>
    </div>
  );
}
