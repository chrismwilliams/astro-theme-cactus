import { cacheDir } from "astro:config/server";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Update/bump version when changing markup in _ogMarkup.ts, or fonts/config in [...slug].png.ts
const CACHE_VERSION = "v1";

// Cache directory, defaults to node_modules/.astro/og-images
const CACHE_DIR = path.join(fileURLToPath(cacheDir), "og-images");

// Check cache directory exists, if not create dir
function checkCacheDirExists() {
	if (!fs.existsSync(CACHE_DIR)) {
		fs.mkdirSync(CACHE_DIR, { recursive: true });
	}
}

// Returns a cache key based on CACHE_VERSION, a post's title & pubDate
function getCacheKey(title: string, pubDate: Date): string {
	const content = `${CACHE_VERSION}-${title}-${pubDate.toISOString()}`;
	return crypto.createHash("sha256").update(content).digest("hex").slice(0, 16);
}

// Return an OG Image from cache if it exists
export function readCache(title: string, pubDate: Date): Buffer | null {
	checkCacheDirExists();

	const cacheKey = getCacheKey(title, pubDate);
	const cacheFilePath = path.join(CACHE_DIR, `${cacheKey}.png`);

	if (fs.existsSync(cacheFilePath)) {
		console.info(`Found cached OG image for: ${title}`);
		return fs.readFileSync(cacheFilePath);
	}

	return null;
}

// Save image to cache
export function writeToCache(title: string, pubDate: Date, data: Buffer): void {
	const cacheKey = getCacheKey(title, pubDate);
	fs.writeFileSync(path.join(CACHE_DIR, `${cacheKey}.png`), data);
}
