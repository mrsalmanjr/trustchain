/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LandingPage from "./components/LandingPage";
import CampaignsListPage from "./components/CampaignsListPage";
import CampaignDetails from "./components/CampaignDetails";
import DonationTracker from "./components/DonationTracker";
import BlockchainExplorer from "./components/BlockchainExplorer";
import DashboardDonor from "./components/DashboardDonor";
import DashboardNGO from "./components/DashboardNGO";
import DashboardAdmin from "./components/DashboardAdmin";
import AuthModal from "./components/AuthModal";
import { api } from "./services/api";

type Tab = "landing" | "campaigns" | "details" | "tracker" | "ledger" | "dashboard";

export default function App() {
  const [currentTab, setTab] = useState<Tab>(() => {
    const path = window.location.pathname.replace(/^\/+/, "");
    if (["campaigns", "details", "tracker", "ledger", "dashboard"].includes(path)) {
      return path as Tab;
    }
    return "landing";
  });
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [trackQuery, setTrackQuery] = useState<string>("");

  useEffect(() => {
    if (currentTab === "details" && !selectedCampaignId) {
      setTab("campaigns");
      return;
    }
    if (currentTab === "landing") window.history.pushState(null, "", "/");
    else window.history.pushState(null, "", `/${currentTab}`);
  }, [currentTab, selectedCampaignId]);

  // Auth state
  const [user, setUser] = useState<any>(null);
  const [ngo, setNgo] = useState<any>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  // Attempt to restore session state on boot mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const data = await api.getMe();
        if (data.user) {
          setUser(data.user);
          setNgo(data.ngo);
        }
      } catch (e) {
        console.log("No authenticated node discovered on localStorage.");
      }
    };
    checkSession();
  }, []);

  const handleAuthSuccess = (loggedUser: any) => {
    setUser(loggedUser);
    // Reload state to sync potential NGO profile mappings
    api.getMe().then(data => {
      setNgo(data.ngo);
      // Route donor/NGO to their portal dashboard automatically for delightful UX
      setTab("dashboard");
    }).catch(() => {
      setTab("dashboard");
    });
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setNgo(null);
    setTab("landing");
  };

  const handleOpenAuth = (mode: "login" | "register" = "login") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col relative overflow-hidden font-sans">
      
      {/* High-fidelity Glassmorphic Mesh Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[45vw] h-[45vw] bg-sky-900 rounded-full blur-[120px] opacity-20 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[45vw] h-[45vw] bg-[#0EA5E9] rounded-full blur-[120px] opacity-10 pointer-events-none" />
      <div className="absolute top-[35%] left-[15%] w-[35vw] h-[35vw] bg-purple-900 rounded-full blur-[130px] opacity-[0.1] pointer-events-none" />

      {/* Main Content layout z-indexed above mesh */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* 1. Global Navigation Header */}
        <Header 
          user={user} 
          ngo={ngo}
          onOpenAuth={() => handleOpenAuth("login")}
          onLogout={handleLogout}
          currentTab={currentTab}
          setTab={(tab: string) => setTab(tab as Tab)}
        />

        {/* 2. Dynamic Workspace Router Section */}
        <main className="flex-1">
        {currentTab === "landing" && (
          <LandingPage 
            setTab={(tab: string) => setTab(tab as Tab)}
            setSelectedCampaignId={setSelectedCampaignId}
            onOpenAuth={() => handleOpenAuth("register")}
            user={user}
          />
        )}

        {currentTab === "campaigns" && (
          <CampaignsListPage 
            setTab={(tab: string) => setTab(tab as Tab)}
            setSelectedCampaignId={setSelectedCampaignId}
          />
        )}

        {currentTab === "details" && selectedCampaignId && (
          <CampaignDetails 
            campaignId={selectedCampaignId}
            onBack={() => setTab("campaigns")}
            onOpenAuth={() => handleOpenAuth("login")}
            user={user}
            setTab={(tab: string) => setTab(tab as Tab)}
            setTrackQuery={setTrackQuery}
          />
        )}

        {currentTab === "tracker" && (
          <DonationTracker 
            initialQuery={trackQuery}
            setTab={(tab: string) => setTab(tab as Tab)}
          />
        )}

        {currentTab === "ledger" && (
          <BlockchainExplorer />
        )}

        {currentTab === "dashboard" && (
          <>
            {user?.role === "admin" && <DashboardAdmin />}
            {user?.role === "ngo" && (
              <DashboardNGO 
                user={user} 
                ngo={ngo} 
                setTab={(tab: string) => setTab(tab as Tab)}
                setSelectedCampaignId={setSelectedCampaignId}
                onRefreshNGO={async () => {
                  try {
                    const data = await api.getMe();
                    setNgo(data.ngo);
                  } catch (e) {
                    console.error("Failed to refresh NGO profile:", e);
                  }
                }}
              />
            )}
            {user?.role === "donor" && (
              <DashboardDonor 
                user={user} 
                setTab={(tab: string) => setTab(tab as Tab)}
                setTrackQuery={setTrackQuery}
                onRefreshUser={async () => {
                  try {
                    const data = await api.getMe();
                    setUser(data.user);
                  } catch (e) {
                    console.error("Failed to refresh user profile:", e);
                  }
                }}
              />
            )}
            {!user && (
              <div className="max-w-md mx-auto py-20 text-center space-y-4">
                <p className="text-slate-500 text-sm">Please check and verify your cryptographic authorization certificates to access your core dashboard portal parameters.</p>
                <button 
                  onClick={() => handleOpenAuth("login")}
                  className="px-6 py-2.5 bg-[#0EA5E9] text-white font-bold rounded-xl text-sm"
                >
                  Onboard/Login Node
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* 3. Global Decorative Footer */}
      <Footer setTab={(tab: string) => setTab(tab as Tab)} />

      {/* 4. Login and signup popups state mapping */}
      {authModalOpen && (
        <AuthModal 
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
          initialMode={authMode}
        />
      )}

      </div>
    </div>
  );
}
