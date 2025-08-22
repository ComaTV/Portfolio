import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Button, Container, Input, Toggle, Dropdown } from 'mc-ui-comatv';
import { projectsData as initialProjects, collaborators as initialCollaborators, profileData as initialProfile } from '../server/data';

const SectionButton = ({ active, onClick, children }) => (
  <Button
    label={typeof children === 'string' ? children : undefined}
    onClick={onClick}
    variant={active ? 'green' : 'default'}
    fullWidth
    className="!justify-start"
  >
    {typeof children === 'string' ? null : children}
  </Button>
);

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
const ImagePicker = ({ label = 'Image', value, onChange }) => {
  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = await fileToDataUrl(f);
    onChange(url);
  };
  return (
    <Field label={label}>
      <div className="space-y-2">
        <Input placeholder="image path or URL" defaultValue={value} onChange={(val) => onChange(val)} />
        <div className="flex items-center gap-2">
          <input type="file" accept="image/*" onChange={handleFile} />
          <div className="text-xs text-gray-600">Poți încărca o imagine (va fi salvată ca Data URL în date)</div>
        </div>
        {value ? (
          <div className="border rounded p-2 bg-white/70">
            <img src={value} alt="preview" className="max-h-40 object-contain" />
          </div>
        ) : null}
      </div>
    </Field>
  );
};

// Profile form editor
const ProfileForm = ({ value, onChange }) => {
  const update = (patch) => onChange({ ...value, ...patch });
  const social = value.social || {};
  return (
    <Container variant="form">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Name">
          <Input placeholder="Name" defaultValue={value.name} onChange={(val) => update({ name: val })} />
        </Field>
        <Field label="Status">
          <div className="flex items-center gap-2">
            <Toggle checked={!!value.status} onChange={(checked) => update({ status: checked })} />
            <span>Active</span>
          </div>
        </Field>
        <Field label="Avatar">
          <Input placeholder="avatar path" defaultValue={value.avatar} onChange={(val) => update({ avatar: val })} />
        </Field>
        <Field label="Location">
          <Input placeholder="Location" defaultValue={value.location} onChange={(val) => update({ location: val })} />
        </Field>
        <Field label="Experience">
          <Input placeholder="Experience" defaultValue={value.experience} onChange={(val) => update({ experience: val })} />
        </Field>
        <div className="md:col-span-2">
          <Field label="Description">
            <Input placeholder={value.description} onChange={(e) => update({ description: e.target.value })} />
          </Field>
        </div>
        <div className="md:col-span-2">
          <h4 className="font-semibold mb-2">Social</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Field label="GitHub">
              <Input placeholder="GitHub URL" defaultValue={social.github} onChange={(val) => update({ social: { ...social, github: val } })} />
            </Field>
            <Field label="LinkedIn">
              <Input placeholder="LinkedIn URL" defaultValue={social.linkedin} onChange={(val) => update({ social: { ...social, linkedin: val } })} />
            </Field>
            <Field label="Discord">
              <Input placeholder="Discord" defaultValue={social.discord} onChange={(val) => update({ social: { ...social, discord: val } })} />
            </Field>
          </div>
        </div>
        <div className="md:col-span-2">
          <PairListEditor
            label="Technologies (name + color)"
            items={value.technologies || []}
            onChange={(val) => update({ technologies: val })}
            fields={[
              { key: 'name', placeholder: 'e.g. javascript, node, MongoDB' },
              { key: 'color', placeholder: 'e.g. yellow, green, gray' },
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
              { key: 'color', placeholder: 'e.g. cyan, white, blue' },
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
  const add = () => onChange([...(values || []), '']);
  const update = (i, val) => {
    const next = [...(values || [])];
    next[i] = val;
    onChange(next);
  };
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
          </div>
        )}
        <div className="max-h-96 overflow-y-auto rounded border border-gray-200 bg-white/70 p-2">
          {!(values || []).length ? (
            <div className="text-sm text-gray-500">Nicio imagine adăugată încă.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {(values || []).map((v, i) => (
                <div key={i} className="relative group">
                  {v ? (
                    <img src={v} alt={`media-${i}`} className="w-full h-40 md:h-48 object-cover rounded border" />
                  ) : (
                    <div className="w-full h-40 md:h-48 rounded border bg-gray-100" />
                  )}
                  <div className="absolute top-2 right-2 opacity-90 group-hover:opacity-100">
                    <Button label="Remove" variant="red" onClick={() => remove(i)} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
            {fields.map((f, idx) => (
              <div key={f.key} className={fields.length === 2 ? 'col-span-5' : 'col-span-4'}>
                <Input placeholder={f.placeholder} defaultValue={it[f.key] || ''} onChange={(val) => update(i, f.key, val)} />
              </div>
            ))}
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
const ProjectsForm = ({ projects, onChange, collaborators = [] }) => {
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
          {/* Category editor supports both string and object forms */}
          <Field label="Category Name"><Input defaultValue={typeof current.category === 'object' ? (current.category?.name || '') : (current.category || '')} onChange={(val) => {
            const prev = current.category;
            if (prev && typeof prev === 'object') {
              updateCurrent({ category: { ...prev, name: val } });
            } else {
              updateCurrent({ category: { name: val, color: '' } });
            }
          }} placeholder="Category" /></Field>
          <Field label="Category Color"><Input defaultValue={typeof current.category === 'object' ? (current.category?.color || '') : ''} onChange={(val) => {
            const prev = current.category;
            if (prev && typeof prev === 'object') {
              updateCurrent({ category: { ...prev, color: val } });
            } else {
              updateCurrent({ category: { name: prev || '', color: val } });
            }
          }} placeholder="e.g. cyan/blue/green..." /></Field>
          <Field label="Date"><Input defaultValue={current.date} onChange={(val) => updateCurrent({ date: val })} placeholder="YYYY-MM-DD" /></Field>
          <ImagePicker label="Image" value={current.image} onChange={(val) => updateCurrent({ image: val })} />
          <div className="md:col-span-2">
            <Field label="Description">
              <Input placeholder={current.description} onChange={(e) => updateCurrent({ description: e.target.value })} />
            </Field>
          </div>
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <Toggle checked={!!current.special} onChange={(checked) => updateCurrent({ special: checked })} />
              <span>Special</span>
            </div>
          </div>
          <Field label="Collaboration">
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
          </Field>
          <div className="md:col-span-2">
            <StringListEditor label="Media (list)" values={current.media || []} onChange={(val) => updateCurrent({ media: val })} placeholder="path/to/media.png" enableUpload={true} />
          </div>
          <div className="md:col-span-2">
            <PairListEditor
              label="Technologies (name + color)"
              items={current.technologies || []}
              onChange={(val) => updateCurrent({ technologies: val })}
              fields={[
                { key: 'name', placeholder: 'name (e.g. javascript, node, MongoDB)' },
                { key: 'color', placeholder: 'color (e.g. yellow, green, gray)' },
              ]}
            />
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
      { id: (collaborators[collaborators.length - 1]?.id || 0) + 1, title: 'New', description: '', image: '', date: '', media: [], social: {} }
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
  const social = current.social || {};
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
          <Field label="Date"><Input defaultValue={current.date} onChange={(val) => updateCurrent({ date: val })} placeholder="YYYY-MM-DD" /></Field>
          <Field label="Image"><Input defaultValue={current.image} onChange={(val) => updateCurrent({ image: val })} placeholder="image path" /></Field>
          <div className="md:col-span-2">
            <Field label="Description">
              <Input placeholder={current.description} onChange={(e) => updateCurrent({ description: e.target.value })} />
            </Field>
          </div>
          <div className="md:col-span-2">
            <StringListEditor label="Media (list)" values={current.media || []} onChange={(val) => updateCurrent({ media: val })} placeholder="path/to/media.png" />
          </div>
          <div className="md:col-span-2">
            <h4 className="font-semibold mb-2">Social</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Field label="GitHub"><Input placeholder="GitHub URL" defaultValue={social.github} onChange={(val) => updateCurrent({ social: { ...social, github: val } })} /></Field>
              <Field label="LinkedIn"><Input placeholder="LinkedIn URL" defaultValue={social.linkedin} onChange={(val) => updateCurrent({ social: { ...social, linkedin: val } })} /></Field>
              <Field label="Discord"><Input placeholder="Discord" defaultValue={social.discord} onChange={(val) => updateCurrent({ social: { ...social, discord: val } })} /></Field>
            </div>
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

  const exampleProject = initialProjects[0];
  const exampleCollaborator = initialCollaborators[0];

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
                const options = ['Projects', 'Collaborators', 'Profile', 'Raw data.jsx'];
                const toValue = (label) => {
                  if (label === 'Projects') return 'projects';
                  if (label === 'Collaborators') return 'collaborators';
                  if (label === 'Profile') return 'profile';
                  return 'raw';
                };
                const fromValue = (val) => ({
                  projects: 'Projects',
                  collaborators: 'Collaborators',
                  profile: 'Profile',
                  raw: 'Raw data.jsx',
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
            {section === 'projects' && (
              <ProjectsForm projects={projects} onChange={setProjects} collaborators={collaborators} />
            )}
            {section === 'collaborators' && (
              <CollaboratorsForm collaborators={collaborators} onChange={setCollaborators} />
            )}
            {section === 'profile' && (
              <ProfileForm value={profile} onChange={setProfile} />
            )}
            {section === 'raw' && (
              <Container>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Generated data.jsx (read-only)</h3>
                  <textarea className="w-full h-96 p-3 font-mono text-xs rounded border border-gray-300 bg-white/90 text-gray-900" value={dataJsText} readOnly spellCheck={false} />
                  <div className="text-sm text-gray-700">
                    Use "Export data.jsx" to download and replace the file at <code>src/server/data.jsx</code> for permanent changes.
                  </div>
                </div>
              </Container>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
