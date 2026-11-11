import React, { useState } from "react";
import { Table, Search, ArrowUpDown, FileSpreadsheet, Download, CheckCircle } from "lucide-react";

interface NgoDonationsPanelProps {
  recentDonations: any[];
}

export default function NgoDonationsPanel({ recentDonations }: NgoDonationsPanelProps) {
  const [search, setSearch] = useState("");
  const [filterCampaign, setFilterCampaign] = useState("all");
  const [exportSuccess, setExportSuccess] = useState(false);

  // Filter and search
  const filtered = recentDonations.filter(d => {
    const matchesSearch = d.donorName?.toLowerCase().includes(search.toLowerCase()) || 
                          d.donorId?.toLowerCase().includes(search.toLowerCase()) ||
                          d.id?.toLowerCase().includes(search.toLowerCase()) ||
                          d.campaignName?.toLowerCase().includes(search.toLowerCase());
    const matchesCampaign = filterCampaign === "all" || d.campaignId === filterCampaign;
    return matchesSearch && matchesCampaign;
  });

  // Unique campaign filter options
  const campaignOptions = recentDonations.reduce((acc: any[], d) => {
    if (d.campaignId && !acc.find(item => item.id === d.campaignId)) {
      acc.push({ id: d.campaignId, title: d.campaignName || "Campaign Unit" });
    }
    return acc;
  }, []);

  const handleExportCSV = () => {
    setExportSuccess(true);
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Transaction ID,Campaign Name,Donor ID,Amount (INR),Payment Method,Transaction Date,Web3 Address\n";
    
    filtered.forEach(d => {
      csvContent += `"${d.id}","${d.campaignName || "Campaign ID: " + d.campaignId}","${d.donorName || d.donorId}","${d.amount}","${d.paymentMethod || "Direct"}","${d.createdAt}","${d.txHash || "0x"}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Donations_Log_Export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setExportSuccess(false);
    }, 3000);
  };

  return (
    <div className="space-y-4 text-xs font-semibold text-slate-705 text-left" id="ngo-donations-log-workspace">
      
      {/* Title & Actions bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/10pb-3 mb-2">
        <div>
          <h3 className="font-extrabold text-white text-sm">Donations Received Audit Registry</h3>
          <p className="text-slate-400 font-medium text-[11px] mt-0.5">Excel-like, real-time searchable Ledger log of all donor transactions dispatched to your NGO.</p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={filtered.length === 0}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-[#0284c7] disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold text-[10px] rounded-lg cursor-pointer transition shadow-sm uppercase tracking-wider uppercase"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" /> Export CSV Report
        </button>
      </div>

      {exportSuccess && (
        <p className="p-2 bg-fuchsia-50 text-fuchsia-800 border border-fuchsia-200 rounded-lg text-[10px] font-bold flex items-center gap-1.5 animate-pulse">
          <CheckCircle className="w-4 h-4 text-purple-400" /> Audit spreadsheet generated. Downloading file...
        </p>
      )}

      {/* Structured Tool controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by Donor, Tx Hash, or Campaign keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900/60 border border-white/10/60 focus:border-purple-500/50 rounded-xl outline-none text-xs font-semibold text-slate-200 shadow-sm"
          />
        </div>

        <div>
          <select
            value={filterCampaign}
            onChange={(e) => setFilterCampaign(e.target.value)}
            className="w-full p-2 bg-slate-800/60 border border-white/10/65 rounded-xl outline-none cursor-pointer text-xs font-semibold text-slate-200 shadow-sm"
          >
            <option value="all">All Linked Campaign Goals</option>
            {campaignOptions.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid Table */}
      {filtered.length === 0 ? (
        <div className="py-12 border border-dashed rounded-2xl border-white/10 bg-slate-900/10 text-center text-slate-400">
          <p className="font-bold">No transactions found match filtering parameters.</p>
          <p className="text-[10px] text-slate-400 mt-1">If this is a new profile, wait for donors to contribute funds.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-slate-650 border border-white/10 rounded-xl overflow-hidden shadow-sm bg-slate-900/15">
            <thead className="text-[9px] uppercase font-black text-slate-400 bg-slate-900/30 border-b border-white/10">
              <tr>
                <th className="p-3">Reference Tx</th>
                <th className="p-3">Campaign Unit</th>
                <th className="p-3">Donor Signature</th>
                <th className="p-3">Date</th>
                <th className="p-3">Gateway</th>
                <th className="p-3 text-right">Settled (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-slate-900/30 transition-colors">
                  <td className="p-3 font-mono text-[9px] text-amber-500 font-bold truncate max-w-[80px]">
                    {d.txHash || "0x" + d.id}
                  </td>
                  <td className="p-3 font-bold text-slate-200 max-w-xs truncate">{d.campaignName || "Campaign Unit ID: " + d.campaignId}</td>
                  <td className="p-3 text-[11px] font-sans">
                    {d.anonymous ? (
                      <span className="italic text-slate-400 font-semibold">Anonymous Supporter</span>
                    ) : (
                      <span className="font-bold text-slate-300">{d.donorName || d.donorId}</span>
                    )}
                  </td>
                  <td className="p-3 font-medium text-slate-400 font-mono text-[10px]">
                    {new Date(d.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 uppercase text-[9px] font-black text-slate-400">
                    {d.paymentMethod || "UPI Express"}
                  </td>
                  <td className="p-3 text-right font-black text-white font-sans text-xs">
                    ₹{d.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[10px] text-slate-400 font-semibold mt-2.5">
            Displaying {filtered.length} of {recentDonations.length} transaction inputs validated on-chain.
          </p>
        </div>
      )}

    </div>
  );
}
