import type { LayoutServerLoad } from './$types';

const SUPPORTED_LOCALES = ['en', 'de', 'fr', 'es', 'ko', 'tr', 'zh', 'ru', 'ja'];
const mainLoaders: Record<string, () => Promise<any>> = {
	en: () => import('$lib/i18n/locales/en.json'),
	de: () => import('$lib/i18n/locales/de.json'),
	fr: () => import('$lib/i18n/locales/fr.json'),
	es: () => import('$lib/i18n/locales/es.json'),
	ko: () => import('$lib/i18n/locales/ko.json'),
	tr: () => import('$lib/i18n/locales/tr.json'),
	zh: () => import('$lib/i18n/locales/zh.json'),
	ru: () => import('$lib/i18n/locales/ru.json'),
	ja: () => import('$lib/i18n/locales/ja.json')
};
const guidesLoaders: Record<string, () => Promise<any>> = {
	en: () => import('$lib/i18n/locales/guides-en.json'),
	de: () => import('$lib/i18n/locales/guides-de.json'),
	fr: () => import('$lib/i18n/locales/guides-fr.json'),
	es: () => import('$lib/i18n/locales/guides-es.json'),
	ko: () => import('$lib/i18n/locales/guides-ko.json'),
	tr: () => import('$lib/i18n/locales/guides-tr.json'),
	zh: () => import('$lib/i18n/locales/guides-zh.json'),
	ru: () => import('$lib/i18n/locales/guides-ru.json'),
	ja: () => import('$lib/i18n/locales/guides-ja.json')
};
const BOT_PATTERNS = /googlebot|bingbot|yandex|baiduspider|duckduckbot|slurp|facebookexternalhit|twitterbot|linkedinbot|applebot|gptbot|claude|perplexitybot/i;

export const load: LayoutServerLoad = async ({ request, cookies, setHeaders }) => {
	setHeaders({
		'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=604800',
		Link: '</data/sts2/cards.json>; rel=preload; as=fetch; crossorigin'
	});
	const ua = request.headers.get('user-agent') || '';
	const saved = cookies.get('locale');
	const detectedLocale = BOT_PATTERNS.test(ua) ? 'en' : saved && SUPPORTED_LOCALES.includes(saved) ? saved : 'en';
	const ssrMessages = ((await (mainLoaders[detectedLocale] || mainLoaders.en)()) as any).default;
	const ssrGuidesMessages = ((await (guidesLoaders[detectedLocale] || guidesLoaders.en)()) as any).default;
	const ssrFallbackMessages = detectedLocale !== 'en' ? ((await mainLoaders.en()) as any).default : undefined;
	return { user: null, ssrLocale: detectedLocale, ssrMessages, ssrGuidesMessages, ssrFallbackMessages };
};
