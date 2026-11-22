/** Client-side helpers for reader interactions (progress, reactions). */

export const REACTIONS = [
	{ key: "fire", emoji: "🔥", label: "Hay" },
	{ key: "bulb", emoji: "💡", label: "Học được" },
	{ key: "mind", emoji: "🤯", label: "Wow" },
	{ key: "clap", emoji: "👏", label: "Cảm ơn" },
	{ key: "think", emoji: "🤔", label: "Còn thắc mắc" },
] as const;

export type ReactionKey = (typeof REACTIONS)[number]["key"];
export type ReactionCounts = Partial<Record<ReactionKey, number>>;

const PROGRESS_KEY = "reader:progress";

function safeGet<T>(key: string, fallback: T): T {
	try {
		const raw = localStorage.getItem(key);
		return raw ? (JSON.parse(raw) as T) : fallback;
	} catch {
		return fallback;
	}
}

function safeSet(key: string, value: unknown) {
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch {
		/* storage unavailable */
	}
}

/** reading progress, 0–100, per post id */
export function getProgress(): Record<string, number> {
	return safeGet<Record<string, number>>(PROGRESS_KEY, {});
}

export function setProgress(id: string, pct: number) {
	const all = getProgress();
	const prev = all[id] ?? 0;
	// never go backwards, so re-reading the intro doesn't reset a finished post
	if (pct <= prev) return;
	all[id] = Math.min(100, Math.round(pct));
	safeSet(PROGRESS_KEY, all);
}

/** reactions this browser has given, per post id */
export function getMyReactions(id: string): ReactionKey[] {
	return safeGet<ReactionKey[]>(`reader:reacted:${id}`, []);
}

export function setMyReactions(id: string, keys: ReactionKey[]) {
	safeSet(`reader:reacted:${id}`, keys);
}

export async function fetchReactions(ids: string[]): Promise<Record<string, ReactionCounts>> {
	if (!ids.length) return {};
	try {
		const res = await fetch(`/api/reactions?ids=${encodeURIComponent(ids.join(","))}`);
		if (!res.ok) return {};
		return (await res.json()) as Record<string, ReactionCounts>;
	} catch {
		return {};
	}
}

export async function sendReaction(
	id: string,
	reaction: ReactionKey,
	delta: 1 | -1,
): Promise<ReactionCounts | null> {
	try {
		const res = await fetch("/api/reactions", {
			body: JSON.stringify({ delta, id, reaction }),
			headers: { "Content-Type": "application/json" },
			method: "POST",
		});
		if (!res.ok) return null;
		return (await res.json()) as ReactionCounts;
	} catch {
		return null;
	}
}

export function formatCount(n: number | undefined): string {
	if (!n) return "0";
	return n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k` : String(n);
}

/** small, accessible toast at the bottom of the screen */
export function toast(message: string) {
	let region = document.getElementById("reader-toast");
	if (!region) {
		region = document.createElement("div");
		region.id = "reader-toast";
		region.setAttribute("role", "status");
		region.className =
			"pointer-events-none fixed inset-x-0 bottom-24 z-[100] flex justify-center px-4 sm:bottom-8";
		document.body.append(region);
	}
	const el = document.createElement("div");
	el.className =
		"bg-accent-2 text-global-bg rounded-xl px-4 py-2 font-mono text-xs shadow-card transition-opacity duration-300";
	el.textContent = message;
	region.replaceChildren(el);
	setTimeout(() => {
		el.style.opacity = "0";
		setTimeout(() => el.remove(), 300);
	}, 1800);
}

export async function copyText(text: string, okMessage = "Đã copy!") {
	try {
		await navigator.clipboard.writeText(text);
		toast(okMessage);
	} catch {
		toast("Không copy được 😢");
	}
}

/** native share sheet when available, otherwise copy the link */
export async function sharePage(title: string, url = window.location.href) {
	if (navigator.share) {
		try {
			await navigator.share({ title, url });
			return;
		} catch (e) {
			if ((e as DOMException).name === "AbortError") return;
		}
	}
	await copyText(url, "Đã copy link bài viết");
}
