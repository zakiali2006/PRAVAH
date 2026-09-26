import React, { useState, useEffect } from 'react';
import { SectionHead } from '../../../components/common/SectionHead';
import { Btn } from '../../../components/common/Btn';
import { C } from '../../../constants/theme';
import { Plus, Edit2, Trash2, Search, CheckCircle2, XCircle } from 'lucide-react';

export function ManageServices() {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newService, setNewService] = useState({ name: '', department: '', fee: 0, status: 'active', service_id: '' });

  const fetchServices = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/services/`);
      const data = await res.json();
      setServices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      const serviceId = `SRV-${Math.floor(100 + Math.random() * 900)}`;
      await fetch(`http://127.0.0.1:8000/api/services/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newService, service_id: serviceId })
      });
      setIsModalOpen(false);
      setNewService({ name: '', department: '', fee: 0, status: 'active', service_id: '' });
      fetchServices();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (service_id) => {
    try {
      await fetch(`http://127.0.0.1:8000/api/services/${service_id}`, { method: 'DELETE' });
      fetchServices();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <SectionHead
        eyebrow="Service Management"
        title="Manage Government Services"
        sub="Create, update, and publish services available for investors to apply."
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Add New Service</h3>
            <form onSubmit={handleAddService} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Service Name</label>
                <input required type="text" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} className="w-full border-slate-200 rounded-lg p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                <input required type="text" value={newService.department} onChange={e => setNewService({...newService, department: e.target.value})} className="w-full border-slate-200 rounded-lg p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Base Fee (₹)</label>
                <input required type="number" value={newService.fee} onChange={e => setNewService({...newService, fee: parseFloat(e.target.value)})} className="w-full border-slate-200 rounded-lg p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select value={newService.status} onChange={e => setNewService({...newService, status: e.target.value})} className="w-full border-slate-200 rounded-lg p-2 border">
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <div className="flex gap-3 justify-end mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Cancel</button>
                <Btn type="submit">Save Service</Btn>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mt-8 bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50">
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search services..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <Btn onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto flex items-center gap-2">
            <Plus size={16} /> Add New Service
          </Btn>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">Loading services...</div>
          ) : services.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No services found. Add one above.</div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-100/50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Service ID</th>
                  <th className="px-6 py-4 font-medium">Service Name</th>
                  <th className="px-6 py-4 font-medium">Department</th>
                  <th className="px-6 py-4 font-medium">Base Fee</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {services.map(srv => (
                  <tr key={srv.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 font-mono text-slate-500">{srv.service_id}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{srv.name}</td>
                    <td className="px-6 py-4 text-slate-600">{srv.department}</td>
                    <td className="px-6 py-4 text-slate-600">₹{srv.fee.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      {srv.status === 'active' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={12} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          <XCircle size={12} /> Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors inline-flex">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(srv.service_id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors inline-flex ml-1">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
