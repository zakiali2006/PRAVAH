import React, { useState } from 'react';
import { MessageSquare, Clock, Send, Upload, AlertCircle, CheckCircle2, ChevronDown, Check, Reply } from 'lucide-react';
import { useMockApp } from '../../../contexts/MockAppContext';

export const DepartmentQueries = ({ onAnswerQuery }) => {
  const { queries } = useMockApp();
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pendingCount = queries.filter(q => q.status === 'pending_applicant').length;

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!selectedQuery || !replyText.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onAnswerQuery(selectedQuery.id, replyText);
      setIsSubmitting(false);
      setSelectedQuery(null);
      setReplyText('');
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
            <MessageSquare size={16} />
            <span>Nodal Scrutiny Clarification Desk</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">Department Queries & Clarifications</h2>
          <p className="text-slate-600 text-xs mt-1">
            Official statutory queries raised by reviewing officers during document scrutiny. Prompt replies unblock approval issuance under RTS Act.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-indigo-50 border border-indigo-200 px-4 py-2 rounded-xl text-xs font-bold text-indigo-900">
          <Clock size={16} className="text-indigo-600" />
          <span>{pendingCount} Awaiting Your Response</span>
        </div>
      </div>

      {/* Query List */}
      <div className="space-y-4">
        {queries.map((q) => {
          const isPending = q.status === 'pending_applicant';
          return (
            <div 
              key={q.id}
              className={`p-6 rounded-2xl border transition-all ${
                isPending ? 'bg-white border-amber-300 shadow-sm' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-slate-400">{q.id}</span>
                  <span className="text-xs font-bold text-blue-600">{q.appName} ({q.appId})</span>
                  <span className="text-[10px] bg-slate-100 font-extrabold px-2 py-0.5 rounded text-slate-600">
                    {q.department}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-xs">
                  <span className="text-slate-400">Raised: {q.queryDate}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    isPending ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {isPending ? 'Action Required' : 'Answered & Resolved'}
                  </span>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">{q.querySubject}</h4>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                    "{q.queryDetail}"
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Raised by: {q.officerName}</p>
                </div>

                {q.applicantResponse ? (
                  <div className="bg-emerald-50/60 border border-emerald-100 p-3 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide">Your Submitted Clarification ({q.responseDate}):</span>
                    <p className="text-xs text-emerald-950">{q.applicantResponse}</p>
                  </div>
                ) : (
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setSelectedQuery(q);
                        setReplyText('');
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2 rounded-xl transition-all shadow flex items-center space-x-1.5"
                    >
                      <Send size={13} />
                      <span>Submit Clarification & Upload Proof</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Reply Modal */}
      {selectedQuery && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">Reply to Official Query</h3>
              <button onClick={() => setSelectedQuery(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1">
              <p className="font-bold text-slate-800">{selectedQuery.querySubject}</p>
              <p className="text-slate-600">{selectedQuery.queryDetail}</p>
            </div>

            <form onSubmit={handleSendReply} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Detailed Clarification</label>
                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Explain resolution, cite standards, or reference uploaded documents..."
                  className="w-full border border-slate-300 rounded-xl p-3 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="p-3 border border-dashed border-slate-300 rounded-xl bg-slate-50 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center space-x-2">
                  <Upload size={16} className="text-slate-400" />
                  <span>Attach revised PDF / architectural drawing (optional)</span>
                </div>
                <button type="button" className="text-blue-600 font-bold hover:underline">Browse</button>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedQuery(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow transition-all"
                >
                  {isSubmitting ? 'Sending Clarification...' : 'Send Official Response'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
