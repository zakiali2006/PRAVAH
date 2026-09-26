import React, { useState } from 'react';
import { SectionHead } from '../../../components/common/SectionHead';
import { Btn } from '../../../components/common/Btn';
import { Settings2, GitMerge, FileCheck, Layers, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export function ConfigureWorkflows() {
  const [selectedService, setSelectedService] = useState('SRV-001');

  const stages = [
    { id: 1, name: 'Document Verification', type: 'automated', actor: 'AI OCR Engine', mandatory: true },
    { id: 2, name: 'Department Scrutiny', type: 'manual', actor: 'Review Officer', mandatory: true },
    { id: 3, name: 'Site Inspection', type: 'manual', actor: 'Field Inspector', mandatory: false },
    { id: 4, name: 'Final Approval', type: 'manual', actor: 'Director', mandatory: true },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <SectionHead
        eyebrow="Workflow Configuration"
        title="Configure Approval Stages"
        sub="Define the sequential stages, AI checks, and officer assignments for each service."
      />

      <div className="mt-8 flex flex-col lg:flex-row gap-6">
        
        {/* Left: Service Selector */}
        <div className="w-full lg:w-1/3 space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Layers size={18} className="text-blue-600" /> Select Service
            </h3>
            <div className="space-y-2">
              {[
                { id: 'SRV-001', name: 'Factory Licence' },
                { id: 'SRV-002', name: 'Environmental Clearance' },
                { id: 'SRV-003', name: 'Fire NOC' },
              ].map(srv => (
                <button
                  key={srv.id}
                  onClick={() => setSelectedService(srv.id)}
                  className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${
                    selectedService === srv.id 
                      ? 'border-blue-500 bg-blue-50 text-blue-900 font-semibold ring-1 ring-blue-500' 
                      : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {srv.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Stage Builder */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[500px]">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                <GitMerge size={20} className="text-blue-600" /> 
                Approval Pipeline
              </h3>
              <Btn variant="outline" className="text-xs py-1.5 h-auto">
                <Plus size={14} className="mr-1" /> Add Stage
              </Btn>
            </div>

            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-200" />

              <div className="space-y-6 relative">
                {stages.map((stage, idx) => (
                  <motion.div 
                    key={stage.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex gap-4 items-start group"
                  >
                    <div className="w-12 h-12 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center shrink-0 z-10 group-hover:border-blue-400 transition-colors">
                      <span className="text-slate-500 font-bold">{idx + 1}</span>
                    </div>
                    
                    <div className="flex-1 bg-slate-50 rounded-lg p-4 border border-slate-200 group-hover:border-blue-200 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-slate-800">{stage.name}</h4>
                        {stage.type === 'automated' ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 px-2 py-0.5 rounded">AI Automated</span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-2 py-0.5 rounded">Manual Review</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <FileCheck size={14} /> Assigned to: {stage.actor}
                        </span>
                        <span className="flex items-center gap-1">
                          <Settings2 size={14} /> {stage.mandatory ? 'Mandatory' : 'Optional'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <Btn>Save Pipeline</Btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
