import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { resolve } from 'node:path';

dotenv.config({ path: resolve(import.meta.dirname, '.env.local') });
dotenv.config();
import { CORS_ALLOWED_ORIGIN, uploadsDir } from './src/config/paths.js';
import { createContentStore } from './src/convex.js';
import { registerAuthRoutes } from './src/routes/auth.js';
import { registerContentRoutes } from './src/routes/content.js';
import { registerStorageRoutes } from './src/routes/storage.js';

const app = express();
app.use(express.json());

const normalize = (s) => (s || '').replace(/\/$/, '');
const allowedOrigins = (CORS_ALLOWED_ORIGIN || '')
  .split(',')
  .map((s) => normalize(s.trim()))
  .filter(Boolean);

if (allowedOrigins.length) {
  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        const ok = allowedOrigins.includes(normalize(origin));
        cb(ok ? null : new Error('Not allowed by CORS'), ok);
      },
      credentials: true,
    })
  );
} else {
  app.use(cors());
}

app.use((err, _req, res, next) => {
  if (err && err.message === 'Not allowed by CORS') {
    return res.status(403).json({ ok: false, error: 'Forbidden origin (CORS)' });
  }
  return next(err);
});

app.use((req, res, next) => {
  if (!allowedOrigins.length) return next();
  const writeMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
  if (!writeMethods.has(req.method)) return next();
  const origin = req.headers.origin;
  if (!origin) return next();
  res.setHeader('Vary', 'Origin');
  if (!allowedOrigins.includes(normalize(origin))) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Forbidden origin (write):', origin, 'allowed:', allowedOrigins);
    }
    return res.status(403).json({ ok: false, error: 'Forbidden origin' });
  }
  return next();
});

app.use('/uploads', express.static(uploadsDir));

const store = createContentStore();
registerAuthRoutes(app);
registerContentRoutes(app, store);
registerStorageRoutes(app);

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err?.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      ok: false,
      error: `File too large. Maximum allowed size is ${process.env.UPLOAD_MAX_MB || 100} MB`,
    });
  }
  res.status(500).json({ ok: false, error: 'Internal server error' });
});

export default app;
