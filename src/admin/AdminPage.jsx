import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Button, Scrollbar, Container, Input, Toggle, Dropdown } from 'mc-ui-comatv';
import { projectsData as initialProjects, collaborators as initialCollaborators, profileData as initialProfile } from '../server/data';

const StorageKey = 'admin-editor-data-v1';

function stringifyJsExport(name, value) {
  // Pretty-print with 2 spaces but keep closer to original style
  const body = JSON.stringify(value, null, 2)
    .replace(/"(\w+)":/g, '"$1":')
    .replace(/\n/g, '\n');
  return `export const ${name} = ${body};\n`;
}

function generateDataJs(projects, collaborators, profile) {
  const header = '';
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

// Utility: convert File to data URL
async function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Image picker: allow path or upload with preview
const ImagePicker = ({ label, value, onChange }) => {
  const fileRef = useRef(null);
  const handleFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const url = await fileToDataUrl(file);
    onChange(url);
  };
  return (
    <Field label={label}>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          <Button label="Select Image" variant="green" onClick={() => fileRef.current?.click()} />
          {value ? <Button label="Remove" variant="red" onClick={() => onChange('')} /> : null}
        </div>
        {value ? (
          <Container variant="outlined" className=" p-2">
            <img src={value} alt="preview" className="max-h-40 object-contain" />
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
          <ImagePicker label="Avatar" value={value.avatar} onChange={(val) => update({ avatar: val })} />
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
          <div className="flex items-center gap-2">
            <Toggle checked={!!value.status} onChange={(checked) => update({ status: checked })} />
          </div>
        </Field>
        <div className="md:col-span-2">
          <Field label="Description">
            <Input placeholder={value.description} onChange={(e) => update({ description: e.target.value })} />
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
const StringListEditor = ({ label, values, onChange, placeholder, enableUpload }) => {
  const fileInputRef = useRef(null);
  const remove = (i) => {
    const next = [...(values || [])];
    next.splice(i, 1);
    onChange(next);
  };
  const addFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const urls = await Promise.all(files.map(fileToDataUrl));
    onChange([...(values || []), ...urls]);
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
                      <img src={v} alt={`media-${i}`} className="w-full h-40 md:h-48 object-cover" />
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
  const addProject = () => {
    const next = [
      ...projects,
      { id: (projects[projects.length - 1]?.id || 0) + 1, title: 'New Project', description: '', image: '', media: [], technologies: [], category: { name: '', color: '' }, date: '', linksList: [] }
    ];
    onChange(next);
    setIndex(next.length - 1);
  };
  const removeProject = () => {
    if (!projects.length) return;
    const next = projects.filter((_, i) => i !== index);
    onChange(next);
    setIndex(0);
  };
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
          {/* Category selector from profile.categories */}
          <Field label="Category">
            {(() => {
              const categories = (profile?.categories || []).filter(c => c && c.name);
              const options = ['None', ...categories.map(c => c.name)];
              const selectedName = typeof current.category === 'object' ? (current.category?.name || '') : (current.category || '');
              const label = selectedName && options.includes(selectedName) ? selectedName : (selectedName || 'None');
              return (
                <>
                  <Dropdown
                    header="Select category"
                    label={label}
                    options={options}
                    dark={true}
                    onSelect={(opt) => {
                      if (opt === 'None') {
                        updateCurrent({ category: { name: '', color: '' } });
                        return;
                      }
                      const found = categories.find(c => c.name === opt);
                      if (found) updateCurrent({ category: { name: found.name, color: found.color || '' } });
                    }}
                  />
                </>
              );
            })()}
          </Field>
          <Field label="Date">
            <div className="flex items-center gap-2">
              <input
                type="date"
                className="px-2 py-1 rounded border border-gray-300 bg-white/90 text-gray-900 text-sm"
                value={current.date || ''}
                onChange={(e) => updateCurrent({ date: e.target.value })}
              />
              <Button label="Today" variant="green" onClick={() => {
                const d = new Date();
                const yyyy = d.getFullYear();
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const dd = String(d.getDate()).padStart(2, '0');
                updateCurrent({ date: `${yyyy}-${mm}-${dd}` });
              }} />
              {current.date ? (
                <Button label="Clear" variant="red" onClick={() => updateCurrent({ date: '' })} />
              ) : null}
            </div>
          </Field>
          <div className="md:col-span-2">
            <Field label="Description">
              <Input defaultValue={current.description} placeholder="Description" onChange={(val) => updateCurrent({ description: val })} />
            </Field>
          </div>
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <Toggle checked={!!current.special} onChange={(checked) => updateCurrent({ special: checked })} />
              <span>Special</span>
            </div>
          </div>
          <Field label="Collaboration">
            <div className="space-y-2">
              {(() => {
                const options = ['None', ...collaborators.map((c) => c.title)];
                const label = current.collaboration && options.includes(current.collaboration)
                  ? current.collaboration
                  : (current.collaboration ? current.collaboration : 'None');
                return (
                  <Dropdown
                    header="Select collaborator"
                    label={label}
                    options={options}
                    dark={true}
                    onSelect={(opt) => updateCurrent({ collaboration: opt === 'None' ? '' : opt })}
                  />
                );
              })()}
            </div>
          </Field>
          <div className="md:col-span-2">
            <ImagePicker label="Image" value={current.image} onChange={(val) => updateCurrent({ image: val })} />
          </div>
          <div className="md:col-span-2">
            <StringListEditor label="Media" values={current.media || []} onChange={(val) => updateCurrent({ media: val })} placeholder="path/to/media.png" enableUpload={true} />
          </div>
          {/* Technologies selector from profile.technologies */}
          <div className="md:col-span-2">
            {(() => {
              const techs = (profile?.technologies || []).filter(t => t && t.name);
              const options = techs.length ? techs.map(t => t.name) : [];
              const selected = current.technologies || [];
              const addTech = (name) => {
                const found = techs.find(t => t.name === name);
                if (!found) return;
                if (selected.some(s => s.name === found.name)) return;
                updateCurrent({ technologies: [...selected, { name: found.name, color: found.color || '' }] });
              };
              const removeTech = (name) => {
                updateCurrent({ technologies: selected.filter(s => s.name !== name) });
              };
              return (
                <Container variant="outlined">
                  <div className="space-y-2">
                    <Field label="Add technology">
                      <Dropdown
                        header="Select technology"
                        label={options.length ? 'Select...' : 'No technologies in profile'}
                        options={options}
                        dark={true}
                        onSelect={(opt) => addTech(opt)}
                      />
                    </Field>
                    <div className="flex flex-wrap gap-2">
                      {(selected).map((t, i) => {
                        const key = String(t?.name || '').toLowerCase().replace(/\s+/g, '').replace(/\./g, '');
                        // minimal aliasing for common tech names
                        const alias = {
                          js: 'javascript',
                          ts: 'typescript',
                          'c#': 'cs',
                          'c++': 'cpp',
                          python: 'py'
                        };
                        const iconKey = alias[key] || key;
                        const icon = `techno/${iconKey}.webp`;
                        return (
                          <Container key={i} className="flex items-center gap-2">
                            <img src={icon} alt={t?.name || 'tech'} className="h-5 w-5 object-contain" />
                            <span className="text-sm" style={{ color: t.color || '#111827' }}>{t.name}</span>
                            <Button label="Remove" variant="red" onClick={() => removeTech(t.name)} />
                          </Container>
                        );
                      })}
                    </div>
                  </div>
                </Container>
              );
            })()}
          </div>
          <div className="md:col-span-2">
            <PairListEditor
              label="Links List (name + url)"
              items={current.linksList || []}
              onChange={(val) => updateCurrent({ linksList: val })}
              fields={[
                { key: 'name', placeholder: 'GitHub / YouTube / Website' },
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
  const removeItem = () => {
    if (!collaborators.length) return;
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
              <Input placeholder={current.description} onChange={(e) => updateCurrent({ description: e.target.value })} />
            </Field>
          </div>
          <div className="md:col-span-2">
            <ImagePicker label="Image" value={current.image} onChange={(val) => updateCurrent({ image: val })} />
          </div>
          <div className="md:col-span-2">
            <StringListEditor label="Media" values={current.media || []} onChange={(val) => updateCurrent({ media: val })} placeholder="path/to/media.png" enableUpload={true} />
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

  const [projects, setProjects] = useState(initialProjects);
  const [collaborators, setCollaborators] = useState(initialCollaborators);
  const [profile, setProfile] = useState(initialProfile);

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(StorageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.projects) setProjects(parsed.projects);
        if (parsed.collaborators) setCollaborators(parsed.collaborators);
        if (parsed.profile) setProfile(parsed.profile);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const payload = { projects, collaborators, profile };
    try { localStorage.setItem(StorageKey, JSON.stringify(payload)); } catch {}
  }, [projects, collaborators, profile]);

  const dataJsText = useMemo(() => generateDataJs(projects, collaborators, profile), [projects, collaborators, profile]);

  const downloadDataJs = () => {
    const blob = new Blob([dataJsText], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.jsx';
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetToRepo = () => {
    setProjects(initialProjects);
    setCollaborators(initialCollaborators);
    setProfile(initialProfile);
    try { localStorage.removeItem(StorageKey); } catch {}
  };

  return (
    <div className="h-full w-full text-gray-900">
      <Container>
          <h1 className="minecraft-ten text-4xl pb-6">Admin Editor</h1>
          <div className="flex items-center gap-2">
            <Button label="Export data.jsx" variant="green" onClick={downloadDataJs} />
            <Button label="Reset to repo" variant="purple" onClick={resetToRepo} />
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
                  <ProjectsForm projects={projects} onChange={setProjects} collaborators={collaborators} profile={profile} />
                )}
                {section === 'collaborators' && (
                  <CollaboratorsForm collaborators={collaborators} onChange={setCollaborators} />
                )}
                {section === 'profile' && (
                  <ProfileForm value={profile} onChange={setProfile} />
                )}
              </div>
              <Container className="w-[600px]">
                    <h3 className="text-lg font-semibold">Generated data.jsx (read-only)</h3>
                    <textarea className="h-screen p-3 font-mono text-xs bg-gray-800 text-white" value={dataJsText} readOnly spellCheck={false} />
                </Container>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
