import React, { useState, useEffect } from "react";
import { ChevronsUpDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import apiClient from "../../../api/client";

const DUMMY_SERVICES = [
  "Form A - Electrical Installations - Other than Overhead Line",
  "Form B - Electrical Installations - Overhead Line",
  "Form C - Electrical Installations with Overhead Line",
  "Generating Set Energization (Permission for charging Diesel Generator Sets)",
  "Generating Set Plan Approval (Layout Approvals for DG sets)",
  "Generating Set Registration (Registration of Diesel Generator Sets)",
  "Grant of Permission for erection of lift and License to operate a lift",
  "New electricity connection and power feasibility certificate",
  "Authorization under Construction and Demolition Waste Management Rules, 2016",
  "Authorization under Hazardous Waste Rule"
];

const DEPARTMENTS = [
  { dept: "Energy Department", sub: "Electrical Inspectorate" },
  { dept: "Environment Department", sub: "Maharashtra Pollution Control Board" },
  { dept: "Labour Department", sub: "Directorate of Industrial Safety and Health" },
  { dept: "Revenue Department", sub: "District Collector Office" },
  { dept: "MIDC", sub: "Maharashtra Industrial Development Corporation" }
];

export function ServicesAvailable() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [services, setServices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const fetchServices = async () => {
    try {
      const res = await apiClient.get('/services/active');
      setServices(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    fetchServices();
  }, []);

  const totalItems = services.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const currentData = services.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="bg-white min-h-screen p-8 text-sm font-sans" style={{ color: "#333" }}>
      <div className="max-w-7xl mx-auto">
        
        {/* HEADING */}
        <div className="mb-6 border-b-2 border-gray-100 pb-2 flex">
          <h2 className="text-xl font-bold" style={{ color: "#0F766E", borderBottom: "3px solid #0F766E", marginBottom: "-11px", paddingBottom: "8px" }}>
            LIST OF SERVICES
          </h2>
        </div>

        {/* FILTER BOX */}
        <div className="border border-gray-200 p-6 rounded mb-6 bg-white shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block font-bold text-gray-800 mb-1">Select Department</label>
              <select className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gray-400">
                <option>------Select----</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-gray-800 mb-1">Select Sub-Department</label>
              <select className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gray-400">
                <option></option>
              </select>
            </div>
          </div>
          <div className="flex justify-center gap-2 mt-4">
            <button className="bg-[#198754] text-white px-5 py-1.5 rounded hover:bg-[#157347] transition-colors">
              Search
            </button>
            <button className="bg-[#dc3545] text-white px-5 py-1.5 rounded hover:bg-[#bb2d3b] transition-colors">
              Reset
            </button>
          </div>
        </div>

        {/* TOP ACTIONS (Export & Search) */}
        <div className="flex justify-between items-center mb-3">
          <button className="bg-[#6f42c1] text-white px-4 py-1.5 rounded text-xs font-semibold hover:bg-[#59339d] transition-colors shadow-sm">
            Export to Excel
          </button>
          <div className="flex items-center gap-2">
            <label className="text-gray-600">Search:</label>
            <input 
              type="text" 
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
                <th className="py-3 px-4 font-bold flex items-center justify-between cursor-pointer group">
                  Department Name
                  <ChevronsUpDown size={14} className="text-gray-300 group-hover:text-gray-500" />
                </th>
                <th className="py-3 px-4 font-bold">
                  <div className="flex items-center justify-between cursor-pointer group">
                    Sub-Department Name
                    <ChevronsUpDown size={14} className="text-gray-300 group-hover:text-gray-500" />
                  </div>
                </th>
                <th className="py-3 px-4 font-bold">Service Name</th>
                <th className="py-3 px-4 font-bold text-center">
                  <div className="flex items-center justify-center gap-2 cursor-pointer group">
                    Apply
                    <ChevronsUpDown size={14} className="text-gray-300 group-hover:text-gray-500" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-gray-500">No active services found.</td>
                </tr>
              ) : currentData.map((row, idx) => (
                <tr 
                  key={row.id} 
                  className={`border-b border-gray-100 hover:bg-gray-50 ${idx % 2 === 0 ? 'bg-[#f9f9f9]' : 'bg-white'}`}
                >
                  <td className="py-3 px-4">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                  <td className="py-3 px-4">{row.department}</td>
                  <td className="py-3 px-4">-</td>
                  <td className="py-3 px-4 pr-12">{row.name}</td>
                  <td className="py-3 px-4 text-center">
                    <button 
                      onClick={() => currentUser ? navigate('/app/apply', { state: { serviceName: row.name, fee: row.fee } }) : navigate('/login')}
                      className="bg-[#198754] text-white px-3 py-1 text-xs rounded hover:bg-[#157347] transition-colors whitespace-nowrap shadow-sm"
                    >
                      Apply Now
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex justify-between items-center mt-4 text-gray-600 text-sm">
          <div>
            Showing {totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
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
              className={`px-3 py-1.5 hover:bg-gray-50 ${currentPage === totalPages || totalPages === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700'}`}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
