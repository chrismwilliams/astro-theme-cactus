// Heavy inspiration from starlight: https://github.com/withastro/starlight/blob/main/packages/starlight/utils/generateToC.ts
import type { MarkdownHeading } from "astro";

export interface TocItem extends MarkdownHeading {
	children: TocItem[];
}

interface TocOpts {
	maxHeadingLevel?: number | undefined;
	minHeadingLevel?: number | undefined;
}

/** Inject a ToC entry as deep in the tree as its `depth` property requires. */
function injectChild(items: TocItem[], item: TocItem): void {
	const lastItem = items.at(-1);
	if (!lastItem || lastItem.depth >= item.depth) {
		items.push(item);
	} else {
		injectChild(lastItem.children, item);
		return;
	}
}

export function generateToc(
	headings: ReadonlyArray<MarkdownHeading>,
	{ maxHeadingLevel = 4, minHeadingLevel = 2 }: TocOpts = {},
) {
	// by default this ignores/filters out h1 and h5 heading(s)
	const bodyHeadings = headings.filter(
		({ depth }) => depth >= minHeadingLevel && depth <= maxHeadingLevel,
	);
	const toc: Array<TocItem> = [];

	for (const heading of bodyHeadings) injectChild(toc, { ...heading, children: [] });

	return toc;
}
