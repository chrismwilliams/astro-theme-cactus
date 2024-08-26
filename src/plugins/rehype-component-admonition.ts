/// <reference types="mdast" />
import { h } from "hastscript";
import type { Element } from "hastscript/lib/create-h";

/** Creates an admonition component. */
export default function AdmonitionComponent (
	properties: { [x: string]: string },
	children: Element[],
	type: ('tip'|'note'|'important'|'caution'|'warning'),
): Element {
	if (!Array.isArray(children) || children.length === 0)
		return h(
			"div",
			{ class: "hidden" },
			'Invalid admonition directive. (Admonition directives must be of block type ":::note{name="name"} <content> :::")',
		);

	let label = null;
	if (properties && properties["has-directive-label"]) {
		label = children[0]; // The first child is the label
		children = children.slice(1);
		if (label) label.tagName = "div"; // Change the tag <p> to <div>
	}

	// Do not change prefix to AD, ADM, or similar, adblocks will block the content inside.
	return h(`div`, { class: `aside ast-${type}` }, [
		h("span", { class: `aside-title` }, label ? label : type.toUpperCase()),
		...children,
	]);
}
