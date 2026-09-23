import React, { useState, useEffect } from "react";
import { ChevronsUpDown, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { serviceCatalogueAPI } from "../../../api/services";

export function ServicesAvailable() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const res = await serviceCatalogueAPI.list();
        setServices(res.data.data || []);
      } catch (err) {
        setError('Failed to load services.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const filteredServices = services.filter(s =>
    (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.sector || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredServices.length / itemsPerPage));
  const currentData = filteredServices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen p-8 text-sm font-sans" style={{ color: "#333" }}>
      <div className="max-w-7xl mx-auto">
        
        {/* HEADING */}
        <div className="mb-6 border-b-2 border-gray-100 pb-2 flex">
          <h2 className="text-xl font-bold" style={{ color: "#0F766E", borderBottom: "3px solid #0F766E", marginBottom: "-11px", paddingBottom: "8px" }}>
            LIST OF SERVICES
          </h2>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 text-sm">
            {error}
          </div>
        )}

        {/* TOP ACTIONS (Export & Search) */}
        <div className="flex justify-between items-center mb-3">
          <div className="text-gray-500 text-xs">
            {filteredServices.length} services available
          </div>
          <div className="flex items-center gap-2">
            <label className="text-gray-600">Search:</label>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-gray-400 w-48"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto border-t border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-gray-700">
                <th className="py-3 px-4 font-bold w-16">Sr.No</th>
                <th className="py-3 px-4 font-bold">Service Name</th>
                <th className="py-3 px-4 font-bold">Sector</th>
                <th className="py-3 px-4 font-bold">Fee (₹)</th>
                <th className="py-3 px-4 font-bold">Processing Days</th>
                <th className="py-3 px-4 font-bold text-center">
                  <div className="flex items-center justify-center gap-2 cursor-pointer group">
                    Apply
                    <ChevronsUpDown size={14} className="text-gray-300 group-hover:text-gray-500" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((svc, idx) => {
                const srNo = (currentPage - 1) * itemsPerPage + idx + 1;
                return (
                  <tr 
                    key={svc.id} 
                    className={`border-b border-gray-100 hover:bg-gray-50 ${idx % 2 === 0 ? 'bg-[#f9f9f9]' : 'bg-white'}`}
                  >
                    <td className="py-3 px-4">{srNo}</td>
                    <td className="py-3 px-4">{svc.name}</td>
                    <td className="py-3 px-4">{svc.sector || '—'}</td>
                    <td className="py-3 px-4">{svc.fee_amount != null ? `₹ ${Number(svc.fee_amount).toLocaleString()}` : '—'}</td>
                    <td className="py-3 px-4">{svc.processing_time_days || '—'}</td>
                    <td className="py-3 px-4 text-center">
                      <button 
                        onClick={() => currentUser ? navigate('/app/apply', { state: { serviceId: svc.id, serviceName: svc.name } }) : navigate('/login')}
                        className="bg-[#198754] text-white px-3 py-1 text-xs rounded hover:bg-[#157347] transition-colors whitespace-nowrap shadow-sm"
                      >
                        Apply Now
                      </button>
                    </td>
                  </tr>
                );
              })}
              {currentData.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">No services found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4 text-gray-600 text-sm">
            <div>
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredServices.length)} of {filteredServices.length} entries
            </div>
            <div className="flex border border-gray-200 rounded">
              <button 
                className={`px-3 py-1.5 border-r border-gray-200 hover:bg-gray-50 ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700'}`}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button 
                    key={pageNum}
                    className={`px-3 py-1.5 border-r border-gray-200 hover:bg-gray-50 ${currentPage === pageNum ? 'bg-gray-100 font-bold text-gray-900' : 'text-gray-600'}`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button 
                className={`px-3 py-1.5 hover:bg-gray-50 ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700'}`}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
