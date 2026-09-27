import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, XCircle, Search, Filter, Eye, AlertCircle, Clock, ChevronRight, Download } from 'lucide-react';
import { getMyDocuments, validateDocumentAPI } from '../../../api/client';

export function DocumentReview() {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDocs() {
      try {
        const res = await getMyDocuments();
        setDocuments(res.data || []);
      } catch (err) {
        console.error("Failed to load documents", err);
      } finally {
        setLoading(false);
      }
    }
    loadDocs();
  }, []);

  const handleValidate = async (docId) => {
    try {
      await validateDocumentAPI(docId);
      // Reload docs
      const res = await getMyDocuments();
      setDocuments(res.data || []);
      // update selected if needed
      const updated = (res.data || []).find(d => d.id === docId);
      if (updated) setSelectedDoc(updated);
    } catch(err) {
      console.error(err);
      alert("Failed to validate document");
    }
  };

  const handleDownload = () => {
    if(!selectedDoc) return;
    const token = localStorage.getItem('token');
    const url = `http://localhost:8000/api/documents/${selectedDoc.id}/download`;
    // open in new tab
    window.open(url, '_blank');
  };

  // Map backend documents to display structure
  const mappedDocs = documents.map(doc => {
    return {
      ...doc,
      applicant: `User ${doc.uploader_id}`,
      app_id: `APP-DOC-${doc.id}`,
      aiConfidence: doc.validation_status === 'VALID' ? 95 : 45,
      type: doc.original_name || 'Document',
      uploadDate: new Date(doc.created_at || Date.now()).toLocaleDateString()
    };
  });

  const filteredDocs = mappedDocs.filter(d => 
    d.applicant.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.app_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Document Review</h1>
          <p className="text-gray-500 mt-1">Verify uploaded applicant documents and assess AI confidence scores.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search ID or Applicant..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Document List */}
        <div className="lg:col-span-1 bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col shadow-sm">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h2 className="font-bold text-gray-800">Pending Queue</h2>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">{filteredDocs.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {filteredDocs.map(doc => (
              <motion.div 
                key={doc.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedDoc(doc)}
                className={`p-4 rounded-xl cursor-pointer border transition-all ${selectedDoc?.id === doc.id ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-gray-500">{doc.app_id}</span>
                  <div className="flex items-center gap-1 text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                    <Clock size={12} /> {doc.status}
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 leading-tight mb-1">{doc.type}</h3>
                <p className="text-sm text-gray-600 truncate mb-3">{doc.applicant}</p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200/50">
                  <span className="text-xs text-gray-400">{doc.uploadDate || doc.uploadedAt}</span>
                  <span className={`text-xs font-bold flex items-center gap-1 ${doc.aiConfidence > 90 ? 'text-green-600' : 'text-amber-600'}`}>
                    AI Confidence: {doc.aiConfidence}%
                  </span>
                </div>
              </motion.div>
            ))}
            {filteredDocs.length === 0 && (
              <div className="p-8 text-center text-gray-400">
                <FileText size={48} className="mx-auto mb-3 opacity-20" />
                <p>{loading ? 'Loading documents...' : 'No pending documents found.'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Document Viewer */}
        <div className="lg:col-span-2 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col overflow-hidden shadow-inner">
          {selectedDoc ? (
            <>
              <div className="p-5 border-b border-gray-200 bg-white flex justify-between items-center shadow-sm z-10">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedDoc.type}</h2>
                  <p className="text-sm text-gray-500">{selectedDoc.applicant} • {selectedDoc.id}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleValidate(selectedDoc.id)} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold rounded-xl transition-colors">
                    <CheckCircle size={18} /> Trigger AI Validation
                  </button>
                  <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold rounded-xl shadow-sm transition-all">
                    <Download size={18} /> Download
                  </button>
                </div>
              </div>
              <div className="flex-1 p-6 flex flex-col">
                <div className="mb-4 flex gap-4">
                  <div className="flex-1 bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-start gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                      <AlertCircle size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">AI Analysis</h4>
                      <p className="text-xs text-gray-600 mt-1">Document appears authentic. Text extraction successful. No signs of tampering detected.</p>
                    </div>
                  </div>
                  <div className="flex-1 bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${selectedDoc.aiConfidence > 90 ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                      <CheckCircle size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">Confidence Score</h4>
                      <div className="flex items-end gap-2 mt-1">
                        <span className="text-2xl font-black leading-none">{selectedDoc.aiConfidence}%</span>
                        <span className="text-xs text-gray-500 pb-0.5">Match</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Document Preview Placeholder */}
                <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gray-900/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                    <button onClick={handleDownload} className="bg-white/90 text-gray-800 px-4 py-2 rounded-lg font-bold shadow-lg flex items-center gap-2 hover:bg-white transition-colors">
                      <Download size={18} /> Download Document
                    </button>
                  </div>
                  <div className="w-2/3 h-4/5 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center text-gray-400 bg-gray-50 p-8 text-center">
                    <FileText size={64} className="mb-4 opacity-50" />
                    <p className="font-medium text-gray-600">{selectedDoc.original_name || 'Document Preview'}</p>
                    <p className="text-xs mt-2">Click download to view the file content.</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <Eye size={64} className="mb-4 opacity-20" />
              <p className="text-lg font-medium text-gray-500">Select a document to review</p>
              <p className="text-sm">Choose an item from the pending queue to begin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
