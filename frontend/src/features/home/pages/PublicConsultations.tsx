import React, { useState } from 'react';
import { Megaphone, Calendar, MapPin, MessageSquare, Users, FileText, ArrowRight, BookOpen } from 'lucide-react';
import { useMockApp } from '../../../contexts/MockAppContext';

export const PublicConsultations = ({ onSubmitComment }) => {
  const { consultations } = useMockApp();
  const [selectedItem, setSelectedItem] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedItem || !commentText.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onSubmitComment(selectedItem.id, commentText);
      setIsSubmitting(false);
      setSelectedItem(null);
      setCommentText('');
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-teal-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Megaphone size={16} />
            <span>Environmental Clearance (EC) & Public Hearing Desk</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">Public Consultations & EIA Notices</h2>
          <p className="text-slate-600 text-xs mt-1">
            Statutory public environmental hearings mandated under MoEFCC EIA Notification & Maharashtra Pollution Control Board (MPCB).
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-teal-50 border border-teal-200 px-4 py-2 rounded-xl text-xs font-bold text-teal-900">
          <Calendar size={16} className="text-teal-600" />
          <span>{consultations.length} Active Public Hearings</span>
        </div>
      </div>

      {/* Consultations List */}
      <div className="space-y-4">
        {consultations.map((item) => (
          <div key={item.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-teal-300 transition-all space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-slate-400">{item.id}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-teal-100 text-teal-800">
                  {item.status}
                </span>
              </div>

              <div className="flex items-center space-x-4 text-xs font-semibold text-slate-600">
                <span className="flex items-center space-x-1">
                  <Calendar size={14} className="text-teal-600" />
                  <span>Hearing Date: <strong>{item.hearingDate}</strong></span>
                </span>
                <span className="flex items-center space-x-1 text-slate-500">
                  <MessageSquare size={14} />
                  <span>{item.commentsCount} Comments Submitted</span>
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-extrabold text-slate-900 leading-snug">{item.projectTitle}</h3>
              <p className="text-xs text-slate-500 font-medium">Proponent: {item.applicantName}</p>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">EIA Executive Summary</span>
                <p className="text-slate-700 leading-relaxed">{item.eiaSummary}</p>
              </div>

              <div className="flex items-center space-x-2 text-xs text-slate-600 pt-1">
                <MapPin size={14} className="text-rose-500 flex-shrink-0" />
                <span>Venue: <strong>{item.venue}</strong> ({item.location})</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedItem(item)}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow flex items-center space-x-1.5"
              >
                <MessageSquare size={13} />
                <span>Submit Citizen / Industry Representation</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Comment Submission Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">Submit Representation on EIA</h3>
              <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1">
              <p className="font-bold text-slate-800">{selectedItem.projectTitle}</p>
              <p className="text-slate-500">Public Hearing at: {selectedItem.venue}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Written Comments / Observations</label>
                <textarea
                  rows={4}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="State environmental, infrastructural, or community considerations..."
                  className="w-full border border-slate-300 rounded-xl p-3 text-xs font-medium focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow transition-all"
                >
                  {isSubmitting ? 'Recording Representation...' : 'Submit to MPCB Hearing Panel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
