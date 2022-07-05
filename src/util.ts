export function sortMDByDate(files) {
	return files.sort(
		(a, b) =>
			new Date(b.frontmatter.publishDate).valueOf() -
			new Date(a.frontmatter.publishDate).valueOf()
	);
}

export function blogLinksFromFrontmatter(
	files
): { title: string; url: string }[] {
	return files.map((file) => {
		return {
			title: file.frontmatter.title,
			url: file.url,
		};
	});
}

// This function expects the @arg postArr to be sorted by sortMDByDate()
export function getPreviousAndNextPosts(
	currentSlug: string,
	postArr: { title: string; url: string }[]
) {
	const index = postArr.findIndex(({ url }) => url === currentSlug);
	return {
		prev: postArr[index + 1] ?? null,
		next: postArr[index - 1] ?? null,
	};
}

export function getAllTagsFromPosts(posts, withCount = false) {
	if (withCount) {
		return posts.reduce((prev, post) => {
			const currTags = { ...prev };
			const postTags = post.frontmatter.tags;
			postTags.forEach(function (tag) {
				currTags[tag] = (currTags[tag] || 0) + 1;
			});
			return currTags;
		}, {});
	}
	const allTags = new Set();
	posts.forEach((post) => {
		post.frontmatter.tags &&
			post.frontmatter.tags.map((tag) => allTags.add(tag.toLowerCase()));
	});
	return [...allTags];
}

export function toggleClass(element: HTMLElement, className: string) {
	element.classList.toggle(className);
}

export function elementHasClass(element: HTMLElement, className: string) {
	return element.classList.contains(className)
}