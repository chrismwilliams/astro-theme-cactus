import { fontData } from "astro:assets";
import { Resvg } from "@resvg/resvg-js";
import type { APIContext, InferGetStaticPropsType } from "astro";
import satori, { type SatoriOptions } from "satori";
import { html } from "satori-html";
import { getAllPosts } from "@/data/post";
import { siteConfig } from "@/site.config";
import { getFormattedDate } from "@/utils/date";

const markup = (title: string, pubDate: string) =>
	html`<div tw="flex flex-col w-full h-full bg-[#1d1f21] text-[#c9cacc]">
		<div tw="flex flex-col flex-1 w-full p-10 justify-center">
			<p tw="text-2xl mb-6">${pubDate}</p>
			<h1 tw="text-6xl font-bold leading-snug text-white">${title}</h1>
		</div>
		<div tw="flex items-center justify-between w-full p-10 border-t border-[#2bbc89] text-xl">
			<div tw="flex items-center">
				<svg height="60" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 272 480">
					<path
						fill="#cdffb8"
						d="M181.334 93.333v-40L226.667 80v40zM136.001 53.333 90.667 26.667v426.666L136.001 480zM45.333 220 0 193.334v140L45.333 360z"
					/>
					<path
						fill="#d482ab"
						d="M90.667 26.667 136.001 0l45.333 26.667-45.333 26.666zM181.334 53.33l45.333-26.72L272 53.33 226.667 80zM136 240l-45.333-26.67v53.34zM0 193.33l45.333-26.72 45.334 26.72L45.333 220zM181.334 93.277 226.667 120l-45.333 26.67z"
					/>
					<path
						fill="#2abc89"
						d="m136 53.333 45.333-26.666v120L226.667 120V80L272 53.333V160l-90.667 53.333v240L136 480V306.667L45.334 360V220l45.333-26.667v73.334L136 240z"
					/>
				</svg>
				<p tw="ml-3 font-semibold">${siteConfig.title}</p>
			</div>
			<p>by ${siteConfig.author}</p>
		</div>
	</div>`;

// font cache
let fontBuffers: { robotoMonoRegular: ArrayBuffer; robotoMonoBold: ArrayBuffer } | null = null;

type Props = InferGetStaticPropsType<typeof getStaticPaths>;

export async function GET(context: APIContext) {
	const { pubDate, title } = context.props as Props;

	// add fonts to cache
	if (!fontBuffers) {
		const { origin } = context.url;
		const robotoMonoFonts = fontData["--font-roboto-mono"];
		// biome-ignore-start  lint/style/noNonNullAssertion: fonts added via Astro config
		const [robotoMonoRegular, robotoMonoBold] = await Promise.all([
			fetch(new URL(robotoMonoFonts.find((f) => f.weight === "400")!.src[0]!.url, origin)).then(
				(r) => r.arrayBuffer(),
			),
			fetch(new URL(robotoMonoFonts.find((f) => f.weight === "700")!.src[0]!.url, origin)).then(
				(r) => r.arrayBuffer(),
			),
		]);
		// biome-ignore-end  lint/style/noNonNullAssertion: fonts added via Astro config
		fontBuffers = { robotoMonoRegular, robotoMonoBold };
	}

	const postDateFormat = getFormattedDate(pubDate, {
		month: "long",
		weekday: "long",
	});
	const ogOptions: SatoriOptions = {
		// debug: true,
		fonts: [
			{
				data: fontBuffers.robotoMonoRegular,
				name: "Roboto Mono",
				style: "normal",
				weight: 400,
			},
			{
				data: fontBuffers.robotoMonoBold,
				name: "Roboto Mono",
				style: "normal",
				weight: 700,
			},
		],
		height: 630,
		width: 1200,
	};
	const svg = await satori(markup(title, postDateFormat), ogOptions);
	const pngBuffer = new Resvg(svg).render().asPng();
	const png = new Uint8Array(pngBuffer);
	return new Response(png, {
		headers: {
			"Cache-Control": "public, max-age=31536000, immutable",
			"Content-Type": "image/png",
		},
	});
}

export async function getStaticPaths() {
	const posts = await getAllPosts();
	return posts
		.values()
		.filter(({ data }) => !data.ogImage)
		.map((post) => ({
			params: { slug: post.id },
			props: {
				pubDate: post.data.updatedDate ?? post.data.publishDate,
				title: post.data.title,
			},
		}))
		.toArray();
}
