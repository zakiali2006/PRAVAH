import { useState, useEffect, useCallback } from 'react';
import { getFactoryUnits, createFactoryUnit } from '../api/client';
import { useBusinessProfile } from './useBusinessProfile';

export const useFactoryUnits = () => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // We need the business profile to fetch units, although the backend uses the user ID
  // It's good to ensure the user has a profile.
  const { profile } = useBusinessProfile();

  const fetchUnits = useCallback(async () => {
    // If no profile, we can't have units.
    if (!profile) {
      setUnits([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const data = await getFactoryUnits();
      setUnits(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch factory units');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  const addUnit = async (unitData) => {
    setLoading(true);
    try {
      // Map camelCase to snake_case for the backend
      const payload = {
        unit_name: unitData.unitName,
        category: unitData.category,
        operational_status: unitData.operationalStatus,
        midc_area: unitData.midcArea,
        taluka: unitData.taluka,
        district: unitData.district,
        plot_number: unitData.plotNumber,
        survey_number: unitData.surveyNumber,
        power_sanctioned_kva: unitData.powerSanctionedKva,
        water_demand_kl: unitData.waterDemandKl,
        built_up_area_sqm: unitData.builtUpAreaSqM
      };
      
      const newUnit = await createFactoryUnit(payload);
      
      // We'll just map it back to camelCase for the frontend State,
      // or we can just refresh the list. Let's refresh.
      await fetchUnits();
      
      return newUnit;
    } catch (err) {
      setError(err.message || 'Failed to add factory unit');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { units, loading, error, addUnit, refresh: fetchUnits };
};
