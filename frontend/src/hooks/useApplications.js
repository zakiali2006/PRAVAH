import { useState, useEffect, useCallback } from 'react';
import { getMyApplications, createApplication, trackApplication, getOfficerQueue, updateApplicationStatus } from '../api/client';

export const useApplications = (isOfficer = false) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = isOfficer ? await getOfficerQueue() : await getMyApplications();
      setApplications(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  }, [isOfficer]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const create = async (appData) => {
    setLoading(true);
    try {
      const newApp = await createApplication(appData);
      setApplications(prev => [...prev, newApp]);
      return newApp;
    } catch (err) {
      setError(err.message || 'Failed to create application');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status, remarks) => {
    setLoading(true);
    try {
      const updatedApp = await updateApplicationStatus(id, status, remarks);
      // Update local state
      setApplications(prev => prev.map(app => app.id === id ? updatedApp : app));
      return updatedApp;
    } catch (err) {
      setError(err.message || 'Failed to update application status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { applications, loading, error, create, updateStatus, refresh: fetchApplications };
};

export const useApplicationTracking = (applicationId) => {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTracking = useCallback(async () => {
    if (!applicationId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await trackApplication(applicationId);
      setApplication(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch tracking details');
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    fetchTracking();
  }, [fetchTracking]);

  return { application, loading, error, refresh: fetchTracking };
};
