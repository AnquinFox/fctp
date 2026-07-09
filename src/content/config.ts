import { defineCollection, z } from 'astro:content';

const guides = defineCollection({
  schema: z.object({
    title: z.string(),
    pageSlug: z.string(),
    city: z.string(),
    country: z.string().default('china'),
    lang: z.enum(['en', 'zh']).default('en'),
    duration: z.string().optional(),
    tags: z.array(z.string()).default([]),
    cover: z.string().optional(),
    published: z.date().optional(),
    updated: z.date().optional(),
    alternateSlug: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { guides };
