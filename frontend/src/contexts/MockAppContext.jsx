import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  INITIAL_FACTORY_UNITS,
  INITIAL_COMPLIANCES,
  INITIAL_PAYMENTS,
  INITIAL_QUERIES,
  INITIAL_PUBLIC_CONSULTATIONS,
  INITIAL_SCHEMES,
  INITIAL_APPLICATIONS,
  INITIAL_DOCUMENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_FRAUD_ALERTS,
  INITIAL_USERS
} from '../data/mockData';

const MockAppContext = createContext();

export function useMockApp() {
  const context = useContext(MockAppContext);
  if (!context) {
    throw new Error('useMockApp must be used within a MockAppProvider');
  }
  return context;
}

export function MockAppProvider({ children }) {
  // We initialize the "database" from our mockData constants
  const [users, setUsers] = useState(INITIAL_USERS);
  const [factoryUnits, setFactoryUnits] = useState(INITIAL_FACTORY_UNITS);
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);
  const [applications, setApplications] = useState(INITIAL_APPLICATIONS);
  
  // Keep the rest of the mock collections static if they aren't meant to be updated interactively, 
  // but we can put them here for consistent access
  const [compliances] = useState(INITIAL_COMPLIANCES);
  const [payments] = useState(INITIAL_PAYMENTS);
  const [queries] = useState(INITIAL_QUERIES);
  const [consultations] = useState(INITIAL_PUBLIC_CONSULTATIONS);
  const [schemes] = useState(INITIAL_SCHEMES);
  const [auditLogs] = useState(INITIAL_AUDIT_LOGS);

  const simulateDelay = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));

  // --- Mutators (Simulating Backend Calls) ---

  const addFactoryUnit = useCallback(async (newUnit) => {
    await simulateDelay(1200); // simulate network request
    const unitWithId = {
      ...newUnit,
      id: `UNIT-MH-${Math.floor(100 + Math.random() * 900)}`
    };
    setFactoryUnits(prev => [unitWithId, ...prev]);
    return unitWithId;
  }, []);

  const addDocument = useCallback(async (newDoc) => {
    await simulateDelay(1500); // slightly longer for file upload simulation
    const docWithId = {
      ...newDoc,
      id: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
      uploadDate: new Date().toISOString().split('T')[0]
    };
    setDocuments(prev => [docWithId, ...prev]);
    return docWithId;
  }, []);

  const updateBusinessProfile = useCallback(async (userId, profileUpdates) => {
    await simulateDelay(800);
    setUsers(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        ...profileUpdates
      }
    }));
  }, []);

  const value = {
    // State
    users,
    factoryUnits,
    documents,
    applications,
    compliances,
    payments,
    queries,
    consultations,
    schemes,
    auditLogs,
    // Actions
    addFactoryUnit,
    addDocument,
    updateBusinessProfile,
  };

  return (
    <MockAppContext.Provider value={value}>
      {children}
    </MockAppContext.Provider>
  );
}
