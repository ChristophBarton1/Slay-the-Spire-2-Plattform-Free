import { browser } from '$app/environment';
import { init, register, addMessages, locale, waitLocale } from 'svelte-i18n';

// Supported languages (only ones with translation files)
// Active languages — focused set. (Other locale files exist but are dormant
// until fully translated; the picker only offers these to avoid half-translated UI.)
export const SUPPORTED_LOCALES = [
	{ code: 'en', label: 'English', country: 'gb' },
	{ code: 'de', label: 'Deutsch', country: 'de' },
	{ code: 'fr', label: 'Français', country: 'fr' },
	{ code: 'es', label: 'Español', country: 'es' },
	{ code: 'ko', label: '한국어', country: 'kr' },
	{ code: 'zh', label: '中文', country: 'cn' }
];

// ⚡ PERFORMANCE: Loader maps — NOT registered at module level!
// Registering at top level causes svelte-i18n to run async loaders on init,
// which sets $isLoading=true and blocks ALL rendering. Instead, we register
// lazily inside init functions, skipping locales that already have SSR data.
const mainLoaders: Record<string, () => Promise<any>> = {
	en: () => import('./locales/en.json'),
	de: () => import('./locales/de.json'),
	fr: () => import('./locales/fr.json'),
	es: () => import('./locales/es.json'),
	ko: () => import('./locales/ko.json'),
	tr: () => import('./locales/tr.json'),
	zh: () => import('./locales/zh.json'),
	ru: () => import('./locales/ru.json'),
	ja: () => import('./locales/ja.json'),
};

const guidesLoaders: Record<string, () => Promise<any>> = {
	en: () => import('./locales/guides-en.json'),
	de: () => import('./locales/guides-de.json'),
	fr: () => import('./locales/guides-fr.json'),
	es: () => import('./locales/guides-es.json'),
	ko: () => import('./locales/guides-ko.json'),
	tr: () => import('./locales/guides-tr.json'),
	zh: () => import('./locales/guides-zh.json'),
	ru: () => import('./locales/guides-ru.json'),
	ja: () => import('./locales/guides-ja.json'),
};

let _initialized = false;

// ⚡ PERFORMANCE: Initialize with SSR-provided translations
// - Injects messages synchronously via addMessages (no async wait)
// - Only registers async loaders for locales NOT provided by SSR
// - Result: $isLoading is IMMEDIATELY false — zero rendering delay
export function initWithSSRData(
	ssrLocale: string,
	ssrMessages?: any,
	ssrGuidesMessages?: any,
	ssrFallbackMessages?: any
): void {
	if (_initialized) {
		// Already initialised (same isolate reused across requests) —
		// Re-inject all SSR messages and update locale so every request
		// gets correct translations + flag (fixes flag bug + StS2 raw keys).
		if (ssrMessages) addMessages(ssrLocale, ssrMessages);
		if (ssrGuidesMessages) addMessages(ssrLocale, ssrGuidesMessages);
		if (ssrFallbackMessages) addMessages('en', ssrFallbackMessages);
		locale.set(ssrLocale);
		return;
	}
	_initialized = true;

	// Inject SSR translations synchronously — available before init()
	if (ssrMessages) addMessages(ssrLocale, ssrMessages);
	if (ssrGuidesMessages) addMessages(ssrLocale, ssrGuidesMessages);

	// Inject English fallback (loaded on server for non-English users)
	if (ssrFallbackMessages) addMessages('en', ssrFallbackMessages);

	// Register async loaders ONLY for locales we don't have from SSR
	// These enable client-side language switching via the language picker
	const loaded = new Set([ssrLocale]);
	if (ssrFallbackMessages) loaded.add('en');

	for (const code of Object.keys(mainLoaders)) {
		if (!loaded.has(code)) {
			register(code, mainLoaders[code]);
			register(code, guidesLoaders[code]);
		}
	}

	init({
		fallbackLocale: 'en',
		initialLocale: ssrLocale
	});
}

// Fallback init if SSR data not available (e.g. error pages)
export function initFallback(): void {
	if (_initialized) return;
	_initialized = true;
	for (const code of Object.keys(mainLoaders)) {
		register(code, mainLoaders[code]);
		register(code, guidesLoaders[code]);
	}
	init({
		fallbackLocale: 'en',
		initialLocale: 'en'
	});
}

// Helper to change locale and save to localStorage + cookie
export function setLocale(newLocale: string): void {
	if (browser) {
		localStorage.setItem('locale', newLocale);
		// Set cookie so server can detect locale on next SSR request
		document.cookie = `locale=${newLocale};path=/;max-age=31536000;SameSite=Lax`;
	}
	locale.set(newLocale);
}

// Export for components
export { locale, waitLocale };
