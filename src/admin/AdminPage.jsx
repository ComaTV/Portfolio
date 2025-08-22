import React, { useMemo, useState, useEffect } from 'react';
import { Button, Container, Input, Checkbox } from 'mc-ui-comatv';
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

const JsonEditor = ({ label, value, onChange, example }) => {
  const [text, setText] = useState(() => JSON.stringify(value, null, 2));
  const [error, setError] = useState(null);

  useEffect(() => {
    setText(JSON.stringify(value, null, 2));
  }, [value]);

  const handleApply = () => {
    try {
      const parsed = JSON.parse(text);
      onChange(parsed);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{label}</h3>
        <div className="flex items-center gap-2">
          <Button label="Apply JSON" variant="green" onClick={handleApply} />
        </div>
      </div>
      <Container>
        <textarea
          className="w-full h-80 p-3 font-mono text-sm rounded border border-gray-300 bg-white/90 text-gray-900"
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
        />
      </Container>
      {error && (
        <div className="text-red-600 text-sm">JSON error: {error}</div>
      )}
      {example && (
        <details className="text-sm text-gray-700">
          <summary className="cursor-pointer select-none">See example format</summary>
          <pre className="mt-2 p-2 rounded bg-gray-100 overflow-auto">
            {JSON.stringify(example, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

// Simple labeled field wrapper for Input
const Field = ({ label, children }) => (
  <div className="mb-3">
    <div className="text-sm font-medium mb-1">{label}</div>
    {children}
  </div>
);

// (Removed) CategoryColorsForm – colors are now stored per project under category

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
          <Checkbox label="Active" checked={!!value.status} onChange={(checked) => update({ status: checked })} />
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
            <textarea className="w-full h-28 p-3 font-sans text-sm rounded border border-gray-300 bg-white/90 text-gray-900" defaultValue={value.description} onChange={(e) => update({ description: e.target.value })} />
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
      </div>
    </Container>
  );
};

// Minimal array-of-strings editor (for media)
const StringListEditor = ({ label, values, onChange, placeholder }) => {
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
  return (
    <Field label={label}>
      <div className="space-y-2">
        {(values || []).map((v, i) => (
          <div key={i} className="flex gap-2">
            <div className="flex-1"><Input placeholder={placeholder} defaultValue={v} onChange={(val) => update(i, val)} /></div>
            <Button label="Remove" variant="red" onClick={() => remove(i)} />
          </div>
        ))}
        <Button label="Add" variant="green" onClick={add} />
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
const ProjectsForm = ({ projects, onChange }) => {
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
        <div className="text-sm">Selected:</div>
        <div className="flex gap-2 overflow-x-auto">
          {projects.map((p, i) => (
            <Button key={p.id} label={`#${p.id}`} variant={i === index ? 'green' : 'default'} onClick={() => setIndex(i)} />
          ))}
        </div>
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
          <Field label="Image"><Input defaultValue={current.image} onChange={(val) => updateCurrent({ image: val })} placeholder="image path" /></Field>
          <div className="md:col-span-2">
            <Field label="Description"><textarea className="w-full h-28 p-3 font-sans text-sm rounded border border-gray-300 bg-white/90 text-gray-900" defaultValue={current.description} onChange={(e) => updateCurrent({ description: e.target.value })} /></Field>
          </div>
          <div className="md:col-span-2">
            <Checkbox label="Special" checked={!!current.special} onChange={(checked) => updateCurrent({ special: checked })} />
          </div>
          <Field label="Collaboration"><Input defaultValue={current.collaboration || ''} onChange={(val) => updateCurrent({ collaboration: val })} placeholder="Collaborator name (optional)" /></Field>
          <div className="md:col-span-2">
            <StringListEditor label="Media (list)" values={current.media || []} onChange={(val) => updateCurrent({ media: val })} placeholder="path/to/media.png" />
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
        <div className="text-sm">Selected:</div>
        <div className="flex gap-2 overflow-x-auto">
          {collaborators.map((c, i) => (
            <Button key={c.id} label={`#${c.id}`} variant={i === index ? 'green' : 'default'} onClick={() => setIndex(i)} />
          ))}
        </div>
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
            <Field label="Description"><textarea className="w-full h-28 p-3 font-sans text-sm rounded border border-gray-300 bg-white/90 text-gray-900" defaultValue={current.description} onChange={(e) => updateCurrent({ description: e.target.value })} /></Field>
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

  // Save to localStorage automatically
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
      <div className="backdrop-blur-sm bg-white/70 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">Admin Editor</h1>
          <div className="flex items-center gap-2">
            <Button label="Export data.jsx" variant="green" onClick={downloadDataJs} />
            <Button label="Reset to repo" variant="purple" onClick={resetToRepo} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-12 gap-4">
          <aside className="col-span-12 md:col-span-3">
            <div className="flex md:flex-col gap-2">
              <SectionButton active={section === 'projects'} onClick={() => setSection('projects')}>Projects</SectionButton>
              <SectionButton active={section === 'collaborators'} onClick={() => setSection('collaborators')}>Collaborators</SectionButton>
              <SectionButton active={section === 'profile'} onClick={() => setSection('profile')}>Profile</SectionButton>
              <SectionButton active={section === 'raw'} onClick={() => setSection('raw')}>Raw data.jsx</SectionButton>
            </div>
          </aside>
          <main className="col-span-12 md:col-span-9">
            {section === 'projects' && (
              <ProjectsForm projects={projects} onChange={setProjects} />
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
