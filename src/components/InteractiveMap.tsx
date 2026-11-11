/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from "react";
import { MapPin, ArrowRight, Heart, Users, Target, ShieldCheck, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface InteractiveMapProps {
  campaigns: any[];
  onSelectCampaign: (id: string) => void;
}

const createIcon = (isSelected: boolean) => L.divIcon({
  className: "bg-transparent",
  html: `<div class="relative flex items-center justify-center w-8 h-8">
    ${isSelected ? '<div class="absolute inset-0 bg-purple-600 rounded-full animate-ping opacity-60" style="animation-duration: 2s;"></div>' : ''}
    <div class="relative w-4 h-4 bg-purple-600 rounded-full border-2 border-white/10 shadow-lg"></div>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

import { getGeoData } from "../lib/utils";

export default function InteractiveMap({ campaigns, onSelectCampaign }: InteractiveMapProps) {
  const [selectedRegionKey, setSelectedRegionKey] = useState<string>("");
  const [hoveredRegionKey, setHoveredRegionKey] = useState<string>("");

  const regionalGroups = useMemo(() => {
    const groups: Record<string, {
      regionName: string;
      lat: number;
      lng: number;
      campaigns: any[];
    }> = {};

    campaigns.forEach((c) => {
      if (c.status !== "active" && c.status !== "completed") return;

      const geo = getGeoData(c.location);
      const groupKey = `${geo.lat.toFixed(1)}_${geo.lng.toFixed(1)}`;

      if (!groups[groupKey]) {
        groups[groupKey] = {
          regionName: geo.regionName,
          lat: geo.lat,
          lng: geo.lng,
          campaigns: []
        };
      }
      groups[groupKey].campaigns.push(c);
    });

    return groups;
  }, [campaigns]);

  const groupKeys = Object.keys(regionalGroups);

  useMemo(() => {
    if (!selectedRegionKey && groupKeys.length > 0) {
      setSelectedRegionKey(groupKeys[0]);
    }
  }, [groupKeys, selectedRegionKey]);

  const selectedGroup = selectedRegionKey ? regionalGroups[selectedRegionKey] : null;

  return (
    <div id="trustchain-map-viz" className="glass-panel-heavy p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl overflow-hidden text-slate-200 space-y-6">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-left border-b border-purple-900/50 pb-5">
        <div>
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-amber-500 bg-purple-900/30 px-3 py-1 rounded-full border border-purple-900/50 inline-block mb-1.5 shadow-sm">
            On-Chain Spatial Indexing
          </span>
          <h3 className="text-2xl font-black text-white tracking-tight font-sans">
            Geo-Impact Mapping Registry
          </h3>
          <p className="text-xs text-slate-500 font-medium max-w-xl mt-0.5 leading-relaxed">
            Verify real-time humanitarian allocations geographically. Hover and interact with pulsing nodes representing smart contract distributions.
          </p>
        </div>
        
        {/* Quick Stats Summary */}
        <div className="flex gap-4 p-3 bg-black/60 border border-white/10 rounded-2xl shrink-0 shadow-inner">
          <div className="text-center px-2">
            <span className="block text-lg font-black text-white">{groupKeys.length}</span>
            <span className="text-[9px] uppercase font-bold text-slate-400">Active States</span>
          </div>
          <div className="border-l border-white/10" />
          <div className="text-center px-2">
            <span className="block text-lg font-black text-amber-500">{campaigns.length}</span>
            <span className="text-[9px] uppercase font-bold text-slate-400">Total Projects</span>
          </div>
        </div>
      </div>

      {/* Main Board */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-2">
        
        {/* Left Side: Interactive Leaflet Map */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative min-h-[360px] sm:min-h-[420px] bg-black/40 rounded-2xl border border-white/10 overflow-hidden shadow-inner z-0">
          
          <MapContainer 
            center={[22.5937, 78.9629]} 
            zoom={4} 
            scrollWheelZoom={false}
            className="w-full h-full min-h-[360px] sm:min-h-[420px] relative z-0"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            
            {groupKeys.map((key) => {
              const grp = regionalGroups[key];
              const isSelected = selectedRegionKey === key;
              const activeCount = grp.campaigns.length;

              return (
                <Marker 
                  key={key} 
                  position={[grp.lat, grp.lng]}
                  icon={createIcon(isSelected)}
                  eventHandlers={{
                    click: () => setSelectedRegionKey(key),
                  }}
                >
                  <Popup className="rounded-xl overflow-hidden font-sans border-0 shadow-lg">
                    <div className="p-1 px-1 bg-slate-900 text-slate-200 text-xs min-w-[120px] text-center">
                      <p className="font-extrabold text-white truncate mb-1">{grp.regionName}</p>
                      <p className="text-amber-500 font-bold text-[10px] bg-purple-900/30 py-1 rounded border border-purple-900/50">{activeCount} project(s)</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Map interactive cues */}
          <div className="absolute bottom-3 left-3 bg-black/85 backdrop-blur-md px-3 py-1.5 border border-white/10 rounded-lg text-[9px] font-bold text-slate-500 space-y-1 z-[400] shadow-sm text-left pointer-events-none">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              <span>Active TrustChain Campaign Hubs</span>
            </div>
            <div className="flex items-center gap-1.5 border-t border-slate-100 pt-1">
              <span className="text-[8px] text-slate-400">Click markers to view regional data</span>
            </div>
          </div>
        </div>

        {/* Right Side: Campaign Details & Directory List */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-purple-900/10 p-5 sm:p-6 border border-purple-500/20 rounded-2xl text-left relative overflow-hidden">
          
          {/* Subtle background circuit styling */}
          <div className="absolute right-0 bottom-0 pointer-events-none opacity-5 translate-x-12 translate-y-12">
            <ShieldCheck className="w-64 h-64 text-amber-500" />
          </div>

          <div className="space-y-4 relative z-10">
            {selectedGroup ? (
              <>
                {/* Selected Region Label */}
                <div className="border-b border-white/10 pb-3">
                  <span className="text-[9px] uppercase font-sans font-black tracking-widest text-slate-400">
                    Active Regional Cluster Node
                  </span>
                  <h4 className="text-lg font-black text-white flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-5 h-5 text-red-500 shrink-0" />
                    {selectedGroup.regionName}
                  </h4>
                  <div className="flex items-center gap-2 mt-1.5 font-mono text-[9px] text-amber-500 font-bold">
                    <span>GPS LAT: {selectedGroup.lat.toFixed(4)}° N</span>
                    <span>•</span>
                    <span>GPS LNG: {selectedGroup.lng.toFixed(4)}° E</span>
                  </div>
                </div>

                {/* Campaigns List in selected region */}
                <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                  {selectedGroup.campaigns.map((camp: any) => {
                    const pct = Math.min(100, Math.round((camp.raisedAmount / camp.goalAmount) * 100));
                    return (
                      <div
                        key={camp.id}
                        className="p-4 bg-slate-900 hover:bg-slate-800 border border-purple-900/50 rounded-xl transition-all shadow-sm hover:shadow-md flex flex-col gap-3 group/item border-l-4 border-l-purple-500"
                      >
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-[8px] bg-purple-900/30 text-amber-500 font-black uppercase tracking-wider px-2 py-0.5 rounded border border-white/10 shadow-sm">
                              {camp.category}
                            </span>
                            <span className="text-[8px] font-mono text-slate-400 font-bold block">Ref: {camp.id}</span>
                          </div>
                          
                          <h5 className="font-extrabold text-white text-[11px] leading-snug mt-1.5 font-sans">
                            {camp.title}
                          </h5>
                          
                          <p className="text-[10px] text-slate-300 line-clamp-2 mt-1 leading-normal font-medium">
                            {camp.description}
                          </p>
                        </div>

                        {/* Financial metric loops */}
                        <div className="bg-black/60 p-2.5 rounded-lg space-y-1.5 text-[10px] border border-white/5">
                          <div className="flex justify-between font-bold">
                            <span className="text-slate-200">Raised: ₹{camp.raisedAmount.toLocaleString()}</span>
                            <span className="text-slate-400">Goal: ₹{camp.goalAmount.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                            <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <div className="flex justify-between text-[9px] font-semibold text-slate-400">
                            <span className="text-amber-500 font-bold">{pct}% Funded</span>
                            <span className="flex items-center gap-0.5"><Users className="w-3 h-3" /> {camp.beneficiaryCount || 0} beneficiaries</span>
                          </div>
                        </div>

                        {/* CTA interaction */}
                        <button
                          type="button"
                          onClick={() => onSelectCampaign(camp.id)}
                          className="w-full py-1.5 bg-purple-900/50 text-amber-400 hover:bg-purple-600 hover:text-white transition duration-150 rounded-lg text-[10px] font-extrabold uppercase tracking-wide flex items-center justify-center gap-1 cursor-pointer border border-purple-500/30 shadow-sm"
                        >
                          Contribute & Verify on Ledger
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <HelpCircle className="w-8 h-8 text-slate-300 mx-auto animate-pulse" />
                <p className="font-bold text-xs font-sans">No regional cluster highlighted</p>
                <p className="text-[10px] text-slate-400">Select a pulsating beacon node on the interactive map to inspect available smart campaigns.</p>
              </div>
            )}
          </div>

          {/* Secure Trust Stamp */}
          <div className="mt-4 pt-3 border-t border-purple-900/50/40 text-[10px] flex items-center gap-1.5 text-slate-500 font-bold justify-between">
            <span className="flex items-center gap-1 text-slate-600"><ShieldCheck className="w-4 h-4 text-amber-400" /> SECURE BLOCKCHAIN MESH</span>
            <span className="text-[8px] font-mono text-sky-600 font-bold uppercase block tracking-wider bg-slate-900 p-0.5 px-1.5 rounded border">
              CONSENSUS LIVE
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}
