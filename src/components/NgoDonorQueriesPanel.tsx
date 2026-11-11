import React from "react";
import { MessageSquare, Clock, CheckCircle, HelpCircle, AlertCircle, ArrowUpDown } from "lucide-react";

interface NgoDonorQueriesPanelProps {
  donorQueries: any[];
  onRespond: (id: string) => void;
  queryResponseText: string;
  setQueryResponseText: (text: string) => void;
  selectedQueryId: string | null;
  setSelectedQueryId: (id: string | null) => void;
}

export default function NgoDonorQueriesPanel({
  donorQueries,
  onRespond,
  queryResponseText,
  setQueryResponseText,
  selectedQueryId,
  setSelectedQueryId
}: NgoDonorQueriesPanelProps) {
  return (
    <div className="space-y-4 text-xs font-semibold text-slate-705 text-left animate-fade-in" id="ngo-queries-management-view">
      <div>
        <h3 className="font-extrabold text-slate-905 text-sm flex items-center gap-1.5">
          <MessageSquare className="w-5 h-5 text-amber-400" /> Donor Communication & Queries Node
        </h3>
        <p className="text-slate-450 mt-1 leading-relaxed">Respond directly to incoming citizen questions about your fund utilization milestones and active project operations.</p>
      </div>

      <div className="space-y-4">
        {donorQueries.length === 0 ? (
          <p className="py-6 border border-dashed rounded-xl border-white/10 text-center text-slate-400 bg-slate-900/20">No pending queries from donors at this moment.</p>
        ) : (
          donorQueries.map((q) => (
            <div key={q.id} className="p-4 bg-slate-800/60 hover:bg-slate-800 border border-white/10/70 rounded-xl space-y-3 shadow-sm transition duration-150">
              
              {/* Header */}
              <div className="flex justify-between items-baseline gap-2 pb-2 border-b border-white/10">
                <div>
                  <span className="font-black text-slate-200 text-xs inline-flex items-center gap-1"><HelpCircle className="w-3.5 h-3.5 text-amber-300" /> {q.donorName}</span>
                  <span className="text-[10px] text-slate-450 block font-normal mt-0.5">Campaign Context: <strong className="text-slate-300 font-bold">{q.campaignTitle}</strong></span>
                </div>
                <div>
                  {q.status === "pending" ? (
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[9px] font-black uppercase flex items-center gap-1">
                      <Clock className="w-3 h-3 animate-pulse" /> PENDING CODE ANSWER
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-fuchsia-50 text-fuchsia-800 border border-fuchsia-200 rounded-full text-[9px] font-black uppercase flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> TRANSMITTED REPLY
                    </span>
                  )}
                </div>
              </div>

              {/* Message text */}
              <p className="text-slate-300 text-xs leading-relaxed italic pr-4">"{q.message}"</p>

              {/* Responder UI */}
              {q.status === "pending" ? (
                selectedQueryId === q.id ? (
                  <div className="space-y-2 pt-2">
                    <textarea
                      rows={2}
                      placeholder="Type a certified response. Your message will be hashed onto the transaction metadata..."
                      value={queryResponseText}
                      onChange={(e) => setQueryResponseText(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-900 border border-sky-150 rounded-xl outline-none focus:border-[#0EA5E9] font-medium text-slate-200 shadow-inner"
                    />
                    <div className="flex justify-end gap-2 text-[10px] uppercase font-black font-sans">
                      <button
                        type="button"
                        onClick={() => { setSelectedQueryId(null); setQueryResponseText(""); }}
                        className="p-1 px-3 bg-slate-800 hover:bg-slate-200 rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => onRespond(q.id)}
                        disabled={!queryResponseText.trim()}
                        className="p-1 px-4.5 bg-purple-600 hover:bg-[#0284c7] disabled:bg-slate-200 text-white rounded-lg cursor-pointer transition shadow-sm font-sans"
                      >
                        Send Secure Answer
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedQueryId(q.id)}
                      className="inline-flex items-center gap-1 p-1 px-3.5 bg-purple-900/300 hover:bg-sky-600 text-white rounded-lg font-black text-[10px] shadow transition cursor-pointer font-sans uppercase tracking-wider"
                    >
                      Answer Query
                    </button>
                  </div>
                )
              ) : (
                <div className="p-3 bg-slate-900/50 border rounded-xl text-slate-650 space-y-1 mt-2">
                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Response signed on blockchain:</p>
                  <p className="leading-relaxed font-sans">{q.response}</p>
                </div>
              )}

            </div>
          ))
        )}
      </div>
    </div>
  );
}
