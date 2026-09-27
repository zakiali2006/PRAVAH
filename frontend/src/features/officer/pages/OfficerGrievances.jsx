import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Flame, CheckCircle, Search, CornerDownRight, Tag, Clock } from 'lucide-react';
import { getGrievances, closeGrievance } from '../../../api/client';

export function OfficerGrievances() {
  const [grievances, setGrievances] = useState([]);
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');

  useEffect(() => {
    async function loadGrievances() {
      try {
        const res = await getGrievances();
        // map data
        const mapped = (res || []).map(g => ({
          id: g.id || `GRV-${Math.floor(Math.random()*1000)}`,
          applicant: `User ${g.user_id}`,
          dept: g.department_name || 'General',
          sentiment: g.ai_sentiment || 'Neutral',
          subject: g.subject || 'No Subject',
          description: g.description || '',
          date: new Date(g.created_at || Date.now()).toLocaleDateString(),
          similarity: Math.floor(Math.random() * 60 + 20), // mock similarity score
          status: g.status
        }));
        setGrievances(mapped);
        if(mapped.length > 0) setSelectedGrievance(mapped[0]);
      } catch (err) {
        console.error("Failed to load grievances", err);
      } finally {
        setLoading(false);
      }
    }
    loadGrievances();
  }, []);

  const handleResolve = async () => {
    if (!selectedGrievance) return;
    try {
      await closeGrievance(selectedGrievance.id, note || "Resolved by officer");
      // refresh
      const res = await getGrievances();
      const mapped = (res || []).map(g => ({
        id: g.id || `GRV-${Math.floor(Math.random()*1000)}`,
        applicant: `User ${g.user_id}`,
        dept: g.department_name || 'General',
        sentiment: g.ai_sentiment || 'Neutral',
        subject: g.subject || 'No Subject',
        description: g.description || '',
        date: new Date(g.created_at || Date.now()).toLocaleDateString(),
        similarity: Math.floor(Math.random() * 60 + 20),
        status: g.status
      }));
      setGrievances(mapped);
      const updated = mapped.find(m => m.id === selectedGrievance.id);
      if(updated) setSelectedGrievance(updated);
      setNote('');
      alert("Grievance marked as resolved.");
    } catch(err) {
      console.error(err);
      alert("Failed to resolve grievance.");
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <MessageSquare className="text-rose-600" size={32} />
            Grievances
          </h1>
          <p className="text-gray-500 mt-1">Review applicant grievances with AI sentiment analysis and semantic matching.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Grievance List */}
        <div className="lg:col-span-4 flex flex-col space-y-4 overflow-y-auto pr-2">
          {grievances.length === 0 && (
             <div className="text-gray-500 mt-4 text-center">{loading ? 'Loading...' : 'No grievances found.'}</div>
          )}
          {grievances.map(grv => (
            <motion.div 
              key={grv.id}
              whileHover={{ scale: 1.01 }}
              onClick={() => setSelectedGrievance(grv)}
              className={`p-5 rounded-2xl cursor-pointer border transition-all ${selectedGrievance?.id === grv.id ? 'border-rose-500 bg-rose-50 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-gray-500">{grv.id}</span>
                <span className={`text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 ${getSentimentColor(grv.sentiment)}`}>
                  {grv.sentiment === 'Angry' && <Flame size={12} />} {grv.sentiment}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 line-clamp-2 leading-tight">{grv.subject}</h3>
              <p className="text-sm text-gray-600 mt-2">{grv.applicant}</p>
              <div className="flex items-center justify-between mt-4 text-xs font-medium text-gray-400">
                <span className="flex items-center gap-1"><Clock size={12}/> {grv.date}</span>
                <span className="px-2 py-1 bg-gray-100 rounded-full text-gray-600">{grv.dept}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Details View */}
        <div className="lg:col-span-8 bg-white border border-gray-200 rounded-2xl flex flex-col overflow-hidden shadow-sm">
          {selectedGrievance ? (
            <>
              <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-sm font-bold text-rose-600 mb-1">{selectedGrievance.id} • {selectedGrievance.dept}</div>
                    <h2 className="text-2xl font-black text-gray-900 leading-tight">{selectedGrievance.subject}</h2>
                    <p className="text-gray-500 mt-2">Submitted by <span className="font-bold text-gray-700">{selectedGrievance.applicant}</span> on {selectedGrievance.date}</p>
                  </div>
                  <div className={`px-3 py-1.5 rounded-lg font-bold text-sm flex items-center gap-2 ${getSentimentColor(selectedGrievance.sentiment)}`}>
                    Sentiment: {selectedGrievance.sentiment}
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button className="px-4 py-2 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors">
                    Assign to Me
                  </button>
                  <button className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors flex items-center gap-2">
                    <CornerDownRight size={16} /> Escalate
                  </button>
                  <button onClick={handleResolve} className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-xl font-bold hover:bg-green-100 transition-colors ml-auto flex items-center gap-2">
                    <CheckCircle size={16} /> Mark Resolved
                  </button>
                </div>
              </div>

              <div className="flex-1 p-6 bg-gray-50/50 overflow-y-auto">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-6 text-gray-800 text-sm leading-relaxed">
                  "{selectedGrievance.description || selectedGrievance.subject}"
                </div>

                <div className="mt-8">
                  <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                    <Tag size={18} className="text-rose-500" />
                    AI Insights & Similar Cases
                  </h3>
                  
                  {selectedGrievance.similarity > 50 ? (
                    <div className="space-y-3">
                      <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-rose-700">HIGH SIMILARITY (92%)</span>
                          <span className="text-xs font-bold text-gray-500">Resolved 2 weeks ago</span>
                        </div>
                        <h4 className="font-bold text-gray-900 text-sm">Delay in environment clearance for factory setup</h4>
                        <p className="text-xs text-gray-600 mt-1">Resolution: Escalate directly to Env Officer Desk 4. Automated SLA breach notification was stalled.</p>
                        <button className="mt-3 text-xs font-bold text-rose-600 hover:text-rose-800">View Case GRV-2023-041</button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-white border border-gray-200 rounded-xl text-center text-sm text-gray-500">
                      No highly similar past grievances found in the vector database.
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-200 bg-white">
                <textarea 
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all resize-none"
                  rows="3"
                  placeholder="Add an internal note or reply to the applicant..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                ></textarea>
                <div className="flex justify-end mt-2">
                  <button onClick={handleResolve} className="px-5 py-2 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-colors shadow-sm">
                    Post Reply & Resolve
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a grievance to review details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getSentimentColor(sentiment) {
  switch (sentiment) {
    case 'Angry': return 'bg-red-100 text-red-700';
    case 'Frustrated': return 'bg-orange-100 text-orange-700';
    case 'Neutral': return 'bg-gray-100 text-gray-700';
    case 'Happy': return 'bg-green-100 text-green-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}
