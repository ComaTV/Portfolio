import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Button, Scrollbar, Container, Input, Toggle, Dropdown } from 'mc-ui-comatv';

function stringifyJsExport(name, value) {
  // Pretty-print with 2 spaces but keep closer to original style
  const body = JSON.stringify(value, null, 2)
    .replace(/"(\w+)":/g, '"$1":')
    .replace(/\n/g, '\n');
  return `export const ${name} = ${body};\n`;
}

// Backend base (used for image preview)
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
const toServerUrl = (u) => {
  if (!u) return '';
  if (u.startsWith('http://') || u.startsWith('https://')) return u;
  if (u.startsWith('/uploads/')) return `${API_BASE}${u}`;
  return u;
};

// --- Origin allowlist from backend (/health) ---
let __healthCache = null;
async function loadHealth() {
  if (__healthCache) return __healthCache;
  try {
    const res = await fetch('/health', { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error('health failed');
    const json = await res.json();
    __healthCache = json || { status: 'ok', allowedOrigins: [] };
  } catch {
    __healthCache = { status: 'ok', allowedOrigins: [] };
  }
  return __healthCache;
}

async function ensureAllowedOrigin() {
  const { allowedOrigins = [] } = await loadHealth();
  const here = window.location.origin.replace(/\/$/, '');
  const list = (Array.isArray(allowedOrigins) ? allowedOrigins : []).map((s) => String(s || '').replace(/\/$/, '')).filter(Boolean);
  if (list.length && !list.includes(here)) {
    throw new Error('Forbidden origin');
  }
}

function generateDataJs(projects, collaborators, profile) {
  const p = stringifyJsExport('projectsData', projects);
  const c = stringifyJsExport('collaborators', collaborators);
  const pr = stringifyJsExport('profileData', profile);
  return `${p}\n\n${c}\n\n${pr}`;
}

// Simple labeled field wrapper for Input
const Field = ({ label, children }) => (
  <div className="mb-3">
    <div className="text-sm font-medium mb-1">{label}</div>
    {children}
  </div>
);

// (Removed) CategoryColorsForm – colors are now stored per project under category

// --- API helpers ---
async function apiGet(pathname) {
  await ensureAllowedOrigin();
  const res = await fetch(pathname, { headers: { 'Accept': 'application/json' } });
  if (!res.ok) throw new Error(`GET ${pathname} failed`);
  return res.json();
}

async function apiPut(pathname, body) {
  await ensureAllowedOrigin();
  const res = await fetch(pathname, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`PUT ${pathname} failed`);
  return res.json();
}

async function apiUpload(files, params = {}) {
  await ensureAllowedOrigin();
  const fd = new FormData();
  (files || []).forEach(f => fd.append('files', f));
  const qs = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    qs.set(k, String(v));
  });
  const url = qs.toString() ? `/upload?${qs.toString()}` : '/upload';
  const res = await fetch(url, { method: 'POST', body: fd });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
}

// Image picker: allow path or upload with preview
const ImagePicker = ({ label, value, onChange, uploadParams }) => {
  const fileRef = useRef(null);
  const [localPreview, setLocalPreview] = useState('');
  const [previewVer, setPreviewVer] = useState(0);
  const handleFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    // Show local preview immediately
    const objUrl = URL.createObjectURL(file);
    setLocalPreview(objUrl);
    try {
      const { files: uploaded } = await apiUpload([file], uploadParams);
      const url = uploaded?.[0]?.url || '';
      if (url) {
        onChange(url);
        // bump version to bypass cache for constant URLs (e.g., avatar.webp)
        setPreviewVer(Date.now());
      }
    } catch (err) {
      console.error('Image upload failed', err);
    } finally {
      // Release local preview; server image will render next with cache-bust
      setTimeout(() => {
        try { URL.revokeObjectURL(objUrl); } catch {}
        setLocalPreview('');
      }, 0);
    }
  };
  return (
    <Field label={label}>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          <Button label="Select Image" variant="green" onClick={() => fileRef.current?.click()} />
          {value ? <Button label="Remove" variant="red" onClick={() => onChange('')} /> : null}
        </div>
        {localPreview || value ? (
          <Container variant="outlined" className=" p-2">
            <img
              src={
                localPreview || (
                  toServerUrl(value) + (
                    (value && String(value).startsWith('/uploads/')) ? `?v=${previewVer}` : ''
                  )
                )
              }
              alt="preview"
              className="max-h-40 object-contain"
            />
          </Container>
        ) : null}
      </div>
    </Field>
  );
};

// Tailwind-like color names for dropdowns (profile: technologies/categories color)
const COLOR_OPTIONS = [
  'red','orange','amber','yellow','lime','green','emerald','teal','cyan','sky','blue','indigo','violet','purple','fuchsia','pink','rose','slate','gray','zinc','neutral','stone'
];

// Profile form editor
const ProfileForm = ({ value, onChange }) => {
  const update = (patch) => onChange({ ...value, ...patch });
  return (
    <Container variant="form">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
          <ImagePicker label="Avatar" value={value.avatar} onChange={(val) => update({ avatar: val })} uploadParams={{ folder: 'avatar', name: 'avatar' }} />
        </div>
        <Field label="Name">
          <Input placeholder={value.name} onChange={(val) => update({ name: val })} />
        </Field>
        
        <Field label="Location">
          <Input placeholder={value.location} onChange={(val) => update({ location: val })} />
        </Field>
        <Field label="Experience">
          <Input placeholder={value.experience} onChange={(val) => update({ experience: val })} />
        </Field>
        <Field label="Status">
          <div className="flex items-center gap-3">
            <Toggle
              checked={!!value.status}
              onChange={(checked) => {
                // Defer update to avoid setState during Toggle render
                setTimeout(() => update({ status: checked }), 0);
              }}
            />
            <span className={`text-sm font-medium ${value.status ? 'text-green-600' : 'text-red-600'}`}>
              {value.status ? 'Online' : 'Offline'}
            </span>
          </div>
        </Field>
        <div className="md:col-span-2">
          <Field label="Description">
            <Input placeholder={value.description} onChange={(val) => update({ description: val })} />
          </Field>
        </div>
        <div className="md:col-span-2">
          <PairListEditor
            label="Social (name + link)"
            items={Array.isArray(value.social) ? value.social : []}
            onChange={(val) => update({ social: val })}
            fields={[
              { key: 'name', placeholder: 'e.g. GitHub / YouTube / Website' },
              { key: 'link', placeholder: 'https://example.com or username' },
            ]}
          />
        </div>
        <div className="md:col-span-2">
          <PairListEditor
            label="Technologies (name + color)"
            items={value.technologies || []}
            onChange={(val) => update({ technologies: val })}
            fields={[
              { key: 'name', placeholder: 'e.g. javascript, node, MongoDB' },
              { key: 'color', placeholder: 'Select color', type: 'dropdown', options: COLOR_OPTIONS },
            ]}
          />
        </div>
        <div className="md:col-span-2">
          <PairListEditor
            label="Categories (name + color)"
            items={value.categories || []}
            onChange={(val) => update({ categories: val })}
            fields={[
              { key: 'name', placeholder: 'e.g. Web Development, Mobile App' },
              { key: 'color', placeholder: 'Select color', type: 'dropdown', options: COLOR_OPTIONS },
            ]}
          />
        </div>
      </div>
    </Container>
  );
};

// Minimal array-of-strings editor (for media)
const StringListEditor = ({ label, values, onChange, placeholder, enableUpload, uploadParams }) => {
  const fileInputRef = useRef(null);
  const remove = (i) => {
    const next = [...(values || [])];
    next.splice(i, 1);
    onChange(next);
  };
  const addFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    try {
      const { files: uploaded } = await apiUpload(files, uploadParams || undefined);
      const urls = (uploaded || []).map(f => f.url).filter(Boolean);
      onChange([...(values || []), ...urls]);
    } catch (err) {
      console.error('Bulk upload failed', err);
    }
    // reset input so same files can be selected again if needed
    e.target.value = '';
  };
  return (
    <Field label={label}>
      <div className="space-y-2">
        {enableUpload && (
          <div className="flex items-center gap-3">
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={addFiles} className="hidden" />
            <Button label="Upload images" variant="green" onClick={() => fileInputRef.current?.click()} />
            {(values || []).length ? (
              <Button label="Clear all" variant="red" onClick={() => onChange([])} />
            ) : null}
          </div>
        )}
        <Container variant="transparent">
          <Scrollbar grid={true} gridCols={3} height="400px" >
            {!(values || []).length ? (
              <div className="text-sm text-gray-500">Nicio imagine adaugată inca.</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {(values || []).map((v, i) => (
                  <div key={i} className="relative group">
                    {v ? (
                      <img src={toServerUrl(v)} alt={`media-${i}`} className="w-full h-40 md:h-48 object-cover" />
                    ) : (
                      <div className="w-full h-40 md:h-48 " />
                    )}
                    <div className="absolute top-2 right-2 opacity-90 group-hover:opacity-100">
                      <Button label="Remove" variant="red" onClick={() => remove(i)} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Scrollbar>
        </Container>
      </div>
    </Field>
  );
};

// Generic list editor for arrays of objects with named fields
const PairListEditor = ({ label, items = [], onChange, fields }) => {
  const add = () => onChange([...(items || []), Object.fromEntries(fields.map(f => [f.key, '']))]);
  const update = (i, key, val) => {
    const next = [...(items || [])];
    next[i] = { ...(next[i] || {}), [key]: val };
    onChange(next);
  };
  const remove = (i) => {
    const next = [...(items || [])];
    next.splice(i, 1);
    onChange(next);
  };
  return (
    <Field label={label}>
      <div className="space-y-2">
        {(items || []).map((it, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 items-center">
            {fields.map((f) => {
              const val = it[f.key] || '';
              const colClass = fields.length === 2 ? 'col-span-5' : 'col-span-4';
              if (f.type === 'dropdown' && Array.isArray(f.options)) {
                const label = val || (f.placeholder || 'Select...');
                return (
                  <div key={f.key} className={colClass}>
                    <Dropdown
                      header={`Select ${f.key}`}
                      label={label}
                      options={f.options}
                      dark={true}
                      onSelect={(opt) => update(i, f.key, opt)}
                    />
                  </div>
                );
              }
              return (
                <div key={f.key} className={colClass}>
                  <Input placeholder={val} onChange={(val) => update(i, f.key, val)} />
                </div>
              );
            })}
            <div className="col-span-2 flex justify-end">
              <Button label="Remove" variant="red" onClick={() => remove(i)} />
            </div>
          </div>
        ))}
        <Button label="Add" variant="green" onClick={add} />
      </div>
    </Field>
  );
};

// Basic Project editor (core fields)
const ProjectsForm = ({ projects, onChange, collaborators = [], profile }) => {
  const [index, setIndex] = useState(0);
  const current = projects[index] || {};
  const updateCurrent = (patch) => {
    const next = projects.map((p, i) => (i === index ? { ...p, ...patch } : p));
    onChange(next);
  };
  // Build dropdown sources from profile
  const profileTechs = Array.isArray(profile?.technologies) ? profile.technologies : [];
  const techNameOptions = profileTechs.map(t => t?.name).filter(Boolean);
  const techColorByName = Object.fromEntries(profileTechs.filter(t => t && t.name).map(t => [t.name, t.color || '']));
  const profileCats = Array.isArray(profile?.categories) ? profile.categories : [];
  const catNameOptions = profileCats.map(c => c?.name).filter(Boolean);
  const catColorByName = Object.fromEntries(profileCats.filter(c => c && c.name).map(c => [c.name, c.color || '']));
  // Collaborators dropdown options
  const collabNameOptions = ['None', ...((Array.isArray(collaborators) ? collaborators : []).map(c => c?.title).filter(Boolean))];
  const addProject = () => {
    const next = [
      ...projects,
      { id: (projects[projects.length - 1]?.id || 0) + 1, title: 'New Project', description: '', image: '', media: [], technologies: [], categories: [], category: { name: '', color: '' }, date: '', linksList: [], special: false, collaboration: '' }
    ];
    onChange(next);
    setIndex(next.length - 1);
  };
  const removeProject = async () => {
    if (!projects.length) return;
    const item = projects[index];
    const id = item && item.id != null ? String(item.id) : '';
    if (!id) return;
    try {
      const res = await fetch(`/projects/${encodeURIComponent(id)}`, { method: 'DELETE', headers: { 'Accept': 'application/json' } });
      if (res.ok) {
        const json = await res.json().catch(() => null);
        const next = (json && Array.isArray(json.projects)) ? json.projects : projects.filter((_, i) => i !== index);
        onChange(next);
        setIndex(0);
        return;
      }
    } catch (e) {
      console.warn('Delete project failed, falling back to local remove:', e);
    }
    const next = projects.filter((_, i) => i !== index);
    onChange(next);
    setIndex(0);
  };
  // ...

  return (
    <Container variant="form">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="text-sm">Selected project:</div>
        {(() => {
          const options = projects.map((p) => `#${p.id} · ${p.title || 'Untitled'}`);
          const selected = options[index] || 'Select project';
          return (
            <Dropdown
              header="Select project"
              label={selected}
              options={options}
              dark={true}
              onSelect={(opt) => {
                const i = options.indexOf(opt);
                if (i >= 0) setIndex(i);
              }}
            />
          );
        })()}
        <div className="ml-auto flex gap-2">
          <Button label="Add" variant="green" onClick={addProject} />
          <Button label="Remove" variant="red" onClick={removeProject} />
        </div>
      </div>
      {projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Title"><Input defaultValue={current.title} onChange={(val) => updateCurrent({ title: val })} placeholder="Title" /></Field>
          <Field label="Date">
            {(() => {
              const safeDate = typeof current.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(current.date) ? current.date : '';
              return (
                <input
                  type="date"
                  value={safeDate}
                  onChange={(e) => updateCurrent({ date: e.target.value })}
                  className="w-full rounded border border-gray-300 bg-white/90 px-3 py-2 text-gray-900"
                />
              );
            })()}
          </Field>

          <Field label="Special">
            <div className="flex items-center gap-3">
              <Toggle
                checked={!!current.special}
                onChange={(checked) => setTimeout(() => updateCurrent({ special: checked }), 0)}
              />
              <span className={`text-sm font-medium ${current.special ? 'text-green-600' : 'text-gray-600'}`}>
                {current.special ? 'Yes' : 'No'}
              </span>
            </div>
          </Field>

          <Field label="Collaboration">
            <Dropdown
              header="Select collaboration"
              label={current?.collaboration ? current.collaboration : 'None'}
              options={collabNameOptions}
              dark={true}
              onSelect={(opt) => updateCurrent({ collaboration: opt === 'None' ? '' : opt })}
            />
          </Field>

          <div className="md:col-span-2">
            <Field label="Description">
              <Input defaultValue={current.description} onChange={(val) => updateCurrent({ description: val })} />
            </Field>
          </div>

          <div className="md:col-span-2">
            <ImagePicker
              label="Image"
              value={current.image}
              onChange={(val) => updateCurrent({ image: val })}
              uploadParams={{ folder: 'project', id: current.id, name: current.title, kind: 'thumbnail' }}
            />
          </div>

          <div className="md:col-span-2">
            <StringListEditor
              label="Media"
              values={current.media || []}
              onChange={(val) => updateCurrent({ media: val })}
              placeholder="path/to/media.png"
              enableUpload={true}
              uploadParams={{ folder: 'project', id: current.id, name: current.title, kind: 'media' }}
            />
          </div>

          <div className="md:col-span-2">
            <Field label="Technologies (select from Profile)">
              <div className="space-y-2">
                {(Array.isArray(current.technologies) ? current.technologies : []).map((t, i) => {
                  const name = t?.name || '';
                  const label = name || 'Select technology';
                  return (
                    <div key={i} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-11">
                        <Dropdown
                          header="Select technology"
                          label={label}
                          options={techNameOptions}
                          dark={true}
                          onSelect={(opt) => {
                            const next = [...(Array.isArray(current.technologies) ? current.technologies : [])];
                            next[i] = { name: opt, color: techColorByName[opt] || '' };
                            updateCurrent({ technologies: next });
                          }}
                        />
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <Button label="Remove" variant="red" onClick={() => {
                          const next = [...(Array.isArray(current.technologies) ? current.technologies : [])];
                          next.splice(i, 1);
                          updateCurrent({ technologies: next });
                        }} />
                      </div>
                    </div>
                  );
                })}
                <Button
                  label="Add technology"
                  variant="green"
                  onClick={() => {
                    if (!techNameOptions.length) return;
                    const name = techNameOptions[0];
                    const color = techColorByName[name] || '';
                    const next = [...(Array.isArray(current.technologies) ? current.technologies : [])];
                    next.push({ name, color });
                    updateCurrent({ technologies: next });
                  }}
                />
              </div>
            </Field>
          </div>

          <div className="md:col-span-2">
            <Field label="Categories (select from Profile)">
              <div className="space-y-2">
                {(() => {
                  const categoriesArr = Array.isArray(current.categories)
                    ? current.categories
                    : (current?.category && current.category.name ? [current.category] : []);
                  return (
                    <>
                      {categoriesArr.map((cat, i) => {
                        const name = cat?.name || '';
                        const label = name || 'Select category';
                        return (
                          <div key={i} className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-11">
                              <Dropdown
                                header="Select category"
                                label={label}
                                options={catNameOptions}
                                dark={true}
                                onSelect={(opt) => {
                                  const next = [...categoriesArr];
                                  next[i] = { name: opt, color: catColorByName[opt] || '' };
                                  // keep legacy single `category` in sync with first
                                  updateCurrent({ categories: next, category: next[0] || { name: '', color: '' } });
                                }}
                              />
                            </div>
                            <div className="col-span-1 flex justify-end">
                              <Button label="Remove" variant="red" onClick={() => {
                                const next = [...categoriesArr];
                                next.splice(i, 1);
                                updateCurrent({ categories: next, category: next[0] || { name: '', color: '' } });
                              }} />
                            </div>
                          </div>
                        );
                      })}
                      <Button
                        label="Add category"
                        variant="green"
                        onClick={() => {
                          if (!catNameOptions.length) return;
                          const name = catNameOptions[0];
                          const color = catColorByName[name] || '';
                          const arr = Array.isArray(current.categories)
                            ? [...current.categories]
                            : (current?.category && current.category.name ? [current.category] : []);
                          arr.push({ name, color });
                          updateCurrent({ categories: arr, category: arr[0] || { name: '', color: '' } });
                        }}
                      />
                    </>
                  );
                })()}
              </div>
            </Field>
          </div>

          <div className="md:col-span-2">
            <PairListEditor
              label="Links (name + url)"
              items={Array.isArray(current.linksList) ? current.linksList.map(it => (it && it.url ? it : { ...it, url: it?.link || '' })) : []}
              onChange={(val) => updateCurrent({ linksList: val })}
              fields={[
                { key: 'name', placeholder: 'e.g. GitHub / Demo' },
                { key: 'url', placeholder: 'https://example.com' },
              ]}
            />
          </div>
        </div>
      )}
    </Container>
  );
};

// Basic Collaborators editor
const CollaboratorsForm = ({ collaborators, onChange }) => {
  const [index, setIndex] = useState(0);
  const current = collaborators[index] || {};
  const updateCurrent = (patch) => {
    const next = collaborators.map((c, i) => (i === index ? { ...c, ...patch } : c));
    onChange(next);
  };
  const addItem = () => {
    const next = [
      ...collaborators,
      { id: (collaborators[collaborators.length - 1]?.id || 0) + 1, title: 'New', description: '', image: '', date: '', media: [], social: [] }
    ];
    onChange(next);
    setIndex(next.length - 1);
  };
  const removeItem = async () => {
    if (!collaborators.length) return;
    const item = collaborators[index];
    const id = item && item.id != null ? String(item.id) : '';
    if (!id) return;
    try {
      const res = await fetch(`/collaborators/${encodeURIComponent(id)}`, { method: 'DELETE', headers: { 'Accept': 'application/json' } });
      if (res.ok) {
        const json = await res.json().catch(() => null);
        const next = (json && Array.isArray(json.collaborators)) ? json.collaborators : collaborators.filter((_, i) => i !== index);
        onChange(next);
        setIndex(0);
        return;
      }
    } catch (e) {
      console.warn('Delete collaborator failed, falling back to local remove:', e);
    }
    const next = collaborators.filter((_, i) => i !== index);
    onChange(next);
    setIndex(0);
  };
  const social = Array.isArray(current.social) ? current.social : [];
  return (
    <Container variant="form">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="text-sm">Selected collaborator:</div>
        {(() => {
          const options = collaborators.map((c) => `#${c.id} · ${c.title || 'Untitled'}`);
          const selected = options[index] || 'Select collaborator';
          return (
            <Dropdown
              header="Select collaborator"
              label={selected}
              options={options}
              dark={true}
              onSelect={(opt) => {
                const i = options.indexOf(opt);
                if (i >= 0) setIndex(i);
              }}
            />
          );
        })()}
        <div className="ml-auto flex gap-2">
          <Button label="Add" variant="green" onClick={addItem} />
          <Button label="Remove" variant="red" onClick={removeItem} />
        </div>
      </div>
      {collaborators.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Title"><Input defaultValue={current.title} onChange={(val) => updateCurrent({ title: val })} placeholder="Title" /></Field>
          <Field label="Date">
            {(() => {
              const safeDate = typeof current.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(current.date) ? current.date : '';
              return (
                <input
                  type="date"
                  value={safeDate}
                  onChange={(e) => updateCurrent({ date: e.target.value })}
                  className="w-full rounded border border-gray-300 bg-white/90 px-3 py-2 text-gray-900"
                />
              );
            })()}
          </Field>
          
          <div className="md:col-span-2">
            <Field label="Description">
              <Input defaultValue={current.description} onChange={(val) => updateCurrent({ description: val })} />
            </Field>
          </div>
          <div className="md:col-span-2">
            <ImagePicker
              label="Image"
              value={current.image}
              onChange={(val) => updateCurrent({ image: val })}
              uploadParams={{ folder: 'collaboration', id: current.id, name: current.title }}
            />
          </div>
          <div className="md:col-span-2">
            <StringListEditor
              label="Media"
              values={current.media || []}
              onChange={(val) => updateCurrent({ media: val })}
              placeholder="path/to/media.png"
              enableUpload={true}
              uploadParams={{ folder: 'collaboration', id: current.id, name: current.title, kind: 'media' }}
            />
          </div>
          <div className="md:col-span-2">
            <PairListEditor
              label="Social (name + link)"
              items={social}
              onChange={(val) => updateCurrent({ social: val })}
              fields={[
                { key: 'name', placeholder: 'e.g. GitHub / YouTube / Website' },
                { key: 'link', placeholder: 'https://example.com or username' },
              ]}
            />
          </div>
        </div>
      )}
    </Container>
  );
};

 

export default function AdminPage() {
  const [section, setSection] = useState('projects');

  const [projects, setProjects] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [profile, setProfile] = useState({});
  const [sectionJsonDraft, setSectionJsonDraft] = useState('');
  const [sectionJsonError, setSectionJsonError] = useState('');

  // Load latest from backend
  useEffect(() => {
    (async () => {
      try {
        const [p, c, pr] = await Promise.all([
          apiGet('/projects').catch(() => null),
          apiGet('/collaborators').catch(() => null),
          apiGet('/profile').catch(() => null),
        ]);
        if (Array.isArray(p)) setProjects(p);
        if (Array.isArray(c)) setCollaborators(c);
        if (pr && typeof pr === 'object') setProfile(pr);
      } catch (e) {
        // keep local fallbacks
        console.warn('Failed to fetch initial data from backend', e);
      }
    })();
  }, []);

  // Remove localStorage persistence: show only server data

  const dataJsText = useMemo(() => generateDataJs(projects, collaborators, profile), [projects, collaborators, profile]);

  // Keep JSON draft in sync with current section's data
  useEffect(() => {
    const pick = section === 'projects' ? projects : (section === 'collaborators' ? collaborators : profile);
    try {
      setSectionJsonDraft(JSON.stringify(pick, null, 2));
      setSectionJsonError('');
    } catch (e) {
      setSectionJsonDraft('');
      setSectionJsonError('');
    }
  }, [section, projects, collaborators, profile]);

  const onEditSectionJson = (e) => {
    const text = e.target.value;
    setSectionJsonDraft(text);
    try {
      const parsed = JSON.parse(text);
      setSectionJsonError('');
      if (section === 'projects') setProjects(Array.isArray(parsed) ? parsed : []);
      else if (section === 'collaborators') setCollaborators(Array.isArray(parsed) ? parsed : []);
      else if (section === 'profile') setProfile(parsed && typeof parsed === 'object' ? parsed : {});
    } catch (err) {
      setSectionJsonError('JSON invalid');
    }
  };

  const downloadDataJs = () => {
    const blob = new Blob([dataJsText], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.jsx';
    a.click();
    URL.revokeObjectURL(url);
  };

  const saveCurrent = async () => {
    try {
      if (section === 'projects') {
        const resp = await apiPut('/projects', projects);
        if (resp && Array.isArray(resp.projects)) {
          setProjects(resp.projects);
        }
      }
      if (section === 'collaborators') {
        const resp = await apiPut('/collaborators', collaborators);
        if (resp && Array.isArray(resp.collaborators)) {
          setCollaborators(resp.collaborators);
        }
      }
      if (section === 'profile') {
        await apiPut('/profile', profile);
      }
      alert('Saved successfully');
    } catch (e) {
      console.error('Save failed', e);
      alert('Save failed');
    }
  };

  return (
    <div className="h-full w-full text-gray-900">
      <Container>
          <h1 className="minecraft-ten text-4xl pb-6">Admin Editor</h1>
          <div className="flex items-center gap-2">
            <Button label="Export data.jsx" onClick={downloadDataJs} />
            <Button label={`Save ${section}`} variant="green" onClick={saveCurrent} />
          </div>
      </Container>

      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-12 gap-4">
          <aside className="col-span-12 md:col-span-3">
            {/* Dropdown to select which section to edit */}
            <div className="mb-3">
              {(() => {
                const options = ['Projects', 'Collaborators', 'Profile'];
                const toValue = (label) => {
                  if (label === 'Projects') return 'projects';
                  if (label === 'Collaborators') return 'collaborators';
                  if (label === 'Profile') return 'profile';
                  return 'projects';
                };
                const fromValue = (val) => ({
                  projects: 'Projects',
                  collaborators: 'Collaborators',
                  profile: 'Profile',
                }[val] || 'Projects');
                return (
                  <Dropdown
                    header="Select section"
                    label={fromValue(section)}
                    options={options}
                    dark={true}
                    onSelect={(opt) => setSection(toValue(opt))}
                  />
                );
              })()}
            </div>
          </aside>
          <main className="col-span-12 md:col-span-9">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                {section === 'projects' && (
                  <ProjectsForm
                    projects={projects}
                    onChange={setProjects}
                    collaborators={collaborators}
                    profile={profile}
                  />
                )}
                {section === 'collaborators' && (
                  <CollaboratorsForm collaborators={collaborators} onChange={setCollaborators} />
                )}
                {section === 'profile' && (
                  <ProfileForm value={profile} onChange={setProfile} />
                )}
              </div>
              <Container className="w-[600px]">
                <h3 className="text-lg font-semibold">{section.charAt(0).toUpperCase() + section.slice(1)} JSON</h3>
                <textarea
                  className={`h-screen p-3 font-mono text-xs bg-gray-800 text-white w-full rounded outline-none border ${sectionJsonError ? 'border-red-500' : 'border-transparent'}`}
                  value={sectionJsonDraft}
                  onChange={onEditSectionJson}
                  spellCheck={false}
                />
                {sectionJsonError ? (
                  <div className="text-red-500 text-xs mt-1">{sectionJsonError}</div>
                ) : null}
              </Container>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
