import type { MDXInstance } from "@/data/shared";
import type { Post } from "@/data/posts";

export function sortMDByDate(posts: MDXInstance<Post>[] = []) {
	return posts.sort(
		(a, b) =>
			new Date(b.frontmatter.publishDate).valueOf() - new Date(a.frontmatter.publishDate).valueOf()
	);
}

export function getUniqueTags(posts: MDXInstance<Post>[] = []) {
	const uniqueTags = new Set<string>();
	posts.forEach((post) => {
		post.frontmatter.tags?.map((tag) => uniqueTags.add(tag.toLowerCase()));
	});
	return [...uniqueTags];
}

export function getUniqueTagsWithCount(posts: MDXInstance<Post>[] = []): {
	[key: string]: number;
} {
	return posts.reduce((prev, post) => {
		const runningTags: { [key: string]: number } = { ...prev };
		post.frontmatter.tags?.forEach(function (tag) {
			runningTags[tag] = (runningTags[tag] || 0) + 1;
		});
		return runningTags;
	}, {});
}
