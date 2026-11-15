import crypto from 'node:crypto';

const configuredToken = () => process.env.ADMIN_TOKEN?.trim() || '';

export function requireAdmin(req, res, next) {
  const expected = configuredToken();
  const received = req.get('x-admin-token') || '';

  if (!expected) {
    return res.status(503).json({ ok: false, error: 'ADMIN_TOKEN is not configured' });
  }

  const matches = received.length === expected.length
    && crypto.timingSafeEqual(Buffer.from(received), Buffer.from(expected));
  if (!matches) return res.status(401).json({ ok: false, error: 'Invalid admin token' });
  return next();
}