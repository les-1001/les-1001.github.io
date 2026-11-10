import { defineCollection, reference } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// One Markdown file per project in src/content/projects/.
const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    status: z.enum(["live", "in-progress", "upcoming", "planned"]),
    tabLabel: z.string().optional(), // short name for the home-page tab if the title is long
    order: z.number(), // smaller numbers show first
    role: z.string().optional(), // e.g. "NUS Orbital 2026, team of 2"
    stack: z.array(z.string()).default([]),
    links: z
      .array(z.object({ label: z.string(), url: z.string() }))
      .default([]),
  }),
});

// One Markdown file per update in src/content/log/.
// The file name becomes the URL, so use something like 2026-11-09-short-title.md.
const log = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/log" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    project: reference("projects"),
  }),
});

export const collections = { projects, log };
