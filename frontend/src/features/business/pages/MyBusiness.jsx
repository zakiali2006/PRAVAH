import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SectionHead } from '../../../components/common/SectionHead';
import { C } from '../../../constants/theme';
import { Building2, Plus, Factory } from 'lucide-react';
import { Btn } from '../../../components/common/Btn';
import { useMockApp } from '../../../contexts/MockAppContext';
import { EditProfileModal } from '../components/EditProfileModal';
import { useAuth } from '../../../contexts/AuthContext';

export function MyBusiness() {
  const navigate = useNavigate();
  const { users, updateBusinessProfile, factoryUnits } = useMockApp();
  const { currentUser } = useAuth();
  
  // For demo, we assume the user is 'user_1'
  const userId = 'user_1';
  const profile = users[userId];
  
  const [showEditModal, setShowEditModal] = useState(false);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <SectionHead 
        eyebrow="Phase 1 & 2"
        title="My Business Profile" 
        sub="Manage your primary business entity and registered factory units here." 
      />

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-sm flex flex-col h-full">
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-5 text-blue-600">
            <Building2 size={24} />
          </div>
          <h3 className="text-xl font-bold mb-1 text-slate-900">{profile?.name || 'Primary Entity'}</h3>
          <p className="text-sm font-medium text-slate-500 mb-6">{profile?.industry}</p>
          
          <div className="space-y-3 mb-8 flex-1">
            <div className="flex justify-between items-center pb-2 border-b border-slate-50">
              <span className="text-xs text-slate-400 font-bold">PAN NUMBER</span>
              <span className="text-sm font-mono font-bold text-slate-800">{profile?.panNumber}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-50">
              <span className="text-xs text-slate-400 font-bold">GSTIN</span>
              <span className="text-sm font-mono font-bold text-slate-800">{profile?.gstin}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-50">
              <span className="text-xs text-slate-400 font-bold">TOTAL INVESTMENT</span>
              <span className="text-sm font-bold text-slate-800">{profile?.investment}</span>
            </div>
          </div>

          <Btn variant="outline" className="w-full mt-auto" onClick={() => setShowEditModal(true)}>
            Edit Profile
          </Btn>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-sm border-dashed border-gray-300 flex flex-col h-full">
          <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center mb-5 text-orange-600">
            <Factory size={24} />
          </div>
          <h3 className="text-xl font-bold mb-1 text-slate-900">Factory Units ({factoryUnits.length})</h3>
          <p className="text-sm text-gray-500 mb-6">You have {factoryUnits.length} registered facilities. Register a new factory or plot to begin applying for site-specific clearances.</p>
          
          <div className="mt-auto space-y-3">
            <Btn className="w-full flex items-center justify-center gap-2" onClick={() => navigate('/factory')}>
               Manage Units
            </Btn>
          </div>
        </div>
      </div>

      {showEditModal && (
        <EditProfileModal 
          profile={profile} 
          onClose={() => setShowEditModal(false)} 
          onSave={updateBusinessProfile} 
        />
      )}
    </div>
  );
}
