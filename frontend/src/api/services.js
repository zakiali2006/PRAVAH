import api from './axios';

// ─── Business Profile ───────────────────────────────────────────────
export const businessProfileAPI = {
  get: () => api.get('/business-profile'),
  create: (data) => api.post('/business-profile', data),
  update: (data) => api.put('/business-profile', data),
};

// ─── Factory Units ──────────────────────────────────────────────────
export const factoryUnitAPI = {
  list: () => api.get('/factory-units'),
  get: (id) => api.get(`/factory-units/${id}`),
  create: (data) => api.post('/factory-units', data),
  update: (id, data) => api.put(`/factory-units/${id}`, data),
  remove: (id) => api.delete(`/factory-units/${id}`),
};

// ─── Service Catalogue ──────────────────────────────────────────────
export const serviceCatalogueAPI = {
  list: () => api.get('/services'),
};

// ─── Applications ───────────────────────────────────────────────────
export const applicationAPI = {
  list: () => api.get('/applications'),
  get: (id) => api.get(`/applications/${id}`),
  apply: (serviceId, data) => api.post(`/services/${serviceId}/apply`, data),
  track: (id) => api.get(`/applications/${id}/track`),
  transition: (id, data) => api.post(`/applications/${id}/transition`, data),
  pay: (id, data) => api.post(`/applications/${id}/pay`, data),
};

// ─── Wizard ─────────────────────────────────────────────────────────
export const wizardAPI = {
  createRun: (data) => api.post('/wizard/run', data),
  listRuns: () => api.get('/wizard/runs'),
  getRun: (id) => api.get(`/wizard/runs/${id}`),
  generateCAF: (runId) => api.post(`/wizard/runs/${runId}/generate-caf`),
};

// ─── CAF ────────────────────────────────────────────────────────────
export const cafAPI = {
  create: (data) => api.post('/caf', data),
  get: (id) => api.get(`/caf/${id}`),
  getServices: (id) => api.get(`/caf/${id}/services`),
};
