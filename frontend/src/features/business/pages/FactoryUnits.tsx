import React, { useState, useEffect } from 'react';
import { Factory, Zap, Droplets, Plus, Building2, Loader2 } from 'lucide-react';
import { factoryUnitAPI, businessProfileAPI } from '../../../api/services';
import { AddUnitModal } from '../components/AddUnitModal';

export const FactoryUnits = () => {
  const [factoryUnits, setFactoryUnits] = useState([]);
  const [businessProfileId, setBusinessProfileId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [unitsRes, profileRes] = await Promise.all([
        factoryUnitAPI.list(),
        businessProfileAPI.get(),
      ]);
      setFactoryUnits(unitsRes.data.data || []);
      setBusinessProfileId(profileRes.data.data?.id || null);
    } catch (err) {
      if (err.response?.status !== 404) {
        setError('Failed to load factory units.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddUnit = async (unitData) => {
    if (!businessProfileId) {
      alert('Please create a business profile first.');
      return;
    }
    const payload = {
      unit_name: unitData.unitName,
      category: unitData.category,
      power_sanctioned_kva: unitData.powerSanctionedKva,
      water_demand_kl: unitData.waterDemandKl,
      built_up_area_sqm: unitData.builtUpAreaSqM,
      operational_status: unitData.operationalStatus,
      business_profile_id: businessProfileId,
      midc_plot: {
        midc_area: unitData.midcArea,
        plot_number: unitData.plotNumber,
        survey_number: unitData.surveyNumber,
        taluka: unitData.taluka,
        district: unitData.district,
      },
    };
    await factoryUnitAPI.create(payload);
    await fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Factory size={16} />
            <span>MIDC Plots & Industrial Units Repository</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">Registered Factory Units & Land Parcels</h2>
          <p className="text-slate-600 text-xs mt-1">
            Manage your industrial establishments across MIDC estates in Maharashtra, land lease deeds, sanctioned utility loads, and pollution categorizations.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl transition-all shadow flex items-center space-x-2 self-start md:self-auto"
        >
          <Plus size={16} />
          <span>Register New Factory Unit</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {factoryUnits.length === 0 && !error && (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center">
          <Factory size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-600 mb-2">No Factory Units Registered</h3>
          <p className="text-sm text-slate-400">Click "Register New Factory Unit" to add your first unit.</p>
        </div>
      )}

      {/* Units Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {factoryUnits.map((unit) => {
          const isRed = unit.category === 'Red';
          const isOrange = unit.category === 'Orange';
          const plot = unit.midc_plot || {};

          return (
            <div key={unit.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all space-y-4">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-slate-400">#{unit.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      isRed ? 'bg-red-100 text-red-800' : isOrange ? 'bg-orange-100 text-orange-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {unit.category || 'N/A'} Category
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 mt-1">{unit.unit_name}</h3>
                </div>

                <span className="bg-slate-100 text-slate-800 font-bold text-[10px] px-2.5 py-1 rounded-lg">
                  {unit.operational_status || 'N/A'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] font-bold">MIDC Estate</span>
                  <span className="font-bold text-slate-800">{plot.midc_area || '—'}</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">{plot.taluka || '—'}, {plot.district || '—'}</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] font-bold">Cadastral Plot & Survey</span>
                  <span className="font-bold text-blue-700">{plot.plot_number || '—'}</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">{plot.survey_number || '—'}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-100">
                  <Zap size={14} className="mx-auto text-amber-500 mb-1" />
                  <span className="text-[10px] text-slate-500 block">Sanctioned Power</span>
                  <span className="text-slate-900">{unit.power_sanctioned_kva || 0} kVA</span>
                </div>

                <div className="p-2.5 bg-sky-50/60 rounded-xl border border-sky-100">
                  <Droplets size={14} className="mx-auto text-sky-500 mb-1" />
                  <span className="text-[10px] text-slate-500 block">Water Quota</span>
                  <span className="text-slate-900">{unit.water_demand_kl || 0} KLD</span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <Building2 size={14} className="mx-auto text-slate-500 mb-1" />
                  <span className="text-[10px] text-slate-500 block">Built-up Area</span>
                  <span className="text-slate-900">{(unit.built_up_area_sqm || 0).toLocaleString()} m²</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Unit Modal */}
      {showAddModal && (
        <AddUnitModal 
          onClose={() => setShowAddModal(false)} 
          onAdd={handleAddUnit} 
        />
      )}
    </div>
  );
};
