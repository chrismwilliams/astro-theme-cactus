import type { GetStaticPaths, Page } from "astro";

interface IElement {
	readonly as?: keyof HTMLElementTagNameMap;
}

interface PaginationLink {
	url: string;
	text?: string;
	srLabel?: string;
}

export type { Page, GetStaticPaths, IElement, PaginationLink };
