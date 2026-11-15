import app from '../backend/app.js';

export function handler(req, res) {
  if (req.url === '/api' || req.url.startsWith('/api/')) {
    req.url = req.url.slice('/api'.length) || '/';
  }
  return app(req, res);
}

export default handler;
