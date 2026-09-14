import { CHARACTER_GUIDES } from '$lib/sts2/data/guides';
import { error } from '@sveltejs/kit';

// Static — prerender at build for 0ms TTFB.
export const prerender = true;
export const entries = () => Object.keys(CHARACTER_GUIDES).map((slug) => ({ slug }));

export async function load({ params, fetch }: { params: { slug: string }; fetch: typeof globalThis.fetch }) {
	const guide = CHARACTER_GUIDES[params.slug];
	if (!guide) {
		throw error(404, 'Guide not found');
	}

	// Collect all card IDs referenced by this guide to avoid loading the full 502KB cards.json into SSR HTML
	const referencedCardIds = new Set<string>();
	for (const build of guide.builds) {
		for (const id of build.fullDeck) referencedCardIds.add(id);
		for (const kc of build.keyCards) referencedCardIds.add(kc.id);
	}
	for (const tip of guide.ascensionTips) {
		for (const id of tip.cards) referencedCardIds.add(id);
	}
	for (const dp of guide.draftPriority) {
		for (const name of dp.cards.split(',').map((s: string) => s.trim())) {
			referencedCardIds.add(name.toUpperCase().replace(/ /g, '_'));
		}
	}

	// Collect all relic IDs referenced by this guide
	const referencedRelicIds = new Set<string>();
	for (const build of guide.builds) {
		for (const r of build.keyRelics) referencedRelicIds.add(r.id);
	}
	for (const tip of guide.ascensionTips) {
		for (const id of tip.relics) referencedRelicIds.add(id);
	}

	const [characters, allCards, allRelics, allRelicTranslations] = await Promise.all([
		fetch('/data/sts2/characters.json').then(r => r.json()),
		fetch('/data/sts2/cards.json').then(r => r.json()),
		fetch('/data/sts2/relics.json').then(r => r.json()),
		fetch('/data/sts2/relics-i18n.json').then(r => r.json()).catch(() => ({}))
	]);

	// Filter to only cards this guide uses — reduces SSR payload from ~500KB to ~20-50KB
	const cards = allCards.filter((c: { id: string; color: string }) =>
		referencedCardIds.has(c.id) || c.color === params.slug
	);

	// Filter relics and translations to only those referenced — reduces ~500KB (135+365) to ~30KB
	const relics = allRelics.filter((r: { id: string }) => referencedRelicIds.has(r.id));
	const relicTranslations: Record<string, unknown> = {};
	for (const id of referencedRelicIds) {
		if (allRelicTranslations[id]) relicTranslations[id] = allRelicTranslations[id];
	}

	const character = characters.find((c: { id: string }) => c.id.toLowerCase() === params.slug) || null;

	return { guide, character, cards, relics, relicTranslations, slug: params.slug };
}
