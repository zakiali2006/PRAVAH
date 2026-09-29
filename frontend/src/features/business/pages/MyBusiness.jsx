import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SectionHead } from '../../../components/common/SectionHead';
import { C } from '../../../constants/theme';
import { Building2, Plus, Factory, Loader } from 'lucide-react';
import { Btn } from '../../../components/common/Btn';
import { useBusinessProfile } from '../../../hooks/useBusinessProfile';
import { EditProfileModal } from '../components/EditProfileModal';
import { useAuth } from '../../../contexts/AuthContext';

export function MyBusiness() {
  const navigate = useNavigate();
  const { profile, loading, update, create } = useBusinessProfile();
  const { currentUser } = useAuth();
  
  const [showEditModal, setShowEditModal] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  const handleSave = async (profileData) => {
    if (profile) {
      await update(profileData);
    } else {
      await create(profileData);
    }
    setShowEditModal(false);
  };

  return (
    <div className="space-y-8 w-full max-w-none">
      <SectionHead 
        eyebrow="Phase 1 & 2"
        title="My Business Profile" 
        sub="Manage your primary business entity and registered factory units here." 
      />

      {!profile ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center max-w-2xl mx-auto shadow-sm mt-8">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
            <Building2 size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-3">Welcome to PRAVAH</h2>
          <p className="text-slate-500 mb-8 max-w-md">
            To start applying for industrial clearances and register factory units, you need to set up your business profile first.
          </p>
          <Btn onClick={() => setShowEditModal(true)} className="px-8 py-3 text-sm font-bold flex items-center gap-2">
            <Plus size={18} />
            Setup Business Profile
          </Btn>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-5 text-blue-600">
              <Building2 size={24} />
            </div>
            <h3 className="text-xl font-bold mb-1 text-slate-900">{profile.company_name}</h3>
            <p className="text-sm font-medium text-slate-500 mb-6">{profile.industry_sector}</p>
            
            <div className="space-y-3 mb-8 flex-1">
              <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                <span className="text-xs text-slate-400 font-bold">PAN NUMBER</span>
                <span className="text-sm font-mono font-bold text-slate-800">{profile.pan_number || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                <span className="text-xs text-slate-400 font-bold">GSTIN</span>
                <span className="text-sm font-mono font-bold text-slate-800">{profile.gstin || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                <span className="text-xs text-slate-400 font-bold">CIN NUMBER</span>
                <span className="text-sm font-mono font-bold text-slate-800">{profile.cin_number || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                <span className="text-xs text-slate-400 font-bold">INCORPORATED</span>
                <span className="text-sm font-bold text-slate-800">{profile.date_of_incorporation || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                <span className="text-xs text-slate-400 font-bold">REG. TYPE</span>
                <span className="text-sm font-bold text-slate-800">{profile.registration_type || 'N/A'}</span>
              </div>
            </div>

            <Btn variant="outline" className="w-full mt-auto" onClick={() => setShowEditModal(true)}>
              Edit Profile
            </Btn>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-xl border border-dashed border-slate-300 shadow-sm hover:border-blue-400 hover:shadow-md transition-all flex flex-col h-full group">
            <div className="w-12 h-12 bg-orange-50 group-hover:bg-blue-50 transition-colors rounded-lg flex items-center justify-center mb-5 text-orange-600 group-hover:text-blue-600">
              <Factory size={24} />
            </div>
            <h3 className="text-xl font-bold mb-1 text-slate-900">Factory Units</h3>
            <p className="text-sm text-gray-500 mb-6">Register a new factory or plot to begin applying for site-specific clearances.</p>
            
            <div className="mt-auto space-y-3">
              <Btn className="w-full flex items-center justify-center gap-2 group-hover:bg-blue-700 transition-colors" onClick={() => navigate('/factory')}>
                Manage Units
              </Btn>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <EditProfileModal 
          profile={profile} 
          onClose={() => setShowEditModal(false)} 
          onSave={handleSave} 
        />
      )}
    </div>
  );
}
