import React, { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { Btn } from '../../../components/common/Btn';
import { C, inputCls, inputStyle } from '../../../constants/theme';

export const AddUnitModal = ({ onClose, onAdd }: { onClose: () => void, onAdd: (unit: any) => Promise<void> | void }) => {
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API network request via context
    await onAdd(newUnit);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white max-w-xl w-full rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <div className="px-6 py-4 flex justify-between items-center bg-slate-50 border-b" style={{ borderColor: C.line }}>
          <h3 className="font-bold text-lg" style={{ color: C.navyDeep }}>Register New Industrial Unit</h3>
          <button onClick={onClose} disabled={loading} className="text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-50">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleCreate} className="p-6 space-y-5 flex-1 overflow-y-auto">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Unit / Plant Name</label>
            <input
              type="text"
              placeholder="e.g. Pune Battery Packaging Facility"
              value={newUnit.unitName}
              onChange={(e) => setNewUnit({ ...newUnit, unitName: e.target.value })}
              className={inputCls}
              style={inputStyle}
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">MIDC Industrial Estate</label>
              <input
                type="text"
                value={newUnit.midcArea}
                onChange={(e) => setNewUnit({ ...newUnit, midcArea: e.target.value })}
                className={inputCls}
                style={inputStyle}
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Plot Number</label>
              <input
                type="text"
                placeholder="e.g. Plot F-12"
                value={newUnit.plotNumber}
                onChange={(e) => setNewUnit({ ...newUnit, plotNumber: e.target.value })}
                className={inputCls}
                style={inputStyle}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Survey / Gut Number</label>
              <input
                type="text"
                placeholder="e.g. Survey 210/1"
                value={newUnit.surveyNumber}
                onChange={(e) => setNewUnit({ ...newUnit, surveyNumber: e.target.value })}
                className={inputCls}
                style={inputStyle}
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Pollution Category</label>
              <select
                value={newUnit.category}
                onChange={(e) => setNewUnit({ ...newUnit, category: e.target.value  })}
                className={inputCls}
                style={inputStyle}
                disabled={loading}
              >
                <option value="Red">Red (Heavy)</option>
                <option value="Orange">Orange (Moderate)</option>
                <option value="Green">Green (Low)</option>
                <option value="White">White (Zero)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Power Sanctioned (kVA)</label>
              <input
                type="number"
                value={newUnit.powerSanctionedKva}
                onChange={(e) => setNewUnit({ ...newUnit, powerSanctionedKva: Number(e.target.value) })}
                className={inputCls}
                style={inputStyle}
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Water Demand (KLD)</label>
              <input
                type="number"
                value={newUnit.waterDemandKl}
                onChange={(e) => setNewUnit({ ...newUnit, waterDemandKl: Number(e.target.value) })}
                className={inputCls}
                style={inputStyle}
                disabled={loading}
              />
            </div>
          </div>

          <div className="pt-4 mt-2 border-t flex items-center justify-end space-x-3" style={{ borderColor: C.line }}>
            <Btn
              variant="outline"
              type="button"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Btn>
            <Btn
              type="submit"
              disabled={loading}
            >
              {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
              {loading ? 'Registering...' : 'Save Unit'}
            </Btn>
          </div>
        </form>
      </div>
    </div>
  );
};
