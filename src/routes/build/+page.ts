export async function load({ fetch }: { fetch: typeof globalThis.fetch }) {
	const [relics, potions, enchantments, keywords, relicTranslations, potionTranslations] = await Promise.all([
		fetch('/data/sts2/relics.json').then(r => r.json()),
		fetch('/data/sts2/potions.json').then(r => r.json()),
		fetch('/data/sts2/enchantments.json').then(r => r.json()),
		fetch('/data/sts2/keywords.json').then(r => r.json()),
		fetch('/data/sts2/relics-i18n.json').then(r => r.json()).catch(() => ({})),
		fetch('/data/sts2/potions-i18n.json').then(r => r.json()).catch(() => ({}))
	]);

	return { relics, potions, enchantments, keywords, relicTranslations, potionTranslations };
}
