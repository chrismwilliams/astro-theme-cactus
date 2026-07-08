import type { MdastPluginDefinition } from "satteri";
import { h } from "../utils/remark";

const DIRECTIVE_NAME = "github";

export function satteriGithubCardPlugin(): MdastPluginDefinition {
	return {
		name: "cactus-github-card",
		leafDirective(node) {
			if (node.name !== DIRECTIVE_NAME) return;

			let repoName = node.attributes?.repo ?? node.attributes?.user ?? null;
			if (!repoName) return; // Left as a directive; admonitions plugin restores it to text.

			repoName = repoName.endsWith("/") ? repoName.slice(0, -1) : repoName; // Remove trailing slash
			repoName = repoName.startsWith("https://github.com/")
				? repoName.replace("https://github.com/", "")
				: repoName; // Remove leading URL

			const repoParts = repoName.split("/");
			const simpleUUID = `GC-${crypto.randomUUID()}`;
			const realUrl = `https://github.com/${repoName}`;

			// If its a repo link
			if (repoParts.length > 1) {
				const script = h("script", {}, [
					{
						type: "text",
						value: `
				fetch('https://api.github.com/repos/${repoName}', { referrerPolicy: "no-referrer" })
					.then(response => response.json())
					.then(data => {
						const t = document.getElementById('${simpleUUID}');
						t.classList.remove("gh-loading");

						if (data.description) {
							t.querySelector('.gh-description').innerText = data.description.replace(/:[a-zA-Z0-9_]+:/g, '');
						} else {
							t.querySelector('.gh-description').style.display = 'none';
						}
						if (data.language) t.querySelector('.gh-language').innerText = data.language;
        		t.querySelector('.gh-forks').innerText = Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(data.forks).replaceAll("\u202f", '');
        		t.querySelector('.gh-stars').innerText = Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(data.stargazers_count).replaceAll("\u202f", '');
						const avatarEl = t.querySelector('.gh-avatar');
        		avatarEl.style.backgroundImage = 'url(' + data.owner.avatar_url + ')';

						if (data.license?.spdx_id) {
							t.querySelector('.gh-license').innerText = data.license?.spdx_id
						} else {
							t.querySelector('.gh-license').style.display = 'none';
						};
					})
				.catch(err => {
        	document.getElementById('${simpleUUID}').classList.add("gh-error")
         	console.warn("[GITHUB-CARD] Error loading card for ${repoName} | ${simpleUUID}.", err)
      	})
			`,
					},
				]);

				const hTitle = h("div", { class: "gh-title title" }, [
					h("span", { class: "gh-avatar" }),
					h("a", { class: "gh-text not-prose cactus-link", href: realUrl }, [
						{ type: "text", value: `${repoParts[0]}/${repoParts[1]}` },
					]),
					h("span", { class: "gh-icon" }),
				]);

				const hChips = h("div", { class: "gh-chips" }, [
					h("span", { class: "gh-stars" }, [{ type: "text", value: "00K" }]),
					h("span", { class: "gh-forks" }, [{ type: "text", value: "00K" }]),
					h("span", { class: "gh-license" }, [{ type: "text", value: "MIT" }]),
					h("span", { class: "gh-language" }, [{ type: "text", value: "" }]),
				]);

				const hDescription = h("div", { class: "gh-description" }, [
					{ type: "text", value: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
				]);

				return h("div", { id: simpleUUID, class: "github-card gh-loading" }, [
					hTitle,
					hDescription,
					hChips,
					script,
				]);
			}

			// If its a user link
			if (repoParts.length === 1) {
				const script = h("script", {}, [
					{
						type: "text",
						value: `
				fetch('https://api.github.com/users/${repoName}', { referrerPolicy: "no-referrer" })
					.then(response => response.json())
					.then(data => {
						const t = document.getElementById('${simpleUUID}');
						t.classList.remove("gh-loading");

						const avatarEl = t.querySelector('.gh-avatar');
        		avatarEl.style.backgroundImage = 'url(' + data.avatar_url + ')';
						t.querySelector('.gh-followers').innerText = Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(data.followers).replaceAll("\u202f", '');
						t.querySelector('.gh-repositories').innerText = Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(data.public_repos).replaceAll("\u202f", '');
						if (data.location) t.querySelector('.gh-region').innerText = data.location;

					})
				.catch(err => {
        	const c = document.getElementById('${simpleUUID}').classList.add("gh-error")
         	console.warn("[GITHUB-CARD] Error loading card for ${repoName} | ${simpleUUID}.", err)
      	})
			`,
					},
				]);

				return h("div", { id: simpleUUID, class: "github-card gh-simple gh-loading" }, [
					h("div", { class: "gh-title title" }, [
						h("span", { class: "gh-avatar" }),
						h("a", { class: "gh-text not-prose cactus-link", href: realUrl }, [
							{ type: "text", value: repoParts[0] },
						]),
						h("span", { class: "gh-icon" }),
					]),
					h("div", { class: "gh-chips" }, [
						h("span", { class: "gh-followers" }, [{ type: "text", value: "00K" }]),
						h("span", { class: "gh-repositories" }, [{ type: "text", value: "00K" }]),
						h("span", { class: "gh-region" }, [{ type: "text", value: "" }]),
					]),
					script,
				]);
			}
			return undefined;
		},
	};
}
