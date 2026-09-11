import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

export const AddUnitModal = ({ onClose, onAdd }) => {
  const [loading, setLoading] = useState(false);
  const [newUnit, setNewUnit] = useState({
    unitName: '',
    midcArea: 'Chakan Industrial Phase II',
    plotNumber: '',
    surveyNumber: '',
    taluka: 'Khed',
    district: 'Pune',
    category: 'Orange',
    powerSanctionedKva: 1500,
    waterDemandKl: 50,
    builtUpAreaSqM: 12000,
    operationalStatus: 'Under Construction'
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API network request via context
    await onAdd(newUnit);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <h3 className="font-extrabold text-base text-slate-900">Register New Industrial Unit</h3>
          <button onClick={onClose} disabled={loading} className="text-slate-400 hover:text-slate-600 disabled:opacity-50">✕</button>
        </div>

        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Unit / Plant Name</label>
            <input
              type="text"
              placeholder="e.g. Pune Battery Packaging Facility"
              value={newUnit.unitName}
              onChange={(e) => setNewUnit({ ...newUnit, unitName: e.target.value })}
              className="w-full border border-slate-300 rounded-xl p-3 bg-white font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">MIDC Industrial Estate</label>
              <input
                type="text"
                value={newUnit.midcArea}
                onChange={(e) => setNewUnit({ ...newUnit, midcArea: e.target.value })}
                className="w-full border border-slate-300 rounded-xl p-3 bg-white font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Plot Number</label>
              <input
                type="text"
                placeholder="e.g. Plot F-12"
                value={newUnit.plotNumber}
                onChange={(e) => setNewUnit({ ...newUnit, plotNumber: e.target.value })}
                className="w-full border border-slate-300 rounded-xl p-3 bg-white font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Survey / Gut Number</label>
              <input
                type="text"
                placeholder="e.g. Survey 210/1"
                value={newUnit.surveyNumber}
                onChange={(e) => setNewUnit({ ...newUnit, surveyNumber: e.target.value })}
                className="w-full border border-slate-300 rounded-xl p-3 bg-white font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Pollution Category</label>
              <select
                value={newUnit.category}
                onChange={(e) => setNewUnit({ ...newUnit, category: e.target.value  })}
                className="w-full border border-slate-300 rounded-xl p-3 bg-white font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                disabled={loading}
              >
                <option value="Red">Red (Heavy)</option>
                <option value="Orange">Orange (Moderate)</option>
                <option value="Green">Green (Low)</option>
                <option value="White">White (Zero)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Power Sanctioned (kVA)</label>
              <input
                type="number"
                value={newUnit.powerSanctionedKva}
                onChange={(e) => setNewUnit({ ...newUnit, powerSanctionedKva: Number(e.target.value) })}
                className="w-full border border-slate-300 rounded-xl p-3 bg-white font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Water Demand (KLD)</label>
              <input
                type="number"
                value={newUnit.waterDemandKl}
                onChange={(e) => setNewUnit({ ...newUnit, waterDemandKl: Number(e.target.value) })}
                className="w-full border border-slate-300 rounded-xl p-3 bg-white font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                disabled={loading}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-lg shadow-sm transition-all flex items-center justify-center min-w-[140px] disabled:opacity-80"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Registering...
                </>
              ) : (
                'Save Unit'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
