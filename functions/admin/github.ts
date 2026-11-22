/**
 * Content storage = the git repo. The CMS reads and commits files through the
 * GitHub REST API; every save is a commit, and Cloudflare rebuilds the site.
 */
import { type AdminEnv, HttpError } from "./env";
import { getConfig, getSecret, requireKv } from "./settings";

const API = "https://api.github.com";

/** files the CMS may touch */
const CONTENT_RE = /^content\/(posts|notes)\/[a-z0-9][a-z0-9/_-]*\.(md|mdx)$/;
const IMAGE_RE = /^public\/images\/uploads\/[a-z0-9][a-z0-9_-]*\.(png|jpe?g|webp|gif|avif)$/;
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export function assertContentPath(path: string) {
	if (!CONTENT_RE.test(path) || path.includes("..") || path.includes("//")) {
		throw new HttpError(400, "invalid_path", "Đường dẫn bài viết không hợp lệ");
	}
}

export function assertImagePath(path: string) {
	if (!IMAGE_RE.test(path) || path.includes(".."))
		throw new HttpError(400, "invalid_path", "Tên ảnh không hợp lệ");
}

function utf8ToB64(text: string): string {
	const bytes = new TextEncoder().encode(text);
	let s = "";
	for (let i = 0; i < bytes.length; i += 0x8000)
		s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
	return btoa(s);
}

function b64ToUtf8(b64: string): string {
	const bin = atob(b64.replace(/\n/g, ""));
	return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

interface Repo {
	owner: string;
	repo: string;
	branch: string;
	token: string;
}

export async function repoFor(env: AdminEnv): Promise<Repo> {
	const [config, token] = await Promise.all([getConfig(env), getSecret(env, "githubToken")]);
	if (!token)
		throw new HttpError(412, "github_not_configured", "Chưa nhập GitHub token trong Cài đặt");
	return { ...config.github, token };
}

async function gh<T>(
	repo: Repo,
	path: string,
	init: RequestInit = {},
	fetcher: typeof fetch = fetch,
): Promise<T> {
	const res = await fetcher(`${API}${path}`, {
		...init,
		headers: {
			Accept: "application/vnd.github+json",
			Authorization: `Bearer ${repo.token}`,
			"Content-Type": "application/json",
			"User-Agent": "dat-blog-cms",
			"X-GitHub-Api-Version": "2022-11-28",
			...(init.headers ?? {}),
		},
	});
	if (!res.ok) {
		const body = (await res.json().catch(() => ({}))) as { message?: string };
		const code = res.status === 409 || res.status === 422 ? "conflict" : "github_error";
		throw new HttpError(
			res.status === 401 ? 502 : res.status,
			code,
			`GitHub ${res.status}: ${body.message ?? res.statusText}`,
		);
	}
	return (await res.json()) as T;
}

export interface ContentFile {
	path: string;
	sha: string;
	content: string;
}

/** all posts and notes with their raw markdown; blobs are cached in KV by sha */
export async function listContent(
	env: AdminEnv,
	fetcher: typeof fetch = fetch,
): Promise<ContentFile[]> {
	const repo = await repoFor(env);
	const kv = requireKv(env);
	const tree = await gh<{
		tree: { path: string; sha: string; type: string }[];
		truncated: boolean;
	}>(
		repo,
		`/repos/${repo.owner}/${repo.repo}/git/trees/${encodeURIComponent(repo.branch)}?recursive=1`,
		{},
		fetcher,
	);
	const files = tree.tree.filter((t) => t.type === "blob" && CONTENT_RE.test(t.path));
	const out: ContentFile[] = [];
	// small concurrency limit to stay polite with the GitHub API
	const queue = [...files];
	const worker = async () => {
		for (let f = queue.shift(); f; f = queue.shift()) {
			const cacheKey = `cms:blob:${f.sha}`;
			let content = await kv.get(cacheKey);
			if (content === null) {
				const blob = await gh<{ content: string }>(
					repo,
					`/repos/${repo.owner}/${repo.repo}/git/blobs/${f.sha}`,
					{},
					fetcher,
				);
				content = b64ToUtf8(blob.content);
				await kv.put(cacheKey, content, { expirationTtl: 60 * 60 * 24 * 30 });
			}
			out.push({ content, path: f.path, sha: f.sha });
		}
	};
	await Promise.all(Array.from({ length: 6 }, worker));
	return out.sort((a, b) => a.path.localeCompare(b.path));
}

export async function getFile(
	env: AdminEnv,
	path: string,
	fetcher: typeof fetch = fetch,
): Promise<ContentFile> {
	assertContentPath(path);
	const repo = await repoFor(env);
	const file = await gh<{ content: string; sha: string }>(
		repo,
		`/repos/${repo.owner}/${repo.repo}/contents/${path}?ref=${encodeURIComponent(repo.branch)}`,
		{},
		fetcher,
	);
	return { content: b64ToUtf8(file.content), path, sha: file.sha };
}

export async function putFile(
	env: AdminEnv,
	args: { path: string; content: string; sha?: string | undefined; message: string; email: string },
	fetcher: typeof fetch = fetch,
): Promise<{ sha: string; commit: string }> {
	assertContentPath(args.path);
	if (args.content.length > 500_000) throw new HttpError(413, "too_large");
	const repo = await repoFor(env);
	const res = await gh<{ content: { sha: string }; commit: { sha: string } }>(
		repo,
		`/repos/${repo.owner}/${repo.repo}/contents/${args.path}`,
		{
			body: JSON.stringify({
				branch: repo.branch,
				content: utf8ToB64(args.content),
				message: `${args.message.slice(0, 200)}\n\nvia CMS by ${args.email}`,
				...(args.sha ? { sha: args.sha } : {}),
			}),
			method: "PUT",
		},
		fetcher,
	);
	return { commit: res.commit.sha, sha: res.content.sha };
}

export async function deleteFile(
	env: AdminEnv,
	args: { path: string; sha: string; email: string },
	fetcher: typeof fetch = fetch,
): Promise<void> {
	assertContentPath(args.path);
	const repo = await repoFor(env);
	await gh(
		repo,
		`/repos/${repo.owner}/${repo.repo}/contents/${args.path}`,
		{
			body: JSON.stringify({
				branch: repo.branch,
				message: `chore: delete ${args.path}\n\nvia CMS by ${args.email}`,
				sha: args.sha,
			}),
			method: "DELETE",
		},
		fetcher,
	);
}

export async function uploadImage(
	env: AdminEnv,
	args: { name: string; base64: string; email: string },
	fetcher: typeof fetch = fetch,
): Promise<{ url: string }> {
	const path = `public/images/uploads/${args.name}`;
	assertImagePath(path);
	const size = Math.floor((args.base64.length * 3) / 4);
	if (size > MAX_IMAGE_BYTES) throw new HttpError(413, "too_large", "Ảnh tối đa 4 MB");
	const repo = await repoFor(env);
	await gh(
		repo,
		`/repos/${repo.owner}/${repo.repo}/contents/${path}`,
		{
			body: JSON.stringify({
				branch: repo.branch,
				content: args.base64,
				message: `chore: upload ${args.name}\n\nvia CMS by ${args.email}`,
			}),
			method: "PUT",
		},
		fetcher,
	);
	return { url: `/images/uploads/${args.name}` };
}

export async function testGithub(env: AdminEnv, fetcher: typeof fetch = fetch) {
	const repo = await repoFor(env);
	const info = await gh<{ full_name: string; permissions?: { push?: boolean } }>(
		repo,
		`/repos/${repo.owner}/${repo.repo}`,
		{},
		fetcher,
	);
	if (!info.permissions?.push)
		throw new HttpError(403, "github_no_push", "Token không có quyền ghi vào repo");
	return { repo: info.full_name };
}
