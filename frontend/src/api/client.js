import axios from 'axios';

// Ensure this points to your FastAPI backend port
const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
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
