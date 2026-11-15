import app from '../backend/app.js';

export function handler(req, res) {
  const route = req.query?.__route;
  if (route) {
    const routePath = Array.isArray(route) ? route.join('/') : String(route);
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(req.query)) {
      if (key === '__route') continue;
      for (const item of Array.isArray(value) ? value : [value]) {
        if (item != null) query.append(key, String(item));
      }
    }
    req.url = `/${routePath}${query.toString() ? `?${query}` : ''}`;
  } else if (req.url === '/api' || req.url.startsWith('/api/')) {
    req.url = req.url.slice('/api'.length) || '/';
  }
  return app(req, res);
}

export default handler;
