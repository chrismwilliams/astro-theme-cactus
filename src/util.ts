export function sortMDByDate(files) {
	return files.sort(
		(a, b) =>
			new Date(b.frontmatter.publishDate).valueOf() -
			new Date(a.frontmatter.publishDate).valueOf()
	);
}

export function blogLinksFromFrontmatter(files): { title: string, url: string }[] {
	return files.map((file) => {
		return {
			title: file.frontmatter.title,
			url: file.url
		}
	});
}

export function getPreviousAndNextPosts(
	currentSlug: string,
	postArr: { title: string, url: string }[]
) {
	const index = postArr.findIndex(({ url }) => url === currentSlug)
	return {
		prev: postArr[index - 1] ?? null,
		next: postArr[index + 1] ?? null,
	};
}

export function getInitialTheme() {
	const isDark = getDocumentClassList().contains("dark");
	const storageTheme = localStorage.getItem("theme");
	if (storageTheme) return storageTheme;
	return isDark ? "dark" : "light";
}

export function getDocumentClassList() {
	return document.documentElement.classList;
}
