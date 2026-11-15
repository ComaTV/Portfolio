import { requireAdmin } from '../auth.js';
import { deleteR2Prefix } from '../r2.js';

const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);

export function registerContentRoutes(app, store) {
  app.get('/content', async (_req, res, next) => {
    try {
      res.json(await store.getAll());
    } catch (error) {
      next(error);
    }
  });

  for (const [path, key] of [['/profile', 'profile'], ['/projects', 'projects'], ['/collaborators', 'collaborators']]) {
    app.get(path, async (_req, res, next) => {
      try {
        res.json((await store.getAll())[key]);
      } catch (error) {
        next(error);
      }
    });
  }

  app.put('/profile', requireAdmin, async (req, res, next) => {
    try {
      if (!isObject(req.body) || typeof req.body.name !== 'string') {
        return res.status(400).json({ ok: false, error: 'A profile name is required' });
      }
      res.json(await store.saveProfile(req.body));
    } catch (error) {
      next(error);
    }
  });

  for (const [path, key, save] of [
    ['/projects', 'projects', 'saveProjects'],
    ['/collaborators', 'collaborators', 'saveCollaborators'],
  ]) {
    app.put(path, requireAdmin, async (req, res, next) => {
      try {
        if (!Array.isArray(req.body)) return res.status(400).json({ ok: false, error: `${key} must be an array` });
        res.json({ [key]: await store[save](req.body) });
      } catch (error) {
        next(error);
      }
    });
  }

  for (const [path, key, save] of [
    ['/projects/:id', 'projects', 'saveProjects'],
    ['/collaborators/:id', 'collaborators', 'saveCollaborators'],
  ]) {
    app.delete(path, requireAdmin, async (req, res, next) => {
      try {
        const content = await store.getAll();
        const items = content[key].filter((item) => String(item.id) !== req.params.id);
        await deleteR2Prefix(`portfolio/${key === 'projects' ? 'project' : 'collaboration'}/${req.params.id}/`);
        res.json({ [key]: await store[save](items) });
      } catch (error) {
        next(error);
      }
    });
  }
}