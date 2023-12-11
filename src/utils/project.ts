import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";

/** Note: this function filters out draft posts based on the environment */
export async function getAllProjects() {
    return await getCollection("project", ({ data }) => {
        return import.meta.env.PROD ? data.draft !== true : true;
    });
}

export function sortProjectsByDate(projects: Array<CollectionEntry<"project">>) {
    return projects.sort((a, b) => {
        const aDate = new Date(a.data.updatedDate ?? a.data.publishDate).valueOf();
        const bDate = new Date(b.data.updatedDate ?? b.data.publishDate).valueOf();
        return bDate - aDate;
    });
}

/** Note: This function doesn't filter draft posts, pass it the result of getAllPosts above to do so. */
export function getAllTags(projects: Array<CollectionEntry<"project">>) {
    return projects.flatMap((project) => [...project.data.tags]);
}

/** Note: This function doesn't filter draft posts, pass it the result of getAllPosts above to do so. */
export function getUniqueProjectTags(projects: Array<CollectionEntry<"project">>) {
    return [...new Set(getAllTags(projects))];
}

/** Note: This function doesn't filter draft posts, pass it the result of getAllPosts above to do so. */
export function getUniqueProjectTagsWithCount(
    projects: Array<CollectionEntry<"project">>,
): Array<[string, number]> {
    return [
        ...getAllTags(projects).reduce(
            (acc, t) => acc.set(t, (acc.get(t) || 0) + 1),
            new Map<string, number>(),
        ),
    ].sort((a, b) => b[1] - a[1]);
}
