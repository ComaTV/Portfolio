import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

const tag = v.object({ name: v.string(), color: v.string() });
const link = v.object({ name: v.string(), url: v.string() });
const socialLink = v.object({ name: v.string(), link: v.string() });
const media = v.union(v.string(), v.object({ type: v.string(), url: v.string() }));

export default defineSchema({
  settings: defineTable({
    key: v.string(),
    profile: v.any(),
  }).index('by_key', ['key']),
  projects: defineTable({
    legacyId: v.number(),
    title: v.string(),
    description: v.string(),
    image: v.string(),
    media: v.array(media),
    technologies: v.array(tag),
    category: tag,
    special: v.boolean(),
    date: v.string(),
    linksList: v.array(link),
    collaboration: v.string(),
  }).index('by_legacy_id', ['legacyId']),
  collaborators: defineTable({
    legacyId: v.number(),
    title: v.string(),
    description: v.string(),
    image: v.string(),
    media: v.array(media),
    date: v.string(),
    social: v.array(socialLink),
  }).index('by_legacy_id', ['legacyId']),
});