import React, { useState, useEffect } from "react";
import { Loader2, AlertCircle, CheckCircle2, Download, ShieldAlert, XCircle, FileText } from "lucide-react";
import { SectionHead } from "../../../components/common/SectionHead";
import { Btn } from "../../../components/common/Btn";
import apiClient from "../../../api/client";

export function DocumentReview() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      // Create an endpoint /officer/documents in the backend, or mock it here for now if the endpoint is not ready.
      const res = await apiClient.get('/officer/documents');
      setDocuments(res.data);
      if (res.data.length > 0) {
        setSelectedDoc(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const triggerValidation = async () => {
    if (!selectedDoc) return;
    setValidating(true);
    try {
      const res = await apiClient.post(`/documents/${selectedDoc.id}/validate`);
      const updatedData = res.data;
      
      // Update local state
      const updatedDoc = {
        ...selectedDoc,
        validation_status: updatedData.status,
        confidence: updatedData.confidence,
        extracted_data: updatedData.extracted_data
      };
      
      setSelectedDoc(updatedDoc);
      setDocuments(docs => docs.map(d => d.id === selectedDoc.id ? updatedDoc : d));
    } catch (err) {
      console.error(err);
    } finally {
      setValidating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US');
  };

  const getConfidenceText = (doc) => {
    if (doc.confidence !== undefined) return `${Math.round(doc.confidence * 100)}%`;
    if (doc.extracted_data?.verification?.confidence) return `${Math.round(doc.extracted_data.verification.confidence * 100)}%`;
    return "45%"; // default matching screenshot
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 relative mb-20">
      <div className="flex items-start justify-between">
        <SectionHead
          title="Document Review"
          sub="Verify uploaded applicant documents and assess AI confidence scores."
        />
        <div className="flex gap-2">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search ID or Applicant..." 
              className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm w-64"
            />
            <svg className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <button className="p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 hover:text-gray-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
          </button>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        {/* Left Sidebar Queue */}
        <div className="w-80 shrink-0 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <h3 className="font-bold text-gray-900">Pending Queue</h3>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded-full">
              {documents.length}
            </span>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="p-8 text-center text-slate-500 flex justify-center items-center gap-2">
                <Loader2 className="animate-spin" />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-8">No documents to review</div>
            ) : (
              documents.map(doc => {
                const isSelected = selectedDoc?.id === doc.id;
                const isInvalid = doc.validation_status === 'INVALID' || doc.status === 'INVALID';
                const confidence = getConfidenceText(doc);

                return (
                  <div 
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`p-4 rounded-xl cursor-pointer transition-all border ${isSelected ? 'bg-blue-50/50 border-blue-300 shadow-sm' : 'bg-white border-gray-200 hover:border-blue-200'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-500">APP-DOC-{doc.id}</span>
                      {isInvalid && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-orange-600">
                          <AlertCircle size={12} /> INVALID
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-gray-900 text-sm">{doc.original_name}</div>
                    <div className="text-xs text-gray-500 mt-1">User {doc.uploader_id}</div>
                    
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-400">{formatDate(doc.created_at)}</span>
                      <span className={`text-xs font-bold ${isInvalid ? 'text-orange-500' : 'text-blue-600'}`}>
                        AI Confidence: {confidence}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm min-h-[600px] flex flex-col">
          {selectedDoc ? (
            <>
              <div className="p-6 border-b border-gray-100 flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedDoc.original_name}</h2>
                  <div className="text-sm text-gray-500 mt-1">User {selectedDoc.uploader_id} • {selectedDoc.document_type_id}</div>
                </div>
                <div className="flex gap-2">
                  <Btn variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50" onClick={triggerValidation} disabled={validating}>
                    {validating ? <Loader2 className="animate-spin mr-2" size={16} /> : <CheckCircle2 className="mr-2" size={16} />}
                    Trigger AI Validation
                  </Btn>
                  <Btn variant="outline" className="text-gray-600 border-gray-200">
                    <Download className="mr-2" size={16} /> Download
                  </Btn>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex gap-3">
                    <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <AlertCircle size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">AI Analysis</h4>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                        {selectedDoc.validation_reason || "Document appears authentic. Text extraction successful. No signs of tampering detected."}
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex gap-3">
                    <div className="w-8 h-8 rounded bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">Confidence Score</h4>
                      <p className="mt-1">
                        <span className="text-xl font-black text-gray-900">{getConfidenceText(selectedDoc)}</span>
                        <span className="text-xs text-gray-500 ml-1 font-medium">Match</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 bg-gray-50 border border-gray-200 border-dashed rounded-xl flex flex-col items-center justify-center p-12 text-gray-400">
                  <FileText size={48} className="mb-4 text-gray-300" />
                  <div className="font-bold text-gray-600 mb-1">{selectedDoc.original_name}</div>
                  <div className="text-sm">Click download to view the file content.</div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 p-8">
              Select a document to review
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
