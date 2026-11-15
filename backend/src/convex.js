import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { dataDir } from './config/paths.js';

const files = {
  profile: resolve(dataDir, 'profile.json'),
  projects: resolve(dataDir, 'projects.json'),
  collaborators: resolve(dataDir, 'collaborators.json'),
};
const seedFiles = {
  profile: resolve(dataDir, '../../public/data/profile.json'),
  projects: resolve(dataDir, '../../public/data/projects.json'),
  collaborators: resolve(dataDir, '../../public/data/collaborators.json'),
};

const defaults = { profile: {}, projects: [], collaborators: [] };

async function readLocal(key) {
  try {
    return JSON.parse(await readFile(files[key], 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    try {
      return JSON.parse(await readFile(seedFiles[key], 'utf8'));
    } catch (seedError) {
      if (seedError.code !== 'ENOENT') throw seedError;
      return defaults[key];
    }
  }
}

async function writeLocal(key, value) {
  await writeFile(files[key], `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  return value;
}

async function convexCall(kind, path, args) {
  const url = process.env.CONVEX_URL?.replace(/\/+$/, '');
  if (!url) return null;

  const response = await fetch(`${url}/api/${kind}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(process.env.CONVEX_DEPLOY_KEY
        ? { authorization: `Bearer ${process.env.CONVEX_DEPLOY_KEY}` }
        : {}),
    },
    body: JSON.stringify({ path, args, format: 'json' }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.status !== 'success') {
    throw new Error(result.errorMessage || `Convex ${kind} failed (${response.status})`);
  }
  return result.value;
}

export function createContentStore() {
  return {
    async getAll() {
      const remote = await convexCall('query', 'content:getAll', {});
      if (remote) return remote;
      const [profile, projects, collaborators] = await Promise.all(
        Object.keys(files).map((key) => readLocal(key)),
      );
      return { profile, projects, collaborators };
    },
    async saveProfile(profile) {
      const remote = await convexCall('mutation', 'content:saveProfile', { profile });
      return remote || writeLocal('profile', profile);
    },
    async saveProjects(projects) {
      const remote = await convexCall('mutation', 'content:replaceProjects', { projects });
      return remote || writeLocal('projects', projects);
    },
    async saveCollaborators(collaborators) {
      const remote = await convexCall('mutation', 'content:replaceCollaborators', { collaborators });
      return remote || writeLocal('collaborators', collaborators);
    },
  };
}