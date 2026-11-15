import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query('settings').withIndex('by_key', (q) => q.eq('key', 'profile')).unique();
    const projects = await ctx.db.query('projects').collect();
    const collaborators = await ctx.db.query('collaborators').collect();
    return {
      profile: settings?.profile || {},
      projects: projects.map(({ _id, _creationTime, legacyId, ...project }) => ({ id: legacyId, ...project })),
      collaborators: collaborators.map(({ _id, _creationTime, legacyId, ...item }) => ({ id: legacyId, ...item })),
    };
  },
});

export const saveProfile = mutation({
  args: { profile: v.any() },
  handler: async (ctx, { profile }) => {
    const existing = await ctx.db.query('settings').withIndex('by_key', (q) => q.eq('key', 'profile')).unique();
    if (existing) await ctx.db.patch(existing._id, { profile });
    else await ctx.db.insert('settings', { key: 'profile', profile });
    return profile;
  },
});

export const replaceProjects = mutation({
  args: { projects: v.array(v.any()) },
  handler: async (ctx, { projects }) => {
    for (const item of await ctx.db.query('projects').collect()) await ctx.db.delete(item._id);
    for (const project of projects) {
      const { id, ...value } = project;
      await ctx.db.insert('projects', { ...value, legacyId: Number(id) });
    }
    return projects;
  },
});

export const replaceCollaborators = mutation({
  args: { collaborators: v.array(v.any()) },
  handler: async (ctx, { collaborators }) => {
    for (const item of await ctx.db.query('collaborators').collect()) await ctx.db.delete(item._id);
    for (const collaborator of collaborators) {
      const { id, ...value } = collaborator;
      await ctx.db.insert('collaborators', { ...value, legacyId: Number(id) });
    }
    return collaborators;
  },
});