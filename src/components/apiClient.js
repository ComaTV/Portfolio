// Centralized API client for backend requests
// Uses REACT_APP_API_BASE or defaults to http://localhost:5000

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

// Internal cache for /health response
let __healthCache = null;

export async function loadHealth() {
  if (__healthCache) return __healthCache;
  try {
    const res = await fetch(`${API_BASE}/health`, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error('health failed');
    const json = await res.json();
    __healthCache = json || { status: 'ok', allowedOrigins: [] };
  } catch {
    __healthCache = { status: 'ok', allowedOrigins: [] };
  }
  return __healthCache;
}

export async function ensureAllowedOrigin() {
  const { allowedOrigins = [] } = await loadHealth();
  const here = window.location.origin.replace(/\/$/, '');
  const list = (Array.isArray(allowedOrigins) ? allowedOrigins : [])
    .map((s) => String(s || '').replace(/\/$/, ''))
    .filter(Boolean);
  if (list.length && !list.includes(here)) {
    throw new Error('Forbidden origin');
  }
}

export async function apiGet(pathname) {
  await ensureAllowedOrigin();
  const res = await fetch(`${API_BASE}${pathname}`, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`GET ${pathname} failed`);
  return res.json();
}

export async function apiPut(pathname, body) {
  await ensureAllowedOrigin();
  const res = await fetch(`${API_BASE}${pathname}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PUT ${pathname} failed`);
  return res.json();
}

export async function apiDelete(pathname) {
  await ensureAllowedOrigin();
  const res = await fetch(`${API_BASE}${pathname}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`DELETE ${pathname} failed`);
  return res.json().catch(() => ({}));
}

export async function apiUpload(files, params = {}) {
  await ensureAllowedOrigin();
  const fd = new FormData();
  (files || []).forEach((f) => fd.append('files', f));
  const qs = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    qs.set(k, String(v));
  });
  const url = `${API_BASE}/upload${qs.toString() ? `?${qs.toString()}` : ''}`;
  const res = await fetch(url, { method: 'POST', body: fd });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
}

// Convenience endpoint wrappers
export const Api = {
  API_BASE,
  // health
  loadHealth,
  ensureAllowedOrigin,
  // generic
  get: apiGet,
  put: apiPut,
  del: apiDelete,
  upload: apiUpload,
  // specific
  getProjects: () => apiGet('/projects'),
  getCollaborators: () => apiGet('/collaborators'),
  getProfile: () => apiGet('/profile'),
  saveProjects: (projects) => apiPut('/projects', projects),
  saveCollaborators: (collaborators) => apiPut('/collaborators', collaborators),
  saveProfile: (profile) => apiPut('/profile', profile),
  deleteProject: (id) => apiDelete(`/projects/${encodeURIComponent(String(id))}`),
  deleteCollaborator: (id) => apiDelete(`/collaborators/${encodeURIComponent(String(id))}`),
  deleteCollaboratorMedia: (id, pos) => apiDelete(`/collaborators/${encodeURIComponent(String(id))}/media/${encodeURIComponent(String(pos))}`),
};

export function toServerUrl(u) {
  if (!u) return '';
  if (u.startsWith('http://') || u.startsWith('https://')) return u;
  if (u.startsWith('/uploads/')) return `${API_BASE}${u}`;
  return u;
}

// For frontend public assets: ensure correct resolution from any route
// - If it's an upload path, prefix with API_BASE (same as toServerUrl)
// - If it's a relative public asset like 'techno/x.webp', add leading '/'
export function toPublicUrl(u) {
  if (!u) return '';
  if (u.startsWith('http://') || u.startsWith('https://')) return u;
  if (u.startsWith('/uploads/')) return `${API_BASE}${u}`;
  if (!u.startsWith('/')) return `/${u}`;
  return u;
}
