import { requireAdmin } from '../auth.js';

export function registerAuthRoutes(app) {
  app.get('/admin/validate', requireAdmin, (_req, res) => {
    res.json({ ok: true });
  });
}