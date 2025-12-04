import * as es from "./es";
import * as en from "./en";

export const languages = {
	en: "English",
	es: "Español",
} as const;

export const defaultLang = "en" as const;

export type Lang = keyof typeof languages;

const translations = { es, en } as const;

/**
 * Get all translations for a specific language
 */
export function getTranslations(lang: Lang) {
	return translations[lang] ?? translations[defaultLang];
}

/** Default translations (for server-side rendering) */
export const t = getTranslations(defaultLang);

/**
 * Get the language from a URL or use default
 */
export function getLangFromUrl(url: URL): Lang {
	const [, lang] = url.pathname.split("/");
	if (lang && lang in languages) {
		return lang as Lang;
	}
	return defaultLang;
}

/**
 * Get the current language from cookies
 */
export function getCurrentLang(cookies: { get: (name: string) => { value: string } | undefined }): Lang {
	const cookieLang = cookies.get("lang")?.value;
	if (cookieLang && cookieLang in languages) {
		return cookieLang as Lang;
	}
	return defaultLang;
}

/**
 * Get menu links with translations for a specific language
 */
export function getMenuLinks(lang: Lang) {
	const t = getTranslations(lang);
	return [
		{ path: "/", title: t.nav.home },
		{ path: "/about/", title: t.nav.about },
		{ path: "/posts/", title: t.nav.blog },
		{ path: "/notes/", title: t.nav.notes },
	];
}
