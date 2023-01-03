import type { GetStaticPaths, Page } from "astro";

interface BaseFrontmatter {
	slug: string;
	url: URL;
}

interface IElement {
	readonly as?: keyof HTMLElementTagNameMap;
}

interface PaginationLink {
	url: string;
	text?: string;
	srLabel?: string;
}

export type { BaseFrontmatter, Page, GetStaticPaths, IElement, PaginationLink };
