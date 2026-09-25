import { useState, useEffect, useCallback } from 'react';
import { getMyBusinessProfile, createBusinessProfile, updateBusinessProfile } from '../api/client';

export const useBusinessProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyBusinessProfile();
      setProfile(data);
    } catch (err) {
      if (err.response?.status === 404) {
        setProfile(null); // No profile exists yet
      } else {
        setError(err.message || 'Failed to fetch business profile');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const create = async (profileData) => {
    setLoading(true);
    try {
      const newProfile = await createBusinessProfile(profileData);
      setProfile(newProfile);
      return newProfile;
    } catch (err) {
      setError(err.message || 'Failed to create business profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const update = async (profileData) => {
    setLoading(true);
    try {
      const updatedProfile = await updateBusinessProfile(profileData);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      setError(err.message || 'Failed to update business profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { profile, loading, error, create, update, refresh: fetchProfile };
};
