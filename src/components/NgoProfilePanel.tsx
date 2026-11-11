import React, { useState } from "react";
import { Settings, Building, Mail, MapPin, CheckCircle, Globe, Phone, Award } from "lucide-react";

interface NgoProfilePanelProps {
  ngoName: string;
  setNgoName: (v: string) => void;
  ngoDescription: string;
  setNgoDescription: (v: string) => void;
  ngoAddress: string;
  setNgoAddress: (v: string) => void;
  ngoTagline: string;
  setNgoTagline: (v: string) => void;
  ngoEmail: string;
  setNgoEmail: (v: string) => void;
  ngoPhone: string;
  setNgoPhone: (v: string) => void;
  ngoLogo: string;
  setNgoLogo: (v: string) => void;
  ngoBankAccount: string;
  setNgoBankAccount: (v: string) => void;
  ngoIfscCode: string;
  setNgoIfscCode: (v: string) => void;
  ngoUpiId: string;
  setNgoUpiId: (v: string) => void;
  onSave: (e: React.FormEvent) => void;
  successMessage: string;
  errorMessage: string;
}

export default function NgoProfilePanel({
  ngoName, setNgoName,
  ngoDescription, setNgoDescription,
  ngoAddress, setNgoAddress,
  ngoTagline, setNgoTagline,
  ngoEmail, setNgoEmail,
  ngoPhone, setNgoPhone,
  ngoLogo, setNgoLogo,
  ngoBankAccount, setNgoBankAccount,
  ngoIfscCode, setNgoIfscCode,
  ngoUpiId, setNgoUpiId,
  onSave,
  successMessage,
  errorMessage
}: NgoProfilePanelProps) {
  
  return (
    <form onSubmit={onSave} className="space-y-6 text-xs text-left font-semibold text-slate-300" id="ngo-profile-settings-panel">
      
      <div>
        <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5">
          <Settings className="w-5 h-5 text-amber-400" /> Organization Profile Configuration
        </h3>
        <p className="text-slate-450 mt-1 leading-relaxed">Customize your public NGO card view, official corporate identities, contact nodes, and public-facing description metadata.</p>
      </div>

      {successMessage && (
        <p className="p-3 bg-slate-900/70 text-fuchsia-800 border border-fuchsia-200 rounded-xl font-bold animate-pulse">{successMessage}</p>
      )}
      {errorMessage && (
        <p className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl font-bold">{errorMessage}</p>
      )}

      {/* Visual Identity section */}
      <div className="p-4 bg-slate-800/40 border border-white/10/50 rounded-2xl flex flex-col sm:flex-row gap-5 items-center">
        <img 
          src={ngoLogo} 
          alt="Brand Logo" 
          className="w-16 h-16 rounded-2xl object-cover shadow-md border border-white/10 shrink-0 bg-slate-900 logo-avatar refererPolicy='no-referrer'" 
        />
        
        <div className="space-y-2 text-left w-full">
          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Brand Avatar Logo URL</label>
          <div className="flex gap-2">
            <input
              type="url"
              value={ngoLogo}
              onChange={(e) => setNgoLogo(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-900 border border-white/10/75 focus:border-[#0EA5E9] outline-none rounded-xl text-slate-200 shadow-inner font-semibold"
              placeholder="e.g. https://images.unsplash.com/..."
            />
            <button
              type="button"
              onClick={() => setNgoLogo("https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&auto=format&fit=crop&q=80")}
              className="px-3.5 py-2.5 bg-slate-900 border font-bold text-[10px] text-slate-400 rounded-xl hover:bg-slate-900 transition cursor-pointer shrink-0 shadow-sm"
            >
              Reset Vector
            </button>
          </div>
        </div>
      </div>

      {/* General Corporate Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Official Organization Name</label>
          <input
            type="text"
            value={ngoName}
            onChange={(e) => setNgoName(e.target.value)}
            className="w-full text-xs p-2.5 bg-slate-900 border border-white/10/75 focus:border-[#0EA5E9] outline-none rounded-xl text-slate-200 shadow-sm"
            required
          />
        </div>

        <div>
          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-sans">Core Organizational Tagline</label>
          <input
            type="text"
            value={ngoTagline}
            onChange={(e) => setNgoTagline(e.target.value)}
            className="w-full text-xs p-2.5 bg-slate-900 border border-white/10/75 focus:border-[#0EA5E9] outline-none rounded-xl text-slate-200 shadow-sm"
            required
          />
        </div>
      </div>

      {/* Description / Mission statement */}
      <div>
        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Description & Mission statement</label>
        <textarea
          rows={3}
          value={ngoDescription}
          onChange={(e) => setNgoDescription(e.target.value)}
          className="w-full text-xs p-2.5 bg-slate-900 border border-white/10/75 focus:border-[#0EA5E9] outline-none resize-none rounded-xl text-slate-200 shadow-sm"
          required
        />
      </div>

      {/* Contact details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest text-left flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> Coordinator Email</label>
          <input
            type="email"
            value={ngoEmail}
            onChange={(e) => setNgoEmail(e.target.value)}
            className="w-full text-xs p-2.5 bg-slate-900 border border-white/10/75 focus:border-[#0EA5E9] outline-none rounded-xl text-slate-200 shadow-sm"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest text-left flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> Direct Contact Phone</label>
          <input
            type="text"
            value={ngoPhone}
            onChange={(e) => setNgoPhone(e.target.value)}
            className="w-full text-xs p-2.5 bg-slate-900 border border-white/10/75 focus:border-[#0EA5E9] outline-none rounded-xl text-slate-200 shadow-sm"
            required
          />
        </div>

        <div className="space-y-1 font-sans">
          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest text-left flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Physical Headquarters Address</label>
          <input
            type="text"
            value={ngoAddress}
            onChange={(e) => setNgoAddress(e.target.value)}
            className="w-full text-xs p-2.5 bg-slate-900 border border-white/10/75 focus:border-[#0EA5E9] outline-none rounded-xl text-slate-200 shadow-sm"
            required
          />
        </div>
      </div>

      {/* Financial Details for Real Payments */}
      <div className="pt-4 border-t border-white/10/45">
        <h4 className="font-extrabold text-slate-200 text-xs mb-3 flex items-center gap-1.5"><Building className="w-4 h-4 text-purple-400" /> Payment & Banking Details</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest text-left">Bank Account Number</label>
            <input
              type="text"
              value={ngoBankAccount}
              onChange={(e) => setNgoBankAccount(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-900 border border-white/10/75 focus:border-[#0EA5E9] outline-none rounded-xl text-slate-200 shadow-sm"
              placeholder="e.g. 50100123456789"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest text-left">IFSC Code</label>
            <input
              type="text"
              value={ngoIfscCode}
              onChange={(e) => setNgoIfscCode(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-900 border border-white/10/75 focus:border-[#0EA5E9] outline-none rounded-xl text-slate-200 shadow-sm uppercase"
              placeholder="e.g. HDFC0001234"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest text-left">UPI ID</label>
            <input
              type="text"
              value={ngoUpiId}
              onChange={(e) => setNgoUpiId(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-900 border border-white/10/75 focus:border-[#0EA5E9] outline-none rounded-xl text-slate-200 shadow-sm"
              placeholder="e.g. ngo@okaxis"
            />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-white/10 flex justify-end gap-2.5">
        <button
          type="submit"
          className="px-6 py-3 bg-purple-600 hover:bg-[#0284c7] text-white font-extrabold text-[10px] rounded-xl cursor-pointer shadow-md transition-all uppercase tracking-widest"
        >
          Save Organizational Config settings
        </button>
      </div>

    </form>
  );
}
