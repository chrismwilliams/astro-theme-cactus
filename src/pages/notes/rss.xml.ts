import { getCollection } from "astro:content";
import { siteConfig } from "@/site.config";
import { collectionDateSort } from "@/utils/date";
import rss from "@astrojs/rss";

export const GET = async () => {
	const allNotes = await getCollection("note");
	const pinnedNotes = allNotes.filter(note => note.data.pinned);
	const unpinnedNotes = allNotes.filter(note => !note.data.pinned).sort(collectionDateSort);
	const notes = [...pinnedNotes, ...unpinnedNotes];

	return rss({
		title: siteConfig.title,
		description: siteConfig.description,
		site: import.meta.env.SITE,
		items: notes.map((note) => ({
			title: note.data.title,
			pubDate: note.data.publishDate,
			link: `notes/${note.id}/`,
		})),
	});
};
