/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Link, Bell, Shield, LogOut, Disc, Grid, Activity, Menu, X, Coins } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { api } from "../services/api";

interface HeaderProps {
  user: any;
  ngo: any;
  onOpenAuth: () => void;
  onLogout: () => void;
  currentTab: string;
  setTab: (tab: string) => void;
}

export default function Header({ user, ngo, onOpenAuth, onLogout, currentTab, setTab }: HeaderProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchNotifications = async () => {
      if (user) {
        try {
          const list = await api.getNotifications();
          setNotifications(list);
        } catch (e) {
          console.error("Failed to sync client notifications ledger", e);
        }
      } else {
        setNotifications([]);
      }
    };

    fetchNotifications();
    if (user) {
      interval = setInterval(fetchNotifications, 8000);
    }
    return () => clearInterval(interval);
  }, [user]);

  const markAllRead = async () => {
    try {
      await api.readNotifications();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const navigateTo = (tabName: string) => {
    setTab(tabName);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-black/45 backdrop-blur-md border-b border-white/10/10 shadow-[0_8px_32px_0_rgba(168,85,247,0.1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigateTo("landing")}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 to-amber-500 text-white shadow-md shadow-purple-900">
              <Disc className="w-6 h-6 animate-pulse" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-amber-400 border border-white/10" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-white tracking-tight flex items-center gap-1">
                Trust<span className="text-amber-500">Chain</span>
              </span>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest -mt-1">Transparency First</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <button
              onClick={() => navigateTo("landing")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentTab === "landing" 
                  ? "text-amber-500 bg-slate-800/60 border border-white/10/15 shadow-sm" 
                  : "text-slate-300 hover:text-amber-500 hover:bg-slate-800/40"
              }`}
            >
              Home
            </button>
            <button
              onClick={() => navigateTo("campaigns")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentTab === "campaigns" 
                  ? "text-amber-500 bg-slate-800/60 border border-white/10/15 shadow-sm" 
                  : "text-slate-300 hover:text-amber-500 hover:bg-slate-800/40"
              }`}
            >
              Explore Campaigns
            </button>
            {(!user || user.role === "donor") && (
              <button
                onClick={() => navigateTo("tracker")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  currentTab === "tracker" 
                    ? "text-amber-500 bg-slate-800/60 border border-white/10/10 shadow-sm" 
                    : "text-slate-400 hover:text-amber-500 hover:bg-slate-800/40"
                }`}
              >
                Donation Tracker
              </button>
            )}
            <button
              onClick={() => navigateTo("ledger")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentTab === "ledger" 
                  ? "text-amber-500 bg-slate-800/60 border border-white/10/10 shadow-sm" 
                  : "text-slate-400 hover:text-amber-500 hover:bg-slate-800/40"
              }`}
            >
              Blockchain Ledger
            </button>
          </nav>

          {/* Action Bars (Notifications & User Controls) */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {/* Dashboard Shortcut Buttons dependent on Role */}
                <button
                  onClick={() => navigateTo("dashboard")}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-950/40 hover:bg-purple-900/60 hover:text-sky-700 text-amber-500 rounded-xl text-xs font-bold border border-purple-500/30 transition-all cursor-pointer"
                >
                  <Grid className="w-3.5 h-3.5" />
                  {user.role === "admin" ? "Admin Panel" : user.role === "ngo" ? "NGO Console" : "Donor Portal"}
                </button>

                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowNotifDropdown(!showNotifDropdown);
                      if (!showNotifDropdown && unreadCount > 0) {
                        markAllRead();
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-all cursor-pointer relative"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white ring-2 ring-white animate-bounce">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {showNotifDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="glass-dropdown absolute right-0 mt-3 w-80 rounded-2xl shadow-xl overflow-hidden z-50"
                      >
                        <div className="p-3.5 border-b border-white/10/45 bg-slate-900/60 flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-200">Dynamic Platform Alerts</span>
                          {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-[10px] text-amber-600 font-bold hover:underline">
                              Mark all Read
                            </button>
                          )}
                        </div>
                        <div className="max-h-72 overflow-y-auto divide-y divide-sky-50">
                          {notifications.length === 0 ? (
                            <p className="p-4 text-center text-xs text-slate-400">No recent ledger events.</p>
                          ) : (
                            notifications.map((n) => (
                              <div key={n.id} className={`p-3 text-left transition-colors ${!n.read ? "bg-purple-950/40/30" : ""}`}>
                                <h5 className="text-xs font-bold text-slate-200 flex items-center gap-1">
                                  {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />}
                                  {n.title}
                                </h5>
                                <p className="text-[10px] text-slate-400 mt-1">{n.message}</p>
                                <span className="text-[8px] text-slate-400 mt-1 block">
                                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile Controls */}
                <div className="flex items-center gap-3 pl-2 border-l border-purple-900/50">
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-200">{user.name}</p>
                    <span className="text-[9px] font-black text-white bg-purple-700 px-2 py-0.5 rounded-full uppercase tracking-wider block text-center mt-0.5">
                      {user.role}
                    </span>
                  </div>

                  <button
                    onClick={onLogout}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-xl transition-all cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-5 py-2.5 bg-purple-700 hover:bg-purple-600 text-white font-bold rounded-xl text-sm shadow-md shadow-sky-150 transition-all cursor-pointer"
              >
                Authenticate Node
              </button>
            )}
          </div>

          {/* Mobile hamburger menu */}
          <div className="flex md:hidden items-center gap-3">
            {user && (
              <div className="relative">
                <button
                  onClick={() => navigateTo("dashboard")}
                  className="p-1 px-2.5 bg-purple-950/40 text-amber-500 rounded-lg text-xs font-bold border border-sky-150 cursor-pointer"
                >
                  Portal
                </button>
              </div>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-slate-400 hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-slate-900 border-t border-sky-50 shadow-inner px-4 py-4 space-y-2.5"
          >
            <button
              onClick={() => navigateTo("landing")}
              className="block w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold text-slate-300 hover:bg-purple-950/40"
            >
              Home
            </button>
            {(!user || user.role === "donor") && (
              <>
                <button
                  onClick={() => navigateTo("campaigns")}
                  className="block w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold text-slate-300 hover:bg-purple-950/40"
                >
                  Explore Campaigns
                </button>
                <button
                  onClick={() => navigateTo("tracker")}
                  className="block w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold text-slate-300 hover:bg-purple-950/40"
                >
                  Donation Tracker
                </button>
              </>
            )}
            <button
              onClick={() => navigateTo("ledger")}
              className="block w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold text-slate-300 hover:bg-purple-950/40"
            >
              Blockchain Ledger
            </button>

            {user ? (
              <div className="pt-4 border-t border-purple-900/50 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-white">{user.name}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">{user.role} console</p>
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1 text-xs text-red-500 font-bold bg-red-50 px-3 py-1.5 rounded-lg border border-red-100"
                >
                  <LogOut className="w-3.5 h-3.5" /> Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="w-full py-2.5 bg-purple-700 text-white font-bold text-sm rounded-xl text-center shadow-md cursor-pointer"
              >
                Authenticate Node
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
