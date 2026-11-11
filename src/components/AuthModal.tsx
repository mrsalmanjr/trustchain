/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { X, Lock, Mail, User, Shield, Briefcase, Eye, EyeOff } from "lucide-react";
import { motion } from "motion/react";
import { api } from "../services/api";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
  initialMode?: "login" | "register";
}

export default function AuthModal({ isOpen, onClose, onSuccess, initialMode = "login" }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [role, setRole] = useState<"donor" | "ngo" | "admin">("donor");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  // NGO-specific registration attributes
  const [ngoName, setNgoName] = useState("");
  const [ngoRegNo, setNgoRegNo] = useState("");
  const [ngoDesc, setNgoDesc] = useState("");
  
  // Banking Disbursal details
  const [bankAccount, setBankAccount] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [upiId, setUpiId] = useState("");

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (isForgotPassword) {
        // Simulated password reset
        if (!email) throw new Error("Please enter your registered email address.");
        await new Promise(resolve => setTimeout(resolve, 800));
        setSuccessMsg("Password reset OTP instructions sent! Please verify your inbox.");
        setIsForgotPassword(false);
        setPassword("");
        setLoading(false);
        return;
      }

      if (isLogin) {
        const response = await api.login({ email, password });
        onSuccess(response.user);
        onClose();
      } else {
        const ngoParams = role === "ngo" ? {
          ngoName,
          registrationNumber: ngoRegNo,
          description: ngoDesc,
          bankAccount,
          ifscCode,
          upiId
        } : undefined;

        const response = await api.register({
          name,
          email,
          password,
          role,
          ngoParams
        });
        setSuccessMsg("Account successfully registered! Verification token synced.");
        setTimeout(() => {
          onSuccess(response.user);
          onClose();
        }, 1000);
      }
    } catch (err: any) {
      setError(err?.message || "An authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-lg overflow-hidden glass-panel-heavy rounded-2xl shadow-2xl border border-white/10/10"
      >
        {/* Modal Header */}
        <div className="relative p-6 border-b border-white/10/50 bg-slate-900/20 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-white">
              {isForgotPassword ? "Reset Password" : isLogin ? "Welcome Back" : "Create Account"}
            </h3>
            <p className="text-xs text-sky-700 mt-1">
              {isForgotPassword 
                ? "Secure ledger access recovery" 
                 : isLogin 
                  ? "Access your TrustChain charity dashboard" 
                  : "Onboard onto the blockchain donation ledger"}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 mb-4 text-xs text-red-700 bg-red-100/50 backdrop-blur-sm border border-red-200 rounded-lg">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="p-3 mb-4 text-xs text-fuchsia-800 bg-slate-900/70 backdrop-blur-sm border border-fuchsia-200 rounded-lg">
              {successMsg}
            </div>
          )}

          {isForgotPassword ? (
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1.5">Registered Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com" 
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-900/60 border border-white/10/60 rounded-xl focus:border-sky-400 focus:ring-1 focus:ring-sky-400 outline-none transition-all"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-purple-600 hover:bg-[#0284c7] text-white font-semibold rounded-xl text-sm shadow-md shadow-sky-150 transition-colors disabled:opacity-50"
              >
                {loading ? "Decrypting profile ledger..." : "Send Verification Reset Link"}
              </button>
              <button
                type="button"
                onClick={() => setIsForgotPassword(false)}
                className="block mx-auto text-xs text-amber-500 hover:underline"
              >
                Return to Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleAuth} className="space-y-4">
              {/* Registration Role Selection */}
              {!isLogin && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-2">Join Platform As</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole("donor")}
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                        role === "donor" 
                          ? "bg-slate-800/80 border-[#38BDF8] text-amber-500 shadow-sm" 
                          : "border-white/10/50 text-slate-400 bg-slate-900/30 hover:bg-slate-900/60"
                      }`}
                    >
                      <User className="w-4 h-4" />
                      Individual Donor
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("ngo")}
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                        role === "ngo" 
                          ? "bg-slate-800/80 border-[#38BDF8] text-amber-500 shadow-sm" 
                          : "border-white/10/50 text-slate-400 bg-slate-900/30 hover:bg-slate-900/60"
                      }`}
                    >
                      <Briefcase className="w-4 h-4" />
                      NGO Institution
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("admin")}
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                        role === "admin" 
                          ? "bg-slate-800/80 border-[#38BDF8] text-amber-500 shadow-sm" 
                          : "border-white/10/50 text-slate-400 bg-slate-900/30 hover:bg-slate-900/60"
                      }`}
                    >
                      <Shield className="w-4 h-4" />
                      System Admin
                    </button>
                  </div>
                </div>
              )}

              {/* Common Fields */}
              {!isLogin && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1.5">Authorized Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma" 
                      className="w-full pl-9 pr-4 py-2 text-sm bg-slate-900/60 border border-white/10/60 rounded-xl focus:border-sky-400 focus:ring-1 focus:ring-sky-400 outline-none transition-all font-semibold"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@charity.org" 
                    className="w-full pl-9 pr-4 py-2 text-sm bg-slate-900/60 border border-white/10/60 rounded-xl focus:border-sky-400 focus:ring-1 focus:ring-sky-400 outline-none transition-all font-semibold"
                    required
                  />
                </div>
              </div>

              {/* NGO Specific Fields */}
              {!isLogin && role === "ngo" && (
                <div className="space-y-4 p-4 rounded-xl bg-slate-800/40 border border-white/10/65 shadow-inner">
                  <h4 className="text-xs font-black text-amber-500 uppercase tracking-wider mb-2">NGO Verification Details</h4>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Registered NGO Name</label>
                    <input 
                      type="text" 
                      value={ngoName}
                      onChange={(e) => setNgoName(e.target.value)}
                      placeholder="e.g. EarthCare Global Fund" 
                      className="w-full px-3 py-1.5 text-xs bg-slate-800/60 border border-white/10/70 rounded-lg outline-none focus:border-sky-400 transition-all font-semibold"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">80G / CSR Registration Index</label>
                      <input 
                        type="text" 
                        value={ngoRegNo}
                        onChange={(e) => setNgoRegNo(e.target.value)}
                        placeholder="e.g. NGO-IND-881279" 
                        className="w-full px-3 py-1.5 text-xs bg-slate-800/60 border border-white/10/70 rounded-lg outline-none focus:border-sky-400 transition-all font-semibold"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mission Overview</label>
                    <textarea 
                      value={ngoDesc}
                      onChange={(e) => setNgoDesc(e.target.value)}
                      placeholder="Briefly describe your NGO's primary social impact goals..." 
                      rows={2}
                      className="w-full px-3 py-1.5 text-xs bg-slate-800/60 border border-white/10/70 rounded-lg outline-none focus:border-sky-400 transition-all resize-none font-semibold"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-1 mt-3">Disbursement Banking Details</label>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Bank Account No.</label>
                        <input 
                          type="text" 
                          value={bankAccount}
                          onChange={(e) => setBankAccount(e.target.value)}
                          placeholder="e.g. 123456789012" 
                          className="w-full px-3 py-1.5 text-xs bg-slate-800/60 border border-white/10/70 rounded-lg outline-none focus:border-sky-400 transition-all font-semibold"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">IFSC Code</label>
                        <input 
                          type="text" 
                          value={ifscCode}
                          onChange={(e) => setIfscCode(e.target.value)}
                          placeholder="e.g. SBIN0001234" 
                          className="w-full px-3 py-1.5 text-xs bg-slate-800/60 border border-white/10/70 rounded-lg outline-none focus:border-sky-400 transition-all font-semibold"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">UPI ID</label>
                      <input 
                        type="text" 
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="e.g. ngo@okhdfcbank" 
                        className="w-full px-3 py-1.5 text-xs bg-slate-800/60 border border-white/10/70 rounded-lg outline-none focus:border-sky-400 transition-all font-semibold"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest">Security Password</label>
                  {isLogin && (
                    <button 
                      type="button" 
                      onClick={() => setIsForgotPassword(true)}
                      className="text-[10px] text-amber-500 font-bold hover:underline"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="w-full pl-9 pr-10 py-2 text-sm bg-slate-900/60 border border-white/10/60 rounded-xl focus:border-sky-400 focus:ring-1 focus:ring-sky-400 outline-none transition-all font-semibold"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 cursor-pointer text-slate-400 hover:text-slate-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Buttons */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-purple-600 hover:bg-[#0284c7] text-white font-bold rounded-xl text-sm shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing blockchain records...
                  </>
                ) : (
                  isLogin ? "Authenticate Credentials" : "register NGO/Donor Node"
                )}
              </button>

              {/* Toggle Mode */}
              <p className="text-center text-xs text-slate-400 mt-3">
                {isLogin ? "Need a transparent verified Node?" : "Already registered on global chain?"}{" "}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-bold text-amber-500 hover:underline cursor-pointer"
                >
                  {isLogin ? "Join TrustChain" : "Login Securely"}
                </button>
              </p>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
