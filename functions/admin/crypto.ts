/**
 * AES-256-GCM encryption for credentials entered in the CMS.
 * The key is derived from the CMS_MASTER_KEY Worker secret, so the values
 * stored in KV are useless without the Worker's own secret.
 */
import { HttpError } from "./env";

export interface Sealed {
	v: 1;
	iv: string;
	ct: string;
}

const enc = new TextEncoder();
const dec = new TextDecoder();

function toB64(bytes: Uint8Array): string {
	let s = "";
	for (const b of bytes) s += String.fromCharCode(b);
	return btoa(s);
}

function fromB64(b64: string): Uint8Array<ArrayBuffer> {
	return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

const keyCache = new Map<string, Promise<CryptoKey>>();

export function deriveKey(masterKey: string | undefined): Promise<CryptoKey> {
	if (!masterKey || masterKey.length < 32) {
		throw new HttpError(
			503,
			"master_key_missing",
			"Chưa đặt secret CMS_MASTER_KEY (tối thiểu 32 ký tự).",
		);
	}
	let key = keyCache.get(masterKey);
	if (!key) {
		key = (async () => {
			const raw = await crypto.subtle.importKey("raw", enc.encode(masterKey), "HKDF", false, [
				"deriveKey",
			]);
			return crypto.subtle.deriveKey(
				{
					hash: "SHA-256",
					info: enc.encode("dat-cms/secrets/v1"),
					name: "HKDF",
					salt: new Uint8Array(32),
				},
				raw,
				{ length: 256, name: "AES-GCM" },
				false,
				["encrypt", "decrypt"],
			);
		})();
		keyCache.set(masterKey, key);
	}
	return key;
}

/** `name` is bound as additional data, so a sealed value cannot be swapped to another field */
export async function seal(key: CryptoKey, name: string, plaintext: string): Promise<Sealed> {
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const ct = new Uint8Array(
		await crypto.subtle.encrypt(
			{ additionalData: enc.encode(name), iv, name: "AES-GCM" },
			key,
			enc.encode(plaintext),
		),
	);
	return { ct: toB64(ct), iv: toB64(iv), v: 1 };
}

export async function open(key: CryptoKey, name: string, sealed: Sealed): Promise<string> {
	try {
		const pt = await crypto.subtle.decrypt(
			{ additionalData: enc.encode(name), iv: fromB64(sealed.iv), name: "AES-GCM" },
			key,
			fromB64(sealed.ct),
		);
		return dec.decode(pt);
	} catch {
		throw new HttpError(
			500,
			"secret_unreadable",
			`Không giải mã được "${name}". CMS_MASTER_KEY đã bị đổi?`,
		);
	}
}
