import { z, defineCollection } from "astro:content";

function removeDupsAndLowerCase(array: string[]) {
	if (!array.length) return array;
	const lowercaseItems = array.map((str) => str.toLowerCase());
	const distinctItems = new Set(lowercaseItems);
	return Array.from(distinctItems);
}

const post = defineCollection({
	schema: z.object({
		title: z.string().max(100),
		description: z.string().min(50).max(500),
		publishDate: z.string().transform((str) => new Date(str)),
		tags: z.array(z.string()).default([]).transform(removeDupsAndLowerCase),
		ogImage: z.string().optional(),
		coverImage: z.string().optional(),
		coverAlt: z.string().default(""),
		series: z.string().optional(),
		featured: z.boolean().default(false),
		status: z.string().optional(),
		researchArea: z.enum(["expertise", "interaction", "collective-outcomes", "foundations", "industry"]).default("foundations"),
		order: z.number().default(50),
		draft: z.boolean().default(false),
		canonicalURL: z.string().url().optional(),
	}),
});

export const collections = { post };
