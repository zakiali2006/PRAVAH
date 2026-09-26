import React, { useState } from 'react';
import { Factory, Zap, Droplets, Plus, Building2, Loader2, AlertCircle } from 'lucide-react';
import { AddUnitModal } from '../components/AddUnitModal';
import { useFactoryUnits } from '../../../hooks/useFactoryUnits';
import { SectionHead } from '../../../components/common/SectionHead';
import { Btn } from '../../../components/common/Btn';
import { C } from '../../../constants/theme';

export const FactoryUnits = () => {
  const { units, loading, error, addUnit } = useFactoryUnits();
  const [showAddModal, setShowAddModal] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-saffron" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionHead
          eyebrow="MIDC Plots & Industrial Units Repository"
          title="Registered Factory Units & Land Parcels"
          sub="Manage your industrial establishments across MIDC estates in Maharashtra, land lease deeds, sanctioned utility loads, and pollution categorizations."
          icon={Factory}
        />

        <Btn
          onClick={() => setShowAddModal(true)}
          className="self-start sm:self-auto"
        >
          <Plus size={16} className="mr-2" />
          Register New Factory Unit
        </Btn>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3">
          <AlertCircle size={20} />
          <span className="font-medium text-sm">{error}</span>
        </div>
      )}

      {/* Units Grid */}
      {units.length === 0 ? (
        <div className="bg-white border border-dashed rounded-xl p-12 text-center flex flex-col items-center justify-center shadow-sm" style={{ borderColor: C.line }}>
          <div className="w-16 h-16 shadow-sm rounded-full flex items-center justify-center mb-4" style={{ background: C.bg, color: C.navyDeep }}>
            <Factory size={32} />
          </div>
          <h3 className="text-lg font-bold mb-2" style={{ color: C.navyDeep }}>No Factory Units Registered</h3>
          <p className="text-sm text-slate-500 max-w-sm mb-6">
            You haven't added any industrial units yet. Register your first factory or plot to begin applying for clearances.
          </p>
          <Btn onClick={() => setShowAddModal(true)} variant="outline">
            <Plus size={16} className="mr-2" />
            Add First Unit
          </Btn>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {units.map((unit: any) => {
            const isRed = unit.category === 'Red';
            const isOrange = unit.category === 'Orange';
            const isGreen = unit.category === 'Green';

            let categoryColor = 'bg-slate-100 text-slate-700 border-slate-200';
            let categoryGradient = 'from-slate-500 to-slate-400';
            if (isRed) {
              categoryColor = 'bg-red-50 text-red-700 border-red-200';
              categoryGradient = 'from-red-500 to-rose-400';
            } else if (isOrange) {
              categoryColor = 'bg-orange-50 text-orange-700 border-orange-200';
              categoryGradient = 'from-orange-500 to-amber-400';
            } else if (isGreen) {
              categoryColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
              categoryGradient = 'from-emerald-500 to-teal-400';
            }

            return (
              <div key={unit.id} className="group relative bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                {/* Top Category Gradient Band */}
                <div className={`h-2 w-full bg-gradient-to-r ${categoryGradient}`} />

                <div className="p-6">
                  <div className="flex justify-between items-start mb-5 gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-mono text-xs font-semibold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                          #{unit.id}
                        </span>
                        <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${categoryColor}`}>
                          {unit.category || 'Unknown'} Category
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 leading-tight truncate group-hover:text-blue-700 transition-colors" title={unit.unit_name}>
                        {unit.unit_name}
                      </h3>
                    </div>
                    <span className="shrink-0 bg-blue-50 text-blue-700 font-semibold text-xs px-2.5 py-1.5 rounded-lg border border-blue-100">
                      {unit.operational_status || 'Unknown'}
                    </span>
                  </div>

                  {/* Location Info Box */}
                  <div className="bg-slate-50/70 rounded-xl p-4 mb-5 border border-slate-100">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
                          <Building2 size={12} />
                          MIDC Estate
                        </div>
                        <p className="text-sm font-bold text-slate-800 truncate" title={unit.midc_area || 'N/A'}>{unit.midc_area || 'N/A'}</p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{unit.taluka}, {unit.district}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
                          <Factory size={12} />
                          Cadastral Plot & Survey
                        </div>
                        <p className="text-sm font-bold text-slate-800 truncate" title={unit.plot_number || 'N/A'}>{unit.plot_number || 'N/A'}</p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{unit.survey_number}</p>
                      </div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm hover:border-amber-200 transition-colors group/metric">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
                        <div className="bg-amber-50 p-1 rounded-md text-amber-500 group-hover/metric:bg-amber-100 transition-colors">
                          <Zap size={14} />
                        </div>
                        <span className="font-semibold">Power</span>
                      </div>
                      <p className="text-base font-extrabold text-slate-800">
                        {unit.power_sanctioned_kva || 0} <span className="text-xs font-semibold text-slate-400">kVA</span>
                      </p>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm hover:border-blue-200 transition-colors group/metric">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
                        <div className="bg-blue-50 p-1 rounded-md text-blue-500 group-hover/metric:bg-blue-100 transition-colors">
                          <Droplets size={14} />
                        </div>
                        <span className="font-semibold">Water</span>
                      </div>
                      <p className="text-base font-extrabold text-slate-800">
                        {unit.water_demand_kl || 0} <span className="text-xs font-semibold text-slate-400">KLD</span>
                      </p>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm hover:border-indigo-200 transition-colors group/metric">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
                        <div className="bg-indigo-50 p-1 rounded-md text-indigo-500 group-hover/metric:bg-indigo-100 transition-colors">
                          <Building2 size={14} />
                        </div>
                        <span className="font-semibold">Area</span>
                      </div>
                      <p className="text-base font-extrabold text-slate-800">
                        {((unit.built_up_area_sqm || 0) / 1000).toFixed(1)}k <span className="text-xs font-semibold text-slate-400">m²</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Unit Modal */}
      {showAddModal && (
        <AddUnitModal
          onClose={() => setShowAddModal(false)}
          onAdd={addUnit}
        />
      )}
    </div>
  );
};
