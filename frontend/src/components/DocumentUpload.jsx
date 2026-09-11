import React, { useState } from 'react';
import { validateDocument } from '../api/client';

export function DocumentUpload() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    
    try {
      const data = await validateDocument(file);
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Failed to validate document. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 border rounded bg-white max-w-md w-full shadow-sm">
      <h3 className="font-bold text-lg mb-4 text-blue-900">Pre-Validation Upload (AI OCR)</h3>
      
      <input 
        type="file" 
        accept="image/jpeg, image/png"
        onChange={(e) => {
            setFile(e.target.files[0]);
            setResult(null); // Clear previous results
        }} 
        className="mb-4 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-900 hover:file:bg-blue-100"
      />
      
      <button 
        onClick={handleUpload} 
        disabled={loading || !file}
        className="bg-blue-900 text-white px-4 py-2 rounded font-semibold disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Running AI Scan..." : "Scan & Validate"}
      </button>

      {result && (
        <div className={`mt-4 p-4 border rounded ${result.status === 'Pass' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <p className="font-semibold" style={{ color: result.status === 'Pass' ? 'green' : 'red' }}>
            Status: {result.status}
          </p>
          {result.details && result.details.issues && result.details.issues.length > 0 && (
            <ul className="list-disc ml-5 mt-2 text-sm text-red-700">
              {result.details.issues.map((issue, idx) => <li key={idx}>{issue}</li>)}
            </ul>
          )}
          {result.details && result.details.extracted_text && (
             <div className="mt-4">
                 <p className="text-xs font-semibold text-slate-500">Extracted Raw Text:</p>
                 <p className="text-xs text-slate-600 mt-1 line-clamp-3 bg-white p-2 rounded border border-slate-200">{result.details.extracted_text}</p>
             </div>
          )}
        </div>
      )}
    </div>
  );
}
