import type { APIContext, GetStaticPathsResult } from "astro";
import type { SatoriOptions } from "satori";
import { getCollection, getEntryBySlug } from "astro:content";
import satori from "satori";
import { html } from "satori-html";
import { Resvg } from "@resvg/resvg-js";
import { siteConfig } from "@/site-config";

async function fetchFont(url: string) {
	try {
		const response = await fetch(url);
		if (!response.ok) throw new Error(`Failed to fetch font: ${response.statusText}`);
		return await response.arrayBuffer();
	} catch (error) {
		console.error(`Error fetching font from ${url}:`, error);
		return null;
	}
}

const [monoFontReg, monoFontBold] = await Promise.all([
	fetchFont("https://api.fontsource.org/v1/fonts/roboto-mono/latin-400-normal.ttf"),
	fetchFont("https://api.fontsource.org/v1/fonts/roboto-mono/latin-700-normal.ttf"),
]);

const fallbackPng = Buffer.from(
	"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wn0S7kAAAAASUVORK5CYII=",
	"base64"
);

const ogOptions: SatoriOptions = {
	width: 1200,
	height: 630,
	// debug: true,
	embedFont: true,
	fonts: [
		...(monoFontReg
			? [
					{
						name: "Roboto Mono",
						data: monoFontReg,
						weight: 400 as const,
						style: "normal" as const,
					},
				]
			: []),
		...(monoFontBold
			? [
					{
						name: "Roboto Mono",
						data: monoFontBold,
						weight: 700 as const,
						style: "normal" as const,
					},
				]
			: []),
	],
};

const markup = (title: string, pubDate: string) => html`<div
	tw="flex flex-col w-full h-full bg-[#1d1f21] text-[#c9cacc]"
>
	<div tw="flex flex-col flex-1 w-full p-10 justify-center">
		<p tw="text-2xl mb-6">${pubDate}</p>
		<h1 tw="text-6xl font-bold leading-snug text-white">${title}</h1>
	</div>
	<div tw="flex items-center justify-between w-full p-10 border-t border-[#2bbc89] text-xl">
		<div tw="flex items-center">
			<svg height="60" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 272 480">
				<path
					d="M181.334 93.333v-40L226.667 80v40l-45.333-26.667ZM136.001 53.333 90.667 26.667v426.666L136.001 480V53.333Z"
					fill="#B04304"
				></path>
				<path
					d="m136.001 119.944 45.333-26.667 45.333 26.667-45.333 26.667-45.333-26.667ZM90.667 26.667 136.001 0l45.333 26.667-45.333 26.666-45.334-26.666ZM181.334 53.277l45.333-26.666L272 53.277l-45.333 26.667-45.333-26.667ZM0 213.277l45.333-26.667 45.334 26.667-45.334 26.667L0 213.277ZM136 239.944l-45.333-26.667v53.333L136 239.944Z"
					fill="#FF5D01"
				></path>
				<path
					d="m136 53.333 45.333-26.666v120L226.667 120V80L272 53.333V160l-90.667 53.333v240L136 480V306.667L45.334 360V240l45.333-26.667v53.334L136 240V53.333Z"
					fill="#53C68C"
				></path>
				<path d="M45.334 240 0 213.334v120L45.334 360V240Z" fill="#B04304"></path>
			</svg>
			<p tw="ml-3 font-semibold">${siteConfig.title}</p>
		</div>
		<p>by ${siteConfig.author}</p>
	</div>
</div>`;

export async function GET({ params: { slug } }: APIContext) {
	if (!monoFontReg && !monoFontBold) {
		return new Response(fallbackPng, {
			headers: {
				"Content-Type": "image/png",
				"Cache-Control": "public, max-age=31536000, immutable",
			},
		});
	}

	const post = slug === "research" ? undefined : await getEntryBySlug("post", slug!);
	const title = post?.data.title ?? "AI and collective work";
	const status = post?.data.status ?? "Human-computer interaction and computational social science";
	const svg = await satori(markup(title, status), ogOptions);
	const png = new Resvg(svg).render().asPng();
	return new Response(png, {
		headers: {
			"Content-Type": "image/png",
			"Cache-Control": "public, max-age=31536000, immutable",
		},
	});
}

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
	const posts = await getCollection("post", ({ data }) => !data.draft);
	return [
		{ params: { slug: "research" } },
		...posts.filter((post) => !post.data.ogImage).map((post) => ({ params: { slug: post.slug } })),
	];
}
