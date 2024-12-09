import { type Properties, h as _h } from "hastscript";
import type { Node, Paragraph as P, Root } from "mdast";
import type { Directives } from "mdast-util-directive";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

const DIRECTIVE_NAME = "github"

/** Checks if a node is a directive. */
function isNodeDirective(node: Node): node is Directives {
	return (
		node.type === "containerDirective" ||
		node.type === "leafDirective" ||
		node.type === "textDirective"
	);
}

/** From Astro Starlight: Function that generates an mdast HTML tree ready for conversion to HTML by rehype. */
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function h(el: string, attrs: Properties = {}, children: any[] = []): P {
	const { properties, tagName } = _h(el, attrs);
	return {
		children,
		data: { hName: tagName, hProperties: properties },
		type: "paragraph",
	};
}

export const remarkGithubCard: Plugin<[], Root> = () => (tree) => {
	visit(tree, (node, index, parent) => {
		if (!parent || index === undefined || !isNodeDirective(node)) return;

		// We only want a leaf directive named DIRECTIVE_NAME
		if (node.type !== "leafDirective" || node.name !== DIRECTIVE_NAME) return;
		
		let repoName = node.attributes?.repo ?? (node.attributes?.user ?? null);
		if (!repoName) return; // Let the directive as-is if no repo is provided

		repoName = repoName.endsWith('/') ? repoName.slice(0, -1) : repoName; // Remove trailing slash
		repoName = repoName.startsWith('https://github.com/') ? repoName.replace("https://github.com/", "") : repoName; // Remove leading URL
		
		const repoParts = repoName.split('/');
		const SimpleUUID = `GC${Math.random().toString(36).slice(-6)}` // Collisions are not important
		const realUrl = 'https://github.com/' + repoName;

		// If its a repo link
		if (repoParts.length > 1) {
			const script = h('script', {}, [{ type: 'text', value: `
				fetch('https://api.github.com/repos/${repoName}', { referrerPolicy: "no-referrer" })
					.then(response => response.json())
					.then(data => {
						const t = document.getElementById('${SimpleUUID}');
						t.classList.remove("gh-loading");

						if (data.description) {
							t.querySelector('.gh-description').innerText = data.description.replace(/:[a-zA-Z0-9_]+:/g, '');
						} else {
							t.querySelector('.gh-description').style.display = 'none';
						}
						if (data.language) t.querySelector('.gh-language').innerText = data.language;
        		t.querySelector('.gh-forks').innerText = Intl.NumberFormat('en-us', { notation: "compact", maximumFractionDigits: 1 }).format(data.forks).replaceAll("\u202f", '');
        		t.querySelector('.gh-stars').innerText = Intl.NumberFormat('en-us', { notation: "compact", maximumFractionDigits: 1 }).format(data.stargazers_count).replaceAll("\u202f", '');
						const avatarEl = t.querySelector('.gh-avatar');
        		avatarEl.style.backgroundImage = 'url(' + data.owner.avatar_url + ')';
        		avatarEl.style.backgroundColor = 'transparent';

						if (data.license?.spdx_id) {
							t.querySelector('.gh-license').innerText = data.license?.spdx_id
						} else {
							t.querySelector('.gh-license').style.display = 'none';
						};
					})
				.catch(err => {
        	document.getElementById('${SimpleUUID}').classList.add("gh-error")
         	console.warn("[GITHUB-CARD] Error loading card for ${repoName} | ${SimpleUUID}.", err)
      	})
			`}]);

			const hTitle = h("div", { class: "gh-title" }, [
				h("span", { class: "gh-avatar" }),
					h("span", { class: "gh-text" }, [
						h("span", { class: "gh-user" }, [{type: 'text', value: repoParts[0] }]),
						h("span", { class: "gh-divider" }, [{type: 'text', value: "/" }]),
						h("span", { class: "gh-repo" }, [{type: 'text', value: repoParts[1] }]),
					]),
				h("span", { class: "gh-icon" }),
				script,
			]);

			const hChips = h("div", { class: "gh-chips" }, [
				h("span", { class: "gh-stars" }, [{type: 'text', value: "00K" }]),
				h("span", { class: "gh-forks" }, [{type: 'text', value: "00K" }]),
				h("span", { class: "gh-license"}, [{type: 'text', value: "MIT" }]),
				h("span", { class: "gh-language" }, [{type: 'text', value: "" }]),
			]);

			const hDescription = h("div", { class: "gh-description" }, [
				{type: 'text', value: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." }
			]);

			parent.children.splice(index, 1, 
				h('a', { id: SimpleUUID, class: 'github-card gh-loading', href: realUrl }, [
					hTitle,
					hDescription,
					hChips,
					script,
				]
			));
		}
			
		// If its a user link
		else if (repoParts.length === 1) {
			const script = h('script', {}, [{ type: 'text', value: `
				fetch('https://api.github.com/users/${repoName}', { referrerPolicy: "no-referrer" })
					.then(response => response.json())
					.then(data => {
						const t = document.getElementById('${SimpleUUID}');
						t.classList.remove("gh-loading");

						const avatarEl = t.querySelector('.gh-avatar');
        		avatarEl.style.backgroundImage = 'url(' + data.avatar_url + ')';
        		avatarEl.style.backgroundColor = 'transparent';
						t.querySelector('.gh-followers').innerText = Intl.NumberFormat('en-us', { notation: "compact", maximumFractionDigits: 1 }).format(data.followers).replaceAll("\u202f", '');
						t.querySelector('.gh-repositories').innerText = Intl.NumberFormat('en-us', { notation: "compact", maximumFractionDigits: 1 }).format(data.public_repos).replaceAll("\u202f", '');
						if (data.location) t.querySelector('.gh-region').innerText = data.location;

					})
				.catch(err => {
        	const c = document.getElementById('${SimpleUUID}').classList.add("gh-error")
         	console.warn("[GITHUB-CARD] Error loading card for ${repoName} | ${SimpleUUID}.", err)
      	})
			`}]);
			
			parent.children.splice(index, 1,
				h('a', { id: SimpleUUID, class: 'github-card gh-simple gh-loading', href: realUrl }, [
					h("div", { class: "gh-title" }, [
						h("span", { class: "gh-avatar" }),
						h("span", { class: "gh-text" }, [{type: 'text', value: repoParts[0] }]),
						h("span", { class: "gh-icon" })
					]),
					h("div", { class: "gh-chips" }, [
						h("span", { class: "gh-followers" }, [{type: 'text', value: "00K" }]),
						h("span", { class: "gh-repositories" }, [{type: 'text', value: "00K" }]),
						h("span", { class: "gh-region" }, [{type: 'text', value: "" }]),
					]),
					script,
				])
			);
		}

	});
};
