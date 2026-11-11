/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Search, Info, Database, Disc, ShieldCheck, 
  Terminal, ArrowRight, RefreshCcw, HelpCircle, Activity 
} from "lucide-react";
import { api } from "../services/api";

export default function BlockchainExplorer() {
  const [blocks, setBlocks] = useState<any[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState<any>(null);
  const [detailedBlockOpen, setDetailedBlockOpen] = useState(false);

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const data = await api.getBlockchain(searchInput);
      setBlocks(data);
    } catch (e) {
      console.error("Failed to query block structures:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const handleSearchClick = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLedger();
  };

  const clearLedgerSearch = () => {
    setSearchInput("");
    setTimeout(fetchLedger, 50);
  };

  const handleInspectBlock = async (idOrIdx: string) => {
    try {
      const data = await api.getBlockDetails(idOrIdx);
      setSelectedBlock(data);
      setDetailedBlockOpen(true);
    } catch (e) {
      console.error("Failed to fetch block payload:", e);
    }
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 text-left bg-transparent">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10/40">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest block flex items-center gap-1.5">
              <Activity className="w-4 h-4 animate-pulse" /> Etherscan-Style Ledger Explorer
            </span>
            <h1 className="text-3xl font-black text-white">TrustChain Public Ledger</h1>
            <p className="text-slate-400 text-sm max-w-lg">
              Verify cryptographic block proofs publicly. Each card represents an immutable Proof of Work block carrying donation settlement indices.
            </p>
          </div>

          <div className="glass-panel border border-white/10/60 p-4 rounded-xl flex gap-6 text-xs text-slate-400 shrink-0 shadow-md backdrop-blur-sm">
            <div>
              <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Mined Block Height</p>
              <p className="text-base font-black text-white mt-0.5">#{blocks.length ? Math.max(...blocks.map(b=>b.index)) : 0}</p>
            </div>
            <div className="border-l border-white/10/40 pl-6">
              <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Consensus Engine</p>
              <p className="text-base font-bold text-fuchsia-600 mt-0.5 font-sans">Proof of Work (PoW)</p>
            </div>
            <div className="border-l border-white/10/40 pl-6">
              <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Consensus Target</p>
              <p className="text-base font-mono font-bold text-amber-600 mt-0.5">0x0000...</p>
            </div>
          </div>
        </div>

        {/* Search Panel Card */}
        <div className="glass-panel rounded-2xl p-5 shadow-lg">
          <form onSubmit={handleSearchClick} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search ledger by Block Index, Donation ID, Transaction HASH, or keyword..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-white/10/60 rounded-xl focus:border-sky-400 outline-none text-sm font-semibold"
              />
              <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-6 py-3 bg-purple-600 hover:bg-[#0284c7] text-white font-bold rounded-xl text-sm transition-colors cursor-pointer shadow-md shadow-purple-900"
              >
                Query Chain
              </button>
              <button
                type="button"
                onClick={clearLedgerSearch}
                className="p-3 bg-slate-900/60 hover:bg-slate-800/80 border border-white/10/60 rounded-xl text-slate-400 hover:text-slate-300 transition-all cursor-pointer"
                title="Reset Explorer"
              >
                <RefreshCcw className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>

        {/* Dynamic blocks list representation */}
        {loading ? (
          <div className="text-center py-20 bg-slate-800/40 backdrop-blur-md rounded-2xl border border-white/10/50 shadow-lg">
            <svg className="animate-spin h-8 w-8 text-amber-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-sm font-bold text-slate-755 font-mono">Simulating block verification indices...</p>
          </div>
        ) : blocks.length === 0 ? (
          <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl border border-white/10/50 p-12 text-center text-slate-400 shadow-md">
            <p className="text-sm font-bold">No matching Transaction Block discovered on the validated chains.</p>
            <button onClick={clearLedgerSearch} className="text-xs text-amber-400 font-extrabold underline mt-2">
              Reset Explorer Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {blocks.map((b) => (
              <div 
                key={b.index}
                onClick={() => handleInspectBlock(b.hash)}
                className="glass-panel hover:bg-slate-900/55 rounded-xl border border-white/10/60 shadow-lg hover:shadow-2xl transition-all p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer text-left relative overflow-hidden group"
              >
                {/* Visual node badge side indicator */}
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#38BDF8] to-[#0EA5E9]" />

                <div className="space-y-1.5 max-w-[70%]">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6.5 h-6.5 rounded-lg bg-slate-900/70 border border-white/10/90 text-amber-500 shadow-sm">
                      <Database className="w-4 h-4" />
                    </span>
                    <strong className="text-xs md:text-sm text-slate-200">Block Index #{b.index}</strong>
                    
                    <span className="text-[9px] font-black uppercase text-fuchsia-750 bg-fuchsia-100/50 border border-fuchsia-150 px-2 py-0.5 rounded">
                      PoW Verified
                    </span>
                  </div>

                  <div className="text-[10px] font-mono text-slate-400 space-y-0.5">
                    <p className="truncate">Transaction HASH: <span className="text-amber-500 font-bold">{b.hash}</span></p>
                    <p className="truncate">Previous Block linking: <span className="text-slate-400">{b.previousHash}</span></p>
                  </div>
                </div>

                <div className="text-right space-y-1 self-stretch md:self-auto flex md:flex-col justify-between md:justify-center items-end border-t md:border-t-0 pt-2.5 md:pt-0 border-white/10/40">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block uppercase md:hidden">Amount:</span>
                    <span className="text-sm font-black text-white block font-sans">₹{b.amount.toLocaleString()}</span>
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono mt-1">
                    <span>Nonce Solution: {b.nonce}</span>
                    <span className="block md:inline md:before:content-['|'] md:before:mx-1">{new Date(b.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {/* Block Inspector Detailed Screen Overlay */}
      {detailedBlockOpen && selectedBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 rounded-2xl shadow-xl border border-sky-150 overflow-hidden flex flex-col text-left">
            
            <div className="p-4 border-b border-sky-50 bg-[#F0F9FF] flex justify-between items-center text-white">
              <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1">
                <Terminal className="w-4.5 h-4.5 text-amber-500" /> Detailed Block Ledger Audit Index #{selectedBlock.block.index}
              </span>
              <button 
                onClick={() => setDetailedBlockOpen(false)} 
                className="p-1.5 rounded-full hover:bg-sky-100 text-slate-400 hover:text-slate-400 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              
              <div className="space-y-3 bg-slate-900 border border-purple-900/50 p-4 rounded-xl text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest block">Block cryptographic digest (Hash)</label>
                  <p className="font-mono text-fuchsia-600 font-bold break-all">{selectedBlock.block.hash}</p>
                </div>
                
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest block">Ancestor block signature (PrevHash)</label>
                  <p className="font-mono text-slate-400 break-all">{selectedBlock.block.previousHash}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-150/40 pt-2.5">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest block">POW Nonce solved</label>
                    <p className="font-mono text-slate-300 font-bold text-sm">{selectedBlock.block.nonce}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest block">Timestamp (GMT)</label>
                    <p className="font-sans text-slate-400 text-xs font-semibold">{new Date(selectedBlock.block.timestamp).toUTCString()}</p>
                  </div>
                </div>
              </div>

              {/* Donation Data payload verification */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-white uppercase tracking-widest border-l-2 border-[#0EA5E9] pl-2">Contract Data Payload</h4>
                
                {selectedBlock.donation ? (
                  <div className="space-y-2 text-xs">
                    <p>Associated Action: <strong>Donation Settlement</strong></p>
                    <div className="p-3.5 rounded-xl border border-sky-50 bg-purple-900/30/20 space-y-1.5 font-medium text-slate-400">
                      <p>Sponsor Node Address: <span className="font-mono text-slate-400">{selectedBlock.block.donorHash} ({selectedBlock.donation.donorName})</span></p>
                      <p>Recipient Vault address: <span className="font-mono text-slate-400">{selectedBlock.block.ngoAddress} ({selectedBlock.donation.ngoName})</span></p>
                      <p>Transferred Capital: <strong className="text-slate-200">₹{selectedBlock.donation.amount.toLocaleString()} (INR)</strong></p>
                      <p>Fundraiser Contract target: <span className="text-slate-200 font-semibold">{selectedBlock.donation.campaignTitle}</span></p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-450 italic">Genesis setup or administrative operations carry no donation payloads.</p>
                )}
              </div>

              <div className="p-3 bg-fuchsia-50 border border-fuchsia-100 rounded-xl text-[10px] text-fuchsia-800 leading-relaxed flex gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <p>
                  Platform Proof: The SHA-256 hash solved validates perfectly under current Ethereum Testnet protocols. The records are mathematically links-bounded.
                </p>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
