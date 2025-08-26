const API_BASE = (process.env.REACT_APP_API_BASE || '/api').replace(/\/$/, '');

const ADMIN_TOKEN_KEY = 'portfolio_admin_token';
function readTokenFromUrl() {
  try {
    const u = new URL(window.location.href);
    const t = u.searchParams.get('token') || u.searchParams.get('admin_token') || '';
    if (t) {
      sessionStorage.setItem(ADMIN_TOKEN_KEY, t);
      u.searchParams.delete('token');
      u.searchParams.delete('admin_token');
      window.history.replaceState({}, '', u.toString());
    }
    return t;
  } catch {
    return '';
  }
}
function getAdminToken() {
  return sessionStorage.getItem(ADMIN_TOKEN_KEY) || readTokenFromUrl() || '';
}

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
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}${pathname}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Admin-Token': token },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PUT ${pathname} failed`);
  return res.json();
}

export async function apiDelete(pathname) {
  await ensureAllowedOrigin();
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}${pathname}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json', 'X-Admin-Token': token },
  });
  if (!res.ok) throw new Error(`DELETE ${pathname} failed`);
  return res.json().catch(() => ({}));
}

export async function apiUpload(files, params = {}) {
  await ensureAllowedOrigin();
  const token = getAdminToken();
  const fd = new FormData();
  (files || []).forEach((f) => fd.append('files', f));
  const qs = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    qs.set(k, String(v));
  });
  const url = `${API_BASE}/upload${qs.toString() ? `?${qs.toString()}` : ''}`;
  const res = await fetch(url, { method: 'POST', body: fd, headers: { 'X-Admin-Token': token } });
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
  validateAdmin: async () => {
    const token = getAdminToken();
    // Build URL robustly for both absolute and relative API_BASE
    let url = `${API_BASE}/admin/validate`;
    if (token) {
      const sep = url.includes('?') ? '&' : '?';
      url = `${url}${sep}token=${encodeURIComponent(token)}`;
    }
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error('Admin token invalid');
    return res.json();
  },
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
