import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SectionHead } from '../../../components/common/SectionHead';
import { C } from '../../../constants/theme';
import { Building2, Plus, Factory, Loader2 } from 'lucide-react';
import { Btn } from '../../../components/common/Btn';
import { EditProfileModal } from '../components/EditProfileModal';
import { useAuth } from '../../../contexts/AuthContext';
import { businessProfileAPI, factoryUnitAPI } from '../../../api/services';

export function MyBusiness() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [factoryCount, setFactoryCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileRes, unitsRes] = await Promise.all([
        businessProfileAPI.get(),
        factoryUnitAPI.list(),
      ]);
      setProfile(profileRes.data.data);
      const units = unitsRes.data.data;
      setFactoryCount(Array.isArray(units) ? units.length : 0);
    } catch (err) {
      // 404 means no profile yet — that's OK
      if (err.response?.status === 404) {
        setProfile(null);
      } else {
        setError('Failed to load business data.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveProfile = async (formData) => {
    try {
      if (profile) {
        await businessProfileAPI.update(formData);
      } else {
        await businessProfileAPI.create(formData);
      }
      await fetchData();
    } catch (err) {
      console.error('Failed to save profile:', err);
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
    <div className="max-w-6xl mx-auto space-y-8">
      <SectionHead 
        eyebrow="Phase 1 & 2"
        title="My Business Profile" 
        sub="Manage your primary business entity and registered factory units here." 
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-sm flex flex-col h-full">
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-5 text-blue-600">
            <Building2 size={24} />
          </div>
          <h3 className="text-xl font-bold mb-1 text-slate-900">{profile?.company_name || 'No Profile Yet'}</h3>
          <p className="text-sm font-medium text-slate-500 mb-6">{profile?.industry || 'Set up your business profile'}</p>
          
          <div className="space-y-3 mb-8 flex-1">
            <div className="flex justify-between items-center pb-2 border-b border-slate-50">
              <span className="text-xs text-slate-400 font-bold">PAN NUMBER</span>
              <span className="text-sm font-mono font-bold text-slate-800">{profile?.pan_number || '—'}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-50">
              <span className="text-xs text-slate-400 font-bold">GSTIN</span>
              <span className="text-sm font-mono font-bold text-slate-800">{profile?.gstin || '—'}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-50">
              <span className="text-xs text-slate-400 font-bold">TOTAL INVESTMENT</span>
              <span className="text-sm font-bold text-slate-800">{profile?.investment_value || '—'}</span>
            </div>
          </div>

          <Btn variant="outline" className="w-full mt-auto" onClick={() => setShowEditModal(true)}>
            {profile ? 'Edit Profile' : 'Create Profile'}
          </Btn>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-sm border-dashed border-gray-300 flex flex-col h-full">
          <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center mb-5 text-orange-600">
            <Factory size={24} />
          </div>
          <h3 className="text-xl font-bold mb-1 text-slate-900">Factory Units ({factoryCount})</h3>
          <p className="text-sm text-gray-500 mb-6">You have {factoryCount} registered facilities. Register a new factory or plot to begin applying for site-specific clearances.</p>
          
          <div className="mt-auto space-y-3">
            <Btn className="w-full flex items-center justify-center gap-2" onClick={() => navigate('/app/factory')}>
               Manage Units
            </Btn>
          </div>
        </div>
      </div>

      {showEditModal && (
        <EditProfileModal 
          profile={profile} 
          onClose={() => setShowEditModal(false)} 
          onSave={handleSaveProfile} 
        />
      )}
    </div>
  );
}
