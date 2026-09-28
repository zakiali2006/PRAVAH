import axios from 'axios';

// Ensure this points to your FastAPI backend port
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor for attaching Auth tokens if needed in the future
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;

export const uploadDocumentAPI = async (file, documentTypeId = 1, metadata = null) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('document_type_id', documentTypeId);
  if (metadata) {
    formData.append('metadata', metadata);
  }
  
  const token = localStorage.getItem('token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch('http://localhost:8000/api/documents/upload', {
    method: 'POST',
    headers,
    body: formData,
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Document upload failed');
  }
  return response.json();
};

export const validateDocumentAPI = async (documentId) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`http://localhost:8000/api/documents/${documentId}/validate`, {
    method: 'POST',
    headers,
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Document validation failed');
  }
  return response.json();
};

export const getMyBusinessProfile = async () => {
  const response = await apiClient.get('/business-profile/me');
  return response.data;
};

export const createBusinessProfile = async (data) => {
  const response = await apiClient.post('/business-profile/', data);
  return response.data;
};

export const getMyApplications = async () => {
  const response = await apiClient.get('/applications/me');
  return response.data;
};

export const createApplication = async (data) => {
  const response = await apiClient.post('/applications/', data);
  return response.data;
};

export const deleteApplicationAPI = async (id) => {
  const response = await apiClient.delete(`/applications/${id}`);
  return response.data;
};

export const getOfficerQueue = async () => {
  const response = await apiClient.get('/officer/queue');
  return response.data;
};

export const updateApplicationStatus = async (id, status, remarks) => {
  const response = await apiClient.post(`/officer/applications/${id}/status`, { status, remarks });
  return response.data;
};

export const updateBusinessProfile = async (data) => {
  const response = await apiClient.put('/business-profile/', data);
  return response.data;
};

export const trackApplication = async (id) => {
  const response = await apiClient.get(`/applications/${id}/track`);
  return response.data;
};

export const getApplicationRisk = async (id) => {
  const response = await apiClient.get(`/applications/${id}/risk`);
  return response.data;
};

export const recalculateApplicationRisk = async (id) => {
  const response = await apiClient.post(`/officer/applications/${id}/recalculate-risk`);
  return response.data;
};

export const getFactoryUnits = async () => {
  const response = await apiClient.get('/business-profile/units');
  return response.data;
};

export const createFactoryUnit = async (data) => {
  const response = await apiClient.post('/business-profile/units', data);
  return response.data;
};

export const getMyDocuments = async () => {
  const response = await apiClient.get('/documents');
  return response.data;
};

export const syncDigiLockerAPI = async () => {
  const response = await apiClient.post('/documents/digilocker/sync');
  return response.data;
};

export const saveToVaultAPI = async (documentId) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`http://localhost:8000/api/documents/${documentId}/save_to_vault`, {
    method: 'POST',
    headers,
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Saving to vault failed');
  }
  return response.json();
};

export const deleteDocumentAPI = async (documentId) => {
  const response = await apiClient.delete(`/documents/${documentId}`);
  return response.data;
};
