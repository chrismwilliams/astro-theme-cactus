export function sortMDByDate(files) {
	return files.sort(
		(a, b) =>
			new Date(b.frontmatter.publishDate).valueOf() -
			new Date(a.frontmatter.publishDate).valueOf()
	);
}

export function slugsFromFrontmatter(files): string[] {
	return files.map((file) => file.url);
}

export function getPreviousAndNextSlugs(
	currentSlug: string,
	slugArr: string[]
) {
	let index = slugArr.indexOf(currentSlug);
	return {
		prev: slugArr[index - 1] ?? null,
		next: slugArr[index + 1] ?? null,
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
