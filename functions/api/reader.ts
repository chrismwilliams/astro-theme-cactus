/**
 * Reader interaction APIs backed by Workers KV (binding: READER_KV).
 *
 *   GET  /api/reactions?ids=a,b      -> { a: { fire: 3 }, b: {} }
 *   POST /api/reactions              { id, reaction, delta: 1 | -1 } -> counts for id
 *   GET  /api/quiz?id=x              -> { counts: number[] }
 *   POST /api/quiz                   { id, choice, options } -> { counts: number[] }
 *
 * KV is eventually consistent and has no atomic increment, so counts can be
 * off by a vote under heavy concurrent use. That is fine for a personal blog.
 */

/** the subset of the KVNamespace API used here */
export interface KV {
	get(key: string): Promise<string | null>;
	put(key: string, value: string): Promise<void>;
}

const REACTION_KEYS = new Set(["fire", "bulb", "mind", "clap", "think"]);
const ID_RE = /^[a-z0-9][a-z0-9/_-]{0,119}$/i;
const MAX_IDS = 30;
const MAX_OPTIONS = 10;

const json = (data: unknown, status = 200) =>
	Response.json(data, {
		headers: { "Cache-Control": "no-store" },
		status,
	});

function sameOrigin(request: Request): boolean {
	const origin = request.headers.get("Origin");
	if (!origin) return true; // non-browser or same-origin GET without Origin
	return origin === new URL(request.url).origin;
}

async function readJSON<T>(kv: KV, key: string, fallback: T): Promise<T> {
	const raw = await kv.get(key);
	if (!raw) return fallback;
	try {
		return JSON.parse(raw) as T;
	} catch {
		return fallback;
	}
}

export async function handleReactions(request: Request, kv: KV | undefined): Promise<Response> {
	if (!kv) return json({ error: "Reactions storage not configured" }, 503);
	const url = new URL(request.url);

	if (request.method === "GET") {
		const ids = (url.searchParams.get("ids") ?? "")
			.split(",")
			.filter((id) => ID_RE.test(id))
			.slice(0, MAX_IDS);
		const entries = await Promise.all(
			ids.map(
				async (id) => [id, await readJSON<Record<string, number>>(kv, `r:${id}`, {})] as const,
			),
		);
		return json(Object.fromEntries(entries));
	}

	if (request.method === "POST") {
		if (!sameOrigin(request)) return json({ error: "Forbidden" }, 403);
		let body: { id?: unknown; reaction?: unknown; delta?: unknown };
		try {
			body = await request.json();
		} catch {
			return json({ error: "Invalid JSON" }, 400);
		}
		const { id, reaction, delta } = body;
		if (
			typeof id !== "string" ||
			!ID_RE.test(id) ||
			typeof reaction !== "string" ||
			!REACTION_KEYS.has(reaction) ||
			(delta !== 1 && delta !== -1)
		) {
			return json({ error: "Invalid input" }, 400);
		}
		const key = `r:${id}`;
		const counts = await readJSON<Record<string, number>>(kv, key, {});
		counts[reaction] = Math.max(0, (counts[reaction] ?? 0) + delta);
		await kv.put(key, JSON.stringify(counts));
		return json(counts);
	}

	return json({ error: "Method not allowed" }, 405);
}

export async function handleQuiz(request: Request, kv: KV | undefined): Promise<Response> {
	if (!kv) return json({ error: "Quiz storage not configured" }, 503);
	const url = new URL(request.url);

	if (request.method === "GET") {
		const id = url.searchParams.get("id") ?? "";
		if (!ID_RE.test(id)) return json({ error: "Invalid id" }, 400);
		return json({ counts: await readJSON<number[]>(kv, `q:${id}`, []) });
	}

	if (request.method === "POST") {
		if (!sameOrigin(request)) return json({ error: "Forbidden" }, 403);
		let body: { id?: unknown; choice?: unknown; options?: unknown };
		try {
			body = await request.json();
		} catch {
			return json({ error: "Invalid JSON" }, 400);
		}
		const { id, choice, options } = body;
		if (
			typeof id !== "string" ||
			!ID_RE.test(id) ||
			typeof options !== "number" ||
			!Number.isInteger(options) ||
			options < 2 ||
			options > MAX_OPTIONS ||
			typeof choice !== "number" ||
			!Number.isInteger(choice) ||
			choice < 0 ||
			choice >= options
		) {
			return json({ error: "Invalid input" }, 400);
		}
		const key = `q:${id}`;
		const stored = await readJSON<number[]>(kv, key, []);
		const counts = Array.from({ length: options }, (_, i) => stored[i] ?? 0);
		counts[choice] = (counts[choice] ?? 0) + 1;
		await kv.put(key, JSON.stringify(counts));
		return json({ counts });
	}

	return json({ error: "Method not allowed" }, 405);
}
