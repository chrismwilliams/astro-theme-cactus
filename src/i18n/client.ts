/**
 * Client-side i18n utilities
 * This file handles language detection and translation loading on the client
 */

import * as es from "./es";
import * as en from "./en";

export const languages = {
	en: "English",
	es: "Español",
} as const;

export type Lang = keyof typeof languages;

const translations = { es, en } as const;

const STORAGE_KEY = "lang";
const DEFAULT_LANG: Lang = "en";

/**
 * Get current language from localStorage
 * Returns English if not set
 */
export function getLang(): Lang {
	if (typeof window === "undefined") return DEFAULT_LANG;
	
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored && stored in languages) {
		return stored as Lang;
	}
	return DEFAULT_LANG;
}

/**
 * Set language in localStorage
 */
export function setLang(lang: Lang): void {
	if (typeof window === "undefined") return;
	localStorage.setItem(STORAGE_KEY, lang);
}

/**
 * Get translations for a specific language
 */
export function getTranslations(lang: Lang) {
	return translations[lang] ?? translations[DEFAULT_LANG];
}

/**
 * Get translations for the current language (from localStorage)
 */
export function getCurrentTranslations() {
	return getTranslations(getLang());
}

/**
 * Apply translations to all elements with data-i18n attribute
 */
export function applyTranslations(): void {
	const lang = getLang();
	const t = getTranslations(lang);

	// Update html lang attribute
	document.documentElement.lang = lang;

	// Update all elements with data-i18n attribute
	document.querySelectorAll("[data-i18n]").forEach((el) => {
		const key = el.getAttribute("data-i18n");
		if (key) {
			const keys = key.split(".");
			let value: unknown = t;
			for (const k of keys) {
				value = (value as Record<string, unknown>)?.[k];
			}
			if (typeof value === "string") {
				el.textContent = value;
			}
		}
	});

	// Show the page after translations are applied
	document.documentElement.classList.add('i18n-ready');
}

/**
 * Initialize i18n on page load
 * Call this in your main script or layout
 */
export function initI18n(): void {
	// Ensure localStorage has a default value
	if (typeof window !== "undefined" && !localStorage.getItem(STORAGE_KEY)) {
		localStorage.setItem(STORAGE_KEY, DEFAULT_LANG);
	}
	
	applyTranslations();
}
