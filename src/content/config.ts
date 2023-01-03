import { z, defineCollection } from "astro:content";

const post = defineCollection({
	schema: {
		title: z.string(),
		description: z.string(),
		publishDate: z.string().transform((str) => new Date(str)),
		tags: z.array(z.string()).default([]),
	},
});

export const collections = { post };
