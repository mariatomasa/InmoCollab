const API_URL = import.meta.env.VITE_API_URL || '';

function getHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('token');
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}/api${path}`, {
    headers: getHeaders(),
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error');
  return data;
}

export const api = {
  // Auth
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  me: () => request('/auth/me'),
  signLegal: () => request('/auth/sign-legal', { method: 'POST' }),

  // Properties
  getProperties: (params) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/properties${qs ? '?' + qs : ''}`);
  },
  getProperty: (id) => request(`/properties/${id}`),
  getFilters: () => request('/properties/meta/filters'),

  // Clients
  getClients: () => request('/clients'),
  registerClient: (data) => request('/clients', { method: 'POST', body: JSON.stringify(data) }),
  verifyClient: (id, status) => request(`/clients/${id}/verify`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Visits
  getVisits: () => request('/visits'),
  requestVisit: (data) => request('/visits', { method: 'POST', body: JSON.stringify(data) }),
  updateVisitStatus: (id, status) => request(`/visits/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Activity
  getActivity: () => request('/activity'),

  // Contact
  sendContact: (data) => request('/contact', { method: 'POST', body: JSON.stringify(data) }),

  // Pipeline
  getPipeline: (stage) => {
    const qs = stage ? `?stage=${stage}` : '';
    return request(`/pipeline${qs}`);
  },
  getPipelineSummary: () => request('/pipeline/summary'),
  getPipelineDetail: (id) => request(`/pipeline/${id}`),
  updatePipelineStage: (id, stage, note) => request(`/pipeline/${id}/stage`, { method: 'PATCH', body: JSON.stringify({ stage, note }) }),
  addPipelineNote: (id, note) => request(`/pipeline/${id}/note`, { method: 'POST', body: JSON.stringify({ note }) }),
};
