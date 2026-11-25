import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: resolve(import.meta.dirname, '../.env.local') });

const root = resolve(import.meta.dirname, '../..');
const readJson = (name) => readFile(resolve(root, 'public/data', name), 'utf8').then(JSON.parse);

async function runMutation(path, args) {
  const convexUrl = process.env.CONVEX_URL?.replace(/\/+$/, '');
  if (!convexUrl) throw new Error('CONVEX_URL is not configured');

  const response = await fetch(`${convexUrl}/api/mutation`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ path, args, format: 'json' }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.status !== 'success') {
    throw new Error(result.errorMessage || `Convex mutation failed (${response.status})`);
  }
  return result.value;
}

const [profile, projects, collaborators] = await Promise.all([
  readJson('profile.json'),
  readJson('projects.json'),
  readJson('collaborators.json'),
]);

await runMutation('content:saveProfile', { profile });
await runMutation('content:replaceProjects', { projects });
await runMutation('content:replaceCollaborators', { collaborators });

console.log(`Seeded Convex: ${projects.length} projects, ${collaborators.length} collaborations.`);