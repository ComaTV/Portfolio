import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import sharp from 'sharp';
import { requireAdmin } from '../auth.js';
import { uploadsDir } from '../config/paths.js';
import { isR2Configured, uploadToR2 } from '../r2.js';

const maxUploadMb = Number(process.env.UPLOAD_MAX_MB || 100);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxUploadMb * 1024 * 1024 },
});
const videoExtensions = new Set(['.mp4', '.webm', '.mov', '.ogv']);

export function registerStorageRoutes(app) {
  app.post('/upload', requireAdmin, upload.array('files', 12), async (req, res, next) => {
    try {
      const folder = String(req.query.folder || 'project').replace(/[^a-z0-9_-]/gi, '');
      const id = String(req.query.id || 'item').replace(/[^a-z0-9_-]/gi, '');
      const kind = req.query.kind === 'thumbnail' ? 'thumbnail' : 'media';
      const files = [];
      for (const [index, file] of (req.files || []).entries()) {
        const isVideo = file.mimetype.startsWith('video/');
        if (isVideo && kind === 'thumbnail') {
          return res.status(400).json({ ok: false, error: 'Videos cannot be used as thumbnails' });
        }
        const extension = videoExtensions.has(path.extname(file.originalname).toLowerCase())
          ? path.extname(file.originalname).toLowerCase()
          : '.mp4';
        const name = isVideo
          ? `${index + 1}-${crypto.randomUUID()}${extension}`
          : kind === 'thumbnail' ? 'thumbnail.webp' : `${index + 1}-${crypto.randomUUID()}.webp`;
        const key = `portfolio/${folder}/${id}/${kind === 'media' ? 'media/' : ''}${name}`;
        const body = isVideo
          ? file.buffer
          : await sharp(file.buffer).webp({ quality: 85 }).toBuffer();
        const contentType = isVideo ? file.mimetype : 'image/webp';
        if (isR2Configured()) {
          files.push({
            url: await uploadToR2({ key, body, contentType }),
            ...(isVideo ? { type: 'video' } : {}),
          });
        } else {
          const target = path.join(uploadsDir, folder, id, kind === 'media' ? 'media' : '');
          fs.mkdirSync(target, { recursive: true });
          const destination = path.join(target, name);
          fs.writeFileSync(destination, body);
          const relative = path.relative(uploadsDir, destination).split(path.sep).join('/');
          files.push({ url: `/uploads/${relative}`, ...(isVideo ? { type: 'video' } : {}) });
        }
      }
      res.json({ files });
    } catch (error) {
      next(error);
    }
  });
}