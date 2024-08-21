/// <reference types="astro/client" />
/// <reference path="../.astro/types.d.ts" />

declare module "@pagefind/default-ui" {
	declare class PagefindUI {
		constructor(arg: unknown);
	}
}

interface ImportMetaEnv {
	readonly WEBMENTION_API_KEY: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
