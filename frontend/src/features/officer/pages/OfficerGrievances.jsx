import React, { useState } from "react";
import { MessageSquare, CheckCircle2, Search, ArrowRight, User, Calendar, Tag } from "lucide-react";
import { SectionHead } from "../../../components/common/SectionHead";
import { Btn } from "../../../components/common/Btn";

const DUMMY_GRIEVANCES = [
  {
    id: "GRV-2026-901",
    investor: "Amit Patel",
    company: "TechNova Solutions",
    department: "Maharashtra Fire Services",
    date: "2026-09-28",
    status: "Pending",
    priority: "High",
    subject: "Delay in Provisional Fire NOC",
    description: "I submitted all the required documents for the Provisional Fire NOC two weeks ago, but the application is still stuck in the 'Pending' stage. Can someone please look into this?"
  },
  {
    id: "GRV-2026-902",
    investor: "Sarah Jones",
    company: "GreenEco Manufacturing",
    department: "MIDC",
    date: "2026-09-25",
    status: "Resolved",
    priority: "Medium",
    subject: "Incorrect fee calculated for Water Connection",
    description: "The system calculated a fee of ₹15,000 for my industrial water connection, but according to the new policy, it should only be ₹7,500. Please rectify this issue."
  },
  {
    id: "GRV-2026-903",
    investor: "Rahul Sharma",
    company: "Sharma Textiles",
    department: "Directorate of Industrial Safety",
    date: "2026-09-29",
    status: "Pending",
    priority: "High",
    subject: "Portal crashing during document upload",
    description: "Every time I try to upload my factory building plan (PDF, 5MB), the portal throws a 500 error and crashes. This is delaying my entire approval process."
  }
];

export function OfficerGrievances() {
  const [grievances, setGrievances] = useState(DUMMY_GRIEVANCES);
  const [selectedGrievance, setSelectedGrievance] = useState(DUMMY_GRIEVANCES[0]);
  const [replyText, setReplyText] = useState("");

  const handleResolve = () => {
    if (!selectedGrievance || !replyText.trim()) return;
    
    const updatedGrievances = grievances.map(g => 
      g.id === selectedGrievance.id ? { ...g, status: "Resolved" } : g
    );
    setGrievances(updatedGrievances);
    setSelectedGrievance({ ...selectedGrievance, status: "Resolved" });
    setReplyText("");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 relative mb-20 p-4">
      <div className="flex items-start justify-between">
        <div className="flex gap-4 items-start">
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
            <MessageSquare size={28} />
          </div>
          <SectionHead
            title="Grievance Redressal"
            sub="Review, reply, and resolve issues raised by investors."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sidebar: List of Grievances */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col shadow-sm">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 relative">
            <Search size={16} className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search grievances..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div className="flex-1 overflow-y-auto max-h-[600px]">
            {grievances.map(g => (
              <button 
                key={g.id}
                onClick={() => setSelectedGrievance(g)}
                className={`w-full text-left p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors ${selectedGrievance?.id === g.id ? 'bg-indigo-50/50 border-l-4 border-l-indigo-600' : 'border-l-4 border-l-transparent'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-mono text-slate-500">{g.id}</span>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${g.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {g.status}
                  </span>
                </div>
                <h4 className="font-semibold text-slate-800 text-sm truncate">{g.subject}</h4>
                <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
                  <User size={12} /> {g.investor}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Area: Grievance Details & Reply */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {selectedGrievance ? (
            <>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">{selectedGrievance.subject}</h2>
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-600">
                      <span className="flex items-center gap-1.5"><User size={14} /> {selectedGrievance.investor} ({selectedGrievance.company})</span>
                      <span className="flex items-center gap-1.5"><Calendar size={14} /> {selectedGrievance.date}</span>
                      <span className="flex items-center gap-1.5"><Tag size={14} /> {selectedGrievance.department}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${selectedGrievance.priority === 'High' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                    {selectedGrievance.priority} Priority
                  </span>
                </div>
                
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedGrievance.description}
                </div>
              </div>

              {selectedGrievance.status !== "Resolved" ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-semibold text-slate-800 mb-4">Reply & Resolve</h3>
                  <textarea 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your resolution or response here..."
                    className="w-full h-32 p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm mb-4 resize-none"
                  ></textarea>
                  <div className="flex justify-end gap-3">
                    <Btn variant="outline">Save Draft</Btn>
                    <Btn 
                      onClick={handleResolve}
                      disabled={!replyText.trim()}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle2 size={16} /> Mark as Resolved
                    </Btn>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center text-emerald-800 flex flex-col items-center justify-center gap-3">
                  <CheckCircle2 size={32} className="text-emerald-500" />
                  <div>
                    <h3 className="font-bold">This grievance has been resolved</h3>
                    <p className="text-sm opacity-80 mt-1">The investor has been notified of the resolution.</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl flex items-center justify-center h-64 text-slate-500">
              Select a grievance from the list to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
