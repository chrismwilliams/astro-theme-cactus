/** Bindings and variables the admin API reads (see wrangler.json). */

/** the subset of the Workers KV API used by the blog */
export interface KVStore {
	get(key: string): Promise<string | null>;
	put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
	delete(key: string): Promise<void>;
}

export interface AdminEnv {
	BLOG_KV?: KVStore;
	/** Worker secret: root key that encrypts every credential stored by the CMS */
	CMS_MASTER_KEY?: string;
	/** Cloudflare Access team domain, e.g. "datnt.cloudflareaccess.com" */
	ACCESS_TEAM_DOMAIN?: string;
	/** Application Audience (AUD) tag of the Access application protecting /admin */
	ACCESS_AUD?: string;
	/** optional comma separated allow-list of emails, checked after Access */
	ADMIN_EMAILS?: string;
}

export class HttpError extends Error {
	constructor(
		public status: number,
		public code: string,
		message?: string,
	) {
		super(message ?? code);
	}
}

export const json = (data: unknown, status = 200) =>
	Response.json(data, {
		headers: {
			"Cache-Control": "no-store",
			"X-Content-Type-Options": "nosniff",
		},
		status,
	});
