import { getCollection } from "astro:content";
import { siteConfig } from "@/site.config";
import rss from "@astrojs/rss";

export const GET = async () => {
	const notes = await getCollection("note");

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
