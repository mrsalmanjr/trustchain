/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Disc, Heart, Shield, Globe, Terminal } from "lucide-react";

interface FooterProps {
  setTab: (tab: string) => void;
}

export default function Footer({ setTab }: FooterProps) {
  return (
    <footer className="glass-panel-dark text-slate-300 mt-auto border-t border-white/5 shadow-2xl relative z-15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setTab("landing")}>
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-700 to-amber-500 text-white">
                <Disc className="w-5 h-5 animate-spin-slow" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Trust<span className="text-purple-400">Chain</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Establishing unconditional truth and transparency in humanitarian donations through verifiable Proof of Work cryptographic block ledgers.
            </p>
            <div className="flex items-center gap-3 text-xs pt-1">
              <span className="flex items-center gap-1.5 text-fuchsia-400 font-bold bg-fuchsia-950/40 border border-fuchsia-900 px-2.5 py-1 rounded-full text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-ping" />
                Ethereum Testnet Active
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Platform Core</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setTab("campaigns")} className="hover:text-white transition-colors cursor-pointer">
                  Browse Public Campaigns
                </button>
              </li>
              <li>
                <button onClick={() => setTab("tracker")} className="hover:text-white transition-colors cursor-pointer">
                  Verify Donation By ID
                </button>
              </li>
              <li>
                <button onClick={() => setTab("ledger")} className="hover:text-white transition-colors cursor-pointer">
                  Explore Ledger Blocks
                </button>
              </li>
              <li>
                <span className="text-slate-600 cursor-not-allowed">
                  NFT Certificate Issuer (Future)
                </span>
              </li>
            </ul>
          </div>

          {/* Guidelines Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Trust Guidelines</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#about" className="hover:text-white transition-colors">NGO Smart-Contract SLA</a>
              </li>
              <li>
                <a href="#terms" className="hover:text-white transition-colors">Terms of Service</a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-white transition-colors">Decentralized Privacy Policy</a>
              </li>
              <li>
                <a href="#anti-fraud" className="hover:text-white transition-colors">AI Fraud Auditing Framework</a>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Genesis Headquarters</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Have questions regarding verification procedures, NGO licensing, or donor dashboard access?
            </p>
            <div className="text-xs bg-slate-800/60 p-3 rounded-lg border border-white/10 text-slate-300">
              <p className="font-bold text-white">Support Desk:</p>
              <p className="mt-0.5">help@trustchain.org</p>
              <p className="text-[10px] text-slate-500 mt-1.5 flex items-center gap-1.5 border-t border-slate-705/50 pt-1.5">
                <Terminal className="w-3.5 h-3.5" /> Block Height Tracker: #1,829,012
              </p>
            </div>
          </div>
        </div>

        {/* Footer Base */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} TrustChain Foundation. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-purple-400 fill-[#38BDF8]" /> for radical social impact transparency.
          </p>
        </div>
      </div>
    </footer>
  );
}
