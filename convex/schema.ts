import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    projects: defineTable({
        title: v.string(),
        description: v.string(),
        date: v.string(),
        special:v.boolean(),
        technologies: v.array(v.string()),
        category: v.array(v.string()),
        media: v.array(
            v.object({
                type: v.string(),
                url:v.string()
            })
        ),
        linksList:v.array(
            v.object({
                name: v.string(),
                url: v.string()
            })
        ),
        collaboration: v.array(
            v.object({
                name: v.string(),
                id: v.number()
            })
        )
    })
})