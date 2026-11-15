import 'dotenv/config';
import { readdir, readFile } from 'node:fs/promises';
import { extname, relative, resolve } from 'node:path';
import dotenv from 'dotenv';
import {
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

dotenv.config({ path: resolve(import.meta.dirname, '../.env.local') });

const root = resolve(import.meta.dirname, '../..');
const uploadsRoot = resolve(root, 'public/uploads');
const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/+$/, '');
const bucket = process.env.R2_BUCKET;

if (!process.env.R2_ACCOUNT_ID || !bucket || !process.env.R2_ACCESS_KEY_ID
  || !process.env.R2_SECRET_ACCESS_KEY || !publicUrl) {
  throw new Error('R2 credentials and R2_PUBLIC_URL must be configured');
}

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const contentTypes = {
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
};

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const fullPath = resolve(directory, entry.name);
    return entry.isDirectory() ? filesIn(fullPath) : [fullPath];
  }));
  return nested.flat().filter((file) => !file.endsWith('.DS_Store'));
}

const files = await filesIn(uploadsRoot);
for (const file of files) {
  const relativePath = relative(uploadsRoot, file).split('/').join('/');
  const key = `portfolio/${relativePath}`;
  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: await readFile(file),
    ContentType: contentTypes[extname(file).toLowerCase()] || 'application/octet-stream',
    CacheControl: 'public, max-age=31536000, immutable',
  }));
}

const toR2Url = (value) => {
  if (!value?.startsWith('/uploads/')) return value;
  return `${publicUrl}/portfolio/${value.slice('/uploads/'.length)}`;
};

const readJson = (name) => readFile(resolve(root, 'public/data', name), 'utf8').then(JSON.parse);
const [profile, projects, collaborators] = await Promise.all([
  readJson('profile.json'),
  readJson('projects.json'),
  readJson('collaborators.json'),
]);

const replaceMedia = (item) => ({
  ...item,
  image: toR2Url(item.image),
  media: item.media?.map(toR2Url),
});

const remoteProfile = { ...profile, avatar: toR2Url(profile.avatar) };
const remoteProjects = projects.map(replaceMedia);
const remoteCollaborators = collaborators.map(replaceMedia);
const convexUrl = process.env.CONVEX_URL?.replace(/\/+$/, '');

async function mutation(path, args) {
  const response = await fetch(`${convexUrl}/api/mutation`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ path, args, format: 'json' }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.status !== 'success') {
    throw new Error(result.errorMessage || `Convex mutation failed (${response.status})`);
  }
}

await mutation('content:saveProfile', { profile: remoteProfile });
await mutation('content:replaceProjects', { projects: remoteProjects });
await mutation('content:replaceCollaborators', { collaborators: remoteCollaborators });

console.log(`Uploaded ${files.length} media files to R2 and updated Convex URLs.`);
