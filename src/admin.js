import './admin.css';

const icons = {
  grid: '<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  folder: '<path d="M3 6h7l2 2h9v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Z"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.1A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h.1A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.1A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.15.36.35.7.6 1 .3.3.7.4 1.1.4h.1v4h-.1c-.4 0-.8.1-1.1.4-.25.3-.45.64-.6 1Z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  edit: '<path d="m4 20 4.5-1 10-10-3.5-3.5-10 10L4 20ZM13.5 7l3.5 3.5"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6"/>',
  refresh: '<path d="M20 7v5h-5M4 17v-5h5M6.1 9a7 7 0 0 1 11.2-2.2L20 9M4 15l2.7 2.2A7 7 0 0 0 17.9 15"/>',
  external: '<path d="M15 4h5v5M10 14 20 4M20 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5M5 20h14"/>',
  logout: '<path d="M10 17l5-5-5-5M15 12H3M15 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4"/>',
};

const icon = (name, size = 18) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
const escapeHTML = (value = '') => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
const parseLines = (value = '') => value.split('\n').map((item) => item.trim()).filter(Boolean);
const pairsToText = (items = [], key = 'url') => items.map((item) => `${item.name || ''} | ${item[key] || ''}`).join('\n');
const textToPairs = (value, key = 'url') => parseLines(value).map((line) => {
  const [name, ...rest] = line.split('|');
  return { name: name.trim(), [key]: rest.join('|').trim() };
}).filter((item) => item.name && item[key]);
const tagsToText = (items = []) => items.map((item) => item.name || item).join(', ');
const textToTags = (value) => value.split(',').map((name) => name.trim()).filter(Boolean).map((name) => ({ name, color: 'blue' }));

const state = {
  apiBase: '/api',
  token: '',
  connected: false,
  active: 'dashboard',
  profile: {},
  projects: [],
  collaborators: [],
  editing: null,
  search: '',
};

const root = document.querySelector('#admin-app');

const normalizeBase = (value) => value.trim().replace(/\/+$/, '');
const apiUrl = (path) => `${state.apiBase}${path}`;
const getStoredApiBase = () => {
  const stored = localStorage.getItem('comatv-admin-api');
  if (!stored) return '/api';
  try {
    const url = new URL(stored, location.origin);
    if (url.origin === location.origin && (url.pathname === '/' || url.pathname === '/admin')) {
      localStorage.removeItem('comatv-admin-api');
      return '/api';
    }
  } catch {
    return '/api';
  }
  return stored;
};

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (state.token) headers.set('x-admin-token', state.token);
  if (!(options.body instanceof FormData) && options.body != null) headers.set('content-type', 'application/json');
  const response = await fetch(apiUrl(path), { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}

function toast(message, type = 'success') {
  document.querySelector('.toast')?.remove();
  const element = document.createElement('div');
  element.className = `toast ${type}`;
  element.textContent = message;
  document.body.append(element);
  requestAnimationFrame(() => element.classList.add('visible'));
  setTimeout(() => {
    element.classList.remove('visible');
    setTimeout(() => element.remove(), 250);
  }, 2800);
}

function initialCredentials() {
  const params = new URLSearchParams(location.search);
  state.apiBase = normalizeBase(
    params.get('api')
    || getStoredApiBase()
    || '/api',
  );
  state.token = params.get('token') || params.get('admin_token') || sessionStorage.getItem('comatv-admin-token') || '';
  if (params.has('token') || params.has('admin_token')) {
    params.delete('token');
    params.delete('admin_token');
    const query = params.toString();
    history.replaceState({}, '', `${location.pathname}${query ? `?${query}` : ''}`);
  }
}

async function connect() {
  const apiInput = document.querySelector('#api-base');
  const tokenInput = document.querySelector('#admin-token');
  if (apiInput) state.apiBase = normalizeBase(apiInput.value);
  if (tokenInput) state.token = tokenInput.value.trim();
  if (!state.apiBase || !state.token) return toast('API URL and admin token are required.', 'error');

  const button = document.querySelector('#connect-button');
  if (button) {
    button.disabled = true;
    button.innerHTML = '<span class="spinner"></span> Connecting';
  }
  try {
    await request('/admin/validate');
    localStorage.setItem('comatv-admin-api', state.apiBase);
    sessionStorage.setItem('comatv-admin-token', state.token);
    state.connected = true;
    await loadAll();
    renderShell();
    toast('Backend connected.');
  } catch (error) {
    if (error.message === 'Invalid admin token') {
      sessionStorage.removeItem('comatv-admin-token');
      state.token = '';
    }
    toast(error.message, 'error');
    renderLogin(error.message);
  }
}

async function loadAll() {
  const content = await request('/content');
  state.profile = content?.profile && typeof content.profile === 'object' ? content.profile : {};
  state.projects = Array.isArray(content?.projects) ? content.projects : [];
  state.collaborators = Array.isArray(content?.collaborators) ? content.collaborators : [];
}

function renderLogin(error = '') {
  root.innerHTML = `
    <main class="login-page">
      <section class="login-copy">
        <a class="admin-brand" href="/"><span>C/</span> ComaTV</a>
        <div>
          <span class="admin-kicker">Private workspace</span>
          <h1>Your portfolio,<br /><em>under control.</em></h1>
          <p>Manage profile content, projects, collaborations and media from one focused workspace.</p>
        </div>
        <span class="login-footnote">Control Room · API administration</span>
      </section>
      <section class="login-panel">
        <form class="connect-card" id="connect-form">
          <div class="connect-icon">${icon('settings', 24)}</div>
          <span class="admin-kicker">Backend connection</span>
          <h2>Open control room</h2>
          <p>Use the API address and the temporary token from your secure admin link.</p>
          ${error ? `<div class="form-error">${escapeHTML(error)}</div>` : ''}
          <label>Backend API URL<input id="api-base" type="text" inputmode="url" value="${escapeHTML(state.apiBase)}" placeholder="/api or https://api.example.com" autocomplete="url" required /></label>
          <label>Admin token<input id="admin-token" type="password" value="${escapeHTML(state.token)}" placeholder="Temporary access token" autocomplete="current-password" required /></label>
          <button class="primary admin-connect" id="connect-button" type="submit">Connect securely ${icon('external', 17)}</button>
          <small>The token is kept only for this browser session.</small>
        </form>
      </section>
    </main>
  `;
  document.querySelector('#connect-form').addEventListener('submit', (event) => {
    event.preventDefault();
    connect();
  });
}

const navItems = [
  ['dashboard', 'grid', 'Overview'],
  ['profile', 'user', 'Profile'],
  ['projects', 'folder', 'Projects'],
  ['collaborators', 'users', 'Collaborations'],
  ['settings', 'settings', 'Connection'],
];

function renderShell() {
  root.innerHTML = `
    <div class="admin-shell">
      <aside class="admin-sidebar">
        <a class="admin-brand" href="/"><span>C/</span> ComaTV</a>
        <nav>${navItems.map(([id, iconName, label]) => `<button data-view="${id}" class="${state.active === id ? 'active' : ''}">${icon(iconName)}<span>${label}</span></button>`).join('')}</nav>
        <div class="sidebar-bottom">
          <div class="connection-status"><i></i><span><strong>Connected</strong><small>${escapeHTML(state.apiBase.replace(/^https?:\/\//, ''))}</small></span></div>
          <button class="logout-button" aria-label="Disconnect">${icon('logout')}</button>
        </div>
      </aside>
      <main class="admin-main">
        <header class="admin-topbar">
          <div><span class="admin-kicker">Portfolio manager</span><h1>${viewTitle()}</h1></div>
          <div class="topbar-actions">
            <a href="/" target="_blank" rel="noreferrer">View portfolio ${icon('external', 16)}</a>
            <button class="icon-button refresh-button" aria-label="Refresh data">${icon('refresh')}</button>
          </div>
        </header>
        <div class="admin-content">${renderActiveView()}</div>
      </main>
    </div>
    <dialog class="editor-dialog"><button class="dialog-x" aria-label="Close">${icon('close', 22)}</button><div class="editor-host"></div></dialog>
  `;
  bindShell();
}

function viewTitle() {
  return {
    dashboard: 'Overview',
    profile: 'Profile',
    projects: 'Projects',
    collaborators: 'Collaborations',
    settings: 'Connection',
  }[state.active];
}

function renderActiveView() {
  if (state.active === 'dashboard') return renderDashboard();
  if (state.active === 'profile') return renderProfile();
  if (state.active === 'projects') return renderCollection('project');
  if (state.active === 'collaborators') return renderCollection('collaborator');
  return renderSettings();
}

function renderDashboard() {
  const latest = [...state.projects].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  return `
    <section class="metric-grid">
      <article><span>Projects</span><strong>${state.projects.length}</strong><small>Published portfolio entries</small></article>
      <article><span>Collaborations</span><strong>${state.collaborators.length}</strong><small>Production relationships</small></article>
      <article><span>Technologies</span><strong>${state.profile.technologies?.length || 0}</strong><small>Profile capabilities</small></article>
      <article class="health-card"><span>Backend</span><strong><i></i> Online</strong><small>Authenticated API connection</small></article>
    </section>
    <section class="dashboard-grid">
      <article class="panel">
        <div class="panel-heading"><div><span class="admin-kicker">Recent work</span><h2>Latest projects</h2></div><button data-view="projects">Manage all ${icon('external', 15)}</button></div>
        <div class="recent-list">${latest.map((project) => `
          <button class="recent-row" data-edit-type="project" data-edit-id="${project.id}">
            <img src="${escapeHTML(resolveMedia(project.image))}" alt="" />
            <span><strong>${escapeHTML(project.title)}</strong><small>${escapeHTML(project.category?.name || 'Uncategorized')}</small></span>
            <time>${escapeHTML(project.date || '—')}</time>
            ${icon('edit', 16)}
          </button>`).join('') || '<div class="empty-inline">No projects yet.</div>'}
        </div>
      </article>
      <article class="panel profile-summary">
        <span class="admin-kicker">Public identity</span>
        <h2>${escapeHTML(state.profile.name || 'Untitled profile')}</h2>
        <p>${escapeHTML(state.profile.description || 'No profile description.')}</p>
        <div class="tag-row">${(state.profile.technologies || []).map((item) => `<span>${escapeHTML(item.name)}</span>`).join('')}</div>
        <button class="secondary" data-view="profile">Edit profile ${icon('edit', 15)}</button>
      </article>
    </section>
  `;
}

function resolveMedia(path = '') {
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;
  return `${state.apiBase}${path.startsWith('/') ? '' : '/'}${path}`;
}

function renderProfile() {
  return `
    <form class="profile-form panel" id="profile-form">
      <div class="form-intro"><span class="admin-kicker">Public details</span><h2>Edit profile</h2><p>These fields describe your public developer profile.</p></div>
      <div class="form-grid">
        <label>Display name<input name="name" value="${escapeHTML(state.profile.name || '')}" required /></label>
        <label>Experience<input name="experience" value="${escapeHTML(state.profile.experience || '')}" placeholder="3 Years" /></label>
        <label class="wide">Short description<textarea name="description" rows="4">${escapeHTML(state.profile.description || '')}</textarea></label>
        <label class="wide">Technologies <small>Comma separated</small><input name="technologies" value="${escapeHTML(tagsToText(state.profile.technologies))}" /></label>
        <label class="wide">Categories <small>Comma separated</small><input name="categories" value="${escapeHTML(tagsToText(state.profile.categories))}" /></label>
        <label class="wide">Social links <small>One per line: Name | URL</small><textarea name="social" rows="5">${escapeHTML(pairsToText(state.profile.social, 'link'))}</textarea></label>
        <label class="toggle-row"><input type="checkbox" name="status" ${state.profile.status ? 'checked' : ''} /><span><strong>Available for projects</strong><small>Show your availability publicly</small></span></label>
      </div>
      <div class="form-actions"><button type="button" class="secondary reset-profile">Reset</button><button type="submit" class="primary">Save profile</button></div>
    </form>
  `;
}

function renderCollection(type) {
  const isProject = type === 'project';
  const items = isProject ? state.projects : state.collaborators;
  const filtered = items.filter((item) => `${item.title} ${item.description}`.toLowerCase().includes(state.search.toLowerCase()));
  return `
    <section class="collection-toolbar">
      <label class="search-field"><span>Search</span><input type="search" value="${escapeHTML(state.search)}" placeholder="Search ${isProject ? 'projects' : 'collaborations'}..." /></label>
      <button class="primary add-item" data-type="${type}">${icon('plus', 17)} Add ${type}</button>
    </section>
    <section class="collection-grid">
      ${filtered.map((item) => `
        <article class="manager-card">
          <div class="manager-image">${item.image ? `<img src="${escapeHTML(resolveMedia(item.image))}" alt="" />` : '<span>No image</span>'}${item.special ? '<b>Featured</b>' : ''}</div>
          <div class="manager-copy">
            <span>${escapeHTML(isProject ? item.category?.name || 'Uncategorized' : item.date || 'Collaboration')}</span>
            <h2>${escapeHTML(item.title || 'Untitled')}</h2>
            <p>${escapeHTML(item.description || 'No description')}</p>
            <div class="manager-meta"><small>${item.media?.length || 0} media</small><small>${escapeHTML(item.date || 'No date')}</small></div>
          </div>
          <div class="manager-actions">
            <button data-edit-type="${type}" data-edit-id="${item.id}">${icon('edit', 16)} Edit</button>
            <button class="danger" data-delete-type="${type}" data-delete-id="${item.id}" data-delete-name="${escapeHTML(item.title)}">${icon('trash', 16)}</button>
          </div>
        </article>
      `).join('') || `<div class="empty-state"><span>${icon(isProject ? 'folder' : 'users', 30)}</span><h2>No results</h2><p>Try a different search or add a new ${type}.</p></div>`}
    </section>
  `;
}

function renderSettings() {
  return `
    <section class="settings-grid">
      <article class="panel">
        <span class="admin-kicker">Active connection</span>
        <h2>Backend API</h2>
        <label>API URL<input value="${escapeHTML(state.apiBase)}" readonly /></label>
        <div class="connection-detail"><i></i><span><strong>Authenticated</strong><small>Your temporary token is active for this session.</small></span></div>
        <button class="secondary disconnect-button">${icon('logout', 16)} Disconnect</button>
      </article>
      <article class="panel note-panel">
        <span class="admin-kicker">Publishing note</span>
        <h2>Static portfolio data</h2>
        <p>This manager writes to the connected backend. The current published portfolio uses a static data snapshot, so backend updates appear publicly after the next data sync and deployment.</p>
      </article>
    </section>
  `;
}

function bindShell() {
  document.querySelectorAll('[data-view]').forEach((button) => button.addEventListener('click', () => {
    state.active = button.dataset.view;
    state.search = '';
    renderShell();
  }));
  document.querySelector('.logout-button')?.addEventListener('click', disconnect);
  document.querySelector('.disconnect-button')?.addEventListener('click', disconnect);
  document.querySelector('.refresh-button')?.addEventListener('click', async () => {
    try {
      await loadAll();
      renderShell();
      toast('Data refreshed.');
    } catch (error) {
      toast(error.message, 'error');
    }
  });
  document.querySelector('#profile-form')?.addEventListener('submit', saveProfile);
  document.querySelector('.reset-profile')?.addEventListener('click', renderShell);
  document.querySelector('.search-field input')?.addEventListener('input', (event) => {
    state.search = event.target.value;
    document.querySelector('.collection-grid').outerHTML = new DOMParser().parseFromString(renderCollection(state.active === 'projects' ? 'project' : 'collaborator'), 'text/html').querySelector('.collection-grid').outerHTML;
    bindCollectionActions();
  });
  bindCollectionActions();
  const dialog = document.querySelector('.editor-dialog');
  document.querySelector('.dialog-x')?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
}

function bindCollectionActions() {
  document.querySelectorAll('[data-edit-type]').forEach((button) => button.addEventListener('click', () => openEditor(button.dataset.editType, button.dataset.editId)));
  document.querySelector('.add-item')?.addEventListener('click', (event) => openEditor(event.currentTarget.dataset.type));
  document.querySelectorAll('[data-delete-type]').forEach((button) => button.addEventListener('click', () => deleteItem(button)));
}

function disconnect() {
  sessionStorage.removeItem('comatv-admin-token');
  state.token = '';
  state.connected = false;
  renderLogin();
}

async function saveProfile(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const next = {
    ...state.profile,
    name: form.get('name').trim(),
    experience: form.get('experience').trim(),
    description: form.get('description').trim(),
    technologies: textToTags(form.get('technologies')),
    categories: textToTags(form.get('categories')),
    social: textToPairs(form.get('social'), 'link'),
    status: form.get('status') === 'on',
  };
  const button = event.currentTarget.querySelector('[type="submit"]');
  button.disabled = true;
  try {
    await request('/profile', { method: 'PUT', body: JSON.stringify(next) });
    state.profile = next;
    toast('Profile saved.');
  } catch (error) {
    toast(error.message, 'error');
  } finally {
    button.disabled = false;
  }
}

function nextId(items) {
  return Math.max(0, ...items.map((item) => Number(item.id) || 0)) + 1;
}

function openEditor(type, id = '') {
  const isProject = type === 'project';
  const items = isProject ? state.projects : state.collaborators;
  const current = items.find((item) => String(item.id) === String(id)) || {
    id: nextId(items),
    title: '',
    description: '',
    image: '',
    media: [],
    date: new Date().toISOString().slice(0, 10),
    ...(isProject ? { technologies: [], category: { name: 'Web Development', color: 'blue' }, linksList: [], collaboration: '', special: false } : { social: [] }),
  };
  state.editing = { type, originalId: id, item: structuredClone(current) };
  const dialog = document.querySelector('.editor-dialog');
  dialog.querySelector('.editor-host').innerHTML = `
    <form class="entity-form" id="entity-form">
      <div class="editor-heading"><span class="admin-kicker">${id ? 'Edit entry' : 'New entry'}</span><h2>${escapeHTML(current.title || `New ${type}`)}</h2><p>Update content and media, then save it to the backend.</p></div>
      <div class="form-grid">
        <label>Title<input name="title" value="${escapeHTML(current.title)}" required /></label>
        <label>Date<input type="date" name="date" value="${escapeHTML(current.date || '')}" /></label>
        <label class="wide">Description<textarea name="description" rows="5" required>${escapeHTML(current.description)}</textarea></label>
        ${isProject ? `
          <label>Category<input name="category" value="${escapeHTML(current.category?.name || '')}" /></label>
          <label>Collaboration<input name="collaboration" value="${escapeHTML(current.collaboration || '')}" /></label>
          <label class="wide">Technologies <small>Comma separated</small><input name="technologies" value="${escapeHTML(tagsToText(current.technologies))}" /></label>
          <label class="wide">Links <small>One per line: Name | URL</small><textarea name="links" rows="4">${escapeHTML(pairsToText(current.linksList))}</textarea></label>
          <label class="toggle-row"><input type="checkbox" name="special" ${current.special ? 'checked' : ''} /><span><strong>Featured project</strong><small>Show this project as selected impact</small></span></label>
        ` : `<label class="wide">Social links <small>One per line: Name | URL</small><textarea name="links" rows="4">${escapeHTML(pairsToText(current.social, 'link'))}</textarea></label>`}
        <label class="wide">Thumbnail URL<input name="image" value="${escapeHTML(current.image || '')}" placeholder="/uploads/..." /></label>
        <label class="wide">Media URLs <small>One URL per line</small><textarea name="media" rows="4">${escapeHTML((current.media || []).map((media) => typeof media === 'string' ? media : media.url).join('\n'))}</textarea></label>
      </div>
      <section class="upload-box">
        <div>${icon('upload', 21)}<span><strong>Upload media</strong><small>Choose images or videos for the thumbnail/gallery.</small></span></div>
        <div class="upload-controls"><select name="upload-kind"><option value="thumbnail">Thumbnail</option><option value="media">Gallery media</option></select><input type="file" name="files" accept="image/*,video/mp4,video/webm,video/quicktime,video/ogg" multiple /></div>
      </section>
      <div class="form-actions"><button type="button" class="secondary cancel-editor">Cancel</button><button type="submit" class="primary">Save ${type}</button></div>
    </form>
  `;
  dialog.querySelector('.cancel-editor').addEventListener('click', () => dialog.close());
  dialog.querySelector('#entity-form').addEventListener('submit', saveEntity);
  dialog.showModal();
}

async function uploadFiles(type, item, formData) {
  const files = formData.getAll('files').filter((file) => file.size > 0);
  if (!files.length) return item;
  const kind = formData.get('upload-kind');
  const payload = new FormData();
  files.forEach((file) => payload.append('files', file));
  const folder = type === 'project' ? 'project' : 'collaboration';
  const params = new URLSearchParams({ folder, id: item.id, name: item.title, kind });
  const result = await request(`/upload?${params}`, { method: 'POST', body: payload });
  const uploaded = (result.files || []).map((file) => file.type === 'video'
    ? { type: 'video', url: file.url }
    : file.url);
  if (kind === 'media') item.media = [...(item.media || []), ...uploaded];
  else if (urls[0]) item.image = urls[0];
  return item;
}

async function saveEntity(event) {
  event.preventDefault();
  const formElement = event.currentTarget;
  const form = new FormData(formElement);
  const { type, originalId, item: original } = state.editing;
  const isProject = type === 'project';
  let item = {
    ...original,
    title: form.get('title').trim(),
    date: form.get('date'),
    description: form.get('description').trim(),
    image: form.get('image').trim(),
    media: parseLines(form.get('media')).map((url) => {
      const existing = (original.media || []).find((media) => (typeof media === 'string' ? media : media.url) === url);
      return existing || url;
    }),
    ...(isProject ? {
      category: { name: form.get('category').trim(), color: 'blue' },
      collaboration: form.get('collaboration').trim(),
      technologies: textToTags(form.get('technologies')),
      linksList: textToPairs(form.get('links')),
      special: form.get('special') === 'on',
    } : {
      social: textToPairs(form.get('links'), 'link'),
    }),
  };
  const button = formElement.querySelector('[type="submit"]');
  button.disabled = true;
  button.textContent = 'Saving...';
  try {
    item = await uploadFiles(type, item, form);
    const source = isProject ? state.projects : state.collaborators;
    const next = originalId
      ? source.map((entry) => String(entry.id) === String(originalId) ? item : entry)
      : [...source, item];
    const result = await request(isProject ? '/projects' : '/collaborators', { method: 'PUT', body: JSON.stringify(next) });
    if (isProject) state.projects = result.projects || next;
    else state.collaborators = result.collaborators || next;
    document.querySelector('.editor-dialog').close();
    renderShell();
    toast(`${type[0].toUpperCase() + type.slice(1)} saved.`);
  } catch (error) {
    toast(error.message, 'error');
    button.disabled = false;
    button.textContent = `Save ${type}`;
  }
}

async function deleteItem(button) {
  const type = button.dataset.deleteType;
  const id = button.dataset.deleteId;
  const name = button.dataset.deleteName;
  if (!confirm(`Delete “${name}”? This also removes its uploaded media.`)) return;
  button.disabled = true;
  try {
    const path = type === 'project' ? `/projects/${encodeURIComponent(id)}` : `/collaborators/${encodeURIComponent(id)}`;
    const result = await request(path, { method: 'DELETE' });
    if (type === 'project') state.projects = result.projects || state.projects.filter((item) => String(item.id) !== id);
    else state.collaborators = result.collaborators || state.collaborators.filter((item) => String(item.id) !== id);
    renderShell();
    toast(`${type[0].toUpperCase() + type.slice(1)} deleted.`);
  } catch (error) {
    toast(error.message, 'error');
    button.disabled = false;
  }
}

initialCredentials();
if (state.token) connect();
else renderLogin();
