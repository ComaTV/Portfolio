import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

export const ROOT_DIR = resolve(import.meta.dirname, '../..');
export const dataDir = resolve(ROOT_DIR, 'data');
export const uploadsDir = resolve(ROOT_DIR, 'uploads');
export const PORT = Number(process.env.PORT || 8787);
export const CORS_ALLOWED_ORIGIN = process.env.CORS_ALLOWED_ORIGIN || '';

mkdirSync(dataDir, { recursive: true });
mkdirSync(uploadsDir, { recursive: true });
