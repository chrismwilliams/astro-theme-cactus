import type { BaseFrontmatter } from "./shared";

interface Post extends BaseFrontmatter {
	title: string;
	description: string;
	publishDate: Date;
	tags?: string[];
}

export type { Post };
