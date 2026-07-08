import { h as _h, type Properties } from "hastscript";
import type { Paragraph } from "mdast";

/** From Astro Starlight: Function that generates an mdast HTML tree ready for conversion to HTML by rehype. */
// biome-ignore lint/suspicious/noExplicitAny: allow any children
export function h(el: string, attrs: Properties = {}, children: any[] = []): Paragraph {
	const { properties, tagName } = _h(el, attrs);
	return {
		children,
		data: { hName: tagName, hProperties: properties },
		type: "paragraph",
	};
}
