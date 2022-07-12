export function sortMDByDate(files) {
	return files.sort(
		(a, b) =>
			new Date(b.frontmatter.publishDate).valueOf() -
			new Date(a.frontmatter.publishDate).valueOf()
	);
}

// This function expects the @arg posts to be sorted by sortMDByDate()
export function getPreviousAndNextPosts(currentSlug: string, posts: IPost[]) {
	const index = posts.findIndex(({ url }) => url === currentSlug);
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
		post.frontmatter.tags?.map((tag) => allTags.add(tag.toLowerCase()));
	});
	return [...allTags];
}

export function getAllTagsWithCount(posts: IPost[] = []): {
	[key: string]: number;
} {
	return posts.reduce((prev, post) => {
		const currTags = { ...prev };
		post.frontmatter.tags?.forEach(function (tag) {
			currTags[tag] = (currTags[tag] || 0) + 1;
		});
		return currTags;
	}, {});
}

export function toggleClass(element: HTMLElement, className: string) {
	element.classList.toggle(className);
}

export function elementHasClass(element: HTMLElement, className: string) {
	return element.classList.contains(className);
}


export function getLocaleTime(
	date: number | Date,
	options: Intl.DateTimeFormatOptions = {},
	locale: string | string[] = "en-GB"
) {
	const formatOptions: Intl.DateTimeFormatOptions = {
		day: "numeric",
		month: "long",
		year: "numeric",
		...options,
	};
	return new Intl.DateTimeFormat(locale, formatOptions).format(date);
}
