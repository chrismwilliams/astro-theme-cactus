import type { CollectionEntry } from "astro:content";

export function sortMDByDate(posts: CollectionEntry<"post">[]) {
	return posts.sort((a, b) => {
		const aDate = new Date(a.data.updatedDate ?? a.data.publishDate).valueOf();
		const bDate = new Date(b.data.updatedDate ?? b.data.publishDate).valueOf();
		return bDate - aDate;
	});
}

export function getUniqueTags(posts: CollectionEntry<"post">[]) {
	const tags = posts.flatMap((post) => [...post.data.tags]);
  return [...new Set(tags)];
}

export function getUniqueTagsWithCount(posts: CollectionEntry<"post">[]): Record<string, number> {
	return posts.reduce((acc, post) => {
		const runningTags: Record<string, number> = { ...acc };
		post.data.tags.forEach((tag) => {
			runningTags[tag] = (runningTags[tag] || 0) + 1;
		});
		return runningTags;
	}, {});
}
